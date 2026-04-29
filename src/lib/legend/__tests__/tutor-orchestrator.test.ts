/**
 * Phase G-06 G06-08 — tutor-orchestrator 단위 테스트.
 *
 * 시나리오:
 *   1. TUTOR_CONFIG 6 튜터 매핑 정확
 *   2. 가우스 호출 → callModel google + agentic_5step + session insert + final_answer 추출
 *   3. 라마누잔_calc 호출 → calc_haiku + Tier 0
 *   4. 알 수 없는 튜터 → throw
 *   5. 빈 problem_text → throw
 *   6. DB insert 실패 시에도 trace/final_answer 는 반환 (session_id='')
 *
 * 외부 의존성 (callModel + supabase) 모두 모킹.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 모킹 ────────────────────────────────────────────────────────────
const callModelMock = vi.fn();
vi.mock('../call-model', () => ({
  callModel: (...args: unknown[]) => callModelMock(...args),
}));

const insertRowCapture: { row: unknown } = { row: null };
const insertSingleMock = vi.fn(async () => ({
  data: { id: 'mock-session-uuid' },
  error: null,
}));
const selectMock = vi.fn(() => ({ single: insertSingleMock }));
const insertMock = vi.fn((row: unknown) => {
  insertRowCapture.row = row;
  return { select: selectMock };
});
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ from: fromMock }),
}));

import { callTutor, TUTOR_CONFIG } from '../tutor-orchestrator';

beforeEach(() => {
  callModelMock.mockReset();
  insertMock.mockClear();
  selectMock.mockClear();
  insertSingleMock.mockClear();
  fromMock.mockClear();
  insertRowCapture.row = null;
  // DB insert 기본 성공 응답 (실패 시나리오는 개별 테스트에서 override)
  insertSingleMock.mockResolvedValue({
    data: { id: 'mock-session-uuid' },
    error: null,
  });
});

describe('TUTOR_CONFIG', () => {
  it('6 튜터 매핑 — tier / provider / mode 정확', () => {
    expect(TUTOR_CONFIG.ramanujan_calc.tier).toBe(0);
    expect(TUTOR_CONFIG.ramanujan_calc.mode).toBe('calc_haiku');
    expect(TUTOR_CONFIG.ramanujan_calc.provider).toBe('anthropic');

    // G06-30 (Δ8): Tier 1 라마누잔 = Gemini 3.1 Pro baseline.
    expect(TUTOR_CONFIG.ramanujan_intuit.tier).toBe(1);
    expect(TUTOR_CONFIG.ramanujan_intuit.mode).toBe('baseline');
    expect(TUTOR_CONFIG.ramanujan_intuit.provider).toBe('google');

    expect(TUTOR_CONFIG.gauss.tier).toBe(2);
    expect(TUTOR_CONFIG.gauss.provider).toBe('google');
    expect(TUTOR_CONFIG.gauss.mode).toBe('agentic_5step');

    expect(TUTOR_CONFIG.von_neumann.tier).toBe(2);
    expect(TUTOR_CONFIG.von_neumann.provider).toBe('openai');
    expect(TUTOR_CONFIG.von_neumann.mode).toBe('agentic_5step');

    expect(TUTOR_CONFIG.euler.tier).toBe(2);
    expect(TUTOR_CONFIG.euler.provider).toBe('anthropic');
    expect(TUTOR_CONFIG.euler.mode).toBe('agentic_5step');

    expect(TUTOR_CONFIG.leibniz.tier).toBe(2);
    expect(TUTOR_CONFIG.leibniz.provider).toBe('anthropic');
    expect(TUTOR_CONFIG.leibniz.mode).toBe('agentic_5step');
  });
});

describe('callTutor', () => {
  it('가우스 호출 → callModel google + agentic_5step + session insert', async () => {
    callModelMock.mockResolvedValue({
      text: '...풀이 trace...\n최종 답: 12',
      trace: { mode: 'agentic_5step', turns: [{ step: 1, response: '...' }] },
      tool_calls: [],
      duration_ms: 8500,
      model_id: TUTOR_CONFIG.gauss.model,
    });

    const result = await callTutor({
      user_id: 'user-1',
      problem_text: '미적분 킬러 30번 변형',
      tutor: 'gauss',
      call_kind: 'primary',
      routing_decision_id: 'route-uuid-1',
    });

    // callModel 호출 확인
    expect(callModelMock).toHaveBeenCalledTimes(1);
    const callArgs = callModelMock.mock.calls[0][0];
    expect(callArgs.provider).toBe('google');
    expect(callArgs.mode).toBe('agentic_5step');
    expect(callArgs.model_id).toBe(TUTOR_CONFIG.gauss.model);
    expect(callArgs.problem).toBe('미적분 킬러 30번 변형');
    expect(typeof callArgs.system_prompt).toBe('string');
    expect(callArgs.system_prompt).toContain('가우스');

    // DB insert 검증
    expect(fromMock).toHaveBeenCalledWith('legend_tutor_sessions');
    const inserted = insertRowCapture.row as Record<string, unknown>;
    expect(inserted.user_id).toBe('user-1');
    expect(inserted.routing_decision_id).toBe('route-uuid-1');
    expect(inserted.tutor_name).toBe('gauss');
    expect(inserted.tier).toBe(2);
    expect(inserted.call_kind).toBe('primary');
    expect(inserted.model_id).toBe(TUTOR_CONFIG.gauss.model);
    expect(inserted.mode).toBe('agentic_5step');
    expect(typeof inserted.problem_hash).toBe('string');
    expect((inserted.problem_hash as string).length).toBe(64); // sha256 hex
    expect(inserted.final_answer).toBe('12');
    expect(typeof inserted.duration_ms).toBe('number');

    // 반환값 검증
    expect(result.session_id).toBe('mock-session-uuid');
    expect(result.final_answer).toBe('12');
    expect(result.trace_jsonb).toEqual({
      mode: 'agentic_5step',
      turns: [{ step: 1, response: '...' }],
    });
  });

  it('라마누잔_calc 호출 → calc_haiku + Tier 0', async () => {
    callModelMock.mockResolvedValue({
      text: 'SymPy 결과: x = 2\n최종 답: 2',
      trace: { mode: 'calc_haiku' },
      tool_calls: [],
      duration_ms: 1500,
      model_id: TUTOR_CONFIG.ramanujan_calc.model,
    });

    const result = await callTutor({
      user_id: 'user-2',
      problem_text: '2x = 4',
      tutor: 'ramanujan_calc',
      call_kind: 'primary',
      routing_decision_id: 'route-uuid-2',
    });

    const callArgs = callModelMock.mock.calls[0][0];
    expect(callArgs.provider).toBe('anthropic');
    expect(callArgs.mode).toBe('calc_haiku');

    const inserted = insertRowCapture.row as Record<string, unknown>;
    expect(inserted.tutor_name).toBe('ramanujan_calc');
    expect(inserted.tier).toBe(0);
    expect(inserted.mode).toBe('calc_haiku');
    expect(inserted.final_answer).toBe('2');

    expect(result.final_answer).toBe('2');
  });

  it('폰 노이만 호출 → openai + agentic_5step', async () => {
    callModelMock.mockResolvedValue({
      text: '기하 풀이...\n최종 답: 5',
      trace: { mode: 'agentic_5step' },
      tool_calls: [],
      duration_ms: 9000,
      model_id: TUTOR_CONFIG.von_neumann.model,
    });

    await callTutor({
      user_id: 'user-3',
      problem_text: '기하 킬러 변형',
      tutor: 'von_neumann',
      call_kind: 'primary',
      routing_decision_id: 'route-uuid-3',
    });

    const callArgs = callModelMock.mock.calls[0][0];
    expect(callArgs.provider).toBe('openai');
    expect(callArgs.mode).toBe('agentic_5step');

    const inserted = insertRowCapture.row as Record<string, unknown>;
    expect(inserted.tutor_name).toBe('von_neumann');
    expect(inserted.tier).toBe(2);
  });

  it('알 수 없는 튜터 → throw', async () => {
    await expect(
      callTutor({
        user_id: 'user-x',
        problem_text: '...',
        // @ts-expect-error 의도적 잘못된 튜터
        tutor: 'pythagoras',
        call_kind: 'primary',
        routing_decision_id: 'route-uuid-x',
      }),
    ).rejects.toThrow(/unknown tutor/);

    expect(callModelMock).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('빈 problem_text → throw (callModel 호출 X)', async () => {
    await expect(
      callTutor({
        user_id: 'user-y',
        problem_text: '   ',
        tutor: 'gauss',
        call_kind: 'primary',
        routing_decision_id: 'route-uuid-y',
      }),
    ).rejects.toThrow(/problem_text is empty/);

    expect(callModelMock).not.toHaveBeenCalled();
  });

  it('DB insert 실패 시 trace/final_answer 는 반환 (session_id="")', async () => {
    callModelMock.mockResolvedValue({
      text: '풀이...\n최종 답: 7',
      trace: { mode: 'baseline' },
      tool_calls: [],
      duration_ms: 3000,
      model_id: TUTOR_CONFIG.ramanujan_intuit.model,
    });
    insertSingleMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'rls denied' },
    });

    const result = await callTutor({
      user_id: 'user-4',
      problem_text: '간단 문제',
      tutor: 'ramanujan_intuit',
      call_kind: 'primary',
      routing_decision_id: 'route-uuid-4',
    });

    expect(result.session_id).toBe('');
    expect(result.final_answer).toBe('7');
    expect(result.trace_jsonb).toEqual({ mode: 'baseline' });
  });

  it('final_answer 추출 실패 시 마지막 줄 fallback', async () => {
    callModelMock.mockResolvedValue({
      text: '풀이 단계 1\n풀이 단계 2\n결론은 12 입니다',
      trace: { mode: 'baseline' },
      tool_calls: [],
      duration_ms: 2000,
      model_id: TUTOR_CONFIG.ramanujan_intuit.model,
    });

    const result = await callTutor({
      user_id: 'user-5',
      problem_text: 'fallback 추출 문제',
      tutor: 'ramanujan_intuit',
      call_kind: 'primary',
      routing_decision_id: 'route-uuid-5',
    });

    // "최종 답:" 없으므로 마지막 줄 fallback
    expect(result.final_answer).toBe('결론은 12 입니다');
  });
});
