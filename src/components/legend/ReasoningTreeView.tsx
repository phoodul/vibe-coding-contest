/**
 * Phase G-06 — ToT 추론 트리 시각화 (Δ4).
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §9.7.
 * React Flow + dagre auto-layout. 노드 종류 5종 (goal/subgoal/condition/derived_fact/answer).
 *
 * G06-17: stub. G06-19 에서 dynamic import + dagre + ReasoningTreeNode 커스텀 노드 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { ReasoningTree } from '@/lib/legend/types';

export interface ReasoningTreeViewProps {
  tree: ReasoningTree;
  /** 노드 클릭 → 부모가 StepDecompositionView 의 step 강조 */
  onNodeClick?: (stepIndex: number) => void;
  /** true 면 depth ≤ LEGEND_TREE_DEPTH_PREVIEW (기본 3) 만 렌더, fullscreen 모달 진입 시 false */
  preview?: boolean;
}

export function ReasoningTreeView(_props: ReasoningTreeViewProps): ReactElement {
  return (
    <div className="legend-tree rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/60">TODO: G06-19 에서 React Flow + dagre 트리 시각화 구현 (Δ4)</p>
    </div>
  );
}
