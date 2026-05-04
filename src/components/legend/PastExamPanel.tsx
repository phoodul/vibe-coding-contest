'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  EXAM_YEARS,
  EXAM_TYPES,
  filterProblems,
  type MathProblem,
} from '@/lib/data/math-problems';
import problemTexts from '@/lib/data/problem-texts.json';

interface PastExamPanelProps {
  onSelectProblem: (problem: MathProblem) => void;
}

export function PastExamPanel({ onSelectProblem }: PastExamPanelProps) {
  const [year, setYear] = useState<number>(2026);
  const availableTypes = EXAM_TYPES[year] ?? [];
  const [examType, setExamType] = useState<string>(availableTypes[0] ?? '');

  // 연도 변경 시 그 해의 첫 type 자동 선택
  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    const types = EXAM_TYPES[nextYear] ?? [];
    if (!types.includes(examType)) {
      setExamType(types[0] ?? '');
    }
  }

  const problems = useMemo(
    () => filterProblems({ year, type: examType }),
    [year, examType],
  );

  const texts = problemTexts as Record<string, string>;
  const hasTextsCount = problems.filter(
    (p) => texts[`${p.year}_${p.type}_${p.number}`],
  ).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-amber-300/90">📜</span>
          <span className="text-sm font-semibold text-white">수능 기출 연습</span>
          <span className="text-[10px] text-white/40">
            2017~2026 학년도 · 정답은 학생에게 노출되지 않아요
          </span>
        </div>

        {/* 연도 선택 */}
        <div className="mb-3">
          <p className="mb-1 text-[11px] font-medium text-white/60">학년도</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAM_YEARS.map((y) => {
              const active = y === year;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleYearChange(y)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-amber-300/60 bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/40'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-amber-300/30 hover:bg-amber-400/5'
                  }`}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </div>

        {/* 과목/유형 선택 */}
        <div>
          <p className="mb-1 text-[11px] font-medium text-white/60">과목/유형</p>
          <div className="flex flex-wrap gap-1.5">
            {availableTypes.map((t) => {
              const active = t === examType;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setExamType(t)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-violet-300/60 bg-violet-400/15 text-violet-100 ring-1 ring-violet-300/40'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-violet-300/30 hover:bg-violet-400/5'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 문제 리스트 */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-white">
            {year}학년도 {examType} · {problems.length}문항
          </span>
          {hasTextsCount > 0 && (
            <span className="text-[10px] text-white/40">
              원문 보유 {hasTextsCount}/{problems.length}
            </span>
          )}
        </div>

        {problems.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/50">
            해당 시험지의 문제가 없어요.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
            {problems.map((p, i) => {
              const hasText = !!texts[`${p.year}_${p.type}_${p.number}`];
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProblem(p)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.01 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative aspect-square rounded-lg border text-sm font-bold transition-colors ${
                    hasText
                      ? 'border-amber-300/40 bg-amber-400/10 text-amber-100 hover:border-amber-300/70 hover:bg-amber-400/20'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10'
                  }`}
                  title={
                    hasText
                      ? `${p.number}번 (${p.isMultipleChoice ? '객관식' : '주관식'})`
                      : `${p.number}번 — 원문 없음, 채팅으로 전송 가능`
                  }
                >
                  {p.number}
                  {!p.isMultipleChoice && (
                    <span className="absolute right-0.5 top-0.5 text-[8px] text-white/40">
                      주
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
