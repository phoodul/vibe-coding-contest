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

// Δ16 — direction 메타 표기 ("양방향"/"순방향"/"역방향") 제거.
// 사용자 보고: 학생에게 "양방향" 같은 추상적 메타는 의미 없음. trigger 의 본질은
// "이 문제에서 왜 이 도구를 떠올려야 하는가" 의 구체적 인과 사슬이며, 그 역할은
// student_struggle.trigger_quote / solution_summary.trigger_motivation 이 담당.

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
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
          핵심 trigger
        </span>
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
              <span className="text-sm font-semibold text-white">{card.tool_name}</span>
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
