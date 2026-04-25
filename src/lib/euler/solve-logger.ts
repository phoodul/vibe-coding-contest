/**
 * 풀이 1건이 끝난 시점에 euler_solve_logs 에 비동기 insert.
 *
 * 호출 위치:
 *   - orchestrator route (선택) — 첫 user 메시지 + Manager/Reasoner/Critic 결과 종합 후
 *   - 또는 클라이언트가 풀이 완료 시점에 별도 endpoint 호출
 *
 * Phase C 단계: orchestrator 의 첫 turn 직후 fire-and-forget.
 * Phase C-07 이후: stuck 분류 결과를 step_summary 에 채움.
 */

import { createClient } from "@/lib/supabase/server";
import type { StuckLayer, StuckReason } from "@/lib/ai/euler-critic-prompt";

export interface StepEntry {
  n: number;
  layer: number;
  type:
    | "parse"
    | "domain_id"
    | "tool_call"
    | "forward"
    | "backward"
    | "computation"
    | "answer";
  outcome: "success" | "stuck" | "failure";
  identified_domain?: string;
  facts_derived?: string[];
  tools_attempted?: string[];
  miss_subtype?: "recall" | "trigger";
  expected?: string;
  got?: string;
}

export interface StepSummary {
  steps: StepEntry[];
  stuck_layer?: StuckLayer | null;
  stuck_reason?: StuckReason | null;
}

export interface SolveLogInput {
  problem_text: string;
  problem_image_url?: string | null;
  problem_key?: string | null;
  area?: string | null;
  difficulty?: number | null;
  input_mode?: "text" | "photo" | "handwrite" | "voice" | null;
  tutor_persona?: "euler" | "gauss" | null;
  tools_used?: string[];
  reasoner_path?: unknown;
  step_summary?: StepSummary | null;
  stuck_layer?: number | null;
  stuck_reason?: string | null;
  critic_passed?: boolean | null;
  critic_attempts?: number;
  final_answer?: string | null;
  user_answer?: string | null;
  is_correct?: boolean | null;
  reveal_used?: boolean;
  duration_ms?: number | null;
}

const LAYER_NUM_MAP: Record<string, number> = {
  "L1-4": 4,
  L5: 5,
  L6: 6,
  L7: 7,
  L8: 8,
  none: 0,
};

function normalizeLayer(layer: number | StuckLayer | null | undefined): number | null {
  if (layer == null) return null;
  if (typeof layer === "number") return layer;
  return LAYER_NUM_MAP[layer] ?? null;
}

export async function logSolve(input: SolveLogInput): Promise<{ ok: boolean; id?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false };

    const layerNum = normalizeLayer(input.stuck_layer ?? null);

    const { data, error } = await supabase
      .from("euler_solve_logs")
      .insert({
        user_id: user.id,
        problem_text: input.problem_text,
        problem_image_url: input.problem_image_url ?? null,
        problem_key: input.problem_key ?? null,
        area: input.area ?? null,
        difficulty: input.difficulty ?? null,
        input_mode: input.input_mode ?? null,
        tutor_persona: input.tutor_persona ?? null,
        tools_used: input.tools_used ?? [],
        reasoner_path: input.reasoner_path ?? null,
        step_summary: input.step_summary ?? null,
        stuck_layer: layerNum,
        stuck_reason: input.stuck_reason ?? null,
        critic_passed: input.critic_passed ?? null,
        critic_attempts: input.critic_attempts ?? 0,
        final_answer: input.final_answer ?? null,
        user_answer: input.user_answer ?? null,
        is_correct: input.is_correct ?? null,
        reveal_used: input.reveal_used ?? false,
        duration_ms: input.duration_ms ?? null,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("solve-logger insert error:", error);
      return { ok: false };
    }
    return { ok: true, id: data?.id as string | undefined };
  } catch (err) {
    console.error("solve-logger error:", err);
    return { ok: false };
  }
}
