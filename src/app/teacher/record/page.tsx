"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "ai/react";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";
import {
  calcNeisBytes,
  detectForbidden,
  calcSimilarity,
  SUBJECTS,
  type ForbiddenMatch,
} from "@/lib/data/neis-rules";

const BYTE_LIMIT = 500;

export default function RecordPage() {
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("국어");
  const [keywords, setKeywords] = useState("");
  const [savedTexts, setSavedTexts] = useState<{ name: string; text: string }[]>([]);
  const [showSimilarity, setShowSimilarity] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 실시간 분석
  const bytes = useMemo(() => calcNeisBytes(text), [text]);
  const forbidden = useMemo(() => detectForbidden(text), [text]);
  const bytePct = Math.min((bytes / BYTE_LIMIT) * 100, 100);
  const isOver = bytes > BYTE_LIMIT;

  // 유사도 분석
  const similarities = useMemo(() => {
    if (!showSimilarity || !text.trim() || savedTexts.length === 0) return [];
    return savedTexts
      .map((s) => ({ name: s.name, score: calcSimilarity(text, s.text) }))
      .sort((a, b) => b.score - a.score);
  }, [text, savedTexts, showSimilarity]);

  // AI 초안 생성
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/teacher/record",
    body: { subject, byteLimit: BYTE_LIMIT },
    onFinish: (_prompt, result) => {
      setText(result);
    },
  });

  function handleGenerate() {
    if (!keywords.trim()) return;
    complete(keywords);
  }

  // 학생 세특 저장 (비교용)
  function handleSaveForComparison() {
    const name = prompt("학생 이름을 입력하세요:");
    if (!name || !text.trim()) return;
    setSavedTexts((prev) => [...prev, { name, text }]);
  }

  // 금지어 하이라이트가 적용된 HTML
  const highlightedHtml = useMemo(() => {
    if (!text || forbidden.length === 0) return "";
    let html = "";
    let lastIdx = 0;
    const sorted = [...forbidden].sort((a, b) => a.startIdx - b.startIdx);
    for (const m of sorted) {
      if (m.startIdx < lastIdx) continue;
      html += escapeHtml(text.slice(lastIdx, m.startIdx));
      html += `<mark class="forbidden-word" title="${m.reason}">${escapeHtml(m.word)}</mark>`;
      lastIdx = m.endIdx;
    }
    html += escapeHtml(text.slice(lastIdx));
    return html.replace(/\n/g, "<br>");
  }, [text, forbidden]);

  // 복사
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
  }, [text]);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <style jsx global>{`
        .forbidden-word {
          background: rgba(239, 68, 68, 0.25);
          color: rgb(252, 165, 165);
          padding: 0 2px;
          border-radius: 2px;
          border-bottom: 2px solid rgb(239, 68, 68);
          cursor: help;
        }
        .byte-bar {
          transition: width 0.3s ease, background-color 0.3s ease;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-3xl font-bold mb-2">&#128221; 생기부 세특 도우미</h1>
          <p className="text-muted mb-8">
            NEIS 바이트 실시간 계산, 금지어 자동 감지, 학생별 유사도 분석 — 생성형 AI가 못하는 것을 해결합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── 좌측: 에디터 (2/3) ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI 초안 생성 */}
            <GlassCard hover={false}>
              <h3 className="text-sm font-medium mb-3">AI 초안 생성</h3>
              <div className="flex gap-2 flex-wrap mb-3">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                      subject === s
                        ? "bg-primary text-primary-foreground"
                        : "glass hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="학생 키워드: 토론 적극적, 비례원칙 판례 분석, 논리적 사고력"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !keywords.trim()}
                  className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40 shrink-0"
                >
                  {isLoading ? "생성 중..." : "&#9889; 생성"}
                </button>
              </div>
            </GlassCard>

            {/* 바이트 바 */}
            <div className="glass-gradient p-3 flex items-center gap-3">
              <span className="text-xs text-muted shrink-0">NEIS 바이트</span>
              <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`byte-bar h-full rounded-full ${
                    isOver
                      ? "bg-red-500"
                      : bytePct > 90
                        ? "bg-amber-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(bytePct, 100)}%` }}
                />
              </div>
              <span
                className={`text-sm font-mono font-medium shrink-0 ${
                  isOver ? "text-red-400" : bytePct > 90 ? "text-amber-400" : "text-foreground"
                }`}
              >
                {bytes} / {BYTE_LIMIT}
              </span>
            </div>

            {/* 에디터 + 하이라이트 오버레이 */}
            <GlassCard hover={false} className="h-[400px] flex flex-col relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">세특 작성</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!text}
                    className="text-xs glass px-2 py-1 rounded hover:bg-white/10 disabled:opacity-30"
                  >
                    복사
                  </button>
                  <button
                    onClick={handleSaveForComparison}
                    disabled={!text}
                    className="text-xs glass px-2 py-1 rounded hover:bg-white/10 disabled:opacity-30"
                  >
                    비교용 저장
                  </button>
                </div>
              </div>

              {/* 텍스트 입력 */}
              <div className="flex-1 relative">
                {/* 금지어 하이라이트 오버레이 (읽기 전용) */}
                {forbidden.length > 0 && (
                  <div
                    className="absolute inset-0 px-4 py-3 font-mono text-sm leading-relaxed pointer-events-none overflow-y-auto text-transparent"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />
                )}
                <textarea
                  ref={textareaRef}
                  value={isLoading ? completion : text}
                  onChange={(e) => setText(e.target.value)}
                  readOnly={isLoading}
                  className={`w-full h-full px-4 py-3 rounded-lg border border-white/10 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors ${
                    forbidden.length > 0 ? "bg-transparent" : "bg-white/5"
                  }`}
                  placeholder="세특 내용을 작성하세요. 금지어가 포함되면 자동으로 감지됩니다."
                />
              </div>
            </GlassCard>
          </div>

          {/* ── 우측: 분석 패널 (1/3) ── */}
          <div className="space-y-4">
            {/* 금지어 감지 */}
            <GlassCard hover={false}>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                &#128680; 금지어 감지
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    forbidden.length > 0
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {forbidden.length > 0 ? `${forbidden.length}개 발견` : "문제 없음"}
                </span>
              </h4>
              <AnimatePresence>
                {forbidden.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {forbidden.map((f, i) => (
                      <motion.div
                        key={`${f.startIdx}-${i}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs"
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono font-medium text-red-400">
                            &#34;{f.word}&#34;
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                            {f.category}
                          </span>
                        </div>
                        <p className="text-muted">{f.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted">
                    교외수상, 부모직업, 사교육, 공인시험, 등수, 선행학습 등을 자동 감지합니다.
                  </p>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* 바이트 분석 */}
            <GlassCard hover={false}>
              <h4 className="text-sm font-medium mb-3">&#128202; 바이트 분석</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">한글 글자 수</span>
                  <span>{(text.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g) || []).length}자</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">영문/숫자</span>
                  <span>{(text.match(/[a-zA-Z0-9]/g) || []).length}자</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">줄바꿈</span>
                  <span>{(text.match(/\n/g) || []).length}개 ({(text.match(/\n/g) || []).length * 2}바이트)</span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex justify-between font-medium">
                  <span className={isOver ? "text-red-400" : ""}>총 바이트</span>
                  <span className={isOver ? "text-red-400" : ""}>
                    {bytes} / {BYTE_LIMIT}
                    {isOver && ` (${bytes - BYTE_LIMIT} 초과)`}
                  </span>
                </div>
                {isOver && (
                  <p className="text-red-400 mt-1">
                    NEIS에 입력 시 잘릴 수 있습니다. {bytes - BYTE_LIMIT}바이트를 줄여주세요.
                  </p>
                )}
              </div>
            </GlassCard>

            {/* 유사도 분석 */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">&#128200; 유사도 분석</h4>
                <button
                  onClick={() => setShowSimilarity(!showSimilarity)}
                  className={`text-xs px-2 py-0.5 rounded transition-all ${
                    showSimilarity
                      ? "bg-primary/20 text-primary"
                      : "glass hover:bg-white/10"
                  }`}
                >
                  {showSimilarity ? "ON" : "OFF"}
                </button>
              </div>
              {savedTexts.length === 0 ? (
                <p className="text-xs text-muted">
                  학생별 세특을 &#34;비교용 저장&#34;하면 중복 표현을 감지합니다.
                  감사/점검 시 &#34;복붙 세특&#34; 적발을 방지합니다.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted mb-2">
                    저장된 학생: {savedTexts.length}명
                  </p>
                  {showSimilarity &&
                    similarities.map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>{s.name}</span>
                        <span
                          className={`font-mono ${
                            s.score > 0.5
                              ? "text-red-400 font-medium"
                              : s.score > 0.3
                                ? "text-amber-400"
                                : "text-green-400"
                          }`}
                        >
                          {(s.score * 100).toFixed(0)}%
                          {s.score > 0.5 && " &#9888;&#65039; 높음"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
