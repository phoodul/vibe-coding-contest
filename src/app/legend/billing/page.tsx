/**
 * 24차 (2026-05-10) — legacy `/legend/billing` 폐기 처리.
 *
 * 23차 결정 = "/legend/billing dead route" 였으나 실제 코드는 V1 SDK + 옛 가격
 * (12K/19K/5K) 으로 활성. vercel env 에 NEXT_PUBLIC_TOSS_CLIENT_KEY 추가 순간
 * 두 개의 가격 시스템이 동시 활성화될 위험 → 308 영구 redirect 로 즐겨찾기 보존
 * + 새 가격 시스템 (/pricing, ₩29/49/99K) 로 단일화.
 *
 * 본 파일은 Server Component — 'use client' 제거하여 즉시 redirect (브라우저 UI 미렌더).
 */
import { redirect } from 'next/navigation';

export default function LegacyLegendBillingPage(): never {
  // 308 = Permanent Redirect (Method 보존). next/navigation redirect 는 default 307.
  // 영구 표시 + Method 보존이 필요하면 next.config 의 redirects 가 더 정밀하지만,
  // 본 페이지는 GET 만 도달 가능하므로 default redirect 로 충분.
  redirect('/pricing');
}

export const metadata = {
  title: '요금제 — easyedu.ai',
  description: '결제 페이지가 /pricing 으로 통합되었습니다.',
};
