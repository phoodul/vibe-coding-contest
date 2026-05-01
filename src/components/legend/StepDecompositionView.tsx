/**
 * Phase G-06 — 단계 분해 시각화.
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §5.1 (PerProblemStep).
 *   - pivotal step: ★ 배지 + 좌측 굵은 보더 + glow
 *   - stuck step: ⚠ 배지
 *   - llm_struggle.step_ms 큰 step: 🔴 배지 (Δ3 hint, 본 시각화는 G06-20 LLMStruggleSection 에서 강조)
 *
 * G06-18: 본 구현 (Framer Motion staggered fade-up).
 */
'use client';

import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { MathText } from './MathText';
import type { PerProblemStep } from '@/lib/legend/types';

export interface StepDecompositionViewProps {
  steps: PerProblemStep[];
  pivotalStepIndex: number;
  /** 트리에서 노드 클릭 시 강조할 step */
  highlightedStepIndex?: number;
  onExpandStep?: (index: number) => void;
}

const STEP_KIND_LABEL: Record<PerProblemStep['kind'], string> = {
  parse: '문제 파악',
  domain_id: '영역 식별',
  forward: '순방향',
  backward: '역추적',
  tool_call: '도구 호출',
  computation: '계산',
  verify: '검증',
  answer: '답',
};

const STEP_KIND_TONE: Record<PerProblemStep['kind'], string> = {
  parse: 'text-sky-300',
  domain_id: 'text-sky-300',
  forward: 'text-emerald-300',
  backward: 'text-violet-300',
  tool_call: 'text-amber-300',
  computation: 'text-amber-300',
  verify: 'text-cyan-300',
  answer: 'text-yellow-300',
};

export function StepDecompositionView({
  steps,
  pivotalStepIndex,
  highlightedStepIndex,
  onExpandStep,
}: StepDecompositionViewProps): ReactElement {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-white/50">단계가 추출되지 않았습니다.</p>
    );
  }

  return (
    <ol className="space-y-2">
      {steps.map((step, i) => {
        const isPivotal = step.is_pivotal || i === pivotalStepIndex;
        const isHighlighted = highlightedStepIndex === step.index;
        const stuckMs = step.llm_struggle?.step_ms;
        const hasLlmStruggle = (stuckMs ?? 0) > 8000;

        return (
          <motion.li
            key={step.index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            onClick={() => onExpandStep?.(step.index)}
            className={cn(
              'group flex cursor-pointer items-start gap-3 rounded-md border border-white/10 bg-white/5 p-3 transition-colors',
              'hover:border-white/25 hover:bg-white/10',
              isPivotal &&
                'border-l-4 border-l-amber-400/80 bg-amber-400/10 shadow-[0_0_24px_rgba(251,191,36,0.15)]',
              isHighlighted && 'ring-2 ring-sky-400/60',
            )}
          >
            <span className="inline-flex h-6 min-w-[24px] shrink-0 items-center justify-center rounded-full border border-white/20 px-2 text-[11px] font-semibold text-white/80">
              {step.index + 1}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={cn('font-semibold', STEP_KIND_TONE[step.kind])}>
                  {STEP_KIND_LABEL[step.kind]}
                </span>
                {isPivotal && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                    ★ 핵심
                  </span>
                )}
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/60">
                  난이도 {step.difficulty}
                </span>
                {hasLlmStruggle && (
                  <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 text-[10px] text-rose-200">
                    🔴 AI {(stuckMs! / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-white/75">
                <MathText>{step.summary}</MathText>
              </p>
              {step.why_text && (
                <p className="mt-1 text-xs italic text-white/50">
                  <MathText>{step.why_text}</MathText>
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
