/**
 * 22차 (2026-05-09) — 사용량 100회 quota 시스템.
 *
 * Legend Tutor / Maestro 의 1 problem = 1회 incr. 라마누잔 · 부속 도구 미카운트.
 *
 * 흐름:
 *   1. checkAndIncrement(user_id, kind) — 새 problem 시작 시 호출 (첫 user turn)
 *   2. usage_counters row upsert — current period 의 row 1개에 used_count++
 *   3. quota 초과 시 { allowed: false, reason: 'quota_exceeded' } 반환
 *   4. premium (quota_limit=null) = 무제한
 *
 * Counter type:
 *   - 'legend_problem' — Legend Tutor 분기
 *   - 'maestro_problem' — Maestro 4 과목 분기
 *   - 'topup' — 추가 100회 충전분 (별도 row 누적, 우선 소진)
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type QuotaKind = 'legend_problem' | 'maestro_problem';

export interface QuotaResult {
  allowed: boolean;
  reason?:
    | 'no_subscription'
    | 'subscription_inactive'
    | 'quota_exceeded'
    | 'period_expired';
  used: number;
  limit: number | null;
  topup_remaining: number;
  plan_code?: string;
  message?: string;
}

interface SubscriptionRow {
  id: string;
  plan_code: string;
  status: string;
  monthly_quota: number | null;
  current_period_start: string;
  current_period_end: string;
}

interface CounterRow {
  id: string;
  used_count: number;
  quota_limit: number | null;
}

/**
 * quota 검사 + 1회 increment. 트랜잭션 보장은 RPC 로 옮겨야 race condition 안전.
 * 1차 (이번 commit) = 단순 select-update 패턴.
 */
