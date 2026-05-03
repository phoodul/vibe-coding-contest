/**
 * Phase G-06 G06-34 (Δ11) — POST/GET /api/legend/beta/review
 *
 * 베타 사용자 자율 리뷰 시스템 (G06-23 인터뷰 폐기 → 글 후기 전환).
 *
 * 15차 세션 (2026-05-03) 단순화 (옵션 A-2):
 *   - 필수: star_rating (1~5)
 *   - 선택: free_comment, pros (입력 시 30자+), cons (입력 시 20자+),
 *           purchase_intent, recommended_tutor (5 enum 중 1)
 *   - is_public (default true)
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
  pros?: string | null;
  cons?: string | null;
  purchase_intent?: boolean | null;
  recommended_tutor?: string | null;
  star_rating?: number;
  free_comment?: string | null;
  is_public?: boolean;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

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

  // 필수: 별점
  const star = Number(body.star_rating);
  if (!Number.isInteger(star) || star < 1 || star > 5) {
    return Response.json(
      { error: 'invalid_star_rating', message: '별점은 1~5 사이여야 합니다.' },
      { status: 400 },
    );
  }

  // 선택: pros / cons (입력 시 최소 길이 검증)
  const pros = normalizeOptionalText(body.pros);
  const cons = normalizeOptionalText(body.cons);
  if (pros !== null && pros.length < 30) {
    return Response.json(
      { error: 'pros_too_short', message: '장점을 작성하시려면 30자 이상이어야 합니다.' },
      { status: 400 },
    );
  }
  if (cons !== null && cons.length < 20) {
    return Response.json(
      { error: 'cons_too_short', message: '단점을 작성하시려면 20자 이상이어야 합니다.' },
      { status: 400 },
    );
  }

  // 선택: purchase_intent (boolean 또는 null)
  const purchaseIntent =
    typeof body.purchase_intent === 'boolean' ? body.purchase_intent : null;

  // 선택: recommended_tutor (5 enum 또는 null)
  let recommendedTutor: RecommendedTutor | null = null;
  if (typeof body.recommended_tutor === 'string' && body.recommended_tutor.length > 0) {
    if (!TUTORS.includes(body.recommended_tutor as RecommendedTutor)) {
      return Response.json(
        { error: 'invalid_recommended_tutor' },
        { status: 400 },
      );
    }
    recommendedTutor = body.recommended_tutor as RecommendedTutor;
  }

  const isPublic = typeof body.is_public === 'boolean' ? body.is_public : true;
  const freeComment = normalizeOptionalText(body.free_comment);

  const payload = {
    user_id: user.id,
    pros,
    cons,
    purchase_intent: purchaseIntent,
    recommended_tutor: recommendedTutor,
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
