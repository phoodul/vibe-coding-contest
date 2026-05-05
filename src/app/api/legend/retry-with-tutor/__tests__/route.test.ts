/**
 * Phase G-06 G06-11 — POST /api/legend/retry-with-tutor 단위 테스트.
 *
 * /solve 와 거의 동일하지만 routing skip + call_kind=second_opinion 기본 + Δ1 #5 quota 동일 소진.
 *
 * 시나리오:
 *   1. 401 unauthorized
 *   2. 400 invalid_input — 필수 누락 / 알 수 없는 target_tutor
 *   3. 403 forbidden — 다른 user_id 의 routing_decision
 *   4. 402 quota_exceeded
 *   5. 정상 — Tier 2 target → problem_total + legend_call 둘 다 소진 + final 메시지
 *   6. Tier 1 target — problem_total 만 소진 (legend_call 호출 X)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const callTutorMock = vi.fn();
const consumeQuotaMock = vi.fn();
const fromMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: (...args: unknown[]) => fromMock(...args),
  }),
}));

vi.mock('@/lib/legend/tutor-orchestrator', () => ({
  callTutor: (...args: unknown[]) => callTutorMock(...args),
  TUTOR_CONFIG: {
    gauss: { tier: 2 },
    von_neumann: { tier: 2 },
    ramanujan_intuit: { tier: 1 },
    ramanujan_calc: { tier: 0 },
  },
}));

vi.mock('@/lib/legend/quota-manager', () => ({
  consumeQuota: (...args: unknown[]) => consumeQuotaMock(...args),
}));

// G06-32 (Δ9) — Access Tier 게이트. 기존 라우트 테스트는 'beta' 사용자 시나리오를 가정.
const getUserAccessTierMock = vi.fn(async () => 'beta' as const);
vi.mock('@/lib/legend/access-tier', () => ({
  getUserAccessTier: (...args: unknown[]) => getUserAccessTierMock(...args),
}));

import { POST } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  callTutorMock.mockReset();
  consumeQuotaMock.mockReset();
  fromMock.mockReset();
  getUserAccessTierMock.mockReset();
  getUserAccessTierMock.mockResolvedValue('beta');
});

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/legend/retry-with-tutor', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readSSEMessages(stream: ReadableStream<Uint8Array>): Promise<unknown[]> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const events: unknown[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);
      if (chunk.startsWith('data:')) {
        const payload = chunk.slice('data:'.length).trim();
        events.push(JSON.parse(payload));
      }
    }
  }
  return events;
}

function mockRoutingDecision(row: { user_id: string } | null) {
  fromMock.mockImplementation(() => ({
    select: () => ({
      eq: () => ({ maybeSingle: async () => ({ data: row }) }),
    }),
  }));
}

describe('POST /api/legend/retry-with-tutor', () => {
  it('미인증 시 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        target_tutor: 'gauss',
        problem_text: 'x',
      }),
    );
    expect(res.status).toBe(401);
  });

  it('필수 누락 또는 알 수 없는 target_tutor 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res1 = await POST(makeReq({ routing_decision_id: 'd1' }));
    expect(res1.status).toBe(400);

    const res2 = await POST(
      makeReq({
        routing_decision_id: 'd1',
        target_tutor: 'unknown_tutor',
        problem_text: 'x',
      }),
    );
    expect(res2.status).toBe(400);
    expect(callTutorMock).not.toHaveBeenCalled();
  });

  it('다른 user 의 routing_decision 시 403', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRoutingDecision({ user_id: 'OTHER' });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        target_tutor: 'gauss',
        problem_text: 'x',
      }),
    );
    expect(res.status).toBe(403);
    expect(consumeQuotaMock).not.toHaveBeenCalled();
  });

  it('quota 한도 초과 시 402', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRoutingDecision({ user_id: 'u1' });
    consumeQuotaMock.mockResolvedValueOnce({
      kind: 'problem_total_daily',
      used: 5,
      limit: 5,
      allowed: false,
      blocked_reason: 'limit_exceeded',
      reset_at: 'x',
    });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        target_tutor: 'gauss',
        problem_text: 'x',
      }),
    );
    expect(res.status).toBe(402);
    expect(callTutorMock).not.toHaveBeenCalled();
  });

  it('Tier 2 target — problem_total + legend_call 둘 다 소진 + final 메시지', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRoutingDecision({ user_id: 'u1' });
    consumeQuotaMock
      .mockResolvedValueOnce({ kind: 'problem_total_daily', used: 1, limit: 5, allowed: true, reset_at: 'x' })
      .mockResolvedValueOnce({ kind: 'legend_call_daily', used: 1, limit: 3, allowed: true, reset_at: 'x' });
    callTutorMock.mockResolvedValue({
      session_id: 'sess-2',
      trace_jsonb: { turns: [{ content: 't1', tool_calls: [] }] },
      final_answer: '7',
      duration_ms: 1500,
      actual_tutor: 'von_neumann',
    });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        target_tutor: 'von_neumann',
        problem_text: 'geometry x',
      }),
    );

    expect(res.status).toBe(200);
    const events = await readSSEMessages(res.body!);
    const finalEv = events.find((e) => (e as { type: string }).type === 'final') as
      | { payload: { answer: string; session_id: string } }
      | undefined;
    expect(finalEv?.payload.answer).toBe('7');
    expect(finalEv?.payload.session_id).toBe('sess-2');

    expect(consumeQuotaMock).toHaveBeenCalledTimes(2);
    expect(consumeQuotaMock.mock.calls[0][1]).toBe('problem_total_daily');
    expect(consumeQuotaMock.mock.calls[1][1]).toBe('legend_call_daily');

    // call_kind 기본 = 'second_opinion'
    expect(callTutorMock.mock.calls[0][0].call_kind).toBe('second_opinion');
  });

  it('Tier 1 target — legend_call quota 호출 X', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRoutingDecision({ user_id: 'u1' });
    consumeQuotaMock.mockResolvedValueOnce({
      kind: 'problem_total_daily',
      used: 1,
      limit: 5,
      allowed: true,
      reset_at: 'x',
    });
    callTutorMock.mockResolvedValue({
      session_id: 'sess-3',
      trace_jsonb: {},
      final_answer: '5',
      duration_ms: 800,
      actual_tutor: 'ramanujan_intuit',
    });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        target_tutor: 'ramanujan_intuit',
        problem_text: 'easy',
      }),
    );

    expect(res.status).toBe(200);
    // body 소비 (dangling stream 방지)
    await readSSEMessages(res.body!);

    expect(consumeQuotaMock).toHaveBeenCalledTimes(1);
    expect(consumeQuotaMock.mock.calls[0][1]).toBe('problem_total_daily');
  });
});
