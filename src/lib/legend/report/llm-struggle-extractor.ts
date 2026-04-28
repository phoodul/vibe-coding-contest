/**
 * Phase G-06 G06-13 — LLM struggle 추출기 (Δ3).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §5.2 (extractLLMStruggle 알고리즘) +
 *             docs/project-decisions.md Δ3 (LLM struggle 차원 추가) +
 *             docs/implementation_plan_g06.md §G06-13.
 *
 * 알고리즘:
 *   1. trace → NormalizedTurn[] (trace-normalizer)
 *   2. step → turn 1:1 단순 매핑 (G06-16 에서 정교화 예정)
 *   3. 각 step 별 turns_at_step / tool_retries / reasoning_chars / step_ms 집계
 *   4. step_ms × 100 + reasoning_chars 가 가장 큰 step (hardest) 만 Haiku 4.5 호출
 *      → "AI도 어려웠지만 어떻게 해결했는지" 1~2문장 (max_tokens 200, ~$0.0002)
 *   5. solve_step_decomposition.llm_* 5 컬럼 update
 *
 * 비용 가드: Haiku 호출은 hardest step 1회 only. reasoning_chars=0 이면 skip.
 *
 * 영향 격리: src/lib/legend/report/ 전용. trace-normalizer / call-model / supabase 만 import.
 */

import { createClient } from '@/lib/supabase/server';
import { callModel } from '@/lib/legend/call-model';
import type { PerProblemStep } from '@/lib/legend/types';
import { normalizeTrace, type NormalizedTurn, type Provider } from './trace-normalizer';

// ────────────────────────────────────────────────────────────────────────────
// 출력 타입
// ────────────────────────────────────────────────────────────────────────────

export interface LLMStruggleSnapshot {
  step_index: number;
  turns_at_step: number;
  tool_retries: number;
  reasoning_chars: number;
  step_ms: number;
  resolution_text?: string;
}

export interface LLMStruggleSummary {
  /** PerProblemReport.llm_struggle_summary 의 hardest_step_index */
  hardest_step_index: number;
  hardest_step_ms: number;
  total_turns: number;
  total_tool_retries: number;
  /** PerProblemReport.llm_struggle_summary.resolution_narrative — Haiku 요약 1~2문장 */
  resolution_narrative: string;
  per_step: LLMStruggleSnapshot[];
}

