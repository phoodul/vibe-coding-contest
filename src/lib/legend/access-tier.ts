/**
 * Trial / Beta Access Tier 판정.
 *
 * 판정 우선순위:
 *   0. 관리자 이메일 (LEGEND_ADMIN_EMAILS env)             → 'beta' (자동)
 *   1. legend_beta_invites status='active' + 미만료(30일)   → 'beta'
 *   2. 위 모두 미해당                                       → 'trial' (라마누잔 일 3회)
 *
 * 본 파일은 Server-only (createClient 의존). API 라우트 / Server Component 에서만 호출.
 */
import { createClient } from '@/lib/supabase/server';

export type AccessTier = 'trial' | 'beta';

/**
 * 관리자 이메일 검증 — client-safe 정의는 `./admin-emails` 에서 단일 정의.
 * 본 파일은 server-only (next/headers 의존) 이라 client component 에서 import 시
 * 빌드 실패. server route 와 page 는 본 파일에서 그대로 import 가능 (re-export).
 */
import { isAdminEmail } from './admin-emails';
export { isAdminEmail };

/**
 * 사용자의 access tier 를 판정한다.
 *
 * 호출자: API 라우트 (`/api/legend/solve`, `/retry-with-tutor`, `/report/*`, `/euler-tutor`),
 *         Server Component (`/legend/page.tsx`).
 *
 * 우선순위:
 *   0. 관리자 이메일 → 즉시 'beta' (신청 절차 무시)
 *   1. legend_beta_invites status='active' AND (expires_at IS NULL OR expires_at > now())
 *      → 승인 후 30일 미만 → 'beta'
 *      (기존 EULER2026 흐름 + 신청·승인 흐름 모두 invites row 자동 생성하므로 단일 경로 검사로 충분)
 *   2. 위 모두 미해당 → 'trial' (체험판 또는 만료된 베타)
 *
 * Δ28 — 30일 만료 정책 도입. 기존 active 사용자는 backfill 로 오늘부터 +30일.
 */
export async function getUserAccessTier(userId: string): Promise<AccessTier> {
  if (!userId) return 'trial';

  const supabase = await createClient();

  // 0. 관리자 이메일 → 자동 베타 (디버깅·운영 편의)
  const { data: { user } } = await supabase.auth.getUser();
  if (isAdminEmail(user?.email)) return 'beta';

  // 1. legend_beta_invites — status active + 만료되지 않음
  const { data: invite } = await supabase
    .from('legend_beta_invites')
    .select('user_id, status, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  if (invite) {
    const expiresAt = (invite as { expires_at: string | null }).expires_at;
    if (!expiresAt || new Date(expiresAt).getTime() > Date.now()) {
      return 'beta';
    }
    // 만료됨 → trial 로 fallback (자동 강등)
  }

  return 'trial';
}

/**
 * Δ28 — 베타 만료 메타 정보. 학생 UI 에 "남은 일수" 노출용.
 * 만료 임박 (≤ 7일) 시 학생에게 안내 가능.
 */
export interface BetaInviteMeta {
  is_active: boolean;
  expires_at: string | null;
  days_left: number | null;
}

export async function getBetaInviteMeta(userId: string): Promise<BetaInviteMeta | null> {
  if (!userId) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('legend_beta_invites')
      .select('status, expires_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) return null;
    const row = data as { status: string; expires_at: string | null };
    const isActive = row.status === 'active';
    let daysLeft: number | null = null;
    if (isActive && row.expires_at) {
      const ms = new Date(row.expires_at).getTime() - Date.now();
      daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    }
    return {
      is_active: isActive,
      expires_at: row.expires_at,
      days_left: daysLeft,
    };
  } catch {
    return null;
  }
}
