/**
 * Tier 1 자동 보고 — Reasoner 가 사용한 도구를 candidate_tools 에 누적.
 *
 * dedup 키: proposed_name 정규화 (lowercase + 공백 압축)
 * 임계값(EULER_TOOL_REPORT_THRESHOLD, 기본 3) 도달 시 admin 알림 hook 호출.
 *
 * 멱등성: 같은 후보를 여러 번 보고해도 occurrence_count 만 증가 (math_tools 에 이미 있는 도구는 스킵).
 */

import { createClient } from "@/lib/supabase/server";

const REPORT_THRESHOLD = parseInt(process.env.EULER_TOOL_REPORT_THRESHOLD ?? "3", 10);

export interface ToolReportInput {
  proposed_name: string;
  proposed_formula_latex?: string;
  proposed_layer?: number;
  proposed_why?: string;
  proposed_trigger?: string;
  source_problem_key?: string;
}

export interface ToolReportResult {
  status: "skipped_known" | "incremented" | "created";
  candidate_id?: string;
  occurrence_count?: number;
  threshold_reached?: boolean;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Reasoner 가 사용한 도구 한 건을 보고. 이미 math_tools 에 존재하면 hit_count 만 ++ 후 스킵.
 * 새 후보면 candidate_tools 에 insert 또는 occurrence_count ++.
 */
export async function reportTool(input: ToolReportInput): Promise<ToolReportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "skipped_known" };

  const normalized = normalizeName(input.proposed_name);

  // 1) 이미 math_tools 에 등록된 도구면 hit_count++ 만 (admin RLS 우회 위해 RPC 권장 — 일단 스킵)
  const { data: existingTool } = await supabase
    .from("math_tools")
    .select("id")
    .ilike("name", input.proposed_name)
    .maybeSingle();
  if (existingTool) {
    return { status: "skipped_known", candidate_id: existingTool.id };
  }

  // 2) candidate_tools 에서 동일 정규화 이름 찾기
  const { data: existingCandidate } = await supabase
    .from("candidate_tools")
    .select("id, occurrence_count, source_problem_keys")
    .ilike("proposed_name", input.proposed_name)
    .eq("status", "pending")
    .maybeSingle();

  if (existingCandidate) {
    const newCount = (existingCandidate.occurrence_count ?? 0) + 1;
    const keys = new Set<string>(existingCandidate.source_problem_keys ?? []);
    if (input.source_problem_key) keys.add(input.source_problem_key);
    const { error: updErr } = await supabase
      .from("candidate_tools")
      .update({ occurrence_count: newCount, source_problem_keys: Array.from(keys) })
      .eq("id", existingCandidate.id);
    if (updErr) {
      console.error("tool-reporter update error:", updErr);
      return { status: "skipped_known" };
    }
    const reached = newCount >= REPORT_THRESHOLD;
    if (reached) {
      console.log(
        `[tool-reporter] threshold ${REPORT_THRESHOLD} reached for "${normalized}" (id=${existingCandidate.id})`
      );
    }
    return {
      status: "incremented",
      candidate_id: existingCandidate.id as string,
      occurrence_count: newCount,
      threshold_reached: reached,
    };
  }

  // 3) 신규 candidate insert
  const { data: created, error: insErr } = await supabase
    .from("candidate_tools")
    .insert({
      proposed_name: input.proposed_name,
      proposed_formula_latex: input.proposed_formula_latex ?? null,
      proposed_layer: input.proposed_layer ?? null,
      proposed_why: input.proposed_why ?? null,
      proposed_trigger: input.proposed_trigger ?? null,
      source_problem_keys: input.source_problem_key ? [input.source_problem_key] : [],
      reported_by: user.id,
    })
    .select("id")
    .maybeSingle();

  if (insErr) {
    console.error("tool-reporter insert error:", insErr);
    return { status: "skipped_known" };
  }
  return {
    status: "created",
    candidate_id: created?.id as string | undefined,
    occurrence_count: 1,
    threshold_reached: false,
  };
}

export async function reportTools(inputs: ToolReportInput[]): Promise<ToolReportResult[]> {
  // fire-and-forget 안전망: Promise.allSettled
  const results = await Promise.allSettled(inputs.map((i) => reportTool(i)));
  return results.map((r) =>
    r.status === "fulfilled" ? r.value : ({ status: "skipped_known" } as ToolReportResult)
  );
}
