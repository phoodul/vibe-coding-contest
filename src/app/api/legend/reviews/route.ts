/**
 * Phase G-06 G06-34 (Δ11) — GET /api/legend/reviews (공개)
 *
 * 누구나 접근 (인증 X 가능). RLS 'beta_reviews_read_public' 정책에 의해
 * is_public=true 행만 자동 노출.
 *
 * 응답: {
 *   stats: { total, avg_rating, purchase_intent_rate, tutor_distribution },
 *   reviews: [...],
 *   page_info: { page, page_size, has_next }
 * }
 *
 * Query: page (default 1), sort_by ('latest' | 'rating', default 'latest').
 */
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const pageRaw = Number(url.searchParams.get('page') ?? '1');
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const sortBy = url.searchParams.get('sort_by') === 'rating' ? 'rating' : 'latest';

  // 통계 (RPC, anon 가능)
  const { data: statsData, error: statsErr } = await supabase.rpc(
    'get_beta_review_stats',
  );
  if (statsErr) {
    return Response.json({ error: statsErr.message }, { status: 500 });
  }

  // 페이지네이션 — RLS 가 is_public=true 자동 필터
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE; // +1 더 가져와 has_next 판정

  const orderCol = sortBy === 'rating' ? 'star_rating' : 'submitted_at';

  const { data: reviews, error: revErr } = await supabase
    .from('beta_reviews')
    .select(
      'id, pros, cons, purchase_intent, recommended_tutor, star_rating, free_comment, submitted_at',
    )
    .eq('is_public', true)
    .order(orderCol, { ascending: false })
    .range(from, to);

  if (revErr) {
    return Response.json({ error: revErr.message }, { status: 500 });
  }

  const list = reviews ?? [];
  const hasNext = list.length > PAGE_SIZE;
  const trimmed = hasNext ? list.slice(0, PAGE_SIZE) : list;

  return Response.json({
    stats: statsData ?? {
      total: 0,
      avg_rating: 0,
      purchase_intent_rate: 0,
      tutor_distribution: {},
    },
    reviews: trimmed,
    page_info: {
      page,
      page_size: PAGE_SIZE,
      has_next: hasNext,
      sort_by: sortBy,
    },
  });
}
