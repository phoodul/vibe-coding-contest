/**
 * Phase G-06 G06-15 — 학생 stuck 누적 + 집계 + reason 추론.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §5.1 (StuckSnapshot) +
 *             §5.2 (stuck-tracker 알고리즘) + docs/implementation_plan_g06.md §G06-15.
 *
 * 알고리즘:
 *   - recordStuck(session_id, step_index, delta_*): 현재 row 의 user_stuck_ms /
 *     user_revisit_count 를 읽고 delta 만큼 더해서 update. row 가 없으면 0 base.
 *     (insert 는 step-decomposer 가 담당 — 본 모듈은 update 전용)
 *   - aggregateStuck(session_id): step 전체 스냅샷 + reason 휴리스틱.
 *   - inferStuckReason: step_kind + trigger_id/tool_id null 여부 + revisit > 0 으로 reason 분류.
 *
 * 영향 격리: src/lib/legend/report/ 전용. supabase 만 import.
 */

import { createClient } from '@/lib/supabase/server';

// ────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────

export type StuckReason =
  | 'tool_recall_miss'
  | 'tool_trigger_miss'
  | 'computation_error'
  | 'forward_dead_end'
  | 'backward_dead_end'
  | 'parse_failure';

export interface StuckSnapshot {
  step_index: number;
  user_stuck_ms: number;
  revisit_count: number;
  layer?: number;
  reason?: StuckReason;
}

export interface RecordStuckArgs {
  session_id: string;
  step_index: number;
  delta_stuck_ms: number;
  delta_revisits: number;
}

interface DecompRow {
  step_index: number;
  user_stuck_ms: number | null;
  user_revisit_count: number | null;
  step_kind: string | null;
  trigger_id: string | null;
  tool_id: string | null;
}

const STUCK_MS_FLOOR = 5000;

// ────────────────────────────────────────────────────────────────────────────
// recordStuck
// ────────────────────────────────────────────────────────────────────────────

export async function recordStuck(args: RecordStuckArgs): Promise<void> {
  const { session_id, step_index, delta_stuck_ms, delta_revisits } = args;
  if (!session_id) throw new Error('session_id required');
  if (typeof step_index !== 'number' || step_index < 0) {
    throw new Error('step_index must be non-negative number');
  }
  const dStuck = Math.max(0, Math.floor(delta_stuck_ms ?? 0));
  const dRevisit = Math.max(0, Math.floor(delta_revisits ?? 0));
  if (dStuck === 0 && dRevisit === 0) return;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from('solve_step_decomposition')
    .select('user_stuck_ms, user_revisit_count')
    .eq('session_id', session_id)
    .eq('step_index', step_index)
    .maybeSingle();

  const currentStuck = row?.user_stuck_ms ?? 0;
  const currentRevisit = row?.user_revisit_count ?? 0;

  const { error } = await supabase
    .from('solve_step_decomposition')
    .update({
      user_stuck_ms: currentStuck + dStuck,
      user_revisit_count: currentRevisit + dRevisit,
    })
    .eq('session_id', session_id)
    .eq('step_index', step_index);

  if (error) {
    throw new Error(`recordStuck update failed: ${error.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// inferStuckReason — 휴리스틱
// ────────────────────────────────────────────────────────────────────────────

export function inferStuckReason(row: DecompRow): StuckReason | undefined {
  const stuckMs = row.user_stuck_ms ?? 0;
  const revisits = row.user_revisit_count ?? 0;

  // 무의미한 움직임은 reason 없음
  if (revisits === 0 && stuckMs < STUCK_MS_FLOOR) return undefined;

  const kind = row.step_kind ?? '';

  // tool_call: trigger 매칭 실패 → 학생이 어떤 도구가 필요한지 자체를 못 짚은 신호
  if (kind === 'tool_call') {
    if (!row.trigger_id) return 'tool_trigger_miss';
    if (!row.tool_id) return 'tool_recall_miss';
  }

  if (kind === 'forward') return 'forward_dead_end';
  if (kind === 'backward') return 'backward_dead_end';
  if (kind === 'computation') return 'computation_error';
  if (kind === 'parse') return 'parse_failure';

  return undefined;
}

// ────────────────────────────────────────────────────────────────────────────
// aggregateStuck
// ────────────────────────────────────────────────────────────────────────────

export async function aggregateStuck(session_id: string): Promise<StuckSnapshot[]> {
  if (!session_id) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('solve_step_decomposition')
    .select('step_index, user_stuck_ms, user_revisit_count, step_kind, trigger_id, tool_id')
    .eq('session_id', session_id)
    .order('step_index', { ascending: true });
  if (error) throw new Error(`aggregateStuck failed: ${error.message}`);

  const rows = (data ?? []) as DecompRow[];
  return rows.map((r) => ({
    step_index: r.step_index,
    user_stuck_ms: r.user_stuck_ms ?? 0,
    revisit_count: r.user_revisit_count ?? 0,
    reason: inferStuckReason(r),
  }));
}
