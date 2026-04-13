"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { fireQuizConfetti, fireSummitConfetti } from "@/lib/confetti";

type Tab = "learn" | "quiz" | "progress";

const STORAGE_KEY = "eduflow-vocab-progress-v2";

/** 한국어 뜻의 끝 패턴으로 품사를 추론 — 같은 품사끼리 보기를 만들기 위함 */
function guessPos(meaning: string): string {
  const m = meaning.trim();
  if (m.endsWith("하다") || m.endsWith("되다") || m.endsWith("시키다") || m.endsWith("짓다") || m.endsWith("나다") || m.endsWith("내다") || m.endsWith("주다") || m.endsWith("먹다") || m.endsWith("가다") || m.endsWith("오다"))
    return "verb";
  if (m.endsWith("의") || m.endsWith("적") || m.endsWith("스러운") || m.endsWith("로운") || m.endsWith("다운") || m.endsWith("같은") || m.endsWith("없는") || m.endsWith("있는") || m.endsWith("한") || m.endsWith("인") || m.endsWith("색의") || m.endsWith("적인"))
    return "adj";
  if (m.endsWith("게") || m.endsWith("히") || m.endsWith("으로") || m.endsWith("로"))
    return "adv";
  return "noun";
}

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

  const playPronunciation = useCallback((word: string) => {
    setPlayingWord(word);
    // 브라우저 내장 SpeechSynthesis — 네트워크 없이 즉시 발음
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // 이전 발음 중단
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.85; // 약간 느리게 (학습용)
      // 영어 음성 선택
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(
        (v) => v.lang.startsWith("en") && v.name.includes("Google")
      ) || voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) utterance.voice = enVoice;
      utterance.onend = () => setPlayingWord(null);
      utterance.onerror = () => setPlayingWord(null);
      window.speechSynthesis.speak(utterance);
    } else {
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

  // 전체 레벨의 모든 단어 뜻 목록 (오답 풀) — 품사별 분류
  const meaningsByPos = useMemo(() => {
    const all: string[] = [];
    const byPos: Record<string, string[]> = {};
    for (const g of groups) {
      for (const [, m] of g.words) {
        all.push(m);
        const pos = guessPos(m);
        if (!byPos[pos]) byPos[pos] = [];
        byPos[pos].push(m);
      }
    }
    return { all, byPos };
  }, [groups]);

  function generateQuiz() {
    if (words.length < WORDS_PER_GROUP) return;
    const picked = words.map(([word, meaning]) => {
      const pos = guessPos(meaning);
      // 같은 품사에서 오답 후보를 먼저 뽑고, 부족하면 전체 풀에서 보충
      const samePosPool = (meaningsByPos.byPos[pos] || []).filter(
        (m) => m !== meaning
      );
      const otherPool = meaningsByPos.all.filter(
        (m) => m !== meaning && !samePosPool.includes(m)
      );
      const shuffledSame = samePosPool.sort(() => Math.random() - 0.5);
      const shuffledOther = otherPool.sort(() => Math.random() - 0.5);
      const wrongMeanings = [...shuffledSame, ...shuffledOther].slice(0, 3);
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
          fireQuizConfetti();
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

// ==================== PROGRESS TAB (EVEREST SVG) ====================

// 등반 루트 좌표 (SVG viewBox 800x600 기준) — 참고: everest4.webp 스타일
// Base Camp(하단 좌측) → Summit(상단 중앙) 지그재그 경로
const ROUTE_POINTS: [number, number][] = [
  [120, 540], // 1: Base Camp (5,364m)
  [160, 480], // 2: Camp I (6,065m)
  [240, 420], // 3: Camp II (6,500m)
  [330, 370], // 4: Camp III (7,162m)
  [420, 320], // 5: Camp IV (7,920m)
  [480, 270], // 6: Camp V (8,000m)
  [530, 225], // 7: Camp VI (8,200m)
  [560, 180], // 8: Camp VII (8,400m)
  [510, 135], // 9: Camp VIII (8,600m)
  [430, 75],  // 10: Summit (8,849m)
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getPointOnRoute(campIdx: number, groupIdx: number): [number, number] {
  // campIdx: 0-9 (which camp we're in), groupIdx: 0-44 (which group within that camp)
  if (campIdx >= ROUTE_POINTS.length - 1) return ROUTE_POINTS[ROUTE_POINTS.length - 1];
  const t = groupIdx / GROUPS_PER_LEVEL;
  const [x1, y1] = ROUTE_POINTS[campIdx];
  const [x2, y2] = ROUTE_POINTS[campIdx + 1];
  return [lerp(x1, x2, t), lerp(y1, y2, t)];
}

function ProgressTab({ progress }: { progress: Progress }) {
  const [showCelebration, setShowCelebration] = useState("");
  const [isClimbing, setIsClimbing] = useState(false);
  const prevPassedRef = useRef(JSON.stringify(progress.passedGroups));

  // progress.passedGroups에서 직접 계산 (의존성 명확화)
  const camps = useMemo(
    () =>
      CAMP_INFO.map((info) => {
        const passed = progress.passedGroups[info.camp] || [];
        return {
          ...info,
          passedCount: passed.length,
          allPassed: passed.length >= GROUPS_PER_LEVEL,
        };
      }),
    [progress.passedGroups]
  );

  // 현재 위치 계산
  const { currentCampIdx, currentGroupIdx } = useMemo(() => {
    for (let i = progress.startCamp - 1; i < 10; i++) {
      const passedCount = (progress.passedGroups[CAMP_INFO[i].camp] || []).length;
      if (passedCount < GROUPS_PER_LEVEL) {
        return { currentCampIdx: i, currentGroupIdx: passedCount };
      }
    }
    return { currentCampIdx: 9, currentGroupIdx: GROUPS_PER_LEVEL };
  }, [progress.passedGroups, progress.startCamp]);

  const currentPos = getPointOnRoute(currentCampIdx, currentGroupIdx);
  const reachedSummit = currentCampIdx >= 9 && currentGroupIdx >= GROUPS_PER_LEVEL;

  // Summit 축하
  useEffect(() => {
    if (reachedSummit && !sessionStorage.getItem("summit-celebrated")) {
      sessionStorage.setItem("summit-celebrated", "true");
      fireSummitConfetti();
    }
  }, [reachedSummit]);

  // 등산 애니메이션: passedGroups 변경 시 3초간 걷기
  useEffect(() => {
    const current = JSON.stringify(progress.passedGroups);
    if (current !== prevPassedRef.current) {
      prevPassedRef.current = current;
      setIsClimbing(true);
      const timer = setTimeout(() => setIsClimbing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [progress.passedGroups]);

  // 캠프 도착 축하 감지
  useEffect(() => {
    for (let i = progress.startCamp; i <= 10; i++) {
      const campData = camps[i - 1];
      if (campData?.allPassed) {
        const key = `camp-${i}-celebrated`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "true");
          setShowCelebration(campData.name);
          fireQuizConfetti();
          setTimeout(() => setShowCelebration(""), 3000);
          break;
        }
      }
    }
  }, [camps, progress.startCamp]);

  // 루트 경로 SVG path
  const routePath = ROUTE_POINTS.map((p, i) =>
    i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`
  ).join(" ");

  // 진행 완료 구간 path
  const completedPoints: [number, number][] = [];
  for (let i = 0; i <= currentCampIdx; i++) {
    if (i < currentCampIdx) {
      completedPoints.push(ROUTE_POINTS[i]);
    } else {
      completedPoints.push(ROUTE_POINTS[i]);
      if (currentGroupIdx > 0 && i < 9) {
        completedPoints.push(currentPos);
      }
    }
  }
  const completedPath = completedPoints
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");

  return (
    <div className="max-w-4xl mx-auto">
      {/* 축하 메시지 */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-gradient px-8 py-4 text-center"
          >
            <p className="text-3xl mb-1">&#127881;</p>
            <p className="font-bold text-lg text-primary">
              {showCelebration} 도착!
            </p>
            <p className="text-sm text-muted">축하합니다! 다음 구간으로 나아가세요!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 현재 위치 요약 */}
      <GlassCard hover={false} className="mb-4 text-center py-3">
        <p className="text-sm text-muted">현재 위치</p>
        <p className="text-lg font-bold text-primary">
          {reachedSummit
            ? "Summit 도달! 축하합니다!"
            : `${CAMP_INFO[currentCampIdx]?.name} — ${camps[currentCampIdx]?.passedCount}/${GROUPS_PER_LEVEL} 묶음`}
        </p>
      </GlassCard>

      {/* 에베레스트 SVG */}
      <div className="relative glass rounded-2xl overflow-hidden">
        <svg viewBox="0 0 800 620" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          {/* 하늘 그라데이션 */}
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c1929" />
              <stop offset="40%" stopColor="#1a2744" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
            <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8edf2" />
              <stop offset="100%" stopColor="#8a9bb0" />
            </linearGradient>
            <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b7d8e" />
              <stop offset="100%" stopColor="#3d4f5e" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 배경 하늘 */}
          <rect width="800" height="620" fill="url(#sky)" />

          {/* 별 */}
          {[
            [50, 30], [150, 55], [280, 20], [400, 45], [550, 15],
            [650, 40], [720, 25], [100, 70], [350, 60], [600, 50],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1} fill="white" opacity={0.4 + (i % 3) * 0.2} />
          ))}

          {/* 산 — 메인 에베레스트 (눈 덮인 피크) */}
          <polygon points="430,60 250,350 150,550 700,550 650,350 550,200" fill="url(#rock)" />
          <polygon points="430,60 300,250 200,450 660,450 600,280 520,170" fill="url(#snow)" opacity="0.5" />
          <polygon points="430,60 350,180 280,300 580,300 520,180" fill="white" opacity="0.3" />

          {/* 산 — 로체 (오른쪽) */}
          <polygon points="650,100 580,300 550,500 750,500 730,250" fill="url(#rock)" opacity="0.7" />
          <polygon points="650,100 600,220 570,400 730,400 700,220" fill="url(#snow)" opacity="0.3" />

          {/* 산 — 왼쪽 능선 */}
          <polygon points="100,380 50,550 250,550 200,400 150,350" fill="url(#rock)" opacity="0.5" />

          {/* 빙하 / 쿰부 지역 (하단) */}
          <polygon points="80,520 120,540 300,530 400,550 200,560 50,560" fill="#4a6070" opacity="0.4" />

          {/* 등반 루트 — 전체 (점선, 회색) */}
          <path
            d={routePath}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* 등반 루트 — 완료 구간 (빨간 실선) */}
          {completedPoints.length > 1 && (
            <path
              d={completedPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* 캠프 마커 */}
          {ROUTE_POINTS.map((point, i) => {
            const camp = camps[i];
            const isCompleted = camp.allPassed;
            const isCurrent = i === currentCampIdx && !isCompleted;
            const isBelowStart = camp.camp < progress.startCamp;

            return (
              <g key={i}>
                {/* 캠프 삼각형 마커 */}
                <polygon
                  points={`${point[0]},${point[1] - 10} ${point[0] - 7},${point[1] + 4} ${point[0] + 7},${point[1] + 4}`}
                  fill={
                    isCompleted
                      ? "#22c55e"
                      : isCurrent
                        ? "#ef4444"
                        : isBelowStart
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.3)"
                  }
                  stroke={isCompleted ? "#16a34a" : isCurrent ? "#dc2626" : "rgba(255,255,255,0.2)"}
                  strokeWidth="1"
                />
                {/* 라벨 */}
                <text
                  x={point[0] + (i % 2 === 0 ? 14 : -14)}
                  y={point[1] - 2}
                  fill={isCompleted ? "#86efac" : isCurrent ? "#fca5a5" : "rgba(255,255,255,0.5)"}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor={i % 2 === 0 ? "start" : "end"}
                  fontFamily="system-ui"
                >
                  {camp.name}
                </text>
                <text
                  x={point[0] + (i % 2 === 0 ? 14 : -14)}
                  y={point[1] + 9}
                  fill={isCurrent ? "#fca5a5" : "rgba(255,255,255,0.35)"}
                  fontSize="7"
                  textAnchor={i % 2 === 0 ? "start" : "end"}
                  fontFamily="system-ui"
                >
                  {camp.altitude}
                  {isCompleted
                    ? " ✓ CLEAR"
                    : camp.passedCount > 0
                      ? ` (${camp.passedCount}/${GROUPS_PER_LEVEL})`
                      : ""}
                </text>
              </g>
            );
          })}

          {/* 현재 위치 — 등산객 캐릭터 */}
          {!reachedSummit && (
            <g>
              {/* 발 아래 위치 표시 */}
              <circle cx={currentPos[0]} cy={currentPos[1]} r="5" fill="#ef4444" opacity="0.15" />
              {/* 등산객 본체 */}
              <g transform={`translate(${currentPos[0]}, ${currentPos[1]})`}>
                {/* 몸통 + 배낭 */}
                <rect x="-3" y="-18" width="6" height="10" rx="2" fill="#f97316" />
                <rect x="3" y="-17" width="4" height="8" rx="1" fill="#78350f" />
                {/* 머리 + 모자 */}
                <circle cx="0" cy="-22" r="4" fill="#fcd34d" />
                <rect x="-5" y="-27" width="10" height="3" rx="1" fill="#dc2626" />
                {/* 다리 */}
                <line x1="-1" y1="-8" x2={isClimbing ? undefined : "-3"} y2="0" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round">
                  {isClimbing && <animate attributeName="x2" values="-4;0;-4" dur="0.5s" repeatCount="6" />}
                  {!isClimbing && <set attributeName="x2" to="-3" />}
                </line>
                <line x1="1" y1="-8" x2={isClimbing ? undefined : "3"} y2="0" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round">
                  {isClimbing && <animate attributeName="x2" values="4;0;4" dur="0.5s" repeatCount="6" />}
                  {!isClimbing && <set attributeName="x2" to="3" />}
                </line>
                {/* 등산 스틱 */}
                <line x1="-3" y1="-15" x2={isClimbing ? undefined : "-7"} y2="-2" stroke="#a8a29e" strokeWidth="1">
                  {isClimbing && <animate attributeName="x2" values="-8;-4;-8" dur="0.5s" repeatCount="6" />}
                  {!isClimbing && <set attributeName="x2" to="-7" />}
                </line>
                <line x1="3" y1="-15" x2={isClimbing ? undefined : "7"} y2="-2" stroke="#a8a29e" strokeWidth="1">
                  {isClimbing && <animate attributeName="x2" values="8;4;8" dur="0.5s" repeatCount="6" />}
                  {!isClimbing && <set attributeName="x2" to="7" />}
                </line>
              </g>
            </g>
          )}

          {/* Summit 깃발 (도달 시) */}
          {reachedSummit && (
            <g>
              <line x1="430" y1="60" x2="430" y2="35" stroke="white" strokeWidth="1.5" />
              <polygon points="430,35 455,42 430,49" fill="#ef4444" />
              <text x="430" y="28" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">
                SUMMIT!
              </text>
            </g>
          )}

          {/* Summit — 두 팔 벌린 등산객 (깃발 옆) */}
          {reachedSummit && (
            <g transform="translate(445, 60)">
              <rect x="-3" y="-18" width="6" height="10" rx="2" fill="#f97316" />
              <rect x="3" y="-17" width="4" height="8" rx="1" fill="#78350f" />
              <circle cx="0" cy="-22" r="4" fill="#fcd34d" />
              <rect x="-5" y="-27" width="10" height="3" rx="1" fill="#dc2626" />
              <line x1="-3" y1="-15" x2="-10" y2="-28" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="x2" values="-10;-12;-10" dur="0.8s" repeatCount="indefinite" />
              </line>
              <line x1="3" y1="-15" x2="10" y2="-28" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="x2" values="10;12;10" dur="0.8s" repeatCount="indefinite" />
              </line>
              <line x1="-1" y1="-8" x2="-3" y2="0" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="-8" x2="3" y2="0" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </div>

      {/* 하단 캠프 진도 요약 */}
      <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-1.5">
        {camps.map((camp) => {
          const pct = camp.passedCount / GROUPS_PER_LEVEL;
          const isCurrent = camp.camp - 1 === currentCampIdx;
          return (
            <div
              key={camp.camp}
              className={`text-center p-1.5 rounded-lg ${
                camp.allPassed
                  ? "bg-green-500/20"
                  : isCurrent
                    ? "bg-red-500/20"
                    : "bg-white/5"
              }`}
            >
              <p className="text-[10px] font-bold">
                {camp.camp === 10 ? "SUM" : `C${camp.camp}`}
              </p>
              <div className="h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    camp.allPassed ? "bg-green-500" : isCurrent ? "bg-red-500" : "bg-white/20"
                  }`}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
              <p className="text-[8px] text-muted mt-0.5">
                {camp.passedCount}/{GROUPS_PER_LEVEL}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
