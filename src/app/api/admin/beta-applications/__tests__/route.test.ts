/**
 * G06-27 — GET /api/admin/beta-applications 단위 테스트
 *
 * 시나리오:
 *   1. 401 — 미인증
 *   2. 403 — non-admin email
 *   3. 200 — admin 정상 조회 (status filter)
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

import { GET } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  rpcMock.mockReset();
});

describe('GET /api/admin/beta-applications', () => {
  it('미인증 시 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const req = new Request('http://test/api/admin/beta-applications');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('비-admin email 403', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'u1', email: 'random@example.com' } },
    });
    const req = new Request('http://test/api/admin/beta-applications');
    const res = await GET(req);
    expect(res.status).toBe(403);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('admin 정상 조회 (status filter)', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'phoodul@gmail.com' } },
    });
    rpcMock.mockResolvedValue({
      data: [
        { id: 'app-1', status: 'pending', motivation: 'm', feedback_consent: true },
      ],
      error: null,
    });

    const req = new Request('http://test/api/admin/beta-applications?status=pending');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(rpcMock).toHaveBeenCalledWith(
      'list_beta_applications',
      expect.objectContaining({ p_status: 'pending' }),
    );
    const body = (await res.json()) as { applications: Array<{ id: string }> };
    expect(body.applications).toHaveLength(1);
  });

  it('status=all 시 p_status null 전달', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'phoodul@gmail.com' } },
    });
    rpcMock.mockResolvedValue({ data: [], error: null });

    const req = new Request('http://test/api/admin/beta-applications?status=all');
    await GET(req);
    expect(rpcMock).toHaveBeenCalledWith(
      'list_beta_applications',
      expect.objectContaining({ p_status: null }),
    );
  });
});
