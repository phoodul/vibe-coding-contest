/**
 * 23차 (2026-05-10) A3 — GET /api/admin/billing/refunds.
 *
 * 환불 검토용. 7일 초과 사용자 신청은 refunds.status='pending' 으로 적재되어
 * 본 endpoint 가 admin 검토 큐로 노출. 관리자가 승인/반려 처리.
 *
 * RLS bypass: service role 클라이언트 사용 (모든 사용자 결제 cross-cutting 조회).
 *
 * Query: ?tab=pending|all (default pending)
 * 응답: {
 *   stats: { paid_this_month, revenue_this_month, refunded_this_month,
 *            refund_amount_this_month, pending_refunds },
 *   refunds: [{ id, user_email, amount_requested_krw, reason, reason_text,
 *               created_at, payment_id, plan_code }],
 *   recent_payments: [{ id, user_email, plan_code, amount_krw, status, paid_at,
 *                       receipt_url }]
 * }
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isAdminEmail } from '@/lib/legend/access-tier';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const tab = url.searchParams.get('tab') ?? 'pending';

  const svc = createServiceClient();

  // 이번 달 통계
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthIso = monthStart.toISOString();

  const { data: paidRows } = await svc
    .from('payments')
    .select('amount_krw, status, paid_at')
    .gte('paid_at', monthIso)
    .eq('status', 'paid');
  const paidThisMonth = paidRows?.length ?? 0;
  const revenueThisMonth = (paidRows ?? []).reduce((s, r) => s + (r.amount_krw ?? 0), 0);

  const { data: refundedRows } = await svc
    .from('refunds')
    .select('amount_refunded_krw, status, completed_at, created_at')
    .or(`completed_at.gte.${monthIso},created_at.gte.${monthIso}`);
  const refundedThisMonth = (refundedRows ?? []).filter((r) => r.status === 'completed').length;
  const refundAmountThisMonth = (refundedRows ?? [])
    .filter((r) => r.status === 'completed')
    .reduce((s, r) => s + (r.amount_refunded_krw ?? 0), 0);

  const { count: pendingCount } = await svc
    .from('refunds')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  // refunds 목록
  const refundsQuery = svc
    .from('refunds')
    .select(
      'id, user_id, payment_id, amount_requested_krw, reason, reason_text, status, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(100);
  const { data: refunds } = tab === 'pending'
    ? await refundsQuery.eq('status', 'pending')
    : await refundsQuery;

  // user_id 별 email 조회 (auth.users 는 service role 만 접근)
  const userIds = Array.from(new Set((refunds ?? []).map((r) => r.user_id).filter(Boolean)));
  const emailMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: users } = await svc.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (users?.users) {
      for (const u of users.users) {
        if (u.id && userIds.includes(u.id)) emailMap.set(u.id, u.email ?? '');
      }
    }
  }

  // payments 정보 (plan_code 표기)
  const paymentIds = Array.from(new Set((refunds ?? []).map((r) => r.payment_id).filter(Boolean)));
  const paymentMap = new Map<string, { plan_code: string; amount_krw: number; paid_at: string | null }>();
  if (paymentIds.length > 0) {
    const { data: payRows } = await svc
      .from('payments')
      .select('id, plan_code, amount_krw, paid_at')
      .in('id', paymentIds);
    for (const p of payRows ?? []) {
      paymentMap.set(p.id, {
        plan_code: p.plan_code,
        amount_krw: p.amount_krw,
        paid_at: p.paid_at,
      });
    }
  }

  const enrichedRefunds = (refunds ?? []).map((r) => ({
    id: r.id,
    payment_id: r.payment_id,
    user_email: emailMap.get(r.user_id) ?? r.user_id.slice(0, 8),
    amount_requested_krw: r.amount_requested_krw,
    reason: r.reason,
    reason_text: r.reason_text,
    status: r.status,
    created_at: r.created_at,
    plan_code: paymentMap.get(r.payment_id)?.plan_code ?? null,
    paid_at: paymentMap.get(r.payment_id)?.paid_at ?? null,
  }));

  // 최근 결제 50건 (관리자 모니터링)
  const { data: recentPayments } = await svc
    .from('payments')
    .select('id, user_id, plan_code, amount_krw, status, paid_at, receipt_url')
    .order('created_at', { ascending: false })
    .limit(50);
  const recentUserIds = Array.from(new Set((recentPayments ?? []).map((p) => p.user_id)));
  for (const uid of recentUserIds) {
    if (!emailMap.has(uid)) {
      const { data: u } = await svc.auth.admin.getUserById(uid);
      if (u?.user?.email) emailMap.set(uid, u.user.email);
    }
  }
  const enrichedPayments = (recentPayments ?? []).map((p) => ({
    id: p.id,
    user_email: emailMap.get(p.user_id) ?? p.user_id.slice(0, 8),
    plan_code: p.plan_code,
    amount_krw: p.amount_krw,
    status: p.status,
    paid_at: p.paid_at,
    receipt_url: p.receipt_url,
  }));

  return NextResponse.json({
    stats: {
      paid_this_month: paidThisMonth,
      revenue_this_month: revenueThisMonth,
      refunded_this_month: refundedThisMonth,
      refund_amount_this_month: refundAmountThisMonth,
      pending_refunds: pendingCount ?? 0,
    },
    refunds: enrichedRefunds,
    recent_payments: enrichedPayments,
  });
}
