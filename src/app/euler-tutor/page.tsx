"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlassCard } from "@/components/shared/glass-card";
import { MATH_AREAS } from "@/lib/ai/euler-prompt";
import Link from "next/link";

type Phase = "select" | "chat";

export default function EulerTutorPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [area, setArea] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, status } =
    useChat({
      api: "/api/euler-tutor",
      body: { area },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function startChat(selectedArea: string) {
    setArea(selectedArea);
    setPhase("chat");
  }

  // 선택 화면
  if (phase === "select") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 glass border-b border-white/5">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
              ← 대시보드
            </Link>
            <h1 className="text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              오일러 튜터
            </h1>
            <div className="w-16" />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="text-5xl mb-4">🧮</p>
            <h2 className="text-2xl font-bold mb-2">오일러 튜터</h2>
            <p className="text-muted text-sm max-w-md mx-auto">
              계산은 AI가 할게요. 당신은 <strong>&quot;왜 이 전략인가&quot;</strong>만 생각하세요.<br />
              수학의 논리적 사고과정을 함께 훈련합니다.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {MATH_AREAS.map((a, i) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startChat(a.name)}
                className="glass-gradient p-5 text-center relative overflow-hidden group"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg, transparent, #f59e0b, transparent)" }}
                />
                <span className="text-3xl block mb-2">{a.icon}</span>
                <p className="font-bold text-sm mb-1">{a.name}</p>
                <p className="text-xs text-muted">{a.desc}</p>
              </motion.button>
            ))}
          </motion.div>
        </main>
      </div>
    );
  }

  // 채팅 화면
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setPhase("select")}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← 영역 선택
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              🧮 오일러 튜터
            </h1>
            <p className="text-xs text-muted">{area}</p>
          </div>
          <Link href="/dashboard" className="text-xs text-muted hover:text-foreground transition-colors">
            대시보드
          </Link>
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-4xl mb-3">🧮</p>
              <p className="text-muted text-sm">
                문제를 입력하면 오일러 튜터가 사고 과정을 함께 코칭해줍니다.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-amber-500/20 border border-amber-500/30 text-foreground"
                      : "glass border border-white/5 text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(status === "streaming" || status === "submitted") && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass border border-white/5 px-4 py-3 rounded-2xl">
                <span className="text-sm text-muted animate-pulse">🧮 생각하는 중...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 */}
      <div className="sticky bottom-0 glass border-t border-white/5 px-4 py-3">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="수학 문제를 입력하세요..."
            className="flex-1 px-4 py-3 rounded-xl glass border border-white/10 bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm disabled:opacity-40 transition-all"
          >
            전송
          </motion.button>
        </form>
      </div>
    </div>
  );
}
