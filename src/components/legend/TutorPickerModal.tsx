/**
 * Phase G-06 G06-20 — 같은 문제 다른 튜터 호출 모달.
 *
 * 베이스: docs/architecture-g06-legend.md §6.
 *   - 4 legend (가우스/폰노이만/오일러/라이프니츠) + 라마누잔 카드 grid
 *   - 각 카드: TutorBadge + 한 줄 설명 + "호출 시 quota -1" 표시
 *   - quota 부족 시 disabled (problem_total / legend_call 분리)
 *   - currentTutor 는 grid 에서 제외 (같은 튜터 재호출 X)
 *
 * Vibe: glass backdrop + scale-in + ESC 닫기 + outside click 닫기.
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, type ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { PORTRAITS } from '@/lib/legend/portraits';
import type { QuotaStatus, TutorName } from '@/lib/legend/types';

const TUTOR_ORDER: TutorName[] = [
  'ramanujan_intuit',
  'gauss',
  'von_neumann',
  'euler',
  'leibniz',
];

const LEGEND_TUTORS: ReadonlySet<TutorName> = new Set([
  'gauss',
  'von_neumann',
  'euler',
  'leibniz',
]);

export interface TutorPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** 현재 풀이 튜터 — picker grid 에서 제외 */
  currentTutor?: TutorName;
  quotas: QuotaStatus[];
  onPickTutor: (tutor: TutorName) => void;
}

function getQuota(quotas: QuotaStatus[], kind: QuotaStatus['kind']): QuotaStatus | undefined {
  return quotas.find((q) => q.kind === kind);
}

function remaining(q: QuotaStatus | undefined): number | undefined {
  if (!q) return undefined;
  if (q.limit < 0) return Infinity;
  return Math.max(q.limit - q.used, 0);
}

export function TutorPickerModal({
  open,
  onClose,
  currentTutor,
  quotas,
  onPickTutor,
}: TutorPickerModalProps): ReactElement | null {
  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const problemQuota = getQuota(quotas, 'problem_total_daily');
  const legendQuota = getQuota(quotas, 'legend_call_daily');
  const remainingProblem = remaining(problemQuota);
  const remainingLegend = remaining(legendQuota);

  const fmtRemaining = (n: number | undefined): string =>
    n === undefined ? '?' : n === Infinity ? '∞' : String(n);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md md:items-center md:p-12"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="다른 거장 선택"
        >
          <motion.div
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]',
              'backdrop-blur-xl',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">다른 거장에게 묻기</h2>
                <p className="mt-0.5 text-xs text-white/55">
                  남은 문제 <span className="tabular-nums">{fmtRemaining(remainingProblem)}</span>회
                  · 레전드 <span className="tabular-nums">{fmtRemaining(remainingLegend)}</span>회
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="rounded-md px-2 py-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* 카드 grid */}
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
              {TUTOR_ORDER.filter((t) => t !== currentTutor).map((tutor, idx) => {
                const portrait = PORTRAITS[tutor];
                const isLegend = LEGEND_TUTORS.has(tutor);
                // 라마누잔(직관) 은 problem_total_daily 만, legend 4명은 legend_call_daily + problem_total_daily 둘 다 차감
                const blocked = isLegend
                  ? (remainingLegend ?? 0) <= 0 || (remainingProblem ?? 0) <= 0
                  : (remainingProblem ?? 0) <= 0;

                return (
                  <motion.button
                    key={tutor}
                    type="button"
                    whileHover={blocked ? undefined : { y: -2 }}
                    whileTap={blocked ? undefined : { scale: 0.98 }}
                    onClick={() => {
                      onPickTutor(tutor);
                      onClose();
                    }}
                    disabled={blocked}
                    className={cn(
                      'group flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors',
                      'hover:border-white/30 hover:bg-white/10',
                      'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-white/5',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={portrait.src}
                        alt={portrait.alt}
                        width={48}
                        height={48}
                        priority={idx === 0}
                        sizes="48px"
                        className="rounded-full object-cover ring-2 ring-white/15"
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-white">{portrait.label_ko}</span>
                        <span className="text-[11px] text-white/55">{portrait.persona_desc}</span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]',
                        isLegend
                          ? 'border-amber-300/40 bg-amber-400/10 text-amber-100'
                          : 'border-sky-400/40 bg-sky-400/10 text-sky-100',
                      )}
                    >
                      {isLegend ? '레전드 1회 + 문제 1회 소진' : '문제 1회 소진'}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
