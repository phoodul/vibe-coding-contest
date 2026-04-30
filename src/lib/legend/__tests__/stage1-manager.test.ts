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

  // ──────────────────────────────────────────────────────────────────────
  // G06-35a — few-shot 강화 검증 (베타 결함 1 fix)
  // ──────────────────────────────────────────────────────────────────────
  describe('G06-35a — few-shot prompt 강화', () => {
    it('system 프롬프트에 한국 수능 난이도 기준 (6번/9번/12번/14번/21번/29번) 모두 포함', async () => {
      generateTextMock.mockResolvedValue({
        text: JSON.stringify({ difficulty: 4, confidence: 0.7, area: 'common' }),
      });
      await classifyDifficulty('테스트 문제');
      const call = generateTextMock.mock.calls[0]?.[0] as { system: string };
      expect(call.system).toContain('6번');
      expect(call.system).toContain('9번');
      expect(call.system).toContain('12번');
      expect(call.system).toContain('14번');
      expect(call.system).toContain('21');
      expect(call.system).toContain('29');
    });

    it('system 프롬프트에 few-shot 예시 (10개) 포함', async () => {
      generateTextMock.mockResolvedValue({
        text: JSON.stringify({ difficulty: 4, confidence: 0.7, area: 'common' }),
      });
      await classifyDifficulty('테스트');
      const call = generateTextMock.mock.calls[0]?.[0] as { system: string };
      // few-shot 예시 마커 (10번까지 번호 매김)
      expect(call.system).toMatch(/1\)/);
      expect(call.system).toMatch(/9\)/);
      expect(call.system).toMatch(/10\)/);
    });

    it('system 프롬프트에 보수적 분류 + (가)(나)(다) 조건 가이드 포함', async () => {
      generateTextMock.mockResolvedValue({
        text: JSON.stringify({ difficulty: 4, confidence: 0.7, area: 'common' }),
      });
      await classifyDifficulty('테스트');
      const call = generateTextMock.mock.calls[0]?.[0] as { system: string };
      expect(call.system).toContain('보수적');
      expect(call.system).toContain('(가)(나)(다)');
      expect(call.system).toContain('정수');
    });

    it('Manager가 어려운 (가)(나)(다) 문제를 5로 분류 — 시뮬레이션', async () => {
      generateTextMock.mockResolvedValue({
        text: JSON.stringify({ difficulty: 5, confidence: 0.85, area: 'calculus' }),
      });
      const result = await classifyDifficulty(
        '미분가능한 함수 f(x) 가 다음 조건을 만족한다. (가) f(0)=1 (나) f(1)=2 (다) f(2)=4',
      );
      expect(result.difficulty).toBe(5);
      expect(result.area).toBe('calculus');
    });
  });
});
