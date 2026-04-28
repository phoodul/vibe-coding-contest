/**
 * Phase G-06 G06-16 — report-builder 단위 테스트.
 *
 * 시나리오:
 *   - 캐시 hit → 즉시 반환 (4 모듈 호출 없음)
 *   - 캐시 miss → 4 모듈 호출 + per_problem_reports upsert
 *   - session 없음 → 'session_not_found' throw
 *   - session.user_id 불일치 → 'session_user_mismatch' throw
 *   - inferProvider 매핑 (gauss → google, von_neumann → openai, 그 외 → anthropic)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 4 모듈 모킹
vi.mock('../step-decomposer', () => ({
  decomposeChainSteps: vi.fn(),
}));
vi.mock('../llm-struggle-extractor', () => ({
  extractLLMStruggle: vi.fn(),
}));
vi.mock('../tree-builder', () => ({
  buildReasoningTree: vi.fn(),
}));
vi.mock('../trigger-expander', () => ({
  expandTrigger: vi.fn(),
}));
vi.mock('../stuck-tracker', () => ({
  aggregateStuck: vi.fn(),
}));

// supabase 모킹: 동적 chain 빌더
const cacheRow: { value: { report_jsonb: unknown; generated_at: string } | null } = { value: null };
const sessionRow: {
  value: {
    user_id: string;
    routing_decision_id: string | null;
    problem_hash: string;
    tutor_name: string;
    trace_jsonb: unknown;
  } | null;
} = { value: null };
const routingRow: { value: { stage1_area: string | null; stage1_difficulty: number | null } | null } = {
  value: null,
};
const triggerRow: {
  value: {
    id: string;
    tool_id: string;
    direction: string;
    trigger_condition: string;
    goal_pattern: string | null;
    why_text: string;
    math_tools: { id: string; name: string };
  } | null;
} = { value: null };

const upsertSpy = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) => {
      if (table === 'per_problem_reports') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: cacheRow.value, error: null }),
            }),
          }),
          upsert: (...args: unknown[]) => {
            upsertSpy(...args);
            return Promise.resolve({ error: null });
          },
        };
      }
      if (table === 'legend_tutor_sessions') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: sessionRow.value, error: null }),
            }),
          }),
        };
      }
      if (table === 'legend_routing_decisions') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: routingRow.value, error: null }),
            }),
          }),
        };
      }
      if (table === 'math_tool_triggers') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: triggerRow.value, error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
        }),
      };
    },
  }),
}));

import { buildReport, inferProvider, TUTOR_LABELS_KO } from '../report-builder';
import { decomposeChainSteps } from '../step-decomposer';
import { extractLLMStruggle } from '../llm-struggle-extractor';
import { buildReasoningTree } from '../tree-builder';
import { expandTrigger } from '../trigger-expander';
import { aggregateStuck } from '../stuck-tracker';
import type { PerProblemReport, PerProblemStep } from '@/lib/legend/types';

const MOCK_TREE = {
  schema_version: '1.0' as const,
  root_id: 'answer',
  nodes: [
    {
      id: 'answer',
      label: '답',
      text: '12',
      kind: 'answer' as const,
      depth: 0,
      is_pivotal: false,
    },
  ],
  edges: [],
  conditions: [],
  depth_max: 0,
  node_count: 1,
};

beforeEach(() => {
  cacheRow.value = null;
  sessionRow.value = null;
  routingRow.value = null;
  triggerRow.value = null;
  upsertSpy.mockClear();
  vi.mocked(decomposeChainSteps).mockReset();
  vi.mocked(extractLLMStruggle).mockReset();
  vi.mocked(buildReasoningTree).mockReset();
  vi.mocked(expandTrigger).mockReset();
  vi.mocked(aggregateStuck).mockReset();

  // 기본 stub
  vi.mocked(decomposeChainSteps).mockResolvedValue([]);
  vi.mocked(extractLLMStruggle).mockResolvedValue({
    hardest_step_index: 0,
    hardest_step_ms: 0,
    total_turns: 0,
    total_tool_retries: 0,
    resolution_narrative: '',
    per_step: [],
  });
  vi.mocked(buildReasoningTree).mockResolvedValue(MOCK_TREE);
  vi.mocked(expandTrigger).mockResolvedValue([]);
  vi.mocked(aggregateStuck).mockResolvedValue([]);
});

// ────────────────────────────────────────────────────────────────────────────
// inferProvider
// ────────────────────────────────────────────────────────────────────────────

describe('inferProvider', () => {
  it('gauss → google', () => {
    expect(inferProvider('gauss')).toBe('google');
  });
  it('von_neumann → openai', () => {
    expect(inferProvider('von_neumann')).toBe('openai');
  });
  it('euler → anthropic', () => {
    expect(inferProvider('euler')).toBe('anthropic');
  });
  it('leibniz → anthropic', () => {
    expect(inferProvider('leibniz')).toBe('anthropic');
  });
  it('ramanujan_calc → anthropic', () => {
    expect(inferProvider('ramanujan_calc')).toBe('anthropic');
  });
  it('ramanujan_intuit → anthropic', () => {
    expect(inferProvider('ramanujan_intuit')).toBe('anthropic');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// TUTOR_LABELS_KO
// ────────────────────────────────────────────────────────────────────────────

describe('TUTOR_LABELS_KO', () => {
  it('5 튜터 + ramanujan 둘 모두 라벨 보유', () => {
    expect(TUTOR_LABELS_KO.gauss.label).toBe('가우스');
    expect(TUTOR_LABELS_KO.gauss.model).toContain('Gemini');
    expect(TUTOR_LABELS_KO.von_neumann.label).toBe('폰 노이만');
    expect(TUTOR_LABELS_KO.euler.label).toBe('오일러');
    expect(TUTOR_LABELS_KO.leibniz.label).toBe('라이프니츠');
    expect(TUTOR_LABELS_KO.ramanujan_calc.label).toContain('라마누잔');
    expect(TUTOR_LABELS_KO.ramanujan_intuit.label).toContain('라마누잔');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildReport — 캐시 hit
// ────────────────────────────────────────────────────────────────────────────

describe('buildReport — 캐시 hit', () => {
  it('per_problem_reports 캐시 있으면 즉시 반환, 4 모듈 호출 없음', async () => {
    const cached: PerProblemReport = {
      schema_version: '1.1',
      problem_summary: { text_short: 'cached', area: 'common', difficulty: 4 },
      tutor: { name: 'gauss', label_ko: '가우스', model_short: 'Gemini 3.1 Pro' },
      steps: [],
      pivotal_step_index: 0,
      trigger_summary: {
        primary: { trigger_id: '', tool_name: '', direction: 'both', pattern_short: '', why_text: '' },
        expansions: [],
      },
      stuck_signals: { layer: null, reason: null, user_stuck_ms_total: 0, revisited_step_indices: [] },
      llm_struggle_summary: {
        hardest_step_index: 0,
        hardest_step_ms: 0,
        total_turns: 0,
        total_tool_retries: 0,
        resolution_narrative: '',
      },
      reasoning_tree: MOCK_TREE,
    };
    cacheRow.value = { report_jsonb: cached, generated_at: '2026-04-28T00:00:00Z' };

    const result = await buildReport({
      session_id: 'sess-1',
      user_id: 'user-1',
      problem_text: 'irrelevant',
    });

    expect(result.problem_summary.text_short).toBe('cached');
    expect(decomposeChainSteps).not.toHaveBeenCalled();
    expect(extractLLMStruggle).not.toHaveBeenCalled();
    expect(buildReasoningTree).not.toHaveBeenCalled();
    expect(expandTrigger).not.toHaveBeenCalled();
    expect(upsertSpy).not.toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildReport — 캐시 miss → 4 모듈 호출 + upsert
// ────────────────────────────────────────────────────────────────────────────

describe('buildReport — 캐시 miss', () => {
  beforeEach(() => {
    cacheRow.value = null;
    sessionRow.value = {
      user_id: 'user-1',
      routing_decision_id: 'rd-1',
      problem_hash: 'hash-1',
      tutor_name: 'gauss',
      trace_jsonb: { mode: 'agentic_5step', turns: [] },
    };
    routingRow.value = { stage1_area: 'calculus', stage1_difficulty: 5 };
  });

  it('4 모듈 모두 호출 + per_problem_reports upsert + report 반환', async () => {
    const mockSteps: PerProblemStep[] = [
      { index: 0, kind: 'parse', summary: '문제 분해', difficulty: 2, is_pivotal: false },
      { index: 1, kind: 'tool_call', summary: 'sympy_diff 호출', difficulty: 5, is_pivotal: true, trigger_id: 'trig-1', tool_id: 'TOOL_DIFF' },
      { index: 2, kind: 'answer', summary: '최종 답: 12', difficulty: 3, is_pivotal: false },
    ];
    vi.mocked(decomposeChainSteps).mockResolvedValue(mockSteps);
    vi.mocked(extractLLMStruggle).mockResolvedValue({
      hardest_step_index: 1,
      hardest_step_ms: 5000,
      total_turns: 3,
      total_tool_retries: 1,
      resolution_narrative: 'sympy_diff 로 미분 후 0 근을 찾았습니다.',
      per_step: [
        { step_index: 0, turns_at_step: 1, tool_retries: 0, reasoning_chars: 100, step_ms: 800 },
        {
          step_index: 1,
          turns_at_step: 1,
          tool_retries: 1,
          reasoning_chars: 1500,
          step_ms: 5000,
          resolution_text: 'sympy_diff 로 미분 후 0 근을 찾았습니다.',
        },
        { step_index: 2, turns_at_step: 1, tool_retries: 0, reasoning_chars: 200, step_ms: 1000 },
      ],
    });
    vi.mocked(expandTrigger).mockResolvedValue([
      { trigger_id: 'trig-2', tool_name: '점화식', direction: 'both', pattern_short: 'x^n e^x 적분', why_text: '같은 패턴' },
    ]);
    vi.mocked(aggregateStuck).mockResolvedValue([
      { step_index: 1, user_stuck_ms: 12000, revisit_count: 1, reason: 'tool_trigger_miss' },
    ]);
    triggerRow.value = {
      id: 'trig-1',
      tool_id: 'TOOL_DIFF',
      direction: 'both',
      trigger_condition: 'f(x) 미분',
      goal_pattern: null,
      why_text: '극값 = 미분 0',
      math_tools: { id: 'TOOL_DIFF', name: '미분' },
    };

    const report = await buildReport({
      session_id: 'sess-2',
      user_id: 'user-1',
      problem_text: 'f(x)=x^2 의 최솟값을 구하시오. 길이 80자가 넘는 문제라고 가정합니다.'.repeat(2),
    });

    // 4 모듈 모두 호출
    expect(decomposeChainSteps).toHaveBeenCalledTimes(1);
    expect(extractLLMStruggle).toHaveBeenCalledTimes(1);
    expect(buildReasoningTree).toHaveBeenCalledTimes(1);
    expect(expandTrigger).toHaveBeenCalledTimes(1);
    expect(aggregateStuck).toHaveBeenCalledTimes(1);

    // schema 검증
    expect(report.schema_version).toBe('1.1');
    expect(report.tutor.name).toBe('gauss');
    expect(report.tutor.label_ko).toBe('가우스');
    expect(report.tutor.model_short).toContain('Gemini');
    expect(report.problem_summary.area).toBe('calculus');
    expect(report.problem_summary.text_short.length).toBeLessThanOrEqual(80);

    // pivotal step
    expect(report.pivotal_step_index).toBe(1);
    expect(report.steps).toHaveLength(3);
    expect(report.steps[1].is_pivotal).toBe(true);

    // primary trigger
    expect(report.trigger_summary.primary.trigger_id).toBe('trig-1');
    expect(report.trigger_summary.primary.tool_name).toBe('미분');
    expect(report.trigger_summary.expansions).toHaveLength(1);

    // stuck signals
    expect(report.stuck_signals.user_stuck_ms_total).toBe(12000);
    expect(report.stuck_signals.revisited_step_indices).toEqual([1]);
    expect(report.stuck_signals.reason).toBe('tool_trigger_miss');

    // llm_struggle
    expect(report.llm_struggle_summary.hardest_step_index).toBe(1);
    expect(report.llm_struggle_summary.hardest_step_ms).toBe(5000);
    expect(report.llm_struggle_summary.resolution_narrative).toContain('sympy_diff');

    // tree
    expect(report.reasoning_tree.root_id).toBe('answer');

    // upsert 호출됨
    expect(upsertSpy).toHaveBeenCalledTimes(1);
    const upsertArg = upsertSpy.mock.calls[0][0] as {
      session_id: string;
      user_id: string;
      problem_hash: string;
      report_jsonb: PerProblemReport;
      expansion_trigger_ids: string[];
    };
    expect(upsertArg.session_id).toBe('sess-2');
    expect(upsertArg.user_id).toBe('user-1');
    expect(upsertArg.problem_hash).toBe('hash-1');
    expect(upsertArg.expansion_trigger_ids).toEqual(['trig-2']);
  });

  it('expandTrigger 가 pivotal step 의 tool_id 를 exclude_tool_id 로 전달', async () => {
    vi.mocked(decomposeChainSteps).mockResolvedValue([
      {
        index: 0,
        kind: 'tool_call',
        summary: 'TOOL_X',
        difficulty: 5,
        is_pivotal: true,
        trigger_id: 'trig-X',
        tool_id: 'TOOL_X',
      },
    ]);

    await buildReport({
      session_id: 'sess-3',
      user_id: 'user-1',
      problem_text: 'p',
    });

    expect(expandTrigger).toHaveBeenCalledWith('trig-X', 'TOOL_X', 3);
  });

  it('pivotal step 에 trigger_id 가 없으면 expandTrigger 호출 X', async () => {
    vi.mocked(decomposeChainSteps).mockResolvedValue([
      { index: 0, kind: 'parse', summary: 'parse', difficulty: 2, is_pivotal: true },
    ]);
    triggerRow.value = null;

    const report = await buildReport({
      session_id: 'sess-4',
      user_id: 'user-1',
      problem_text: 'p',
    });

    expect(expandTrigger).not.toHaveBeenCalled();
    expect(report.trigger_summary.primary.trigger_id).toBe('');
  });

  it('routing_decisions stage1_area 가 없으면 area=common 기본', async () => {
    routingRow.value = { stage1_area: null, stage1_difficulty: null };

    const report = await buildReport({
      session_id: 'sess-5',
      user_id: 'user-1',
      problem_text: 'p',
    });

    expect(report.problem_summary.area).toBe('common');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildReport — 에러 케이스
// ────────────────────────────────────────────────────────────────────────────

describe('buildReport — 에러', () => {
  it('session 없음 → throw session_not_found', async () => {
    cacheRow.value = null;
    sessionRow.value = null;

    await expect(
      buildReport({ session_id: 'no-such', user_id: 'user-1', problem_text: 'p' }),
    ).rejects.toThrow('session_not_found');
  });

  it('session.user_id 불일치 → throw session_user_mismatch', async () => {
    cacheRow.value = null;
    sessionRow.value = {
      user_id: 'other-user',
      routing_decision_id: null,
      problem_hash: 'h',
      tutor_name: 'euler',
      trace_jsonb: null,
    };

    await expect(
      buildReport({ session_id: 'sess-x', user_id: 'user-1', problem_text: 'p' }),
    ).rejects.toThrow('session_user_mismatch');
  });
});
