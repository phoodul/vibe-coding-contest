/**
 * Phase G-06 G06-15 — trigger-expander 단위 테스트.
 *
 * 시나리오:
 *   - primary trigger 조회 → ANN top-K → exclude_tool_id 필터 후 max 3 카드
 *   - similarity < 0.7 후보 제외
 *   - exclude_tool_id 의 도구 제외
 *   - primary trigger 자기 자신 제외
 *   - similar_problems 에서 example_problem_ref 채움
 *   - primary trigger 없을 때 빈 배열
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/euler/embed', () => ({
  embedText: vi.fn(async () => Array(1536).fill(0.01)),
}));

const fromBuilder = vi.fn();
const rpcMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (...args: unknown[]) => fromBuilder(...args),
    rpc: (...args: unknown[]) => rpcMock(...args),
  }),
}));

import { expandTrigger } from '../trigger-expander';

interface PrimaryRow {
  id: string;
  tool_id: string;
  direction: 'forward' | 'backward' | 'both';
  trigger_condition: string;
  derived_fact: string | null;
  goal_pattern: string | null;
  why_text: string;
  math_tools: { id: string; name: string };
}

const PRIMARY_DEFAULT: PrimaryRow = {
  id: 'trig-primary',
  tool_id: 'TOOL_A',
  direction: 'forward',
  trigger_condition: '함수 f(x) 미분가능',
  derived_fact: 'f 가 연속',
  goal_pattern: null,
  why_text: '미분가능 → 연속',
  math_tools: { id: 'TOOL_A', name: '도구 A' },
};

interface ExampleRow {
  year: number;
  type: string;
  number: number;
}

interface BuilderState {
  primary: PrimaryRow | null;
  example: ExampleRow | null;
}

const state: BuilderState = { primary: PRIMARY_DEFAULT, example: null };

beforeEach(() => {
  fromBuilder.mockReset();
  rpcMock.mockReset();
  state.primary = PRIMARY_DEFAULT;
  state.example = null;

  fromBuilder.mockImplementation((table: string) => {
    if (table === 'math_tool_triggers') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: state.primary, error: null }),
          }),
        }),
      };
    }
    if (table === 'similar_problems') {
      return {
        select: () => ({
          filter: () => ({
            order: () => ({
              limit: () => ({
                maybeSingle: async () => ({ data: state.example, error: null }),
              }),
            }),
          }),
        }),
      };
    }
    return {
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
      }),
    };
  });

  // 기본 RPC: 후보 4개 (1 self + 3 normal)
  rpcMock.mockResolvedValue({
    data: [
      // self → 제외 대상
      buildRpcRow({ trigger_id: 'trig-primary', tool_id: 'TOOL_A', similarity: 0.99 }),
      buildRpcRow({ trigger_id: 'trig-1', tool_id: 'TOOL_B', similarity: 0.92 }),
      buildRpcRow({ trigger_id: 'trig-2', tool_id: 'TOOL_C', similarity: 0.85 }),
      buildRpcRow({ trigger_id: 'trig-3', tool_id: 'TOOL_D', similarity: 0.75 }),
    ],
    error: null,
  });
});

function buildRpcRow(over: Partial<{
  trigger_id: string;
  tool_id: string;
  direction: 'forward' | 'backward' | 'both';
  trigger_condition: string;
  goal_pattern: string | null;
  why_text: string;
  tool_name: string;
  similarity: number;
}>) {
  return {
    trigger_id: over.trigger_id ?? 'trig-x',
    tool_id: over.tool_id ?? 'TOOL_X',
    direction: over.direction ?? 'forward',
    trigger_condition: over.trigger_condition ?? '조건 텍스트',
    derived_fact: null,
    goal_pattern: over.goal_pattern ?? null,
    why_text: over.why_text ?? '왜 이걸 쓰는가',
    tool_name: over.tool_name ?? '도구 ' + (over.tool_id ?? 'X'),
    tool_layer: 2,
    tool_weight: 1.0,
    similarity: over.similarity ?? 0.8,
  };
}

describe('expandTrigger', () => {
  it('primary 조회 → ANN top-K → exclude_tool_id 필터 후 max 3 카드', async () => {
    // 자기 자신 제외 → trig-1, trig-2, trig-3 후보 — 모두 sim ≥ 0.7
    const cards = await expandTrigger('trig-primary', undefined, 3);
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.trigger_id)).toEqual(['trig-1', 'trig-2', 'trig-3']);
    expect(cards[0].tool_name).toContain('도구');
  });

  it('similarity < 0.7 후보 제외', async () => {
    rpcMock.mockResolvedValue({
      data: [
        buildRpcRow({ trigger_id: 'trig-primary', tool_id: 'TOOL_A', similarity: 0.99 }),
        buildRpcRow({ trigger_id: 'trig-1', tool_id: 'TOOL_B', similarity: 0.91 }),
        buildRpcRow({ trigger_id: 'trig-low', tool_id: 'TOOL_C', similarity: 0.6 }),
        buildRpcRow({ trigger_id: 'trig-low2', tool_id: 'TOOL_D', similarity: 0.5 }),
      ],
      error: null,
    });
    const cards = await expandTrigger('trig-primary', undefined, 3);
    expect(cards.map((c) => c.trigger_id)).toEqual(['trig-1']);
  });

  it('exclude_tool_id 의 도구 제외', async () => {
    // exclude TOOL_B → trig-1 제외
    const cards = await expandTrigger('trig-primary', 'TOOL_B', 3);
    expect(cards.map((c) => c.trigger_id)).toEqual(['trig-2', 'trig-3']);
    expect(cards.every((c) => !c.trigger_id.includes('trig-1'))).toBe(true);
  });

  it('primary trigger 자기 자신 제외 (RPC 응답에 self 포함되어도)', async () => {
    const cards = await expandTrigger('trig-primary', undefined, 3);
    expect(cards.find((c) => c.trigger_id === 'trig-primary')).toBeUndefined();
  });

  it('similar_problems 에서 example_problem_ref 채움', async () => {
    state.example = { year: 2024, type: '미적분', number: 30 };
    const cards = await expandTrigger('trig-primary', undefined, 3);
    expect(cards[0].example_problem_ref).toEqual({
      year: 2024,
      type: '미적분',
      number: 30,
    });
  });

  it('primary trigger 없을 때 빈 배열', async () => {
    state.primary = null;
    const cards = await expandTrigger('nonexistent', undefined, 3);
    expect(cards).toEqual([]);
  });

  it('max_count=2 제한 적용', async () => {
    const cards = await expandTrigger('trig-primary', undefined, 2);
    expect(cards).toHaveLength(2);
  });

  it('backward direction primary 일 때 goal_pattern 으로 query', async () => {
    state.primary = {
      ...PRIMARY_DEFAULT,
      direction: 'backward',
      trigger_condition: '',
      goal_pattern: '최댓값 구하기',
    };
    const cards = await expandTrigger('trig-primary', undefined, 3);
    // RPC 호출의 direction_filter 가 backward 인지 확인
    expect(rpcMock).toHaveBeenCalled();
    const rpcArgs = rpcMock.mock.calls[0][1];
    expect(rpcArgs.direction_filter).toBe('backward');
    expect(cards.length).toBeGreaterThan(0);
  });
});
