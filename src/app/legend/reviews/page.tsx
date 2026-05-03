/**
 * Phase G-06 G06-34 (Δ11) — /legend/reviews (공개 리뷰)
 *
 * Server Component (인증 X 가능):
 *   1. /api/legend/reviews 호출 → 통계 + 리뷰 + 페이지 정보
 *   2. URL ?page=N&sort_by=latest|rating 으로 페이지네이션
 *   3. 출시 시점 마케팅용 — 이 페이지가 메인 SNS 공유 URL
 */
import Link from 'next/link';
import { headers } from 'next/headers';
import { ReviewsList } from '@/components/legend/ReviewsList';
import { ReviewStatsHero } from '@/components/legend/ReviewStatsHero';
import type { BetaReview, BetaReviewStats } from '@/lib/legend/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '베타 사용자 솔직 후기 — Legend Tutor',
  description:
    '5 명의 수학 거장 AI 튜터를 직접 사용한 베타 사용자들의 솔직한 별점·구매 의향·추천 튜터 후기.',
};

interface ApiResponse {
  stats: BetaReviewStats;
  reviews: BetaReview[];
  page_info: {
    page: number;
    page_size: number;
    has_next: boolean;
    sort_by: 'latest' | 'rating';
  };
}

async function fetchReviews(
  page: number,
  sortBy: string,
): Promise<ApiResponse> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const url = `${proto}://${host}/api/legend/reviews?page=${page}&sort_by=${sortBy}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return {
      stats: {
        total: 0,
        avg_rating: 0,
        purchase_intent_responded: 0,
        purchase_intent_rate: 0,
        tutor_distribution: {},
      },
      reviews: [],
      page_info: { page, page_size: 10, has_next: false, sort_by: 'latest' },
    };
  }
  return (await res.json()) as ApiResponse;
}

export default async function PublicReviewsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const pageRaw = Number(typeof sp.page === 'string' ? sp.page : '1');
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const sortBy =
    typeof sp.sort_by === 'string' && sp.sort_by === 'rating'
      ? 'rating'
      : 'latest';

  const data = await fetchReviews(page, sortBy);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80 mb-3">
            Legend Tutor — Beta Reviews
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent leading-tight">
            베타 사용자 {data.stats.total}명의
            <br className="sm:hidden" /> 솔직한 후기
          </h1>
          <p className="mt-4 text-sm text-white/60">
            5 명의 수학 거장 AI 튜터, 실제로 써본 분들의 이야기
          </p>
        </header>

        <ReviewStatsHero stats={data.stats} />

        {/* 정렬 + 페이지 */}
        <div className="flex items-center justify-between mt-10 mb-4">
          <div className="flex gap-2">
            <Link
              href={`/legend/reviews?sort_by=latest`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sortBy === 'latest'
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                  : 'border border-white/10 text-white/60 hover:bg-white/5'
              }`}
            >
              최신 순
            </Link>
            <Link
              href={`/legend/reviews?sort_by=rating`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sortBy === 'rating'
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                  : 'border border-white/10 text-white/60 hover:bg-white/5'
              }`}
            >
              별점 순
            </Link>
          </div>
          <div className="text-xs text-white/40">
            {page} 페이지 · 페이지당 10건
          </div>
        </div>

        <ReviewsList reviews={data.reviews} />

        {/* 페이지네이션 */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href={
              page > 1
                ? `/legend/reviews?page=${page - 1}&sort_by=${sortBy}`
                : '#'
            }
            aria-disabled={page <= 1}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              page > 1
                ? 'border-white/20 text-white/80 hover:bg-white/5'
                : 'border-white/5 text-white/20 pointer-events-none'
            }`}
          >
            ← 이전
          </Link>
          <Link
            href={
              data.page_info.has_next
                ? `/legend/reviews?page=${page + 1}&sort_by=${sortBy}`
                : '#'
            }
            aria-disabled={!data.page_info.has_next}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              data.page_info.has_next
                ? 'border-white/20 text-white/80 hover:bg-white/5'
                : 'border-white/5 text-white/20 pointer-events-none'
            }`}
          >
            다음 →
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/legend"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/30 hover:shadow-xl transition-shadow"
          >
            Legend Tutor 체험하기 →
          </Link>
        </div>
      </div>
    </main>
  );
}
