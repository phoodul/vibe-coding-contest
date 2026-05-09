/**
 * 22차 (2026-05-09) — POST /api/payment/webhook.
 *
 * 토스페이먼츠 webhook 수신 — 결제 상태 변경 / 빌링키 삭제 / 정기결제 실패 등.
 * idempotent 처리 (event_id unique) + signature 검증 (TOSS_WEBHOOK_SECRET).
 *
 * 가맹점 가입 후 dashboard 에서 webhook URL 등록 필요:
 *   https://easyedu.ai/api/payment/webhook
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/payment/toss';

export const runtime = 'nodejs';

interface TossWebhookPayload {
  eventId?: string;
  eventType?: string;
  data?: {
    paymentKey?: string;
    orderId?: string;
    status?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature =
    req.headers.get('toss-signature') ??
    req.headers.get('TossPayments-Signature') ??
    null;

  const valid = await verifyWebhookSignature(rawBody, signature);

  let payload: TossWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as TossWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const eventId = payload.eventId ?? `unknown_${Date.now()}`;
  const eventType = payload.eventType ?? 'unknown';

  // service_role 권한이 필요 — 본 endpoint 는 server-only (RLS 대신 webhook 검증 의존)
  const supabase = await createClient();

  // 중복 검사
  const { data: existing } = await supabase
    .from('payment_webhooks_log')
    .select('id, status')
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await supabase.from('payment_webhooks_log').insert({
    event_id: eventId,
    event_type: eventType,
    payment_key: payload.data?.paymentKey ?? null,
    order_id: payload.data?.orderId ?? null,
    status: valid ? 'received' : 'invalid_signature',
    signature_valid: valid,
    raw_payload: payload as unknown as Record<string, unknown>,
  });

  if (!valid) {
    console.warn('[payment/webhook] signature invalid:', { eventId, eventType });
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  // 이벤트 타입별 처리 (가맹점 가입 후 실제 이벤트 명세 확인 + 확장)
  try {
    if (eventType === 'PAYMENT_STATUS_CHANGED' && payload.data?.paymentKey) {
      const newStatus = payload.data.status;
      if (newStatus === 'CANCELED' || newStatus === 'PARTIAL_CANCELED') {
        await supabase
          .from('payments')
          .update({
            status:
              newStatus === 'CANCELED' ? 'canceled' : 'partial_canceled',
          })
          .eq('toss_payment_key', payload.data.paymentKey);
      }
      if (newStatus === 'FAILED') {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('toss_payment_key', payload.data.paymentKey);
      }
    }
    // 향후: BILLING_KEY_DELETED · BILLING_PAYMENT_FAILED 등 추가

    await supabase
      .from('payment_webhooks_log')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('event_id', eventId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.warn('[payment/webhook] processing error:', (e as Error).message);
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}
