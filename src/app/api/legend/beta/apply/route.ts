/**
 * Phase G-06 G06-27 — POST /api/legend/beta/apply
 *
 * 베타 신청 폼 제출. 동기 50자+ 강제, feedback_consent 필수 true.
 * user_id unique → 재신청 시 upsert (status='pending' 시에만 본인 update RLS 허용).
 *
 * 응답: 201 { id, status: 'pending' }
 */
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface ApplyBody {
  motivation?: string;
  feedback_consent?: boolean;
  grade?: string | null;
  area?: string | null;
  practice_freq?: string | null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: ApplyBody;
  try {
    body = (await req.json()) as ApplyBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const motivation = (body.motivation ?? '').trim();
  if (motivation.length < 50) {
    return Response.json(
      { error: 'motivation_too_short', message: '동기를 50자 이상 작성해주세요.' },
      { status: 400 },
    );
  }
  if (body.feedback_consent !== true) {
    return Response.json(
      { error: 'feedback_consent_required', message: '피드백 제공 동의는 필수입니다.' },
      { status: 400 },
    );
  }

  const payload = {
    user_id: user.id,
    motivation,
    feedback_consent: true,
    grade: body.grade ?? null,
    area: body.area ?? null,
    practice_freq: body.practice_freq ?? null,
    status: 'pending' as const,
  };

  const { data, error } = await supabase
    .from('beta_applications')
    .upsert(payload, { onConflict: 'user_id' })
    .select('id, status')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ id: data.id, status: data.status }, { status: 201 });
}

export async function GET() {
  // 본인 신청 상태 조회
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('beta_applications')
    .select('id, status, motivation, feedback_consent, grade, area, practice_freq, applied_at, reviewed_at, review_comment, invite_code')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ application: data ?? null });
}
