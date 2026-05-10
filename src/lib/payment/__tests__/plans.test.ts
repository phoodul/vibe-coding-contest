/**
 * 24차 (2026-05-10) — 결제 시스템 단위 테스트 ① plans.
 *
 * 가격·요금제 정의는 단일 source of truth. 회귀 시 즉시 detect.
 */
import { describe, it, expect } from 'vitest';
import { PLANS, getPlan, isRecurringPlan, vatAmount } from '../plans';

describe('plans — 가격 일관성', () => {
  it('Basic = ₩29,000 / 50회 / recurring', () => {
    expect(PLANS.basic.price_krw).toBe(29000);
    expect(PLANS.basic.monthly_quota).toBe(50);
    expect(PLANS.basic.recurring).toBe(true);
  });

  it('Standard = ₩49,000 / 100회 / recurring / recommended', () => {
    expect(PLANS.standard.price_krw).toBe(49000);
    expect(PLANS.standard.monthly_quota).toBe(100);
    expect(PLANS.standard.recurring).toBe(true);
    expect(PLANS.standard.recommended).toBe(true);
  });

  it('Premium = ₩99,000 / 무제한 (null) / recurring', () => {
    expect(PLANS.premium.price_krw).toBe(99000);
    expect(PLANS.premium.monthly_quota).toBeNull();
    expect(PLANS.premium.recurring).toBe(true);
  });

  it('Top-up 100회 = ₩14,900 / 100 / 단발', () => {
    expect(PLANS.topup_100.price_krw).toBe(14900);
    expect(PLANS.topup_100.monthly_quota).toBe(100);
    expect(PLANS.topup_100.recurring).toBe(false);
  });
});

describe('getPlan', () => {
  it('유효한 code 반환', () => {
    expect(getPlan('standard')?.code).toBe('standard');
    expect(getPlan('topup_100')?.code).toBe('topup_100');
  });

  it('알 수 없는 code → null', () => {
    expect(getPlan('invalid')).toBeNull();
    expect(getPlan('')).toBeNull();
    // 옛 가격(legend/billing legacy) 의 plan id 는 22차 PLANS 에 없음 → null
    expect(getPlan('student')).toBeNull();
    expect(getPlan('family')).toBeNull();
    expect(getPlan('academy')).toBeNull();
  });
});

describe('isRecurringPlan', () => {
  it('정기결제 plan = true', () => {
    expect(isRecurringPlan('basic')).toBe(true);
    expect(isRecurringPlan('standard')).toBe(true);
    expect(isRecurringPlan('premium')).toBe(true);
  });

  it('단발 = false', () => {
    expect(isRecurringPlan('topup_100')).toBe(false);
  });

  it('알 수 없는 code = false', () => {
    expect(isRecurringPlan('invalid')).toBe(false);
  });
});

describe('vatAmount — VAT 10% 분리', () => {
  it('₩49,000 = VAT ₩4,455', () => {
    // 49000 / 1.1 = 44545.45...
    // 49000 - 44545 = 4455 (Math.round)
    expect(vatAmount(49000)).toBe(4455);
  });

  it('₩29,000 = VAT ₩2,636', () => {
    expect(vatAmount(29000)).toBe(2636);
  });

  it('₩99,000 = VAT ₩9,000', () => {
    expect(vatAmount(99000)).toBe(9000);
  });

  it('₩14,900 = VAT ₩1,355', () => {
    expect(vatAmount(14900)).toBe(1355);
  });

  it('VAT + (가격-VAT) = 원래 가격 (라운딩 오차 0)', () => {
    for (const code of ['basic', 'standard', 'premium', 'topup_100'] as const) {
      const p = PLANS[code];
      const vat = vatAmount(p.price_krw);
      const supply = Math.round(p.price_krw / 1.1);
      // VAT 라운딩 결과 합계가 원래 가격과 일치 (±1원 허용)
      expect(Math.abs(supply + vat - p.price_krw)).toBeLessThanOrEqual(1);
    }
  });
});
