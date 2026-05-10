/**
 * 24차 (2026-05-10) — 결제 시스템 단위 테스트 ② toss helpers.
 *
 * 외부 fetch 호출 (confirmPayment / chargeBilling 등) 은 본 테스트 범위 밖 (E2E).
 * 본 테스트 = pure 또는 near-pure helpers (customerKey · orderId · webhook signature).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  customerKeyFromUserId,
  generateOrderId,
  verifyWebhookSignature,
} from '../toss';

describe('customerKeyFromUserId', () => {
  it('user_ prefix + uuid 그대로', () => {
    const id = '01234567-89ab-cdef-0123-456789abcdef';
    expect(customerKeyFromUserId(id)).toBe(`user_${id}`);
  });

  it('uuid 의 - 를 보존 (토스 영문/숫자/-/_/. 허용)', () => {
    const id = 'aaaa-bbbb';
    expect(customerKeyFromUserId(id)).toContain('-');
  });

  it('빈 문자열도 user_ prefix', () => {
    expect(customerKeyFromUserId('')).toBe('user_');
  });
});

describe('generateOrderId', () => {
  it('default prefix = sub_', () => {
    const id = generateOrderId();
    expect(id.startsWith('sub_')).toBe(true);
  });

  it('topup prefix 지정 시 topup_', () => {
    const id = generateOrderId('topup');
    expect(id.startsWith('topup_')).toBe(true);
  });

  it('64자 이내 (토스 권장 한도)', () => {
    for (let i = 0; i < 100; i++) {
      const id = generateOrderId('sub');
      expect(id.length).toBeLessThanOrEqual(64);
    }
  });

  it('영문/숫자/_ 만 사용 (토스 허용 charset)', () => {
    const id = generateOrderId();
    expect(id).toMatch(/^[A-Za-z0-9_]+$/);
  });

  it('동시에 100개 생성해도 모두 unique', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateOrderId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('verifyWebhookSignature', () => {
  const ORIGINAL_SECRET = process.env.TOSS_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.TOSS_WEBHOOK_SECRET = 'test_secret_abc';
  });

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) {
      delete process.env.TOSS_WEBHOOK_SECRET;
    } else {
      process.env.TOSS_WEBHOOK_SECRET = ORIGINAL_SECRET;
    }
  });

  it('signature null → false', async () => {
    const ok = await verifyWebhookSignature('{}', null);
    expect(ok).toBe(false);
  });

  it('TOSS_WEBHOOK_SECRET 미설정 → false (보안 fail-closed)', async () => {
    delete process.env.TOSS_WEBHOOK_SECRET;
    const ok = await verifyWebhookSignature('{}', 'some_signature');
    expect(ok).toBe(false);
  });

  it('잘못된 signature → false', async () => {
    const ok = await verifyWebhookSignature('{"event":"test"}', 'bogus');
    expect(ok).toBe(false);
  });

  it('올바른 HMAC-SHA256 base64 signature → true', async () => {
    const crypto = await import('node:crypto');
    const body = '{"eventId":"evt_123","eventType":"PAYMENT_STATUS_CHANGED"}';
    const signature = crypto
      .createHmac('sha256', 'test_secret_abc')
      .update(body)
      .digest('base64');
    const ok = await verifyWebhookSignature(body, signature);
    expect(ok).toBe(true);
  });

  it('body 변조 시 (1 char) → false', async () => {
    const crypto = await import('node:crypto');
    const body = '{"eventId":"evt_123"}';
    const tamperedBody = '{"eventId":"evt_124"}'; // 마지막 1 char 변조
    const signature = crypto
      .createHmac('sha256', 'test_secret_abc')
      .update(body)
      .digest('base64');
    const ok = await verifyWebhookSignature(tamperedBody, signature);
    expect(ok).toBe(false);
  });

  it('signature 길이 다르면 즉시 false (timing-safe 패턴)', async () => {
    // 짧은 signature → length mismatch → timingSafeEqual 호출 안 됨
    const ok = await verifyWebhookSignature('{}', 'short');
    expect(ok).toBe(false);
  });
});
