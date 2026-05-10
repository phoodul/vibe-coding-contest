/**
 * 24차 (2026-05-10) — legacy `/api/billing/toss/confirm` 폐기.
 *
 * 본 라우트는 V1 가격 (12K/19K/5K, student/family/academy) 검증 후 user_subscriptions
 * upsert. 22차 표준 (Basic 29K / Standard 49K / Premium 99K, subscriptions 테이블)
 * 으로 대체되며 본 callback URL 은 더 이상 호출되지 않음.
 *
 * 처리:
 *   - 410 Gone — 서비스 의도적 폐기 (404 와 의미 다름)
 *   - 사용자 GET 으로 도달 시 /pricing 으로 redirect (즐겨찾기 보존)
 *
 * 토스 dashboard 에서 옛 successUrl 이 본 라우트로 향하더라도 410 응답 후 토스가
 * 결제 confirm 실패로 처리 → 결제 자체 보류. 새 successUrl 은 PricingClient 가
 * /billing/success 로 사용 중.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  // 사용자가 옛 즐겨찾기로 본 URL 에 도달한 경우만 redirect.
  // 토스 callback 은 query 에 paymentKey/orderId 가 있는데, 그 경우에도 결제는
  // 22차 표준 흐름이 아니므로 동일하게 redirect (사용자는 /pricing 에서 다시 시작).
  return NextResponse.redirect(new URL('/pricing', req.url), 308);
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'gone',
      message: '본 결제 경로는 더 이상 사용되지 않습니다. /pricing 에서 새 요금제로 결제해 주세요.',
    },
    { status: 410 },
  );
}
