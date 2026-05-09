/**
 * 22차 (2026-05-09) — POST /api/payment/refund.
 *
 * 환불 신청 — 사용자 본인 결제분에 대해. 환불 정책 (/refund) 자동 적용:
 *   - 결제 ≤ 7일 + 미사용 (counter.used = 0) → 즉시 전액 환불 (토스 cancel API)
 *   - 결제 ≤ 7일 + 일부 사용 → 사용분 일할 차감 후 환불
 *   - 결제 > 7일 → "결제 기간 만료까지 사용 + 다음 결제 차단" 안내
 *
 * 7일 초과 + 회사 측 사유 (장애 등) 환불은 admin 검토 (status=pending → admin
 * service_role API 로 별도 처리).
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelPayment } from '@/lib/payment/toss';
import { getPlan } from '@/lib/payment/plans';

export const runtime = 'nodejs';

interface RefundBody {
  payment_id?: string;
  reason?: string;
  reason_text?: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: RefundBody;
  try {
    body = (await req.json()) as RefundBody;
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (!body.payment_id) {
    return NextResponse.json({ error: 'missing_payment_id' }, { status: 400 });
  }

  // 본인 결제 + paid 상태만
  const { data: payment } = await supabase
    .from('payments')
    .select('id, user_id, plan_code, amount_krw, status, paid_at, toss_payment_key, refundable_amount_krw, subscription_id')
    .eq('id', body.payment_id)
    .single();
  if (!payment || payment.user_id !== user.id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (payment.status !== 'paid') {
    return NextResponse.json(
      { error: 'invalid_status', message: '결제가 완료된 건만 환불 가능합니다.' },
      { status: 400 },
    );
  }
  if (!payment.toss_payment_key || !payment.paid_at) {
    return NextResponse.json({ error: 'missing_toss_key' }, { status: 400 });
  }

  // 7일 경과 여부
  const paidAt = new Date(payment.paid_at).getTime();
  const elapsed = Date.now() - paidAt;
  if (elapsed > SEVEN_DAYS_MS) {
    // 7일 초과 — pending 으로 admin 검토 대기
    const { data: refundRow } = await supabase
      .from('refunds')
      .insert({
        user_id: user.id,
        payment_id: payment.id,
        subscription_id: payment.subscription_id,
        reason: body.reason ?? 'user_request',
        reason_text: body.reason_text ?? null,
        amount_requested_krw: payment.refundable_amount_krw ?? payment.amount_krw,
        status: 'pending',
      })
      .select()
      .single();
    return NextResponse.json({
      ok: true,
      auto: false,
      message:
        '7일이 경과한 결제건은 관리자 검토 후 처리됩니다. 영업일 기준 3일 이내 결과 알림.',
      refund_id: refundRow?.id,
    });
  }

  // 7일 이내 — 사용량 조회
  const plan = getPlan(payment.plan_code);
  const periodStart = new Date(paidAt);
  const { data: counter } = await supabase
    .from('usage_counters')
    .select('used_count, quota_limit')
    .eq('user_id', user.id)
    .gte('period_end', periodStart.toISOString())
    .maybeSingle();

  const usedCount = counter?.used_count ?? 0;
  const quotaLimit = plan?.monthly_quota ?? 0;

  // 환불 금액 계산
  let refundAmount = payment.refundable_amount_krw ?? payment.amount_krw;
  if (usedCount > 0 && quotaLimit > 0 && plan?.code !== 'premium') {
    const unitPrice = Math.floor(payment.amount_krw / quotaLimit);
    refundAmount = Math.max(0, payment.amount_krw - unitPrice * usedCount);
  }
  // Premium = 7일 이내 무조건 전액 (사용 무관)

  // 토스 cancel
  let cancelResp;
  try {
    cancelResp = await cancelPayment({
      paymentKey: payment.toss_payment_key,
      cancelReason:
        body.reason_text?.slice(0, 200) ??
        body.reason ??
        '7일 이내 청약철회',
      cancelAmount: refundAmount < payment.amount_krw ? refundAmount : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'toss_cancel_failed', message: (e as Error).message },
      { status: 502 },
    );
  }

  // refunds row + payments status update
  await supabase.from('refunds').insert({
    user_id: user.id,
    payment_id: payment.id,
    subscription_id: payment.subscription_id,
    reason: body.reason ?? (usedCount === 0 ? 'unused_within_7d' : 'partial_use'),
    reason_text: body.reason_text ?? null,
    amount_requested_krw: refundAmount,
    amount_refunded_krw: refundAmount,
    used_quota_at_request: usedCount,
    status: 'completed',
    completed_at: new Date().toISOString(),
  });

  await supabase
    .from('payments')
    .update({
      status: refundAmount === payment.amount_krw ? 'canceled' : 'partial_canceled',
      refundable_amount_krw: payment.amount_krw - refundAmount,
    })
    .eq('id', payment.id);

  // subscription 즉시 해지 (전액 환불 시)
  if (payment.subscription_id && refundAmount === payment.amount_krw) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      })
      .eq('id', payment.subscription_id);
  }

  return NextResponse.json({
    ok: true,
    auto: true,
    refund_amount_krw: refundAmount,
    used_count: usedCount,
    receipt_url: cancelResp.receipt?.url ?? null,
  });
}
