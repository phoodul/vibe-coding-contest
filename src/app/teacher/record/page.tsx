"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "ai/react";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";
import { FeatureIntro } from "@/components/shared/feature-intro";
import {
  calcNeisBytes,
  detectForbidden,
  calcSimilarity,
  SUBJECTS,
  RECORD_AREAS,
  buildNameMap,
  depseudonymize,
  type ForbiddenMatch,
  type RecordArea,
  type NameMapping,
} from "@/lib/data/neis-rules";

interface SpellCorrection {
  original: string;
  corrected: string;
  reason: string;
}

export default function RecordPage() {
  const [text, setText] = useState("");
  const [areaId, setAreaId] = useState("subject_specific");
  const [subject, setSubject] = useState("국어");
  const [keywords, setKeywords] = useState("");
  const [savedTexts, setSavedTexts] = useState<{ name: string; text: string }[]>([]);
  const [showSimilarity, setShowSimilarity] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 이미지 업로드
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // 가명처리
  const [studentNames, setStudentNames] = useState("");
  const [pseudoEnabled, setPseudoEnabled] = useState(false);
  const nameMap = useMemo<NameMapping[]>(
    () => (pseudoEnabled ? buildNameMap(studentNames.split(",").map((s) => s.trim())) : []),
    [studentNames, pseudoEnabled]
  );

  // 맞춤법 검사
  const [spellResults, setSpellResults] = useState<SpellCorrection[]>([]);
  const [spellLoading, setSpellLoading] = useState(false);

  // 현재 영역
  const area = useMemo<RecordArea>(
    () => RECORD_AREAS.find((a) => a.id === areaId) || RECORD_AREAS[0],
    [areaId]
  );

  // 실시간 분석
  const bytes = useMemo(() => calcNeisBytes(text), [text]);
  const charCount = useMemo(() => [...text].length, [text]);
  const forbidden = useMemo(() => detectForbidden(text), [text]);
  const bytePct = Math.min((bytes / area.byteLimit) * 100, 100);
  const isOver = bytes > area.byteLimit;

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
    body: { subject: area.hasSubject ? subject : undefined, byteLimit: area.byteLimit, areaId, nameMap, image: imagePreview },
    onFinish: (_prompt, result) => {
      // 가명 → 실명 복원
      const restored = nameMap.length > 0 ? depseudonymize(result, nameMap) : result;
      setText(restored);
    },
  });

  function handleGenerate() {
    if (!keywords.trim()) return;
    complete(keywords);
  }

  // 맞춤법 검사
  async function handleSpellCheck() {
    if (!text.trim()) return;
    setSpellLoading(true);
    try {
      const res = await fetch("/api/teacher/spellcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSpellResults(data.corrections || []);
    } catch {
      setSpellResults([]);
    } finally {
      setSpellLoading(false);
    }
  }

  // 맞춤법 수정 적용
  function applyCorrection(c: SpellCorrection) {
    setText((prev) => prev.replaceAll(c.original, c.corrected));
    setSpellResults((prev) => prev.filter((x) => x.original !== c.original));
  }

  // 학생 세특 저장 (비교용)
  function handleSaveForComparison() {
    const name = prompt("학생 이름을 입력하세요:");
    if (!name || !text.trim()) return;
    setSavedTexts((prev) => [...prev, { name, text }]);
  }

  // 금지어 하이라이트 HTML
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

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
  }, [text]);

  // 가명처리된 미리보기 텍스트 (AI에게 전송되는 내용)
  const pseudoPreview = useMemo(() => {
    if (!pseudoEnabled || nameMap.length === 0 || !keywords) return null;
    let preview = keywords;
    for (const { real, pseudo } of nameMap) {
      if (real) preview = preview.replaceAll(real, `[${pseudo}]`);
    }
    return preview;
  }, [keywords, nameMap, pseudoEnabled]);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <FeatureIntro storageKey="record">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold mb-3">학생부 기재 도우미</h2>
        <div className="flex flex-wrap justify-center gap-2 my-4">
          {["과학", "탐구", "실험"].map((tag, i) => (
            <motion.span key={tag} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.4 }}>{tag}</motion.span>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }} className="text-sm text-emerald-400">✅ AI 세특 초안 자동 생성</motion.div>
        <p className="text-xs text-muted mt-4">10개 영역 관리 + 가명처리 + AI 초안</p>
      </FeatureIntro>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">&#128221; 학생부 기재 도우미</h1>
          <p className="text-muted mb-6">
            2026 기재요령 기반 — 영역별 글자수 관리, 금지어 감지, 가명처리, AI 맞춤법 검사
          </p>
        </motion.div>

        {/* ── 영역 선택 탭 ── */}
        <div className="flex gap-2 flex-wrap mb-6">
          {RECORD_AREAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAreaId(a.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                areaId === a.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "glass hover:bg-white/10"
              }`}
            >
              {a.label}
              <span className="ml-1 opacity-60">{a.charLimit}자</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── 좌측: 에디터 (2/3) ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* 가명처리 */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  &#128274; 개인정보 보호 (가명처리)
                </h3>
                <button
                  onClick={() => setPseudoEnabled(!pseudoEnabled)}
                  className={`text-xs px-3 py-1 rounded-lg transition-all ${
                    pseudoEnabled
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "glass hover:bg-white/10"
                  }`}
                >
                  {pseudoEnabled ? "ON" : "OFF"}
                </button>
              </div>
              <AnimatePresence>
                {pseudoEnabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      value={studentNames}
                      onChange={(e) => setStudentNames(e.target.value)}
                      placeholder="학생 이름을 쉼표로 구분 (예: 김철수, 이영희, 박민준)"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-green-500/50 transition-colors mt-2"
                    />
                    {nameMap.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {nameMap.map((m) => (
                          <span
                            key={m.real}
                            className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20"
                          >
                            {m.real} → {m.pseudo}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-muted mt-2">
                      AI에게 전송 시 실명이 가명으로 치환되고, 응답에서 다시 실명으로 복원됩니다. LLM에 개인정보가 노출되지 않습니다.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* AI 초안 생성 */}
            <GlassCard hover={false}>
              <h3 className="text-sm font-medium mb-3">AI 초안 생성 — {area.label}</h3>
              <p className="text-[11px] text-muted mb-3">{area.description}</p>
              {area.hasSubject && (
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
              )}
              <div className="space-y-2">
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  rows={3}
                  placeholder={"관찰 기록을 입력하세요.\n예: 토론에서 비례원칙을 판례와 연결하여 분석함.\n발표 시 경청 자세가 우수하고 논리적 반박을 제기함."}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                />
                <div className="flex gap-2 items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs glass px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1"
                  >
                    📷 스크린샷 첨부
                  </button>
                  {imagePreview && (
                    <div className="flex items-center gap-2">
                      <img src={imagePreview} alt="첨부 이미지" className="h-8 w-8 rounded object-cover border border-white/20" />
                      <button
                        onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="text-[10px] text-red-400 hover:text-red-300"
                      >
                        ✕ 제거
                      </button>
                    </div>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !keywords.trim()}
                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40 shrink-0"
                  >
                    {isLoading ? "생성 중..." : "⚡ 생성"}
                  </button>
                </div>
              </div>
              {pseudoPreview && (
                <p className="text-[10px] text-green-400/70 mt-2">
                  AI에게 전송: {pseudoPreview}
                </p>
              )}
            </GlassCard>

            {/* 바이트 바 */}
            <div className="glass-gradient p-3 flex items-center gap-3">
              <span className="text-xs text-muted shrink-0">NEIS</span>
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
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-sm font-mono font-medium ${
                    isOver ? "text-red-400" : bytePct > 90 ? "text-amber-400" : "text-foreground"
                  }`}
                >
                  {bytes} / {area.byteLimit}B
                </span>
                <span className="text-[10px] text-muted">
                  (한글 {area.charLimit}자)
                </span>
              </div>
            </div>

            {/* 에디터 + 하이라이트 오버레이 */}
            <GlassCard hover={false} className="h-[400px] flex flex-col relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{area.label} 작성</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleSpellCheck}
                    disabled={spellLoading || !text.trim()}
                    className="text-xs glass px-2.5 py-1 rounded hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    {spellLoading ? "검사 중..." : "✏️ 맞춤법"}
                  </button>
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

              <div className="flex-1 relative">
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
                  placeholder={`${area.label} 내용을 작성하세요.`}
                />
              </div>
            </GlassCard>
          </div>

          {/* ── 우측: 분석 패널 (1/3) ── */}
          <div className="space-y-4">
            {/* 글자수/바이트 분석 */}
            <GlassCard hover={false}>
              <h4 className="text-sm font-medium mb-3">&#128202; 글자수 · 바이트 분석</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">총 글자 수</span>
                  <span>{charCount}자</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">한글</span>
                  <span>{(text.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g) || []).length}자 (×3B)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">영문/숫자</span>
                  <span>{(text.match(/[a-zA-Z0-9]/g) || []).length}자 (×1B)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">줄바꿈</span>
                  <span>{(text.match(/\n/g) || []).length}개 (×1B)</span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex justify-between font-medium">
                  <span className={isOver ? "text-red-400" : ""}>총 바이트</span>
                  <span className={isOver ? "text-red-400" : ""}>
                    {bytes} / {area.byteLimit}B
                    {isOver && ` (${bytes - area.byteLimit}B 초과)`}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>한글 기준 최대</span>
                  <span>{area.charLimit}자</span>
                </div>
                {isOver && (
                  <p className="text-red-400 mt-1">
                    NEIS 입력 시 잘릴 수 있습니다. {bytes - area.byteLimit}바이트를 줄여주세요.
                  </p>
                )}
              </div>
            </GlassCard>

            {/* 맞춤법 검사 결과 */}
            <AnimatePresence>
              {spellResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <GlassCard hover={false}>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      ✏️ 맞춤법 수정 제안
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                        {spellResults.length}건
                      </span>
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {spellResults.map((c, i) => (
                        <div
                          key={`${c.original}-${i}`}
                          className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span>
                              <span className="text-red-400 line-through">{c.original}</span>
                              {" → "}
                              <span className="text-green-400 font-medium">{c.corrected}</span>
                            </span>
                            <button
                              onClick={() => applyCorrection(c)}
                              className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                            >
                              적용
                            </button>
                          </div>
                          <p className="text-muted">{c.reason}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

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
                            &quot;{f.word}&quot;
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
                  학생별 기재 내용을 &quot;비교용 저장&quot;하면 중복 표현을 감지합니다.
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
                          {s.score > 0.5 && " ⚠️ 높음"}
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
