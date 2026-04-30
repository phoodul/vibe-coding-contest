/**
 * Phase G-06 G06-35d — step-decomposer 마커 추출 단위 테스트.
 *
 * agentic_5step 응답 시작에 callTutor 가 강제하는 [STEP_KIND] / [TRIGGER] 마커를
 * 정규식으로 추출하는 함수 검증.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/euler/embed', () => ({
  embedText: vi.fn(async () => Array(1536).fill(0.01)),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({
        or: () => ({ limit: async () => ({ data: [], error: null }) }),
        eq: () => ({ limit: async () => ({ data: [], error: null }) }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
    rpc: async () => ({ data: [], error: null }),
  }),
}));

import { extractStepKindMarker, extractTriggerMarker } from '../step-decomposer';

describe('extractStepKindMarker (G06-35d)', () => {
  it('[STEP_KIND: backward] → "backward"', () => {
    const text = '[STEP_KIND: backward]\n[TRIGGER: 부분적분]\n\n역으로 추적하면...';
    expect(extractStepKindMarker(text)).toBe('backward');
  });

  it('[STEP_KIND: tool_call] → "tool_call"', () => {
    const text = '[STEP_KIND: tool_call]\n본문 풀이';
    expect(extractStepKindMarker(text)).toBe('tool_call');
  });

  it('[STEP_KIND: ANSWER] (대문자) 도 정상 매칭', () => {
    expect(extractStepKindMarker('[STEP_KIND: ANSWER]\n최종 답: 5')).toBe('answer');
  });

  it('마커 없으면 null', () => {
    expect(extractStepKindMarker('마커 없는 일반 텍스트')).toBeNull();
  });

  it('잘못된 step kind 는 null', () => {
    expect(extractStepKindMarker('[STEP_KIND: invalid_kind]\n...')).toBeNull();
  });

  it('빈 입력은 null', () => {
    expect(extractStepKindMarker('')).toBeNull();
  });

  it('parse / domain_id / forward / backward / computation / verify / answer 모두 정상', () => {
    const kinds = ['parse', 'domain_id', 'forward', 'backward', 'computation', 'verify', 'answer'];
    for (const k of kinds) {
      expect(extractStepKindMarker(`[STEP_KIND: ${k}]\n본문`)).toBe(k);
    }
  });
});

describe('extractTriggerMarker (G06-35d)', () => {
  it('[TRIGGER: 부분적분 trigger] → "부분적분" (접미사 제거)', () => {
    const text = '[STEP_KIND: backward]\n[TRIGGER: 부분적분 trigger]\n본문';
    expect(extractTriggerMarker(text)).toBe('부분적분');
  });

  it('[TRIGGER: 코시-슈바르츠 부등식] → 그대로 (접미사 없음)', () => {
    const text = '[TRIGGER: 코시-슈바르츠 부등식]\n본문';
    expect(extractTriggerMarker(text)).toBe('코시-슈바르츠 부등식');
  });

  it('[TRIGGER: 없음] → null', () => {
    expect(extractTriggerMarker('[TRIGGER: 없음]\n본문')).toBeNull();
  });

  it('[TRIGGER: none] / [TRIGGER: None] → null', () => {
    expect(extractTriggerMarker('[TRIGGER: none]')).toBeNull();
    expect(extractTriggerMarker('[TRIGGER: None]')).toBeNull();
  });

  it('마커 없으면 null', () => {
    expect(extractTriggerMarker('일반 텍스트')).toBeNull();
  });

  it('빈 입력은 null', () => {
    expect(extractTriggerMarker('')).toBeNull();
  });

  it('빈 [TRIGGER: ] 은 null', () => {
    expect(extractTriggerMarker('[TRIGGER:    ]\n본문')).toBeNull();
  });

  it('한국어 + 영어 혼합 한 줄 도구명 정상', () => {
    expect(extractTriggerMarker('[TRIGGER: SymPy diff trigger]\n본문')).toBe('SymPy diff');
  });
});
