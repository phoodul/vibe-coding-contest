/**
 * Phase G-06 G06-16 — POST /api/legend/report/monthly
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표) + §4.2 (quota-manager)
 *   docs/implementation_plan_g06.md §G06-16
 *
 * 처리 흐름: weekly 와 동일, kind='monthly_report' (게이트 ≥ 20 / windowDays=30).
 */
import { createClient } from '@/lib/supabase/server';
import { checkQuota, consumeQuota } from '@/lib/legend/quota-manager';
import { aggregateWeakness } from '@/lib/euler/weakness-aggregator';
import { getUserAccessTier } from '@/lib/legend/access-tier';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(): Promise<Response> {
  // 1. 인증
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 1.5. Access Tier 게이트 (Δ9, G06-32) — 월간 리포트는 베타 only
  const tier = await getUserAccessTier(user.id);
  if (tier === 'trial') {
    return Response.json(
      {
        error: 'beta_only',
        message:
          '월간 리포트는 베타 사용자만 이용 가능합니다. 베타 신청을 진행해주세요.',
        apply_url: '/legend/beta/apply',
      },
      { status: 402 },
    );
  }

  // 2. quota 사전 검사
  const pre = await checkQuota(user.id, 'monthly_report');
  if (!pre.allowed) {
    return Response.json(
      {
        error: pre.blocked_reason ?? 'quota_exceeded',
        quota: pre,
      },
      { status: 402 },
    );
  }

  // 3. consumeQuota
  const consumed = await consumeQuota(user.id, 'monthly_report');
  if (!consumed.allowed) {
    return Response.json(
      {
        error: consumed.blocked_reason ?? 'quota_exceeded',
        quota: consumed,
      },
      { status: 402 },
    );
  }

  // 4. weakness aggregator (R2 재활용, 30일 window)
  let monthly = null;
  try {
    monthly = await aggregateWeakness({ windowDays: 30 });
  } catch (e) {
    console.warn('[monthly] aggregateWeakness failed:', (e as Error).message);
  }

  return Response.json({
    ok: true,
    monthly,
    quota: consumed,
  });
}
