/**
 * 24차 (2026-05-10) — 결제 시스템 단위 테스트 ③ quota.
 *
 * checkAndIncrementQuota 5 시나리오:
 *   1. no_subscription — 구독 없음
 *   2. period_expired — 결제 기간 만료
 *   3. Premium 무제한 통과
 *   4. quota_exceeded — 한도 초과
 *   5. 정상 increment — 사용량 +1
 *
 * supabase mock — fluent chain 의 maybeSingle 만 sequential stub.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkAndIncrementQuota } from '../quota';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── chain mock helpers ────────────────────────────────────────────────

interface QueryResult {
  data: unknown;
  error: unknown;
}

/**
 * Sequential maybeSingle response 큐. 호출 순서대로 pop.
 * (subscriptions → usage_counters[kind] → usage_counters[topup] → counter row)
 */
let maybeSingleQueue: QueryResult[] = [];
let updateCalls: Array<{ table: string; values: Record<string, unknown> }> = [];
let insertCalls: Array<{ table: string; values: Record<string, unknown> }> = [];

function makeChain(table: string): unknown {
  const chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    gte: () => chain,
    maybeSingle: async () => {
      const next = maybeSingleQueue.shift();
      return next ?? { data: null, error: null };
    },
    update: (values: Record<string, unknown>) => {
      updateCalls.push({ table, values });
      return chain;
    },
    insert: (values: Record<string, unknown>) => {
      insertCalls.push({ table, values });
      return chain;
    },
  };
  return chain;
}

function makeMockSupabase(): SupabaseClient {
  return {
    from: (table: string) => makeChain(table),
  } as unknown as SupabaseClient;
}

// ── tests ─────────────────────────────────────────────────────────────

describe('checkAndIncrementQuota', () => {
  beforeEach(() => {
    maybeSingleQueue = [];
    updateCalls = [];
    insertCalls = [];
  });

  it('1. no_subscription — subscriptions 조회 결과 null → allowed=false', async () => {
    maybeSingleQueue.push({ data: null, error: null }); // subscriptions
    const result = await checkAndIncrementQuota(
      makeMockSupabase(),
      'user-uuid-1',
      'legend_problem',
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('no_subscription');
    expect(result.message).toContain('/pricing');
  });

  it('2. period_expired — current_period_end 과거 → allowed=false', async () => {
    const past = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    maybeSingleQueue.push({
      data: {
        id: 'sub-1',
        plan_code: 'standard',
        status: 'active',
        monthly_quota: 100,
        current_period_start: past,
        current_period_end: past,
      },
      error: null,
    });
    const result = await checkAndIncrementQuota(
      makeMockSupabase(),
      'user-uuid-1',
      'legend_problem',
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('period_expired');
    expect(result.plan_code).toBe('standard');
  });

  it('3. Premium 무제한 (monthly_quota=null) → allowed=true', async () => {
    const future = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    maybeSingleQueue.push({
      data: {
        id: 'sub-2',
        plan_code: 'premium',
        status: 'active',
        monthly_quota: null,
        current_period_start: new Date().toISOString(),
        current_period_end: future,
      },
      error: null,
    });
    // incrementCounter 내부의 select (existing counter row 조회)
    maybeSingleQueue.push({ data: null, error: null });

    const result = await checkAndIncrementQuota(
      makeMockSupabase(),
      'user-uuid-2',
      'legend_problem',
    );
    expect(result.allowed).toBe(true);
    expect(result.limit).toBeNull();
    expect(result.plan_code).toBe('premium');
  });

  it('4. quota_exceeded — used_count >= limit → allowed=false', async () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    // ① subscriptions
    maybeSingleQueue.push({
      data: {
        id: 'sub-3',
        plan_code: 'standard',
        status: 'active',
        monthly_quota: 100,
        current_period_start: new Date().toISOString(),
        current_period_end: future,
      },
      error: null,
    });
    // ② usage_counters[legend_problem] — 한도 초과 상태
    maybeSingleQueue.push({
      data: { id: 'cnt-1', used_count: 100, quota_limit: 100 },
      error: null,
    });
    // ③ usage_counters[topup] — 없음
    maybeSingleQueue.push({ data: null, error: null });

    const result = await checkAndIncrementQuota(
      makeMockSupabase(),
      'user-uuid-3',
      'legend_problem',
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('quota_exceeded');
    expect(result.used).toBe(100);
    expect(result.limit).toBe(100);
    expect(result.message).toContain('14,900');
  });

  it('5. 정상 increment — used_count<limit → allowed=true + update 호출', async () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    maybeSingleQueue.push({
      data: {
        id: 'sub-4',
        plan_code: 'standard',
        status: 'active',
        monthly_quota: 100,
        current_period_start: new Date().toISOString(),
        current_period_end: future,
      },
      error: null,
    });
    // 현재 사용량 = 50
    maybeSingleQueue.push({
      data: { id: 'cnt-2', used_count: 50, quota_limit: 100 },
      error: null,
    });
    // topup 없음
    maybeSingleQueue.push({ data: null, error: null });
    // incrementCounter 내부 — existing counter row 조회 (50 used)
    maybeSingleQueue.push({
      data: { id: 'cnt-2', used_count: 50 },
      error: null,
    });

    const result = await checkAndIncrementQuota(
      makeMockSupabase(),
      'user-uuid-4',
      'legend_problem',
    );
    expect(result.allowed).toBe(true);
    expect(result.used).toBe(51);
    expect(result.limit).toBe(100);

    // usage_counters update 호출 검증
    const updates = updateCalls.filter((c) => c.table === 'usage_counters');
    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0].values.used_count).toBe(51);
  });

  it('5b. topup 보유 시 topup 우선 소진', async () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    maybeSingleQueue.push({
      data: {
        id: 'sub-5',
        plan_code: 'standard',
        status: 'active',
        monthly_quota: 100,
        current_period_start: new Date().toISOString(),
        current_period_end: future,
      },
      error: null,
    });
    // 현재 사용량 = 100 (한도 도달이지만 topup 으로 통과)
    maybeSingleQueue.push({
      data: { id: 'cnt-3', used_count: 100, quota_limit: 100 },
      error: null,
    });
    // topup 보유 (50 남음)
    maybeSingleQueue.push({
      data: { id: 'tp-1', used_count: 50, quota_limit: 100 },
      error: null,
    });

    const result = await checkAndIncrementQuota(
      makeMockSupabase(),
      'user-uuid-5',
      'legend_problem',
    );
    expect(result.allowed).toBe(true);
    expect(result.topup_remaining).toBe(50);

    // topup row 의 used_count 가 +1 되어야 함 (legend counter 가 아니라)
    const topupUpdate = updateCalls.find(
      (c) => c.table === 'usage_counters' && c.values.used_count === 51,
    );
    expect(topupUpdate).toBeDefined();
  });
});
