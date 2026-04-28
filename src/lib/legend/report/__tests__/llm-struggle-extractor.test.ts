/**
 * Phase G-06 G06-13 — llm-struggle-extractor 단위 테스트.
 *
 * 시나리오:
 *   1. agentic 5 turns → hardest step idx 정확 (max step_ms tie-break reasoning)
 *   2. Haiku 호출 1회 (hardest step 만)
 *   3. reasoning_chars=0 인 케이스 → Haiku skip
 *   4. per_step.length === steps.length
 *   5. total_tool_retries 정확 (is_retry 합산)
 *   6. resolution_narrative === per_step[hardest].resolution_text
 *   7. skipPersist=false 시 DB update 호출 (step 수만큼)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// callModel 모킹 — Haiku 호출 추적
const callModelMock = vi.fn();
vi.mock('@/lib/legend/call-model', () => ({
  callModel: (...args: unknown[]) => callModelMock(...args),
}));

// supabase 모킹 — update chain (eq → eq → resolved)
const updateMock = vi.fn();
const fromBuilder = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (...args: unknown[]) => fromBuilder(...args),
  }),
}));

import { extractLLMStruggle } from '../llm-struggle-extractor';
import type { PerProblemStep } from '@/lib/legend/types';
import anthropicAgentic from '../fixtures/anthropic-agentic.json';
import chainDepth5 from '../fixtures/chain-depth5.json';

// 5 turns × index 0~4 인 가상 step 시퀀스 (extractor 의 1:1 매핑 테스트용)
function makeSteps(count: number): PerProblemStep[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    kind: 'forward' as const,
    summary: `step ${i + 1} 요약`,
    difficulty: 3,
    is_pivotal: false,
  }));
}

beforeEach(() => {
  callModelMock.mockReset();
  callModelMock.mockResolvedValue({
    text: 'u=x², dv=eˣdx 로 두고 부분적분. 재귀 패턴 인식 후 한 번 더 적용.',
    trace: {},
    tool_calls: [],
    duration_ms: 800,
    model_id: 'mock-haiku',
  });
  updateMock.mockReset();
  // update().eq().eq() chain — final eq 가 await 되므로 thenable 객체 반환
  updateMock.mockImplementation(() => ({
    eq: () => ({
      eq: () => Promise.resolve({ data: null, error: null }),
    }),
  }));
  fromBuilder.mockReset();
  fromBuilder.mockImplementation(() => ({ update: updateMock }));
});

describe('extractLLMStruggle — anthropic agentic 5 turns', () => {
  const steps = makeSteps(5);
  // anthropic-agentic turn duration: 4200, 5100, 6300, 3800, 2900 → max=Step3 (idx 2)

  it('hardest step idx = 2 (max step_ms 6300)', async () => {
    const result = await extractLLMStruggle({
      trace: anthropicAgentic,
      steps,
      provider: 'anthropic',
      session_id: 'sess-1',
      problem_text: '곡선 y=f(x) 와 직선 y=mx+n 의 교점 개수가 3 인 m+n 의 최솟값을 구하시오.',
      skipPersist: true,
    });
    expect(result.hardest_step_index).toBe(2);
    expect(result.hardest_step_ms).toBe(6300);
  });

  it('Haiku 호출 1회 (hardest step 만) — callModel mock 호출 횟수 검증', async () => {
    await extractLLMStruggle({
      trace: anthropicAgentic,
      steps,
      provider: 'anthropic',
      session_id: 'sess-2',
      problem_text: '문제 본문',
      skipPersist: true,
    });
    expect(callModelMock).toHaveBeenCalledTimes(1);
    const call = callModelMock.mock.calls[0][0] as {
      provider: string;
      mode: string;
      max_tokens: number;
    };
    expect(call.provider).toBe('anthropic');
    expect(call.mode).toBe('baseline');
    expect(call.max_tokens).toBe(200);
  });

  it('per_step.length === steps.length', async () => {
    const result = await extractLLMStruggle({
      trace: anthropicAgentic,
      steps,
      provider: 'anthropic',
      session_id: 'sess-3',
      problem_text: 'p',
      skipPersist: true,
    });
    expect(result.per_step).toHaveLength(steps.length);
    // 각 step_index 1:1
    result.per_step.forEach((s, i) => expect(s.step_index).toBe(i));
  });

  it('total_turns = 5', async () => {
    const result = await extractLLMStruggle({
      trace: anthropicAgentic,
      steps,
      provider: 'anthropic',
      session_id: 'sess-4',
      problem_text: 'p',
      skipPersist: true,
    });
    expect(result.total_turns).toBe(5);
  });

  it('resolution_narrative 가 hardest step 의 resolution_text 와 동일', async () => {
    const result = await extractLLMStruggle({
      trace: anthropicAgentic,
      steps,
      provider: 'anthropic',
      session_id: 'sess-5',
      problem_text: 'p',
      skipPersist: true,
    });
    expect(result.resolution_narrative).toBeTruthy();
    expect(result.per_step[result.hardest_step_index].resolution_text).toBe(
      result.resolution_narrative,
    );
    // 다른 step 들에는 resolution_text 가 없음
    result.per_step.forEach((s, i) => {
      if (i !== result.hardest_step_index) {
        expect(s.resolution_text).toBeUndefined();
      }
    });
  });
});

describe('extractLLMStruggle — tool retries 합산', () => {
  const steps = makeSteps(5);
  // chain-depth5: Step3 (idx 2) 에서 sympy_solve 두 번 → tool_retries=1 인 turn

  it('total_tool_retries = 1 (Step3 의 두 번째 sympy_solve)', async () => {
    const result = await extractLLMStruggle({
      trace: chainDepth5,
      steps,
      provider: 'anthropic',
      session_id: 'sess-retry',
      problem_text: 'p',
      skipPersist: true,
    });
    expect(result.total_tool_retries).toBe(1);
    // step_index=2 의 tool_retries 가 1
    expect(result.per_step[2].tool_retries).toBe(1);
  });
});

describe('extractLLMStruggle — Haiku skip 케이스', () => {
  it('reasoning_chars 0 인 step 만 있으면 Haiku 호출 skip', async () => {
    // 빈 trace — turns=[] → reasoning_chars 0
    const result = await extractLLMStruggle({
      trace: { turns: [] },
      steps: makeSteps(2),
      provider: 'anthropic',
      session_id: 'sess-empty',
      problem_text: 'p',
      skipPersist: true,
    });
    expect(callModelMock).not.toHaveBeenCalled();
    expect(result.resolution_narrative).toBe('');
    // per_step 은 그대로 채워짐 (reasoning_chars=0)
    expect(result.per_step).toHaveLength(2);
    result.per_step.forEach((s) => {
      expect(s.reasoning_chars).toBe(0);
      expect(s.resolution_text).toBeUndefined();
    });
  });

  it('Haiku 실패 (throw) 시 graceful — narrative 빈 문자열', async () => {
    callModelMock.mockRejectedValue(new Error('API down'));
    const result = await extractLLMStruggle({
      trace: anthropicAgentic,
      steps: makeSteps(5),
      provider: 'anthropic',
      session_id: 'sess-fail',
      problem_text: 'p',
      skipPersist: true,
    });
    expect(result.resolution_narrative).toBe('');
    expect(result.per_step[result.hardest_step_index].resolution_text).toBeUndefined();
  });
});

describe('extractLLMStruggle — DB update', () => {
  it('skipPersist=false 시 solve_step_decomposition update 가 step 수만큼 호출됨', async () => {
    const steps = makeSteps(5);
    await extractLLMStruggle({
      trace: anthropicAgentic,
      steps,
      provider: 'anthropic',
      session_id: 'sess-persist',
      problem_text: 'p',
      // skipPersist 미지정 → 기본 false
    });
    expect(fromBuilder).toHaveBeenCalledWith('solve_step_decomposition');
    expect(updateMock).toHaveBeenCalledTimes(steps.length);
    // hardest step 의 update payload 에 llm_resolution_text 포함
    const hardestCall = updateMock.mock.calls[2][0] as {
      llm_turns_at_step: number;
      llm_tool_retries: number;
      llm_reasoning_chars: number;
      llm_step_ms: number;
      llm_resolution_text: string | null;
    };
    expect(hardestCall.llm_step_ms).toBe(6300);
    expect(hardestCall.llm_resolution_text).toBeTruthy();
  });
});