export async function checkAndIncrementQuota(
  supabase: SupabaseClient,
  userId: string,
  kind: QuotaKind,
): Promise<QuotaResult> {
  // 1. active subscription 조회
  const { data: sub } = (await supabase
    .from('subscriptions')
    .select('id, plan_code, status, monthly_quota, current_period_start, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: SubscriptionRow | null };

  if (!sub) {
    return {
      allowed: false,
      reason: 'no_subscription',
      used: 0,
      limit: 0,
      topup_remaining: 0,
      message: '구독이 없습니다. /pricing 에서 요금제를 선택해 주세요.',
    };
  }

  // period 만료
  const periodEnd = new Date(sub.current_period_end).getTime();
  if (Date.now() > periodEnd) {
    return {
      allowed: false,
      reason: 'period_expired',
      used: 0,
      limit: sub.monthly_quota,
      topup_remaining: 0,
      plan_code: sub.plan_code,
      message: '결제 기간이 만료되었습니다. /billing 에서 갱신해 주세요.',
    };
  }

  // 무제한 (Premium)
  if (sub.monthly_quota === null) {
    // counter 만 incr (통계용)
    await incrementCounter(supabase, userId, sub.id, kind, null, sub.current_period_start, sub.current_period_end);
    return {
      allowed: true,
      used: 0,
      limit: null,
      topup_remaining: 0,
      plan_code: sub.plan_code,
    };
  }

  // 2. 현재 period 의 counter 조회 (kind 별)
  const { data: counterData } = (await supabase
    .from('usage_counters')
    .select('id, used_count, quota_limit')
    .eq('user_id', userId)
    .eq('counter_type', kind)
    .eq('period_start', sub.current_period_start)
    .maybeSingle()) as { data: CounterRow | null };

  const currentUsed = counterData?.used_count ?? 0;
  const currentLimit = counterData?.quota_limit ?? sub.monthly_quota;

  // 3. topup counter (남은 충전분)
  const { data: topupData } = (await supabase
    .from('usage_counters')
    .select('id, used_count, quota_limit')
    .eq('user_id', userId)
    .eq('counter_type', 'topup')
    .gte('period_end', new Date().toISOString())
    .maybeSingle()) as { data: CounterRow | null };
  const topupRemaining = topupData
    ? Math.max(0, (topupData.quota_limit ?? 0) - (topupData.used_count ?? 0))
    : 0;

  // 4. 한도 초과?
  const totalUsed = currentUsed;
  const totalLimit = currentLimit + topupRemaining;
  if (totalUsed >= totalLimit) {
    return {
      allowed: false,
      reason: 'quota_exceeded',
      used: totalUsed,
      limit: totalLimit,
      topup_remaining: topupRemaining,
      plan_code: sub.plan_code,
      message: `이번 달 ${currentLimit}회 한도를 모두 사용했어요. 다음 결제일까지 라마누잔·부속 도구는 그대로 사용 가능합니다. 추가 100회 충전 (₩14,900) 도 가능해요.`,
    };
  }

  // 5. incr — topup 우선 소진 후 plan 한도 사용
  if (topupData && topupRemaining > 0) {
    await supabase
      .from('usage_counters')
      .update({
        used_count: (topupData.used_count ?? 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', topupData.id);
  } else {
    await incrementCounter(
      supabase,
      userId,
      sub.id,
      kind,
      currentLimit,
      sub.current_period_start,
      sub.current_period_end,
    );
  }

  return {
    allowed: true,
    used: totalUsed + 1,
    limit: totalLimit,
    topup_remaining: topupRemaining,
    plan_code: sub.plan_code,
  };
}

async function incrementCounter(
  supabase: SupabaseClient,
  userId: string,
  subId: string,
  kind: QuotaKind,
  quotaLimit: number | null,
  periodStart: string,
  periodEnd: string,
): Promise<void> {
  const { data: existing } = (await supabase
    .from('usage_counters')
    .select('id, used_count')
    .eq('user_id', userId)
    .eq('counter_type', kind)
    .eq('period_start', periodStart)
    .maybeSingle()) as { data: { id: string; used_count: number } | null };

  if (existing) {
    await supabase
      .from('usage_counters')
      .update({
        used_count: existing.used_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('usage_counters').insert({
      user_id: userId,
      subscription_id: subId,
      period_start: periodStart,
      period_end: periodEnd,
      counter_type: kind,
      used_count: 1,
      quota_limit: quotaLimit,
      last_used_at: new Date().toISOString(),
    });
  }
}

/**
 * 현재 사용량 조회 — UI (구독 관리 / 채팅 헤더 quota indicator) 용.
 */
export async function getQuotaSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  has_subscription: boolean;
  plan_code: string | null;
  monthly_quota: number | null;
  legend_used: number;
  maestro_used: number;
  total_used: number;
  topup_remaining: number;
  period_end: string | null;
}> {
  const { data: sub } = (await supabase
    .from('subscriptions')
    .select('id, plan_code, status, monthly_quota, current_period_start, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: SubscriptionRow | null };

  if (!sub) {
    return {
      has_subscription: false,
      plan_code: null,
      monthly_quota: null,
      legend_used: 0,
      maestro_used: 0,
      total_used: 0,
      topup_remaining: 0,
      period_end: null,
    };
  }

  const { data: counters } = (await supabase
    .from('usage_counters')
    .select('counter_type, used_count, quota_limit')
    .eq('user_id', userId)
    .gte('period_end', new Date().toISOString())) as {
    data: Array<{ counter_type: string; used_count: number; quota_limit: number | null }> | null;
  };

  let legendUsed = 0;
  let maestroUsed = 0;
  let topupRemaining = 0;
  if (Array.isArray(counters)) {
    for (const c of counters) {
      if (c.counter_type === 'legend_problem') legendUsed = c.used_count;
      else if (c.counter_type === 'maestro_problem') maestroUsed = c.used_count;
      else if (c.counter_type === 'topup') {
        topupRemaining = Math.max(0, (c.quota_limit ?? 0) - (c.used_count ?? 0));
      }
    }
  }

  return {
    has_subscription: true,
    plan_code: sub.plan_code,
    monthly_quota: sub.monthly_quota,
    legend_used: legendUsed,
    maestro_used: maestroUsed,
    total_used: legendUsed + maestroUsed,
    topup_remaining: topupRemaining,
    period_end: sub.current_period_end,
  };
}
