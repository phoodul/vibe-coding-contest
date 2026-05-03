/**
 * P0-04 (2026-05-04) — 6 튜터 페르소나 일관성 회귀 테스트.
 *
 * 베타 1명 분석 (P0-01) 에서 area 하드코딩 fix 후, 5거장 페르소나가 실제로
 * 호출될 때 응답 형식이 일관되어야 한다. 본 테스트는 시스템 프롬프트의
 * 핵심 invariant + extractFinalAnswer 의 패턴 매칭을 회귀 방지한다.
 *
 * 검증 invariant:
 *   - 모든 튜터의 페르소나가 "당신은 <이름>" 으로 시작
 *   - 모든 페르소나가 "최종 답" 키워드 포함 (extractFinalAnswer 와 contract 유지)
 *   - 가우스/폰 노이만/오일러/라이프니츠 4 거장은 "5단계" 분해 명시
 *   - 라마누잔 calc/intuit 두 변형은 5단계 미요구 (단발 응답)
 *   - extractFinalAnswer 가 6 페르소나 출력 패턴을 일관되게 추출
 */
import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  TUTOR_PERSONAS,
  extractFinalAnswer,
} from '../tutor-orchestrator';
import type { TutorName } from '../types';

const ALL_TUTORS: TutorName[] = [
  'ramanujan_calc',
  'ramanujan_intuit',
  'gauss',
  'von_neumann',
  'euler',
  'leibniz',
];

const TUTOR_NAME_KO: Record<TutorName, string> = {
  ramanujan_calc: '라마누잔',
  ramanujan_intuit: '라마누잔',
  gauss: '가우스',
  von_neumann: '폰 노이만',
  euler: '오일러',
  leibniz: '라이프니츠',
};

const FIVE_STEP_TUTORS: TutorName[] = ['gauss', 'von_neumann', 'euler', 'leibniz'];
const SINGLE_PASS_TUTORS: TutorName[] = ['ramanujan_calc', 'ramanujan_intuit'];

describe('TUTOR_PERSONAS — 6 튜터 일관성', () => {
  it('모든 튜터가 페르소나 보유 (누락 X)', () => {
    for (const t of ALL_TUTORS) {
      expect(TUTOR_PERSONAS[t]).toBeTruthy();
      expect(TUTOR_PERSONAS[t].length).toBeGreaterThan(50);
    }
  });

  it('모든 페르소나가 "당신은 <이름>" 으로 시작', () => {
    for (const t of ALL_TUTORS) {
      const persona = TUTOR_PERSONAS[t];
      const expectedName = TUTOR_NAME_KO[t];
      expect(persona).toMatch(new RegExp(`^당신은\\s+${expectedName}`));
    }
  });

  it('모든 페르소나가 "최종 답" 키워드 포함', () => {
    for (const t of ALL_TUTORS) {
      expect(TUTOR_PERSONAS[t]).toContain('최종 답');
    }
  });

  it('5거장 4명은 "5단계" 분해 명시', () => {
    for (const t of FIVE_STEP_TUTORS) {
      expect(TUTOR_PERSONAS[t]).toContain('5단계');
    }
  });

  it('라마누잔 두 변형은 5단계 미요구 (단발 응답)', () => {
    for (const t of SINGLE_PASS_TUTORS) {
      expect(TUTOR_PERSONAS[t]).not.toContain('5단계');
    }
  });

  it('5거장 4명은 자가 검증 명시', () => {
    for (const t of FIVE_STEP_TUTORS) {
      expect(TUTOR_PERSONAS[t]).toContain('자가 검증');
    }
  });

  it('라마누잔 intuit 만 [STUCK] 토큰 사용 (chain 진입 신호)', () => {
    expect(TUTOR_PERSONAS.ramanujan_intuit).toContain('[STUCK]');
    for (const t of ALL_TUTORS) {
      if (t !== 'ramanujan_intuit') {
        expect(TUTOR_PERSONAS[t]).not.toContain('[STUCK]');
      }
    }
  });

  it('buildSystemPrompt 가 페르소나 그대로 반환', () => {
    for (const t of ALL_TUTORS) {
      expect(buildSystemPrompt(t)).toBe(TUTOR_PERSONAS[t]);
    }
  });
});

describe('extractFinalAnswer — 6 페르소나 출력 패턴 회귀', () => {
  it('"최종 답: 12" 인라인 추출', () => {
    expect(extractFinalAnswer('풀이 과정...\n최종 답: 12\n')).toBe('12');
  });

  it('전각 콜론 "최종 답： 12" 추출', () => {
    expect(extractFinalAnswer('풀이...\n최종 답： 12')).toBe('12');
  });

  it('공백 변형 "최종답:12" 추출', () => {
    expect(extractFinalAnswer('풀이...\n최종답:12\n')).toBe('12');
  });

  it('5단계 가우스 응답 — step 5 마지막 "최종 답:" 추출', () => {
    const text = `Step 1: 미분.
Step 2: 도함수 부호.
Step 3: 극값.
Step 4: 정의역 검토.
Step 5: 종합. 최종 답: 7`;
    expect(extractFinalAnswer(text)).toBe('7');
  });

  it('라마누잔 직관 응답 — 마지막 줄 "최종 답:" 추출', () => {
    const text = `직관: 대칭성으로 즉시 답이 보인다.
최종 답: a + b = 10`;
    expect(extractFinalAnswer(text)).toBe('a + b = 10');
  });

  it('"최종 답:" 없으면 마지막 줄 fallback', () => {
    expect(extractFinalAnswer('풀이...\n결론: 23')).toBe('결론: 23');
  });

  it('빈 입력은 빈 문자열', () => {
    expect(extractFinalAnswer('')).toBe('');
  });

  it('"최종 답:" 다중 발생 시 첫 매칭 반환 (베타 사용자 의도와 일치)', () => {
    // 정규식이 첫 매칭을 반환해야 안정적
    const text = '최종 답: 5\n중간 텍스트\n최종 답: 10';
    expect(extractFinalAnswer(text)).toBe('5');
  });

  it('단위 포함 답 "최종 답: 7 cm" 추출', () => {
    expect(extractFinalAnswer('풀이...\n최종 답: 7 cm')).toBe('7 cm');
  });

  it('LaTeX 수식 답 "최종 답: $\\frac{1}{2}$" 추출', () => {
    expect(extractFinalAnswer('풀이...\n최종 답: $\\frac{1}{2}$')).toBe(
      '$\\frac{1}{2}$',
    );
  });

  it('200자 초과 fallback 마지막 줄도 200자 cap', () => {
    const longTail = 'x'.repeat(300);
    const result = extractFinalAnswer(`풀이...\n${longTail}`);
    expect(result.length).toBeLessThanOrEqual(200);
  });
});
