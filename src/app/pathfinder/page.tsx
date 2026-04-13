"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";
import { EditableResult } from "@/components/shared/editable-result";

import {
  DREAM_TAGS,
  GRADE_OPTIONS,
  REGION_OPTIONS,
} from "@/lib/data/pathfinder-schools";

export default function PathfinderPage() {
  const [dream, setDream] = useState("");
  const [grade, setGrade] = useState("");
  const [region, setRegion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/pathfinder",
  });

  async function handleSubmit() {
    if (!dream.trim()) return;
    setSubmitted(true);
    setMessages([]);
    await append({
      role: "user",
      content: JSON.stringify({ dream: dream.trim(), grade, region }),
    });
  }

  function handleReset() {
    setSubmitted(false);
    setDream("");
    setGrade("");
    setRegion("");
    setMessages([]);
  }

  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold mb-2">
            &#127775; 내 길 내비
          </h1>
          <p className="text-muted mb-8">
            꿈이 있으면 길이 있다 — 어떤 꿈이든, AI가 구체적인 로드맵과 학교·기관을 안내합니다.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* 꿈 입력 */}
              <GlassCard delay={0} hover={false}>
                <label className="text-sm font-medium mb-3 block">
                  어떤 꿈이 있나요?
                </label>
                <input
                  type="text"
                  value={dream}
                  onChange={(e) => setDream(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="요리사가 되고 싶어요, 머리 만지는 게 재밌어요, 게임 만들고 싶어요..."
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-foreground text-lg placeholder:text-muted/40 focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />

                {/* 영감 태그 */}
                <div className="mt-4">
                  <p className="text-xs text-muted mb-2">이런 분야도 있어요:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DREAM_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setDream(tag.split("·")[0])}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                          dream === tag.split("·")[0]
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-white/5 border border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* 추가 정보 (선택) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCard delay={0.04} hover={false}>
                  <label className="text-sm font-medium mb-3 block">
                    현재 학년 <span className="text-muted text-xs">(선택)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GRADE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setGrade(grade === opt.value ? "" : opt.value)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          grade === opt.value
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-white/5 border border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard delay={0.08} hover={false}>
                  <label className="text-sm font-medium mb-3 block">
                    지역 <span className="text-muted text-xs">(선택)</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-white/10 text-foreground text-sm focus:outline-none focus:border-primary transition-colors [&>option]:bg-[#1a1a2e] [&>option]:text-foreground"
                  >
                    <option value="">전국</option>
                    {REGION_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </GlassCard>
              </div>

              {/* 제출 */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!dream.trim()}
                  className="btn-glow px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-[0.97] disabled:opacity-40 disabled:hover:scale-100"
                >
                  내 길 찾기
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* 검색 요약 */}
              <GlassCard hover={false} delay={0}>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">&#127775;</span>
                  <div>
                    <span className="font-semibold">&ldquo;{dream}&rdquo;</span>
                    {grade && (
                      <span className="text-muted ml-2">
                        · {GRADE_OPTIONS.find((g) => g.value === grade)?.label}
                      </span>
                    )}
                    {region && (
                      <span className="text-muted ml-2">· {region}</span>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* AI 로딩 */}
              {isLoading && !lastAssistant && (
                <GlassCard hover={false} delay={0}>
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="text-muted">
                      AI가 맞춤 로드맵을 만들고 있습니다...
                    </span>
                  </div>
                </GlassCard>
              )}

              {/* AI 결과 */}
              {lastAssistant && (
                <GlassCard hover={false} delay={0} className="mt-4">
                  <EditableResult content={lastAssistant.content} filename="진로탐색" />
                </GlassCard>
              )}

              {/* 다시 하기 */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  다른 꿈 탐색하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
