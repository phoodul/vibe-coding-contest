/**
 * Phase G-06 G06-34 (Δ11) — /legend/beta/review (베타 리뷰 작성)
 *
 * Server Component:
 *   1. 인증 확인 → 미인증 시 /login?next=/legend/beta/review
 *   2. access_tier === 'beta' 검증 → trial 시 /legend redirect (안내 페이지)
 *   3. 기존 본인 리뷰 fetch → 있으면 수정 모드, 없으면 신규 모드
 *   4. <BetaReviewForm /> 클라이언트 컴포넌트로 위임
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserAccessTier } from '@/lib/legend/access-tier';
import { BetaReviewForm } from '@/components/legend/BetaReviewForm';
import type { BetaReview } from '@/lib/legend/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '베타 후기 작성 — Legend Tutor',
  description:
    '베타 사용자 솔직한 후기를 5 항목으로 남겨주세요. 출시 시점에 마케팅 자료로 활용됩니다.',
};

export default async function BetaReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/legend/beta/review');
  }

  const tier = await getUserAccessTier(user.id);
  if (tier !== 'beta') {
    // trial 사용자는 베타 신청 안내 페이지로
    redirect('/legend/beta?msg=review_beta_only');
  }

  // 기존 리뷰 조회 (수정 모드 진입용)
  const { data: existing } = await supabase
    .from('beta_reviews')
    .select(
      'id, pros, cons, purchase_intent, recommended_tutor, star_rating, free_comment, is_public, submitted_at',
    )
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
            베타 후기 작성
          </h1>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            솔직한 5 항목 후기를 남겨주세요. 출시 시점에 마케팅 자료로 활용되며,
            <br className="hidden sm:block" /> 비공개 토글 시 통계만 반영됩니다.
          </p>
        </header>

        <BetaReviewForm existing={existing as BetaReview | null} />
      </div>
    </main>
  );
}
