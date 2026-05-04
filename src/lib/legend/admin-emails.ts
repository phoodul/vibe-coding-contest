/**
 * Admin email 화이트리스트 (client-safe).
 *
 * `access-tier.ts` 는 supabase/server (next/headers) 의존이라 client component
 * 에서 import 하면 빌드 실패. 본 파일은 supabase 의존 없이 순수 함수만 export.
 *
 * default 에 두 이메일 hardcode — 본인이 Google(@gmail.com) / Kakao(@daum.net)
 * 어느 provider 로 로그인하든 admin 통과. 추가 admin 은 LEGEND_ADMIN_EMAILS env
 * 로 server-side 에서만 인정.
 */

const ADMIN_EMAILS = (process.env.LEGEND_ADMIN_EMAILS ?? 'phoodul@gmail.com,phoodul@daum.net')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
