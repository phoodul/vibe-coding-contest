/**
 * Phase G-06 G06-10 — quota-manager 단위 테스트.
 *
 * 시나리오:
 *   A. checkQuota — 5 quota × (정상 / 한도 도달 / 자격 게이트)
 *   B. consumeQuota — 정상 increment / 차단 시 RPC X / sequential 5회 == count 5
 *   C. period boundary — daily KST 자정 / weekly 월요일 / monthly 1일
 *
 * 외부 의존성 (supabase) 모킹.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPeriodStart, getResetAt } from '../quota-manager';

// ── 모킹 ────────────────────────────────────────────────────────────

interface CounterRow {
  count: number;
}

const state = {
  /** legend_quota_counters select 결과 (단일 row 또는 null) */
  counterRow: null as CounterRow | null,
  counterError: null as { message: string } | null,
  /** get_lifetime_problem_count RPC 반환 */
  lifetimeCount: 0,
  lifetimeError: null as { message: string } | null,
  /** increment_legend_quota RPC: 호출마다 +1 후 새 count 반환 */
  incrementError: null as { message: string } | null,
  /** 호출 추적 */
  selectCalls: [] as Array<{ user_id: string; kind: string; periodStart: string }>,
  rpcCalls: [] as Array<{ name: string; params: Record<string, unknown> }>,
};

function makeMaybeSingle(periodStart: string) {
  return {
    maybeSingle: async () => ({
      data: state.counterRow,
      error: state.counterError,
    }),
  };
}

function makeFromChain() {
  let captured: { user_id?: string; kind?: string; periodStart?: string } = {};
  const eqUser = (col: string, val: unknown) => {
    captured.user_id = val as string;
    return { eq: eqKind };
  };
  const eqKind = (col: string, val: unknown) => {
    captured.kind = val as string;
    return { eq: eqPeriod };
  };
  const eqPeriod = (col: string, val: unknown) => {
    captured.periodStart = val as string;
    state.selectCalls.push({
      user_id: captured.user_id ?? '',
      kind: captured.kind ?? '',
      periodStart: captured.periodStart ?? '',
    });
    return makeMaybeSingle(captured.periodStart ?? '');
  };
  return {
    select: (_cols: string) => ({ eq: eqUser }),
  };
}

const supabaseMock = {
  from: (_table: string) => makeFromChain(),
  rpc: vi.fn(async (name: string, params: Record<string, unknown>) => {
    state.rpcCalls.push({ name, params });
    if (name === 'get_lifetime_problem_count') {
      return { data: state.lifetimeCount, error: state.lifetimeError };
    }
    if (name === 'increment_legend_quota') {
      if (state.incrementError) {
        return { data: null, error: state.incrementError };
      }
      const prior = state.counterRow?.count ?? 0;
      const next = prior + 1;
      state.counterRow = { count: next };
      return { data: next, error: null };
    }
    return { data: null, error: { message: `unknown rpc: ${name}` } };
  }),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => supabaseMock,
}));

import { checkQuota, consumeQuota } from '../quota-manager';

beforeEach(() => {
  state.counterRow = null;
  state.counterError = null;
  state.lifetimeCount = 0;
  state.lifetimeError = null;
  state.incrementError = null;
  state.selectCalls = [];
  state.rpcCalls = [];
  supabaseMock.rpc.mockClear();
  // env 정리 (default 한도 사용)
  delete process.env.LEGEND_BETA_PROBLEM_TOTAL_DAILY;
  delete process.env.LEGEND_BETA_LEGEND_CALL_DAILY;
  delete process.env.LEGEND_BETA_REPORT_PER_PROBLEM_DAILY;
  delete process.env.LEGEND_BETA_WEEKLY_REPORT_LIMIT;
  delete process.env.LEGEND_BETA_MONTHLY_REPORT_LIMIT;
  delete process.env.LEGEND_WEEKLY_REPORT_PROBLEM_GATE;
  delete process.env.LEGEND_MONTHLY_REPORT_PROBLEM_GATE;
});

const USER = '00000000-0000-0000-0000-000000000001';

// ────────────────────────────────────────────────────────────────────────────
// A. checkQuota — 정상 / 한도 / 자격 게이트
// ────────────────────────────────────────────────────────────────────────────

