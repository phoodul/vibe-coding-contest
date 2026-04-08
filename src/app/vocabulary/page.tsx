"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import {
  VOCAB_DATA,
  CAMP_INFO,
  GROUPS_PER_LEVEL,
  WORDS_PER_GROUP,
  PASS_SCORE,
} from "@/lib/data/vocabulary-data";
import type { VocabGroup } from "@/lib/data/vocabulary-data";
import Link from "next/link";

type Tab = "learn" | "quiz" | "progress";

const STORAGE_KEY = "eduflow-vocab-progress-v2";

interface Progress {
  startCamp: number;
  // camp -> groupIndex -> best score
  groupScores: Record<number, Record<number, number>>;
  // camp -> passed group indices
  passedGroups: Record<number, number[]>;
}

function loadProgress(): Progress {
  if (typeof window === "undefined")
    return { startCamp: 1, groupScores: {}, passedGroups: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { startCamp: 1, groupScores: {}, passedGroups: {} };
}

function saveProgress(p: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export default function VocabularyPage() {
  const [tab, setTab] = useState<Tab>("learn");
  const [selectedCamp, setSelectedCamp] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (hasStarted) saveProgress(progress);
  }, [progress, hasStarted]);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    if (p.startCamp > 1 || Object.keys(p.groupScores).length > 0) {
      setHasStarted(true);
      setSelectedCamp(p.startCamp);
    }
  }, []);

  function handleStart(camp: number) {
    const np = { ...progress, startCamp: camp };
    setProgress(np);
    setSelectedCamp(camp);
    setSelectedGroup(0);
    setHasStarted(true);
    saveProgress(np);
  }

  const groups: VocabGroup[] = VOCAB_DATA[selectedCamp] || [];

  if (!hasStarted) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto">
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
            <h1 className="text-3xl font-bold mb-2">
              &#127956;&#65039; 영어 단어 학습
            </h1>
            <p className="text-muted mb-8">
              시작할 캠프를 선택하세요. 에베레스트 정상을 향해 출발!
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CAMP_INFO.map((info, i) => (
              <GlassCard key={info.camp} delay={i * 0.05} className="cursor-pointer">
                <button
                  onClick={() => handleStart(info.camp)}
                  className="w-full text-left"
                >
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
      <div className="max-w-5xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-6 block"
        >
          &larr; 대시보드
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold">&#127956;&#65039; 영어 단어 학습</h1>
        </motion.div>

        {/* 탭 */}
        <div className="flex gap-1 mb-6 p-1 glass rounded-xl w-fit">
          {(
            [
              ["learn", "학습"],
              ["quiz", "테스트하기"],
              ["progress", "에베레스트"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <LearnTab
            camp={selectedCamp}
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            onSelectCamp={(c) => {
              setSelectedCamp(c);
              setSelectedGroup(0);
            }}
          />
        )}
        {tab === "quiz" && (
          <QuizTab
            camp={selectedCamp}
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            onSelectCamp={(c) => {
              setSelectedCamp(c);
              setSelectedGroup(0);
            }}
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}
        {tab === "progress" && <ProgressTab progress={progress} />}
      </div>
    </div>
  );
}

// ==================== LEARN TAB ====================
function LearnTab({
  camp,
  groups,
  selectedGroup,
  onSelectGroup,
  onSelectCamp,
}: {
  camp: number;
  groups: VocabGroup[];
  selectedGroup: number;
  onSelectGroup: (g: number) => void;
  onSelectCamp: (c: number) => void;
}) {
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const group = groups[selectedGroup];
  const words = group?.words || [];

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

  return (
    <div>
      {/* 캠프 선택 바 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {CAMP_INFO.map((info) => (
          <button
            key={info.camp}
            onClick={() => onSelectCamp(info.camp)}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              camp === info.camp
                ? "bg-primary text-primary-foreground"
                : "glass text-muted hover:text-foreground"
            }`}
          >
            {info.name}
          </button>
        ))}
      </div>

      {/* 그룹 선택 그리드 */}
      <GlassCard hover={false} className="mb-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-primary">
              {CAMP_INFO[camp - 1]?.name} &mdash; {CAMP_INFO[camp - 1]?.label}
            </p>
            <p className="text-xs text-muted">
              {CAMP_INFO[camp - 1]?.altitude} &middot; {groups.length}개 묶음
              &middot; 묶음당 {WORDS_PER_GROUP}단어
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {groups.map((g, i) => (
            <button
              key={i}
              onClick={() => onSelectGroup(i)}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                selectedGroup === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted hover:bg-white/10 hover:text-foreground"
              }`}
              title={g.topic}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* 현재 그룹 주제 */}
      {group && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded-md bg-primary/20 text-primary font-medium">
              #{selectedGroup + 1}
            </span>
            <span className="font-bold text-sm">{group.topic}</span>
            <span className="text-xs text-muted">
              {words.length}단어
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onSelectGroup(Math.max(0, selectedGroup - 1))}
              disabled={selectedGroup === 0}
              className="px-2 py-1 rounded-md glass text-xs disabled:opacity-30 hover:bg-white/10 transition-all"
            >
              &larr;
            </button>
            <button
              onClick={() =>
                onSelectGroup(Math.min(groups.length - 1, selectedGroup + 1))
              }
              disabled={selectedGroup === groups.length - 1}
              className="px-2 py-1 rounded-md glass text-xs disabled:opacity-30 hover:bg-white/10 transition-all"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 40단어 2열 카드 그리드 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${camp}-${selectedGroup}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {words.map(([word, meaning], i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.4) }}
              className="glass p-3 rounded-xl flex items-center justify-between group/card hover:bg-white/[0.06] transition-all"
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
                    <span className="text-xs">&#128266;</span>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5 text-muted group-hover/card:text-primary transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <div className="min-w-0">
                  <span className="font-semibold text-sm">{word}</span>
                  <span className="text-muted text-sm ml-2">{meaning}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ==================== QUIZ TAB ====================
function QuizTab({
  camp,
  groups,
  selectedGroup,
  onSelectGroup,
  onSelectCamp,
  progress,
  onUpdateProgress,
}: {
  camp: number;
  groups: VocabGroup[];
  selectedGroup: number;
  onSelectGroup: (g: number) => void;
  onSelectCamp: (c: number) => void;
  progress: Progress;
  onUpdateProgress: (p: Progress) => void;
}) {
  const group = groups[selectedGroup];
  const words = group?.words || [];
  const [quizState, setQuizState] = useState<"ready" | "active" | "result">(
    "ready"
  );
  const [questions, setQuestions] = useState<
    { word: string; meaning: string; choices: string[]; answer: number }[]
  >([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const bestScore =
    progress.groupScores[camp]?.[selectedGroup] ?? 0;
  const passed = bestScore >= PASS_SCORE;

  // 전체 레벨의 모든 단어 뜻 목록 (오답 풀)
  const allMeanings = useMemo(() => {
    const meanings: string[] = [];
    for (const g of groups) {
      for (const [, m] of g.words) meanings.push(m);
    }
    return meanings;
  }, [groups]);

  function generateQuiz() {
    if (words.length < WORDS_PER_GROUP) return;
    const picked = words.map(([word, meaning]) => {
      const wrongPool = allMeanings.filter((m) => m !== meaning);
      const shuffledWrong = wrongPool.sort(() => Math.random() - 0.5);
      const wrongMeanings = shuffledWrong.slice(0, 3);
      const choices = [...wrongMeanings, meaning].sort(
        () => Math.random() - 0.5
      );
      return {
        word,
        meaning,
        choices,
        answer: choices.indexOf(meaning),
      };
    });
    // 문제 순서도 셔플
    const shuffled = picked.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
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
        // 점수 기록
        const newScores = { ...progress.groupScores };
        if (!newScores[camp]) newScores[camp] = {};
        if (finalScore > (newScores[camp][selectedGroup] || 0)) {
          newScores[camp][selectedGroup] = finalScore;
        }
        // Pass 기록
        const newPassed = { ...progress.passedGroups };
        if (finalScore >= PASS_SCORE) {
          if (!newPassed[camp]) newPassed[camp] = [];
          if (!newPassed[camp].includes(selectedGroup)) {
            newPassed[camp] = [...newPassed[camp], selectedGroup];
          }
        }
        onUpdateProgress({
          ...progress,
          groupScores: newScores,
          passedGroups: newPassed,
        });
        setQuizState("result");
      }
    }, 800);
  }

  const passedSet = new Set(progress.passedGroups[camp] || []);

  return (
    <div>
      {/* 캠프 선택 바 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {CAMP_INFO.map((info) => (
          <button
            key={info.camp}
            onClick={() => {
              onSelectCamp(info.camp);
              setQuizState("ready");
            }}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              camp === info.camp
                ? "bg-primary text-primary-foreground"
                : "glass text-muted hover:text-foreground"
            }`}
          >
            {info.name}
          </button>
        ))}
      </div>

      {/* 그룹 선택 그리드 */}
      {quizState === "ready" && (
        <>
          <GlassCard hover={false} className="mb-4 py-3">
            <p className="font-bold text-primary mb-2">
              묶음을 선택하고 테스트를 시작하세요
            </p>
            <p className="text-xs text-muted mb-3">
              {WORDS_PER_GROUP}문항 &middot; 4지선다 &middot; {PASS_SCORE}점
              이상 Pass
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {groups.map((g, i) => {
                const isPassed = passedSet.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => onSelectGroup(i)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                      selectedGroup === i
                        ? "bg-primary text-primary-foreground"
                        : isPassed
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-white/5 text-muted hover:bg-white/10"
                    }`}
                    title={g.topic}
                  >
                    {isPassed ? "✓" : ""}{i + 1}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {group && (
            <GlassCard hover={false}>
              <div className="text-center py-6">
                <p className="text-xs text-muted mb-1">
                  #{selectedGroup + 1}
                </p>
                <h2 className="text-xl font-bold mb-2">{group.topic}</h2>
                <p className="text-muted text-sm mb-2">
                  {WORDS_PER_GROUP}문항 &middot; {PASS_SCORE}/{WORDS_PER_GROUP}{" "}
                  이상 Pass
                </p>
                {bestScore > 0 && (
                  <p
                    className={`text-sm mb-4 ${passed ? "text-green-400" : "text-amber-400"}`}
                  >
                    최고 점수: {bestScore}/{WORDS_PER_GROUP}{" "}
                    {passed ? "✓ Pass" : `— ${PASS_SCORE}점 이상 필요`}
                  </p>
                )}
                <button
                  onClick={generateQuiz}
                  disabled={words.length < WORDS_PER_GROUP}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
                >
                  퀴즈 시작
                </button>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {quizState === "active" && questions[currentQ] && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">
              {currentQ + 1} / {questions.length}
            </p>
            <p className="text-sm text-primary font-medium">{score}점</p>
          </div>
          <div className="h-1 rounded-full bg-white/10 mb-6">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{
                width: `${((currentQ + 1) / questions.length) * 100}%`,
              }}
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
                <p className="text-3xl font-bold text-primary">
                  {questions[currentQ].word}
                </p>
              </GlassCard>

              <div className="grid grid-cols-2 gap-3">
                {questions[currentQ].choices.map((choice, i) => {
                  const isAnswer = i === questions[currentQ].answer;
                  const isSelected = selected === i;
                  let style = "glass hover:bg-white/10";
                  if (selected !== null) {
                    if (isAnswer)
                      style =
                        "border-green-500 bg-green-500/20 text-green-400";
                    else if (isSelected)
                      style = "border-red-500 bg-red-500/20 text-red-400";
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
            <p className="text-6xl mb-4">
              {score >= PASS_SCORE ? "🎉" : "💪"}
            </p>
            <h2 className="text-2xl font-bold mb-2">
              {score >= PASS_SCORE ? "Pass!" : "아쉽네요!"}
            </h2>
            <p className="text-4xl font-bold text-primary mb-2">
              {score} / {questions.length}
            </p>
            <p
              className={`text-sm mb-6 ${score >= PASS_SCORE ? "text-green-400" : "text-amber-400"}`}
            >
              {score >= PASS_SCORE
                ? `#{selectedGroup + 1} ${group?.topic} 클리어!`
                : `${PASS_SCORE}점 이상이면 Pass입니다. 다시 도전해보세요!`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setQuizState("ready")}
                className="px-6 py-3 rounded-xl glass text-sm hover:bg-white/10 transition-colors"
              >
                다시 도전
              </button>
              {score >= PASS_SCORE &&
                selectedGroup < groups.length - 1 && (
                  <button
                    onClick={() => {
                      onSelectGroup(selectedGroup + 1);
                      setQuizState("ready");
                    }}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                  >
                    다음 묶음 &rarr;
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
  const camps = CAMP_INFO.map((info) => {
    const passed = progress.passedGroups[info.camp] || [];
    return {
      ...info,
      passedCount: passed.length,
      totalGroups: GROUPS_PER_LEVEL,
      allPassed: passed.length >= GROUPS_PER_LEVEL,
      isStart: info.camp === progress.startCamp,
    };
  });

  // 현재 위치: 모든 그룹을 통과한 가장 높은 캠프
  const highestFullyPassed = useMemo(() => {
    let h = progress.startCamp - 1;
    for (const c of camps) {
      if (c.allPassed && c.camp >= progress.startCamp) h = c.camp;
    }
    return h;
  }, [camps, progress.startCamp]);

  // 현재 캠프에서의 진행률
  const currentCamp = Math.min(highestFullyPassed + 1, 10);
  const currentCampPassed =
    (progress.passedGroups[currentCamp] || []).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 현재 위치 요약 */}
      <GlassCard hover={false} className="mb-6 text-center py-4">
        <p className="text-sm text-muted">현재 위치</p>
        <p className="text-xl font-bold text-primary">
          {highestFullyPassed >= 10
            ? "&#127956;&#65039; Summit 도달! 축하합니다!"
            : `${CAMP_INFO[currentCamp - 1]?.name} — ${currentCampPassed}/${GROUPS_PER_LEVEL} 묶음 클리어`}
        </p>
      </GlassCard>

      {/* 에베레스트 등반 경로 SVG */}
      <div className="relative glass rounded-2xl p-6 overflow-hidden">
        {/* 배경 산 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-slate-900/20 to-sky-900/10 pointer-events-none" />

        <div className="relative space-y-0">
          {[...camps].reverse().map((camp, i) => {
            const isCurrent = camp.camp === currentCamp && !camp.allPassed;
            const isCompleted = camp.allPassed;
            const isBelowStart = camp.camp < progress.startCamp;
            const isAboveCurrent = camp.camp > currentCamp;
            const pct =
              camp.totalGroups > 0
                ? Math.round((camp.passedCount / camp.totalGroups) * 100)
                : 0;

            return (
              <motion.div
                key={camp.camp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative flex items-center gap-4"
              >
                {/* 연결선 */}
                {i < camps.length - 1 && (
                  <div
                    className={`absolute left-[27px] top-[56px] w-0.5 h-[calc(100%)] ${
                      isCompleted
                        ? "bg-green-500/40"
                        : isCurrent
                          ? "bg-primary/30"
                          : "bg-white/10"
                    }`}
                  />
                )}

                {/* 노드 */}
                <div
                  className={`relative z-10 shrink-0 w-14 h-14 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    camp.camp === 10 && isCompleted
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                      : isCompleted
                        ? "bg-green-500 text-black shadow-lg shadow-green-500/20"
                        : isCurrent
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
                          : camp.isStart && !isCompleted
                            ? "bg-primary/30 border-2 border-primary text-primary"
                            : isBelowStart
                              ? "glass opacity-30 text-muted"
                              : "glass text-muted"
                  }`}
                >
                  {/* 현재 위치 빨간 불 깜빡임 */}
                  {isCurrent && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 animate-pulse shadow-lg shadow-red-500/50" />
                    </>
                  )}
                  {camp.camp === 10 && isCompleted
                    ? "⛰️"
                    : isCompleted
                      ? "✓"
                      : camp.camp}
                  <span className="text-[8px] font-normal mt-0.5">
                    {camp.camp === 10 ? "정상" : `C${camp.camp}`}
                  </span>
                </div>

                {/* 캠프 정보 */}
                <div
                  className={`flex-1 glass p-3 rounded-xl my-1.5 ${
                    isBelowStart
                      ? "opacity-30"
                      : isAboveCurrent && !isCompleted
                        ? "opacity-50"
                        : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-bold text-sm">{camp.name}</span>
                      <span className="text-xs text-muted ml-2">
                        {camp.altitude}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCompleted
                          ? "text-green-400"
                          : isCurrent
                            ? "text-red-400"
                            : "text-muted"
                      }`}
                    >
                      {camp.passedCount}/{camp.totalGroups}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{camp.label}</p>

                  {/* 진도 바 */}
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.06 }}
                        className={`h-full rounded-full ${
                          isCompleted
                            ? "bg-green-500"
                            : isCurrent
                              ? "bg-red-500"
                              : "bg-primary/40"
                        }`}
                      />
                    </div>
                  </div>

                  {isCurrent && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      현재 등반 중
                    </p>
                  )}
                  {camp.isStart && !isCompleted && !isCurrent && (
                    <p className="text-[10px] text-primary mt-1">
                      &#128205; 출발점
                    </p>
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
