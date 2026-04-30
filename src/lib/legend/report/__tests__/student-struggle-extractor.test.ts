/**
 * Phase G-06 Δ14 — student-struggle-extractor 단위 테스트.
 *
 * 시나리오:
 *   1. 정상 JSON 응답 → 5 차원 모두 채워진 객체 반환
 *   2. JSON 파싱 실패 → null 반환 (UI 섹션 숨김)
 *   3. callModel throw → null 반환 (회복 안전)
 *   4. stuck_step_index 가 valid steps[].index 가 아니면 -1 로 정정
 *   5. conversation_text 가 비어있으면 LLM 호출 없이 즉시 null
 *   6. steps 가 비어있으면 즉시 null
 *   7. 모든 텍스트 필드가 비어있으면 null
 *   8. formatConversation: role → [학생]/[튜터] 라벨 + 메시지 truncate
 *   9. formatConversation: maxMessages 초과 시 앞 + 뒷부분 보존
 *  10. formatConversation: multimodal content text 부분만 추출
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const callModelMock = vi.fn();
vi.mock('@/lib/legend/call-model', () => ({
  callModel: (...args: unknown[]) => callModelMock(...args),
}));

import {
  extractStudentStruggle,
  formatConversation,
} from '../student-struggle-extractor';
import type { PerProblemStep } from '@/lib/legend/types';

function makeSteps(count: number): PerProblemStep[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    kind: 'forward' as const,
    summary: `step ${i + 1}`,
    difficulty: 3,
    is_pivotal: i === 1,
  }));
}

beforeEach(() => {
  callModelMock.mockReset();
});

describe('extractStudentStruggle', () => {
  it('정상 JSON 응답 → 5 차원 채운 객체 반환', async () => {
    callModelMock.mockResolvedValueOnce({
      text: JSON.stringify({
        stuck_step_index: 1,
        stuck_summary: '지수 변환에서 망설임',
        trigger_quote: '밑이 같은 지수 → 지수법칙 적용',
        ai_hint_quote: '밑이 같으면 지수끼리 더할 수 있어요',
        resolution: '튜터 힌트 후 정답 도달',
      }),
      trace: {},
    });

    const result = await extractStudentStruggle({
      conversation_text: '[학생] 모르겠어요\n[튜터] 같은 밑을 봐요',
      problem_text: '2^x · 2^3 = 32 일 때 x',
      steps: makeSteps(3),
      pivotal_step_index: 1,
    });

    expect(result).not.toBeNull();
    expect(result!.stuck_step_index).toBe(1);
    expect(result!.stuck_summary).toContain('지수');
    expect(result!.ai_hint_quote).toContain('밑');
  });

  it('JSON 파싱 실패 → null', async () => {
    callModelMock.mockResolvedValueOnce({
      text: '이건 JSON 이 아닙니다 그냥 자연어',
      trace: {},
    });

    const result = await extractStudentStruggle({
      conversation_text: '[학생] q\n[튜터] a',
      problem_text: 'p',
      steps: makeSteps(2),
      pivotal_step_index: 0,
    });
    expect(result).toBeNull();
  });

  it('callModel throw → null (회복 안전)', async () => {
    callModelMock.mockRejectedValueOnce(new Error('Haiku down'));

    const result = await extractStudentStruggle({
      conversation_text: '[학생] q\n[튜터] a',
      problem_text: 'p',
      steps: makeSteps(2),
      pivotal_step_index: 0,
    });
    expect(result).toBeNull();
  });

  it('stuck_step_index 가 invalid → -1 로 정정', async () => {
    callModelMock.mockResolvedValueOnce({
      text: JSON.stringify({
        stuck_step_index: 99, // steps 에 없는 index
        stuck_summary: '뭔가 막힘',
        trigger_quote: '뭔가 떠올려야 함',
        ai_hint_quote: '힌트',
        resolution: '극복',
      }),
      trace: {},
    });

    const result = await extractStudentStruggle({
      conversation_text: '[학생] q\n[튜터] a',
      problem_text: 'p',
      steps: makeSteps(3),
      pivotal_step_index: 1,
    });
    expect(result).not.toBeNull();
    expect(result!.stuck_step_index).toBe(-1);
  });

  it('conversation_text 빈 문자열 → 즉시 null (LLM 호출 없음)', async () => {
    const result = await extractStudentStruggle({
      conversation_text: '',
      problem_text: 'p',
      steps: makeSteps(2),
      pivotal_step_index: 0,
    });
    expect(result).toBeNull();
    expect(callModelMock).not.toHaveBeenCalled();
  });

  it('steps 비어있음 → 즉시 null', async () => {
    const result = await extractStudentStruggle({
      conversation_text: '[학생] q',
      problem_text: 'p',
      steps: [],
      pivotal_step_index: 0,
    });
    expect(result).toBeNull();
    expect(callModelMock).not.toHaveBeenCalled();
  });

  it('모든 텍스트 필드 빈 응답 → null', async () => {
    callModelMock.mockResolvedValueOnce({
      text: JSON.stringify({
        stuck_step_index: -1,
        stuck_summary: '',
        trigger_quote: '',
        ai_hint_quote: '',
        resolution: '',
      }),
      trace: {},
    });
    const result = await extractStudentStruggle({
      conversation_text: '[학생] q\n[튜터] a',
      problem_text: 'p',
      steps: makeSteps(2),
      pivotal_step_index: 0,
    });
    expect(result).toBeNull();
  });
});

describe('formatConversation', () => {
  it('role → [학생]/[튜터] 라벨링', () => {
    const out = formatConversation([
      { role: 'user', content: '안녕' },
      { role: 'assistant', content: '안녕하세요' },
    ]);
    expect(out).toContain('[학생] 안녕');
    expect(out).toContain('[튜터] 안녕하세요');
  });

  it('각 메시지 maxCharsPerMessage 로 truncate', () => {
    const longText = 'a'.repeat(1000);
    const out = formatConversation(
      [{ role: 'user', content: longText }],
      { maxCharsPerMessage: 50 },
    );
    expect(out.length).toBeLessThan(70); // [학생] + 50자 + 여유
  });

  it('maxMessages 초과 시 앞 + 뒷부분 보존', () => {
    const msgs = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `msg${i}`,
    }));
    const out = formatConversation(msgs, { maxMessages: 6 });
    // 앞 2개 + 뒷 4개 정도 — msg0, msg1 보존 + msg18, msg19 보존
    expect(out).toContain('msg0');
    expect(out).toContain('msg19');
    // 중간 (msg10) 누락
    expect(out).not.toContain('msg10');
  });

  it('multimodal content → text 부분만 추출', () => {
    const out = formatConversation([
      {
        role: 'user',
        content: [
          { type: 'image', image: 'data:image/png;base64,xxx' },
          { type: 'text', text: '이 사진 풀어줘' },
        ],
      },
    ]);
    expect(out).toContain('[학생] 이 사진 풀어줘');
    expect(out).not.toContain('data:image');
  });

  it('빈 메시지 배열 → 빈 문자열', () => {
    expect(formatConversation([])).toBe('');
  });
});
