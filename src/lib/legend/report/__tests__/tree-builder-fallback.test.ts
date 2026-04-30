/**
 * Phase G-06 G06-35d — tree-builder 빈 트리 fallback 단위 테스트.
 *
 * step 5개 미만 + 조건 0개 시 단순 chain 트리 생성. "추출하지 못했다" 메시지 X.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({ insert: insertMock }),
  }),
}));

import { buildReasoningTree } from '../tree-builder';
import type { PerProblemStep } from '@/lib/legend/types';

beforeEach(() => {
  insertMock.mockClear();
});

describe('tree-builder fallback (G06-35d)', () => {
  it('step 0개 + 조건 0개 → root + s-fallback 노드 1개 생성 (빈 트리 아님)', async () => {
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-fb1',
        user_id: 'u1',
        problem_text: '단순 평문 문제 — 조건 마커 없음',
        steps: [],
      },
      { skipPersist: true },
    );

    expect(tree.node_count).toBeGreaterThanOrEqual(2);
    expect(tree.nodes.find((n) => n.id === 's-fallback')).toBeDefined();
    expect(tree.edges.find((e) => e.from === 's-fallback' && e.to === 'answer')).toBeDefined();
  });

  it('answer step 1개 + 조건 0개 → root + s-fallback fallback 노드', async () => {
    const steps: PerProblemStep[] = [
      { index: 0, kind: 'answer', summary: '최종 답: 5', difficulty: 2, is_pivotal: true },
    ];
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-fb2',
        user_id: 'u1',
        problem_text: '평문 문제',
        steps,
      },
      { skipPersist: true },
    );

    // answer 는 root 와 통합 → 별도 노드 X. 비-answer step 0개 + 조건 0개 → fallback 발동.
    expect(tree.nodes.find((n) => n.id === 's-fallback')).toBeDefined();
  });

  it('forward step 1개 있으면 fallback 노드 추가 X (정상 트리)', async () => {
    const steps: PerProblemStep[] = [
      { index: 0, kind: 'forward', summary: '조건 조합', difficulty: 3, is_pivotal: false },
      { index: 1, kind: 'answer', summary: '최종 답: 7', difficulty: 2, is_pivotal: true },
    ];
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-fb3',
        user_id: 'u1',
        problem_text: '평문 문제',
        steps,
      },
      { skipPersist: true },
    );

    expect(tree.nodes.find((n) => n.id === 's-fallback')).toBeUndefined();
    // s0 (forward) + answer → 최소 node_count = 2.
    expect(tree.node_count).toBeGreaterThanOrEqual(2);
  });

  it('조건 (가)(나) 있으면 fallback 노드 추가 X (조건 노드가 트리 채움)', async () => {
    const tree = await buildReasoningTree(
      {
        session_id: 'sess-fb4',
        user_id: 'u1',
        problem_text: '함수 f 가 다음 조건을 만족한다. (가) f(0)=1 (나) f(1)=2',
        steps: [],
      },
      { skipPersist: true },
    );

    expect(tree.nodes.find((n) => n.id === 's-fallback')).toBeUndefined();
    // root + cond-1 + cond-2 = 3
    expect(tree.node_count).toBeGreaterThanOrEqual(3);
  });
});
