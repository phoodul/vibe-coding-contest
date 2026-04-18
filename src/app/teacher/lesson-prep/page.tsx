"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { downloadMarkdownAsDoc, splitTestMarkdown } from "@/lib/lesson-prep/download";

type Tab = "slides" | "handout" | "test" | "videos";
type SectionStatus = "idle" | "loading" | "ready" | "error";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "slides", label: "슬라이드", icon: "📊" },
  { key: "handout", label: "배부용 문서", icon: "📝" },
  { key: "test", label: "모의 테스트", icon: "✅" },
  { key: "videos", label: "영상 링크", icon: "🎬" },
];

const ACCEPT = ".txt,.md,.hwp,.hwpx,.doc,.docx,.pdf,.ppt,.pptx";

interface Video {
  id: string;
  title: string;
  channel: string;
  url: string;
  thumbnail: string;
  duration?: string;
  viewCount?: string;
}

interface UnsplashImage {
  query: string;
  url: string;
  alt: string;
  credit: string;
  creditUrl: string;
}

interface SectionState {
  status: SectionStatus;
  content: string;
  error?: string;
}

const INITIAL_SECTION: SectionState = { status: "idle", content: "" };

/** 파일 또는 JSON으로 요청 Body 생성 */
function buildBody(topic: string, grade: string, file: File | null, docContent?: string) {
  if (file) {
    const fd = new FormData();
    fd.append("topic", topic);
    fd.append("grade", grade);
    fd.append("file", file);
    return { body: fd, isFormData: true };
  }
  return {
    body: JSON.stringify({ topic, grade, docContent: docContent || "" }),
    isFormData: false,
  };
}

