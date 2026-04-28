/**
 * Phase G-06 G06-20 — "AI도 어려웠던 순간" 섹션 (Δ3).
 *
 * 베이스: docs/architecture-g06-legend.md §6.1 + Δ3 카피.
 *   - hardest_step_index, hardest_step_ms, total_turns, total_tool_retries
 *   - resolution_narrative quote-style
 *   - hardest_step_ms < 1000ms 이면 노출 X (사소한 struggle 은 학생에 동질감 주기 어려움)
 *
 * Vibe: rose 톤 글래스 카드 + Framer Motion fade-in + quote-style left border.
 */
'use client';

import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { PerProblemReport } from '@/lib/legend/types';

export interface LLMStruggleSectionProps {
  llmStruggleSummary: PerProblemReport['llm_struggle_summary'];
  steps: PerProblemReport['steps'];
}

export function LLMStruggleSection({
  llmStruggleSummary,
  steps,
}: LLMStruggleSectionProps): ReactElement | null {
  // 사소한 struggle (1초 미만) 은 노출 X — Δ3 의 "동질감" 카피가 무색해짐
  if (!llmStruggleSummary || llmStruggleSummary.hardest_step_ms < 1000) {
    return null;
  }

  const hardestStep = steps[llmStruggleSummary.hardest_step_index];
  const hardestSec = (llmStruggleSummary.hardest_step_ms / 1000).toFixed(1);
  const reasoningChars = hardestStep?.llm_struggle?.reasoning_chars;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'legend-struggle rounded-lg border border-rose-400/30 bg-rose-500/5 p-4',
        'backdrop-blur-sm',
      )}
    >
      <div className="space-y-2 text-sm text-white/85">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-white/60">가장 까다로웠던 단계:</span>
          <strong className="font-semibold text-rose-100">
            {llmStruggleSummary.hardest_step_index + 1}단계
          </strong>
          <span className="text-rose-200/70">({hardestSec}초 소요)</span>
        </div>
        <div className="text-xs text-white/55">
          총 <span className="tabular-nums">{llmStruggleSummary.total_turns}</span> turn ·
          tool retry <span className="tabular-nums">{llmStruggleSummary.total_tool_retries}</span>회
          {typeof reasoningChars === 'number' && reasoningChars > 0 && (
            <>
              {' · '}reasoning <span className="tabular-nums">{reasoningChars.toLocaleString()}</span>자
            </>
          )}
        </div>
      </div>

      {llmStruggleSummary.resolution_narrative && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={cn(
            'mt-3 border-l-2 border-rose-400/50 pl-3 text-sm italic leading-relaxed text-rose-50/90',
          )}
        >
          {llmStruggleSummary.resolution_narrative}
        </motion.p>
      )}
    </motion.section>
  );
}
