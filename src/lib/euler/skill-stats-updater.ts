/**
 * user_skill_stats — 도구별 attempts/successes upsert.
 * 호출: 풀이 종료 후 (logSolve 직후) tools_used 와 is_correct 함께 받아 누적.
 */

import { createClient } from "@/lib/supabase/server";

export interface SkillStatsUpdate {
  tools_used: string[];
  area: string;
  is_correct: boolean | null;
}

/**
 * 사용된 각 도구마다 attempts ++, 정답이면 successes ++.
 * math_tools 에 없는 도구는 FK 위반 → 자동 스킵 (try 로 무시).
 */
export async function updateSkillStats(input: SkillStatsUpdate): Promise<void> {
  if (!input.tools_used.length) return;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const inc = input.is_correct ? 1 : 0;

    for (const toolId of input.tools_used) {
      // upsert + 증가는 RLS 환경에서 단일 RPC 가 더 안전하지만, 단순화: 조회 후 upsert
      const { data: existing } = await supabase
        .from("user_skill_stats")
        .select("attempts, successes")
        .eq("user_id", user.id)
        .eq("tool_id", toolId)
        .maybeSingle();

      const newAttempts = (existing?.attempts ?? 0) + 1;
      const newSuccesses = (existing?.successes ?? 0) + inc;

      const { error } = await supabase
        .from("user_skill_stats")
        .upsert(
          {
            user_id: user.id,
            tool_id: toolId,
            area: input.area,
            attempts: newAttempts,
            successes: newSuccesses,
            last_used_at: new Date().toISOString(),
          },
          { onConflict: "user_id,tool_id" }
        );
      if (error) {
        // FK 위반(math_tools 미등록) 또는 기타 — 무시
        console.warn(`skill-stats skipped ${toolId}:`, error.message);
      }
    }
  } catch (err) {
    console.error("skill-stats-updater error:", err);
  }
}
