/**
 * G06-27 — POST /api/admin/beta-applications/[id]/approve 단위 테스트
 *
 * 시나리오:
 *   1. 401 — 미인증
 *   2. 403 — non-admin
 *   3. 400 — invalid action
 *   4. 200 — approve 정상 (invite_code 발급)
 *   5. 200 — reject 정상 (invite_code null)
 *   6. 409 — beta_full
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const rpcMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    rpc: rpcMock,
  }),
}));

import { POST } from '../route';

const ADMIN = { id: 'admin-1', email: 'phoodul@gmail.com' };

function makeReq(body: unknown) {
  return new Request('http://test/api/admin/beta-applications/app-1/approve', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const ctx = { params: Promise.resolve({ id: 'app-1' }) };

beforeEach(() => {
  getUserMock.mockReset();
  rpcMock.mockReset();
});

describe('POST /api/admin/beta-applications/[id]/approve', () => {
  it('미인증 시 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeReq({ action: 'approve' }), ctx);
    expect(res.status).toBe(401);
  });

  it('비-admin 403', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'u', email: 'other@example.com' } },
    });
    const res = await POST(makeReq({ action: 'approve' }), ctx);
    expect(res.status).toBe(403);
  });

  it('invalid action 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: ADMIN } });
    const res = await POST(makeReq({ action: 'foo' }), ctx);
    expect(res.status).toBe(400);
  });

  it('approve 정상 — invite_code 발급', async () => {
    getUserMock.mockResolvedValue({ data: { user: ADMIN } });
    rpcMock.mockResolvedValue({
      data: [{ id: 'app-1', status: 'approved', invite_code: 'BETA-app-1abc' }],
      error: null,
    });

    const res = await POST(makeReq({ action: 'approve', comment: '환영합니다' }), ctx);
    expect(res.status).toBe(200);
    expect(rpcMock).toHaveBeenCalledWith(
      'review_beta_application',
      expect.objectContaining({
        p_application_id: 'app-1',
        p_action: 'approve',
        p_comment: '환영합니다',
      }),
    );
    const body = (await res.json()) as {
      id: string;
      status: string;
      invite_code: string | null;
    };
    expect(body.status).toBe('approved');
    expect(body.invite_code).toMatch(/^BETA-/);
  });

  it('reject 정상 — invite_code null', async () => {
    getUserMock.mockResolvedValue({ data: { user: ADMIN } });
    rpcMock.mockResolvedValue({
      data: [{ id: 'app-1', status: 'rejected', invite_code: null }],
      error: null,
    });

    const res = await POST(makeReq({ action: 'reject', comment: '추후 안내' }), ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; invite_code: string | null };
    expect(body.status).toBe('rejected');
    expect(body.invite_code).toBeNull();
  });

  it('beta_full 시 409', async () => {
    getUserMock.mockResolvedValue({ data: { user: ADMIN } });
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: 'beta_full' },
    });

    const res = await POST(makeReq({ action: 'approve' }), ctx);
    expect(res.status).toBe(409);
  });
});
