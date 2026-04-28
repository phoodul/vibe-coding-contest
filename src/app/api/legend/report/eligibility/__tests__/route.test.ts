/**
 * Phase G-06 G06-16 — GET /api/legend/report/eligibility 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized
 *   2. 정상 — 5 quota + weekly/monthly eligibility 추출
 *   3. weekly eligible=false (current < 10), monthly eligible=true (current >= 20)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { QuotaKind } from '@/lib/legend/types';

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

describe('GET /api/legend/report/eligibility', () => {
  it('미인증 → 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('정상 — 5 quota 모두 조회 + weekly/monthly eligibility 응답', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    checkQuotaMock.mockImplementation((_userId: string, kind: QuotaKind) => {
      const eligibility =
        kind === 'weekly_report'
          ? { current: 7, required: 10 }
          : kind === 'monthly_report'
            ? { current: 25, required: 20 }
            : undefined;
      return Promise.resolve({
        kind,
        used: 0,
        limit: 1,
        allowed: kind === 'weekly_report' ? false : true,
        blocked_reason: kind === 'weekly_report' ? 'eligibility_gate' : undefined,
        eligibility,
        reset_at: '2026-04-29T15:00:00.000Z',
      });
    });

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.weekly.eligible).toBe(false);
    expect(body.weekly.current).toBe(7);
    expect(body.weekly.required).toBe(10);
    expect(body.monthly.eligible).toBe(true);
    expect(body.monthly.current).toBe(25);
    expect(body.monthly.required).toBe(20);
    expect(body.lifetime_problem_count).toBe(25);
    expect(body.quotas).toHaveLength(5);
    expect(checkQuotaMock).toHaveBeenCalledTimes(5);
  });
});
