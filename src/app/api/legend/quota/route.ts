/**
 * Phase G-06 G06-11 — GET /api/legend/quota (5종 quota 상태 일괄 조회).
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표) + §4.2 (quota-manager)
 *   docs/implementation_plan_g06.md §G06-11
 *
 * 처리 흐름:
 *   1. 인증 가드 — 미인증 401
 *   2. checkQuota 5종 병렬 호출 (count 증가 X)
 *   3. QuotaStatus[] 반환 (UI 헤더 QuotaIndicator 용)
 */
import { createClient } from '@/lib/supabase/server';
import { checkQuota } from '@/lib/legend/quota-manager';
import type { QuotaKind } from '@/lib/legend/types';

export const runtime = 'nodejs';

const ALL_KINDS: QuotaKind[] = [
  'problem_total_daily',
  'legend_call_daily',
  'report_per_problem_daily',
  'weekly_report',
  'monthly_report',
];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const quotas = await Promise.all(
    ALL_KINDS.map((kind) => checkQuota(user.id, kind)),
  );

  return Response.json({ quotas });
}
