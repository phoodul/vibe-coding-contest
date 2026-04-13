"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { ASSESSMENT_FIELDS } from "@/lib/ai/career-prompt";
import { GlassCard } from "@/components/shared/glass-card";
import { EditableResult } from "@/components/shared/editable-result";

import Link from "next/link";

export default function CareerPage() {
  const [assessment, setAssessment] = useState<
    Record<string, string | string[]>
  >({});
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/career",
  });

  function updateField(id: string, value: string | string[]) {
    setAssessment((prev) => ({ ...prev, [id]: value }));
  }

  function selectChip(id: string, value: string) {
    updateField(id, assessment[id] === value ? "" : value);
  }

  function toggleMulti(id: string, value: string, max = 3) {
    const current = (assessment[id] as string[]) || [];
    if (current.includes(value)) {
      updateField(
        id,
        current.filter((v) => v !== value)
      );
    } else if (current.length < max) {
      updateField(id, [...current, value]);
    }
  }

  async function handleSubmit() {
    setSubmitted(true);
    setMessages([]);
    await append({
      role: "user",
      content: JSON.stringify(assessment),
    });
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
            &#129517; 진로 시뮬레이터
          </h1>
          <p className="text-muted mb-8">
            나의 성향을 입력하면 5,000+ 직업에서 최적의 진로를 찾아드립니다.
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
              {ASSESSMENT_FIELDS.map((field, i) => (
                <GlassCard key={field.id} delay={i * 0.04} hover={false}>
                  <label className="text-sm font-medium mb-3 block">
                    {field.label}
                  </label>

                  {/* Chips — 단일 선택 (select 대체) */}
                  {field.type === "chips" && (
                    <div className="flex flex-wrap gap-2">
                      {field.options?.map((opt) => {
                        const val =
                          typeof opt === "string" ? opt : opt.value;
                        const label =
                          typeof opt === "string" ? opt : opt.label;
                        const selected = assessment[field.id] === val;
                        return (
                          <button
                            key={val}
                            onClick={() => selectChip(field.id, val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              selected
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-white/5 border border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multi — 복수 선택 */}
                  {field.type === "multi" && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {field.options?.map((opt) => {
                          const val =
                            typeof opt === "string" ? opt : opt.value;
                          const label =
                            typeof opt === "string" ? opt : opt.label;
                          const selected = (
                            (assessment[field.id] as string[]) || []
                          ).includes(val);
                          return (
                            <button
                              key={val}
                              onClick={() =>
                                toggleMulti(
                                  field.id,
                                  val,
                                  field.maxSelect || 3
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                selected
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                  : "bg-white/5 border border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-muted mt-2">
                        {((assessment[field.id] as string[]) || []).length}/
                        {field.maxSelect || 3}개 선택
                      </p>
                    </>
                  )}

                  {/* Text input */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      value={(assessment[field.id] as string) || ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  )}
                </GlassCard>
              ))}

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  className="btn-glow px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-[0.97]"
                >
                  진로 분석 시작
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
                    <span className="text-muted">
                      AI가 5,000+ 직업을 분석하고 있습니다...
                    </span>
                  </div>
                </GlassCard>
              )}

              {lastAssistant && (
                <GlassCard hover={false}>
                  <EditableResult content={lastAssistant.content} filename="진로분석" />
                </GlassCard>
              )}

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setAssessment({});
                    setMessages([]);
                  }}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  다시 평가하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
