"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";
import { EditableResult } from "@/components/shared/editable-result";

import { INTERNSHIP_FIELDS } from "@/lib/ai/internship-prompt";

export default function InternshipPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/internship",
  });

  function update(id: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit() {
    if (!form.tasks?.trim()) return;
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
          <h1 className="text-3xl font-bold mb-2">&#128221; 현장실습 일지 도우미</h1>
          <p className="text-muted mb-8">
            오늘 한 일을 간단히 메모하면, AI가 제출용 실습 일지로 정리해드려요.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {INTERNSHIP_FIELDS.map((field, i) => (
                <GlassCard key={field.id} delay={i * 0.04} hover={false}>
                  <label className="text-sm font-medium mb-2 block">
                    {field.label}
                    {field.id === "learned" && (
                      <span className="text-muted text-xs ml-1">(선택)</span>
                    )}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.id] || ""}
                      onChange={(e) => update(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[field.id] || ""}
                      onChange={(e) => update(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  )}
                </GlassCard>
              ))}

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!form.tasks?.trim()}
                  className="btn-glow px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-[0.97] disabled:opacity-40 disabled:hover:scale-100"
                >
                  일지 작성하기
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
                    <span className="text-muted">AI가 실습 일지를 정리하고 있습니다...</span>
                  </div>
                </GlassCard>
              )}

              {lastAssistant && (
                <GlassCard hover={false}>
                  <EditableResult content={lastAssistant.content} filename="현장실습일지" />
                </GlassCard>
              )}

              <div className="flex justify-center mt-6 gap-3">
                <button
                  onClick={() => {
                    if (lastAssistant) navigator.clipboard.writeText(lastAssistant.content);
                  }}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  복사하기
                </button>
                <button
                  onClick={() => { setSubmitted(false); setForm({}); setMessages([]); }}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  새 일지 작성
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
