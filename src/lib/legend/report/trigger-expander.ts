/**
 * Phase G-06 G06-15 — primary trigger 기반 trigger expansion 카드 생성.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §5.2 (trigger-expander 알고리즘) +
 *             §5.1 (TriggerCard schema) + docs/implementation_plan_g06.md §G06-15.
 *
 * 알고리즘:
 *   1. primary_trigger_id 로 math_tool_triggers (+ math_tools join) 조회
 *   2. trigger_condition (forward) / goal_pattern (backward) 텍스트 임베딩
 *   3. match_math_tool_triggers RPC (cosine ≥ 0.7) top-K
 *   4. exclude_tool_id 의 도구 제외 + primary trigger 자기 자신 제외
 *   5. similar_problems.trigger_labels jsonb 에서 같은 trigger.why 보유 1건 →
 *      example_problem_ref 채움
 *   6. 최대 3 카드 반환
 *
 * 영향 격리: src/lib/legend/report/ 전용. retriever/embed 패턴 차용 (RPC 시그니처 동일).
 */

import { createClient } from '@/lib/supabase/server';
import { embedText } from '@/lib/euler/embed';
import type { TriggerCard } from '@/lib/legend/types';

// G06-35d (Δ12): 0.7 → 0.5 — 베타 결함 4. 임베딩 유사도 의미 손실 보정 위해
// 회수율 우선. exclude_tool_id + 자기 자신 제외 후 max_count 채우기 어려운 시나리오 완화.
const EXPAND_THRESHOLD = 0.5;
const DEFAULT_MAX = 3;
/** RPC over-fetch — exclude 후에도 max_count 채울 수 있도록 여유분 */
const OVER_FETCH = 8;

interface TriggerRow {
  id: string;
  tool_id: string;
  direction: 'forward' | 'backward' | 'both';
  trigger_condition: string;
  derived_fact: string | null;
  goal_pattern: string | null;
  why_text: string;
  math_tools?: { id: string; name: string } | null;
}

interface RpcRow {
  trigger_id: string;
  tool_id: string;
  direction: 'forward' | 'backward' | 'both';
  trigger_condition: string;
  derived_fact: string | null;
  goal_pattern: string | null;
  why_text: string;
  tool_name: string;
  tool_layer: number;
  tool_weight: number;
  similarity: number;
}

// ────────────────────────────────────────────────────────────────────────────
// primary trigger 조회
// ────────────────────────────────────────────────────────────────────────────

async function fetchPrimary(
  supabase: any,
  primary_trigger_id: string,
): Promise<TriggerRow | null> {
  const { data, error } = await supabase
    .from('math_tool_triggers')
    .select('id, tool_id, direction, trigger_condition, derived_fact, goal_pattern, why_text, math_tools(id, name)')
    .eq('id', primary_trigger_id)
    .maybeSingle();
  if (error || !data) return null;
  return data as TriggerRow;
}

// ────────────────────────────────────────────────────────────────────────────
// example_problem_ref — similar_problems.trigger_labels jsonb 매칭
// ────────────────────────────────────────────────────────────────────────────

/**
 * trigger_labels jsonb 는 [{direction, condition_pattern?, goal_pattern?, why, tool_hint?}]
 * 같은 why_text + (tool_hint == tool_id) 보유한 가장 신선한 1건을 example 로 채택.
 */
async function fetchExampleProblem(
  supabase: any,
  why_text: string,
  tool_id: string,
): Promise<TriggerCard['example_problem_ref']> {
  if (!why_text || !tool_id) return undefined;
  try {
    // jsonb contains: trigger_labels @> '[{"why": "...", "tool_hint": "..."}]'
    const needle = JSON.stringify([{ why: why_text, tool_hint: tool_id }]);
    const { data } = await supabase
      .from('similar_problems')
      .select('year, type, number')
      .filter('trigger_labels', 'cs', needle)
      .order('year', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return undefined;
    return { year: data.year as number, type: data.type as string, number: data.number as number };
  } catch {
    return undefined;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 메인
// ────────────────────────────────────────────────────────────────────────────

export async function expandTrigger(
  primary_trigger_id: string,
  exclude_tool_id?: string,
  max_count: number = DEFAULT_MAX,
): Promise<TriggerCard[]> {
  if (!primary_trigger_id) return [];
  const supabase = await createClient();

  // 1. primary 조회
  const primary = await fetchPrimary(supabase, primary_trigger_id);
  if (!primary) return [];

  // 2. 임베딩 query 텍스트 — direction 에 따라 trigger_condition / goal_pattern
  const queryText = (
    primary.direction === 'backward' && primary.goal_pattern
      ? primary.goal_pattern
      : primary.trigger_condition
  )?.trim();
  if (!queryText) return [];

  let embedding: number[];
  try {
    embedding = await embedText(queryText);
  } catch {
    return [];
  }
  if (!embedding || embedding.length === 0) return [];

  // 3. ANN top-K (over-fetch)
  const directionFilter =
    primary.direction === 'forward' || primary.direction === 'backward'
      ? primary.direction
      : 'both';
  const { data: rpcData, error: rpcErr } = await supabase.rpc('match_math_tool_triggers', {
    query_embedding: embedding,
    direction_filter: directionFilter,
    match_count: Math.max(max_count + OVER_FETCH, OVER_FETCH),
  });
  if (rpcErr || !rpcData) return [];
  const candidates = (rpcData ?? []) as RpcRow[];

  // 4. 필터: 자기 자신 + exclude_tool_id + similarity 임계
  const filtered = candidates
    .filter((c) => c.trigger_id !== primary_trigger_id)
    .filter((c) => !exclude_tool_id || c.tool_id !== exclude_tool_id)
    .filter((c) => typeof c.similarity === 'number' && c.similarity >= EXPAND_THRESHOLD)
    .slice(0, max_count);

  // 5. example_problem_ref 매핑
  const cards: TriggerCard[] = await Promise.all(
    filtered.map(async (c) => {
      const example = await fetchExampleProblem(supabase, c.why_text, c.tool_id);
      const pattern_short = (
        c.direction === 'backward' && c.goal_pattern ? c.goal_pattern : c.trigger_condition
      ) ?? '';
      return {
        trigger_id: c.trigger_id,
        tool_name: c.tool_name ?? '',
        direction: c.direction,
        pattern_short: pattern_short.slice(0, 80),
        why_text: c.why_text ?? '',
        example_problem_ref: example,
      };
    }),
  );

  return cards;
}
