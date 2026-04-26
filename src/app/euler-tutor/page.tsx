"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { MATH_AREAS } from "@/lib/ai/euler-prompt";
import { filterProblems, EXAM_YEARS, EXAM_TYPES, TOTAL_PROBLEMS, type MathProblem } from "@/lib/data/math-problems";
import problemTexts from "@/lib/data/problem-texts.json";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HandwriteModal } from "@/components/euler/HandwriteModal";

type Phase = "select" | "past-exam" | "chat";
type InputMode = "text" | "photo" | "handwrite" | "voice";

export default function EulerTutorPage() {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("select");
  const [area, setArea] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useGpt, setUseGpt] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [handwriteOpen, setHandwriteOpen] = useState(false);

  // 기출문제
  const [examYear, setExamYear] = useState<number>(2026);
  const [examType, setExamType] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, status, append, setMessages, setInput } =
    useChat({
      api: "/api/euler-tutor",
      body: { area, useGpt, input_mode: inputMode },
    });

  // URL ?openHandwrite=1 또는 sessionStorage 에 필기 결과가 있으면 자동 처리
  useEffect(() => {
    if (typeof window === "undefined") return;

    // PWA / canvas 페이지에서 redirect 한 경우 바로 채팅 + 모달 오픈
    const shouldOpenHandwrite = searchParams?.get("openHandwrite") === "1";
    if (shouldOpenHandwrite) {
      if (!area) setArea("미적분");
      setPhase("chat");
      setHandwriteOpen(true);
    }

    // sessionStorage 호환 — 기존 /euler/canvas 페이지에서 OCR 결과 받아 채팅 시작
    try {
      const raw = sessionStorage.getItem("euler_canvas_seed");
      if (!raw) return;
      const seed = JSON.parse(raw) as { text: string; source?: string; ts?: number };
      sessionStorage.removeItem("euler_canvas_seed");
      if (!seed.text) return;
      if (!area) setArea("미적분");
      setInputMode("handwrite");
      setPhase("chat");
      setTimeout(() => {
        append({
          role: "user",
          content: `[필기로 입력된 문제 — OCR 결과]\n\n${seed.text}\n\n이 문제를 같이 풀어보고 싶어요!`,
        });
      }, 200);
    } catch {}
    // 한 번만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function startChat(selectedArea: string) {
    setArea(selectedArea);
    setPhase("chat");
  }

  function startWithProblem(problem: MathProblem) {
    setArea(problem.type);
    setPhase("chat");
    setTimeout(() => {
      // 파싱된 문제 원문 조회
      const textKey = `${problem.year}_${problem.type}_${problem.number}`;
      const problemText = (problemTexts as Record<string, string>)[textKey];

      // 문제와 보기 사이 빈 줄 + 보기 각 항목 줄바꿈 보장
      const formattedText = problemText
        ?.replace(/\n(\(1\))/, "\n\n$1")
        .replace(/\n(\(\d\))/g, "  \n$1");

      // 정답은 학생에게 보여주지 않음 — API 서버측에서 problem_solutions DB를 통해 처리
      const content = formattedText
        ? `[${problem.year}학년도 수능 ${problem.type} ${problem.number}번 — ${problem.isMultipleChoice ? "객관식" : "주관식"}]\n\n${formattedText}\n\n이 문제를 같이 풀어보고 싶어요!`
        : `[${problem.year}학년도 수능 ${problem.type} ${problem.number}번 — ${problem.isMultipleChoice ? "객관식" : "주관식"}]\n\n이 문제를 함께 풀어보고 싶어요. 문제를 보여주시면 같이 풀어볼게요!`;

      append({ role: "user", content });
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

  const [parsing, setParsing] = useState(false);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }
    }
  }, []);

  const sendImage = useCallback(async () => {
    if (!imagePreview) return;
    setParsing(true);
    setInputMode("photo");

    try {
      // 1단계: Upstage Document Parse로 수식 텍스트 추출 시도
      const parseRes = await fetch("/api/euler-tutor/parse-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });
      const parseData = await parseRes.json();

      if (parseData.text && !parseData.fallback) {
        // Upstage 파싱 성공 → text-only로 전송 (벤치마크 만점 조건)
        append({
          role: "user",
          content: `[수학 문제 이미지에서 추출된 텍스트]\n\n${parseData.text}\n\n${input.trim() || "이 문제를 같이 풀어보고 싶어요."}`,
        });
      } else {
        // Fallback: Vision으로 직접 전송
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
      }
    } catch {
      // 에러 시 Vision fallback
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
    } finally {
      setParsing(false);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [imagePreview, input, append]);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (imagePreview) {
      sendImage();
    } else {
      // 키보드 직접 입력은 text 모드로 표시 (handwrite/photo 모드에서 후속 텍스트 입력 시에도 text 로 전환)
      setInputMode("text");
      handleSubmit(e);
    }
  }, [imagePreview, sendImage, handleSubmit]);

  // 필기 모달에서 OCR 결과를 같은 채팅 세션에 추가
  const handleHandwriteResult = useCallback((text: string) => {
    setInputMode("handwrite");
    const isFirst = messages.length === 0;
    append({
      role: "user",
      content: isFirst
        ? `[필기로 입력]\n\n${text}\n\n이 문제를 같이 풀어보고 싶어요!`
        : `[필기로 입력한 답/풀이]\n\n${text}`,
    });
  }, [append, messages.length]);

  // 새 문제 시작 — 같은 영역 유지, 메시지만 reset
  const handleNewProblem = useCallback(() => {
    if (messages.length > 0) {
      const ok = window.confirm("현재 풀이를 마치고 새 문제로 넘어갈까요?");
      if (!ok) return;
    }
    setMessages([]);
    setImagePreview(null);
    setInput("");
    setInputMode("text");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [messages.length, setMessages, setInput]);

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
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
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
              <p className="text-xs text-muted">2017~2026 수능 전 문항 | {TOTAL_PROBLEMS}문제</p>
            </button>
            <Link
              href="/euler/canvas"
              className="w-full glass-gradient p-5 text-center relative overflow-hidden group hover:border-emerald-500/30 transition-all"
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #10b981, transparent)" }}
              />
              <span className="text-2xl block mb-2">✏️</span>
              <p className="font-bold text-sm mb-1">필기 모드 (PWA)</p>
              <p className="text-xs text-muted">손글씨로 풀고 OCR 로 자동 코칭 시작</p>
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  // 기출문제 선택 화면
  if (phase === "past-exam") {
    const types = EXAM_TYPES[examYear] || [];
    const selectedType = examType || types[0] || "";
    const filtered = filterProblems({ year: examYear, type: selectedType });

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 glass border-b border-white/5">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
            <button onClick={() => setPhase("select")} className="text-sm text-muted hover:text-foreground transition-colors">
              ← 영역 선택
            </button>
            <h1 className="text-sm font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              수능 기출 ({TOTAL_PROBLEMS}문제)
            </h1>
            <div className="w-16" />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          {/* 학년도 선택 */}
          <div className="flex gap-2 flex-wrap mb-4">
            {EXAM_YEARS.map((y) => (
              <button
                key={y}
                onClick={() => { setExamYear(y); setExamType(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  examYear === y
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                    : "glass hover:bg-white/10"
                }`}
              >
                {y}학년도
              </button>
            ))}
          </div>

          {/* 유형 선택 */}
          <div className="flex gap-2 flex-wrap mb-6">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setExamType(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                  selectedType === t ? "bg-white/15 text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 문제 목록 */}
          <div className="space-y-2">
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
                  className="w-full text-left glass-gradient p-3 relative overflow-hidden group hover:border-violet-500/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-violet-400 w-8">{p.number}번</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted">
                        {p.isMultipleChoice ? "객관식" : "주관식"}
                      </span>
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
            {filtered.length}문항 | {examYear}학년도 수능 {selectedType} | 출처: 한국교육과정평가원
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
            onClick={() => { setPhase("select"); setMessages([]); }}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← 영역 선택
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full overflow-hidden border ${useGpt ? "border-blue-500/30" : "border-amber-500/30"}`}>
              <Image src={useGpt ? "/gauss-portrait.jpg" : "/euler-portrait.jpg"} alt={useGpt ? "Gauss" : "Euler"} width={28} height={28} className="object-cover w-full h-full" />
            </div>
            <div className="text-center">
              <h1 className={`text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent ${useGpt ? "from-blue-400 to-cyan-400" : "from-amber-400 to-orange-400"}`}>
                {useGpt ? "가우스 튜터" : "오일러 튜터"}
              </h1>
              <p className="text-[10px] text-muted">{area}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewProblem}
              className="text-[10px] px-2 py-1 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-colors"
              title="새 문제"
            >
              🆕 새 문제
            </button>
            <Link
              href="/euler/report"
              className="text-[10px] px-2 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              title="약점 리포트"
            >
              📊 리포트
            </Link>
            <button
              onClick={() => setUseGpt(!useGpt)}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                useGpt
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "border-amber-500/50 bg-amber-500/10 text-amber-400"
              }`}
            >
              {useGpt ? "→ 오일러" : "→ 가우스"}
            </button>
            <Link href="/dashboard" className="text-xs text-muted hover:text-foreground transition-colors">
              대시보드
            </Link>
          </div>
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
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border opacity-60 ${useGpt ? "border-blue-500/20" : "border-amber-500/20"}`}>
                <Image src={useGpt ? "/gauss-portrait.jpg" : "/euler-portrait.jpg"} alt={useGpt ? "Gauss" : "Euler"} width={64} height={64} className="object-cover w-full h-full" />
              </div>
              <p className="text-muted text-sm mb-1">
                문제를 입력하거나 📷 사진, ✏️ 필기로 올려주세요.
              </p>
              <p className="text-muted/50 text-xs">
                같은 대화 안에서 텍스트·사진·필기를 자유롭게 섞어 풀 수 있어요.
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
                {/* 튜터 아바타 */}
                {m.role === "assistant" && (
                  <div className={`w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 mt-1 ${useGpt ? "border-blue-500/30" : "border-amber-500/30"}`}>
                    <Image src={useGpt ? "/gauss-portrait.jpg" : "/euler-portrait.jpg"} alt={useGpt ? "Gauss" : "Euler"} width={32} height={32} className="object-cover w-full h-full" />
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
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
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
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
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
              <div className={`w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 ${useGpt ? "border-blue-500/30" : "border-amber-500/30"}`}>
                <Image src={useGpt ? "/gauss-portrait.jpg" : "/euler-portrait.jpg"} alt={useGpt ? "Gauss" : "Euler"} width={32} height={32} className="object-cover w-full h-full" />
              </div>
              <div className="glass border border-white/5 px-4 py-3 rounded-2xl">
                <span className="text-sm text-muted animate-pulse">문제를 분석하고 있어요...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 */}
      <div className="sticky bottom-0 glass border-t border-white/5 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          {/* 이미지 미리보기 (입력창 위에 통합) */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2"
              >
                <div className="relative inline-block">
                  <img src={imagePreview} alt="미리보기" className="max-h-40 rounded-xl border border-white/10" />
                  <button
                    onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center hover:bg-rose-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <form
            onSubmit={onSubmit}
            className="flex gap-2 items-end"
          >
            {/* 이미지 업로드 버튼 */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-3 rounded-xl glass border border-white/10 text-lg hover:border-amber-500/30 transition-colors flex-shrink-0"
              title="문제 사진 업로드"
            >
              📷
            </motion.button>
            {/* 필기 모달 버튼 */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setHandwriteOpen(true)}
              className="px-3 py-3 rounded-xl glass border border-white/10 text-lg hover:border-emerald-500/30 transition-colors flex-shrink-0"
              title="필기로 입력"
            >
              ✏️
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
            />
            <textarea
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(e as any); } }}
              placeholder={imagePreview ? "추가 설명 (선택)..." : "문제를 한 문제씩 입력하세요 (Ctrl+V로 스크린샷 붙여넣기 가능)"}
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl glass border border-white/10 bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber-500/50 transition-colors text-sm resize-none overflow-hidden"
              disabled={isLoading}
              onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 160) + "px"; }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || (!input.trim() && !imagePreview)}
              className={`px-5 py-3 rounded-xl bg-gradient-to-r text-white font-medium text-sm disabled:opacity-40 transition-all flex-shrink-0 ${useGpt ? "from-blue-500 to-cyan-500" : "from-amber-500 to-orange-500"}`}
            >
              전송
            </motion.button>
          </form>
        </div>
      </div>

      {/* 필기 입력 모달 — 같은 채팅 세션에 OCR 결과 추가 */}
      <HandwriteModal
        open={handwriteOpen}
        onClose={() => setHandwriteOpen(false)}
        onResult={handleHandwriteResult}
      />
    </div>
  );
}
