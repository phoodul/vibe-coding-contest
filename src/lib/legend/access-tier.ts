/**
 * Phase G-06 G06-32 (Δ9) — Trial / Beta Access Tier 판정.
 *
 * 베이스 문서:
 *   docs/project-decisions.md Δ9 — Production 권한 게이트
 *   docs/task-g06.md M11 — Trial/Beta Access Tier
 *
 * 판정 우선순위:
 *   1. beta_applications.status === 'approved'    → 'beta'
 *   2. euler_beta_invites.redeemed_by 매칭 (기존)  → 'beta'
 *   3. 위 모두 미해당                              → 'trial' (체험판 — 라마누잔 일 3회)
 *
 * 영향 격리: 본 파일은 Server-only (createClient 의존). API 라우트 / Server Component 에서만 호출.
 *
 * 회귀 안전:
 *   - 기존 베타 사용자 60명 (`euler_beta_invites.redeemed_by`) 모두 자동 'beta' 판정 → 회귀 0.
 */
import { createClient } from '@/lib/supabase/server';

export type AccessTier = 'trial' | 'beta';

/**
 * 사용자의 access tier 를 판정한다.
 *
 * 호출자: API 라우트 (`/api/legend/solve`, `/retry-with-tutor`, `/report/*`, `/euler-tutor`),
 *         Server Component (`/legend/page.tsx`).
 *
 * 인증된 user.id 를 받아 Supabase 두 테이블을 조회한다. 한 쪽이라도 hit 시 즉시 'beta' 반환
 * (단락 평가). 두 조회 모두 maybeSingle 이라 row 없으면 data === null.
 */
export async function getUserAccessTier(userId: string): Promise<AccessTier> {
  if (!userId) return 'trial';

  const supabase = await createClient();

  // 1. beta_applications.status === 'approved' (G06-27 신청·승인 흐름)
  const { data: app } = await supabase
    .from('beta_applications')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .maybeSingle();
  if (app) return 'beta';

  // 2. euler_beta_invites.redeemed_by (기존 EULER2026 코드 사용자 호환)
  const { data: invite } = await supabase
    .from('euler_beta_invites')
    .select('id')
    .eq('redeemed_by', userId)
    .maybeSingle();
  if (invite) return 'beta';

  return 'trial';
}
