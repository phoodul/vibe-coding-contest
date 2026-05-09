/**
 * 23차 (2026-05-10) A4 — 정기결제 자동 청구 cron.
 *
 * - vercel.json crons: 매일 KST 09시 (UTC 0시) 실행. 한국 새벽 트래픽 회피.
 * - 인증: Authorization: Bearer ${CRON_SECRET}
 *
 * 동작:
 *   1) subscriptions 에서 status='active' AND cancel_at_period_end=false AND
 *      current_period_end <= now() + 1day (24시간 buffer) 인 row 조회
 *   2) 각 row 에 대해:
 *      - toss_billing_key 미존재 → skip + warn 로그
 *      - chargeBilling 호출 → 성공 시 payments paid + subscription period 갱신
 *      - 실패 시 payments failed + subscription past_due (다음 cron 재시도)
 *   3) usage_counters 는 자동 reset (period_start 변경 시 새 row 생성)
 *
 * 응답: { processed, succeeded, failed, errors }
 */
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { chargeBilling, generateOrderId } from '@/lib/payment/toss';
import { getPlan } from '@/lib/payment/plans';

export const runtime = 'nodejs';
export const maxDuration = 300;

const CRON_SECRET = process.env.CRON_SECRET ?? '';

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_code: string;
  price_krw: number;
  monthly_quota: number | null;
  toss_billing_key: string | null;
  toss_customer_key: string | null;
  current_period_end: string;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') ?? '';
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (process.env.NEXT_PUBLIC_PAYMENT_ACTIVE !== 'true') {
    return NextResponse.json({
      ok: true,
      skipped: 'payment_inactive',
      message: 'NEXT_PUBLIC_PAYMENT_ACTIVE != true (베타 동안 cron skip)',
    });
  }

  const svc = createServiceClient();

  // 24시간 안에 만료될 active 구독 조회
  const cutoff = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const { data: subs, error: queryErr } = await svc
    .from('subscriptions')
    .select(
      'id, user_id, plan_code, price_krw, monthly_quota, toss_billing_key, toss_customer_key, current_period_end',
    )
    .eq('status', 'active')
    .eq('cancel_at_period_end', false)
    .lte('current_period_end', cutoff);

  if (queryErr) {
    return NextResponse.json(
      { error: 'query_failed', detail: queryErr.message },
      { status: 500 },
    );
  }

  const rows = (subs ?? []) as SubscriptionRow[];
  let succeeded = 0;
  let failed = 0;
  const errors: Array<{ subscription_id: string; reason: string }> = [];

  for (const sub of rows) {
    if (!sub.toss_billing_key || !sub.toss_customer_key) {
      errors.push({ subscription_id: sub.id, reason: 'missing_billing_key' });
      failed++;
      continue;
    }

    const plan = getPlan(sub.plan_code);
    if (!plan) {
      errors.push({ subscription_id: sub.id, reason: `unknown_plan:${sub.plan_code}` });
      failed++;
      continue;
    }

    const orderId = generateOrderId('sub');

    // pending payments row 먼저 insert (idempotency 추적)
    const { data: pendingRow } = await svc
      .from('payments')
      .insert({
        user_id: sub.user_id,
        subscription_id: sub.id,
        plan_code: plan.code,
        toss_order_id: orderId,
        amount_krw: plan.price_krw,
        vat_krw: Math.round(plan.price_krw - plan.price_krw / 1.1),
        status: 'pending',
      })
      .select('id')
      .single();

    try {
      const chargeResp = await chargeBilling({
        billingKey: sub.toss_billing_key,
        customerKey: sub.toss_customer_key,
        amount: plan.price_krw,
        orderId,
        orderName: `${plan.label_ko} (월 ₩${plan.price_krw.toLocaleString('ko-KR')}) 자동 청구`,
      });

      // 성공: payments paid + subscription period 갱신
      const newPeriodStart = new Date();
      const newPeriodEnd = new Date(newPeriodStart);
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

      if (pendingRow) {
        await svc
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
          .eq('id', pendingRow.id);
      }

      await svc
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: newPeriodStart.toISOString(),
          current_period_end: newPeriodEnd.toISOString(),
        })
        .eq('id', sub.id);

      succeeded++;
    } catch (e) {
      const msg = (e as Error).message;
      if (pendingRow) {
        await svc
          .from('payments')
          .update({
            status: 'failed',
            failure_message: msg.slice(0, 500),
          })
          .eq('id', pendingRow.id);
      }
      // subscription past_due — 다음 cron 재시도 가능
      await svc.from('subscriptions').update({ status: 'past_due' }).eq('id', sub.id);
      errors.push({ subscription_id: sub.id, reason: msg.slice(0, 200) });
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    processed: rows.length,
    succeeded,
    failed,
    errors: errors.slice(0, 20),
    cutoff,
  });
}
