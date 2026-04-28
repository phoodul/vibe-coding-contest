/**
 * Phase G-06 G06-16 — Per-Problem Report 빌더 (4 모듈 통합).
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §5.2 (buildReport 알고리즘)
 *   docs/architecture-g06-legend.md §5.1 (PerProblemReport schema 1.1)
 *   docs/implementation_plan_g06.md §G06-16
 *
 * 흐름:
 *   1. per_problem_reports 캐시 조회 (session_id unique) — hit 시 즉시 반환
 *   2. legend_tutor_sessions + legend_routing_decisions 조회 (trace + tutor + area + difficulty)
 *   3. provider 매핑 (gauss → google, von_neumann → openai, 그 외 → anthropic)
 *   4. decomposeChainSteps (G06-12)
 *   5. extractLLMStruggle (G06-13) — Δ3
 *   6. buildReasoningTree (G06-14) — Δ4
 *   7. pivotal step → primary trigger 선정
 *   8. expandTrigger (G06-15) — primary 기준 max 3 카드
 *   9. aggregateStuck (G06-15) — stuck signals 합산
 *  10. PerProblemReport 조립 + per_problem_reports upsert
 *
 * 영향 격리: src/lib/legend/report/ 전용. 기존 R2 (weakness-aggregator) 미참조.
 */

import { createClient } from '@/lib/supabase/server';
import { decomposeChainSteps } from './step-decomposer';
import { extractLLMStruggle } from './llm-struggle-extractor';
import { buildReasoningTree } from './tree-builder';
import { expandTrigger } from './trigger-expander';
import { aggregateStuck, type StuckReason } from './stuck-tracker';
import type { Provider } from './trace-normalizer';
import type {
  PerProblemReport,
  PerProblemStep,
  ProblemArea,
  TriggerCard,
  TutorName,
} from '@/lib/legend/types';

// ────────────────────────────────────────────────────────────────────────────
// 튜터 라벨 + provider 매핑
// ────────────────────────────────────────────────────────────────────────────

export const TUTOR_LABELS_KO: Record<TutorName, { label: string; model: string }> = {
  ramanujan_calc: { label: '라마누잔 (계산)', model: 'Haiku 4.5 + SymPy' },
  ramanujan_intuit: { label: '라마누잔 (직관)', model: 'Opus 4.7' },
  gauss: { label: '가우스', model: 'Gemini 3.1 Pro' },
  von_neumann: { label: '폰 노이만', model: 'GPT-5.5' },
  euler: { label: '오일러', model: 'Opus 4.7 agentic' },
  leibniz: { label: '라이프니츠', model: 'Sonnet 4.6 agentic' },
};

export function inferProvider(tutor: TutorName): Provider {
  if (tutor === 'gauss') return 'google';
  if (tutor === 'von_neumann') return 'openai';
  return 'anthropic';
}

// ────────────────────────────────────────────────────────────────────────────
// 내부 타입
// ────────────────────────────────────────────────────────────────────────────

interface SessionRow {
  user_id: string;
  routing_decision_id: string | null;
  problem_hash: string;
  tutor_name: TutorName;
  trace_jsonb: unknown;
}

interface RoutingDecisionRow {
  stage1_area: string | null;
  stage1_difficulty: number | null;
}

interface TriggerLookupRow {
  id: string;
  tool_id: string;
  direction: 'forward' | 'backward' | 'both';
  trigger_condition: string;
  goal_pattern: string | null;
  why_text: string;
  math_tools?: { id: string; name: string } | { id: string; name: string }[] | null;
}

// ────────────────────────────────────────────────────────────────────────────
// primary trigger 카드 조회 (pivotal step → trigger_id → math_tool_triggers join)
// ────────────────────────────────────────────────────────────────────────────

async function fetchPrimaryTriggerCard(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  trigger_id: string,
): Promise<TriggerCard | null> {
  if (!trigger_id) return null;
  const { data, error } = await supabase
    .from('math_tool_triggers')
    .select(
      'id, tool_id, direction, trigger_condition, goal_pattern, why_text, math_tools(id, name)',
    )
    .eq('id', trigger_id)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as TriggerLookupRow;
  const tool = Array.isArray(row.math_tools) ? row.math_tools[0] : row.math_tools;
  const pattern_short =
    (row.direction === 'backward' && row.goal_pattern ? row.goal_pattern : row.trigger_condition) ??
    '';
  return {
    trigger_id: row.id,
    tool_name: tool?.name ?? '',
    direction: row.direction,
    pattern_short: pattern_short.slice(0, 80),
    why_text: row.why_text ?? '',
  };
}

