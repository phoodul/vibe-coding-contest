"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";

const GRADES = ["중학교 1학년", "중학교 2학년", "중학교 3학년", "고등학교 1학년", "고등학교 2학년", "고등학교 3학년", "대학생/재수생"];

export default function BooksPage() {
  const [grade, setGrade] = useState("");
  const [desiredMajor, setDesiredMajor] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append } = useChat({
    api: "/api/books",
  });

  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();

  async function handleSubmit() {
    setSubmitted(true);
    await append({
      role: "user",
      content: `학년: ${grade}\n희망 학과: ${desiredMajor || "미정"}\n희망 진로: ${careerGoal || "미정"}`,
    });
  }

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors mb-8 block">
          ← 대시보드
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">📚 맞춤 도서 추천</h1>
          <p className="text-muted mb-8">
            학년과 진로에 맞는 도서를 AI가 선별하여 추천합니다.
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
                <label className="text-sm font-medium mb-2 block">학년</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">학년을 선택하세요</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </GlassCard>

              <GlassCard hover={false}>
                <label className="text-sm font-medium mb-2 block">희망 학과 / 대학 (선택)</label>
                <input
                  type="text"
                  value={desiredMajor}
                  onChange={(e) => setDesiredMajor(e.target.value)}
                  placeholder="예: 컴퓨터공학, 의학, 경영학..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                />
              </GlassCard>

              <GlassCard hover={false}>
                <label className="text-sm font-medium mb-2 block">희망 진로 / 직업 (선택)</label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="예: 소프트웨어 엔지니어, 의사, 교사..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                />
              </GlassCard>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!grade}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
                >
                  도서 추천 받기
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
                    <span className="text-muted">맞춤 도서를 선별하고 있습니다...</span>
                  </div>
                </GlassCard>
              )}

              {lastAssistant && (
                <GlassCard hover={false}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {lastAssistant.content}
                  </div>
                </GlassCard>
              )}

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  다시 추천 받기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
