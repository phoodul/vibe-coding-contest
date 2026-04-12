"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlassCard } from "@/components/shared/glass-card";
import { MATH_AREAS } from "@/lib/ai/euler-prompt";
import { mathProblems, filterProblems, MATH_AREAS as PROBLEM_AREAS, EXAM_YEARS, type MathProblem } from "@/lib/data/math-problems";
import Image from "next/image";
import Link from "next/link";

type Phase = "select" | "past-exam" | "chat";

export default function EulerTutorPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [area, setArea] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 기출문제
  const [examArea, setExamArea] = useState<string>("공통수학");
  const [examYear, setExamYear] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, status, append } =
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

  function startWithProblem(problem: MathProblem) {
    setArea(problem.area);
    setPhase("chat");
    // 문제를 첫 메시지로 보내기
    setTimeout(() => {
      append({
        role: "user",
        content: `[${problem.year}학년도 ${problem.exam} ${problem.number}번 — ${problem.subArea}]\n\n${problem.question}\n\n이 문제를 함께 풀어보고 싶어요. 어떻게 접근해야 할까요?`,
      });
    }, 300);
  }

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const sendImage = useCallback(() => {
    if (!imagePreview) return;
    // data:image/jpeg;base64,... → extract parts
    const [header, base64] = imagePreview.split(",");
    const mimeMatch = header.match(/data:(.+);base64/);
    const mimeType = mimeMatch?.[1] || "image/jpeg";

    append({
      role: "user",
      content: [
        { type: "image", image: `data:${mimeType};base64,${base64}` },
        { type: "text", text: input.trim() || "이 문제를 같이 풀어보고 싶어요." },
      ] as any,
    });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [imagePreview, input, append]);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (imagePreview) {
      sendImage();
    } else {
      handleSubmit(e);
    }
  }, [imagePreview, sendImage, handleSubmit]);

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
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Image
                src="/euler-portrait.jpg"
                alt="Leonhard Euler"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
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

          {/* 기출문제 연습 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <button
              onClick={() => setPhase("past-exam")}
              className="w-full glass-gradient p-5 text-center relative overflow-hidden group hover:border-violet-500/30 transition-all"
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)" }}
              />
              <span className="text-2xl block mb-2">📝</span>
              <p className="font-bold text-sm mb-1">수능 기출문제 연습</p>
              <p className="text-xs text-muted">2015~2024 수능 · 6월 · 9월 평가원 | 영역별 기출과 함께 사고과정 훈련</p>
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // 기출문제 선택 화면
  if (phase === "past-exam") {
    const filtered = filterProblems({
      area: examArea,
      ...(examYear ? { year: examYear } : {}),
    });

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 glass border-b border-white/5">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
            <button onClick={() => setPhase("select")} className="text-sm text-muted hover:text-foreground transition-colors">
              ← 영역 선택
            </button>
            <h1 className="text-sm font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              수능 기출문제
            </h1>
            <div className="w-16" />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          {/* 영역 선택 */}
          <div className="flex gap-2 flex-wrap mb-4">
            {PROBLEM_AREAS.map((a) => (
              <button
                key={a}
                onClick={() => setExamArea(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  examArea === a
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                    : "glass hover:bg-white/10"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* 연도 필터 */}
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setExamYear(null)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                !examYear ? "bg-white/15 text-white" : "text-muted hover:text-foreground"
              }`}
            >
              전체
            </button>
            {EXAM_YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setExamYear(y)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                  examYear === y ? "bg-white/15 text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {/* 문제 목록 */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-center text-muted text-sm py-8">해당 조건의 문제가 없습니다.</p>
            ) : (
              filtered.map((p) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => startWithProblem(p)}
                  className="w-full text-left glass-gradient p-4 relative overflow-hidden group hover:border-violet-500/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                          {p.year} {p.exam}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted">
                          {p.subArea}
                        </span>
                        <span className="text-[10px] text-muted">
                          {"⭐".repeat(p.difficulty)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-2">{p.question}</p>
                    </div>
                    <span className="text-muted text-xs shrink-0 group-hover:text-violet-400 transition-colors">
                      풀기 →
                    </span>
                  </div>
                </motion.button>
              ))
            )}
          </div>

          <p className="text-center text-[10px] text-muted/40 mt-6">
            {filtered.length}개 문제 | 출처: 한국교육과정평가원 (KICE)
          </p>
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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-500/30">
              <Image src="/euler-portrait.jpg" alt="Euler" width={28} height={28} className="object-cover w-full h-full" />
            </div>
            <div className="text-center">
              <h1 className="text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                오일러 튜터
              </h1>
              <p className="text-[10px] text-muted">{area}</p>
            </div>
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
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border border-amber-500/20 opacity-60">
                <Image src="/euler-portrait.jpg" alt="Euler" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              <p className="text-muted text-sm mb-1">
                문제를 입력하거나 📷 사진으로 올려주세요.
              </p>
              <p className="text-muted/50 text-xs">
                스크린샷, 교재 사진 모두 가능합니다.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start gap-2"}`}
              >
                {/* 오일러 아바타 */}
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/30 flex-shrink-0 mt-1">
                    <Image src="/euler-portrait.jpg" alt="Euler" width={32} height={32} className="object-cover w-full h-full" />
                  </div>
                )}
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
                    <>
                      {/* 이미지가 포함된 메시지 */}
                      {m.experimental_attachments?.map((att, i) => (
                        att.contentType?.startsWith("image/") && (
                          <img key={i} src={att.url} alt="문제 이미지" className="rounded-lg mb-2 max-h-48" />
                        )
                      ))}
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(status === "streaming" || status === "submitted") && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start gap-2"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/30 flex-shrink-0">
                <Image src="/euler-portrait.jpg" alt="Euler" width={32} height={32} className="object-cover w-full h-full" />
              </div>
              <div className="glass border border-white/5 px-4 py-3 rounded-2xl">
                <span className="text-sm text-muted animate-pulse">문제를 분석하고 있어요...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 이미지 미리보기 */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4"
          >
            <div className="max-w-3xl mx-auto flex items-center gap-3 p-2 glass rounded-xl border border-amber-500/20 mb-2">
              <img src={imagePreview} alt="미리보기" className="h-16 rounded-lg" />
              <p className="text-xs text-muted flex-1">수학 문제 이미지</p>
              <button
                onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="text-xs text-rose-400 hover:text-rose-300 px-2"
              >
                ✕ 삭제
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 입력 */}
      <div className="sticky bottom-0 glass border-t border-white/5 px-4 py-3">
        <form
          onSubmit={onSubmit}
          className="max-w-3xl mx-auto flex gap-2"
        >
          {/* 이미지 업로드 버튼 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-3 rounded-xl glass border border-white/10 text-lg hover:border-amber-500/30 transition-colors"
            title="문제 사진 업로드"
          >
            📷
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageUpload}
          />
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={imagePreview ? "추가 설명 (선택)..." : "수학 문제를 입력하거나 사진을 올려주세요..."}
            className="flex-1 px-4 py-3 rounded-xl glass border border-white/10 bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || (!input.trim() && !imagePreview)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm disabled:opacity-40 transition-all"
          >
            전송
          </motion.button>
        </form>
      </div>
    </div>
  );
}
