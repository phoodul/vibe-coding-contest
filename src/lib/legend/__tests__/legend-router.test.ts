/**
 * Phase G-06 G06-06 — legend-router 통합 단위 테스트.
 *
 * 시나리오 3종:
 *   1. Stage 0 hit (similarity ≥ 0.85) → 사전 라벨 사용 + Stage 1/2 skip
 *   2. Stage 1 confidence ≥ 0.7 → 즉시 라우팅 (Stage 2 skip)
 *   3. Stage 2 escalation 신호 (둘 다) → routed_tutor='ramanujan_intuit' + escalation_prompt 동봉
 *
 * 모든 외부 의존성 (Supabase / Stage 0~2 / embed / detector) 모킹.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 모킹 구성 ────────────────────────────────────────────────────────
const matchSimilarMock = vi.fn();
const classifyDifficultyMock = vi.fn();
const runProbeMock = vi.fn();
const detectEscalationMock = vi.fn();
const embedTextMock = vi.fn();

const insertRowCapture: { row: unknown } = { row: null };
const insertSingleMock = vi.fn(async () => ({
  data: { id: 'mock-routing-uuid' },
  error: null,
}));
const selectMock = vi.fn(() => ({ single: insertSingleMock }));
const insertMock = vi.fn((row: unknown) => {
  insertRowCapture.row = row;
  return { select: selectMock };
});
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock('../stage0-similar', () => ({
  matchSimilarProblem: (...args: unknown[]) => matchSimilarMock(...args),
}));
vi.mock('../stage1-manager', () => ({
  classifyDifficulty: (...args: unknown[]) => classifyDifficultyMock(...args),
}));
vi.mock('../stage2-probe', () => ({
  runRamanujanProbe: (...args: unknown[]) => runProbeMock(...args),
}));
vi.mock('../escalation-detector', () => ({
  detectEscalation: (...args: unknown[]) => detectEscalationMock(...args),
}));
vi.mock('@/lib/euler/embed', () => ({
  embedText: (...args: unknown[]) => embedTextMock(...args),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ from: fromMock }),
}));

import { routeProblem } from '../legend-router';

beforeEach(() => {
  matchSimilarMock.mockReset();
  classifyDifficultyMock.mockReset();
  runProbeMock.mockReset();
  detectEscalationMock.mockReset();
  embedTextMock.mockReset();
  insertMock.mockClear();
  selectMock.mockClear();
  insertSingleMock.mockClear();
  fromMock.mockClear();
  insertRowCapture.row = null;

  // 기본: embed 는 dummy 반환
  embedTextMock.mockResolvedValue([0.1, 0.2, 0.3]);
});

describe('routeProblem', () => {
  it('Stage 0 hit (similarity ≥ 0.85) — 사전 라벨 사용, Stage 1/2 skip', async () => {
    matchSimilarMock.mockResolvedValue({
      row: {
        id: 'p-similar-1',
        year: 2024,
        type: '미적분',
        number: 30,
        problem_latex: '...',
        answer: '12',
        similarity: 0.92,
      },
      triggers: [
        { trigger_id: 't1', tool_name: '도함수=0', pattern_short: '극값 조건', why: '극값은 일계도 0' },
      ],
    });

    const decision = await routeProblem({
      user_id: 'user-1',
      problem_text: '미적분 킬러 30번 변형',
      input_mode: 'text',
    });

    expect(decision.stage_reached).toBe(0);
    expect(decision.routed_tutor).toBe('gauss'); // calculus + difficulty 6 (number 30) → gauss
    expect(decision.routed_tier).toBe(2);
    expect(decision.area).toBe('calculus');
    expect(decision.confidence).toBeCloseTo(0.92);
    expect(decision.precomputed_triggers).toHaveLength(1);
    expect(decision.routing_decision_id).toBe('mock-routing-uuid');

    // Stage 1/2 호출 안 됨
    expect(classifyDifficultyMock).not.toHaveBeenCalled();
    expect(runProbeMock).not.toHaveBeenCalled();

    // DB insert 검증
    expect(fromMock).toHaveBeenCalledWith('legend_routing_decisions');
    const inserted = insertRowCapture.row as Record<string, unknown>;
    expect(inserted.stage_reached).toBe(0);
    expect(inserted.stage0_similar_id).toBe('p-similar-1');
    expect(inserted.stage0_similarity).toBe(0.92);
    expect(inserted.routed_tutor).toBe('gauss');
    expect(inserted.user_id).toBe('user-1');
  });

  it('Stage 1 confidence ≥ 0.7 — 즉시 라우팅, Stage 2 skip', async () => {
    matchSimilarMock.mockResolvedValue(null); // Stage 0 miss
    classifyDifficultyMock.mockResolvedValue({
      difficulty: 4,
      confidence: 0.85,
      area: 'common',
    });

    const decision = await routeProblem({
      user_id: 'user-2',
      problem_text: '수학Ⅰ 함수 응용',
      input_mode: 'text',
    });

    expect(decision.stage_reached).toBe(1);
    expect(decision.routed_tutor).toBe('ramanujan_intuit'); // difficulty 4 → Tier 1
    expect(decision.routed_tier).toBe(1);
    expect(decision.area).toBe('common');
    expect(decision.confidence).toBeCloseTo(0.85);
    expect(decision.routing_decision_id).toBe('mock-routing-uuid');

    expect(classifyDifficultyMock).toHaveBeenCalledTimes(1);
    expect(runProbeMock).not.toHaveBeenCalled();

    const inserted = insertRowCapture.row as Record<string, unknown>;
    expect(inserted.stage_reached).toBe(1);
    expect(inserted.stage1_difficulty).toBe(4);
    expect(inserted.stage1_confidence).toBe(0.85);
    expect(inserted.stage1_area).toBe('common');
    expect(inserted.routed_tutor).toBe('ramanujan_intuit');
  });

  it('Stage 2 escalation 신호 (둘 다) — ramanujan_intuit + escalation_prompt 동봉', async () => {
    matchSimilarMock.mockResolvedValue(null); // Stage 0 miss
    classifyDifficultyMock.mockResolvedValue({
      difficulty: 5,
      confidence: 0.4, // < 0.7 → Stage 2 진입
      area: 'calculus',
    });
    runProbeMock.mockResolvedValue({
      solved: false,
      trace_jsonb: { raw_text: '...' },
      escalation_signals: ['sympy_fail', 'stuck_token'],
      duration_ms: 5000,
    });
    detectEscalationMock.mockReturnValue({
      signals: ['sympy_fail', 'stuck_token'],
      message: '라마누잔이 이 문제에서 막힘을 보입니다. 어떻게 할까요?',
      options: [
        { kind: 'escalate', label: '레전드 튜터 호출', target_tutor: 'gauss' },
        { kind: 'retry', label: '제가 더 시도해볼게요' },
        { kind: 'hint_only', label: '힌트만 받기' },
      ],
    });

    const decision = await routeProblem({
      user_id: 'user-3',
      problem_text: '비표준 미적분 문제',
      input_mode: 'text',
    });

    expect(decision.stage_reached).toBe(2);
    expect(decision.routed_tutor).toBe('ramanujan_intuit');
    expect(decision.routed_tier).toBe(1);
    expect(decision.escalation_prompt).toBeDefined();
    expect(decision.escalation_prompt!.signals).toEqual(['sympy_fail', 'stuck_token']);
    expect(decision.escalation_prompt!.options).toHaveLength(3);

    const inserted = insertRowCapture.row as Record<string, unknown>;
    expect(inserted.stage_reached).toBe(2);
    expect(inserted.stage2_probe_solved).toBe(false);
    expect(inserted.stage2_signals).toEqual(['sympy_fail', 'stuck_token']);
    expect(inserted.routed_tutor).toBe('ramanujan_intuit');
  });

  it('Stage 2 신호 없음 — escalation_prompt 미동봉, ramanujan_intuit 그대로', async () => {
    matchSimilarMock.mockResolvedValue(null);
    classifyDifficultyMock.mockResolvedValue({
      difficulty: 5,
      confidence: 0.5,
      area: 'geometry',
    });
    runProbeMock.mockResolvedValue({
      solved: true,
      trace_jsonb: { raw_text: '...' },
      escalation_signals: [],
      duration_ms: 4000,
    });
    detectEscalationMock.mockReturnValue(null);

    const decision = await routeProblem({
      user_id: 'user-4',
      problem_text: '기하 표준 문제',
      input_mode: 'text',
    });

    expect(decision.stage_reached).toBe(2);
    expect(decision.routed_tutor).toBe('ramanujan_intuit');
    expect(decision.escalation_prompt).toBeUndefined();
  });

  it('embedding 사전 제공 시 embedText 호출 안 함', async () => {
    matchSimilarMock.mockResolvedValue(null);
    classifyDifficultyMock.mockResolvedValue({
      difficulty: 3,
      confidence: 0.8,
      area: 'common',
    });

    await routeProblem({
      user_id: 'user-5',
      problem_text: 'precomputed embedding 문제',
      input_mode: 'text',
      embedding: [0.5, 0.5, 0.5],
    });

    expect(embedTextMock).not.toHaveBeenCalled();
    expect(matchSimilarMock).toHaveBeenCalledWith([0.5, 0.5, 0.5], 0.85);
  });
});
