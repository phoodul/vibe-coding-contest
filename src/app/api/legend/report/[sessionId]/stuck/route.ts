/**
 * Phase G-06 G06-16 — POST /api/legend/report/[sessionId]/stuck
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표) + §5.2 (stuck-tracker)
 *   docs/implementation_plan_g06.md §G06-16
 *
 * 처리 흐름:
 *   1. 인증 가드 — 미인증 401
 *   2. session 의 user_id === auth.uid 검증 — 아니면 403
 *   3. body 파싱 (step_index, delta_stuck_ms, delta_revisits) — 누락 400
 *   4. recordStuck 호출 (delta 누적 update)
 *   5. 200 ok
 */
import { createClient } from '@/lib/supabase/server';
import { recordStuck } from '@/lib/legend/report/stuck-tracker';

export const runtime = 'nodejs';
export const maxDuration = 10;

interface StuckRequestBody {
  step_index?: number;
  delta_stuck_ms?: number;
  delta_revisits?: number;
}

interface SessionRow {
  user_id: string;
}

export async function POST(
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

  // 2. session ownership
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

  // 3. body
  let body: StuckRequestBody;
  try {
    body = (await req.json()) as StuckRequestBody;
  } catch {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (
    typeof body.step_index !== 'number' ||
    body.step_index < 0 ||
    (body.delta_stuck_ms !== undefined && typeof body.delta_stuck_ms !== 'number') ||
    (body.delta_revisits !== undefined && typeof body.delta_revisits !== 'number')
  ) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  // 4. recordStuck
  try {
    await recordStuck({
      session_id: sessionId,
      step_index: body.step_index,
      delta_stuck_ms: body.delta_stuck_ms ?? 0,
      delta_revisits: body.delta_revisits ?? 0,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'record_failed';
    return Response.json({ error: 'record_failed', message: msg }, { status: 500 });
  }

  return Response.json({ ok: true });
}
