"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { VOCAB_DATA, CAMP_INFO } from "@/lib/data/vocabulary-data";
import Link from "next/link";

type Tab = "learn" | "quiz" | "progress";

// 로컬스토리지 키
const STORAGE_KEY = "eduflow-vocab-progress";

interface Progress {
  startCamp: number;
  campScores: Record<number, number>; // camp -> 최고 점수
  learnedWords: Record<number, string[]>; // camp -> 학습한 단어 목록
}

function loadProgress(): Progress {
  if (typeof window === "undefined") return { startCamp: 1, campScores: {}, learnedWords: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { startCamp: 1, campScores: {}, learnedWords: {} };
}

function saveProgress(p: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export default function VocabularyPage() {
  const [tab, setTab] = useState<Tab>("learn");
  const [selectedCamp, setSelectedCamp] = useState(1);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [hasStarted, setHasStarted] = useState(false);

  // 진도 저장
  useEffect(() => {
    if (hasStarted) saveProgress(progress);
  }, [progress, hasStarted]);

  // 초기 로드
  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    if (p.startCamp > 1 || Object.keys(p.campScores).length > 0) {
      setHasStarted(true);
      setSelectedCamp(p.startCamp);
    }
  }, []);

  function handleStart(camp: number) {
    const newProgress = { ...progress, startCamp: camp };
    setProgress(newProgress);
    setSelectedCamp(camp);
    setHasStarted(true);
    saveProgress(newProgress);
  }

  // 시작 레벨 선택
  if (!hasStarted) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors mb-8 block">
            ← 대시보드
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">🏔️ 영어 단어 학습</h1>
            <p className="text-muted mb-8">시작할 캠프를 선택하세요. 에베레스트 정상을 향해 출발!</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CAMP_INFO.map((info, i) => (
              <GlassCard key={info.camp} delay={i * 0.05} className="cursor-pointer">
                <button onClick={() => handleStart(info.camp)} className="w-full text-left">
                  <p className="text-xs text-muted">{info.altitude}</p>
                  <p className="font-bold text-primary">{info.name}</p>
                  <p className="text-sm text-muted">{info.label}</p>
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors mb-6 block">
          ← 대시보드
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold">🏔️ 영어 단어 학습</h1>
        </motion.div>

        {/* 탭 */}
        <div className="flex gap-1 mb-6 p-1 glass rounded-xl w-fit">
          {([
            ["learn", "학습"],
            ["quiz", "복습 퀴즈"],
            ["progress", "에베레스트"],
          ] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <LearnTab
            selectedCamp={selectedCamp}
            onSelectCamp={setSelectedCamp}
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}
        {tab === "quiz" && (
          <QuizTab
            selectedCamp={selectedCamp}
            onSelectCamp={setSelectedCamp}
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}
        {tab === "progress" && (
          <ProgressTab progress={progress} />
        )}
      </div>
    </div>
  );
}

// ==================== LEARN TAB ====================
function LearnTab({
  selectedCamp,
  onSelectCamp,
  progress,
  onUpdateProgress,
}: {
  selectedCamp: number;
  onSelectCamp: (c: number) => void;
  progress: Progress;
  onUpdateProgress: (p: Progress) => void;
}) {
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const words = VOCAB_DATA[selectedCamp] || [];
  const learnedSet = new Set(progress.learnedWords[selectedCamp] || []);

  const playPronunciation = useCallback(async (word: string) => {
    setPlayingWord(word);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: word,
          voice: "nova",
          instructions: "Pronounce this English word clearly and slowly.",
        }),
      });
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setPlayingWord(null);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setPlayingWord(null);
      };
      audio.play();
    } catch {
      setPlayingWord(null);
    }
  }, []);

  function markLearned(word: string) {
    const current = progress.learnedWords[selectedCamp] || [];
    if (current.includes(word)) return;
    onUpdateProgress({
      ...progress,
      learnedWords: {
        ...progress.learnedWords,
        [selectedCamp]: [...current, word],
      },
    });
  }

  return (
    <div>
      {/* 캠프 선택 바 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {CAMP_INFO.map((info) => (
          <button
            key={info.camp}
            onClick={() => onSelectCamp(info.camp)}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedCamp === info.camp
                ? "bg-primary text-primary-foreground"
                : "glass text-muted hover:text-foreground"
            }`}
          >
            {info.name}
          </button>
        ))}
      </div>

      {/* 캠프 정보 */}
      <GlassCard hover={false} className="mb-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-primary">
              {CAMP_INFO[selectedCamp - 1]?.name} — {CAMP_INFO[selectedCamp - 1]?.label}
            </p>
            <p className="text-xs text-muted">
              {CAMP_INFO[selectedCamp - 1]?.altitude} · {words.length}개 단어 · {learnedSet.size}개 학습 완료
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-primary">
              {words.length > 0 ? Math.round((learnedSet.size / words.length) * 100) : 0}%
            </div>
            <div className="w-20 h-1.5 rounded-full bg-white/10 mt-1">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${words.length > 0 ? (learnedSet.size / words.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 단어 목록 */}
      <div className="space-y-2">
        {words.map(([word, meaning], i) => (
          <motion.div
            key={word}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.5) }}
            className={`glass p-3 rounded-xl flex items-center justify-between transition-all ${
              learnedSet.has(word) ? "border-green-500/20 bg-green-500/5" : ""
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => playPronunciation(word)}
                disabled={playingWord === word}
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  playingWord === word
                    ? "bg-primary/30 animate-pulse"
                    : "bg-white/5 hover:bg-primary/20"
                }`}
              >
                {playingWord === word ? (
                  <span className="text-xs">🔊</span>
                ) : (
                  <svg className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <div className="min-w-0">
                <span className="font-medium text-sm">{word}</span>
                <span className="text-muted text-sm ml-3">{meaning}</span>
              </div>
            </div>
            {!learnedSet.has(word) && (
              <button
                onClick={() => markLearned(word)}
                className="shrink-0 text-xs px-2 py-1 rounded-md bg-white/5 text-muted hover:text-green-400 hover:bg-green-500/10 transition-all"
              >
                학습 완료
              </button>
            )}
            {learnedSet.has(word) && (
              <span className="shrink-0 text-green-400 text-xs">✓</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==================== QUIZ TAB ====================
function QuizTab({
  selectedCamp,
  onSelectCamp,
  progress,
  onUpdateProgress,
}: {
  selectedCamp: number;
  onSelectCamp: (c: number) => void;
  progress: Progress;
  onUpdateProgress: (p: Progress) => void;
}) {
  const words = VOCAB_DATA[selectedCamp] || [];
  const [quizState, setQuizState] = useState<"ready" | "active" | "result">("ready");
  const [questions, setQuestions] = useState<{ word: string; meaning: string; choices: string[]; answer: number }[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const bestScore = progress.campScores[selectedCamp] || 0;
  const passed = bestScore >= 90;

  function generateQuiz() {
    if (words.length < 10) return;
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 100).map(([word, meaning]) => {
      // 오답 3개 선택 (다른 단어의 뜻)
      const wrongMeanings = words
        .filter(([w]) => w !== word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(([, m]) => m);
      const choices = [...wrongMeanings, meaning].sort(() => Math.random() - 0.5);
      return {
        word,
        meaning,
        choices,
        answer: choices.indexOf(meaning),
      };
    });
    setQuestions(picked);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setQuizState("active");
  }

  function handleAnswer(choiceIdx: number) {
    if (selected !== null) return;
    setSelected(choiceIdx);
    const isCorrect = choiceIdx === questions[currentQ].answer;
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ((q) => q + 1);
        setSelected(null);
      } else {
        const finalScore = isCorrect ? score + 1 : score;
        const pct = Math.round((finalScore / questions.length) * 100);
        const newScores = { ...progress.campScores };
        if (pct > (newScores[selectedCamp] || 0)) {
          newScores[selectedCamp] = pct;
        }
        onUpdateProgress({ ...progress, campScores: newScores });
        setQuizState("result");
      }
    }, 800);
  }

  return (
    <div>
      {/* 캠프 선택 바 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {CAMP_INFO.map((info) => {
          const campScore = progress.campScores[info.camp] || 0;
          const campPassed = campScore >= 90;
          return (
            <button
              key={info.camp}
              onClick={() => { onSelectCamp(info.camp); setQuizState("ready"); }}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                selectedCamp === info.camp
                  ? "bg-primary text-primary-foreground"
                  : campPassed
                    ? "glass text-green-400 border-green-500/30"
                    : "glass text-muted hover:text-foreground"
              }`}
            >
              {campPassed && "✓ "}{info.name}
            </button>
          );
        })}
      </div>

      {quizState === "ready" && (
        <GlassCard hover={false}>
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-2">{CAMP_INFO[selectedCamp - 1]?.name} 복습 퀴즈</h2>
            <p className="text-muted text-sm mb-2">100문제 · 4지선다 · 90점 이상 통과</p>
            {bestScore > 0 && (
              <p className={`text-sm mb-4 ${passed ? "text-green-400" : "text-amber-400"}`}>
                최고 점수: {bestScore}점 {passed ? "✓ 통과" : "— 90점 이상 필요"}
              </p>
            )}
            <button
              onClick={generateQuiz}
              disabled={words.length < 10}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
            >
              {words.length < 10 ? "단어가 부족합니다" : "퀴즈 시작"}
            </button>
          </div>
        </GlassCard>
      )}

      {quizState === "active" && questions[currentQ] && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">{currentQ + 1} / {questions.length}</p>
            <p className="text-sm text-primary font-medium">{score}점</p>
          </div>
          <div className="h-1 rounded-full bg-white/10 mb-6">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard hover={false} className="mb-4 text-center py-8">
                <p className="text-3xl font-bold text-primary">{questions[currentQ].word}</p>
              </GlassCard>

              <div className="grid grid-cols-2 gap-3">
                {questions[currentQ].choices.map((choice, i) => {
                  const isAnswer = i === questions[currentQ].answer;
                  const isSelected = selected === i;
                  let style = "glass hover:bg-white/10";
                  if (selected !== null) {
                    if (isAnswer) style = "border-green-500 bg-green-500/20 text-green-400";
                    else if (isSelected) style = "border-red-500 bg-red-500/20 text-red-400";
                    else style = "glass opacity-50";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={selected !== null}
                      className={`p-4 rounded-xl text-sm text-left transition-all active:scale-95 ${style}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {quizState === "result" && (
        <GlassCard hover={false}>
          <div className="text-center py-8">
            <p className="text-6xl mb-4">{score >= 90 ? "🎉" : "💪"}</p>
            <h2 className="text-2xl font-bold mb-2">
              {score >= 90 ? "통과!" : "아쉽네요!"}
            </h2>
            <p className="text-4xl font-bold text-primary mb-2">{score} / {questions.length}</p>
            <p className={`text-sm mb-6 ${score >= 90 ? "text-green-400" : "text-amber-400"}`}>
              {score >= 90
                ? `${CAMP_INFO[selectedCamp - 1]?.name} 클리어! 다음 캠프로 이동할 수 있습니다.`
                : "90점 이상이면 통과입니다. 다시 도전해보세요!"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setQuizState("ready")}
                className="px-6 py-3 rounded-xl glass text-sm hover:bg-white/10 transition-colors"
              >
                다시 도전
              </button>
              {score >= 90 && selectedCamp < 10 && (
                <button
                  onClick={() => { onSelectCamp(selectedCamp + 1); setQuizState("ready"); }}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                >
                  다음 캠프 →
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ==================== PROGRESS TAB (EVEREST) ====================
function ProgressTab({ progress }: { progress: Progress }) {
  const camps = CAMP_INFO.map((info) => ({
    ...info,
    score: progress.campScores[info.camp] || 0,
    passed: (progress.campScores[info.camp] || 0) >= 90,
    isStart: info.camp === progress.startCamp,
    learned: (progress.learnedWords[info.camp] || []).length,
  }));

  const highestPassed = useMemo(() => {
    let h = progress.startCamp - 1;
    for (const c of camps) {
      if (c.passed && c.camp >= progress.startCamp) h = c.camp;
    }
    return h;
  }, [camps, progress.startCamp]);

  return (
    <div className="max-w-2xl mx-auto">
      <GlassCard hover={false} className="mb-6 text-center py-4">
        <p className="text-sm text-muted">현재 위치</p>
        <p className="text-xl font-bold text-primary">
          {highestPassed >= 10
            ? "🏔️ Summit 도달! 축하합니다!"
            : `🏔️ ${CAMP_INFO[highestPassed]?.name || "Base Camp"} → ${CAMP_INFO[highestPassed + 1 - 1]?.name || ""}`}
        </p>
      </GlassCard>

      {/* 에베레스트 등반 경로 — 아래(캠프1)에서 위(캠프10)로 */}
      <div className="relative">
        {/* 연결선 */}
        <div className="absolute left-[28px] top-0 bottom-0 w-0.5 bg-white/10" />

        <div className="space-y-3">
          {[...camps].reverse().map((camp, i) => {
            const isCurrent = camp.camp === highestPassed + 1;
            const isReached = camp.camp <= highestPassed || camp.passed;
            const isBelowStart = camp.camp < progress.startCamp;

            return (
              <motion.div
                key={camp.camp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex items-start gap-4"
              >
                {/* 노드 */}
                <div
                  className={`relative z-10 shrink-0 w-14 h-14 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    camp.camp === 10 && camp.passed
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                      : camp.passed
                        ? "bg-green-500 text-black shadow-lg shadow-green-500/20"
                        : isCurrent
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse"
                          : camp.isStart
                            ? "bg-primary/30 border-2 border-primary text-primary"
                            : isBelowStart
                              ? "glass opacity-30 text-muted"
                              : "glass text-muted"
                  }`}
                >
                  {camp.camp === 10 && camp.passed ? "⛰️" : camp.passed ? "✓" : camp.camp}
                  <span className="text-[8px] font-normal mt-0.5">
                    {camp.camp === 10 ? "정상" : `C${camp.camp}`}
                  </span>
                </div>

                {/* 캠프 정보 */}
                <div className={`flex-1 glass p-3 rounded-xl ${isBelowStart ? "opacity-30" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-bold text-sm">{camp.name}</span>
                      <span className="text-xs text-muted ml-2">{camp.altitude}</span>
                    </div>
                    {camp.score > 0 && (
                      <span className={`text-xs font-medium ${camp.passed ? "text-green-400" : "text-amber-400"}`}>
                        {camp.score}점
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">{camp.label}</p>
                  {camp.learned > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-muted mb-0.5">
                        <span>학습 진도</span>
                        <span>{camp.learned} / {camp.wordsTarget}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all"
                          style={{ width: `${Math.min((camp.learned / camp.wordsTarget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {camp.isStart && !camp.passed && (
                    <p className="text-[10px] text-primary mt-1">📍 출발점</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
