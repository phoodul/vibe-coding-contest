/**
 * 22차 (2026-05-09) 신설 → 23차 (2026-05-10) A2: 첫 결제 charge + DB 누적.
 *
 * 정기결제 흐름:
 *   1. client 가 토스 V2 SDK requestBillingAuth() → 카드 등록 → /billing/success?authKey=...
 *   2. /billing/success 가 본 endpoint POST {authKey, customerKey, order_id}
 *   3. server: authKey → billingKey 영구 교환 (issueBillingKey)
 *   4. 첫 결제 즉시 charge (chargeBilling) — pending payments row 를 paid 로 update
 *   5. subscriptions active row 생성 (toss_billing_key 보관) → 다음 사이클 cron 자동 청구
 *
 * 다음 사이클부터 /api/cron/billing-recurring 이 chargeBilling 호출.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  issueBillingKey,
  chargeBilling,
  customerKeyFromUserId,
} from '@/lib/payment/toss';
import { getPlan } from '@/lib/payment/plans';

export const runtime = 'nodejs';

interface BillingKeyBody {
  authKey?: string;
  customerKey?: string;
  order_id?: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: BillingKeyBody;
  try {
    body = (await req.json()) as BillingKeyBody;
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (!body.authKey || !body.order_id) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }

  // pending payment row 조회 (checkout 시 생성된 row)
  const { data: pending } = await supabase
    .from('payments')
    .select('id, user_id, plan_code, amount_krw, status')
    .eq('toss_order_id', body.order_id)
    .single();
  if (!pending) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }
  if (pending.user_id !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const plan = getPlan(pending.plan_code);
  if (!plan || !plan.recurring) {
    return NextResponse.json(
      { error: 'invalid_plan', message: '정기결제용 요금제가 아닙니다.' },
      { status: 400 },
    );
  }

  const customerKey = body.customerKey ?? customerKeyFromUserId(user.id);

  // 1. 빌링키 발급
  let issued;
  try {
    issued = await issueBillingKey({ authKey: body.authKey, customerKey });
  } catch (e) {
    return NextResponse.json(
      { error: 'toss_billing_failed', message: (e as Error).message },
      { status: 502 },
    );
  }

  // 2. 첫 결제 즉시 charge
  let chargeResp;
  try {
    chargeResp = await chargeBilling({
      billingKey: issued.billingKey,
      customerKey,
      amount: plan.price_krw,
      orderId: body.order_id,
      orderName: `${plan.label_ko} (월 ₩${plan.price_krw.toLocaleString('ko-KR')})`,
      customerEmail: user.email ?? undefined,
    });
  } catch (e) {
    // 빌링키만 발급된 상태에서 charge 실패 → payments status 'failed' + 안내
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_message: (e as Error).message.slice(0, 500),
      })
      .eq('id', pending.id);
    return NextResponse.json(
      {
        error: 'first_charge_failed',
        message:
          '카드는 등록됐지만 첫 결제에 실패했습니다. 다른 카드로 다시 시도해 주세요.',
      },
      { status: 502 },
    );
  }

  // 3. payments row update (paid)
  await supabase
    .from('payments')
    .update({
      status: 'paid',
      toss_payment_key: chargeResp.paymentKey,
      toss_method: chargeResp.method ?? null,
      paid_at: chargeResp.approvedAt ?? new Date().toISOString(),
      receipt_url: chargeResp.receipt?.url ?? null,
      refundable_amount_krw: chargeResp.totalAmount,
      raw_response: chargeResp as unknown as Record<string, unknown>,
    })
    .eq('id', pending.id);

  // 4. subscriptions active row (기존 active 가 있으면 갱신)
  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) {
    await supabase
      .from('subscriptions')
      .update({
        plan_code: plan.code,
        price_krw: plan.price_krw,
        monthly_quota: plan.monthly_quota,
        toss_billing_key: issued.billingKey,
        toss_customer_key: customerKey,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan_code: plan.code,
      status: 'active',
      price_krw: plan.price_krw,
      monthly_quota: plan.monthly_quota,
      toss_billing_key: issued.billingKey,
      toss_customer_key: customerKey,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });
  }

  return NextResponse.json({
    ok: true,
    masked_card: issued.card?.number ?? null,
    issuer: issued.card?.issuerCode ?? null,
    receipt_url: chargeResp.receipt?.url ?? null,
  });
}
