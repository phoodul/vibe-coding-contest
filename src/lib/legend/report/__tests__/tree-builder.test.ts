/**
 * Phase G-06 G06-14 — tree-builder 단위 테스트.
 *
 * 시나리오:
 *   1. single-path 5 step → root + 노드 + edge 생성, depth_max ≥ 1
 *   2. multi-parent → 같은 trigger_id 두 노드에서 추가 edge 합류
 *   3. depth-6plus → depth_max ≥ 6
 *   4. collapse → node_count ≥ 30, collapse_hint=true
 *   5. parseConditions 한국어 (가)(나) 패턴 정확
 *   6. DB insert 호출 (solve_reasoning_trees)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// supabase 모킹
const insertMock = vi.fn().mockResolvedValue({ error: null });
const fromBuilder = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (...args: unknown[]) => fromBuilder(...args),
  }),
}));

import {
  buildReasoningTree,
  parseConditions,
  detectMultiParents,
  computeDepth,
} from '../tree-builder';
import type { PerProblemStep, ReasoningTreeNode, ReasoningTreeEdge } from '@/lib/legend/types';

import singlePath from '../fixtures/tree-single-path.json';
import multiParent from '../fixtures/tree-multi-parent.json';
import depth6 from '../fixtures/tree-depth-6plus.json';
import collapse from '../fixtures/tree-collapse.json';

interface TreeFixture {
  problem_text: string;
  steps: PerProblemStep[];
}

beforeEach(() => {
  insertMock.mockClear();
  fromBuilder.mockReset();
  fromBuilder.mockImplementation((table: string) => {
    if (table === 'solve_reasoning_trees') {
      return { insert: insertMock };
    }
    return { insert: vi.fn().mockResolvedValue({ error: null }) };
  });
});

// ────────────────────────────────────────────────────────────────────────────
// parseConditions
// ────────────────────────────────────────────────────────────────────────────

describe('parseConditions', () => {
  it('한국어 수능 (가)(나)(다) 패턴 정확 추출', () => {
    const conds = parseConditions(
      '함수 f 에 대해 (가) f(0)=1 (나) f(1)=2 (다) f(2)=4 일 때 f(3) 을 구하시오.',
    );
    expect(conds).toHaveLength(3);
    expect(conds[0].idx).toBe(1);
    expect(conds[0].text).toContain('f(0)=1');
    expect(conds[1].idx).toBe(2);
    expect(conds[1].text).toContain('f(1)=2');
    expect(conds[2].idx).toBe(3);
    expect(conds[2].text).toContain('f(2)=4');
  });

  it('"조건 1: ... 조건 2: ..." 라벨 패턴 추출', () => {
    const conds = parseConditions(
      '조건 1: 모든 x 에서 미분가능 조건 2: f(0)=0 인 함수 f 의 최솟값을 구하시오.',
    );
    expect(conds.length).toBeGreaterThanOrEqual(2);
    expect(conds[0].idx).toBe(1);
    expect(conds[1].idx).toBe(2);
  });

  it('빈 문자열 / 매칭 실패 → 빈 배열', () => {
    expect(parseConditions('')).toEqual([]);
    expect(parseConditions('일반적인 문장 — 조건 패턴 없음')).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// detectMultiParents
// ────────────────────────────────────────────────────────────────────────────

describe('detectMultiParents', () => {
  it('같은 trigger_id 보유 노드 2+ 시 합류 edge 추가', () => {
    const nodes: ReasoningTreeNode[] = [
      {
        id: 'a',
        label: 'a',
        text: '',
        kind: 'derived_fact',
        depth: -1,
        is_pivotal: false,
        trigger_id: 'T1',
      },
      {
        id: 'b',
        label: 'b',
        text: '',
        kind: 'derived_fact',
        depth: -1,
        is_pivotal: false,
        trigger_id: 'T1',
      },
      {
        id: 'c',
        label: 'c',
        text: '',
        kind: 'derived_fact',
        depth: -1,
        is_pivotal: false,
        trigger_id: 'T2',
      },
    ];
    const edges: ReasoningTreeEdge[] = [];
    detectMultiParents(nodes, edges);
    // a, b 는 T1 공유 → b → a 합류 edge 추가
    expect(edges.some((e) => e.from === 'b' && e.to === 'a' && e.kind === 'derived_from')).toBe(
      true,
    );
    // c 는 단독 → 추가 edge 없음
    expect(edges.some((e) => e.from === 'c')).toBe(false);
  });

  it('trigger_id 없는 노드는 무시', () => {
    const nodes: ReasoningTreeNode[] = [
      { id: 'a', label: 'a', text: '', kind: 'derived_fact', depth: -1, is_pivotal: false },
      { id: 'b', label: 'b', text: '', kind: 'derived_fact', depth: -1, is_pivotal: false },
    ];
    const edges: ReasoningTreeEdge[] = [];
    detectMultiParents(nodes, edges);
    expect(edges).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// computeDepth
// ────────────────────────────────────────────────────────────────────────────

describe('computeDepth', () => {
  it('root → child → grandchild chain depth 0/1/2', () => {
    const nodes: ReasoningTreeNode[] = [
      { id: 'r', label: '답', text: '', kind: 'answer', depth: -1, is_pivotal: false },
      { id: 's1', label: 's1', text: '', kind: 'subgoal', depth: -1, is_pivotal: false },
      { id: 's2', label: 's2', text: '', kind: 'subgoal', depth: -1, is_pivotal: false },
    ];
    const edges: ReasoningTreeEdge[] = [
      { from: 's1', to: 'r', kind: 'requires' },
      { from: 's2', to: 's1', kind: 'requires' },
    ];
    computeDepth(nodes, edges, 'r');
    const map = new Map(nodes.map((n) => [n.id, n.depth]));
    expect(map.get('r')).toBe(0);
    expect(map.get('s1')).toBe(1);
    expect(map.get('s2')).toBe(2);
  });

  it('고립 노드는 fallback depth=1', () => {
    const nodes: ReasoningTreeNode[] = [
      { id: 'r', label: '답', text: '', kind: 'answer', depth: -1, is_pivotal: false },
      { id: 'iso', label: 'iso', text: '', kind: 'derived_fact', depth: -1, is_pivotal: false },
    ];
    const edges: ReasoningTreeEdge[] = [];
    computeDepth(nodes, edges, 'r');
    expect(nodes.find((n) => n.id === 'iso')!.depth).toBe(1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildReasoningTree — 4 fixture 시나리오
// ────────────────────────────────────────────────────────────────────────────

describe('buildReasoningTree', () => {
  it('single-path → root + steps 노드 + edges, depth_max ≥ 1', async () => {
    const fx = singlePath as TreeFixture;
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-sp',
        user_id: 'user-1',
        problem_text: fx.problem_text,
        steps: fx.steps,
      },
      { skipPersist: true },
    );
    // root 'answer' 노드 항상 존재
    expect(tree.root_id).toBe('answer');
    expect(tree.nodes.find((n) => n.id === 'answer')).toBeDefined();
    // answer step 은 root 흡수 → 별도 노드 없음. 나머지 4 step + root + 조건(2) = 7
    expect(tree.nodes.length).toBeGreaterThanOrEqual(5);
    // depth_max ≥ 1 (root + 자식)
    expect(tree.depth_max).toBeGreaterThanOrEqual(1);
    // edges 가 만들어졌는지
    expect(tree.edges.length).toBeGreaterThan(0);
    // schema_version
    expect(tree.schema_version).toBe('1.0');
    // 조건 (가)(나) 추출됨
    expect(tree.conditions.length).toBeGreaterThanOrEqual(2);
  });

  it('multi-parent → 같은 trigger_id 공유 노드끼리 합류 edge', async () => {
    const fx = multiParent as TreeFixture;
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-mp',
        user_id: 'user-1',
        problem_text: fx.problem_text,
        steps: fx.steps,
      },
      { skipPersist: true },
    );
    // s2, s4 는 trig-tangent-line 공유 → s4 → s2 합류 edge
    const merge = tree.edges.find(
      (e) => e.from === 's4' && e.to === 's2' && e.kind === 'derived_from',
    );
    expect(merge).toBeDefined();
    // 또한 s2, s4 모두 nodes 에 포함
    expect(tree.nodes.find((n) => n.id === 's2')).toBeDefined();
    expect(tree.nodes.find((n) => n.id === 's4')).toBeDefined();
    // 같은 trigger_id 보유
    expect(tree.nodes.find((n) => n.id === 's2')!.trigger_id).toBe('trig-tangent-line');
    expect(tree.nodes.find((n) => n.id === 's4')!.trigger_id).toBe('trig-tangent-line');
  });

  it('depth-6plus → depth_max ≥ 6', async () => {
    const fx = depth6 as TreeFixture;
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-d6',
        user_id: 'user-1',
        problem_text: fx.problem_text,
        steps: fx.steps,
      },
      { skipPersist: true },
    );
    expect(tree.depth_max).toBeGreaterThanOrEqual(6);
  });

  it('collapse → node_count ≥ 30, collapse_hint=true', async () => {
    const fx = collapse as TreeFixture;
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-cp',
        user_id: 'user-1',
        problem_text: fx.problem_text,
        steps: fx.steps,
      },
      { skipPersist: true },
    );
    expect(tree.node_count).toBeGreaterThanOrEqual(30);
    expect(tree.collapse_hint).toBe(true);
  });

  it('answer step 은 root 와 통합되어 별도 s{idx} 노드 생성 안 함', async () => {
    const fx = singlePath as TreeFixture;
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-ans',
        user_id: 'user-1',
        problem_text: fx.problem_text,
        steps: fx.steps,
      },
      { skipPersist: true },
    );
    const answerStepIdx = fx.steps.find((s) => s.kind === 'answer')!.index;
    expect(tree.nodes.find((n) => n.id === `s${answerStepIdx}`)).toBeUndefined();
    // root 의 text 는 answer step summary
    expect(tree.nodes.find((n) => n.id === 'answer')!.text).toContain('극값의 합');
  });

  it('skipPersist=false 일 때 solve_reasoning_trees insert 호출됨', async () => {
    const fx = singlePath as TreeFixture;
    await buildReasoningTree({
      session_id: 'sess-persist',
      user_id: 'user-1',
      problem_text: fx.problem_text,
      steps: fx.steps,
    });
    expect(fromBuilder).toHaveBeenCalledWith('solve_reasoning_trees');
    expect(insertMock).toHaveBeenCalledTimes(1);
    const inserted = insertMock.mock.calls[0][0] as {
      session_id: string;
      user_id: string;
      tree_jsonb: unknown;
      depth_max: number;
      node_count: number;
      branching_factor: number;
    };
    expect(inserted.session_id).toBe('sess-persist');
    expect(inserted.user_id).toBe('user-1');
    expect(inserted.tree_jsonb).toBeDefined();
    expect(inserted.depth_max).toBeGreaterThanOrEqual(1);
    expect(inserted.node_count).toBeGreaterThan(0);
    expect(typeof inserted.branching_factor).toBe('number');
  });

  it('빈 steps + 조건 0개 → G06-35d fallback 으로 root + s-fallback 2 노드', async () => {
    // G06-35d 베타 결함 4 fix — "추출하지 못했다" 메시지 X, 단순 chain 트리 보장.
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-empty',
        user_id: 'user-1',
        problem_text: '문제 — 조건 패턴 없음',
        steps: [],
      },
      { skipPersist: true },
    );
    expect(tree.nodes).toHaveLength(2);
    expect(tree.nodes.find((n) => n.id === 'answer')).toBeDefined();
    expect(tree.nodes.find((n) => n.id === 's-fallback')).toBeDefined();
    expect(tree.edges).toHaveLength(1);
  });
});
