/**
 * Phase G-06 G06-34 (Δ11) — POST/GET /api/legend/beta/review
 *
 * 베타 사용자 자율 리뷰 시스템 (G06-23 인터뷰 폐기 → 글 후기 전환).
 *
 * 5 항목 (검증):
 *   - pros (30자+)
 *   - cons (20자+)
 *   - purchase_intent (boolean Y/N)
 *   - recommended_tutor (5 enum 중 1)
 *   - star_rating (1~5)
 *   - free_comment (옵션)
 *   - is_public (옵션 default true)
 *
 * 인증 + access_tier === 'beta' 필수 (trial 거부 → 402 trial_only).
 * upsert (user_id unique → 재제출 시 갱신).
 */
import { createClient } from '@/lib/supabase/server';
import { getUserAccessTier } from '@/lib/legend/access-tier';

export const runtime = 'nodejs';

const TUTORS = ['ramanujan', 'gauss', 'von_neumann', 'euler', 'leibniz'] as const;
type RecommendedTutor = typeof TUTORS[number];

interface ReviewBody {
  pros?: string;
  cons?: string;
  purchase_intent?: boolean;
  recommended_tutor?: string;
  star_rating?: number;
  free_comment?: string | null;
  is_public?: boolean;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 베타 사용자만 작성 가능
  const tier = await getUserAccessTier(user.id);
  if (tier !== 'beta') {
    return Response.json(
      {
        error: 'beta_only',
        message: '베타 사용자만 후기를 작성할 수 있습니다.',
      },
      { status: 402 },
    );
  }

  let body: ReviewBody;
  try {
    body = (await req.json()) as ReviewBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const pros = (body.pros ?? '').trim();
  const cons = (body.cons ?? '').trim();

  if (pros.length < 30) {
    return Response.json(
      { error: 'pros_too_short', message: '장점을 30자 이상 작성해주세요.' },
      { status: 400 },
    );
  }
  if (cons.length < 20) {
    return Response.json(
      { error: 'cons_too_short', message: '단점을 20자 이상 작성해주세요.' },
      { status: 400 },
    );
  }
  if (typeof body.purchase_intent !== 'boolean') {
    return Response.json(
      { error: 'purchase_intent_required' },
      { status: 400 },
    );
  }
  if (!TUTORS.includes(body.recommended_tutor as RecommendedTutor)) {
    return Response.json(
      { error: 'invalid_recommended_tutor' },
      { status: 400 },
    );
  }
  const star = Number(body.star_rating);
  if (!Number.isInteger(star) || star < 1 || star > 5) {
    return Response.json(
      { error: 'invalid_star_rating', message: '별점은 1~5 사이여야 합니다.' },
      { status: 400 },
    );
  }

  const isPublic = typeof body.is_public === 'boolean' ? body.is_public : true;
  const freeComment =
    typeof body.free_comment === 'string' && body.free_comment.trim().length > 0
      ? body.free_comment.trim()
      : null;

  const payload = {
    user_id: user.id,
    pros,
    cons,
    purchase_intent: body.purchase_intent,
    recommended_tutor: body.recommended_tutor as RecommendedTutor,
    star_rating: star,
    free_comment: freeComment,
    is_public: isPublic,
  };

  const { data, error } = await supabase
    .from('beta_reviews')
    .upsert(payload, { onConflict: 'user_id' })
    .select('id, submitted_at')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(
    { id: data.id, submitted_at: data.submitted_at },
    { status: 201 },
  );
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('beta_reviews')
    .select(
      'id, pros, cons, purchase_intent, recommended_tutor, star_rating, free_comment, is_public, submitted_at',
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ review: data ?? null });
}