/** 스트리밍 응답을 파싱해 chunk 단위로 콜백 호출 */
async function streamResponse(res: Response, onChunk: (text: string) => void) {
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (line.startsWith("0:")) {
        try {
          buffer += JSON.parse(line.slice(2));
          onChunk(buffer);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

/** 스트리밍 중에도 브라우저가 404를 뱉지 않도록 토큰은 평문 `{{IMG:...}}`로 유지 */
const IMG_TOKEN_REGEX = /\{\{IMG:([^}]+)\}\}/g;

/** 스트리밍 중 화면에서 토큰을 임시로 숨김 (생성 완료 후 치환) */
function hideTokensForStream(markdown: string): string {
  return markdown.replace(IMG_TOKEN_REGEX, "");
}

/** 이미지 마크다운 생성 */
function imgMarkdown(img: UnsplashImage): string {
  return `![${img.alt}](${img.url})\n*사진: [${img.credit}](${img.creditUrl}) / Unsplash*`;
}

/**
 * 스트리밍 완료 후 이미지 보정.
 * 1) 기존 `{{IMG:...}}` 토큰을 Unsplash URL로 치환
 * 2) 토큰이 없는 슬라이드(표지/마지막 제외)는 제목을 수집 → Haiku 번역 → 이미지 자동 삽입
 */
async function replaceImagePlaceholders(markdown: string, topic: string): Promise<string> {
  const slides = markdown.split(/\n---\n/);
  // 1단계: 기존 영문 토큰 수집
  const tokenQueries = new Set<string>();
  let m;
  IMG_TOKEN_REGEX.lastIndex = 0;
  while ((m = IMG_TOKEN_REGEX.exec(markdown)) !== null) tokenQueries.add(m[1].trim());

  // 2단계: 이미지 토큰이 없는 슬라이드 인덱스 (표지=0, 마지막 제외)
  const missingIdx: number[] = [];
  slides.forEach((slide, idx) => {
    if (idx === 0) return; // 표지 제외
    if (idx === slides.length - 1) return; // 마지막 제외 (정리 슬라이드)
    if (!IMG_TOKEN_REGEX.test(slide)) missingIdx.push(idx);
    IMG_TOKEN_REGEX.lastIndex = 0;
  });

  // 누락 슬라이드의 한글 제목 추출
  const missingTitles = missingIdx.map((i) => {
    const match = slides[i].match(/^#\s*(.+)$/m);
    return match ? match[1].trim() : "";
  });

  // 3단계: 모든 쿼리를 한 번에 요청 (영문 토큰 + 누락 슬라이드 한글 제목)
  const allQueries = [...Array.from(tokenQueries), ...missingTitles.filter(Boolean)];
  if (allQueries.length === 0) {
    return markdown.replace(IMG_TOKEN_REGEX, "");
  }

  try {
    const res = await fetch("/api/teacher/lesson-prep/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queries: allQueries, topic }),
    });
    const { images } = (await res.json()) as { images: UnsplashImage[] };
    if (!images) return markdown.replace(IMG_TOKEN_REGEX, "");

    const byQuery = new Map(images.map((i) => [i.query, i]));

    // 토큰 치환
    const tokenReplaced = slides.map((slide, idx) => {
      const replaced = slide.replace(IMG_TOKEN_REGEX, (_full, q) => {
        const img = byQuery.get((q as string).trim());
        return img?.url ? imgMarkdown(img) : "";
      });

      // 누락 슬라이드에 이미지 삽입 (제목 바로 아래)
      if (missingIdx.includes(idx)) {
        const title = slides[idx].match(/^#\s*(.+)$/m)?.[1].trim();
        if (title) {
          const img = byQuery.get(title);
          if (img?.url) {
            // 첫 번째 `#` 헤딩 다음 줄에 이미지 삽입
            return replaced.replace(/^(#\s*[^\n]+\n)/m, `$1\n${imgMarkdown(img)}\n`);
          }
        }
      }
      return replaced;
    });

    return tokenReplaced.join("\n---\n");
  } catch {
    return markdown.replace(IMG_TOKEN_REGEX, "");
  }
}

export default function LessonPrepPage() {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("slides");
  const [slideIdx, setSlideIdx] = useState(0);

  const [slides, setSlides] = useState<SectionState>(INITIAL_SECTION);
  const [handout, setHandout] = useState<SectionState>(INITIAL_SECTION);
  const [test, setTest] = useState<SectionState>(INITIAL_SECTION);
  const [videos, setVideos] = useState<SectionState & { list?: Video[] }>(INITIAL_SECTION);

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (!topic && !file) return;
    setLoading(true);
    setSlideIdx(0);
    setActiveTab("slides");
    setSlides({ status: "loading", content: "" });
    setHandout({ status: "loading", content: "" });
    setTest({ status: "loading", content: "" });
    setVideos({ status: "loading", content: "" });
    abortRef.current = new AbortController();

    const streamSection = async (
      url: string,
      setter: React.Dispatch<React.SetStateAction<SectionState>>,
      postProcess?: (raw: string) => Promise<string>
    ) => {
      try {
        const { body, isFormData } = buildBody(topic, grade, file);
        const res = await fetch(url, {
          method: "POST",
          headers: isFormData ? undefined : { "Content-Type": "application/json" },
          body,
          signal: abortRef.current!.signal,
        });
        let final = "";
        await streamResponse(res, (text) => {
          final = text;
          setter({ status: "loading", content: text });
        });
        const processed = postProcess ? await postProcess(final) : final;
        setter({ status: "ready", content: processed });
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setter({ status: "error", content: "", error: (e as Error).message });
      }
    };

    const slidesTask = streamSection(
      "/api/teacher/lesson-prep",
      setSlides,
      (raw) => replaceImagePlaceholders(raw, topic)
    );
    const handoutTask = streamSection("/api/teacher/lesson-prep/handout", setHandout);
    const testTask = streamSection("/api/teacher/lesson-prep/test", setTest);

    const videosTask = (async () => {
      try {
        const { body, isFormData } = buildBody(topic, grade, file);
        const res = await fetch("/api/teacher/lesson-prep/videos", {
          method: "POST",
          headers: isFormData ? undefined : { "Content-Type": "application/json" },
          body,
          signal: abortRef.current!.signal,
        });
        const data = await res.json();
        if (data.error) {
          setVideos({ status: "error", content: "", error: data.error });
          return;
        }
        setVideos({ status: "ready", content: "", list: data.videos || [] });
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setVideos({ status: "error", content: "", error: (e as Error).message });
      }
    })();

    // 4개 병렬 실행
    await Promise.allSettled([slidesTask, handoutTask, testTask, videosTask]);
    setLoading(false);
  }, [topic, grade, file]);

  // 스트리밍 중에는 이미지 토큰을 감추고, 완료 후에는 치환된 content 그대로
  const slideContentDisplay =
    slides.status === "ready" ? slides.content : hideTokensForStream(slides.content);
  const slideList = slideContentDisplay.split(/\n---\n/).filter((s) => s.trim());
  const hasResult =
    slides.status !== "idle" ||
    handout.status !== "idle" ||
    test.status !== "idle" ||
    videos.status !== "idle";

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
            ← 대시보드
          </Link>
          <h1 className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            원클릭 수업준비
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 입력 영역 */}
        <GlassCard hover={false} className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">수업 주제</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 프랑스 혁명의 원인과 전개"
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">대상 학년 (선택)</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="예: 고등학교 2학년"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">수업 자료 업로드 (선택)</label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/10 cursor-pointer hover:border-primary/30 transition-colors">
                  <span className="text-lg">📎</span>
                  <span className="text-sm text-muted truncate">
                    {file ? file.name : "txt, hwp, hwpx, doc, docx, pdf, ppt, pptx"}
                  </span>
                  <input
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generate}
              disabled={loading || (!topic && !file)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-indigo-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.span>
                  4개 섹션 동시 생성 중...
                </span>
              ) : (
                "🚀 원클릭 수업준비 시작"
              )}
            </motion.button>
          </div>
        </GlassCard>

        {/* 결과 영역 */}
        <AnimatePresence>
          {hasResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* 탭 (섹션별 상태 인디케이터 포함) */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {TABS.map((tab) => {
                  const state =
                    tab.key === "slides" ? slides :
                    tab.key === "handout" ? handout :
                    tab.key === "test" ? test :
                    videos;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setSlideIdx(0);
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        activeTab === tab.key
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "glass text-muted hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                      {state.status === "loading" && (
                        <span className="ml-1 text-xs opacity-70">⏳</span>
                      )}
                      {state.status === "ready" && (
                        <span className="ml-1 text-xs text-green-400">✓</span>
                      )}
                      {state.status === "error" && (
                        <span className="ml-1 text-xs text-red-400">✕</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <GlassCard hover={false}>
                {activeTab === "slides" && (
                  <SectionView
                    state={slides}
                    emptyLabel="슬라이드"
                    render={() => (
                      <>
                        <div className="min-h-[400px] p-6 mb-4 rounded-xl bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-white/5">
                          <div className="prose prose-invert prose-sm max-w-none prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto prose-img:my-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {slideList[slideIdx] || ""}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                            disabled={slideIdx === 0}
                            className="px-4 py-2 rounded-lg glass text-sm disabled:opacity-30 hover:bg-white/5 transition-colors"
                          >
                            ← 이전
                          </button>
                          <span className="text-sm text-muted">
                            {slideIdx + 1} / {slideList.length}
                          </span>
                          <button
                            onClick={() => setSlideIdx((i) => Math.min(slideList.length - 1, i + 1))}
                            disabled={slideIdx >= slideList.length - 1}
                            className="px-4 py-2 rounded-lg glass text-sm disabled:opacity-30 hover:bg-white/5 transition-colors"
                          >
                            다음 →
                          </button>
                        </div>
                        <PptDownload content={slides.content} />
                      </>
                    )}
                  />
                )}

                {activeTab === "handout" && (
                  <SectionView
                    state={handout}
                    emptyLabel="워크시트"
                    render={() => (
                      <>
                        <div className="prose prose-invert prose-sm max-w-none min-h-[200px]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {handout.content}
                          </ReactMarkdown>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <button
                            onClick={() =>
                              downloadMarkdownAsDoc(
                                `${topic || "수업"}_배부용문서`,
                                `${topic || "수업"} — 배부용 워크시트`,
                                handout.content
                              )
                            }
                            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:from-indigo-400 hover:to-purple-400 transition-all flex items-center justify-center gap-2"
                          >
                            📥 배부용 문서 다운로드 (.doc)
                          </button>
                        </div>
                      </>
                    )}
                  />
                )}

                {activeTab === "test" && (
                  <SectionView
                    state={test}
                    emptyLabel="모의 테스트"
                    render={() => {
                      const { problems, answers } = splitTestMarkdown(test.content);
                      return (
                        <>
                          <div className="prose prose-invert prose-sm max-w-none min-h-[200px]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {test.content}
                            </ReactMarkdown>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={() =>
                                downloadMarkdownAsDoc(
                                  `${topic || "수업"}_문제지`,
                                  `${topic || "수업"} — 모의 테스트 (문제지)`,
                                  problems
                                )
                              }
                              className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:from-indigo-400 hover:to-purple-400 transition-all flex items-center justify-center gap-2"
                            >
                              📝 문제지 다운로드 (.doc)
                            </button>
                            <button
                              onClick={() =>
                                downloadMarkdownAsDoc(
                                  `${topic || "수업"}_정답지`,
                                  `${topic || "수업"} — 모의 테스트 (정답 및 해설)`,
                                  answers
                                )
                              }
                              className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2"
                            >
                              ✅ 정답지 다운로드 (.doc)
                            </button>
                          </div>
                        </>
                      );
                    }}
                  />
                )}

                {activeTab === "videos" && (
                  <VideosView state={videos} />
                )}

                {/* 인쇄 버튼 (슬라이드/배부용/테스트만) */}
                {activeTab !== "videos" &&
                  ((activeTab === "slides" && slides.status === "ready") ||
                   (activeTab === "handout" && handout.status === "ready") ||
                   (activeTab === "test" && test.status === "ready")) && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        const content =
                          activeTab === "slides" ? slides.content :
                          activeTab === "handout" ? handout.content :
                          test.content;
                        const w = window.open("", "_blank");
                        if (w) {
                          w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${TABS.find(t=>t.key===activeTab)?.label}</title><style>body{font-family:Pretendard,sans-serif;padding:40px;max-width:800px;margin:auto;line-height:1.8;color:#222}h1,h2,h3{margin-top:1.5em}img{max-width:100%;border-radius:8px;margin:1em 0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}hr{margin:2em 0;border:none;border-top:2px dashed #ccc;page-break-after:always}@media print{body{padding:20px}}</style></head><body>${content.replace(/\n/g,"<br>")}</body></html>`);
                          w.document.close();
                          w.print();
                        }
                      }}
                      className="px-4 py-2 rounded-lg glass text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      🖨️ 인쇄
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SectionView({
  state,
  emptyLabel,
  render,
}: {
  state: SectionState;
  emptyLabel: string;
  render: () => React.ReactNode;
}) {
  if (state.status === "error") {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-400 mb-1">{emptyLabel} 생성 실패</p>
        {state.error && (
          <p className="text-xs text-red-400/70 break-all">{state.error}</p>
        )}
      </div>
    );
  }
  if (state.status === "loading" && !state.content) {
    return <p className="text-muted text-sm py-8 text-center">{emptyLabel} 생성 중...</p>;
  }
  if (!state.content && state.status !== "loading") {
    return <p className="text-muted text-sm py-8 text-center">{emptyLabel}가 없습니다.</p>;
  }
  return <>{render()}</>;
}

function VideosView({ state }: { state: SectionState & { list?: Video[] } }) {
  if (state.status === "error") {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-400 mb-1">영상 검색 실패</p>
        {state.error && (
          <p className="text-xs text-red-400/70 break-all">{state.error}</p>
        )}
      </div>
    );
  }
  if (state.status === "loading") {
    return <p className="text-muted text-sm py-8 text-center">YouTube 영상 검색 중...</p>;
  }
  const videos = state.list || [];
  if (videos.length === 0) {
    return <p className="text-muted text-sm py-8 text-center">관련 영상을 찾지 못했습니다.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[200px]">
      {videos.map((v) => (
        <a
          key={v.id}
          href={v.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group glass rounded-xl overflow-hidden border border-white/5 hover:border-indigo-400/40 transition-all hover:scale-[1.02]"
        >
          <div className="relative aspect-video bg-black">
            {v.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
            )}
            {v.duration && (
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs">
                {v.duration}
              </span>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-indigo-300 transition-colors">
              {v.title}
            </h3>
            <p className="text-xs text-muted mt-1">{v.channel}</p>
            {v.viewCount && <p className="text-xs text-muted/70 mt-0.5">{v.viewCount}</p>}
          </div>
        </a>
      ))}
    </div>
  );
}

/** 2Slides API로 PPT 다운로드 */
function PptDownload({ content }: { content: string }) {
  const [status, setStatus] = useState<"idle" | "generating" | "polling" | "ready" | "error">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function generate() {
    setStatus("generating");
    setErrorMsg("");
    try {
      const res = await fetch("/api/teacher/lesson-prep/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        setStatus("error");
        return;
      }

      const jobId = data.jobId;
      setStatus("polling");

      // 폴링 (최대 3분)
      for (let i = 0; i < 90; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(`/api/teacher/lesson-prep/slides?jobId=${jobId}`);
        const pollData = await pollRes.json();

        if (pollData.status === "success" && pollData.downloadUrl) {
          setDownloadUrl(pollData.downloadUrl);
          setPageCount(pollData.slidePageCount);
          setStatus("ready");
          return;
        }
        if (pollData.status === "failed") {
          setErrorMsg(pollData.error || "슬라이드 생성 실패");
          setStatus("error");
          return;
        }
      }
      setErrorMsg("시간 초과 (3분) — 잠시 후 다시 시도해주세요");
      setStatus("error");
    } catch (e) {
      setErrorMsg(String(e));
      setStatus("error");
    }
  }

  if (!content) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      {status === "idle" && (
        <button
          onClick={generate}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:from-indigo-400 hover:to-purple-400 transition-all"
        >
          📥 PPT 슬라이드 다운로드 (.pptx)
        </button>
      )}
      {(status === "generating" || status === "polling") && (
        <div className="flex items-center justify-center gap-3 py-3">
          <div className="animate-spin w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full" />
          <span className="text-sm text-muted">
            {status === "generating" ? "슬라이드 생성 요청 중..." : "디자인된 슬라이드 생성 중... (최대 3분)"}
          </span>
        </div>
      )}
      {status === "ready" && downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-3 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-500 transition-all"
        >
          ✅ PPT 다운로드 {pageCount ? `(${pageCount}장)` : ""}
        </a>
      )}
      {status === "error" && (
        <div className="text-center">
          <p className="text-sm text-red-400 mb-1">슬라이드 생성에 실패했습니다.</p>
          {errorMsg && (
            <p className="text-xs text-red-400/70 mb-2 break-all">{errorMsg}</p>
          )}
          <button
            onClick={() => {
              setStatus("idle");
              setErrorMsg("");
            }}
            className="text-xs text-muted hover:text-foreground"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
