/**
 * 22차 (2026-05-09) — GET /api/maestro/[subject]/report.
 *
 * Maestro / Legend 분리 5 phase 의 Phase 5 일부. /maestro/[subject]/report 페이지에
 * 학생 본인의 풀이 stat 을 공급한다.
 *
 * 응답 (모든 필드 optional — SQL 미적용 시 빈 객체):
 *   {
 *     total_sessions: number,
 *     last_7_days: number,
 *     tutor_distribution: Array<{ tutor: string; count: number }>,
 *     recent_summaries: Array<{ tutor: string; takeaway: string; created_at: string }>,
 *     multimodal_count: number,
 *   }
 */
import { NextResponse } from 'next/server';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { isMaestroSubject } from '@/lib/types/subject';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SessionRow {
  tutor: string;
  has_image: boolean;
  created_at: string;
}

interface SummaryRow {
  tutor: string;
  summary: { persona_takeaway?: string };
  created_at: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subject: string }> },
) {
  const { subject } = await params;
  if (!isMaestroSubject(subject)) {
    return NextResponse.json({ error: 'invalid_subject' }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  // sessions
  let totalSessions = 0;
  let last7Days = 0;
  let multimodalCount = 0;
  const tutorCount = new Map<string, number>();
  try {
    const { data: sessions } = await supabase
      .from('maestro_tutor_sessions')
      .select('tutor, has_image, created_at')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .order('created_at', { ascending: false })
      .limit(500);
    if (Array.isArray(sessions)) {
      const rows = sessions as SessionRow[];
      totalSessions = rows.length;
      for (const r of rows) {
        if (r.created_at >= since7d) last7Days += 1;
        if (r.has_image) multimodalCount += 1;
        tutorCount.set(r.tutor, (tutorCount.get(r.tutor) ?? 0) + 1);
      }
    }
  } catch (e) {
    console.warn(`[maestro/report:${subject}] sessions 조회 실패:`, (e as Error).message);
  }

  // recent summaries (3건)
  let recentSummaries: Array<{ tutor: string; takeaway: string; created_at: string }> = [];
  try {
    const { data: sums } = await supabase
      .from('maestro_summaries')
      .select('tutor, summary, created_at')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .order('created_at', { ascending: false })
      .limit(5);
    if (Array.isArray(sums)) {
      recentSummaries = (sums as SummaryRow[]).map((r) => ({
        tutor: r.tutor,
        takeaway: r.summary?.persona_takeaway ?? '',
        created_at: r.created_at,
      }));
    }
  } catch (e) {
    console.warn(`[maestro/report:${subject}] summaries 조회 실패:`, (e as Error).message);
  }

  const tutorDistribution = Array.from(tutorCount.entries())
    .map(([tutor, count]) => ({ tutor, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    total_sessions: totalSessions,
    last_7_days: last7Days,
    multimodal_count: multimodalCount,
    tutor_distribution: tutorDistribution,
    recent_summaries: recentSummaries,
  });
}
