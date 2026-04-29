/**
 * Phase G-06 G06-10 — Δ1 5종 quota 통합 매니저.
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §4.2 (checkQuota / consumeQuota 시그니처) + §3.3 (legend_quota_counters + RPC 2종)
 *   docs/implementation_plan_g06.md §G06-10
 *   docs/project-decisions.md Δ1 (5종 quota 통합 + 베타 한도 + 자격 게이트)
 *
 * 5 quota_kind:
 *   - problem_total_daily         (한도 5  / KST 자정 reset)
 *   - legend_call_daily           (한도 3  / KST 자정 reset)
 *   - report_per_problem_daily    (한도 1  / KST 자정 reset)
 *   - weekly_report               (한도 1  / 월요일 KST 자정 / 자격: lifetime ≥ 10)
 *   - monthly_report              (한도 1  / 1일 KST 자정     / 자격: lifetime ≥ 20)
 *
 * 동시성: Postgres RPC `increment_legend_quota` (UPSERT row-level lock) — atomic.
 * 한도 외부화: env LEGEND_BETA_* 5 + LEGEND_*_PROBLEM_GATE 2 (유료 이관 시 plan_quotas 테이블 신설).
 */
import { createClient } from '@/lib/supabase/server';
import type { QuotaKind, QuotaStatus } from './types';

// ────────────────────────────────────────────────────────────────────────────
// 한도·게이트 설정
// ────────────────────────────────────────────────────────────────────────────

type PeriodKind = 'daily' | 'weekly' | 'monthly';

interface QuotaLimitConfig {
  envKey: string;
  default: number;
  periodKind: PeriodKind;
}

const QUOTA_LIMITS: Record<QuotaKind, QuotaLimitConfig> = {
  problem_total_daily: {
    envKey: 'LEGEND_BETA_PROBLEM_TOTAL_DAILY',
    default: 5,
    periodKind: 'daily',
  },
  legend_call_daily: {
    envKey: 'LEGEND_BETA_LEGEND_CALL_DAILY',
    default: 3,
    periodKind: 'daily',
  },
  report_per_problem_daily: {
    envKey: 'LEGEND_BETA_REPORT_PER_PROBLEM_DAILY',
    default: 1,
    periodKind: 'daily',
  },
  weekly_report: {
    envKey: 'LEGEND_BETA_WEEKLY_REPORT_LIMIT',
    default: 1,
    periodKind: 'weekly',
  },
  monthly_report: {
    envKey: 'LEGEND_BETA_MONTHLY_REPORT_LIMIT',
    default: 1,
    periodKind: 'monthly',
  },
  // Δ9 (G06-32): 비-베타 (체험판) 사용자의 라마누잔 일 3회 quota.
  // 베타 사용자는 본 quota 미사용 (problem_total_daily 5 + legend_call_daily 3 으로 충분).
  trial_ramanujan_daily: {
    envKey: 'LEGEND_TRIAL_RAMANUJAN_DAILY',
    default: 3,
    periodKind: 'daily',
  },
};

interface EligibilityGateConfig {
  envKey: string;
  default: number;
}

const ELIGIBILITY_GATES: Partial<Record<QuotaKind, EligibilityGateConfig>> = {
  weekly_report: {
    envKey: 'LEGEND_WEEKLY_REPORT_PROBLEM_GATE',
    default: 10,
  },
  monthly_report: {
    envKey: 'LEGEND_MONTHLY_REPORT_PROBLEM_GATE',
    default: 20,
  },
};

// ────────────────────────────────────────────────────────────────────────────
// KST (UTC+9) 기준 period 계산
// ────────────────────────────────────────────────────────────────────────────

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 기준 YYYY-MM-DD period_start (legend_quota_counters PK 의 date 컬럼 호환). */
export function getPeriodStart(kind: PeriodKind, now: Date = new Date()): string {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth();
  const d = kst.getUTCDate();

  let startUtcMs: number;

  if (kind === 'daily') {
    // 오늘 KST 자정 = (UTC y-m-d 00:00) - 9h
    startUtcMs = Date.UTC(y, m, d) - KST_OFFSET_MS;
  } else if (kind === 'weekly') {
    // 이번 주 월요일 KST 자정. getUTCDay: 0=일 ... 6=토 (kst 오프셋 적용된 시각의 요일)
    const dow = kst.getUTCDay();
    const daysToMonday = dow === 0 ? 6 : dow - 1;
    startUtcMs = Date.UTC(y, m, d - daysToMonday) - KST_OFFSET_MS;
  } else {
    // 이번 달 1일 KST 자정
    startUtcMs = Date.UTC(y, m, 1) - KST_OFFSET_MS;
  }

  // KST 자정에 해당하는 시점을 KST 기준 YYYY-MM-DD 로 표시
  const startKst = new Date(startUtcMs + KST_OFFSET_MS);
  const yy = startKst.getUTCFullYear();
  const mm = String(startKst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(startKst.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** period_start (KST date) 의 다음 period_start ISO 시각 (UTC). */
export function getResetAt(kind: PeriodKind, periodStart: string): string {
  // periodStart 는 KST 자정. UTC 로 변환: KST 00:00 = UTC 전날 15:00
  const [yStr, mStr, dStr] = periodStart.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const d = parseInt(dStr, 10);
  const startKstAsUtcMs = Date.UTC(y, m, d) - KST_OFFSET_MS;

  let nextUtcMs: number;
  if (kind === 'daily') {
    nextUtcMs = startKstAsUtcMs + 24 * 60 * 60 * 1000;
  } else if (kind === 'weekly') {
    nextUtcMs = startKstAsUtcMs + 7 * 24 * 60 * 60 * 1000;
  } else {
    // 다음 달 1일 KST 자정
    nextUtcMs = Date.UTC(y, m + 1, d) - KST_OFFSET_MS;
  }
  return new Date(nextUtcMs).toISOString();
}

function getLimit(kind: QuotaKind): number {
  const cfg = QUOTA_LIMITS[kind];
  const raw = process.env[cfg.envKey];
  if (!raw) return cfg.default;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : cfg.default;
}

function getGateRequired(kind: QuotaKind): number | null {
  const gate = ELIGIBILITY_GATES[kind];
  if (!gate) return null;
  const raw = process.env[gate.envKey];
  if (!raw) return gate.default;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : gate.default;
}

// ────────────────────────────────────────────────────────────────────────────
// 자격 게이트 (weekly_report / monthly_report 만)
// ────────────────────────────────────────────────────────────────────────────

interface SupabaseLike {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        eq: (col: string, val: unknown) => {
          eq: (col: string, val: unknown) => {
            maybeSingle: () => Promise<{ data: { count: number } | null; error: unknown }>;
          };
        };
      };
    };
  };
  rpc: (
    name: string,
    params: Record<string, unknown>,
  ) => Promise<{ data: number | null; error: unknown }>;
}

