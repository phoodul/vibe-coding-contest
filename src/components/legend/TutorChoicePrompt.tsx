/**
 * Phase G-06 G06-26 (Δ5) — TutorChoicePrompt: 라우팅 결과 직후 격 차별화 카드.
 *
 * 베이스 문서: docs/project-decisions.md Δ5 (격 차별화 UI 방안 A — 카운트다운).
 * 흐름:
 *   1. routeProblem 완료 → routed_tutor (default 라마누잔) 표시
 *   2. countdownSec (default 3초) 카운트다운 → 자동 onAutoProceed
 *   3. 카운트다운 중 4 거장 카드 클릭 → onChooseLegend(tutor) 즉시 발화
 *   4. 호버 → 카운트다운 일시정지 (학생이 읽을 시간 확보)
 *   5. legend_call_daily quota 부족 시 거장 카드 disabled
 *
 * 영향 격리: 본 컴포넌트는 G06-21 의 /legend/page.tsx (현재 /euler-tutor re-export) 통합
 * 미수행 — 단순 컴포넌트 + portraits.ts 의 tier_label 추가만. 통합은 G-07 callTutor 위임 시점.
 *
 * Vibe: 다크 글래스 + ring + Framer Motion fadeUp + 호버 lift + 카운트다운 pulse.
 */
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, type ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { TutorBadge } from './TutorBadge';
import { PORTRAITS } from '@/lib/legend/portraits';
import type { TutorName } from '@/lib/legend/types';

const LEGEND_TUTORS: TutorName[] = ['gauss', 'von_neumann', 'euler', 'leibniz'];

export interface TutorChoicePromptProps {
  /** 라우팅 결과 (default 라마누잔, escalation 시 거장 가능) */
  routedTutor: TutorName;
  difficulty: number;
  area: string;
  /** 오늘 남은 문제 수 (problem_total_daily) */
  remainingProblem: number;
  /** 오늘 남은 레전드 호출 수 (legend_call_daily) */
  remainingLegend: number;
  /** 카운트다운 초 (default 3) */
  countdownSec?: number;
  /** 카운트다운 만료 → routed_tutor 로 진행 */
  onAutoProceed: () => void;
  /** 거장 카드 클릭 → 즉시 레전드 호출 */
  onChooseLegend: (tutor: TutorName) => void;
  /** 학생이 일시정지 후 취소 (옵션) */
  onCancel?: () => void;
  className?: string;
}

export function TutorChoicePrompt({
  routedTutor,
  difficulty,
  area,
  remainingProblem,
  remainingLegend,
  countdownSec = 3,
  onAutoProceed,
  onChooseLegend,
  onCancel,
  className,
}: TutorChoicePromptProps): ReactElement {
  const [remaining, setRemaining] = useState(countdownSec);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (paused || done) return;
    if (remaining <= 0) {
      setDone(true);
      onAutoProceed();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, paused, done, onAutoProceed]);

  const routedLabel = PORTRAITS[routedTutor].label_ko;
  const legendBlocked = remainingLegend <= 0 || remainingProblem <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        'space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl',
        'shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]',
        className,
      )}
      data-testid="tutor-choice-prompt"
    >
      {/* 1. 라우팅 결과 (default 라마누잔) */}
      <div className="flex items-center gap-3">
        <TutorBadge tutor={routedTutor} size="md" />
        <div className="ml-auto flex flex-col items-end gap-1 text-right">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
            {PORTRAITS[routedTutor].tier_label}
          </span>
          <span className="text-[11px] text-white/55">
            난이도 {difficulty} · {area}
          </span>
          <span className="text-[11px] text-white/55">
            오늘 남은 문제 <strong className="text-white/85 tabular-nums">{remainingProblem}</strong>/5
          </span>
        </div>
      </div>

      {/* 2. 격 차별화 — "거장에게도?" 권유 */}
      <div className="border-t border-white/10 pt-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-amber-300/90">⭐</span>
          <span className="text-sm font-semibold text-white">고난도 문제라면 거장에게도?</span>
        </div>
        <p className="mb-3 text-[11px] text-white/55">
          거장 4명은 고난도 전문 — 오늘 남은 호출{' '}
          <strong className="tabular-nums text-amber-200/90">{remainingLegend}</strong>/3
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {LEGEND_TUTORS.map((t) => {
            const portrait = PORTRAITS[t];
            return (
              <motion.button
                key={t}
                type="button"
                whileHover={legendBlocked ? undefined : { y: -2 }}
                whileTap={legendBlocked ? undefined : { scale: 0.97 }}
                onClick={() => {
                  setPaused(true);
                  setDone(true);
                  onChooseLegend(t);
                }}
                disabled={legendBlocked}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 transition-colors',
                  'hover:border-amber-300/40 hover:bg-amber-400/5',
                  'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-white/5',
                )}
                data-testid={`legend-button-${t}`}
              >
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  width={44}
                  height={44}
                  sizes="44px"
                  className="rounded-full object-cover ring-2 ring-white/10"
                />
                <span className="text-xs font-medium text-white">{portrait.label_ko}</span>
                <span className="text-[10px] leading-tight text-white/50">{portrait.persona_desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. 카운트다운 + 진행 */}
      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <div className="text-sm text-white/85">
          {paused ? (
            <span className="text-white/55">⏸ 일시 정지</span>
          ) : done ? (
            <span className="text-white/55">진행 중…</span>
          ) : (
            <>
              {routedLabel}으로 진행 —{' '}
              <strong className="tabular-nums text-white">{remaining}초</strong> 후 자동
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {paused && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-2 py-1 text-xs text-white/55 transition-colors hover:bg-white/5 hover:text-white/85"
            >
              취소
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setPaused(false);
              setDone(true);
              onAutoProceed();
            }}
            disabled={done}
            className={cn(
              'rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors',
              'hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50',
            )}
            data-testid="proceed-button"
          >
            바로 진행 →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
