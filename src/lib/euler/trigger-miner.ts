/**
 * Phase G-04 G04-9: 자체 학습 trigger mining.
 *
 * 운영 중 legend_solve_logs 에서 발동된 trigger 패턴을 자동 발굴해
 * candidate_triggers 큐에 적재한다. occurrence_count 임계값 도달 시
 * status='pending_review' 로 승격되어 admin 검수 큐에 노출.
 *
 * 절차 (1회 cron 실행):
 *   1. 최근 N일 chain_used_tools 가 비어있지 않은 logs 추출 (max 50)
 *   2. 각 log 의 첫 used_tool 에 대해 Haiku 로 trigger 패턴 추출
 *   3. embedding 후 기존 math_tool_triggers 와 cosine 비교
 *      ≥ 0.85 면 skip (기존 trigger 가 잘 커버함)
 *   4. <0.85 면 기존 candidate 와도 cosine 비교
 *      ≥ 0.85 면 occurrence_count++, source_log_ids append
 *      <0.85 면 candidate 신규 row insert (occurrence_count=1)
 *   5. occurrence_count ≥ THRESHOLD 도달 시 status='pending_review'
 *
 * Tool 의 본질은 trigger 패턴 (project-decisions.md G-04) — 정리 이름이
 * 아니라 "어떤 조건이 보이면 떠올리는가" 를 추출.
 */
import { createServiceClient } from "@/lib/supabase/service";
import { embedText } from "./embed";

const HAIKU_MODEL = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";
const PROMOTE_THRESHOLD = parseInt(
  process.env.EULER_TRIGGER_PROMOTE_THRESHOLD ?? "5",
  10,
);
const SIMILARITY_DEDUP = 0.85;
const MAX_LOGS_PER_RUN = 50;

interface MinerResult {
  processed_logs: number;
  new_candidates: number;
  bumped_candidates: number;
  promoted_to_review: number;
  skipped_dedup: number;
  errors: number;
}

interface MinedTrigger {
  direction: "forward" | "backward" | "both";
  condition_pattern?: string;
  goal_pattern?: string;
  why: string;
}

const MINER_SYSTEM = `당신은 수학 풀이 로그에서 발동된 trigger 패턴을 추출합니다.
주어진 문제와 발동된 도구 이름을 보고, **그 도구가 왜 떠올랐을 trigger 패턴 1개** 를 추출하세요.

## 핵심
Tool 의 본질은 **trigger 패턴(when)** 입니다 — 정리 이름이 아니라 "어떤 조건이 보이면 떠올리는가".

## 출력 (JSON only)
{
  "direction": "forward" | "backward" | "both",
  "condition_pattern": "닫힌구간 연속 + 미분가능",  // forward 일 때
  "goal_pattern": "f'(c)=k 인 c 존재 증명",          // backward 일 때
  "why": "왜 그 도구가 떠올라야 하는지 한 문장 — 도구 이름이 아닌 직관"
}

## 원칙
- 추측 금지. 문제 본문에서 명확히 추론 가능한 trigger 만.
- 모호하거나 자신 없으면 why 에 "추출 실패" 만 적기.`;

async function callHaikuForTrigger(
  problem: string,
  toolName: string,
): Promise<MinedTrigger | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HAIKU_MODEL,
        max_tokens: 400,
        system: MINER_SYSTEM,
        messages: [
          {
            role: "user",
            content: `문제:\n${problem.slice(0, 2000)}\n\n발동된 도구: ${toolName}\n\nJSON 만 출력하세요.`,
          },
        ],
      }),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { content: { type: string; text: string }[] };
    const text = data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = fence ? fence[1] : text.trim();
    const parsed = JSON.parse(candidate) as MinedTrigger;
    if (!parsed.direction || !parsed.why || parsed.why.includes("추출 실패")) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function findMostSimilarExisting(
  client: ReturnType<typeof createServiceClient>,
  embedding: number[],
  direction: "forward" | "backward" | "both",
): Promise<number> {
  // forward 또는 both → embedding_forward, backward 또는 both → embedding_backward 중 더 유사한 것
  const dirCol = direction === "backward" ? "embedding_backward" : "embedding_forward";
  const { data, error } = await client.rpc("match_math_tool_triggers", {
    query_embedding: embedding,
    match_count: 1,
    direction_filter: dirCol === "embedding_backward" ? "backward" : "forward",
  } as Record<string, unknown>);
  if (error || !data || (data as unknown[]).length === 0) return 0;
  const row = (data as { similarity?: number }[])[0];
  return row?.similarity ?? 0;
}

