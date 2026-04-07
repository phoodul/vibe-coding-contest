"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { SUBJECTS } from "@/lib/ai/tutor-prompt";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";

export default function TutorPage() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [started, setStarted] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/tutor",
      body: { subject: selectedSubject, topic: selectedTopic },
    });

  const currentSubject = SUBJECTS.find((s) => s.name === selectedSubject);

  if (!started) {
    return (
      <div className="min-h-screen px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors mb-8 block">
            ← 대시보드
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">🎓 소크라테스 AI 튜터</h1>
            <p className="text-muted mb-8">
              답을 주지 않고 질문으로 이끕니다. 스스로 깨닫는 진짜 공부.
            </p>
          </motion.div>

          {/* 교과 선택 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">교과를 선택하세요</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUBJECTS.map((s, i) => (
                  <GlassCard
                    key={s.id}
                    delay={i * 0.05}
                    className={`cursor-pointer ${
                      selectedSubject === s.name
                        ? "!border-primary !bg-primary/10"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSubject(s.name);
                        setSelectedTopic("");
                      }}
                      className="w-full text-left"
                    >
                      <span className="font-medium">{s.name}</span>
                    </button>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* 단원 선택 */}
            <AnimatePresence>
              {currentSubject && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h2 className="text-lg font-semibold mb-3">
                    단원을 선택하세요
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    {currentSubject.topics.map((t, i) => (
                      <GlassCard
                        key={t}
                        delay={i * 0.03}
                        className={`cursor-pointer py-4 ${
                          selectedTopic === t
                            ? "!border-primary !bg-primary/10"
                            : ""
                        }`}
                      >
                        <button
                          onClick={() => setSelectedTopic(t)}
                          className="w-full text-left text-sm"
                        >
                          {t}
                        </button>
                      </GlassCard>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedTopic && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <button
                  onClick={() => setStarted(true)}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105"
                >
                  학습 시작하기
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 채팅 인터페이스
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="glass border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">🎓 소크라테스 AI 튜터</h1>
            <p className="text-xs text-muted">
              {selectedSubject} &gt; {selectedTopic}
            </p>
          </div>
          <button
            onClick={() => setStarted(false)}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            교과 변경
          </button>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <GlassCard hover={false}>
              <p className="text-muted text-sm">
                💡 <strong>{selectedTopic}</strong>에 대해 궁금한 것을
                질문해보세요. AI가 답을 직접 주지 않고, 질문을 통해 스스로
                깨달을 수 있도록 도와드립니다.
              </p>
            </GlassCard>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "glass rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 입력 */}
      <div className="glass border-t border-white/5 px-6 py-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-3"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="질문을 입력하세요..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
