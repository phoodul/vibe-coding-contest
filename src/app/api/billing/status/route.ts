/**
 * 22차 (2026-05-09) — GET /api/billing/status.
 *
 * 구독 관리 페이지 (/billing) 의 데이터 공급. 본인 구독 + quota + 최근 결제 5건 + 환불.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getQuotaSnapshot } from '@/lib/payment/quota';
import { getPlan } from '@/lib/payment/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const quota = await getQuotaSnapshot(supabase, user.id);
  const plan = quota.plan_code ? getPlan(quota.plan_code) : null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, toss_billing_key')
    .eq('user_id', user.id)
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: payments } = await supabase
    .from('payments')
    .select('id, plan_code, amount_krw, status, paid_at, receipt_url, refundable_amount_krw, toss_payment_key')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: refunds } = await supabase
    .from('refunds')
    .select('id, payment_id, amount_refunded_krw, status, created_at, completed_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    quota,
    plan: plan
      ? {
          code: plan.code,
          label_ko: plan.label_ko,
          price_krw: plan.price_krw,
          monthly_quota: plan.monthly_quota,
        }
      : null,
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          period_start: subscription.current_period_start,
          period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          has_billing_key: Boolean(subscription.toss_billing_key),
        }
      : null,
    payments: payments ?? [],
    refunds: refunds ?? [],
  });
}
