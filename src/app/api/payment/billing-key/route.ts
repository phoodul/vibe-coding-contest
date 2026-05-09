/**
 * 22차 (2026-05-09) — POST /api/payment/billing-key.
 *
 * 정기결제 빌링키 발급 — client 가 토스 빌링 위젯에서 카드 등록 → authKey 받음 →
 * 본 endpoint 가 server 에서 authKey → billingKey 영구 교환 후 subscriptions 에 보관.
 *
 * 다음 결제 사이클부터 cron 또는 webhook 기반으로 chargeBilling 자동 실행.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { issueBillingKey, customerKeyFromUserId } from '@/lib/payment/toss';

export const runtime = 'nodejs';

interface BillingKeyBody {
  authKey?: string;
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
  if (!body.authKey) {
    return NextResponse.json({ error: 'missing_authKey' }, { status: 400 });
  }

  const customerKey = customerKeyFromUserId(user.id);
  let issued;
  try {
    issued = await issueBillingKey({
      authKey: body.authKey,
      customerKey,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'toss_billing_failed', message: (e as Error).message },
      { status: 502 },
    );
  }

  // subscriptions 의 toss_billing_key 갱신 (active 1 row 가정)
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) {
    await supabase
      .from('subscriptions')
      .update({ toss_billing_key: issued.billingKey, toss_customer_key: customerKey })
      .eq('id', existing.id);
  } else {
    // active subscription 미존재 = 결제 흐름 오류
    return NextResponse.json(
      { error: 'no_active_subscription', message: '활성 구독이 없어 빌링키를 보관할 수 없습니다.' },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    masked_card: issued.card?.number ?? null,
    issuer: issued.card?.issuerCode ?? null,
  });
}
