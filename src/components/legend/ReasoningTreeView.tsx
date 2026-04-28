/**
 * Phase G-06 — ToT 추론 트리 시각화 (Δ4).
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §9.7.
 * React Flow + dagre auto-layout (rankdir BT — 답이 위, 조건이 아래).
 * 노드 종류 5종: answer / goal / subgoal / derived_fact / condition.
 *
 * preview=true (기본 PerProblemReportCard 메인): depth ≤ LEGEND_TREE_DEPTH_PREVIEW (3) 만 렌더 + "전체 트리 펼쳐보기" CTA.
 * preview=false (FullscreenModal): 전체 트리 + Controls + MiniMap.
 *
 * G06-19 본 구현.
 */
'use client';

import { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { ReasoningTreeNode as TreeNodeComponent } from './ReasoningTreeNode';
import { ReasoningTreeFullscreenModal } from './ReasoningTreeFullscreenModal';
import type { ReasoningTree, ReasoningTreeNode as TreeNodeData } from '@/lib/legend/types';

const PREVIEW_DEPTH = parseInt(
  process.env.NEXT_PUBLIC_LEGEND_TREE_DEPTH_PREVIEW ?? '3',
  10,
);
const COLLAPSE_THRESHOLD = parseInt(
  process.env.NEXT_PUBLIC_LEGEND_TREE_COLLAPSE_NODE_THRESHOLD ?? '30',
  10,
);

const NODE_TYPES: NodeTypes = { reasoning: TreeNodeComponent };

export interface ReasoningTreeViewProps {
  tree: ReasoningTree;
  /** 노드 클릭 → 부모가 StepDecompositionView 의 step 강조 */
  onNodeClick?: (stepIndex: number) => void;
  /** true 면 depth ≤ LEGEND_TREE_DEPTH_PREVIEW (기본 3) 만 렌더, fullscreen 모달 진입 시 false */
  preview?: boolean;
}

export function ReasoningTreeView({
  tree,
  onNodeClick,
  preview = false,
}: ReasoningTreeViewProps) {
  const [fullscreen, setFullscreen] = useState(false);

  // preview 시 depth ≤ PREVIEW_DEPTH 노드만 필터
  const filteredTree = useMemo<ReasoningTree>(() => {
    if (!preview) return tree;
    const visibleIds = new Set(
      tree.nodes.filter((n) => n.depth <= PREVIEW_DEPTH).map((n) => n.id),
    );
    return {
      ...tree,
      nodes: tree.nodes.filter((n) => visibleIds.has(n.id)),
      edges: tree.edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
      node_count: visibleIds.size,
    };
  }, [tree, preview]);

  // dagre auto-layout (rankdir BT — 답이 위, 조건이 아래)
  const { nodes, edges } = useMemo(() => layoutWithDagre(filteredTree), [filteredTree]);

  const handleNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const stepIdx = (node.data as unknown as TreeNodeData).step_index;
      if (stepIdx !== undefined) onNodeClick?.(stepIdx);
    },
    [onNodeClick],
  );

  const collapsed = filteredTree.node_count >= COLLAPSE_THRESHOLD;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div
        className={`legend-tree ${preview ? 'h-[280px]' : 'h-[600px]'} rounded-lg border border-white/10 overflow-hidden bg-white/[0.03] backdrop-blur-sm`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1.5} />
          {!preview && <Controls showInteractive={false} />}
          {!preview && (
            <MiniMap
              nodeColor={(n) => getNodeColor((n.data as unknown as TreeNodeData).kind)}
              pannable
              zoomable
            />
          )}
        </ReactFlow>
      </div>

      {preview && (
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="mt-2 w-full text-sm py-2 rounded-md border border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.08] hover:border-white/20 transition"
        >
          전체 트리 펼쳐보기 →
        </button>
      )}

      {fullscreen && (
        <ReasoningTreeFullscreenModal
          tree={tree}
          onClose={() => setFullscreen(false)}
          onNodeClick={onNodeClick}
        />
      )}

      {collapsed && preview && (
        <div className="text-[11px] text-white/45 mt-1">
          큰 트리 ({filteredTree.node_count} 노드) — 풀스크린 권장
        </div>
      )}
    </motion.div>
  );
}

function layoutWithDagre(tree: ReasoningTree): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'BT', nodesep: 60, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  // dagre 노드 등록
  tree.nodes.forEach((n) => g.setNode(n.id, { width: 180, height: 60 }));
  tree.edges.forEach((e) => g.setEdge(e.from, e.to));

  dagre.layout(g);

  const nodes: Node[] = tree.nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      id: n.id,
      type: 'reasoning',
      position: { x: pos?.x ?? 0, y: pos?.y ?? 0 },
      data: { ...n } as unknown as Record<string, unknown>,
    };
  });

  const edges: Edge[] = tree.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.from,
    target: e.to,
    type: 'smoothstep',
    animated: e.kind === 'requires',
    style: {
      stroke: e.kind === 'requires' ? '#a78bfa' : '#94a3b8',
      strokeWidth: 1.5,
    },
    label: e.kind === 'requires' ? '필요' : '도출',
    labelStyle: { fontSize: 10, fill: '#94a3b8' },
  }));

  return { nodes, edges };
}

function getNodeColor(kind: TreeNodeData['kind']): string {
  switch (kind) {
    case 'answer':
      return '#f59e0b'; // amber (root)
    case 'goal':
      return '#3b82f6'; // blue
    case 'subgoal':
      return '#a78bfa'; // violet
    case 'derived_fact':
      return '#10b981'; // emerald
    case 'condition':
      return '#64748b'; // slate
    default:
      return '#94a3b8';
  }
}
