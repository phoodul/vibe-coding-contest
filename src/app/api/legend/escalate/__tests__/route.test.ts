/**
 * Phase G-06 G06-11 — POST /api/legend/escalate 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized
 *   2. 400 invalid_input — choice 누락 / 잘못된 enum
 *   3. 403 forbidden — 다른 user 의 routing_decision (update 결과 null)
 *   4. 정상 — escalate / retry / hint_only 각 next_action 매핑
 *
 * 모킹: supabase server.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 모킹 ──────────────────────────────────────────────────────────────
const getUserMock = vi.fn();
const updateMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: () => ({
      update: (...args: unknown[]) => updateMock(...args),
    }),
  }),
}));

import { POST } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  updateMock.mockReset();
});

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/legend/escalate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** update().eq().eq().select().maybeSingle() 체이닝 모킹 */
function mockUpdateChain(returns: { data: unknown; error: unknown }) {
  updateMock.mockImplementation(() => ({
    eq: () => ({
      eq: () => ({
        select: () => ({
          maybeSingle: async () => returns,
        }),
      }),
    }),
  }));
}

describe('POST /api/legend/escalate', () => {
  it('미인증 시 401 unauthorized', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const res = await POST(
      makeReq({ routing_decision_id: 'd1', choice: 'escalate' }),
    );

    expect(res.status).toBe(401);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('choice 누락 또는 잘못된 enum 시 400 invalid_input', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res1 = await POST(makeReq({ routing_decision_id: 'd1' }));
    expect(res1.status).toBe(400);

    const res2 = await POST(
      makeReq({ routing_decision_id: 'd1', choice: 'unknown_choice' }),
    );
    expect(res2.status).toBe(400);

    expect(updateMock).not.toHaveBeenCalled();
  });

  it('다른 user 의 routing_decision 시 403 forbidden', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockUpdateChain({ data: null, error: null });

    const res = await POST(
      makeReq({ routing_decision_id: 'd1', choice: 'escalate' }),
    );

    expect(res.status).toBe(403);
  });

  it('정상 escalate — next_action.kind=call_tutor + target 동봉', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockUpdateChain({ data: { id: 'd1' }, error: null });

    const res = await POST(
      makeReq({
        routing_decision_id: 'd1',
        choice: 'escalate',
        target_tutor: 'gauss',
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.next_action).toEqual({ kind: 'call_tutor', target: 'gauss' });
  });

  it('정상 retry — next_action.kind=retry_probe', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockUpdateChain({ data: { id: 'd1' }, error: null });

    const res = await POST(
      makeReq({ routing_decision_id: 'd1', choice: 'retry' }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.next_action).toEqual({ kind: 'retry_probe' });
  });

  it('정상 hint_only — next_action.kind=hint_only', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockUpdateChain({ data: { id: 'd1' }, error: null });

    const res = await POST(
      makeReq({ routing_decision_id: 'd1', choice: 'hint_only' }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.next_action).toEqual({ kind: 'hint_only' });
  });
});
