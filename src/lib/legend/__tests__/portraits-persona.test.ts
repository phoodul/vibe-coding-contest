/**
 * Phase G-06 G06-35c — portraits.ts 의 persona_desc 노출 단위 테스트.
 *
 * 학생 화면용 페르소나 설명 (raw 모델명 X) 보장.
 */
import { describe, it, expect } from 'vitest';
import { PORTRAITS, getTutorPersonaDesc, getTutorModelShort } from '../portraits';
import type { TutorName } from '../types';

const ALL_TUTORS: TutorName[] = [
  'ramanujan_calc',
  'ramanujan_intuit',
  'gauss',
  'von_neumann',
  'euler',
  'leibniz',
];

const FORBIDDEN_MODEL_TOKENS = [
  'Gemini',
  'GPT-',
  'Claude',
  'Haiku',
  'Sonnet',
  'Opus',
];

describe('portraits.persona_desc (G06-35c)', () => {
  it('모든 튜터가 persona_desc 보유', () => {
    for (const t of ALL_TUTORS) {
      expect(PORTRAITS[t].persona_desc).toBeTruthy();
      expect(typeof PORTRAITS[t].persona_desc).toBe('string');
    }
  });

  it('persona_desc 에 raw 모델명 토큰 미포함 (학생 안전)', () => {
    for (const t of ALL_TUTORS) {
      const desc = PORTRAITS[t].persona_desc;
      for (const token of FORBIDDEN_MODEL_TOKENS) {
        expect(desc.toLowerCase()).not.toContain(token.toLowerCase());
      }
    }
  });

  it('각 튜터별 페르소나 설명 — 인물 캐릭터 묘사', () => {
    expect(PORTRAITS.gauss.persona_desc).toContain('수학의 왕자');
    expect(PORTRAITS.von_neumann.persona_desc).toContain('기하');
    expect(PORTRAITS.euler.persona_desc).toContain('다리');
    expect(PORTRAITS.leibniz.persona_desc).toContain('미적분');
    expect(PORTRAITS.ramanujan_calc.persona_desc).toContain('계산');
    expect(PORTRAITS.ramanujan_intuit.persona_desc).toContain('직관');
  });

  it('getTutorPersonaDesc 헬퍼 → 동일 결과', () => {
    for (const t of ALL_TUTORS) {
      expect(getTutorPersonaDesc(t)).toBe(PORTRAITS[t].persona_desc);
    }
  });

  it('getTutorModelShort 는 admin/dev 전용 — raw 모델명 그대로 (회귀 보장)', () => {
    expect(getTutorModelShort('gauss')).toContain('Gemini');
    expect(getTutorModelShort('von_neumann')).toContain('GPT');
  });
});