export interface ExtractLLMStruggleArgs {
  trace: unknown;
  steps: PerProblemStep[];
  provider: Provider;
  session_id: string;
  problem_text: string;
  /** test 시 supabase update 생략 */
  skipPersist?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// step → turn 매핑 (G06-13 단순 1:1, G06-16 에서 정교화)
// ────────────────────────────────────────────────────────────────────────────

function pickTurnForStep(turns: NormalizedTurn[], step: PerProblemStep): NormalizedTurn | undefined {
  if (turns.length === 0) return undefined;
  const idx = Math.min(Math.max(step.index, 0), turns.length - 1);
  return turns[idx];
}

// ────────────────────────────────────────────────────────────────────────────
// hardest step 선정: step_ms × 100 + reasoning_chars (tie-break)
// ────────────────────────────────────────────────────────────────────────────

function selectHardestIndex(per_step: LLMStruggleSnapshot[]): number {
  if (per_step.length === 0) return -1;
  let bestIdx = 0;
  let bestScore = -Infinity;
  per_step.forEach((s, i) => {
    const score = s.step_ms * 100 + s.reasoning_chars;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });
  return bestIdx;
}

// ────────────────────────────────────────────────────────────────────────────
// Haiku 요약 ($0.0002 / max_tokens 200)
// ────────────────────────────────────────────────────────────────────────────

const RESOLUTION_SYSTEM = `당신은 학습 코치입니다. 학생에게 다음 단계를 1~2문장으로 친근하게 설명해주세요: "AI도 어려웠지만 어떻게 해결했는지".
결론·계산이 아닌 통찰 위주로. 한국어 존댓말, 간결하게.`;

async function summarizeResolution(args: {
  problem: string;
  step_summary: string;
  turn_text: string;
}): Promise<string> {
  const trimmedTurn = (args.turn_text ?? '').slice(0, 1500);
  const promptBody = `### 원문제 (요약)
${args.problem.slice(0, 800)}

### 어려웠던 단계 요약
${args.step_summary}

### AI 가 이 단계에서 실제 추론한 내용
${trimmedTurn}

위 단계가 왜 어려웠는지·어떻게 해결했는지 1~2문장으로 친근하게 설명하세요.`;

  const result = await callModel({
    model_id: process.env.ANTHROPIC_HAIKU_MODEL_ID ?? 'claude-haiku-4-5-20251201',
    provider: 'anthropic',
    mode: 'baseline',
    problem: promptBody,
    system_prompt: RESOLUTION_SYSTEM,
    max_tokens: 200,
  });
  return (result.text ?? '').trim();
}

// ────────────────────────────────────────────────────────────────────────────
// DB update — solve_step_decomposition.llm_* 5 컬럼
// ────────────────────────────────────────────────────────────────────────────

async function updateLLMStruggleColumns(
  session_id: string,
  per_step: LLMStruggleSnapshot[],
): Promise<void> {
  if (!session_id || per_step.length === 0) return;
  try {
    const supabase = await createClient();
    for (const s of per_step) {
      const { error } = await supabase
        .from('solve_step_decomposition')
        .update({
          llm_turns_at_step: s.turns_at_step,
          llm_tool_retries: s.tool_retries,
          llm_reasoning_chars: s.reasoning_chars,
          llm_step_ms: s.step_ms,
          llm_resolution_text: s.resolution_text ?? null,
        })
        .eq('session_id', session_id)
        .eq('step_index', s.step_index);
      if (error) {
        console.warn('[llm-struggle-extractor] update failed:', error.message);
      }
    }
  } catch (e) {
    console.warn('[llm-struggle-extractor] update unexpected:', (e as Error).message);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 진입점
// ────────────────────────────────────────────────────────────────────────────

export async function extractLLMStruggle(
  args: ExtractLLMStruggleArgs,
): Promise<LLMStruggleSummary> {
  const turns = normalizeTrace(args.trace, args.provider);

  // 1) per-step snapshot
  const per_step: LLMStruggleSnapshot[] = args.steps.map((step) => {
    const turn = pickTurnForStep(turns, step);
    const tool_retries = turn?.tool_calls?.filter((t) => t.is_retry).length ?? 0;
    return {
      step_index: step.index,
      turns_at_step: turn ? 1 : 0,
      tool_retries,
      reasoning_chars: turn?.reasoning_chars ?? 0,
      step_ms: turn?.duration_ms ?? 0,
    };
  });

  // 2) hardest step 선정 + Haiku 요약 (조건: reasoning_chars > 0)
  const hardest_step_index = selectHardestIndex(per_step);
  let resolution_narrative = '';
  if (hardest_step_index >= 0 && per_step[hardest_step_index].reasoning_chars > 0) {
    try {
      const hardestStep = args.steps[hardest_step_index];
      const hardestTurn = pickTurnForStep(turns, hardestStep);
      const summary = await summarizeResolution({
        problem: args.problem_text,
        step_summary: hardestStep.summary,
        turn_text: hardestTurn?.text ?? '',
      });
      resolution_narrative = summary;
      per_step[hardest_step_index].resolution_text = summary;
    } catch (e) {
      console.warn('[llm-struggle-extractor] Haiku resolution failed:', (e as Error).message);
    }
  }

  // 3) DB update
  if (!args.skipPersist) {
    await updateLLMStruggleColumns(args.session_id, per_step);
  }

  // 4) 합산 통계
  const total_turns = turns.length;
  const total_tool_retries = per_step.reduce((sum, s) => sum + s.tool_retries, 0);
  const hardest_step_ms = hardest_step_index >= 0 ? per_step[hardest_step_index].step_ms : 0;

  return {
    hardest_step_index,
    hardest_step_ms,
    total_turns,
    total_tool_retries,
    resolution_narrative,
    per_step,
  };
}

// 내부 함수 export — 단위 테스트용
export const __test = { selectHardestIndex, pickTurnForStep };
