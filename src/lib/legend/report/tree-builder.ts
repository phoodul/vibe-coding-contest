/**
 * Phase G-06 G06-14 — chain step → ReasoningTree DAG 구축 (Δ4 ToT 시각화).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §5.1 (ReasoningTree schema) +
 *             §5.2 (tree-builder 알고리즘) + §3.3 (solve_reasoning_trees 스키마).
 *
 * 알고리즘 (의사코드 정확 구현):
 *   1. 문제 조건 추출 (parseConditions) — (가)(나)(다) / 조건 N: / N) 한국어 휴리스틱
 *   2. nodes/edges 초기화:
 *      - root: 'answer' (kind='answer', depth=0)
 *      - condition-N: depth=1 (root 아래 별도 그룹)
 *   3. step → tree node 변환:
 *      - forward    → derived_fact, edge(from=node, to=root, kind='derived_from')
 *      - backward   → subgoal, edge(root → node 'requires') + 인접 backward chain
 *      - tool_call  → derived_fact, 직전 backward subgoal 의 자식 (없으면 root 직접)
 *      - answer     → root 와 통합 (별도 노드 추가 안 함)
 *      - parse / domain_id / computation / verify → root 직속 fallback
 *   4. detectMultiParents — 같은 trigger_id 공유 노드 → 추가 entry edge
 *   5. computeDepth — root BFS 로 depth 계산 (역방향: requires + 정방향 derived_from 양쪽)
 *   6. collapse_hint — node_count ≥ LEGEND_TREE_COLLAPSE_NODE_THRESHOLD (default 30)
 *   7. solve_reasoning_trees insert (skipPersist=true 시 생략)
 *
 * 영향 격리: src/lib/legend/report/ 전용. types.ts 만 collapse_hint optional 추가.
 */

import { createClient } from '@/lib/supabase/server';
import type {
  PerProblemStep,
  ReasoningTree,
  ReasoningTreeNode,
  ReasoningTreeEdge,
} from '@/lib/legend/types';

const TREE_COLLAPSE_NODE_THRESHOLD = parseInt(
  process.env.LEGEND_TREE_COLLAPSE_NODE_THRESHOLD ?? '30',
  10,
);

// ────────────────────────────────────────────────────────────────────────────
// 한국어 수능 조건 패턴 추출
// ────────────────────────────────────────────────────────────────────────────

/**
 * 문제의 "조건 1·2·3..." 추출. 한국어 수능 정형 패턴 휴리스틱.
 *
 * 우선순위:
 *   1. "(가) ... (나) ... (다) ..." (수능 객관식 정형)
 *   2. "조건 1: ... 조건 2: ..." 명시적 라벨
 *   3. "1) ... 2) ..." / "1. ... 2. ..." 번호 매김
 *
 * 매칭 실패 시 빈 배열 (트리는 root + steps 만으로 정상 동작).
 */
export function parseConditions(problem: string): { idx: number; text: string }[] {
  if (!problem || !problem.trim()) return [];

  // 1. (가)(나)(다)(라)(마)(바) 패턴 — 내부 괄호(f(0) 등) 허용
  //    각 라벨 위치를 먼저 잡고 두 라벨 사이의 텍스트를 슬라이스.
  const ganadaOrder = ['가', '나', '다', '라', '마', '바', '사', '아'];
  const labelRe = /\(([가나다라마바사아])\)/g;
  const labelHits: { ch: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = labelRe.exec(problem)) !== null) {
    labelHits.push({ ch: m[1], start: m.index, end: m.index + m[0].length });
  }
  if (labelHits.length >= 2) {
    const ganadaMatches: { idx: number; text: string }[] = [];
    for (let i = 0; i < labelHits.length; i++) {
      const cur = labelHits[i];
      const next = labelHits[i + 1];
      const sliceEnd = next ? next.start : Math.min(problem.length, cur.end + 200);
      const txt = problem.slice(cur.end, sliceEnd).trim().replace(/\s+/g, ' ');
      if (txt) {
        ganadaMatches.push({
          idx: ganadaOrder.indexOf(cur.ch) + 1,
          text: txt.slice(0, 200),
        });
      }
    }
    if (ganadaMatches.length >= 2) return ganadaMatches.sort((a, b) => a.idx - b.idx);
  }

  // 2. "조건 N:" / "조건 N." / "조건 N -" 명시
  const labeled = /조건\s*(\d+)\s*[:：．\.\-]\s*([^\n조]+?)(?=\s*조건\s*\d+\s*[:：．\.\-]|$)/g;
  const labeledMatches: { idx: number; text: string }[] = [];
  while ((m = labeled.exec(problem)) !== null) {
    const i = parseInt(m[1], 10);
    const txt = m[2].trim().replace(/\s+/g, ' ');
    if (txt && i > 0) labeledMatches.push({ idx: i, text: txt.slice(0, 200) });
  }
  if (labeledMatches.length >= 2) return labeledMatches.sort((a, b) => a.idx - b.idx);

  // 3. "1) ... 2) ..." 또는 "1. ... 2. ..." (단, line 시작 또는 공백 직후)
  const numbered = /(?:^|\s)(\d+)[\)\.]\s+([^\n]+?)(?=\s+\d+[\)\.]\s+|$)/g;
  const numberedMatches: { idx: number; text: string }[] = [];
  while ((m = numbered.exec(problem)) !== null) {
    const i = parseInt(m[1], 10);
    const txt = m[2].trim().replace(/\s+/g, ' ');
    if (txt && i > 0 && i < 20) numberedMatches.push({ idx: i, text: txt.slice(0, 200) });
  }
  if (numberedMatches.length >= 2) return numberedMatches.sort((a, b) => a.idx - b.idx);

  return [];
}