describe('checkQuota — daily quotas (no eligibility gate)', () => {
  it('problem_total_daily 정상 (used 2 / limit 5) → allowed', async () => {
    state.counterRow = { count: 2 };
    const status = await checkQuota(USER, 'problem_total_daily');
    expect(status.kind).toBe('problem_total_daily');
    expect(status.used).toBe(2);
    expect(status.limit).toBe(5);
    expect(status.allowed).toBe(true);
    expect(status.blocked_reason).toBeUndefined();
    expect(status.eligibility).toBeUndefined();
    expect(status.reset_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('legend_call_daily 한도 도달 (used 3 / limit 3) → blocked limit_exceeded', async () => {
    state.counterRow = { count: 3 };
    const status = await checkQuota(USER, 'legend_call_daily');
    expect(status.used).toBe(3);
    expect(status.limit).toBe(3);
    expect(status.allowed).toBe(false);
    expect(status.blocked_reason).toBe('limit_exceeded');
  });

  it('report_per_problem_daily 신규 사용자 (counter 없음) → used 0 + allowed', async () => {
    state.counterRow = null;
    const status = await checkQuota(USER, 'report_per_problem_daily');
    expect(status.used).toBe(0);
    expect(status.limit).toBe(1);
    expect(status.allowed).toBe(true);
  });

  // Δ9 (G06-32) — Trial 라마누잔 일 3회 quota
  it('trial_ramanujan_daily 신규 사용자 → used 0 / limit 3 / allowed', async () => {
    state.counterRow = null;
    const status = await checkQuota(USER, 'trial_ramanujan_daily');
    expect(status.used).toBe(0);
    expect(status.limit).toBe(3);
    expect(status.allowed).toBe(true);
    expect(status.eligibility).toBeUndefined();
  });

  it('trial_ramanujan_daily 한도 도달 (used 3 / limit 3) → blocked limit_exceeded', async () => {
    state.counterRow = { count: 3 };
    const status = await checkQuota(USER, 'trial_ramanujan_daily');
    expect(status.allowed).toBe(false);
    expect(status.blocked_reason).toBe('limit_exceeded');
  });

  it('LEGEND_TRIAL_RAMANUJAN_DAILY=10 env override → limit 10', async () => {
    process.env.LEGEND_TRIAL_RAMANUJAN_DAILY = '10';
    state.counterRow = { count: 5 };
    const status = await checkQuota(USER, 'trial_ramanujan_daily');
    expect(status.limit).toBe(10);
    expect(status.allowed).toBe(true);
    delete process.env.LEGEND_TRIAL_RAMANUJAN_DAILY;
  });
});

describe('checkQuota — weekly/monthly with eligibility gate', () => {
  it('weekly_report 자격 미달 (lifetime 5 / required 10) → blocked eligibility_gate (used 0)', async () => {
    state.lifetimeCount = 5;
    state.counterRow = null;
    const status = await checkQuota(USER, 'weekly_report');
    expect(status.allowed).toBe(false);
    expect(status.blocked_reason).toBe('eligibility_gate');
    expect(status.eligibility).toEqual({ current: 5, required: 10 });
    expect(status.used).toBe(0);
  });

  it('weekly_report 자격 충족 + 한도 잔여 (lifetime 12, used 0) → allowed + eligibility 채워짐', async () => {
    state.lifetimeCount = 12;
    state.counterRow = null;
    const status = await checkQuota(USER, 'weekly_report');
    expect(status.allowed).toBe(true);
    expect(status.blocked_reason).toBeUndefined();
    expect(status.eligibility).toEqual({ current: 12, required: 10 });
  });

  it('weekly_report 자격 충족 + 한도 도달 (used 1 / limit 1) → blocked limit_exceeded', async () => {
    state.lifetimeCount = 50;
    state.counterRow = { count: 1 };
    const status = await checkQuota(USER, 'weekly_report');
    expect(status.allowed).toBe(false);
    expect(status.blocked_reason).toBe('limit_exceeded');
  });

  it('monthly_report 자격 미달 (lifetime 15 / required 20) → blocked eligibility_gate', async () => {
    state.lifetimeCount = 15;
    state.counterRow = null;
    const status = await checkQuota(USER, 'monthly_report');
    expect(status.allowed).toBe(false);
    expect(status.blocked_reason).toBe('eligibility_gate');
    expect(status.eligibility).toEqual({ current: 15, required: 20 });
  });

  it('monthly_report 자격 충족 (lifetime 20 == required) → allowed', async () => {
    state.lifetimeCount = 20;
    state.counterRow = null;
    const status = await checkQuota(USER, 'monthly_report');
    expect(status.allowed).toBe(true);
    expect(status.eligibility).toEqual({ current: 20, required: 20 });
  });
});

describe('checkQuota — env 한도 override', () => {
  it('LEGEND_BETA_PROBLEM_TOTAL_DAILY=10 → limit 10 적용', async () => {
    process.env.LEGEND_BETA_PROBLEM_TOTAL_DAILY = '10';
    state.counterRow = { count: 7 };
    const status = await checkQuota(USER, 'problem_total_daily');
    expect(status.limit).toBe(10);
    expect(status.allowed).toBe(true);
  });

  it('LEGEND_WEEKLY_REPORT_PROBLEM_GATE=3 → 자격 require 3', async () => {
    process.env.LEGEND_WEEKLY_REPORT_PROBLEM_GATE = '3';
    state.lifetimeCount = 4;
    state.counterRow = null;
    const status = await checkQuota(USER, 'weekly_report');
    expect(status.allowed).toBe(true);
    expect(status.eligibility).toEqual({ current: 4, required: 3 });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// B. consumeQuota
// ────────────────────────────────────────────────────────────────────────────

describe('consumeQuota', () => {
  it('정상 → increment_legend_quota RPC 호출 + used +1', async () => {
    state.counterRow = { count: 0 };
    const status = await consumeQuota(USER, 'problem_total_daily');
    expect(status.used).toBe(1);
    expect(status.allowed).toBe(true);
    const incCalls = state.rpcCalls.filter(c => c.name === 'increment_legend_quota');
    expect(incCalls.length).toBe(1);
    expect(incCalls[0].params).toMatchObject({
      p_user_id: USER,
      p_quota_kind: 'problem_total_daily',
    });
  });

  it('한도 도달 차단 시 → increment RPC 호출 X + 원본 status 반환', async () => {
    state.counterRow = { count: 3 };
    const status = await consumeQuota(USER, 'legend_call_daily');
    expect(status.allowed).toBe(false);
    expect(status.blocked_reason).toBe('limit_exceeded');
    expect(status.used).toBe(3);
    const incCalls = state.rpcCalls.filter(c => c.name === 'increment_legend_quota');
    expect(incCalls.length).toBe(0);
  });

  it('자격 게이트 차단 시 → increment RPC 호출 X', async () => {
    state.lifetimeCount = 3;
    state.counterRow = null;
    const status = await consumeQuota(USER, 'weekly_report');
    expect(status.blocked_reason).toBe('eligibility_gate');
    const incCalls = state.rpcCalls.filter(c => c.name === 'increment_legend_quota');
    expect(incCalls.length).toBe(0);
  });

  it('sequential 5 호출 → count 1→2→3→4→5 (4·5번째는 한도 5 초과 직전·도달)', async () => {
    state.counterRow = { count: 0 };
    const results: number[] = [];
    for (let i = 0; i < 5; i++) {
      const r = await consumeQuota(USER, 'problem_total_daily');
      results.push(r.used);
    }
    expect(results).toEqual([1, 2, 3, 4, 5]);
    // 6번째 호출은 used 5 == limit 5 → 차단
    const sixth = await consumeQuota(USER, 'problem_total_daily');
    expect(sixth.allowed).toBe(false);
    expect(sixth.blocked_reason).toBe('limit_exceeded');
    const incCalls = state.rpcCalls.filter(c => c.name === 'increment_legend_quota');
    expect(incCalls.length).toBe(5);  // 6번째는 RPC 호출 X
  });
});

// ────────────────────────────────────────────────────────────────────────────
// C. period boundary (KST = UTC+9)
// ────────────────────────────────────────────────────────────────────────────

describe('getPeriodStart — KST 자정 boundary', () => {
  it('UTC 14:59 (KST 23:59) → 같은 KST 날짜', () => {
    const at = new Date('2026-04-28T14:59:00.000Z');
    expect(getPeriodStart('daily', at)).toBe('2026-04-28');
  });

  it('UTC 15:00 (KST 다음날 00:00) → 다음 KST 날짜로 reset', () => {
    const at = new Date('2026-04-28T15:00:00.000Z');
    expect(getPeriodStart('daily', at)).toBe('2026-04-29');
  });

  it('weekly: 2026-04-28 화요일 KST → 2026-04-27 (월) period_start', () => {
    const at = new Date('2026-04-28T05:00:00.000Z'); // KST 14:00 화
    expect(getPeriodStart('weekly', at)).toBe('2026-04-27');
  });

  it('weekly: 일요일 KST → 직전 월요일', () => {
    // 2026-05-03 일요일 KST 12:00 = UTC 03:00
    const at = new Date('2026-05-03T03:00:00.000Z');
    expect(getPeriodStart('weekly', at)).toBe('2026-04-27');
  });

  it('weekly: 월요일 KST 자정 직후 → 그 월요일이 period_start', () => {
    // KST 2026-05-04 (월) 00:01 = UTC 2026-05-03 15:01
    const at = new Date('2026-05-03T15:01:00.000Z');
    expect(getPeriodStart('weekly', at)).toBe('2026-05-04');
  });

  it('monthly: 2026-04-28 KST → 2026-04-01', () => {
    const at = new Date('2026-04-28T05:00:00.000Z');
    expect(getPeriodStart('monthly', at)).toBe('2026-04-01');
  });

  it('monthly: 매월 1일 KST 자정 직후 → 같은 달 1일', () => {
    // KST 2026-05-01 00:30 = UTC 2026-04-30 15:30
    const at = new Date('2026-04-30T15:30:00.000Z');
    expect(getPeriodStart('monthly', at)).toBe('2026-05-01');
  });
});

describe('getResetAt — 다음 period 시작 시각 (UTC ISO)', () => {
  it('daily 2026-04-28 → 다음날 KST 자정 = UTC 2026-04-28T15:00:00.000Z', () => {
    expect(getResetAt('daily', '2026-04-28')).toBe('2026-04-28T15:00:00.000Z');
  });

  it('weekly 2026-04-27 (월) → 다음 월요일 2026-05-04 KST 자정 = UTC 2026-05-03T15:00:00.000Z', () => {
    expect(getResetAt('weekly', '2026-04-27')).toBe('2026-05-03T15:00:00.000Z');
  });

  it('monthly 2026-04-01 → 2026-05-01 KST 자정 = UTC 2026-04-30T15:00:00.000Z', () => {
    expect(getResetAt('monthly', '2026-04-01')).toBe('2026-04-30T15:00:00.000Z');
  });
});
