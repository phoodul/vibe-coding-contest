/**
 * 22차 (2026-05-09) — 토스페이먼츠 server-side helper.
 *
 * 책임:
 *   - confirm (결제 승인) · billing key 발급 · 정기결제 charge · 환불
 *   - secret key Basic 인증 (server only — TOSS_SECRET_KEY 노출 금지)
 *   - 응답 raw 보관 (DB raw_response jsonb)
 *
 * env (활성화 시 사용자 vercel env 추가):
 *   TOSS_SECRET_KEY      — 라이브 secret key (test/live 분리)
 *   TOSS_WEBHOOK_SECRET  — webhook 시그니처 검증용
 *   NEXT_PUBLIC_TOSS_CLIENT_KEY — client SDK widget 용
 *
 * env 미설정 시 throw — 베타 동안은 호출되지 않음 (가격 페이지 결제 버튼 disabled).
 */

const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

function getAuthHeader(): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) {
    throw new Error(
      'TOSS_SECRET_KEY env 가 설정되지 않았습니다. 베타 종료 + 가맹점 가입 후 vercel env 에 추가하세요.',
    );
  }
  // 토스: secret 끝에 ":" 추가 후 base64 (Basic 인증)
  const encoded = Buffer.from(`${secret}:`).toString('base64');
  return `Basic ${encoded}`;
}

export interface TossConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossConfirmResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  method?: string;
  totalAmount: number;
  receipt?: { url: string };
  approvedAt?: string;
  card?: { number: string; cardType: string; ownerType: string };
  [k: string]: unknown;
}

/**
 * 결제 승인 — client 가 결제 위젯 완료 후 redirect 한 paymentKey + orderId + amount
 * 를 그대로 server 가 검증하여 confirm 호출.
 */
export async function confirmPayment(
  body: TossConfirmRequest,
): Promise<TossConfirmResponse> {
  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as TossConfirmResponse & { code?: string; message?: string };
  if (!res.ok) {
    throw new Error(
      `[toss/confirm] ${res.status} ${json.code ?? ''} ${json.message ?? '결제 승인 실패'}`,
    );
  }
  return json;
}

export interface TossBillingKeyRequest {
  authKey: string;
  customerKey: string;
}

export interface TossBillingKeyResponse {
  billingKey: string;
  customerKey: string;
  authenticatedAt?: string;
  method?: string;
  card?: { issuerCode: string; acquirerCode?: string; number: string; cardType: string };
}

/**
 * 빌링키 발급 — 정기결제 등록 후 client 가 받은 authKey 를 server 가 영구
 * billingKey 로 교환. customerKey 는 우리 시스템의 user 식별자 (예: 'user_<uuid>').
 */
export async function issueBillingKey(
  body: TossBillingKeyRequest,
): Promise<TossBillingKeyResponse> {
  const res = await fetch(`${TOSS_API_BASE}/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as TossBillingKeyResponse & { code?: string; message?: string };
  if (!res.ok) {
    throw new Error(
      `[toss/billing] ${res.status} ${json.code ?? ''} ${json.message ?? '빌링키 발급 실패'}`,
    );
  }
  return json;
}

export interface TossChargeRequest {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
}

/**
 * 정기결제 charge — 빌링키로 다음 청구 사이클 자동 결제. cron 또는 webhook 으로 실행.
 */
export async function chargeBilling(
  body: TossChargeRequest,
): Promise<TossConfirmResponse> {
  const { billingKey, ...rest } = body;
  const res = await fetch(`${TOSS_API_BASE}/billing/${billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rest),
  });
  const json = (await res.json()) as TossConfirmResponse & { code?: string; message?: string };
  if (!res.ok) {
    throw new Error(
      `[toss/charge] ${res.status} ${json.code ?? ''} ${json.message ?? '정기결제 실패'}`,
    );
  }
  return json;
}

export interface TossCancelRequest {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number; // 부분 환불 시
  refundReceiveAccount?: {
    bank: string;
    accountNumber: string;
    holderName: string;
  };
}

/**
 * 환불 (전액 또는 부분). 카드 결제 환불은 카드사로 자동 입금 (3~5 영업일).
 * 가상계좌 / 계좌이체는 refundReceiveAccount 필수.
 */
export async function cancelPayment(
  body: TossCancelRequest,
): Promise<TossConfirmResponse> {
  const { paymentKey, ...rest } = body;
  const res = await fetch(`${TOSS_API_BASE}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rest),
  });
  const json = (await res.json()) as TossConfirmResponse & { code?: string; message?: string };
  if (!res.ok) {
    throw new Error(
      `[toss/cancel] ${res.status} ${json.code ?? ''} ${json.message ?? '환불 실패'}`,
    );
  }
  return json;
}

/**
 * webhook 시그니처 검증 — TOSS_WEBHOOK_SECRET 으로 HMAC-SHA256.
 * 토스의 정확한 시그니처 헤더 이름·알고리즘은 가맹점 가입 후 dashboard 설정 확인.
 * 본 함수는 표준 패턴 — 실제 헤더 명은 production 활성화 시 검증.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;
  const secret = process.env.TOSS_WEBHOOK_SECRET;
  if (!secret) return false;
  try {
    const crypto = await import('node:crypto');
    const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
    // timing-safe 비교
    const a = Buffer.from(hmac);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    console.warn('[toss/webhook] signature verify error:', (e as Error).message);
    return false;
  }
}

/** 우리 시스템의 customerKey 생성 (user_id 기반, 토스 권장 형식) */
export function customerKeyFromUserId(userId: string): string {
  // 영문 + 숫자 + - + _ . 허용. UUID 의 - 그대로 OK.
  return `user_${userId}`;
}

/** orderId 생성 — 토스 권장: 고유 영숫자 64자 이내 */
export function generateOrderId(prefix: 'sub' | 'topup' = 'sub'): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}_${rand}`;
}
