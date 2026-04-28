/**
 * Phase G-06 G06-12 — step-decomposer 단위 테스트.
 *
 * 시나리오:
 *   - fixture 6 종 → decomposeChainSteps 결과 검증
 *   - step_kind 분류 정확성 (parse / forward / backward / tool_call / answer 등)
 *   - pivotal step 선정 (max difficulty, tie-break: tool_call)
 *   - DB insert 호출 검증 (skipPersist=false)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// embed 모킹: 길이 1536 dummy vector
vi.mock('@/lib/euler/embed', () => ({
  embedText: vi.fn(async () => Array(1536).fill(0.01)),
}));

// supabase 모킹: from() chain + rpc()
const insertMock = vi.fn().mockResolvedValue({ error: null });
const fromBuilder = vi.fn();
const rpcMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (...args: unknown[]) => fromBuilder(...args),
    rpc: (...args: unknown[]) => rpcMock(...args),
  }),
}));

import { decomposeChainSteps, classifyStepKind, selectPivotal, estimateDifficulty } from '../step-decomposer';
import type { PerProblemStep } from '@/lib/legend/types';

import anthropicBaseline from '../fixtures/anthropic-baseline.json';
import anthropicAgentic from '../fixtures/anthropic-agentic.json';
import openaiAgentic from '../fixtures/openai-agentic.json';
import googleAgentic from '../fixtures/google-agentic.json';
import chainDepth1 from '../fixtures/chain-depth1.json';
import chainDepth5 from '../fixtures/chain-depth5.json';

beforeEach(() => {
  insertMock.mockClear();
  fromBuilder.mockReset();
  rpcMock.mockReset();
  // 기본: math_tools / math_tool_triggers lookup empty → trigger 매칭 실패 (3차 fallback)
  fromBuilder.mockImplementation((table: string) => {
    if (table === 'solve_step_decomposition') {
      return { insert: insertMock };
    }
    // math_tools / math_tool_triggers → empty
    return {
      select: () => ({
        or: () => ({ limit: async () => ({ data: [], error: null }) }),
        eq: () => ({ limit: async () => ({ data: [], error: null }) }),
      }),
    };
  });
  // ANN RPC default: similarity 0.5 (threshold 0.7 미달 → 매칭 fail)
  rpcMock.mockResolvedValue({
    data: [{ trigger_id: 't1', tool_id: 'TOOL_X', similarity: 0.5 }],
    error: null,
  });
});

// ────────────────────────────────────────────────────────────────────────────
// classifyStepKind
// ────────────────────────────────────────────────────────────────────────────

describe('classifyStepKind', () => {
  it('"문제 구조화 — 구해야 할 것 / 조건" → parse', () => {
    expect(classifyStepKind('문제 구조화 — 구해야 할 것 / 조건 분리')).toBe('parse');
  });

  it('"역으로 추적하면 ..." → backward', () => {
    expect(classifyStepKind('역으로 추적하면 subgoal 이 보임')).toBe('backward');
    expect(classifyStepKind('구하려면 다음이 필요한 것이다.')).toBe('backward');
  });

  it('"따라서 최종 답 ..." → answer', () => {
    expect(classifyStepKind('따라서 최종 답: 12')).toBe('answer');
    expect(classifyStepKind('결론: 따라서 답은 7')).toBe('answer');
  });

  it('"검증 / 확인 / 체크" → verify', () => {
    expect(classifyStepKind('검증 — 계산 결과 일치')).toBe('verify');
    expect(classifyStepKind('확인하면 부호 ✓')).toBe('verify');
  });

  it('"정의역 / 영역" → domain_id', () => {
    expect(classifyStepKind('정의역 [0, 8] 분석')).toBe('domain_id');
    expect(classifyStepKind('범위 (0, ∞)')).toBe('domain_id');
  });

  it('default → forward', () => {
    expect(classifyStepKind('새로운 사실을 도출')).toBe('forward');
  });

  it('빈 문자열 → forward', () => {
    expect(classifyStepKind('')).toBe('forward');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// estimateDifficulty
// ────────────────────────────────────────────────────────────────────────────

describe('estimateDifficulty', () => {
  it('reasoning_chars 와 tool_calls 가 클수록 difficulty 증가', () => {
    const small = estimateDifficulty({
      turn_index: 0,
      text: 'a',
      tool_calls: [],
      reasoning_chars: 100,
    });
    const big = estimateDifficulty({
      turn_index: 0,
      text: 'a'.repeat(3500),
      tool_calls: [
        { tool_name: 'A', tool_input: {}, is_retry: false, ok: true },
        { tool_name: 'B', tool_input: {}, is_retry: false, ok: true },
      ],
      reasoning_chars: 3500,
    });
    expect(big).toBeGreaterThan(small);
    expect(big).toBeLessThanOrEqual(6);
    expect(small).toBeGreaterThanOrEqual(1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// selectPivotal
// ────────────────────────────────────────────────────────────────────────────

describe('selectPivotal', () => {
  it('max difficulty 가 단일이면 그 step', () => {
    const steps: PerProblemStep[] = [
      { index: 0, kind: 'forward', summary: 'a', difficulty: 3, is_pivotal: false },
      { index: 1, kind: 'forward', summary: 'b', difficulty: 5, is_pivotal: false },
      { index: 2, kind: 'forward', summary: 'c', difficulty: 4, is_pivotal: false },
    ];
    expect(selectPivotal(steps)).toBe(1);
  });

  it('동일 difficulty 시 tool_call 우선 (tie-break)', () => {
    const steps: PerProblemStep[] = [
      { index: 0, kind: 'forward', summary: 'a', difficulty: 5, is_pivotal: false },
      { index: 1, kind: 'tool_call', summary: 'b', difficulty: 5, is_pivotal: false },
      { index: 2, kind: 'forward', summary: 'c', difficulty: 5, is_pivotal: false },
    ];
    expect(selectPivotal(steps)).toBe(1);
  });

  it('빈 배열 → -1', () => {
    expect(selectPivotal([])).toBe(-1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// decomposeChainSteps — 6 fixture
// ────────────────────────────────────────────────────────────────────────────

describe('decomposeChainSteps', () => {
  it('anthropic-baseline (1 turn / 0 tool) → text-only step + answer 분류', async () => {
    const steps = await decomposeChainSteps(anthropicBaseline, 'sess-1', 'anthropic', {
      skipPersist: true,
    });
    expect(steps.length).toBeGreaterThan(0);
    // baseline turn text 에 "최종 답" 포함 → 마지막 step kind=answer 가능
    const kinds = steps.map((s) => s.kind);
    expect(kinds).toContain('answer');
    // pivotal 1개 보장
    expect(steps.filter((s) => s.is_pivotal)).toHaveLength(1);
  });

  it('anthropic-agentic (5 turns + 2 tool_use) → tool_call step ≥ 2 + pivotal tool_call 우선', async () => {
    const steps = await decomposeChainSteps(anthropicAgentic, 'sess-2', 'anthropic', {
      skipPersist: true,
    });
    const toolCallSteps = steps.filter((s) => s.kind === 'tool_call');
    expect(toolCallSteps.length).toBeGreaterThanOrEqual(2);
    expect(toolCallSteps.map((s) => s.summary)).toContain('sympy_diff 호출');
    expect(toolCallSteps.map((s) => s.summary)).toContain('sympy_solve 호출');
    // pivotal 1개
    expect(steps.filter((s) => s.is_pivotal)).toHaveLength(1);
  });

  it('openai-agentic (5 turns + 2 tool_calls) → tool_call step ≥ 2', async () => {
    const steps = await decomposeChainSteps(openaiAgentic, 'sess-3', 'openai', {
      skipPersist: true,
    });
    const toolCallSteps = steps.filter((s) => s.kind === 'tool_call');
    expect(toolCallSteps.map((s) => s.summary)).toEqual(
      expect.arrayContaining(['sympy_solve 호출', 'sympy_simplify 호출']),
    );
  });

  it('google-agentic (5 turns + 2 functionCall) → tool_call step + answer step', async () => {
    const steps = await decomposeChainSteps(googleAgentic, 'sess-4', 'google', {
      skipPersist: true,
    });
    const toolCallSteps = steps.filter((s) => s.kind === 'tool_call');
    expect(toolCallSteps.map((s) => s.summary)).toEqual(
      expect.arrayContaining(['geometry_inner_product 호출', 'verify_parallel 호출']),
    );
    expect(steps.some((s) => s.kind === 'answer')).toBe(true);
  });

  it('chain-depth1 (single short) → 매우 적은 step + pivotal 1개', async () => {
    const steps = await decomposeChainSteps(chainDepth1, 'sess-5', 'anthropic', {
      skipPersist: true,
    });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.filter((s) => s.is_pivotal)).toHaveLength(1);
  });

  it('chain-depth5 (5 turns + retry tool) → tool_retries=1 표기 step 존재', async () => {
    const steps = await decomposeChainSteps(chainDepth5, 'sess-6', 'anthropic', {
      skipPersist: true,
    });
    // sympy_solve 두 번째 호출이 tool_retries=1
    const retrySteps = steps.filter(
      (s) => s.kind === 'tool_call' && s.llm_struggle?.tool_retries === 1,
    );
    expect(retrySteps.length).toBeGreaterThanOrEqual(1);
  });

  it('skipPersist=false 일 때 solve_step_decomposition insert 호출됨', async () => {
    await decomposeChainSteps(anthropicBaseline, 'sess-persist', 'anthropic');
    expect(fromBuilder).toHaveBeenCalledWith('solve_step_decomposition');
    expect(insertMock).toHaveBeenCalledTimes(1);
    const insertedRows = insertMock.mock.calls[0][0] as Array<{
      session_id: string;
      step_kind: string;
      is_pivotal: boolean;
    }>;
    expect(Array.isArray(insertedRows)).toBe(true);
    expect(insertedRows.length).toBeGreaterThan(0);
    expect(insertedRows[0].session_id).toBe('sess-persist');
    expect(insertedRows.filter((r) => r.is_pivotal)).toHaveLength(1);
  });

  it('ANN similarity ≥ 0.7 일 때 trigger_id / tool_id 채워짐', async () => {
    rpcMock.mockResolvedValue({
      data: [{ trigger_id: 'trig-77', tool_id: 'TOOL_77', similarity: 0.9 }],
      error: null,
    });
    const steps = await decomposeChainSteps(chainDepth1, 'sess-ann', 'anthropic', {
      skipPersist: true,
    });
    // text step (forward 또는 answer) 중 매칭이 시도되는 것 — answer 는 매칭 skip 이므로
    // forward/computation/backward kind 만 trigger lookup. depth1 fixture 는 answer 만
    // 있을 수 있어, 매칭 자체가 호출되지 않을 수 있음. 강제 케이스로 chainDepth5 사용:
    const steps2 = await decomposeChainSteps(chainDepth5, 'sess-ann2', 'anthropic', {
      skipPersist: true,
    });
    const matched = steps2.find((s) => s.trigger_id === 'trig-77');
    expect(matched).toBeDefined();
    expect(matched?.tool_id).toBe('TOOL_77');
    // (steps 변수 사용 — lint warning 회피)
    expect(steps.length).toBeGreaterThan(0);
  });
});
