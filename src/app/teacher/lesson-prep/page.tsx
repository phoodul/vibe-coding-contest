"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Tab = "slides" | "handout" | "test" | "videos";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "slides", label: "슬라이드", icon: "📊" },
  { key: "handout", label: "배부용 문서", icon: "📝" },
  { key: "test", label: "모의 테스트", icon: "✅" },
  { key: "videos", label: "영상 링크", icon: "🎬" },
];

const ACCEPT = ".txt,.md,.hwp,.hwpx,.doc,.docx,.pdf,.ppt,.pptx";

function parseSections(raw: string) {
  const get = (start: string, end: string) => {
    const s = raw.indexOf(start);
    const e = raw.indexOf(end);
    if (s === -1) return "";
    return raw.slice(s + start.length, e === -1 ? undefined : e).trim();
  };
  return {
    slides: get("===SLIDES_START===", "===SLIDES_END==="),
    handout: get("===HANDOUT_START===", "===HANDOUT_END==="),
    test: get("===TEST_START===", "===TEST_END==="),
    videos: get("===VIDEOS_START===", "===VIDEOS_END==="),
  };
}

export default function LessonPrepPage() {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("slides");
  const [slideIdx, setSlideIdx] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (!topic && !file) return;
    setLoading(true);
    setRaw("");
    setSlideIdx(0);
    setActiveTab("slides");
    abortRef.current = new AbortController();

    try {
      let res: Response;
      if (file) {
        const fd = new FormData();
        fd.append("topic", topic);
        fd.append("grade", grade);
        fd.append("file", file);
        res = await fetch("/api/teacher/lesson-prep", {
          method: "POST",
          body: fd,
          signal: abortRef.current.signal,
        });
      } else {
        res = await fetch("/api/teacher/lesson-prep", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, grade }),
          signal: abortRef.current.signal,
        });
      }

      if (!res.ok || !res.body) throw new Error("API 오류");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Vercel AI SDK data stream: parse "0:" text chunks
        for (const line of chunk.split("\n")) {
          if (line.startsWith("0:")) {
            try {
              buffer += JSON.parse(line.slice(2));
              setRaw(buffer);
            } catch { /* ignore non-JSON lines */ }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }, [topic, grade, file]);

  const sections = parseSections(raw);
  const slides = sections.slides.split(/\n---\n/).filter(Boolean);
  const hasResult = raw.includes("===SLIDES_START===");

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
                  생성 중...
                </span>
              ) : (
                "🚀 원클릭 수업준비 시작"
              )}
            </motion.button>
          </div>
        </GlassCard>

        {/* 결과 영역 */}
        <AnimatePresence>
          {(loading || hasResult) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* 탭 */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSlideIdx(0); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.key
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "glass text-muted hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 탭 컨텐츠 */}
              <GlassCard hover={false}>
                {activeTab === "slides" && (
                  <div>
                    {slides.length > 0 ? (
                      <>
                        {/* 슬라이드 뷰어 */}
                        <div className="min-h-[320px] p-6 mb-4 rounded-xl bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-white/5">
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {slides[slideIdx] || ""}
                            </ReactMarkdown>
                          </div>
                        </div>
                        {/* 슬라이드 네비게이션 */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                            disabled={slideIdx === 0}
                            className="px-4 py-2 rounded-lg glass text-sm disabled:opacity-30 hover:bg-white/5 transition-colors"
                          >
                            ← 이전
                          </button>
                          <span className="text-sm text-muted">
                            {slideIdx + 1} / {slides.length}
                          </span>
                          <button
                            onClick={() => setSlideIdx((i) => Math.min(slides.length - 1, i + 1))}
                            disabled={slideIdx >= slides.length - 1}
                            className="px-4 py-2 rounded-lg glass text-sm disabled:opacity-30 hover:bg-white/5 transition-colors"
                          >
                            다음 →
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted text-sm py-8 text-center">
                        {loading ? "슬라이드 생성 중..." : "슬라이드가 없습니다."}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "handout" && (
                  <div className="prose prose-invert prose-sm max-w-none min-h-[200px]">
                    {sections.handout ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {sections.handout}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted text-center py-8">
                        {loading ? "워크시트 생성 중..." : "워크시트가 없습니다."}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "test" && (
                  <div className="prose prose-invert prose-sm max-w-none min-h-[200px]">
                    {sections.test ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {sections.test}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted text-center py-8">
                        {loading ? "모의 테스트 생성 중..." : "테스트가 없습니다."}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "videos" && (
                  <div className="prose prose-invert prose-sm max-w-none min-h-[200px]">
                    {sections.videos ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {sections.videos}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted text-center py-8">
                        {loading ? "영상 검색 중..." : "영상이 없습니다."}
                      </p>
                    )}
                  </div>
                )}

                {/* 인쇄 버튼 */}
                {hasResult && !loading && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        const content = activeTab === "slides"
                          ? sections.slides
                          : activeTab === "handout"
                          ? sections.handout
                          : activeTab === "test"
                          ? sections.test
                          : sections.videos;
                        const w = window.open("", "_blank");
                        if (w) {
                          w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${TABS.find(t=>t.key===activeTab)?.label}</title><style>body{font-family:Pretendard,sans-serif;padding:40px;max-width:800px;margin:auto;line-height:1.8;color:#222}h1,h2,h3{margin-top:1.5em}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}hr{margin:2em 0;border:none;border-top:2px dashed #ccc;page-break-after:always}@media print{body{padding:20px}}</style></head><body>${content.replace(/\n/g,"<br>")}</body></html>`);
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
