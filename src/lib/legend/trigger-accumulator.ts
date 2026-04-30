/**
 * Phase G-06 Δ23 — Trigger Auto-Accumulation.
 *
 * LLM 이 풀이 정리에서 추출한 structured_trigger { cue_a, tool_b, why_text } 를
 * 기존 DB 와 dedup 후 candidate_triggers / candidate_tools 큐에 누적한다.
 *
 * 알고리즘:
 *   1. cue_a 의 embedding 생성
 *   2. 기존 math_tool_triggers 와 cosine 비교 (≥ DEDUP_THRESHOLD)
 *      - 매칭: math_tools.hit_count++ 후 종료 (이미 cover 되는 trigger)
 *   3. 기존 candidate_triggers 와 cosine 비교 (≥ DEDUP_THRESHOLD)
 *      - 매칭: occurrence_count++ + 임계값 도달 시 status='pending_review' 자동 승격
 *   4. tool_b 매칭으로 기존 math_tools 검색 (이름 일부 매칭 또는 cosine)
 *      - 같은 도구: candidate_triggers 신규 row insert (해당 tool_id 에 새 trigger)
 *      - 새 도구: candidate_tools 신규 row insert (proposed_name=tool_b, proposed_trigger=cue_a)
 *
 * 회복 안전: 모든 단계가 throw 해도 buildReport 반환에는 영향 없음 (silent log).
 *
 * 영향 격리: src/lib/legend/. supabase service client 만 의존.
 */
import { createClient } from '@/lib/supabase/server';
import { embedText } from '@/lib/euler/embed';

const DEDUP_THRESHOLD = parseFloat(process.env.LEGEND_TRIGGER_DEDUP ?? '0.85');
const PROMOTE_THRESHOLD = parseInt(
  process.env.EULER_TRIGGER_PROMOTE_THRESHOLD ?? '5',
  10,
);

export interface AccumulateInput {
  cue_a: string;
  tool_b: string;
  why_text: string;
  /** 풀이가 발생한 user (reported_by FK) — 선택, 없으면 NULL */
  user_id?: string;
  /** problem 식별자 (source_problem_keys 누적) */
  problem_hash?: string;
}

export interface AccumulateResult {
  outcome:
    | 'matched_existing_trigger'
    | 'bumped_candidate'
    | 'promoted_candidate'
    | 'new_candidate_trigger'
    | 'new_candidate_tool'
    | 'skipped'
    | 'failed';
  detail?: string;
  matched_id?: string;
}

interface ExistingTriggerRow {
  trigger_id: string;
  tool_id: string;
  similarity: number;
}

interface CandidateTriggerRow {
  id: string;
  tool_id: string;
  occurrence_count: number;
  status: string;
  similarity: number;
}

/**
 * 1단계 — 기존 math_tool_triggers 에서 가장 가까운 trigger 1개 (forward direction).
 * 임계값 통과 시 매칭 row 정보를 반환.
 */
async function findClosestExistingTrigger(
  embedding: number[],
): Promise<ExistingTriggerRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('match_math_tool_triggers', {
      query_embedding: embedding,
      direction_filter: 'forward',
      match_count: 1,
    });
    if (error || !data || !Array.isArray(data) || data.length === 0) return null;
    const top = data[0] as { trigger_id: string; tool_id: string; similarity: number };
    if (typeof top.similarity !== 'number') return null;
    return top.similarity >= DEDUP_THRESHOLD
      ? { trigger_id: top.trigger_id, tool_id: top.tool_id, similarity: top.similarity }
      : null;
  } catch (e) {
    console.warn('[trigger-accumulator] existing match failed:', (e as Error).message);
    return null;
  }
}

/**
 * 2단계 — candidate_triggers 에서 가장 가까운 후보 1개.
 * embedding ivfflat 인덱스로 cosine top-1.
 */