async function fetchEligibility(
  supabase: SupabaseLike,
  userId: string,
  kind: QuotaKind,
): Promise<{ current: number; required: number } | null> {
  const required = getGateRequired(kind);
  if (required === null) return null;

  const { data, error } = await supabase.rpc('get_lifetime_problem_count', {
    p_user_id: userId,
  });
  if (error) {
    const msg = (error as { message?: string }).message ?? String(error);
    throw new Error(`[quota-manager] get_lifetime_problem_count 실패: ${msg}`);
  }
  const current = typeof data === 'number' ? data : 0;
  return { current, required };
}

// ────────────────────────────────────────────────────────────────────────────
// public API
// ────────────────────────────────────────────────────────────────────────────

/**
 * quota 한도·자격 게이트 사전 검증 (count 증가 X).
 * 차단 사유:
 *   - eligibility_gate: weekly/monthly 자격 게이트 미충족 (lifetime 풀이 < 10/20)
 *   - limit_exceeded: 현재 사용량 ≥ 한도
 */
export async function checkQuota(
  userId: string,
  kind: QuotaKind,
): Promise<QuotaStatus> {
  const supabase = (await createClient()) as unknown as SupabaseLike;
  const cfg = QUOTA_LIMITS[kind];
  const periodStart = getPeriodStart(cfg.periodKind);
  const limit = getLimit(kind);
  const resetAt = getResetAt(cfg.periodKind, periodStart);

  // 1) 자격 게이트 우선 평가 (weekly_report / monthly_report 만)
  const eligibility = await fetchEligibility(supabase, userId, kind);
  if (eligibility && eligibility.current < eligibility.required) {
    return {
      kind,
      used: 0,
      limit,
      allowed: false,
      blocked_reason: 'eligibility_gate',
      eligibility,
      reset_at: resetAt,
    };
  }

  // 2) 현재 period 의 사용량 조회
  const { data, error } = await supabase
    .from('legend_quota_counters')
    .select('count')
    .eq('user_id', userId)
    .eq('quota_kind', kind)
    .eq('period_start', periodStart)
    .maybeSingle();

  if (error) {
    const msg = (error as { message?: string }).message ?? String(error);
    throw new Error(`[quota-manager] legend_quota_counters select 실패: ${msg}`);
  }

  const used = data?.count ?? 0;
  const allowed = used < limit;

  return {
    kind,
    used,
    limit,
    allowed,
    blocked_reason: allowed ? undefined : 'limit_exceeded',
    eligibility: eligibility ?? undefined,
    reset_at: resetAt,
  };
}

/**
 * quota 사용량 +1 (atomic). 사전 차단 시 RPC 호출 X.
 * - 차단 시: checkQuota 결과 그대로 반환 (count 변동 없음)
 * - 정상 시: increment_legend_quota RPC 호출 후 신규 count 반영
 */
export async function consumeQuota(
  userId: string,
  kind: QuotaKind,
): Promise<QuotaStatus> {
  const pre = await checkQuota(userId, kind);
  if (!pre.allowed) return pre;

  const supabase = (await createClient()) as unknown as SupabaseLike;
  const cfg = QUOTA_LIMITS[kind];
  const periodStart = getPeriodStart(cfg.periodKind);

  const { data, error } = await supabase.rpc('increment_legend_quota', {
    p_user_id: userId,
    p_quota_kind: kind,
    p_period_start: periodStart,
  });
  if (error) {
    const msg = (error as { message?: string }).message ?? String(error);
    throw new Error(`[quota-manager] increment_legend_quota 실패: ${msg}`);
  }

  const newCount = typeof data === 'number' ? data : pre.used + 1;
  const stillAllowed = newCount <= pre.limit;

  return {
    ...pre,
    used: newCount,
    allowed: stillAllowed,
    blocked_reason: stillAllowed ? undefined : 'limit_exceeded',
  };
}
