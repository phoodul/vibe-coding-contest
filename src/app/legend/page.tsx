/**
 * Phase G-06 G06-32 (Δ9) — Legend Tutor 메인 채팅 (Trial / Beta 분기).
 *
 * 베이스 문서:
 *   docs/project-decisions.md Δ9 — Production 권한 게이트
 *   docs/task-g06.md M11
 *
 * 흐름:
 *   1. Server Component — Supabase auth.getUser() 로 사용자 확인
 *   2. 미인증 → /login?next=/legend redirect
 *   3. getUserAccessTier(user.id) 판정 → 'trial' | 'beta'
 *   4. 분기 렌더 — TrialChat / BetaChat
 *
 * G06-21 의 단순 re-export (`/euler-tutor`) 폐지. 권한 게이트가 본격 진입.
 *
 * 회귀 안전: 기존 베타 사용자 60명 (`legend_beta_invites.redeemed_by`) 모두 자동 'beta' 판정.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserAccessTier, getBetaInviteMeta } from '@/lib/legend/access-tier';
import { TrialChat } from '@/components/legend/TrialChat';
import { BetaChat } from '@/components/legend/BetaChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Legend Tutor — 5 거장 수학 튜터',
  description:
    '라마누잔·가우스·폰 노이만·오일러·라이프니츠 — 5 명의 수학 거장과 함께 배우는 AI 튜터',
};

export default async function LegendMainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/legend');
  }

  const tier = await getUserAccessTier(user.id);
  const userProp = { id: user.id, email: user.email ?? null };

  if (tier === 'beta') {
    // Δ28 — 30일 만료 정책. days_left 가 ≤ 7 이면 헤더에서 안내.
    const betaMeta = await getBetaInviteMeta(user.id);
    return <BetaChat user={userProp} betaMeta={betaMeta ?? undefined} />;
  }
  return <TrialChat user={userProp} />;
}
