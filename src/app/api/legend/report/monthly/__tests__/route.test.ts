/**
 * Phase G-06 G06-16 — POST /api/legend/report/monthly 단위 테스트.
 *
 * 시나리오: weekly 와 동일 패턴, kind='monthly_report' / windowDays=30 만 차이.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const checkQuotaMock = vi.fn();
const consumeQuotaMock = vi.fn();
const aggregateWeaknessMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock('@/lib/legend/quota-manager', () => ({
  checkQuota: (...args: unknown[]) => checkQuotaMock(...args),
  consumeQuota: (...args: unknown[]) => consumeQuotaMock(...args),
}));

vi.mock('@/lib/euler/weakness-aggregator', () => ({
  aggregateWeakness: (...args: unknown[]) => aggregateWeaknessMock(...args),
}));

// G06-32 (Δ9) — Access Tier 게이트. 기존 테스트는 'beta' 사용자 시나리오.
const getUserAccessTierMock = vi.fn(async () => 'beta' as const);
vi.mock('@/lib/legend/access-tier', () => ({
  getUserAccessTier: (...args: unknown[]) => getUserAccessTierMock(...args),
}));

import { POST } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  checkQuotaMock.mockReset();
  consumeQuotaMock.mockReset();
  aggregateWeaknessMock.mockReset();
  getUserAccessTierMock.mockReset();
  getUserAccessTierMock.mockResolvedValue('beta');
});

describe('POST /api/legend/report/monthly', () => {
  it('미인증 → 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('eligibility_gate 미충족 (lifetime < 20) → 402', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    checkQuotaMock.mockResolvedValue({
      kind: 'monthly_report',
      allowed: false,
      blocked_reason: 'eligibility_gate',
      eligibility: { current: 12, required: 20 },
      used: 0,
      limit: 1,
      reset_at: '...',
    });

    const res = await POST();
    expect(res.status).toBe(402);
    expect(consumeQuotaMock).not.toHaveBeenCalled();
  });

  it('정상 → 200 + aggregateWeakness(windowDays=30)', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    checkQuotaMock.mockResolvedValue({ kind: 'monthly_report', allowed: true, used: 0, limit: 1, reset_at: '...' });
    consumeQuotaMock.mockResolvedValue({ kind: 'monthly_report', allowed: true, used: 1, limit: 1, reset_at: '...' });
    aggregateWeaknessMock.mockResolvedValue({
      total_attempts: 50,
      total_correct: 30,
      recent_window_days: 30,
      items: [],
      recommendation_text: '월간 멘트',
    });

    const res = await POST();

    expect(res.status).toBe(200);
    expect(aggregateWeaknessMock).toHaveBeenCalledWith({ windowDays: 30 });
    const body = await res.json();
    expect(body.monthly.total_attempts).toBe(50);
  });
});
