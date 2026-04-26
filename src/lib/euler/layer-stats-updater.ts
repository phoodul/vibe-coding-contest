/**
 * user_layer_stats — Layer 별 attempts / successes / stuck / failure / L6 recall vs trigger 누적.
 * 호출: logSolve + step_summary 가 채워진 시점에 호출.
 *
 * 사용자 정정 핵심: L6 의 recall vs trigger 차별화 — 처방이 다름.
 */

import { createClient } from "@/lib/supabase/server";
import type { StepSummary } from "./solve-logger";

export interface LayerStatsUpdate {
  area: string;
  step_summary: StepSummary;
}

interface PerLayerDelta {
  attempts: number;
  successes: number;
  stuck_count: number;
  failure_count: number;
  l6_recall_miss: number;
  l6_trigger_miss: number;
  l5_domain_miss: number;
}

function emptyDelta(): PerLayerDelta {
  return {
    attempts: 0,
    successes: 0,
    stuck_count: 0,
    failure_count: 0,
    l6_recall_miss: 0,
    l6_trigger_miss: 0,
    l5_domain_miss: 0,
  };
}

function aggregateDeltas(steps: StepSummary): Map<number, PerLayerDelta> {
  const out = new Map<number, PerLayerDelta>();
  for (const step of steps.steps) {
    const layer = Math.max(1, Math.min(8, step.layer));
    const d = out.get(layer) ?? emptyDelta();
    d.attempts += 1;
    if (step.outcome === "success") d.successes += 1;
    if (step.outcome === "stuck") {
      d.stuck_count += 1;
      if (layer === 6 && step.miss_subtype === "recall") d.l6_recall_miss += 1;
      if (layer === 6 && step.miss_subtype === "trigger") d.l6_trigger_miss += 1;
      if (layer === 5 && step.type === "domain_id") d.l5_domain_miss += 1;
    }
    if (step.outcome === "failure") d.failure_count += 1;
    out.set(layer, d);
  }
  return out;
}

export async function updateLayerStats(input: LayerStatsUpdate): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const deltas = aggregateDeltas(input.step_summary);
    const nowIso = new Date().toISOString();

    for (const [layer, d] of deltas) {
      const { data: existing } = await supabase
        .from("user_layer_stats")
        .select("attempts, successes, stuck_count, failure_count, l6_recall_miss, l6_trigger_miss, l5_domain_miss, last_failure_at")
        .eq("user_id", user.id)
        .eq("layer", layer)
        .eq("area", input.area)
        .maybeSingle();

      const merged = {
        attempts: (existing?.attempts ?? 0) + d.attempts,
        successes: (existing?.successes ?? 0) + d.successes,
        stuck_count: (existing?.stuck_count ?? 0) + d.stuck_count,
        failure_count: (existing?.failure_count ?? 0) + d.failure_count,
        l6_recall_miss: (existing?.l6_recall_miss ?? 0) + d.l6_recall_miss,
        l6_trigger_miss: (existing?.l6_trigger_miss ?? 0) + d.l6_trigger_miss,
        l5_domain_miss: (existing?.l5_domain_miss ?? 0) + d.l5_domain_miss,
      };

      const lastFailureAt =
        d.failure_count + d.stuck_count > 0
          ? nowIso
          : (existing?.last_failure_at ?? null);

      const { error } = await supabase
        .from("user_layer_stats")
        .upsert(
          {
            user_id: user.id,
            layer,
            area: input.area,
            ...merged,
            last_failure_at: lastFailureAt,
          },
          { onConflict: "user_id,layer,area" }
        );
      if (error) {
        console.warn(`layer-stats skipped layer=${layer}:`, error.message);
      }
    }
  } catch (err) {
    console.error("layer-stats-updater error:", err);
  }
}
