import type { MindMapNode } from "./build-tree";

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  node: MindMapNode;
  parentId: string | null;
  parentX: number;
  parentY: number;
}

const RADIUS_BY_DEPTH = [0, 280, 240, 200, 170, 150, 130];

function getRadius(depth: number): number {
  return RADIUS_BY_DEPTH[Math.min(depth, RADIUS_BY_DEPTH.length - 1)];
}

/**
 * 확장된 노드를 기준으로 방사형 좌표를 계산한다.
 * expandedIds에 포함된 노드만 자식을 배치.
 * 깊이 0(루트)과 깊이 1(챕터)은 항상 보임.
 */
export function computeLayout(
  root: MindMapNode,
  expandedIds: Set<string>,
): LayoutNode[] {
  const result: LayoutNode[] = [];

  // 루트
  result.push({
    id: root.id,
    x: 0,
    y: 0,
    node: root,
    parentId: null,
    parentX: 0,
    parentY: 0,
  });

  // 깊이 1 (챕터) — 항상 표시
  layoutChildren(root, 0, 0, 0, Math.PI * 2, 1, expandedIds, result, true);

  return result;
}

function layoutChildren(
  parent: MindMapNode,
  px: number,
  py: number,
  startAngle: number,
  sweepAngle: number,
  depth: number,
  expandedIds: Set<string>,
  result: LayoutNode[],
  forceShow: boolean,
): void {
  const children = parent.children;
  if (children.length === 0) return;

  // 이 부모가 확장되었거나 forceShow인 경우에만 자식 배치
  if (!forceShow && !expandedIds.has(parent.id)) return;

  const r = getRadius(depth);
  const count = children.length;

  // 각 자식의 각도 계산
  // 루트(depth 0)의 자식(depth 1)은 360도 전체 사용
  // 그 외: 부모 방향 기준으로 sweep 배분
  const angleStep = sweepAngle / Math.max(count, 1);
  const baseAngle = startAngle - sweepAngle / 2 + angleStep / 2;

  for (let i = 0; i < count; i++) {
    const child = children[i];
    const angle = baseAngle + i * angleStep;
    const cx = px + r * Math.cos(angle);
    const cy = py + r * Math.sin(angle);

    result.push({
      id: child.id,
      x: cx,
      y: cy,
      node: child,
      parentId: parent.id,
      parentX: px,
      parentY: py,
    });

    // 자식의 자식 — sweep을 좁혀서 배치 (깊이가 깊을수록 좁아짐)
    const childSweep = Math.min(
      sweepAngle / count * 1.2,
      Math.PI * 0.8,
    );
    layoutChildren(child, cx, cy, angle, childSweep, depth + 1, expandedIds, result, false);
  }
}
