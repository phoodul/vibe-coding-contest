/**
 * Phase G-06 G06-11 — GET /api/legend/quota 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized
 *   2. 정상 — 5 QuotaStatus 모두 반환 (kind 5종 정확 일치)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const checkQuotaMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock('@/lib/legend/quota-manager', () => ({
  checkQuota: (...args: unknown[]) => checkQuotaMock(...args),
}));

import { GET } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  checkQuotaMock.mockReset();
});

describe('GET /api/legend/quota', () => {
  it('미인증 시 401 unauthorized', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const res = await GET();

    expect(res.status).toBe(401);
    expect(checkQuotaMock).not.toHaveBeenCalled();
  });

  it('정상 — 5 QuotaStatus 반환 (kind 일치)', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    checkQuotaMock.mockImplementation((_userId: string, kind: string) =>
      Promise.resolve({
        kind,
        used: 0,
        limit: kind === 'problem_total_daily' ? 5 : 1,
        allowed: true,
        reset_at: '2026-04-29T15:00:00.000Z',
      }),
    );

    const res = await GET();

    expect(res.status).toBe(200);
    const body = (await res.json()) as { quotas: Array<{ kind: string }> };
    expect(body.quotas).toHaveLength(5);

    const kinds = body.quotas.map((q) => q.kind);
    expect(kinds).toEqual([
      'problem_total_daily',
      'legend_call_daily',
      'report_per_problem_daily',
      'weekly_report',
      'monthly_report',
    ]);

    expect(checkQuotaMock).toHaveBeenCalledTimes(5);
  });
});
