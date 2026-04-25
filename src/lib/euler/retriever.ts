/**
 * Retriever — 양방향 pgvector 검색.
 *
 * conditions[] → embedding_forward 검색
 * goal → embedding_backward 검색
 * 결과를 tool_id 단위로 dedupe + tool_weight 가중 cosine 재정렬 → top-K
 *
 * 사용 위치:
 *   - orchestrator (B-12) 가 Manager 결과를 받아 호출
 *   - 단독 라우트 /api/euler-tutor/tools/search (B-09)
 */

import { createClient } from "@/lib/supabase/server";
import { embedText } from "./embed";

export interface RetrievedTool {
  trigger_id: string;
  tool_id: string;
  tool_name: string;
  direction: "forward" | "backward" | "both";
  why_text: string;
  trigger_condition: string;
  derived_fact: string | null;
  goal_pattern: string | null;
  tool_layer: number;
  tool_weight: number;
  /** 가중 점수 (cosine × tool_weight, 0..1.5 범위 가능) */
  score: number;
  /** 원래 cosine similarity */
  similarity: number;
  /** 어느 방향 검색에서 나왔는가 */
  matched_via: "forward" | "backward";
}

export interface RetrieveArgs {
  conditions?: string[];
  goal?: string;
  /** "forward" 만 / "backward" 만 / 둘 다 */
  direction?: "forward" | "backward" | "both";
  topK?: number;
}

interface RpcRow {
  trigger_id: string;
  tool_id: string;
  direction: "forward" | "backward" | "both";
  trigger_condition: string;
  derived_fact: string | null;
  goal_pattern: string | null;
  why_text: string;
  tool_name: string;
  tool_layer: number;
  tool_weight: number;
  similarity: number;
}

async function searchOneDirection(
  queryEmbedding: number[],
  directionFilter: "forward" | "backward",
  matchCount: number
): Promise<RpcRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_math_tool_triggers", {
    query_embedding: queryEmbedding,
    direction_filter: directionFilter,
    match_count: matchCount,
  });
  if (error) {
    console.error(`retriever ${directionFilter} rpc error:`, error);
    return [];
  }
  return (data ?? []) as RpcRow[];
}

export async function retrieveTools({
  conditions = [],
  goal,
  direction = "both",
  topK = 5,
}: RetrieveArgs): Promise<RetrievedTool[]> {
  const conditionsText = conditions.filter(Boolean).join(" / ").trim();
  const goalText = (goal ?? "").trim();

  const wantForward = direction !== "backward" && conditionsText.length > 0;
  const wantBackward = direction !== "forward" && goalText.length > 0;

  if (!wantForward && !wantBackward) return [];

  const overFetch = Math.max(topK * 3, 10);

  const [fwdEmbedding, bwdEmbedding] = await Promise.all([
    wantForward ? embedText(conditionsText) : Promise.resolve<number[] | null>(null),
    wantBackward ? embedText(goalText) : Promise.resolve<number[] | null>(null),
  ]);

  const [fwdRows, bwdRows] = await Promise.all([
    fwdEmbedding ? searchOneDirection(fwdEmbedding, "forward", overFetch) : Promise.resolve([]),
    bwdEmbedding ? searchOneDirection(bwdEmbedding, "backward", overFetch) : Promise.resolve([]),
  ]);

  // tool_id 단위 dedupe (best score 보존)
  const merged = new Map<string, RetrievedTool>();
  const ingest = (rows: RpcRow[], via: "forward" | "backward") => {
    for (const r of rows) {
      const score = r.similarity * (r.tool_weight ?? 1.0);
      const existing = merged.get(r.tool_id);
      if (!existing || score > existing.score) {
        merged.set(r.tool_id, {
          trigger_id: r.trigger_id,
          tool_id: r.tool_id,
          tool_name: r.tool_name,
          direction: r.direction,
          why_text: r.why_text,
          trigger_condition: r.trigger_condition,
          derived_fact: r.derived_fact,
          goal_pattern: r.goal_pattern,
          tool_layer: r.tool_layer,
          tool_weight: r.tool_weight ?? 1.0,
          similarity: r.similarity,
          score,
          matched_via: via,
        });
      }
    }
  };
  ingest(fwdRows, "forward");
  ingest(bwdRows, "backward");

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
