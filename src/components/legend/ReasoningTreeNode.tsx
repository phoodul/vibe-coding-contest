/**
 * Phase G-06 — ReasoningTreeView 커스텀 노드 (Δ4).
 *
 * 베이스: docs/architecture-g06-legend.md §6.
 * 5종 kind 별 색상·라벨·icon + 강조 신호 (pivotal=★ / student_stuck=⚠ / llm_struggle=🔴).
 *
 * G06-19 신규.
 */
'use client';

import { Handle, Position } from '@xyflow/react';
import type { ReasoningTreeNode as TreeNodeData } from '@/lib/legend/types';

const KIND_LABELS: Record<TreeNodeData['kind'], { label: string; color: string; bg: string }> = {
  answer: { label: '답', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  goal: { label: '목표', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  subgoal: { label: '소목표', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  derived_fact: { label: '유도', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  condition: { label: '조건', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
};

export function ReasoningTreeNode({ data }: { data: TreeNodeData }) {
  const cfg = KIND_LABELS[data.kind];
  const hasStuck = (data.student_stuck_ms ?? 0) > 5000;
  const hasStruggle = (data.llm_struggle_ms ?? 0) > 3000;

  return (
    <div
      className="px-3 py-2 rounded-lg border-2 min-w-[160px] max-w-[200px] text-xs transition cursor-pointer"
      style={{
        borderColor: data.is_pivotal ? '#f59e0b' : cfg.color,
        background: cfg.bg,
        boxShadow: data.is_pivotal ? '0 0 0 2px rgba(245,158,11,0.3)' : 'none',
        color: '#e2e8f0',
      }}
    >
      <Handle type="target" position={Position.Bottom} style={{ visibility: 'hidden' }} />
      <div className="flex items-center gap-1 mb-1">
        <span className="font-semibold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        {data.is_pivotal && (
          <span title="핵심 단계" aria-label="핵심 단계">
            ★
          </span>
        )}
        {hasStuck && (
          <span title="학생 막힘" aria-label="학생 막힘">
            ⚠
          </span>
        )}
        {hasStruggle && (
          <span title="AI 어려움" aria-label="AI 어려움">
            🔴
          </span>
        )}
      </div>
      <div className="font-medium leading-tight line-clamp-2 text-white/90">{data.label}</div>
      {data.text && data.text !== data.label && (
        <div className="text-white/55 mt-1 line-clamp-2 text-[10px]">{data.text.slice(0, 60)}</div>
      )}
      <Handle type="source" position={Position.Top} style={{ visibility: 'hidden' }} />
    </div>
  );
}
