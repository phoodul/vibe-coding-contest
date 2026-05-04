/**
 * P0-02 (2026-05-04) — Trigger 자동 누적 활동 통계 (admin 전용).
 *
 * 최근 N일의 outcome 분포 + 일별 누적 추이 + 고유 사용자 수.
 * legend_trigger_accumulation_log 테이블 + get_trigger_accumulation_stats RPC 사용.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/legend/access-tier';

export const maxDuration = 15;

interface AccumulationStats {
  total: number;
  days_back: number;
  outcome_distribution: Record<string, number>;
  daily_total: Array<{ day: string; count: number }>;
  unique_users: number;
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const daysParam = url.searchParams.get('days');
  const days = Math.min(Math.max(parseInt(daysParam ?? '7', 10) || 7, 1), 90);

  const { data: stats, error: statsError } = await supabase.rpc(
    'get_trigger_accumulation_stats',
    { days_back: days },
  );

  if (statsError) {
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  // 최근 20건의 raw log 도 함께 (디버깅용)
  const { data: recent, error: recentError } = await supabase
    .from('legend_trigger_accumulation_log')
    .select('id, outcome, matched_id, cue_a, tool_b, similarity, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (recentError) {
    return NextResponse.json({ error: recentError.message }, { status: 500 });
  }

  return NextResponse.json({
    stats: stats as AccumulationStats,
    recent: recent ?? [],
  });
}
