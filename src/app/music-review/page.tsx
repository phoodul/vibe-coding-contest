"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlassCard } from "@/components/shared/glass-card";

import { MUSIC_GENRES } from "@/lib/ai/music-review-prompt";

export default function MusicReviewPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append, setMessages } = useChat({
    api: "/api/music-review",
  });

  function update(id: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit() {
    if (!form.title?.trim()) return;
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
          <h1 className="text-3xl font-bold mb-2">&#127925; 음악 감상문 코치</h1>
          <p className="text-muted mb-8">
            곡 정보와 느낌을 입력하면, AI가 음악 용어를 활용한 감상문 작성을 도와드려요.
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
              {/* 곡명 + 아티스트 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassCard delay={0} hover={false}>
                  <label className="text-sm font-medium mb-2 block">곡명</label>
                  <input
                    type="text"
                    value={form.title || ""}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="예: 사계 - 봄"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary transition-colors text-sm"
                    autoFocus
                  />
                </GlassCard>

                <GlassCard delay={0.04} hover={false}>
                  <label className="text-sm font-medium mb-2 block">
                    작곡가/아티스트 <span className="text-muted text-xs">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={form.artist || ""}
                    onChange={(e) => update("artist", e.target.value)}
                    placeholder="예: 비발디, BTS, 윤동주"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </GlassCard>
              </div>

              {/* 장르 */}
              <GlassCard delay={0.08} hover={false}>
                <label className="text-sm font-medium mb-3 block">
                  장르 <span className="text-muted text-xs">(선택)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => update("genre", form.genre === genre ? "" : genre)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        form.genre === genre
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-white/5 border border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* 느낌 */}
              <GlassCard delay={0.12} hover={false}>
                <label className="text-sm font-medium mb-2 block">
                  듣고 느낀 점 <span className="text-muted text-xs">(간단히 메모)</span>
                </label>
                <textarea
                  value={form.feeling || ""}
                  onChange={(e) => update("feeling", e.target.value)}
                  placeholder="예: 봄이 오는 느낌, 밝고 경쾌한 멜로디가 좋았음, 바이올린 소리가 인상적"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                />
              </GlassCard>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!form.title?.trim()}
                  className="btn-glow px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-[0.97] disabled:opacity-40 disabled:hover:scale-100"
                >
                  감상문 코칭 시작
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
                    <span className="text-muted">AI 코치가 감상문을 준비하고 있습니다...</span>
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
                  다른 곡 감상하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
