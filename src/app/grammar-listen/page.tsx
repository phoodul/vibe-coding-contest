"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";

import {
  GRAMMAR_LEVELS,
  type GrammarLevel,
  type GrammarSentence,
} from "@/lib/data/grammar-levels";

const LEVEL_KEY = "grammar-listen-level";
const REPEAT_KEY = "grammar-listen-repeat";
function posKey(lv: GrammarLevel) {
  return `grammar-listen-${lv}-pos`;
}

function loadLevel(): GrammarLevel {
  if (typeof window === "undefined") return "lv1";
  return (localStorage.getItem(LEVEL_KEY) as GrammarLevel) || "lv1";
}

function loadPos(lv: GrammarLevel, total: number): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(posKey(lv));
  return v ? Math.min(Number(v), total - 1) : 0;
}

export default function GrammarListenPage() {
  const [level, setLevel] = useState<GrammarLevel>("lv1");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [repeatCount, setRepeatCount] = useState(3);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jumpTo, setJumpTo] = useState("");
  const [showList, setShowList] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playingRef = useRef(false);

  const info = GRAMMAR_LEVELS.find((l) => l.key === level)!;
  const sentences = info.sentences;
  const categories = info.categories;
  const TOTAL = sentences.length;
  const sentence = sentences[currentIdx] ?? sentences[0];
  const progress = ((currentIdx + 1) / TOTAL) * 100;

  // 사용자 제스처로 AudioContext unlock
  const ensureAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // 초기 로드
  useEffect(() => {
    const lv = loadLevel();
    setLevel(lv);
    const lvInfo = GRAMMAR_LEVELS.find((l) => l.key === lv)!;
    setCurrentIdx(loadPos(lv, lvInfo.sentences.length));
    const saved = localStorage.getItem(REPEAT_KEY);
    if (saved) setRepeatCount(Number(saved));
  }, []);

  const switchLevel = (lv: GrammarLevel) => {
    stopPlayback();
    setLevel(lv);
    localStorage.setItem(LEVEL_KEY, lv);
    const lvInfo = GRAMMAR_LEVELS.find((l) => l.key === lv)!;
    const pos = loadPos(lv, lvInfo.sentences.length);
    setCurrentIdx(pos);
  };

  const savePos = (idx: number) => {
    localStorage.setItem(posKey(level), String(idx));
  };

  // TTS 재생 (Web Audio API — 모바일 autoplay 대응)
  const playTTS = useCallback(async (text: string): Promise<void> => {
    const ctx = audioCtxRef.current!;
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
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    setLoading(false);

    return new Promise<void>((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => resolve();
      sourceRef.current = source;
      source.start();
    });
  }, []);

  // 연속 재생 루프
  const startPlayback = useCallback(
    async (startIdx: number) => {
      playingRef.current = true;
      setIsPlaying(true);
      let idx = startIdx;

      while (idx < TOTAL && playingRef.current) {
        setCurrentIdx(idx);
        savePos(idx);
        const s = sentences[idx];

        for (let rep = 0; rep < repeatCount; rep++) {
          if (!playingRef.current) break;
          setCurrentRepeat(rep + 1);
          try {
            await playTTS(s.en);
          } catch {
            await new Promise((r) => setTimeout(r, 1000));
          }
          if (rep < repeatCount - 1 && playingRef.current) {
            await new Promise((r) => setTimeout(r, 800));
          }
        }

        if (playingRef.current) {
          await new Promise((r) => setTimeout(r, 1200));
        }
        idx++;
      }

      playingRef.current = false;
      setIsPlaying(false);
      setCurrentRepeat(0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repeatCount, playTTS, sentences, TOTAL],
  );

  const stopPlayback = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    setCurrentRepeat(0);
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      sourceRef.current = null;
    }
  }, []);

  // 페이지 이탈 시 재생 중지
  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch { /* */ }
        sourceRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      ensureAudioCtx(); // 사용자 탭에서 AudioContext unlock
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
      const next = currentIdx - 1;
      setCurrentIdx(next);
      savePos(next);
    }
  };

  const handleNext = () => {
    if (currentIdx < TOTAL - 1) {
      stopPlayback();
      const next = currentIdx + 1;
      setCurrentIdx(next);
      savePos(next);
    }
  };

  // 카테고리별 시작 인덱스
  const categoryStarts = categories.map((cat) =>
    sentences.findIndex((s) => s.category === cat),
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-16">
      <div className="max-w-lg mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-6 block"
        >
          &larr; 대시보드
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            🎧 영문법 핵심 문장
          </h1>
          <p className="text-muted text-sm mb-4">
            레벨별 100문장을 반복 청취하며 영문법을 체득하세요.
          </p>

          {/* 레벨 탭 */}
          <div className="flex gap-2 mb-6">
            {GRAMMAR_LEVELS.map((lv) => (
              <button
                key={lv.key}
                onClick={() => switchLevel(lv.key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  level === lv.key
                    ? "bg-indigo-500/80 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white/5 text-muted hover:bg-white/10"
                }`}
              >
                <div>{lv.label}</div>
                <div className={`text-[10px] font-normal ${level === lv.key ? "text-indigo-200" : "text-muted/60"}`}>
                  {lv.sublabel}
                </div>
              </button>
            ))}
          </div>

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
                {loading ? "음성 생성 중..." : `반복 ${currentRepeat} / ${repeatCount}`}
              </div>
            )}
          </GlassCard>

          {/* 컨트롤러 */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all flex items-center justify-center text-xl"
            >
              ⏮
            </button>
            <button
              onClick={handleToggle}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-105 ${
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
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all flex items-center justify-center text-xl"
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
                  {categories.map((cat, ci) => {
                    const startIdx = categoryStarts[ci];
                    const catSentences = sentences.filter(
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
                              #{startIdx + 1}-{startIdx + catSentences.length}
                            </span>
                          </div>
                          <p className="text-xs text-muted">
                            {catSentences[0].grammar} 외 {catSentences.length - 1}개
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
