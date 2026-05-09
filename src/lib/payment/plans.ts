/**
 * 22차 (2026-05-09) — 요금제 정의 (단일 source of truth).
 *
 * 가격은 docs/pricing-strategy.md Phase 1 (₩29 / 49 / 99천) + 22차 사용자 결정
 * "100회 + 부가 무제한" 의 명시적 한도. 라마누잔 (Haiku) 무제한.
 */

export type PlanCode = 'basic' | 'standard' | 'premium' | 'topup_100';

export interface Plan {
  code: PlanCode;
  label_ko: string;
  /** 표시 가격 (VAT 포함, 원) */
  price_krw: number;
  /** 정기결제 여부 (topup_100 = 단발) */
  recurring: boolean;
  /** Legend + Maestro 합산 월 한도 (premium = null = 무제한) */
  monthly_quota: number | null;
  /** 가격 카드의 short hint */
  tagline: string;
  /** 카드에 표시할 핵심 혜택 */
  highlights: string[];
  /** 추천 표기 */
  recommended?: boolean;
  /** 비용 (admin 내부, public X — 마진 산출용 — string 으로만) */
  internal_note?: string;
}

export const PLANS: Record<PlanCode, Plan> = {
  basic: {
    code: 'basic',
    label_ko: 'Basic',
    price_krw: 29000,
    recurring: true,
    monthly_quota: 50,
    tagline: '꾸준히 한 과목, 가벼운 시작',
    highlights: [
      'Legend Tutor + Maestro 합산 월 50회',
      '라마누잔 (Haiku) · 부속 도구 무제한',
      '풀이 정리 · 트리거 라이브러리 · 활동 리포트',
      '6개월 학습 이력 보관',
    ],
  },
  standard: {
    code: 'standard',
    label_ko: 'Standard',
    price_krw: 49000,
    recurring: true,
    monthly_quota: 100,
    tagline: '메인 — 학생 자발 결제 상한 안',
    highlights: [
      'Legend Tutor + Maestro 합산 월 100회',
      '라마누잔 · 부속 도구 무제한',
      '4 모델 거장 (Sonnet · Opus · Gemini · GPT) 자유 선택',
      '풀이 정리 무제한 · 활동 리포트 · 단원별 약점 분석',
      '추가 100회 충전 ₩14,900 (Top-up)',
    ],
    recommended: true,
  },
  premium: {
    code: 'premium',
    label_ko: 'Premium',
    price_krw: 99000,
    recurring: true,
    monthly_quota: null,
    tagline: '무제한 + 부모 리포트',
    highlights: [
      'Legend · Maestro 무제한 사용',
      '4 모델 거장 우선 대기열',
      '주간 부모 리포트 (학습 시간 · 강점 · 약점)',
      '학년별 단원 진단 + 맞춤 학습 경로',
      '24시간 우선 응답 (이메일·전화)',
    ],
  },
  topup_100: {
    code: 'topup_100',
    label_ko: 'Top-up 100회',
    price_krw: 14900,
    recurring: false,
    monthly_quota: 100,
    tagline: '한도 소진 시 단발 충전',
    highlights: [
      '추가 100회 (Standard 와 동일 단가)',
      '결제 즉시 잔여 한도에 합산',
      '다음 결제일까지 사용 — 이월 X',
    ],
  },
};

export function getPlan(code: string): Plan | null {
  return (PLANS as Record<string, Plan>)[code] ?? null;
}

export function isRecurringPlan(code: string): boolean {
  const p = getPlan(code);
  return Boolean(p?.recurring);
}

/** VAT 10% (이미 가격에 포함). 영수증 표기용. */
export function vatAmount(priceKrw: number): number {
  return Math.round(priceKrw - priceKrw / 1.1);
}