async function findMostSimilarCandidate(
  client: ReturnType<typeof createServiceClient>,
  toolId: string,
  embedding: number[],
): Promise<{ id: string; similarity: number; occurrence_count: number; status: string } | null> {
  // 단순화: tool_id 별 candidate 의 embedding 직접 가져와 cosine 계산 (서버측)
  // 양이 적을 것이므로 client side filter
  const { data, error } = await client
    .from("candidate_triggers")
    .select("id, embedding, occurrence_count, status")
    .eq("tool_id", toolId)
    .not("embedding", "is", null)
    .limit(50);
  if (error || !data || data.length === 0) return null;
  let best: { id: string; similarity: number; occurrence_count: number; status: string } | null = null;
  for (const row of data) {
    const emb = row.embedding as unknown as number[] | string | null;
    if (!emb) continue;
    const arr = typeof emb === "string" ? (JSON.parse(emb) as number[]) : emb;
    if (!Array.isArray(arr) || arr.length !== embedding.length) continue;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < arr.length; i++) {
      dot += arr[i] * embedding[i];
      na += arr[i] * arr[i];
      nb += embedding[i] * embedding[i];
    }
    const sim = dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
    if (!best || sim > best.similarity) {
      best = {
        id: row.id as string,
        similarity: sim,
        occurrence_count: (row.occurrence_count as number) ?? 1,
        status: (row.status as string) ?? "mining",
      };
    }
  }
  return best;
}

export async function runTriggerMiner(): Promise<MinerResult> {
  const result: MinerResult = {
    processed_logs: 0,
    new_candidates: 0,
    bumped_candidates: 0,
    promoted_to_review: 0,
    skipped_dedup: 0,
    errors: 0,
  };

  const client = createServiceClient();

  // 최근 7일 chain_used_tools 비어있지 않은 logs
  const sinceIso = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data: logs, error } = await client
    .from("legend_solve_logs")
    .select("id, problem_text, chain_used_tools")
    .gte("created_at", sinceIso)
    .not("chain_used_tools", "is", null)
    .limit(MAX_LOGS_PER_RUN);
  if (error) {
    console.warn("[trigger-miner] log fetch failed:", error.message);
    return result;
  }

  for (const log of logs ?? []) {
    const tools = log.chain_used_tools as string[] | null;
    if (!tools || tools.length === 0) continue;
    const firstTool = tools[0];
    const problem = (log.problem_text as string) ?? "";
    if (!problem.trim()) continue;
    result.processed_logs++;

    // Haiku 추출
    const mined = await callHaikuForTrigger(problem, firstTool);
    if (!mined) { result.errors++; continue; }

    // tool_id 매핑 (math_tools.name 또는 id 로 lookup)
    const { data: tool } = await client
      .from("math_tools")
      .select("id")
      .or(`id.eq.${firstTool},name.eq.${firstTool}`)
      .maybeSingle();
    if (!tool) { result.errors++; continue; }
    const toolId = tool.id as string;

    // 임베딩
    const triggerText = [
      mined.condition_pattern,
      mined.goal_pattern,
      mined.why,
    ].filter(Boolean).join(" / ");
    let embedding: number[];
    try {
      embedding = await embedText(triggerText);
    } catch { result.errors++; continue; }

    // 기존 trigger 와 비교 — 이미 잘 커버하면 skip
    const existingSim = await findMostSimilarExisting(client, embedding, mined.direction);
    if (existingSim >= SIMILARITY_DEDUP) {
      result.skipped_dedup++;
      continue;
    }

    // 기존 candidate 와 비교
    const existingCand = await findMostSimilarCandidate(client, toolId, embedding);
    if (existingCand && existingCand.similarity >= SIMILARITY_DEDUP) {
      // bump occurrence
      const newCount = existingCand.occurrence_count + 1;
      const newStatus =
        newCount >= PROMOTE_THRESHOLD && existingCand.status === "mining"
          ? "pending_review"
          : existingCand.status;
      await client
        .from("candidate_triggers")
        .update({
          occurrence_count: newCount,
          status: newStatus,
          source_log_ids: [log.id],
        })
        .eq("id", existingCand.id);
      result.bumped_candidates++;
      if (newStatus === "pending_review" && existingCand.status === "mining") {
        result.promoted_to_review++;
      }
      continue;
    }

    // 신규 candidate
    const { error: insErr } = await client.from("candidate_triggers").insert({
      tool_id: toolId,
      direction: mined.direction,
      condition_pattern: mined.condition_pattern ?? null,
      goal_pattern: mined.goal_pattern ?? null,
      why: mined.why,
      embedding,
      source_log_ids: [log.id],
      occurrence_count: 1,
      similarity_to_existing: existingSim,
      status: PROMOTE_THRESHOLD <= 1 ? "pending_review" : "mining",
    });
    if (insErr) { result.errors++; continue; }
    result.new_candidates++;
    if (PROMOTE_THRESHOLD <= 1) result.promoted_to_review++;
  }

  return result;
}
