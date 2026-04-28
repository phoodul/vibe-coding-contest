/**
 * Phase G-06 — Stage 0: similar_problems 매칭.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2.
 * - match_similar_problems RPC (match_count=1) 호출 후 클라이언트 측에서
 *   similarity ≥ threshold 필터링 (RPC 자체는 threshold 인자 없음, 마이그레이션
 *   20260428_similar_problems.sql 참고).
 * - 기존 src/lib/euler/similar-problems.ts 의 패턴을 차용 (RPC 명·반환 컬럼 동일).
 * - Stage 0 hit 시 row + trigger_labels (jsonb) → TriggerLabel[] 변환하여 반환.
 * - miss / RPC 실패 / 임베딩 누락 시 null 반환 (Stage 1 fallback).
 */
import { createClient } from '@/lib/supabase/server';
import type { TriggerLabel } from './types';

export interface SimilarProblemRow {
  id: string;
  year: number;
  type: string;
  number: number;
  problem_latex: string;
  answer: string;
  similarity: number;
}

interface RpcRow extends SimilarProblemRow {
  trigger_labels: unknown;
}

/**
 * jsonb trigger_labels → TriggerLabel[] 변환.
 * 라벨 단위 = trigger 패턴 (Tool 의 본질은 trigger when, project-decisions G-04).
 */
function normalizeTriggers(raw: unknown): TriggerLabel[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, idx): TriggerLabel[] => {
    if (!item || typeof item !== 'object') return [];
    const t = item as Record<string, unknown>;
    const tool_name =
      (typeof t.tool_hint === 'string' && t.tool_hint) ||
      (typeof t.tool_name === 'string' && t.tool_name) ||
      '도구';
    const pattern_short =
      (typeof t.condition_pattern === 'string' && t.condition_pattern) ||
      (typeof t.goal_pattern === 'string' && t.goal_pattern) ||
      (typeof t.pattern_short === 'string' && t.pattern_short) ||
      '';
    const direction =
      t.direction === 'forward' || t.direction === 'backward' || t.direction === 'both'
        ? (t.direction as 'forward' | 'backward' | 'both')
        : undefined;
    const why = typeof t.why === 'string' ? t.why : undefined;
    const trigger_id =
      (typeof t.trigger_id === 'string' && t.trigger_id) ||
      `stage0-${idx}`;
    return [
      {
        trigger_id,
        tool_name,
        pattern_short,
        direction,
        why,
      },
    ];
  });
}

export async function matchSimilarProblem(
  embedding: number[],
  threshold = 0.85,
): Promise<{ row: SimilarProblemRow; triggers: TriggerLabel[] } | null> {
  if (!embedding || embedding.length === 0) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('match_similar_problems', {
      query_embedding: embedding,
      match_count: 1,
    });
    if (error) {
      console.warn('[stage0-similar] rpc failed:', error.message);
      return null;
    }
    const rows = (data || []) as RpcRow[];
    if (!rows.length) return null;
    const top = rows[0];
    if (typeof top.similarity !== 'number' || top.similarity < threshold) return null;
    const triggers = normalizeTriggers(top.trigger_labels);
    const { trigger_labels: _omit, ...rest } = top;
    void _omit;
    return { row: rest, triggers };
  } catch (e) {
    console.warn('[stage0-similar] unexpected:', (e as Error).message);
    return null;
  }
}
