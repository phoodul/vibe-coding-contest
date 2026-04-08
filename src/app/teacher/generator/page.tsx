"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";

const DOC_TYPES = [
  { id: "안내문", label: "📢 안내문", desc: "정보 안내" },
  { id: "협조문", label: "🤝 협조문", desc: "협조 요청" },
  { id: "보고문", label: "📊 보고문", desc: "결과 보고" },
  { id: "내부결재", label: "📋 내부결재", desc: "내부 의사결정" },
];

export default function GeneratorPage() {
  const [content, setContent] = useState("");
  const [docType, setDocType] = useState("안내문");
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append } = useChat({
    api: "/api/teacher/generate",
  });

  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();

  async function handleGenerate() {
    if (!content.trim()) return;
    setSubmitted(true);
    await append({
      role: "user",
      content: JSON.stringify({ content, docType }),
    });
  }

  function handleCopy() {
    if (lastAssistant) {
      navigator.clipboard.writeText(lastAssistant.content);
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors mb-8 block">
          ← 대시보드
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">📝 공문서 생성기</h1>
          <p className="text-muted mb-8">
            전달할 내용만 입력하면 AI가 K-에듀파인 공문서 양식으로 자동 작성합니다.
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
              <GlassCard hover={false}>
                <label className="text-sm font-medium mb-3 block">문서 유형</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DOC_TYPES.map((dt) => (
                    <button
                      key={dt.id}
                      onClick={() => setDocType(dt.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        docType === dt.id
                          ? "bg-primary/20 border-primary"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="block text-sm font-medium">{dt.label}</span>
                      <span className="text-xs text-muted">{dt.desc}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>

              <GlassCard hover={false}>
                <label className="text-sm font-medium mb-2 block">
                  전달할 내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="예: 4월 15일까지 교육과정 운영 계획서를 K-에듀파인으로 제출해주세요. 양식은 붙임 참고."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground font-mono text-sm leading-relaxed resize-none placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                />
              </GlassCard>

              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={!content.trim()}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
                >
                  공문서 생성
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
                    <span className="text-muted">공문서를 작성하고 있습니다...</span>
                  </div>
                </GlassCard>
              )}

              {lastAssistant && (
                <GlassCard hover={false}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">생성된 공문서</span>
                    <button
                      onClick={handleCopy}
                      className="text-xs px-3 py-1 rounded-lg glass hover:bg-card-hover transition-colors"
                    >
                      📋 복사
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-white/3 rounded-lg p-4 border border-white/5">
                    {lastAssistant.content}
                  </div>
                </GlassCard>
              )}

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setContent("");
                  }}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  새 문서 작성
                </button>
                <Link
                  href="/teacher/formatter"
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  포맷터로 교정하기 →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
