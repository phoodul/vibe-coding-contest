/**
 * Phase G-06 — 단계 분해 시각화.
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §5.1 (PerProblemStep).
 * pivotal step boxShadow + ★ 배지, stuck step ⚠ 배지.
 *
 * G06-17: stub. G06-18 에서 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { PerProblemStep } from '@/lib/legend/types';

export interface StepDecompositionViewProps {
  steps: PerProblemStep[];
  pivotalStepIndex: number;
  /** 트리에서 노드 클릭 시 강조할 step */
  highlightedStepIndex?: number;
  onExpandStep?: (index: number) => void;
}

export function StepDecompositionView(_props: StepDecompositionViewProps): ReactElement {
  return (
    <div className="legend-steps rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/60">TODO: G06-18 에서 step decomposition 구현</p>
    </div>
  );
}