// ────────────────────────────────────────────────────────────────────────────
// stuck reason 합산
// ────────────────────────────────────────────────────────────────────────────

function aggregateStuckSignals(
  snapshots: Array<{
    step_index: number;
    user_stuck_ms: number;
    revisit_count: number;
    reason?: StuckReason;
  }>,
): {
  layer: number | null;
  reason: StuckReason | null;
  user_stuck_ms_total: number;
  revisited_step_indices: number[];
} {
  const total = snapshots.reduce((sum, s) => sum + (s.user_stuck_ms ?? 0), 0);
  const revisited = snapshots
    .filter((s) => (s.revisit_count ?? 0) > 0)
    .map((s) => s.step_index);
  // 가장 큰 stuck 의 reason 채택 (없으면 null)
  let primary: StuckReason | null = null;
  let bestMs = 0;
  for (const s of snapshots) {
    if (s.reason && (s.user_stuck_ms ?? 0) >= bestMs) {
      primary = s.reason;
      bestMs = s.user_stuck_ms ?? 0;
    }
  }
  return {
    layer: null,
    reason: primary,
    user_stuck_ms_total: total,
    revisited_step_indices: revisited,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// pivotal step 선정
// ────────────────────────────────────────────────────────────────────────────

function pickPivotal(steps: PerProblemStep[]): PerProblemStep | undefined {
  if (steps.length === 0) return undefined;
  const explicit = steps.find((s) => s.is_pivotal);
  if (explicit) return explicit;
  // fallback: 가운데 step
  return steps[Math.floor(steps.length / 2)];
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 진입점
// ────────────────────────────────────────────────────────────────────────────

export interface BuildReportArgs {
  session_id: string;
  user_id: string;
  problem_text: string;
}

export interface BuildReportOptions {
  /** 캐시 강제 무시 (test 또는 재생성 시) */
  forceRefresh?: boolean;
  /** 단위 테스트 시 step/tree/struggle DB persist 생략 */
  skipPersist?: boolean;
}

export async function buildReport(
  args: BuildReportArgs,
  opts: BuildReportOptions = {},
): Promise<PerProblemReport> {
  const supabase = await createClient();

  // 1. 캐시 조회
  if (!opts.forceRefresh) {
    const { data: cached } = await supabase
      .from('per_problem_reports')
      .select('report_jsonb')
      .eq('session_id', args.session_id)
      .maybeSingle();
    if (cached && (cached as { report_jsonb: unknown }).report_jsonb) {
      return (cached as { report_jsonb: PerProblemReport }).report_jsonb;
    }
  }

  // 2. session 조회
  const { data: sessionData, error: sessionErr } = await supabase
    .from('legend_tutor_sessions')
    .select('user_id, routing_decision_id, problem_hash, tutor_name, trace_jsonb')
    .eq('id', args.session_id)
    .maybeSingle();
  if (sessionErr || !sessionData) {
    throw new Error('session_not_found');
  }
  const session = sessionData as SessionRow;
  if (session.user_id !== args.user_id) {
    throw new Error('session_user_mismatch');
  }

  // 3. routing_decisions 조회 (area / difficulty)
  let area: ProblemArea = 'common';
  let difficultyHint: number | null = null;
  if (session.routing_decision_id) {
    const { data: rd } = await supabase
      .from('legend_routing_decisions')
      .select('stage1_area, stage1_difficulty')
      .eq('id', session.routing_decision_id)
      .maybeSingle();
    if (rd) {
      const decision = rd as RoutingDecisionRow;
      if (decision.stage1_area) {
        const a = decision.stage1_area;
        if (
          a === 'calculus' ||
          a === 'geometry' ||
          a === 'probability' ||
          a === 'algebra' ||
          a === 'common'
        ) {
          area = a as ProblemArea;
        }
      }
      if (typeof decision.stage1_difficulty === 'number') {
        difficultyHint = decision.stage1_difficulty;
      }
    }
  }

  // 4. provider 결정
  const provider = inferProvider(session.tutor_name);

  // 5. step 분해 (G06-12)
  const steps = await decomposeChainSteps(
    session.trace_jsonb,
    args.session_id,
    provider,
    { skipPersist: opts.skipPersist },
  );

  // 6. LLM struggle (G06-13, Δ3)
  const llmStruggle = await extractLLMStruggle({
    trace: session.trace_jsonb,
    steps,
    provider,
    session_id: args.session_id,
    problem_text: args.problem_text,
    skipPersist: opts.skipPersist,
  });

  // 6.1 step 에 llm_struggle.resolution_text 주입 (per-step snapshot)
  const stepsWithStruggle: PerProblemStep[] = steps.map((s) => {
    const snap = llmStruggle.per_step.find((p) => p.step_index === s.index);
    if (!snap) return s;
    return {
      ...s,
      llm_struggle: {
        turns_at_step: snap.turns_at_step,
        tool_retries: snap.tool_retries,
        reasoning_chars: snap.reasoning_chars,
        step_ms: snap.step_ms,
        resolution_text: snap.resolution_text,
      },
    };
  });

  // 7. 추론 트리 (G06-14, Δ4)
  const tree = await buildReasoningTree(
    {
      session_id: args.session_id,
      user_id: args.user_id,
      problem_text: args.problem_text,
      steps: stepsWithStruggle,
      trace: session.trace_jsonb,
    },
    { skipPersist: opts.skipPersist },
  );

  // 8. pivotal step → primary trigger
  const pivotalStep = pickPivotal(stepsWithStruggle);
  const pivotalIndex = pivotalStep?.index ?? 0;
  const primaryTriggerId = pivotalStep?.trigger_id;
  const excludeToolId = pivotalStep?.tool_id;

  let primaryCard: TriggerCard | null = null;
  let expansions: TriggerCard[] = [];
  if (primaryTriggerId) {
    primaryCard = await fetchPrimaryTriggerCard(supabase, primaryTriggerId);
    expansions = await expandTrigger(primaryTriggerId, excludeToolId, 3);
  }
  const primary: TriggerCard = primaryCard ?? {
    trigger_id: '',
    tool_name: '',
    direction: 'both',
    pattern_short: '',
    why_text: '',
  };

  // 9. stuck signals
  let stuckSignals: PerProblemReport['stuck_signals'] = {
    layer: null,
    reason: null,
    user_stuck_ms_total: 0,
    revisited_step_indices: [],
  };
  try {
    const snapshots = await aggregateStuck(args.session_id);
    stuckSignals = aggregateStuckSignals(snapshots);
  } catch (e) {
    console.warn('[report-builder] aggregateStuck failed:', (e as Error).message);
  }

  // 10. PerProblemReport 조립
  const labelInfo = TUTOR_LABELS_KO[session.tutor_name] ?? { label: session.tutor_name, model: '' };
  const difficulty =
    pivotalStep?.difficulty ?? difficultyHint ?? 4;

  const report: PerProblemReport = {
    schema_version: '1.1',
    problem_summary: {
      text_short: args.problem_text.slice(0, 80),
      area,
      difficulty,
    },
    tutor: {
      name: session.tutor_name,
      label_ko: labelInfo.label,
      model_short: labelInfo.model,
    },
    steps: stepsWithStruggle,
    pivotal_step_index: pivotalIndex,
    trigger_summary: {
      primary,
      expansions,
    },
    stuck_signals: stuckSignals,
    llm_struggle_summary: {
      hardest_step_index: llmStruggle.hardest_step_index >= 0 ? llmStruggle.hardest_step_index : 0,
      hardest_step_ms: llmStruggle.hardest_step_ms,
      total_turns: llmStruggle.total_turns,
      total_tool_retries: llmStruggle.total_tool_retries,
      resolution_narrative: llmStruggle.resolution_narrative,
    },
    reasoning_tree: tree,
  };

  // 11. per_problem_reports upsert
  if (!opts.skipPersist) {
    try {
      const { error } = await supabase
        .from('per_problem_reports')
        .upsert(
          {
            user_id: args.user_id,
            session_id: args.session_id,
            problem_hash: session.problem_hash,
            report_jsonb: report,
            expansion_trigger_ids: expansions.map((e) => e.trigger_id),
          },
          { onConflict: 'session_id' },
        );
      if (error) {
        console.warn('[report-builder] upsert failed:', error.message);
      }
    } catch (e) {
      console.warn('[report-builder] upsert unexpected:', (e as Error).message);
    }
  }

  return report;
}
