/**
 * Phase G-04 G04-5: similar_problems retrieve + Reasoner inject 포맷터.
 *
 * 백엔드 RAG 한정 — 학생 화면 노출 0%. 풀이 본문은 미저장·미주입.
 * 라벨 단위 = trigger 패턴 (Tool 의 본질은 trigger when, project-decisions.md G-04).
 */
import { createClient } from "@/lib/supabase/server";
import { embedText } from "./embed";

export interface TriggerLabel {
  direction: "forward" | "backward" | "both";
  condition_pattern?: string;
  goal_pattern?: string;
  why: string;
  tool_hint?: string;
}

export interface SimilarProblemRow {
  id: string;
  year: number;
  type: string;
  number: number;
  problem_latex: string;
  answer: string;
  trigger_labels: TriggerLabel[];
  similarity: number;
}

/**
 * 현재 풀이 중인 문제와 가장 유사한 과거 수능 killer 문항 top-k 회수.
 * 임베딩 RPC 실패해도 빈 배열 반환 (메인 흐름 무영향).
 */
export async function retrieveSimilarProblems(
  problemText: string,
  topK = 3,
): Promise<SimilarProblemRow[]> {
  if (!problemText?.trim()) return [];
  let embedding: number[];
  try {
    embedding = await embedText(problemText);
  } catch (e) {
    console.warn("[similar-problems] embed failed:", (e as Error).message);
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("match_similar_problems", {
      query_embedding: embedding,
      match_count: topK,
    });
    if (error) {
      console.warn("[similar-problems] rpc failed:", error.message);
      return [];
    }
    return (data || []) as SimilarProblemRow[];
  } catch (e) {
    console.warn("[similar-problems] supabase failed:", (e as Error).message);
    return [];
  }
}

/**
 * Reasoner system prompt 에 inject 할 텍스트 생성.
 * 학생 노출 X — 풀이 본문/정답은 절대 포함하지 않음. trigger 패턴만.
 */
export function formatSimilarProblemsContext(
  rows: SimilarProblemRow[],
): string {
  if (!rows.length) return "";

  const aggregated = rows.flatMap((r) =>
    (r.trigger_labels || []).map((t) => ({
      ...t,
      source: `${r.year}-${r.type}-${r.number}`,
      similarity: r.similarity,
    })),
  );

  // dedupe by why (또는 condition+goal pattern)
  const seen = new Set<string>();
  const unique = aggregated.filter((t) => {
    const k = (t.why || `${t.condition_pattern}|${t.goal_pattern}`).trim();
    if (!k) return false;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (!unique.length) return "";

  const lines = unique.slice(0, 8).map((t) => {
    const arrow =
      t.direction === "backward"
        ? `${t.goal_pattern || "(목표)"} ← ${t.tool_hint || "도구"}`
        : t.direction === "forward"
          ? `${t.condition_pattern || "(조건)"} → ${t.tool_hint || "도구"}`
          : `${t.condition_pattern || ""} ↔ ${t.goal_pattern || ""} (${t.tool_hint || "도구"})`;
    return `  - [${t.direction}] ${arrow} — ${t.why}`;
  });

  return `\n\n## 유사 과거 수능 killer 문항이 발동시킨 trigger 패턴 (백엔드 RAG, 학생 노출 금지)

${lines.join("\n")}

위 trigger 들은 **풀이 방향성 추론에만 참고**. 풀이 본문이나 정답은 학생에게 그대로 노출하지 마세요.
학생이 같은 trigger 패턴을 스스로 떠올릴 수 있도록 단계적으로 유도하세요.`;
}
