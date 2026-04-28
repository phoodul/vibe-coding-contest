/**
 * Phase G-06 G06-09 — tutor fallback 매트릭스 + Gemini 429 자동 전환 단위 테스트.
 *
 * 시나리오:
 *   A. classifyError — provider 별 reason 정확 분류
 *   B. getNextFallback — 1단계 자동, 2단계 이후 null
 *   C. FALLBACK_MATRIX — 6 튜터 매트릭스 architecture §9.5 표 일치
 *   D. callTutor with fallback — 정상 / Gemini 429 → 폰 노이만 / 1단계도 실패 → throw
 *
 * 외부 의존성 (callModel + supabase) 모두 모킹.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 모킹 ────────────────────────────────────────────────────────────
const callModelMock = vi.fn();
vi.mock('../call-model', () => ({
  callModel: (...args: unknown[]) => callModelMock(...args),
}));

const insertedRows: unknown[] = [];
const insertSingleMock = vi.fn(async () => ({
  data: { id: 'mock-session-uuid' },
  error: null,
}));
const selectMock = vi.fn(() => ({ single: insertSingleMock }));
const insertMock = vi.fn((row: unknown) => {
  insertedRows.push(row);
  return { select: selectMock };
});
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ from: fromMock }),
}));

import { callTutor, TUTOR_CONFIG } from '../tutor-orchestrator';
import {
  FALLBACK_MATRIX,
  classifyError,
  getNextFallback,
  buildFallbackMessage,
} from '../tutor-fallback';

beforeEach(() => {
  callModelMock.mockReset();
  insertMock.mockClear();
  selectMock.mockClear();
  insertSingleMock.mockClear();
  fromMock.mockClear();
  insertedRows.length = 0;
  insertSingleMock.mockResolvedValue({
    data: { id: 'mock-session-uuid' },
    error: null,
  });
});

// ────────────────────────────────────────────────────────────────────────────
// A. classifyError
// ────────────────────────────────────────────────────────────────────────────

describe('classifyError', () => {
  it('Gemini 429 RESOURCE_EXHAUSTED → gemini_429', () => {
    expect(
      classifyError({
        status: 429,
        message: 'RESOURCE_EXHAUSTED quota exceeded',
      }),
    ).toBe('gemini_429');
  });

  it('call-model.ts 의 raw fetch 메시지 "Gemini 429: ..." → gemini_429', () => {
    expect(
      classifyError(new Error('[call-model] Gemini 429: quota exceeded')),
    ).toBe('gemini_429');
  });

  it('Anthropic 529 overload → anthropic_rate_limit', () => {
    expect(classifyError({ status: 529, message: 'overloaded' })).toBe(
      'anthropic_rate_limit',
    );
  });

  it('Anthropic 429 (메시지에 Anthropic 명시) → anthropic_rate_limit', () => {
    expect(
      classifyError({
        status: 429,
        message: '[call-model] Anthropic 429: rate limited',
      }),
    ).toBe('anthropic_rate_limit');
  });

  it('OpenAI 429 → openai_rate_limit', () => {
    expect(
      classifyError({
        status: 429,
        message: '[call-model] OpenAI 429: rate limited',
      }),
    ).toBe('openai_rate_limit');
  });

  it('일반 에러 (timeout) → generic_error', () => {
    expect(classifyError(new Error('connect ETIMEDOUT'))).toBe('generic_error');
  });

  it('null/undefined 에러 → generic_error', () => {
    expect(classifyError(null)).toBe('generic_error');
    expect(classifyError(undefined)).toBe('generic_error');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// B. getNextFallback
// ────────────────────────────────────────────────────────────────────────────

describe('getNextFallback', () => {
  it('가우스 1단계 fallback = 폰 노이만', () => {
    expect(getNextFallback('gauss', 0)).toBe('von_neumann');
  });

  it('폰 노이만 1단계 fallback = 가우스', () => {
    expect(getNextFallback('von_neumann', 0)).toBe('gauss');
  });

  it('오일러 1단계 fallback = 라이프니츠', () => {
    expect(getNextFallback('euler', 0)).toBe('leibniz');
  });

  it('라이프니츠 1단계 fallback = 오일러', () => {
    expect(getNextFallback('leibniz', 0)).toBe('euler');
  });

  it('라마누잔_calc 1단계 fallback = 라마누잔_intuit', () => {
    expect(getNextFallback('ramanujan_calc', 0)).toBe('ramanujan_intuit');
  });

  it('라마누잔_intuit 1단계 fallback = 라이프니츠', () => {
    expect(getNextFallback('ramanujan_intuit', 0)).toBe('leibniz');
  });

  it('1단계 초과 시 null (자동 fallback X) — attempt=1', () => {
    expect(getNextFallback('gauss', 1)).toBeNull();
    expect(getNextFallback('von_neumann', 1)).toBeNull();
    expect(getNextFallback('ramanujan_calc', 1)).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// C. FALLBACK_MATRIX (architecture §9.5 표 검증)
// ────────────────────────────────────────────────────────────────────────────

describe('FALLBACK_MATRIX', () => {
  it('6 튜터 모두 매트릭스에 존재', () => {
    expect(Object.keys(FALLBACK_MATRIX).sort()).toEqual([
      'euler',
      'gauss',
      'leibniz',
      'ramanujan_calc',
      'ramanujan_intuit',
      'von_neumann',
    ]);
  });

  it('Tier 2 4 튜터는 1·2순위 모두 보유', () => {
    expect(FALLBACK_MATRIX.gauss).toEqual(['von_neumann', 'leibniz']);
    expect(FALLBACK_MATRIX.von_neumann).toEqual(['gauss', 'euler']);
    expect(FALLBACK_MATRIX.euler).toEqual(['leibniz', 'gauss']);
    expect(FALLBACK_MATRIX.leibniz).toEqual(['euler', 'von_neumann']);
  });

  it('라마누잔 2종은 1순위만', () => {
    expect(FALLBACK_MATRIX.ramanujan_calc).toEqual(['ramanujan_intuit']);
    expect(FALLBACK_MATRIX.ramanujan_intuit).toEqual(['leibniz']);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// D. buildFallbackMessage
// ────────────────────────────────────────────────────────────────────────────

describe('buildFallbackMessage', () => {
  it('가우스 → 폰 노이만 메시지', () => {
    const msg = buildFallbackMessage({
      primary: 'gauss',
      fallback_to: 'von_neumann',
      reason: 'gemini_429',
      error_message: 'quota',
      attempt: 1,
    });
    expect(msg).toContain('가우스');
    expect(msg).toContain('폰 노이만');
    expect(msg).toMatch(/잠시 휴식/);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// E. callTutor with fallback (통합 — 모킹된 callModel)
// ────────────────────────────────────────────────────────────────────────────

describe('callTutor with fallback', () => {
  it('가우스 정상 호출 → fallback_event 없음 + actual_tutor=gauss', async () => {
    callModelMock.mockResolvedValueOnce({
      text: '풀이...\n최종 답: 5',
      trace: { mode: 'agentic_5step' },
      tool_calls: [],
      duration_ms: 8000,
      model_id: TUTOR_CONFIG.gauss.model,
    });

    const result = await callTutor({
      user_id: 'u1',
      problem_text: '미적분 킬러',
      tutor: 'gauss',
      call_kind: 'primary',
      routing_decision_id: 'r1',
    });

    expect(result.fallback_event).toBeUndefined();
    expect(result.actual_tutor).toBe('gauss');
    expect(result.final_answer).toBe('5');
    expect(callModelMock).toHaveBeenCalledTimes(1);
  });

  it('Gemini 429 → 폰 노이만 자동 fallback + fallback_event 포함', async () => {
    callModelMock
      .mockRejectedValueOnce(
        Object.assign(
          new Error('[call-model] Gemini 429: RESOURCE_EXHAUSTED'),
          { status: 429 },
        ),
      )
      .mockResolvedValueOnce({
        text: 'GPT-5.5 풀이...\n최종 답: 5',
        trace: { mode: 'agentic_5step' },
        tool_calls: [],
        duration_ms: 9000,
        model_id: TUTOR_CONFIG.von_neumann.model,
      });

    const result = await callTutor({
      user_id: 'u1',
      problem_text: '미적분 킬러',
      tutor: 'gauss',
      call_kind: 'primary',
      routing_decision_id: 'r1',
    });

    expect(result.actual_tutor).toBe('von_neumann');
    expect(result.fallback_event).toBeDefined();
    expect(result.fallback_event?.primary).toBe('gauss');
    expect(result.fallback_event?.fallback_to).toBe('von_neumann');
    expect(result.fallback_event?.reason).toBe('gemini_429');
    expect(result.fallback_event?.attempt).toBe(1);
    expect(result.final_answer).toBe('5');

    // callModel 2회 호출 (primary 실패 + fallback 성공)
    expect(callModelMock).toHaveBeenCalledTimes(2);
    const firstCall = callModelMock.mock.calls[0][0];
    expect(firstCall.provider).toBe('google');
    const secondCall = callModelMock.mock.calls[1][0];
    expect(secondCall.provider).toBe('openai');

    // DB insert 2건 — 첫 insert 는 primary 실패로 발생 X, fallback 만 insert 됨.
    // (callTutorInternal 은 callModel throw 시 DB insert 까지 가지 않음)
    expect(insertedRows.length).toBe(1);
    const inserted = insertedRows[0] as Record<string, unknown>;
    expect(inserted.tutor_name).toBe('von_neumann');
    expect(inserted.call_kind).toBe('retry'); // fallback 호출은 retry 로 기록
  });

  it('1단계 fallback 도 실패 → throw (자동 2단계 X)', async () => {
    callModelMock
      .mockRejectedValueOnce(
        Object.assign(new Error('[call-model] Gemini 429'), { status: 429 }),
      )
      .mockRejectedValueOnce(
        Object.assign(new Error('[call-model] OpenAI 429: rate'), {
          status: 429,
        }),
      );

    await expect(
      callTutor({
        user_id: 'u1',
        problem_text: '미적분 킬러',
        tutor: 'gauss',
        call_kind: 'primary',
        routing_decision_id: 'r1',
      }),
    ).rejects.toThrow();

    // 정확히 2회 (primary + 1단계 fallback) — 2단계 시도 X
    expect(callModelMock).toHaveBeenCalledTimes(2);
  });

  it('오일러 (Opus 429) → 라이프니츠 자동 fallback', async () => {
    callModelMock
      .mockRejectedValueOnce(
        Object.assign(new Error('[call-model] Anthropic 529: overloaded'), {
          status: 529,
        }),
      )
      .mockResolvedValueOnce({
        text: 'Sonnet 풀이...\n최종 답: 7',
        trace: { mode: 'agentic_5step' },
        tool_calls: [],
        duration_ms: 7500,
        model_id: TUTOR_CONFIG.leibniz.model,
      });

    const result = await callTutor({
      user_id: 'u2',
      problem_text: '확률 킬러',
      tutor: 'euler',
      call_kind: 'primary',
      routing_decision_id: 'r2',
    });

    expect(result.actual_tutor).toBe('leibniz');
    expect(result.fallback_event?.primary).toBe('euler');
    expect(result.fallback_event?.fallback_to).toBe('leibniz');
    expect(result.fallback_event?.reason).toBe('anthropic_rate_limit');
  });

  it('라마누잔_intuit 실패 → 라이프니츠 fallback', async () => {
    callModelMock
      .mockRejectedValueOnce(
        Object.assign(new Error('[call-model] Anthropic 529'), {
          status: 529,
        }),
      )
      .mockResolvedValueOnce({
        text: '라이프니츠 풀이...\n최종 답: 3',
        trace: { mode: 'agentic_5step' },
        tool_calls: [],
        duration_ms: 6000,
        model_id: TUTOR_CONFIG.leibniz.model,
      });

    const result = await callTutor({
      user_id: 'u3',
      problem_text: '간단 추론 문제',
      tutor: 'ramanujan_intuit',
      call_kind: 'primary',
      routing_decision_id: 'r3',
    });

    expect(result.actual_tutor).toBe('leibniz');
    expect(result.fallback_event?.primary).toBe('ramanujan_intuit');
    expect(result.fallback_event?.fallback_to).toBe('leibniz');
  });

  it('알 수 없는 튜터 throw 는 fallback 없이 즉시 전파', async () => {
    await expect(
      callTutor({
        user_id: 'u-x',
        problem_text: '...',
        // @ts-expect-error 의도적 잘못된 튜터
        tutor: 'pythagoras',
        call_kind: 'primary',
        routing_decision_id: 'r-x',
      }),
    ).rejects.toThrow(/unknown tutor/);

    expect(callModelMock).not.toHaveBeenCalled();
  });
});
