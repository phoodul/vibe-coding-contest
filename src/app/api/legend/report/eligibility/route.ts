/**
 * Phase G-06 G06-16 — GET /api/legend/report/eligibility
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표) + §4.2 (quota-manager 자격 게이트)
 *   docs/implementation_plan_g06.md §G06-16
 *
 * 처리 흐름:
 *   1. 인증 가드 — 미인증 401
 *   2. 5종 quota 모두 checkQuota (count 증가 X)
 *   3. weekly/monthly 자격 게이트 정보 추출 (eligibility 필드)
 *   4. 응답: { lifetime_problem_count, weekly: {eligible, current, required}, monthly: {...}, quotas[] }
 *
 * UI 사용처: WeeklyReportRequestButton / MonthlyReportRequestButton 의 활성화 표시.
 */
import { createClient } from '@/lib/supabase/server';
import { checkQuota } from '@/lib/legend/quota-manager';
import type { QuotaKind } from '@/lib/legend/types';

export const runtime = 'nodejs';
export const maxDuration = 10;

const ALL_KINDS: QuotaKind[] = [
  'problem_total_daily',
  'legend_call_daily',
  'report_per_problem_daily',
  'weekly_report',
  'monthly_report',
];

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 5종 quota 동시 조회
  const quotas = await Promise.all(ALL_KINDS.map((kind) => checkQuota(user.id, kind)));

  const weeklyQuota = quotas.find((q) => q.kind === 'weekly_report');
  const monthlyQuota = quotas.find((q) => q.kind === 'monthly_report');

  const weeklyEligibility = weeklyQuota?.eligibility ?? { current: 0, required: 10 };
  const monthlyEligibility = monthlyQuota?.eligibility ?? { current: 0, required: 20 };

  // lifetime_problem_count 는 weekly/monthly 모두 동일 (둘 다 get_lifetime_problem_count 로 산출)
  const lifetimeCount = Math.max(weeklyEligibility.current, monthlyEligibility.current);

  return Response.json({
    lifetime_problem_count: lifetimeCount,
    weekly: {
      eligible: weeklyEligibility.current >= weeklyEligibility.required,
      current: weeklyEligibility.current,
      required: weeklyEligibility.required,
      blocked_reason: weeklyQuota?.blocked_reason,
    },
    monthly: {
      eligible: monthlyEligibility.current >= monthlyEligibility.required,
      current: monthlyEligibility.current,
      required: monthlyEligibility.required,
      blocked_reason: monthlyQuota?.blocked_reason,
    },
    quotas,
  });
}
