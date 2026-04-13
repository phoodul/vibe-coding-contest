"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "ai/react";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";

import {
  DOC_TYPES,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  type DocTemplate,
} from "@/lib/data/document-templates";

type View = "home" | "editor";

const STORAGE_KEY = "eduflow_saved_templates";

interface SavedTemplate {
  id: string;
  type: string;
  title: string;
  body: string;
  savedAt: string;
}

function loadSavedTemplates(): SavedTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSavedTemplates(list: SavedTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function DraftPage() {
  const [view, setView] = useState<View>("home");
  const [docType, setDocType] = useState("안내문");
  const [topic, setTopic] = useState("");
  const [draft, setDraft] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // localStorage에서 저장된 템플릿 로드
  useEffect(() => {
    setSavedTemplates(loadSavedTemplates());
  }, []);

  const currentDocType = DOC_TYPES.find((d) => d.value === docType);

  // AI 스트리밍 초안 생성
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/teacher/generate",
    body: { docType },
    onFinish: (_prompt, result) => {
      setDraft(result);
    },
  });

  // 주제 입력 → AI 초안 생성
  function handleGenerate() {
    if (!topic.trim()) return;
    setDraft("");
    setView("editor");
    complete(topic);
  }

  // 템플릿 선택 → 바로 에디터로
  function handleSelectTemplate(t: DocTemplate | SavedTemplate) {
    setSelectedTemplate({ ...t, id: t.id, desc: "" });
    setDraft(t.body);
    setTopic(t.title);
    setDocType(t.type);
    setView("editor");
  }

  // 내 양식 저장
  function handleSaveDraft() {
    if (!draft.trim()) return;
    const title = prompt("양식 이름을 입력하세요:", topic) || topic;
    const newItem: SavedTemplate = {
      id: `saved_${Date.now()}`,
      type: docType,
      title,
      body: draft,
      savedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...savedTemplates];
    setSavedTemplates(updated);
    saveSavedTemplates(updated);
  }

  // 내 양식 삭제
  function handleDeleteSaved(id: string) {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    saveSavedTemplates(updated);
  }

  // 포맷터로 보내기
  function handleSendToFormatter() {
    localStorage.setItem("formatter_text", draft);
    window.location.href = "/teacher/formatter";
  }

  // 다운로드
  function handleDownload() {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `공문서_초안_${topic.slice(0, 20)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 필터링된 템플릿
  const filteredTemplates =
    templateFilter === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.type === templateFilter);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          &larr; 대시보드
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">&#9997;&#65039; 공문서 초안 작성기</h1>
          <p className="text-muted mb-8">
            주제를 입력하면 K-에듀파인 양식에 맞는 초안을 AI가 생성하고, 포맷터로 자동 교정할 수 있습니다.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── HOME: 주제 입력 + 템플릿 선택 ── */}
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 주제 입력 */}
              <GlassCard hover={false} className="mb-6">
                <h3 className="text-sm font-medium mb-3">주제로 새 공문서 작성</h3>

                {/* 문서 유형 선택 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {DOC_TYPES.map((dt) => (
                    <button
                      key={dt.value}
                      onClick={() => setDocType(dt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        docType === dt.value
                          ? "bg-primary text-primary-foreground"
                          : "glass hover:bg-white/10"
                      }`}
                    >
                      {dt.icon} {dt.label}
                    </button>
                  ))}
                </div>

                {/* 유형별 예시 힌트 */}
                {currentDocType?.examples && (
                  <p className="text-xs text-muted mb-2">
                    {currentDocType.icon} 자주 쓰는 {currentDocType.label}: {currentDocType.examples.join(" / ")}
                  </p>
                )}

                <div className="flex gap-3">
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder={currentDocType?.placeholder || "공문서 주제를 입력하세요"}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!topic.trim()}
                    className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40 shrink-0"
                  >
                    &#9889; 초안 생성
                  </button>
                </div>
              </GlassCard>

              {/* 내 양식 / 기본 템플릿 탭 */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setShowSaved(false)}
                  className={`text-sm font-medium transition-colors ${
                    !showSaved ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  기본 템플릿
                </button>
                <button
                  onClick={() => setShowSaved(true)}
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    showSaved ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  내 양식
                  {savedTemplates.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                      {savedTemplates.length}
                    </span>
                  )}
                </button>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* 내 양식 목록 */}
              {showSaved && (
                <div className="mb-6">
                  {savedTemplates.length === 0 ? (
                    <GlassCard hover={false}>
                      <p className="text-sm text-muted text-center py-4">
                        저장된 양식이 없습니다. 초안 편집 후 &#34;내 양식으로 저장&#34;을 눌러보세요.
                      </p>
                    </GlassCard>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {savedTemplates.map((t) => (
                        <div
                          key={t.id}
                          className="relative glass-gradient p-4 group"
                        >
                          <button
                            onClick={() => handleSelectTemplate(t)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                                {t.type}
                              </span>
                              <span className="text-[10px] text-muted">
                                {new Date(t.savedAt).toLocaleDateString("ko-KR")}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                              {t.title}
                            </h4>
                          </button>
                          <button
                            onClick={() => handleDeleteSaved(t.id)}
                            className="absolute top-2 right-2 text-xs text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="삭제"
                          >
                            &#10005;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 기본 템플릿 (카테고리 필터 + 그리드) */}
              {!showSaved && (
                <>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setTemplateFilter(cat.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                          templateFilter === cat.value
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "glass text-muted hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredTemplates.map((t, i) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <button
                          onClick={() => handleSelectTemplate(t)}
                          className="w-full text-left glass-gradient p-4 hover:bg-white/[0.06] transition-all group"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              {t.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium group-hover:text-primary transition-colors mb-1">
                            {t.title}
                          </h4>
                          <p className="text-xs text-muted">{t.desc}</p>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── EDITOR: 초안 편집 ── */}
          {view === "editor" && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 상단 바 */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setView("home")}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  &larr; 돌아가기
                </button>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {docType}
                </span>
                <span className="text-sm font-medium truncate">{topic}</span>
                <div className="flex-1" />
                {selectedTemplate && (
                  <span className="text-[10px] text-muted">
                    템플릿: {selectedTemplate.title}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 에디터 (2/3) */}
                <GlassCard hover={false} className="lg:col-span-2 h-[600px] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      {isLoading ? "AI가 초안을 작성하고 있습니다..." : "공문서 초안"}
                    </span>
                    <span className="text-xs text-muted">
                      {draft.length}자
                    </span>
                  </div>

                  {isLoading && !draft ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm text-muted">K-에듀파인 양식으로 생성 중...</p>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      ref={editorRef}
                      value={isLoading ? completion : draft}
                      onChange={(e) => setDraft(e.target.value)}
                      readOnly={isLoading}
                      className="flex-1 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors"
                    />
                  )}
                </GlassCard>

                {/* 사이드바 (1/3) */}
                <div className="space-y-4">
                  {/* 액션 */}
                  <GlassCard hover={false}>
                    <h4 className="text-sm font-medium mb-3">문서 액션</h4>
                    <div className="space-y-2">
                      <button
                        onClick={handleSendToFormatter}
                        disabled={isLoading || !draft}
                        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40"
                      >
                        &#128196; 포맷터로 교정하기
                      </button>
                      <button
                        onClick={handleSaveDraft}
                        disabled={isLoading || !draft}
                        className="w-full py-2.5 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-all disabled:opacity-40"
                      >
                        &#128190; 내 양식으로 저장
                      </button>
                      <button
                        onClick={handleDownload}
                        disabled={isLoading || !draft}
                        className="w-full py-2.5 rounded-lg glass text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-40"
                      >
                        &#128229; 텍스트 다운로드
                      </button>
                      <button
                        onClick={() => {
                          setDraft("");
                          complete(topic);
                        }}
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-lg glass text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-40"
                      >
                        &#128260; 다시 생성하기
                      </button>
                    </div>
                  </GlassCard>

                  {/* 도움말 */}
                  <GlassCard hover={false}>
                    <h4 className="text-sm font-medium mb-2">작성 팁</h4>
                    <ul className="text-xs text-muted space-y-1.5 leading-relaxed">
                      <li>&#8226; 괄호 안의 (장소명), (대상) 등을 실제 내용으로 수정하세요</li>
                      <li>&#8226; 날짜/시간은 K-에듀파인 규격으로 생성됩니다</li>
                      <li>&#8226; &#34;포맷터로 교정하기&#34;를 누르면 양식 자동 검사를 수행합니다</li>
                      <li>&#8226; 금액은 &#34;금OO원(금OO원)&#34; 형식으로 기재하세요</li>
                      <li>&#8226; &#34;내 양식으로 저장&#34;하면 다음에 바로 재사용할 수 있습니다</li>
                    </ul>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