async function findClosestCandidateTrigger(
  embedding: number[],
): Promise<CandidateTriggerRow | null> {
  try {
    const supabase = await createClient();
    // pgvector cosine: 1 - (embedding <=> query) = cosine similarity
    const { data, error } = await supabase
      .from('candidate_triggers')
      .select('id, tool_id, occurrence_count, status, embedding')
      .not('embedding', 'is', null)
      .limit(50); // 50개만 fetch 후 client-side cosine — ivfflat 보다 단순. 후보 풀 작음.
    if (error || !data || data.length === 0) return null;

    // client-side cosine (작은 set 기준)
    function cosine(a: number[], b: number[]): number {
      let dot = 0;
      let na = 0;
      let nb = 0;
      const len = Math.min(a.length, b.length);
      for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
      }
      const denom = Math.sqrt(na) * Math.sqrt(nb);
      return denom > 0 ? dot / denom : 0;
    }

    let best: { row: { id: string; tool_id: string; occurrence_count: number; status: string }; sim: number } | null = null;
    for (const row of data as Array<{
      id: string;
      tool_id: string;
      occurrence_count: number;
      status: string;
      embedding: number[] | string | null;
    }>) {
      const emb = Array.isArray(row.embedding)
        ? row.embedding
        : typeof row.embedding === 'string'
          ? (JSON.parse(row.embedding) as number[])
          : null;
      if (!emb) continue;
      const sim = cosine(embedding, emb);
      if (!best || sim > best.sim) {
        best = {
          row: {
            id: row.id,
            tool_id: row.tool_id,
            occurrence_count: row.occurrence_count,
            status: row.status,
          },
          sim,
        };
      }
    }
    if (!best || best.sim < DEDUP_THRESHOLD) return null;
    return { ...best.row, similarity: best.sim };
  } catch (e) {
    console.warn('[trigger-accumulator] candidate match failed:', (e as Error).message);
    return null;
  }
}

/**
 * 3단계 — tool_b 텍스트로 기존 math_tools 매칭 (이름 prefix·substring 매칭).
 * cosine 까지 가지 않고 단순 ILIKE — 도구 이름은 짧고 명확하므로 충분.
 */
async function findExistingToolByName(toolB: string): Promise<{ id: string; name: string } | null> {
  try {
    const supabase = await createClient();
    const trimmed = toolB.trim().slice(0, 60);
    if (!trimmed) return null;
    // 단순 부분일치 — 기존 도구 244개 중 이름이 30%+ 겹치면 매칭으로 간주
    const { data, error } = await supabase
      .from('math_tools')
      .select('id, name')
      .ilike('name', `%${trimmed.slice(0, 20)}%`)
      .limit(3);
    if (error || !data || data.length === 0) return null;
    return data[0] as { id: string; name: string };
  } catch (e) {
    console.warn('[trigger-accumulator] tool name match failed:', (e as Error).message);
    return null;
  }
}

async function bumpToolHitCount(toolId: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc('increment_tool_hit', { tool_id_input: toolId }).throwOnError();
  } catch {
    // RPC 없을 시 직접 update — 베스트 에포트
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('math_tools')
        .select('hit_count')
        .eq('id', toolId)
        .maybeSingle();
      if (data) {
        await supabase
          .from('math_tools')
          .update({ hit_count: ((data as { hit_count: number }).hit_count ?? 0) + 1 })
          .eq('id', toolId);
      }
    } catch {
      // ignore — accumulation 실패는 silent
    }
  }
}

async function bumpCandidateOccurrence(
  candidateId: string,
  currentCount: number,
  currentStatus: string,
  problemHash?: string,
): Promise<'bumped' | 'promoted'> {
  const supabase = await createClient();
  const newCount = currentCount + 1;
  const promote = currentStatus === 'mining' && newCount >= PROMOTE_THRESHOLD;
  const updates: Record<string, unknown> = {
    occurrence_count: newCount,
  };
  if (promote) updates.status = 'pending_review';
  await supabase.from('candidate_triggers').update(updates).eq('id', candidateId);
  if (problemHash) {
    // source_log_ids 는 uuid[] 라 problem_hash 텍스트 누적은 별도 컬럼 (notes) 활용
    await supabase
      .from('candidate_triggers')
      .update({ notes: `last_problem=${problemHash.slice(0, 16)}` })
      .eq('id', candidateId);
  }
  return promote ? 'promoted' : 'bumped';
}

