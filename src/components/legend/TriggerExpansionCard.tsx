/**
 * Phase G-06 — 같은 trigger 가진 다른 도구·예제 추천.
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §5.1 (TriggerCard 확장).
 * primary trigger + max 3 expansions.
 *
 * G06-17: stub. G06-18 에서 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { TriggerCard } from '@/lib/legend/types';

export interface TriggerExpansionCardProps {
  primary: TriggerCard;
  expansions: TriggerCard[];
  onExpandTrigger?: (triggerId: string) => void;
}

export function TriggerExpansionCard(_props: TriggerExpansionCardProps): ReactElement {
  return (
    <div className="legend-trigger rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/60">TODO: G06-18 에서 TriggerExpansionCard 구현</p>
    </div>
  );
}
