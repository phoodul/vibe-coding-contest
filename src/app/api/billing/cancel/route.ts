/**
 * 22차 (2026-05-09) — POST /api/billing/cancel.
 *
 * 정기결제 해지 — 다음 결제 예정일에 자동 결제 중단. 현재 기간은 정상 이용 가능.
 * 즉시 환불은 별도 /api/payment/refund.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, status, current_period_end')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!sub) {
    return NextResponse.json({ error: 'no_active_subscription' }, { status: 404 });
  }

  await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      canceled_at: new Date().toISOString(),
    })
    .eq('id', sub.id);

  return NextResponse.json({
    ok: true,
    message: '정기결제가 해지되었습니다. 다음 결제일까지 정상 이용 가능합니다.',
    period_end: sub.current_period_end,
  });
}
