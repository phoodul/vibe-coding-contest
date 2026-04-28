/**
 * Phase G-06 — 같은 trigger 가진 다른 도구·예제 추천.
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §5.1 (TriggerCard 확장).
 *   - primary trigger 1 + expansions max 3
 *   - 학생이 "같은 발동 조건의 다른 도구" 를 즉시 발견하도록 카드 그리드
 *
 * G06-18: 본 구현. Framer Motion staggered fade.
 */
'use client';

import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { TriggerCard } from '@/lib/legend/types';

export interface TriggerExpansionCardProps {
  primary: TriggerCard;
  expansions: TriggerCard[];
  onExpandTrigger?: (triggerId: string) => void;
}

const DIRECTION_LABEL: Record<TriggerCard['direction'], string> = {
  forward: '순방향',
  backward: '역방향',
  both: '양방향',
};

export function TriggerExpansionCard({
  primary,
  expansions,
  onExpandTrigger,
}: TriggerExpansionCardProps): ReactElement {
  return (
    <div className="space-y-3">
      {/* Primary */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            핵심 trigger
          </span>
          <span className="rounded-full border border-amber-300/40 px-2 py-0.5 text-[10px] text-amber-200">
            {DIRECTION_LABEL[primary.direction]}
          </span>
        </div>
        <div className="mt-1 text-base font-semibold text-white">{primary.tool_name}</div>
        <p className="mt-1 text-sm text-white/75">{primary.pattern_short}</p>
        {primary.why_text && (
          <p className="mt-2 text-sm italic text-white/65">왜? {primary.why_text}</p>
        )}
        {primary.example_problem_ref && (
          <p className="mt-2 text-xs text-amber-200/80">
            예: {primary.example_problem_ref.year}년 {primary.example_problem_ref.type}{' '}
            {primary.example_problem_ref.number}번
          </p>
        )}
      </motion.div>

      {/* Expansions */}
      {expansions.length > 0 && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {expansions.map((card, i) => (
            <motion.button
              key={card.trigger_id}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
              whileHover={{ y: -2 }}
              onClick={() => onExpandTrigger?.(card.trigger_id)}
              className={cn(
                'flex flex-col gap-1 rounded-md border border-white/10 bg-white/5 p-3 text-left transition-colors',
                'hover:border-white/25 hover:bg-white/10',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{card.tool_name}</span>
                <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[9px] text-white/55">
                  {DIRECTION_LABEL[card.direction]}
                </span>
              </div>
              <span className="text-xs text-white/60">{card.pattern_short}</span>
              {card.example_problem_ref && (
                <span className="mt-1 text-[10px] text-sky-300">
                  {card.example_problem_ref.year}년 {card.example_problem_ref.type}{' '}
                  {card.example_problem_ref.number}번
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
