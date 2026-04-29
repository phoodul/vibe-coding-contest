/**
 * Phase G-06 G06-16 — POST /api/legend/report/weekly
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표) + §4.2 (quota-manager)
 *   docs/implementation_plan_g06.md §G06-16
 *
 * 처리 흐름:
 *   1. 인증 가드 — 미인증 401
 *   2. checkQuota('weekly_report') — eligibility_gate / limit_exceeded 분기
 *      - eligibility_gate → 402 + eligibility 정보
 *      - limit_exceeded   → 402 + quota
 *   3. consumeQuota('weekly_report') — atomic +1
 *   4. weakness aggregator (R2 인프라 재활용, windowDays=7)
 *   5. 응답: { weekly: WeaknessReport, quota }
 *
 * 주의: G-06 에서는 R2 본격 build 가 아니라 자격/quota 게이트 + 기존 R2 재활용만.
 *       R2 Per-Period Report 본격 강화는 G-07.
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

  // 1.5. Access Tier 게이트 (Δ9, G06-32) — 주간 리포트는 베타 only
  const tier = await getUserAccessTier(user.id);
  if (tier === 'trial') {
    return Response.json(
      {
        error: 'beta_only',
        message:
          '주간 리포트는 베타 사용자만 이용 가능합니다. 베타 신청을 진행해주세요.',
        apply_url: '/legend/beta/apply',
      },
      { status: 402 },
    );
  }

  // 2. quota 사전 검사 (eligibility_gate vs limit_exceeded 분기)
  const pre = await checkQuota(user.id, 'weekly_report');
  if (!pre.allowed) {
    return Response.json(
      {
        error: pre.blocked_reason ?? 'quota_exceeded',
        quota: pre,
      },
      { status: 402 },
    );
  }

  // 3. consumeQuota (atomic)
  const consumed = await consumeQuota(user.id, 'weekly_report');
  if (!consumed.allowed) {
    return Response.json(
      {
        error: consumed.blocked_reason ?? 'quota_exceeded',
        quota: consumed,
      },
      { status: 402 },
    );
  }

  // 4. weakness aggregator (R2 재활용, 7일 window)
  let weekly = null;
  try {
    weekly = await aggregateWeakness({ windowDays: 7 });
  } catch (e) {
    console.warn('[weekly] aggregateWeakness failed:', (e as Error).message);
  }

  return Response.json({
    ok: true,
    weekly,
    quota: consumed,
  });
}
