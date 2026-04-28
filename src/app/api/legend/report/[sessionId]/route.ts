/**
 * Phase G-06 G06-16 — GET /api/legend/report/[sessionId]
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표) + §5.2 (buildReport)
 *   docs/implementation_plan_g06.md §G06-16
 *
 * 처리 흐름:
 *   1. 인증 가드 — 미인증 401
 *   2. session 의 user_id === auth.uid 검증 — 아니면 403
 *   3. per_problem_reports 캐시 hit 시 즉시 ETag 비교 → 304 또는 200
 *   4. 캐시 miss 시 problem_text 가 query param 으로 필요. 누락 시 422 missing_problem_text
 *   5. report_per_problem_daily quota 소진 (캐시 miss 신규 build 만)
 *   6. buildReport 호출 → JSON 응답 + ETag + private cache-control
 *
 * problem_text 정책:
 *   - routing_decisions / sessions 테이블에는 raw 텍스트 미저장 (problem_hash 만)
 *   - client (PerProblemReportCard 진입 페이지) 가 알고 있어야 함
 *   - GET 호출 시 ?problem_text=... query param 으로 전달
 *   - 캐시 hit 시 problem_text 불필요
 */
import { createClient } from '@/lib/supabase/server';
import { buildReport } from '@/lib/legend/report/report-builder';
import { consumeQuota } from '@/lib/legend/quota-manager';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface SessionRow {
  user_id: string;
}

interface CachedRow {
  report_jsonb: unknown;
  generated_at: string;
}

function makeETag(session_id: string, generated_at: string, schemaVersion: string): string {
  return `"${session_id}-${schemaVersion}-${generated_at}"`;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  const { sessionId } = await ctx.params;
  if (!sessionId) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  // 1. 인증
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2. session ownership 검증
  const { data: sessionRow } = await supabase
    .from('legend_tutor_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .maybeSingle();
  const session = sessionRow as SessionRow | null;
  if (!session) {
    return Response.json({ error: 'session_not_found' }, { status: 404 });
  }
  if (session.user_id !== user.id) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  // 3. 캐시 조회
  const { data: cachedRow } = await supabase
    .from('per_problem_reports')
    .select('report_jsonb, generated_at')
    .eq('session_id', sessionId)
    .maybeSingle();
  const cached = cachedRow as CachedRow | null;

  if (cached) {
    const report = cached.report_jsonb as { schema_version?: string };
    const etag = makeETag(sessionId, cached.generated_at, report.schema_version ?? '1.1');
    if (req.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers: { etag } });
    }
    return Response.json(report, {
      headers: {
        etag,
        'cache-control': 'private, max-age=600',
      },
    });
  }

  // 4. 캐시 miss → problem_text query param 필요
  const url = new URL(req.url);
  const problemText = url.searchParams.get('problem_text') ?? '';
  if (!problemText.trim()) {
    return Response.json(
      { error: 'missing_problem_text', message: 'cache miss — problem_text query param required' },
      { status: 422 },
    );
  }

  // 5. quota 소진 (신규 build 만)
  const quota = await consumeQuota(user.id, 'report_per_problem_daily');
  if (!quota.allowed) {
    return Response.json({ error: 'quota_exceeded', quota }, { status: 402 });
  }

  // 6. buildReport
  let report;
  try {
    report = await buildReport({
      session_id: sessionId,
      user_id: user.id,
      problem_text: problemText,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'build_failed';
    if (msg === 'session_not_found' || msg === 'session_user_mismatch') {
      return Response.json({ error: msg }, { status: msg === 'session_user_mismatch' ? 403 : 404 });
    }
    return Response.json({ error: 'build_failed', message: msg }, { status: 500 });
  }

  // 신규 캐시의 generated_at 조회 (upsert 직후 리로드)
  const { data: freshRow } = await supabase
    .from('per_problem_reports')
    .select('generated_at')
    .eq('session_id', sessionId)
    .maybeSingle();
  const generatedAt = (freshRow as { generated_at: string } | null)?.generated_at ?? new Date().toISOString();
  const etag = makeETag(sessionId, generatedAt, report.schema_version);

  return Response.json(report, {
    headers: {
      etag,
      'cache-control': 'private, max-age=600',
    },
  });
}