async function insertCandidateTrigger(
  toolId: string,
  cueA: string,
  whyText: string,
  embedding: number[],
): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('candidate_triggers')
      .insert({
        tool_id: toolId,
        direction: 'forward',
        condition_pattern: cueA.slice(0, 240),
        why: whyText.slice(0, 400),
        embedding,
        occurrence_count: 1,
        status: 'mining',
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return (data as { id: string }).id;
  } catch (e) {
    console.warn('[trigger-accumulator] candidate trigger insert failed:', (e as Error).message);
    return null;
  }
}

async function insertCandidateTool(
  toolB: string,
  cueA: string,
  whyText: string,
  userId?: string,
  problemHash?: string,
): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('candidate_tools')
      .insert({
        proposed_name: toolB.slice(0, 200),
        proposed_trigger: cueA.slice(0, 240),
        proposed_why: whyText.slice(0, 400),
        proposed_layer: null,
        occurrence_count: 1,
        source_problem_keys: problemHash ? [problemHash.slice(0, 64)] : [],
        status: 'pending',
        ...(userId ? { reported_by: userId } : {}),
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return (data as { id: string }).id;
  } catch (e) {
    console.warn('[trigger-accumulator] candidate tool insert failed:', (e as Error).message);
    return null;
  }
}

/**
 * 메인 진입점 — buildReport 또는 build-summary route 끝에서 호출.
 * 모든 실패는 silent (학생 응답 영향 없음).
 */
export async function accumulateTrigger(
  input: AccumulateInput,
): Promise<AccumulateResult> {
  if (!input.cue_a?.trim() || !input.tool_b?.trim()) {
    return { outcome: 'skipped', detail: 'empty cue or tool' };
  }

  // 1) cue 의 embedding
  let embedding: number[] | null = null;
  try {
    embedding = await embedText(input.cue_a);
  } catch (e) {
    console.warn('[trigger-accumulator] embed failed:', (e as Error).message);
    return { outcome: 'failed', detail: 'embedding failed' };
  }
  if (!embedding) return { outcome: 'failed', detail: 'no embedding' };

  // 2) 기존 math_tool_triggers 매칭
  const existing = await findClosestExistingTrigger(embedding);
  if (existing) {
    await bumpToolHitCount(existing.tool_id);
    return {
      outcome: 'matched_existing_trigger',
      matched_id: existing.trigger_id,
      detail: `cosine=${existing.similarity.toFixed(3)}`,
    };
  }

  // 3) 기존 candidate_triggers 매칭
  const candidate = await findClosestCandidateTrigger(embedding);
  if (candidate) {
    const result = await bumpCandidateOccurrence(
      candidate.id,
      candidate.occurrence_count,
      candidate.status,
      input.problem_hash,
    );
    return {
      outcome: result === 'promoted' ? 'promoted_candidate' : 'bumped_candidate',
      matched_id: candidate.id,
      detail: `cosine=${candidate.similarity.toFixed(3)} count=${candidate.occurrence_count + 1}`,
    };
  }

  // 4) tool_b 로 기존 도구 매칭
  const tool = await findExistingToolByName(input.tool_b);
  if (tool) {
    const newId = await insertCandidateTrigger(
      tool.id,
      input.cue_a,
      input.why_text,
      embedding,
    );
    return newId
      ? { outcome: 'new_candidate_trigger', matched_id: newId, detail: `tool=${tool.id}` }
      : { outcome: 'failed', detail: 'candidate trigger insert failed' };
  }

  // 5) 새 도구 후보로 등록
  const newToolId = await insertCandidateTool(
    input.tool_b,
    input.cue_a,
    input.why_text,
    input.user_id,
    input.problem_hash,
  );
  return newToolId
    ? { outcome: 'new_candidate_tool', matched_id: newToolId }
    : { outcome: 'failed', detail: 'candidate tool insert failed' };
}
