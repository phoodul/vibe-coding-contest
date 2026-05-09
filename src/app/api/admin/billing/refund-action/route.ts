/**
 * 23차 (2026-05-10) A3 — POST /api/admin/billing/refund-action.
 *
 * pending 환불 admin 처리:
 *   - approve: 토스 cancelPayment 호출 + payments status update + refunds completed
 *   - reject: refunds.status='rejected' + admin_note 기록 (결제 그대로 유지)
 *
 * RLS bypass: service role.
 *
 * Body: { refund_id, action: 'approve' | 'reject', admin_note?: string }
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isAdminEmail } from '@/lib/legend/access-tier';
import { cancelPayment } from '@/lib/payment/toss';

export const runtime = 'nodejs';

interface ActionBody {
  refund_id?: string;
  action?: 'approve' | 'reject';
  admin_note?: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: ActionBody;
  try {
    body = (await req.json()) as ActionBody;
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (!body.refund_id || (body.action !== 'approve' && body.action !== 'reject')) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  const svc = createServiceClient();

  const { data: refund } = await svc
    .from('refunds')
    .select('id, user_id, payment_id, subscription_id, amount_requested_krw, status')
    .eq('id', body.refund_id)
    .single();
  if (!refund) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (refund.status !== 'pending') {
    return NextResponse.json(
      { error: 'invalid_status', message: 'pending 환불만 처리 가능합니다.' },
      { status: 400 },
    );
  }

  if (body.action === 'reject') {
    await svc
      .from('refunds')
      .update({
        status: 'rejected',
        admin_note: body.admin_note ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', refund.id);
    return NextResponse.json({ ok: true, action: 'rejected' });
  }

  // approve — 토스 cancel + DB update
  const { data: payment } = await svc
    .from('payments')
    .select('id, amount_krw, toss_payment_key, status')
    .eq('id', refund.payment_id)
    .single();
  if (!payment || !payment.toss_payment_key) {
    return NextResponse.json({ error: 'payment_not_found' }, { status: 404 });
  }

  const refundAmount = refund.amount_requested_krw ?? payment.amount_krw;
  let cancelResp;
  try {
    cancelResp = await cancelPayment({
      paymentKey: payment.toss_payment_key,
      cancelReason: body.admin_note ?? '관리자 승인 환불',
      cancelAmount: refundAmount < payment.amount_krw ? refundAmount : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'toss_cancel_failed', message: (e as Error).message },
      { status: 502 },
    );
  }

  await svc
    .from('refunds')
    .update({
      status: 'completed',
      amount_refunded_krw: refundAmount,
      completed_at: new Date().toISOString(),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_note: body.admin_note ?? null,
    })
    .eq('id', refund.id);

  await svc
    .from('payments')
    .update({
      status: refundAmount === payment.amount_krw ? 'canceled' : 'partial_canceled',
      refundable_amount_krw: payment.amount_krw - refundAmount,
    })
    .eq('id', payment.id);

  if (refund.subscription_id && refundAmount === payment.amount_krw) {
    await svc
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      })
      .eq('id', refund.subscription_id);
  }

  return NextResponse.json({
    ok: true,
    action: 'approved',
    refund_amount_krw: refundAmount,
    receipt_url: cancelResp.receipt?.url ?? null,
  });
}
