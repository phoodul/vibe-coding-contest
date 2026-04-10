"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import {
  GRAMMAR_SENTENCES,
  GRAMMAR_CATEGORIES,
  type GrammarSentence,
} from "@/lib/data/grammar-sentences";

const TOTAL = GRAMMAR_SENTENCES.length;
const STORAGE_KEY = "grammar-listen-pos";
const REPEAT_KEY = "grammar-listen-repeat";

function loadPos(): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(STORAGE_KEY);
  return v ? Math.min(Number(v), TOTAL - 1) : 0;
}
function savePos(idx: number) {
  localStorage.setItem(STORAGE_KEY, String(idx));
}

export default function GrammarListenPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [repeatCount, setRepeatCount] = useState(3);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jumpTo, setJumpTo] = useState("");
  const [showList, setShowList] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const playingRef = useRef(false);

  // 초기 로드: localStorage에서 위치 복원
  useEffect(() => {
    setCurrentIdx(loadPos());
    const saved = localStorage.getItem(REPEAT_KEY);
    if (saved) setRepeatCount(Number(saved));
  }, []);

  const sentence = GRAMMAR_SENTENCES[currentIdx];
  const progress = ((currentIdx + 1) / TOTAL) * 100;
  const categoryIdx = GRAMMAR_CATEGORIES.indexOf(
    sentence.category as (typeof GRAMMAR_CATEGORIES)[number],
  );

  // TTS 재생
  const playTTS = useCallback(
    async (text: string): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          setLoading(true);
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              voice: "nova",
              instructions:
                "Speak clearly and at a moderate pace, suitable for English language learners. Enunciate each word distinctly.",
            }),
          });
          if (!res.ok) throw new Error("TTS failed");
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);

          if (audioRef.current) {
            audioRef.current.pause();
            URL.revokeObjectURL(audioRef.current.src);
          }

          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Audio error"));
          };
          setLoading(false);
          audio.play();
        } catch (e) {
          setLoading(false);
          reject(e);
        }
      });
    },
    [],
  );

  // 연속 재생 루프
  const startPlayback = useCallback(
    async (startIdx: number) => {
      playingRef.current = true;
      setIsPlaying(true);
      let idx = startIdx;

      while (idx < TOTAL && playingRef.current) {
        setCurrentIdx(idx);
        savePos(idx);
        const s = GRAMMAR_SENTENCES[idx];

        for (let rep = 0; rep < repeatCount; rep++) {
          if (!playingRef.current) break;
          setCurrentRepeat(rep + 1);
          try {
            await playTTS(s.en);
          } catch {
            // TTS 실패 시 1초 대기 후 다음으로
            await new Promise((r) => setTimeout(r, 1000));
          }
          // 반복 사이 짧은 간격
          if (rep < repeatCount - 1 && playingRef.current) {
            await new Promise((r) => setTimeout(r, 800));
          }
        }

        // 문장 사이 간격
        if (playingRef.current) {
          await new Promise((r) => setTimeout(r, 1200));
        }
        idx++;
      }

      playingRef.current = false;
      setIsPlaying(false);
      setCurrentRepeat(0);
    },
    [repeatCount, playTTS],
  );

  const stopPlayback = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    setCurrentRepeat(0);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(currentIdx);
    }
  };

  const handleJump = () => {
    const num = parseInt(jumpTo);
    if (num >= 1 && num <= TOTAL) {
      stopPlayback();
      setCurrentIdx(num - 1);
      savePos(num - 1);
      setJumpTo("");
    }
  };

  const handleRepeatChange = (val: number) => {
    setRepeatCount(val);
    localStorage.setItem(REPEAT_KEY, String(val));
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      stopPlayback();
      setCurrentIdx(currentIdx - 1);
      savePos(currentIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < TOTAL - 1) {
      stopPlayback();
      setCurrentIdx(currentIdx + 1);
      savePos(currentIdx + 1);
    }
  };

  // 카테고리별 시작 인덱스
  const categoryStarts = GRAMMAR_CATEGORIES.map((cat) =>
    GRAMMAR_SENTENCES.findIndex((s) => s.category === cat),
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-16">
      <div className="max-w-lg mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-6 block"
        >
          ← 대시보드
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            🎧 영문법 핵심 100문장
          </h1>
          <p className="text-muted text-sm mb-6">
            ESL 핵심 문법이 담긴 100문장을 반복 청취하며 체득하세요.
          </p>

          {/* 진행도 바 */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>
                {currentIdx + 1} / {TOTAL}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* 현재 문장 카드 */}
          <GlassCard className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                {sentence.category}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted">
                {sentence.grammar}
              </span>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed mb-2">
              {sentence.en}
            </p>
            <p className="text-sm text-muted leading-relaxed">
              {sentence.ko}
            </p>
            {isPlaying && (
              <div className="mt-3 text-xs text-indigo-300">
                {loading
                  ? "음성 생성 중..."
                  : `반복 ${currentRepeat} / ${repeatCount}`}
              </div>
            )}
          </GlassCard>

          {/* 컨트롤러 */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all flex items-center justify-center text-xl"
            >
              ⏮
            </button>
            <button
              onClick={handleToggle}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-105 ${
                isPlaying
                  ? "bg-red-500/80 hover:bg-red-500"
                  : "bg-indigo-500/80 hover:bg-indigo-500"
              }`}
            >
              {isPlaying ? "⏸" : "▶️"}
            </button>
            <button
              onClick={handleNext}
              disabled={currentIdx >= TOTAL - 1}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all flex items-center justify-center text-xl"
            >
              ⏭
            </button>
          </div>

          {/* 반복 횟수 */}
          <GlassCard className="mb-4" hover={false}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">반복 횟수</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleRepeatChange(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                      repeatCount === n
                        ? "bg-indigo-500/80 text-white"
                        : "bg-white/5 text-muted hover:bg-white/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* 시작 문장 이동 */}
          <GlassCard className="mb-4" hover={false}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium shrink-0">이동</span>
              <input
                type="number"
                min={1}
                max={TOTAL}
                value={jumpTo}
                onChange={(e) => setJumpTo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJump()}
                placeholder={`1 ~ ${TOTAL}`}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
              />
              <button
                onClick={handleJump}
                className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
              >
                이동
              </button>
            </div>
          </GlassCard>

          {/* 카테고리 목록 토글 */}
          <button
            onClick={() => setShowList(!showList)}
            className="w-full text-sm text-muted hover:text-white transition-colors mb-4 flex items-center justify-center gap-1"
          >
            {showList ? "목록 접기 ▲" : "카테고리 목록 보기 ▼"}
          </button>

          <AnimatePresence>
            {showList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pb-8">
                  {GRAMMAR_CATEGORIES.map((cat, ci) => {
                    const startIdx = categoryStarts[ci];
                    const sentences = GRAMMAR_SENTENCES.filter(
                      (s) => s.category === cat,
                    );
                    return (
                      <GlassCard key={cat} hover={false} className="p-3">
                        <button
                          onClick={() => {
                            stopPlayback();
                            setCurrentIdx(startIdx);
                            savePos(startIdx);
                            setShowList(false);
                          }}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">
                              {ci + 1}. {cat}
                            </span>
                            <span className="text-xs text-muted">
                              #{startIdx + 1}-{startIdx + sentences.length}
                            </span>
                          </div>
                          <p className="text-xs text-muted">
                            {sentences[0].grammar} 외 {sentences.length - 1}개
                          </p>
                        </button>
                      </GlassCard>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
