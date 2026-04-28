/**
 * Phase G-06 G06-05 — Stage 0 (similar_problems 매칭) 단위 테스트.
 *
 * Supabase RPC 모킹.
 * 시나리오 3종:
 *   1. similarity 0.92 ≥ 0.85 → row + triggers 반환 (hit)
 *   2. similarity 0.7  < 0.85 → null 반환 (miss)
 *   3. empty result        → null 반환
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const rpcMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    rpc: rpcMock,
  }),
}));

import { matchSimilarProblem } from '../stage0-similar';

beforeEach(() => {
  rpcMock.mockReset();
});

describe('matchSimilarProblem', () => {
  it('similarity ≥ threshold 시 row + triggers 반환', async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          id: 'p1',
          year: 2024,
          type: '미적분',
          number: 30,
          problem_latex: '...',
          answer: '12',
          trigger_labels: [
            {
              direction: 'backward',
              goal_pattern: '극값 조건',
              tool_hint: '도함수=0',
              why: '극값은 일계도 0',
            },
            {
              direction: 'forward',
              condition_pattern: '연속함수',
              tool_hint: '중간값정리',
              why: '연속+부호변화→근',
            },
          ],
          similarity: 0.92,
        },
      ],
      error: null,
    });

    const result = await matchSimilarProblem([0.1, 0.2, 0.3], 0.85);

    expect(result).not.toBeNull();
    expect(result!.row.id).toBe('p1');
    expect(result!.row.year).toBe(2024);
    expect(result!.row.similarity).toBe(0.92);
    expect(result!.triggers).toHaveLength(2);
    expect(result!.triggers[0].direction).toBe('backward');
    expect(result!.triggers[0].tool_name).toBe('도함수=0');
    expect(result!.triggers[0].why).toBe('극값은 일계도 0');
    expect(result!.triggers[1].pattern_short).toBe('연속함수');
    expect(rpcMock).toHaveBeenCalledWith('match_similar_problems', {
      query_embedding: [0.1, 0.2, 0.3],
      match_count: 1,
    });
  });

  it('similarity < threshold 시 null 반환', async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          id: 'p2',
          year: 2023,
          type: '공통',
          number: 22,
          problem_latex: '...',
          answer: '5',
          trigger_labels: [],
          similarity: 0.7,
        },
      ],
      error: null,
    });

    const result = await matchSimilarProblem([0.1, 0.2], 0.85);
    expect(result).toBeNull();
  });

  it('empty result 시 null 반환', async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    const result = await matchSimilarProblem([0.1, 0.2], 0.85);
    expect(result).toBeNull();
  });

  it('RPC error 시 null 반환 (메인 흐름 보존)', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'rpc fail' } });
    const result = await matchSimilarProblem([0.1, 0.2], 0.85);
    expect(result).toBeNull();
  });

  it('빈 embedding 시 RPC 호출 없이 null 반환', async () => {
    const result = await matchSimilarProblem([], 0.85);
    expect(result).toBeNull();
    expect(rpcMock).not.toHaveBeenCalled();
  });
});
