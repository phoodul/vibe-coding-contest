"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useRef, useCallback, useEffect } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import {
  LEVELS,
  TOPICS,
  VOICES,
  LEVEL_QUIZ,
} from "@/lib/ai/conversation-prompt";
import Link from "next/link";

// --- Types ---
type Phase = "setup" | "quiz" | "conversation" | "report";
type AIState = "idle" | "listening" | "thinking" | "speaking";

interface QuizResult {
  correct: number;
  total: number;
  recommendedLevel: string;
}

interface Report {
  strengths: string[];
  improvements: { original: string; correction: string; explanation: string }[];
  betterExpressions: { used: string; native: string; explanation: string }[];
  newVocabulary: { word: string; meaning: string; example: string }[];
  studyDirection: string;
  levelFeedback: string;
}

// --- Helpers ---
function recommendLevel(correct: number): string {
  if (correct <= 1) return "grade-1-2";
  if (correct <= 3) return "grade-3-4";
  if (correct <= 4) return "grade-5-6";
  if (correct <= 6) return "grade-7-8";
  if (correct <= 7) return "grade-9-10";
  if (correct <= 8) return "grade-11-12";
  return "college";
}

export default function ConversationPage() {
  // Setup state
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState("");
  const [topicId, setTopicId] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [voiceId, setVoiceId] = useState("nova");
  const [starter, setStarter] = useState<"me" | "ai">("ai");
  const [subtitles, setSubtitles] = useState(true);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Conversation state
  const [aiState, setAiState] = useState<AIState>("idle");
  const [micActive, setMicActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldListenRef = useRef(false);
  const pendingTranscriptRef = useRef("");
  const aiStateRef = useRef<AIState>("idle");
  const phaseRef = useRef<Phase>("setup");

  const selectedVoice = VOICES.find((v) => v.id === voiceId) || VOICES[0];
  const selectedLevel = LEVELS.find((l) => l.id === level);

  const { messages, append, isLoading, setMessages } = useChat({
    api: "/api/conversation",
    body: { level, topicId, customTopic },
    onFinish: async (message) => {
      if (message.role === "assistant") {
        setAiState("speaking");
        await playTTS(message.content);
        // AI 말 끝남 → idle 대기 (스페이스바로 다시 시작)
        setAiState("idle");
      }
    },
  });

  // --- TTS ---
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const playTTS = useCallback(
    async (text: string) => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: voiceId,
            instructions: selectedVoice.instructions,
          }),
        });
        const arrayBuffer = await res.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);

        return new Promise<void>((resolve) => {
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            resolve();
          };
          audio.play();
        });
      } catch {
        // TTS 실패 시 무시 — 텍스트는 이미 표시됨
      }
    },
    [voiceId, selectedVoice.instructions]
  );

  // --- STT (Push-to-Talk 스페이스바 방식) ---
  const startMic = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
      return;
    }

    // AI가 말하는 중이면 먼저 중단
    if (aiStateRef.current === "speaking") {
      stopAudio();
    }

    shouldListenRef.current = true;
    pendingTranscriptRef.current = "";

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true; // 스페이스바로 직접 끄므로 continuous OK

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimText(interim);
        pendingTranscriptRef.current = interim;
      }

      if (final) {
        // final이 오면 pending에 축적 (스페이스바 누를 때 전송)
        pendingTranscriptRef.current = final;
        setInterimText(final);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      console.error("Speech recognition error:", e.error);
    };

    recognition.onend = () => {
      // 사용자가 아직 말하는 중이면 재시작 (브라우저가 자동 종료한 경우)
      if (shouldListenRef.current) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setMicActive(true);
    setAiState("listening");
  }, [stopAudio]);

  // 마이크 끄기 + 축적된 텍스트 AI에 전송
  const stopMicAndSend = useCallback(() => {
    shouldListenRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    recognitionRef.current = null;
    setMicActive(false);

    const text = pendingTranscriptRef.current.trim();
    pendingTranscriptRef.current = "";
    setInterimText("");

    if (text) {
      setAiState("thinking");
      append({ role: "user", content: text });
    } else {
      setAiState("idle");
    }
  }, [append]);

  // 스페이스바 핸들러
  useEffect(() => {
    if (phaseRef.current !== "conversation") return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      // input/textarea 안에서는 무시
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();

      if (aiStateRef.current === "listening" && micActive) {
        // 말 끝남 → 마이크 끄고 AI에 전송
        stopMicAndSend();
      } else if (aiStateRef.current === "speaking") {
        // AI 말하는 중 → 중단하고 마이크 시작
        stopAudio();
        startMic();
      } else if (aiStateRef.current === "idle" || aiStateRef.current === "thinking") {
        // 대기/사고 중 → 마이크 시작
        if (!micActive) startMic();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, micActive, startMic, stopMicAndSend, stopAudio]);

  // 회화 종료 시 마이크 정리
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  // ref 동기화
  useEffect(() => { aiStateRef.current = aiState; }, [aiState]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // AI 로딩 상태 추적
  useEffect(() => {
    if (isLoading) setAiState("thinking");
  }, [isLoading]);

  // --- Quiz ---
  function handleQuizAnswer(choiceIndex: number) {
    const isCorrect = choiceIndex === LEVEL_QUIZ[quizIndex].answer;
    const newCorrect = quizCorrect + (isCorrect ? 1 : 0);

    if (quizIndex < LEVEL_QUIZ.length - 1) {
      setQuizCorrect(newCorrect);
      setQuizIndex(quizIndex + 1);
    } else {
      const rec = recommendLevel(newCorrect);
      setQuizResult({ correct: newCorrect, total: LEVEL_QUIZ.length, recommendedLevel: rec });
      setLevel(rec);
    }
  }

  // --- Start Conversation ---
  function startConversation() {
    setPhase("conversation");
    if (starter === "ai") {
      let greeting: string;
      if (topicId === "custom" && customTopic) {
        greeting = `Start the conversation about: "${customTopic}". Greet the student and introduce the topic naturally.`;
      } else if (topicId === "free-talk") {
        greeting = "Start with a friendly greeting and ask what the student wants to talk about.";
      } else {
        const scenario = TOPICS.flatMap((t) => t.scenarios).find((s) => s.id === topicId);
        greeting = `Start the conversation as: ${scenario?.prompt || "a friendly partner"}. Greet the student and set the scene.`;
      }
      append({ role: "user", content: `[SYSTEM: ${greeting}]` });
    }
  }

  // --- Report ---
  async function generateReport() {
    setPhase("report");
    setReportLoading(true);

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.filter((m) => !m.content.startsWith("[SYSTEM:")),
          level,
          topicId,
          mode: "report",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
      }

      // Vercel AI SDK data stream에서 텍스트 추출
      const textParts = fullText
        .split("\n")
        .filter((line) => line.startsWith("0:"))
        .map((line) => {
          try {
            return JSON.parse(line.slice(2));
          } catch {
            return "";
          }
        })
        .join("");

      const parsed = JSON.parse(textParts);
      setReport(parsed);
    } catch {
      setReport({
        strengths: ["리포트 생성 중 오류가 발생했습니다."],
        improvements: [],
        betterExpressions: [],
        newVocabulary: [],
        studyDirection: "다시 시도해주세요.",
        levelFeedback: "",
      });
    } finally {
      setReportLoading(false);
    }
  }

  // ==================== RENDER ====================

  // --- QUIZ PHASE ---
  if (phase === "quiz") {
    const q = LEVEL_QUIZ[quizIndex];

    if (quizResult) {
      const recLevel = LEVELS.find((l) => l.id === quizResult.recommendedLevel);
      return (
        <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-2xl mx-auto">
            <GlassCard hover={false}>
              <h2 className="text-2xl font-bold mb-4">퀴즈 결과</h2>
              <p className="text-lg mb-2">
                {quizResult.total}문제 중 <span className="text-primary font-bold">{quizResult.correct}개</span> 정답
              </p>
              <div className="glass p-4 rounded-xl mt-4 mb-6">
                <p className="text-sm text-muted mb-1">추천 레벨</p>
                <p className="text-xl font-bold text-primary">{recLevel?.label}</p>
                <p className="text-sm text-muted">{recLevel?.desc}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPhase("setup");
                    setQuizIndex(0);
                    setQuizCorrect(0);
                    setQuizResult(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl glass text-sm hover:bg-white/10 transition-colors"
                >
                  레벨 직접 선택
                </button>
                <button
                  onClick={() => setPhase("setup")}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                >
                  이 레벨로 진행
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors mb-8 block">
            ← 대시보드
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-2">단어 레벨 테스트</h1>
            <p className="text-muted mb-6">
              {quizIndex + 1} / {LEVEL_QUIZ.length}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={quizIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard hover={false} className="mb-4">
                <p className="text-sm text-muted mb-2">이 단어의 뜻은?</p>
                <p className="text-3xl font-bold text-primary">{q.word}</p>
              </GlassCard>

              <div className="grid grid-cols-2 gap-3">
                {q.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    className="glass p-4 rounded-xl text-left hover:bg-white/10 hover:border-primary/50 transition-all active:scale-95"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 진행 바 */}
          <div className="mt-6 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((quizIndex + 1) / LEVEL_QUIZ.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- REPORT PHASE ---
  if (phase === "report") {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-6">회화 리포트</h1>
          </motion.div>

          {reportLoading ? (
            <GlassCard hover={false}>
              <div className="flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-muted">AI가 대화를 분석하고 있습니다...</p>
              </div>
            </GlassCard>
          ) : report ? (
            <div className="space-y-4">
              {/* 잘한 점 */}
              <GlassCard hover={false} delay={0}>
                <h3 className="text-lg font-semibold mb-3 text-green-400">잘한 점</h3>
                <ul className="space-y-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-green-400 shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* 개선할 점 */}
              {report.improvements.length > 0 && (
                <GlassCard hover={false} delay={0.1}>
                  <h3 className="text-lg font-semibold mb-3 text-amber-400">개선할 점</h3>
                  <div className="space-y-3">
                    {report.improvements.map((item, i) => (
                      <div key={i} className="glass p-3 rounded-lg text-sm">
                        <p className="text-red-400/80 line-through">{item.original}</p>
                        <p className="text-green-400 font-medium">{item.correction}</p>
                        <p className="text-muted mt-1">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* 원어민 표현 제안 */}
              {report.betterExpressions?.length > 0 && (
                <GlassCard hover={false} delay={0.15}>
                  <h3 className="text-lg font-semibold mb-3 text-cyan-400">더 자연스러운 표현</h3>
                  <div className="space-y-3">
                    {report.betterExpressions.map((item, i) => (
                      <div key={i} className="glass p-3 rounded-lg text-sm">
                        <p className="text-muted">{item.used}</p>
                        <p className="text-cyan-400 font-medium">→ {item.native}</p>
                        <p className="text-muted mt-1">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* 새 어휘 */}
              {report.newVocabulary?.length > 0 && (
                <GlassCard hover={false} delay={0.2}>
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">새로운 어휘</h3>
                  <div className="space-y-2">
                    {report.newVocabulary.map((item, i) => (
                      <div key={i} className="glass p-3 rounded-lg text-sm">
                        <span className="text-primary font-bold">{item.word}</span>
                        <span className="text-muted ml-2">{item.meaning}</span>
                        <p className="text-muted/70 mt-1 text-xs italic">{item.example}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* 학습 방향 */}
              <GlassCard hover={false} delay={0.25}>
                <h3 className="text-lg font-semibold mb-3 text-primary">학습 방향 추천</h3>
                <p className="text-sm leading-relaxed">{report.studyDirection}</p>
                {report.levelFeedback && (
                  <p className="text-sm text-muted mt-3 pt-3 border-t border-white/10">
                    {report.levelFeedback}
                  </p>
                )}
              </GlassCard>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="flex-1 text-center px-4 py-3 rounded-xl glass text-sm hover:bg-white/10 transition-colors"
                >
                  대시보드로
                </Link>
                <button
                  onClick={() => {
                    setPhase("setup");
                    setMessages([]);
                    setReport(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                >
                  새 회화 시작
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // --- CONVERSATION PHASE ---
  if (phase === "conversation") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* 헤더 */}
        <div className="glass border-b border-white/5 px-4 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">🎙️ AI 영어 회화</h1>
              <p className="text-xs text-muted">
                {selectedLevel?.label} · {VOICES.find((v) => v.id === voiceId)?.label}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSubtitles(!subtitles)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  subtitles ? "bg-primary/20 text-primary" : "glass text-muted"
                }`}
              >
                자막 {subtitles ? "ON" : "OFF"}
              </button>
              <button
                onClick={generateReport}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                종료 & 리포트
              </button>
            </div>
          </div>
        </div>

        {/* AI Persona */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 gap-6">
          <PersonaOrb state={aiState} />

          <p className="text-sm text-muted">
            {aiState === "idle" && "Space를 눌러 말하세요"}
            {aiState === "listening" && "듣고 있어요... (Space로 전송)"}
            {aiState === "thinking" && "생각하고 있어요..."}
            {aiState === "speaking" && "말하고 있어요... (Space로 끼어들기)"}
          </p>

          {/* 자막 영역 */}
          <div className="w-full max-w-2xl min-h-[120px]">
            <AnimatePresence mode="wait">
              {/* 사용자 중간 입력 */}
              {interimText && (
                <motion.div
                  key="interim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="text-center text-sm text-muted italic"
                >
                  {interimText}
                </motion.div>
              )}

              {/* 마지막 메시지 자막 */}
              {subtitles && messages.length > 0 && !interimText && (
                <motion.div
                  key={messages[messages.length - 1]?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* 마지막 사용자 메시지 */}
                  {messages.filter((m) => m.role === "user" && !m.content.startsWith("[SYSTEM:")).length > 0 && (
                    <div className="text-right">
                      <span className="inline-block px-4 py-2 rounded-2xl rounded-br-md bg-primary/20 text-sm">
                        {messages.filter((m) => m.role === "user" && !m.content.startsWith("[SYSTEM:")).slice(-1)[0]?.content}
                      </span>
                    </div>
                  )}
                  {/* 마지막 AI 메시지 */}
                  {messages.filter((m) => m.role === "assistant").length > 0 && (
                    <div className="text-left">
                      <span className="inline-block px-4 py-2 rounded-2xl rounded-bl-md glass text-sm">
                        {messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 스페이스바 PTT 버튼 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (aiStateRef.current === "listening" && micActive) {
                stopMicAndSend();
              } else if (aiStateRef.current === "speaking") {
                stopAudio();
                startMic();
              } else if (!micActive) {
                startMic();
              }
            }}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all ${
              micActive
                ? "bg-red-500 shadow-lg shadow-red-500/40 animate-pulse"
                : aiState === "speaking"
                  ? "bg-amber-500 shadow-lg shadow-amber-500/30"
                  : aiState === "thinking"
                    ? "glass border-2 border-primary/50"
                    : "bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90"
            }`}
          >
            {micActive ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            ) : aiState === "thinking" ? (
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
            <span className="text-[10px] text-white/80 mt-1 font-medium">SPACE</span>
          </motion.button>
          <p className="text-xs text-muted mt-2">
            {micActive
              ? "녹음 중 — Space 또는 클릭으로 전송"
              : aiState === "speaking"
                ? "Space로 끼어들기"
                : aiState === "thinking"
                  ? "AI 응답 대기 중..."
                  : "Space 또는 클릭으로 시작"}
          </p>
        </div>
      </div>
    );
  }

  // --- SETUP PHASE (default) ---
  const canStart = level && (topicId === "custom" ? customTopic.trim() : topicId);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors mb-8 block">
          ← 대시보드
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">🎙️ AI 영어 회화</h1>
          <p className="text-muted mb-8">나의 수준에 맞는 AI와 영어로 대화해보세요.</p>
        </motion.div>

        <div className="space-y-8">
          {/* 1. 레벨 선택 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">1. 회화 수준</h2>
            <button
              onClick={() => {
                setPhase("quiz");
                setQuizIndex(0);
                setQuizCorrect(0);
                setQuizResult(null);
              }}
              className="w-full mb-3 px-4 py-3 rounded-xl glass border-dashed border-primary/30 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              단어 퀴즈로 내 수준 알아보기 →
            </button>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {LEVELS.map((l, i) => (
                <GlassCard
                  key={l.id}
                  delay={i * 0.03}
                  className={`cursor-pointer py-3 px-4 ${
                    level === l.id ? "!border-primary !bg-primary/10" : ""
                  }`}
                >
                  <button
                    onClick={() => setLevel(l.id)}
                    className="w-full text-left"
                  >
                    <p className="font-medium text-sm">{l.label}</p>
                    <p className="text-xs text-muted">{l.desc}</p>
                  </button>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* 2. 주제 선택 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">2. 대화 주제</h2>
            <div className="space-y-4">
              {TOPICS.map((cat) => (
                <div key={cat.category}>
                  <p className="text-sm text-muted mb-2">
                    {cat.icon} {cat.category}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cat.scenarios.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setTopicId(s.id); setCustomTopic(""); }}
                        className={`glass p-3 rounded-xl text-left text-sm transition-all ${
                          topicId === s.id
                            ? "!border-primary !bg-primary/10"
                            : "hover:bg-white/5"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* 직접 입력 */}
              <div>
                <p className="text-sm text-muted mb-2">✏️ 직접 입력</p>
                <div
                  className={`glass p-3 rounded-xl transition-all ${
                    topicId === "custom" ? "!border-primary !bg-primary/10" : ""
                  }`}
                >
                  <input
                    type="text"
                    placeholder="원하는 주제를 입력하세요 (예: 양자역학, 르네상스 미술, K-pop...)"
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                      if (e.target.value.trim()) setTopicId("custom");
                    }}
                    onFocus={() => { if (customTopic.trim()) setTopicId("custom"); }}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/50 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-muted/60 mt-1.5">
                  * 외설, 불법, 마약, 폭력, 무기제조, 자해 관련 주제는 AI가 대화를 거부합니다.
                </p>
              </div>
            </div>
          </section>

          {/* 3. 음성 선택 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">3. AI 음성</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={`glass p-3 rounded-xl text-left text-sm transition-all ${
                    voiceId === v.id
                      ? "!border-primary !bg-primary/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </section>

          {/* 4. 누가 먼저? */}
          <section>
            <h2 className="text-lg font-semibold mb-3">4. 누가 먼저 시작할까요?</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStarter("me")}
                className={`glass p-4 rounded-xl text-center transition-all ${
                  starter === "me" ? "!border-primary !bg-primary/10" : "hover:bg-white/5"
                }`}
              >
                <p className="text-2xl mb-1">🙋</p>
                <p className="text-sm font-medium">내가 먼저</p>
              </button>
              <button
                onClick={() => setStarter("ai")}
                className={`glass p-4 rounded-xl text-center transition-all ${
                  starter === "ai" ? "!border-primary !bg-primary/10" : "hover:bg-white/5"
                }`}
              >
                <p className="text-2xl mb-1">🤖</p>
                <p className="text-sm font-medium">AI가 먼저</p>
              </button>
            </div>
          </section>

          {/* 시작 버튼 */}
          {canStart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-4"
            >
              <button
                onClick={startConversation}
                className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-medium text-lg hover:bg-primary/90 transition-all hover:scale-105"
              >
                회화 시작하기
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- AI Persona Orb Component ---
function PersonaOrb({ state }: { state: AIState }) {
  return (
    <div className="relative w-32 h-32">
      {/* 외부 링 */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        animate={
          state === "listening"
            ? { scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }
            : state === "speaking"
              ? { scale: [1, 1.2, 1], opacity: [0.4, 0.2, 0.4] }
              : state === "thinking"
                ? { rotate: 360 }
                : { scale: [1, 1.05, 1] }
        }
        transition={
          state === "thinking"
            ? { duration: 2, repeat: Infinity, ease: "linear" }
            : { duration: state === "listening" ? 1 : 2, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* 두 번째 링 */}
      {(state === "listening" || state === "speaking") && (
        <motion.div
          className="absolute inset-[-8px] rounded-full border border-primary/20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      )}

      {/* 중앙 오브 */}
      <motion.div
        className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 backdrop-blur-xl flex items-center justify-center"
        animate={
          state === "thinking"
            ? { scale: [1, 0.95, 1] }
            : state === "speaking"
              ? { scale: [1, 1.05, 0.98, 1] }
              : {}
        }
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-3xl">
          {state === "idle" && "🎙️"}
          {state === "listening" && "👂"}
          {state === "thinking" && "💭"}
          {state === "speaking" && "🗣️"}
        </span>
      </motion.div>
    </div>
  );
}
