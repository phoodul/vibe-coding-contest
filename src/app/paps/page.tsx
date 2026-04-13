"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlassCard } from "@/components/shared/glass-card";

import { PAPS_ITEMS } from "@/lib/ai/paps-prompt";

const GRADE_OPTIONS = [
  { value: "middle1", label: "중1" },
  { value: "middle2", label: "중2" },
  { value: "middle3", label: "중3" },
  { value: "high1", label: "고1" },
  { value: "high2", label: "고2" },
  { value: "high3", label: "고3" },
];

export default function PapsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/paps",
  });

  function update(id: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit() {
    const hasAnyScore = PAPS_ITEMS.some((item) => form[item.id]?.trim());
    if (!hasAnyScore) return;
    setSubmitted(true);
    setMessages([]);
    await append({ role: "user", content: JSON.stringify(form) });
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
          <h1 className="text-3xl font-bold mb-2">&#128170; PAPS AI 코치</h1>
          <p className="text-muted mb-8">
            체력평가 결과를 입력하면 등급 분석 + 맞춤 운동 프로그램을 받을 수 있어요.
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
              {/* 학년 / 성별 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCard delay={0} hover={false}>
                  <label className="text-sm font-medium mb-3 block">학년</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => update("grade", form.grade === opt.value ? "" : opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          form.grade === opt.value
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-white/5 border border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard delay={0.04} hover={false}>
                  <label className="text-sm font-medium mb-3 block">성별</label>
                  <div className="flex gap-2">
                    {[
                      { value: "male", label: "남학생" },
                      { value: "female", label: "여학생" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => update("gender", form.gender === opt.value ? "" : opt.value)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          form.gender === opt.value
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-white/5 border border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* PAPS 종목별 입력 */}
              <GlassCard delay={0.08} hover={false}>
                <label className="text-sm font-medium mb-4 block">
                  PAPS 측정 결과 <span className="text-muted text-xs">(측정한 종목만 입력)</span>
                </label>
                <div className="space-y-3">
                  {PAPS_ITEMS.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-sm text-muted w-48 shrink-0">{item.label}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={form[item.id] || ""}
                        onChange={(e) => update(item.id, e.target.value)}
                        placeholder={item.placeholder}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:border-primary transition-colors"
                      />
                      <span className="text-xs text-muted w-12">{item.unit}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!PAPS_ITEMS.some((item) => form[item.id]?.trim())}
                  className="btn-glow px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-[0.97] disabled:opacity-40 disabled:hover:scale-100"
                >
                  AI 분석 시작
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isLoading && !lastAssistant && (
                <GlassCard hover={false}>
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="text-muted">AI 코치가 체력 데이터를 분석하고 있습니다...</span>
                  </div>
                </GlassCard>
              )}

              {lastAssistant && (
                <GlassCard hover={false}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{lastAssistant.content}</ReactMarkdown>
                  </div>
                </GlassCard>
              )}

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => { setSubmitted(false); setForm({}); setMessages([]); }}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  다시 측정하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
