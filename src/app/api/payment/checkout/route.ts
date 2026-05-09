/**
 * 22차 (2026-05-09) — POST /api/payment/checkout.
 *
 * 결제 시작 — DB 에 pending payment row 생성 + toss orderId 반환.
 * client 가 받은 orderId 로 토스 결제 위젯 호출 → 사용자 결제 완료 →
 * /billing/success?paymentKey=...&orderId=...&amount=... redirect → confirm 호출.
 *
 * 베타 동안: NEXT_PUBLIC_PAYMENT_ACTIVE=false → 본 endpoint 호출되지 않음
 *           (PricingClient 가 버튼 disabled 처리).
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPlan } from '@/lib/payment/plans';
import { generateOrderId, customerKeyFromUserId } from '@/lib/payment/toss';

export const runtime = 'nodejs';

interface CheckoutBody {
  plan_code?: string;
}

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_PAYMENT_ACTIVE !== 'true') {
    return NextResponse.json(
      { error: 'payment_inactive', message: '결제 시스템이 아직 활성화되지 않았습니다.' },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const plan = getPlan(body.plan_code ?? '');
  if (!plan) {
    return NextResponse.json(
      { error: 'invalid_plan', message: '요금제 식별이 잘못되었습니다.' },
      { status: 400 },
    );
  }

  const orderId = generateOrderId(plan.recurring ? 'sub' : 'topup');
  const customerKey = customerKeyFromUserId(user.id);

  // pending payment row 생성 (confirm 시 update)
  try {
    await supabase.from('payments').insert({
      user_id: user.id,
      plan_code: plan.code,
      toss_order_id: orderId,
      amount_krw: plan.price_krw,
      vat_krw: Math.round(plan.price_krw - plan.price_krw / 1.1),
      status: 'pending',
    });
  } catch (e) {
    console.warn('[payment/checkout] insert payment failed:', (e as Error).message);
  }

  // 결제 페이지 redirect URL — 토스 결제 위젯이 client side widget 으로 동작.
  // 본 응답은 client 가 widget 띄울 때 사용할 metadata.
  return NextResponse.json({
    order_id: orderId,
    customer_key: customerKey,
    plan_code: plan.code,
    plan_label: plan.label_ko,
    amount_krw: plan.price_krw,
    is_recurring: plan.recurring,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://easyedu.ai'}/billing/success`,
    fail_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://easyedu.ai'}/billing/fail`,
    // client 가 widget 띄운 후 사용자 결제 → /billing/success 로 redirect 됨.
    // redirect_url 은 client SDK 가 직접 호출하므로 server 가 알 필요 없음.
    // 다만 호환성 위해 빈 값 (PricingClient 는 redirect_url 사용 안 함 시 widget 모드).
    redirect_url: null,
  });
}
