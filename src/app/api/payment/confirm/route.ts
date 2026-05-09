/**
 * 22차 (2026-05-09) — POST /api/payment/confirm.
 *
 * 토스 결제 위젯 완료 → /billing/success redirect → client 가 본 endpoint 호출.
 * server 가 토스 confirm API 로 결제 승인 + payments / subscriptions row update.
 *
 * 정기결제 (Basic / Standard / Premium): 첫 결제 = 빌링키 발급 + 즉시 첫 charge
 * 단발 (topup_100): confirm 만 → usage_counters 증가
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPlan } from '@/lib/payment/plans';
import { confirmPayment } from '@/lib/payment/toss';

export const runtime = 'nodejs';

interface ConfirmBody {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: ConfirmBody;
  try {
    body = (await req.json()) as ConfirmBody;
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (!body.paymentKey || !body.orderId || typeof body.amount !== 'number') {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }

  // pending payment 조회
  const { data: pending } = await supabase
    .from('payments')
    .select('id, user_id, plan_code, amount_krw, status')
    .eq('toss_order_id', body.orderId)
    .single();
  if (!pending) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }
  if (pending.user_id !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (pending.amount_krw !== body.amount) {
    return NextResponse.json(
      { error: 'amount_mismatch', message: '결제 금액이 일치하지 않습니다.' },
      { status: 400 },
    );
  }
  if (pending.status === 'paid') {
    return NextResponse.json({ ok: true, already_paid: true });
  }

  // 토스 confirm
  let tossResp;
  try {
    tossResp = await confirmPayment({
      paymentKey: body.paymentKey,
      orderId: body.orderId,
      amount: body.amount,
    });
  } catch (e) {
    const message = (e as Error).message;
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_message: message.slice(0, 500),
      })
      .eq('id', pending.id);
    return NextResponse.json({ error: 'toss_confirm_failed', message }, { status: 502 });
  }

  // payments update
  await supabase
    .from('payments')
    .update({
      status: 'paid',
      toss_payment_key: tossResp.paymentKey,
      toss_method: tossResp.method ?? null,
      paid_at: tossResp.approvedAt ?? new Date().toISOString(),
      receipt_url: tossResp.receipt?.url ?? null,
      refundable_amount_krw: tossResp.totalAmount,
      raw_response: tossResp as unknown as Record<string, unknown>,
    })
    .eq('id', pending.id);

  // subscription 생성/갱신 (정기결제)
  const plan = getPlan(pending.plan_code);
  if (plan && plan.recurring) {
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // 기존 active subscription 있으면 갱신, 없으면 생성
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
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        })
        .eq('id', existing.id);
    } else {
      const customerKey = `user_${user.id}`;
      await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan_code: plan.code,
        status: 'active',
        price_krw: plan.price_krw,
        monthly_quota: plan.monthly_quota,
        toss_customer_key: customerKey,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });
    }
  }

  // topup_100 = 즉시 사용량 한도 +100
  if (plan && plan.code === 'topup_100') {
    // active subscription 의 current period 에 합산.
    // 단순화: 기존 usage_counter 의 quota_limit 을 +100. 미존재 시 row 생성.
    const periodStart = new Date();
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: counter } = await supabase
      .from('usage_counters')
      .select('id, quota_limit')
      .eq('user_id', user.id)
      .eq('counter_type', 'topup')
      .gte('period_end', new Date().toISOString())
      .maybeSingle();

    if (counter) {
      await supabase
        .from('usage_counters')
        .update({ quota_limit: (counter.quota_limit ?? 0) + 100 })
        .eq('id', counter.id);
    } else {
      await supabase.from('usage_counters').insert({
        user_id: user.id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        counter_type: 'topup',
        used_count: 0,
        quota_limit: 100,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    payment_id: pending.id,
    plan_code: pending.plan_code,
    receipt_url: tossResp.receipt?.url ?? null,
  });
}
