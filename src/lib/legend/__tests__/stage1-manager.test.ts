/**
 * Phase G-06 G06-05 — Stage 1 (Manager Haiku 분류) 단위 테스트.
 *
 * generateText 모킹. 정상 응답 + JSON 파싱 실패 + 범위/enum 정규화 검증.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const generateTextMock = vi.fn();

vi.mock('ai', () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: (modelId: string) => ({ modelId }),
}));

import { classifyDifficulty } from '../stage1-manager';

beforeEach(() => {
  generateTextMock.mockReset();
});

describe('classifyDifficulty', () => {
  it('정상 입력 시 {difficulty, confidence, area} 반환', async () => {
    generateTextMock.mockResolvedValue({
      text: JSON.stringify({ difficulty: 5, confidence: 0.83, area: 'calculus' }),
    });

    const result = await classifyDifficulty('미적분 킬러 문제');

    expect(result.difficulty).toBe(5);
    expect(result.confidence).toBeCloseTo(0.83);
    expect(result.area).toBe('calculus');
  });

  it('confidence 가 0~1 범위 밖이면 clamp', async () => {
    generateTextMock.mockResolvedValue({
      text: JSON.stringify({ difficulty: 3, confidence: 1.5, area: 'common' }),
    });
    const r1 = await classifyDifficulty('문제 A');
    expect(r1.confidence).toBe(1);

    generateTextMock.mockResolvedValue({
      text: JSON.stringify({ difficulty: 3, confidence: -0.2, area: 'common' }),
    });
    const r2 = await classifyDifficulty('문제 B');
    expect(r2.confidence).toBe(0);
  });

  it('difficulty 가 1~6 범위 밖이면 clamp', async () => {
    generateTextMock.mockResolvedValue({
      text: JSON.stringify({ difficulty: 9, confidence: 0.5, area: 'geometry' }),
    });
    const result = await classifyDifficulty('문제');
    expect(result.difficulty).toBe(6);
  });

  it('알 수 없는 area 는 common 으로 fallback', async () => {
    generateTextMock.mockResolvedValue({
      text: JSON.stringify({ difficulty: 4, confidence: 0.7, area: 'unknown_topic' }),
    });
    const result = await classifyDifficulty('문제');
    expect(result.area).toBe('common');
  });

  it('JSON 파싱 실패 시 fallback {4, 0.5, common}', async () => {
    generateTextMock.mockResolvedValue({
      text: '이건 JSON 이 아닙니다',
    });
    const result = await classifyDifficulty('문제');
    expect(result.difficulty).toBe(4);
    expect(result.confidence).toBe(0.5);
    expect(result.area).toBe('common');
  });

  it('generateText 예외 시 fallback', async () => {
    generateTextMock.mockRejectedValue(new Error('API down'));
    const result = await classifyDifficulty('문제');
    expect(result.difficulty).toBe(4);
    expect(result.confidence).toBe(0.5);
    expect(result.area).toBe('common');
  });

  it('빈 문제 문자열 시 RPC 호출 없이 fallback', async () => {
    const result = await classifyDifficulty('   ');
    expect(result.difficulty).toBe(4);
    expect(result.area).toBe('common');
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it('코드 펜스 ```json 으로 감싼 응답도 파싱', async () => {
    generateTextMock.mockResolvedValue({
      text: '```json\n{"difficulty": 6, "confidence": 0.9, "area": "calculus"}\n```',
    });
    const result = await classifyDifficulty('킬러 문제');
    expect(result.difficulty).toBe(6);
    expect(result.area).toBe('calculus');
  });

  it('area_hint 가 prompt 에 포함되어 호출됨', async () => {
    generateTextMock.mockResolvedValue({
      text: JSON.stringify({ difficulty: 4, confidence: 0.7, area: 'probability' }),
    });
    await classifyDifficulty('주사위 문제', '확률과통계');
    const call = generateTextMock.mock.calls[0]?.[0] as { prompt: string };
    expect(call.prompt).toContain('확률과통계');
  });
});
