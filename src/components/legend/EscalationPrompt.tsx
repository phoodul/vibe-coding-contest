/**
 * Phase G-06 G06-20 — 라마누잔 막힘 시 escalation 인라인 메시지.
 *
 * 베이스: docs/architecture-g06-legend.md §4.1 (EscalationPrompt) + §6.
 * 3 선택지: escalate (다른 튜터) / retry (다시 풀기) / hint_only (힌트만).
 * Vibe: amber 톤 + Framer Motion fade-in + escalate 옵션은 legend quota 부족 시 disabled.
 */
'use client';

import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { getTutorLabelKo } from '@/lib/legend/portraits';
import type { EscalationPrompt as EscalationPromptData, TutorName } from '@/lib/legend/types';

export interface EscalationPromptProps {
  prompt: EscalationPromptData;
  onChoose: (kind: 'escalate' | 'retry' | 'hint_only', targetTutor?: TutorName) => void;
  /** legend_call_daily 잔여. escalate 옵션 활성화 판단. 미지정 시 비활성화 검사 X. */
  remainingLegendQuota?: number;
}

const SIGNAL_LABEL: Record<'sympy_fail' | 'stuck_token', string> = {
  sympy_fail: 'SymPy 검증 실패',
  stuck_token: '막힘 신호',
};

export function EscalationPrompt({
  prompt,
  onChoose,
  remainingLegendQuota,
}: EscalationPromptProps): ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'legend-escalation space-y-3 rounded-lg border border-amber-300/40 bg-amber-400/10 p-4',
        'backdrop-blur-sm',
      )}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl leading-none">
          🤔
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-amber-100">{prompt.message}</div>
          <div className="mt-1 text-[11px] text-amber-200/70">
            신호: {prompt.signals.map((s) => SIGNAL_LABEL[s] ?? s).join(', ')}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {prompt.options.map((opt) => {
          const isEscalate = opt.kind === 'escalate';
          const escalateBlocked =
            isEscalate && typeof remainingLegendQuota === 'number' && remainingLegendQuota <= 0;
          const targetLabel = opt.target_tutor ? getTutorLabelKo(opt.target_tutor) : null;

          return (
            <motion.button
              key={`${opt.kind}-${opt.target_tutor ?? 'none'}`}
              type="button"
              whileHover={escalateBlocked ? undefined : { y: -1 }}
              whileTap={escalateBlocked ? undefined : { scale: 0.98 }}
              onClick={() => onChoose(opt.kind, opt.target_tutor)}
              disabled={escalateBlocked}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-left text-sm text-white/90 transition-colors',
                'hover:border-white/25 hover:bg-white/10',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/10 disabled:hover:bg-white/5',
              )}
            >
              <span className="flex flex-col leading-tight">
                <span>{opt.label}</span>
                {isEscalate && targetLabel && (
                  <span className="text-[11px] text-white/55">→ {targetLabel}에게</span>
                )}
              </span>
              {isEscalate && typeof remainingLegendQuota === 'number' && (
                <span
                  className={cn(
                    'text-[11px] tabular-nums',
                    escalateBlocked ? 'text-rose-300/70' : 'text-amber-200/70',
                  )}
                >
                  레전드 잔여 {remainingLegendQuota}회
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
