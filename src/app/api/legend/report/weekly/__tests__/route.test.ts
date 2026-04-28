/**
 * Phase G-06 G06-16 — POST /api/legend/report/weekly 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized
 *   2. 402 eligibility_gate (lifetime < 10)
 *   3. 402 limit_exceeded
 *   4. 200 정상 + weakness aggregator 호출 (windowDays=7)
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

import { POST } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  checkQuotaMock.mockReset();
  consumeQuotaMock.mockReset();
  aggregateWeaknessMock.mockReset();
});

describe('POST /api/legend/report/weekly', () => {
  it('미인증 → 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const res = await POST();

    expect(res.status).toBe(401);
  });

  it('eligibility_gate 미충족 → 402', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    checkQuotaMock.mockResolvedValue({
      kind: 'weekly_report',
      allowed: false,
      blocked_reason: 'eligibility_gate',
      eligibility: { current: 5, required: 10 },
      used: 0,
      limit: 1,
      reset_at: '...',
    });

    const res = await POST();

    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe('eligibility_gate');
    expect(body.quota.eligibility.current).toBe(5);
    expect(consumeQuotaMock).not.toHaveBeenCalled();
    expect(aggregateWeaknessMock).not.toHaveBeenCalled();
  });

  it('limit_exceeded → 402', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    checkQuotaMock.mockResolvedValue({
      kind: 'weekly_report',
      allowed: false,
      blocked_reason: 'limit_exceeded',
      used: 1,
      limit: 1,
      reset_at: '...',
    });

    const res = await POST();

    expect(res.status).toBe(402);
    expect(consumeQuotaMock).not.toHaveBeenCalled();
  });

  it('정상 → 200 + aggregateWeakness(windowDays=7) 호출', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    checkQuotaMock.mockResolvedValue({ kind: 'weekly_report', allowed: true, used: 0, limit: 1, reset_at: '...' });
    consumeQuotaMock.mockResolvedValue({ kind: 'weekly_report', allowed: true, used: 1, limit: 1, reset_at: '...' });
    aggregateWeaknessMock.mockResolvedValue({
      total_attempts: 12,
      total_correct: 8,
      recent_window_days: 7,
      items: [],
      recommendation_text: 'good job',
    });

    const res = await POST();

    expect(res.status).toBe(200);
    expect(aggregateWeaknessMock).toHaveBeenCalledWith({ windowDays: 7 });
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.weekly.total_attempts).toBe(12);
  });
});
