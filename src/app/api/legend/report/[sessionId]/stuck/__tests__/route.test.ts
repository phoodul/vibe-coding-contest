/**
 * Phase G-06 G06-16 — POST /api/legend/report/[sessionId]/stuck 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized
 *   2. 404 session_not_found
 *   3. 403 user_id 불일치
 *   4. 400 body 누락 / step_index 음수
 *   5. 200 정상 + recordStuck 호출
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const sessionRow: { value: { user_id: string } | null } = { value: null };
const recordStuckMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: sessionRow.value, error: null }),
        }),
      }),
    }),
  }),
}));

vi.mock('@/lib/legend/report/stuck-tracker', () => ({
  recordStuck: (...args: unknown[]) => recordStuckMock(...args),
}));

import { POST } from '../route';

const SESSION_ID = '00000000-0000-0000-0000-000000000456';

function makeReq(body: unknown): Request {
  return new Request(`http://localhost/api/legend/report/${SESSION_ID}/stuck`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  getUserMock.mockReset();
  recordStuckMock.mockReset();
  sessionRow.value = null;
});

describe('POST /api/legend/report/[sessionId]/stuck', () => {
  it('미인증 → 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeReq({ step_index: 0 }), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    });

    expect(res.status).toBe(401);
  });

  it('session 없음 → 404', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = null;

    const res = await POST(makeReq({ step_index: 0 }), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    });

    expect(res.status).toBe(404);
  });

  it('user_id 불일치 → 403', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'other' };

    const res = await POST(makeReq({ step_index: 0 }), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    });

    expect(res.status).toBe(403);
  });

  it('step_index 누락 → 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'u1' };

    const res = await POST(makeReq({}), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    });

    expect(res.status).toBe(400);
  });

  it('정상 → 200 + recordStuck 호출', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'u1' };
    recordStuckMock.mockResolvedValue(undefined);

    const res = await POST(makeReq({ step_index: 2, delta_stuck_ms: 5000, delta_revisits: 1 }), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    });

    expect(res.status).toBe(200);
    expect(recordStuckMock).toHaveBeenCalledWith({
      session_id: SESSION_ID,
      step_index: 2,
      delta_stuck_ms: 5000,
      delta_revisits: 1,
    });
  });
});
