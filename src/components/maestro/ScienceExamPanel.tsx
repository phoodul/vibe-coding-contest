/**
 * 19차 Phase B5-d (2026-05-06) — Science Maestro 4 과목 수능 기출 selector.
 *
 * UI: variant (Ⅰ/Ⅱ) → 년도 (2017~2026) → 문제 번호 (1~20) → onSelect callback.
 * 학생이 선택한 metadata 가 채팅에 자동 prefill 되며, 학생은 PDF 페이지 캡쳐를
 * 채팅에 첨부하여 풀이 코칭을 시작.
 *
 * 정답 DB 는 사용자 직접 입력 (Excel) 후 별도 로더로 통합 — 본 컴포넌트는 metadata
 * 만 다룸. 정답 표시는 코칭 끝에 LLM 또는 정답 DB 둘 중 하나가 검증.
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Subject } from '@/lib/legend/types';
import { getScienceAnswer } from '@/lib/data/science-exam-answers';

const SCIENCE_SUBJECTS: ReadonlyArray<Subject> = [
  'earth-science',
  'biology',
  'physics',
  'chemistry',
];

const SUBJECT_LABEL: Record<string, string> = {
  'earth-science': '지구과학',
  biology: '생명과학',
  physics: '물리학',
  chemistry: '화학',
};

const YEARS = Array.from({ length: 10 }, (_, i) => 2026 - i); // 2026 → 2017
const NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1); // 1 → 20
const VARIANTS = ['I', 'II'] as const;

export interface ExamSelection {
  subject: Subject;
  variant: (typeof VARIANTS)[number];
  year: number;
  number: number;
}

interface ScienceExamPanelProps {
  /** 과목 (이미 페이지에서 fix). 학생이 다른 과목 선택은 대시보드에서. */
  subject: Subject;
  onSelect: (sel: ExamSelection) => void;
}

export function ScienceExamPanel({ subject, onSelect }: ScienceExamPanelProps) {
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>('I');
  const [year, setYear] = useState<number>(2026);
  const [number, setNumber] = useState<number | null>(null);

  if (!SCIENCE_SUBJECTS.includes(subject)) {
    return null;
  }

  const subjectLabel = SUBJECT_LABEL[subject];

  function handleNumberClick(n: number) {
    // 결측 정답 (= 문제 오류) 일 때 클릭 차단
    const ans = getScienceAnswer(subject, variant, year, n);
    if (ans === undefined) return;
    setNumber(n);
    onSelect({ subject, variant, year, number: n });
  }

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

        {/* Ⅰ / Ⅱ */}
        <div className="mb-3">
          <p className="mb-1 text-[11px] font-medium text-white/60">선택 과목</p>
          <div className="flex gap-1.5">
            {VARIANTS.map((v) => {
              const active = v === variant;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/40'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-emerald-300/30 hover:bg-emerald-400/5'
                  }`}
                >
                  {subjectLabel}
                  {v === 'I' ? 'Ⅰ' : 'Ⅱ'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 학년도 */}
        <div className="mb-3">
          <p className="mb-1 text-[11px] font-medium text-white/60">학년도</p>
          <div className="flex flex-wrap gap-1.5">
            {YEARS.map((y) => {
              const active = y === year;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
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
      </div>

      {/* 문제 번호 */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-white">
            {year}학년도 {subjectLabel}
            {variant === 'I' ? 'Ⅰ' : 'Ⅱ'} · 20문항
          </span>
          <span className="text-[10px] text-white/40">
            번호를 누르면 채팅에 문제 정보가 첨부돼요
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
          {NUMBERS.map((n, i) => {
            const active = n === number;
            const ans = getScienceAnswer(subject, variant, year, n);
            const isError = ans === undefined;
            return (
              <motion.button
                key={n}
                type="button"
                onClick={() => handleNumberClick(n)}
                disabled={isError}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.01 }}
                whileHover={isError ? undefined : { y: -1 }}
                whileTap={isError ? undefined : { scale: 0.95 }}
                className={`group relative aspect-square rounded-lg border text-sm font-bold transition-colors ${
                  isError
                    ? 'border-rose-400/30 bg-rose-500/5 text-rose-300/60 cursor-not-allowed'
                    : active
                      ? 'border-emerald-300/70 bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-emerald-300/30 hover:bg-emerald-400/5 hover:text-white'
                }`}
                title={isError ? `${n}번 — 문제 오류 (정답 없음)` : `${n}번`}
              >
                {isError ? '⚠' : n}
              </motion.button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-rose-300/60">
          ⚠ 표시는 출제 오류로 정답이 없는 문제입니다 (업로드 불가).
        </p>

        <p className="mt-3 text-[11px] text-white/50">
          PDF 보고 해당 문제 페이지를 화면 캡쳐 → 채팅창에 붙여넣으세요. maestro 가 함께 풀이를 코칭합니다.
        </p>
      </div>
    </div>
  );
}
