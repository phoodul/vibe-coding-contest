/**
 * Phase G-06 G06-11 — POST /api/legend/solve 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized — auth.getUser 가 user=null 반환
 *   2. 400 invalid_input — routing_decision_id / tutor / problem_text 누락
 *   3. 403 forbidden — 다른 user_id 의 routing_decision
 *   4. 402 quota_exceeded — problem_total_daily 한도 초과
 *   5. 정상 SSE — tutor_turn / tool_call / final 메시지 + Tier 2 시 legend_call quota 소진
 *
 * 모킹: supabase server / callTutor / consumeQuota.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 모킹 ──────────────────────────────────────────────────────────────
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
  // /retry-with-tutor 가 import 하지만 /solve 는 미사용
  TUTOR_CONFIG: { gauss: { tier: 2 }, ramanujan_intuit: { tier: 1 } },
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
  return new Request('http://localhost/api/legend/solve', {
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

/** legend_routing_decisions select 모킹용 helper */
function mockRoutingDecision(row: { user_id: string; routed_tier: number } | null) {
  fromMock.mockImplementation((table: string) => {
    if (table !== 'legend_routing_decisions') {
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
      };
    }
    return {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: row }),
        }),
      }),
    };
  });
}

describe('POST /api/legend/solve', () => {
  it('미인증 시 401 unauthorized', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        tutor: 'gauss',
        problem_text: 'x^2-4=0',
      }),
    );

    expect(res.status).toBe(401);
    expect(callTutorMock).not.toHaveBeenCalled();
    expect(consumeQuotaMock).not.toHaveBeenCalled();
  });

  it('필수 필드 누락 시 400 invalid_input', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res = await POST(makeReq({ tutor: 'gauss' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'invalid_input' });
    expect(callTutorMock).not.toHaveBeenCalled();
  });

  it('다른 user_id 의 routing_decision 시 403 forbidden', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRoutingDecision({ user_id: 'OTHER', routed_tier: 2 });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        tutor: 'gauss',
        problem_text: 'x',
      }),
    );

    expect(res.status).toBe(403);
    expect(consumeQuotaMock).not.toHaveBeenCalled();
    expect(callTutorMock).not.toHaveBeenCalled();
  });

  it('quota 한도 초과 시 402 quota_exceeded', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRoutingDecision({ user_id: 'u1', routed_tier: 2 });
    consumeQuotaMock.mockResolvedValueOnce({
      kind: 'problem_total_daily',
      used: 5,
      limit: 5,
      allowed: false,
      blocked_reason: 'limit_exceeded',
      reset_at: '2026-04-29T15:00:00.000Z',
    });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        tutor: 'gauss',
        problem_text: 'x',
      }),
    );

    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe('quota_exceeded');
    expect(body.quota.kind).toBe('problem_total_daily');
    expect(callTutorMock).not.toHaveBeenCalled();
  });

  it('정상 — Tier 2 면 legend_call quota 추가 소진 + tutor_turn / tool_call / final 메시지', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRoutingDecision({ user_id: 'u1', routed_tier: 2 });
    consumeQuotaMock
      .mockResolvedValueOnce({ kind: 'problem_total_daily', used: 1, limit: 5, allowed: true, reset_at: 'x' })
      .mockResolvedValueOnce({ kind: 'legend_call_daily', used: 1, limit: 3, allowed: true, reset_at: 'x' });
    callTutorMock.mockResolvedValue({
      session_id: 'sess-1',
      trace_jsonb: {
        turns: [
          { content: 'turn 1', tool_calls: [{ name: 'sympy', error: null }] },
          { content: 'turn 2', tool_calls: [] },
        ],
      },
      final_answer: '42',
      duration_ms: 2000,
      actual_tutor: 'gauss',
    });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        tutor: 'gauss',
        problem_text: 'x^2-4=0',
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const events = await readSSEMessages(res.body!);
    const types = events.map((e) => (e as { type: string }).type);
    expect(types).toContain('tutor_turn');
    expect(types).toContain('tool_call');
    expect(types).toContain('final');

    const finalEv = events.find((e) => (e as { type: string }).type === 'final') as {
      payload: { answer: string; session_id: string; actual_tutor: string };
    };
    expect(finalEv.payload.answer).toBe('42');
    expect(finalEv.payload.session_id).toBe('sess-1');
    expect(finalEv.payload.actual_tutor).toBe('gauss');

    // Tier 2 → consumeQuota 2회 (problem_total + legend_call)
    expect(consumeQuotaMock).toHaveBeenCalledTimes(2);
    expect(consumeQuotaMock.mock.calls[0][1]).toBe('problem_total_daily');
    expect(consumeQuotaMock.mock.calls[1][1]).toBe('legend_call_daily');
  });

  // ── G06-32 (Δ9) — Trial Access Tier 시나리오 ─────────────────────────
  describe('Trial Access Tier (Δ9)', () => {
    it('trial 사용자가 Tier 2 (gauss) 호출 시 → 402 beta_only + apply_url', async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: 'u-trial' } } });
      mockRoutingDecision({ user_id: 'u-trial', routed_tier: 2 });
      getUserAccessTierMock.mockResolvedValue('trial');

      const res = await POST(
        makeReq({
          routing_decision_id: 'd1',
          tutor: 'gauss',
          problem_text: 'x',
        }),
      );

      expect(res.status).toBe(402);
      const body = await res.json();
      expect(body.error).toBe('beta_only');
      expect(body.apply_url).toBe('/legend/beta/apply');
      // 거부됨 → quota 소진 호출 X
      expect(consumeQuotaMock).not.toHaveBeenCalled();
      expect(callTutorMock).not.toHaveBeenCalled();
    });

    it('trial 사용자가 라마누잔 (Tier 1) 호출 → trial_ramanujan_daily 만 소진', async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: 'u-trial' } } });
      mockRoutingDecision({ user_id: 'u-trial', routed_tier: 1 });
      getUserAccessTierMock.mockResolvedValue('trial');
      consumeQuotaMock.mockResolvedValueOnce({
        kind: 'trial_ramanujan_daily',
        used: 1,
        limit: 3,
        allowed: true,
        reset_at: 'x',
      });
      callTutorMock.mockResolvedValue({
        session_id: 'sess-trial',
        trace_jsonb: { turns: [{ content: 'hi', tool_calls: [] }] },
        final_answer: '7',
        duration_ms: 500,
        actual_tutor: 'ramanujan_intuit',
      });

      const res = await POST(
        makeReq({
          routing_decision_id: 'd1',
          tutor: 'ramanujan_intuit',
          problem_text: 'x',
        }),
      );

      expect(res.status).toBe(200);
      // 단 1회 — trial_ramanujan_daily 만
      expect(consumeQuotaMock).toHaveBeenCalledTimes(1);
      expect(consumeQuotaMock.mock.calls[0][1]).toBe('trial_ramanujan_daily');
    });

    it('trial 사용자 라마누잔 호출 quota 소진 (used 3/3) → 402 trial_quota_exceeded', async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: 'u-trial' } } });
      mockRoutingDecision({ user_id: 'u-trial', routed_tier: 1 });
      getUserAccessTierMock.mockResolvedValue('trial');
      consumeQuotaMock.mockResolvedValueOnce({
        kind: 'trial_ramanujan_daily',
        used: 3,
        limit: 3,
        allowed: false,
        blocked_reason: 'limit_exceeded',
        reset_at: 'x',
      });

      const res = await POST(
        makeReq({
          routing_decision_id: 'd1',
          tutor: 'ramanujan_intuit',
          problem_text: 'x',
        }),
      );

      expect(res.status).toBe(402);
      const body = await res.json();
      expect(body.error).toBe('trial_quota_exceeded');
      expect(body.apply_url).toBe('/legend/beta/apply');
      expect(callTutorMock).not.toHaveBeenCalled();
    });
  });
});