// ────────────────────────────────────────────────────────────────────────────
// step kind → tree node kind 매핑
// ────────────────────────────────────────────────────────────────────────────

function mapStepKindToTreeKind(stepKind: PerProblemStep['kind']): ReasoningTreeNode['kind'] {
  switch (stepKind) {
    case 'answer':
      return 'answer';
    case 'backward':
      return 'subgoal';
    case 'forward':
      return 'derived_fact';
    case 'tool_call':
      return 'derived_fact';
    case 'parse':
    case 'domain_id':
      return 'goal';
    case 'computation':
    case 'verify':
      return 'derived_fact';
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 다중 부모 감지 — 같은 trigger_id 공유 시 추가 edge 연결
// ────────────────────────────────────────────────────────────────────────────

export function detectMultiParents(
  nodes: ReasoningTreeNode[],
  edges: ReasoningTreeEdge[],
): void {
  // 같은 trigger_id 보유 노드 그룹화
  const triggerToNodeIds = new Map<string, string[]>();
  for (const n of nodes) {
    if (!n.trigger_id) continue;
    if (!triggerToNodeIds.has(n.trigger_id)) triggerToNodeIds.set(n.trigger_id, []);
    triggerToNodeIds.get(n.trigger_id)!.push(n.id);
  }

  // 같은 trigger 노드가 2+ 개면 그룹 내 노드들끼리 derived_from 으로 연결 (시각적 합류)
  // 단순 구현: 첫 노드가 anchor, 나머지가 anchor → 합류 edge (중복 회피)
  const seenEdge = new Set<string>(edges.map((e) => `${e.from}|${e.to}|${e.kind}`));
  for (const ids of triggerToNodeIds.values()) {
    if (ids.length < 2) continue;
    const anchor = ids[0];
    for (let i = 1; i < ids.length; i++) {
      const key = `${ids[i]}|${anchor}|derived_from`;
      if (!seenEdge.has(key)) {
        edges.push({ from: ids[i], to: anchor, kind: 'derived_from' });
        seenEdge.add(key);
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// depth 계산 — root 부터 BFS
// ────────────────────────────────────────────────────────────────────────────

export function computeDepth(
  nodes: ReasoningTreeNode[],
  edges: ReasoningTreeEdge[],
  rootId: string,
): void {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const root = nodeMap.get(rootId);
  if (!root) return;
  root.depth = 0;

  // edge 양방향 인접 — root 의 자식은 (e.to===root) 또는 (e.from===root) 둘 다 가능
  // 'requires': from=root, to=subgoal → root 의 자식은 e.from===root 의 e.to (X) ...
  //   architecture: edges.from = 자식, edges.to = 부모 (필요한 대상)
  //   따라서 root 가 부모인 자식들 = e.to===root 인 e.from
  const childOf = (id: string): string[] =>
    edges.filter((e) => e.to === id).map((e) => e.from);

  const queue: string[] = [rootId];
  const visited = new Set<string>([rootId]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curDepth = nodeMap.get(cur)!.depth;
    for (const childId of childOf(cur)) {
      if (visited.has(childId)) continue;
      const child = nodeMap.get(childId);
      if (!child) continue;
      child.depth = curDepth + 1;
      visited.add(childId);
      queue.push(childId);
    }
  }

  // 미방문 노드는 root 직속 (depth 1) fallback — 고립 노드 방지
  for (const n of nodes) {
    if (n.depth < 0) n.depth = 1;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 진입점
// ────────────────────────────────────────────────────────────────────────────

export interface BuildReasoningTreeArgs {
  session_id: string;
  user_id: string;
  problem_text: string;
  steps: PerProblemStep[];
  /** 후속 backward chain 추출용 (현 구현은 미사용 — 향후 raw chain 활용 여지) */
  trace?: unknown;
}

export interface BuildReasoningTreeOptions {
  skipPersist?: boolean;
}

export async function buildReasoningTree(
  args: BuildReasoningTreeArgs,
  opts: BuildReasoningTreeOptions = {},
): Promise<ReasoningTree> {
  // 1. 문제 조건 추출
  const conditions = parseConditions(args.problem_text);

  const nodes: ReasoningTreeNode[] = [];
  const edges: ReasoningTreeEdge[] = [];

  // 2-1. root '답' 노드 (depth=0)
  const rootId = 'answer';
  const answerStep =
    args.steps.find((s) => s.kind === 'answer') ??
    (args.steps.length > 0 ? args.steps[args.steps.length - 1] : undefined);
  nodes.push({
    id: rootId,
    label: '답',
    text: answerStep?.summary ?? '최종 답',
    kind: 'answer',
    depth: -1,
    is_pivotal: !!answerStep?.is_pivotal,
    step_index: answerStep?.kind === 'answer' ? answerStep.index : undefined,
    trigger_id: answerStep?.kind === 'answer' ? answerStep.trigger_id : undefined,
  });

  // 2-2. 조건 노드 (root 아래 별도 그룹, depth=1)
  for (const cond of conditions) {
    const id = `cond-${cond.idx}`;
    nodes.push({
      id,
      label: `조건 ${cond.idx}`,
      text: cond.text,
      kind: 'condition',
      depth: -1,
      source_condition_idx: cond.idx,
      is_pivotal: false,
    });
    // 조건은 답을 위한 'requires' (답이 조건을 필요로 함). architecture: from=자식, to=부모.
    // 답 노드 입장에서 "필요한 대상(부모)"이 조건이므로:
    //   from = answer(자식 위치), to = condition(부모 위치) 로 보면 답 → 조건 의존성.
    // 그러나 BFS depth 계산은 "to=root 인 from" 을 자식으로 보므로,
    //   조건이 root 의 시각적 자식이 되려면 from=cond, to=root 'requires' 로 둔다.
    edges.push({ from: id, to: rootId, kind: 'requires' });
  }

  // 3. step → tree node 변환
  // answer step 은 root 와 통합되었으므로 추가 노드 생성 X
  for (let i = 0; i < args.steps.length; i++) {
    const step = args.steps[i];
    if (step.kind === 'answer') continue;

    const nodeId = `s${step.index}`;
    nodes.push({
      id: nodeId,
      label: `s${step.index}`,
      text: step.summary,
      kind: mapStepKindToTreeKind(step.kind),
      depth: -1,
      step_index: step.index,
      trigger_id: step.trigger_id,
      is_pivotal: step.is_pivotal,
      llm_struggle_ms: step.llm_struggle?.step_ms,
    });

    if (step.kind === 'forward') {
      // forward: 도출된 사실 → 답으로 derived_from
      edges.push({ from: nodeId, to: rootId, kind: 'derived_from' });
    } else if (step.kind === 'backward') {
      // backward subgoal — chain 형성:
      //   직전 step 이 backward 면 그 subgoal 의 자식 (필요로 함)
      //   아니면 root 의 직접 자식 (답이 이 subgoal 을 필요로 함)
      const prev = args.steps[i - 1];
      if (prev && prev.kind === 'backward') {
        edges.push({ from: nodeId, to: `s${prev.index}`, kind: 'requires' });
      } else {
        edges.push({ from: nodeId, to: rootId, kind: 'requires' });
      }
    } else if (step.kind === 'tool_call') {
      // tool_call: 직전 backward subgoal 의 derived_fact (자식)
      const prev = args.steps[i - 1];
      if (prev && prev.kind === 'backward') {
        edges.push({ from: nodeId, to: `s${prev.index}`, kind: 'derived_from' });
      } else {
        edges.push({ from: nodeId, to: rootId, kind: 'derived_from' });
      }
    } else {
      // parse / domain_id / computation / verify → root 직속 fallback
      edges.push({ from: nodeId, to: rootId, kind: 'derived_from' });
    }
  }

  // 4. 다중 부모 감지 — 같은 trigger_id 공유 노드 합류
  detectMultiParents(nodes, edges);

  // 5. depth 계산 (BFS from root)
  computeDepth(nodes, edges, rootId);

  // 6. 메트릭
  const node_count = nodes.length;
  const depth_max = nodes.reduce((m, n) => Math.max(m, n.depth), 0);
  const branching_factor =
    node_count > 1 ? edges.length / Math.max(node_count - 1, 1) : 0;
  const collapse_hint = node_count >= TREE_COLLAPSE_NODE_THRESHOLD;

  const tree: ReasoningTree = {
    schema_version: '1.0',
    root_id: rootId,
    nodes,
    edges,
    conditions,
    depth_max,
    node_count,
    collapse_hint,
  };

  // 7. DB insert
  if (!opts.skipPersist) {
    await persistTree(args.session_id, args.user_id, tree, branching_factor);
  }

  return tree;
}

async function persistTree(
  session_id: string,
  user_id: string,
  tree: ReasoningTree,
  branching_factor: number,
): Promise<void> {
  if (!session_id || !user_id) return;
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('solve_reasoning_trees').insert({
      session_id,
      user_id,
      tree_jsonb: tree,
      depth_max: tree.depth_max,
      node_count: tree.node_count,
      branching_factor,
    });
    if (error) {
      console.warn('[tree-builder] insert failed:', error.message);
    }
  } catch (e) {
    console.warn('[tree-builder] insert unexpected:', (e as Error).message);
  }
}
