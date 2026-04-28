/**
 * Phase G-06 G06-15 — stuck-tracker 단위 테스트.
 *
 * 시나리오:
 *   - recordStuck delta 누적 update
 *   - row 없을 때 0 base 로 update
 *   - aggregateStuck 정렬 + reason 휴리스틱
 *   - inferStuckReason: kind 별 / null trigger 별
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const updateMock = vi.fn();
const fromBuilder = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (...args: unknown[]) => fromBuilder(...args),
  }),
}));

import { recordStuck, aggregateStuck, inferStuckReason } from '../stuck-tracker';

interface CurrentRow {
  user_stuck_ms: number | null;
  user_revisit_count: number | null;
}

interface AggRow {
  step_index: number;
  user_stuck_ms: number | null;
  user_revisit_count: number | null;
  step_kind: string;
  trigger_id: string | null;
  tool_id: string | null;
}

const state: {
  current: CurrentRow | null;
  agg: AggRow[];
  selectError?: { message: string } | null;
  updateError?: { message: string } | null;
} = { current: null, agg: [] };

beforeEach(() => {
  updateMock.mockReset();
  fromBuilder.mockReset();
  state.current = null;
  state.agg = [];
  state.selectError = null;
  state.updateError = null;

  fromBuilder.mockImplementation((table: string) => {
    if (table !== 'solve_step_decomposition') {
      throw new Error(`unexpected table ${table}`);
    }
    return {
      select: () => ({
        // recordStuck 의 select chain (eq → eq → maybeSingle)
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: state.current, error: null }),
          }),
          // aggregateStuck 의 select chain (eq → order)
          order: () => ({ data: state.agg, error: state.selectError ?? null }),
        }),
      }),
      update: (payload: unknown) => {
        updateMock(payload);
        return {
          eq: () => ({
            eq: async () => ({ error: state.updateError ?? null }),
          }),
        };
      },
    };
  });
});

describe('recordStuck', () => {
  it('delta_stuck_ms 누적 update', async () => {
    state.current = { user_stuck_ms: 1000, user_revisit_count: 0 };
    await recordStuck({
      session_id: 'sess-1',
      step_index: 2,
      delta_stuck_ms: 500,
      delta_revisits: 0,
    });
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock.mock.calls[0][0]).toEqual({
      user_stuck_ms: 1500,
      user_revisit_count: 0,
    });
  });

  it('delta_revisits 누적 update', async () => {
    state.current = { user_stuck_ms: 0, user_revisit_count: 2 };
    await recordStuck({
      session_id: 'sess-1',
      step_index: 0,
      delta_stuck_ms: 0,
      delta_revisits: 1,
    });
    expect(updateMock.mock.calls[0][0]).toEqual({
      user_stuck_ms: 0,
      user_revisit_count: 3,
    });
  });

  it('row 없을 때 0 base 로 update', async () => {
    state.current = null;
    await recordStuck({
      session_id: 'sess-1',
      step_index: 0,
      delta_stuck_ms: 800,
      delta_revisits: 1,
    });
    expect(updateMock.mock.calls[0][0]).toEqual({
      user_stuck_ms: 800,
      user_revisit_count: 1,
    });
  });

  it('delta 모두 0 이면 update 호출 안 함 (no-op)', async () => {
    await recordStuck({
      session_id: 'sess-1',
      step_index: 0,
      delta_stuck_ms: 0,
      delta_revisits: 0,
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('session_id 없으면 throw', async () => {
    await expect(
      recordStuck({
        session_id: '',
        step_index: 0,
        delta_stuck_ms: 100,
        delta_revisits: 0,
      }),
    ).rejects.toThrow(/session_id/);
  });

  it('update error 시 throw', async () => {
    state.updateError = { message: 'permission denied' };
    state.current = { user_stuck_ms: 0, user_revisit_count: 0 };
    await expect(
      recordStuck({
        session_id: 'sess-1',
        step_index: 0,
        delta_stuck_ms: 100,
        delta_revisits: 0,
      }),
    ).rejects.toThrow(/permission denied/);
  });
});

describe('inferStuckReason', () => {
  it('tool_call + trigger_id null → tool_trigger_miss', () => {
    expect(
      inferStuckReason({
        step_index: 0,
        user_stuck_ms: 8000,
        user_revisit_count: 0,
        step_kind: 'tool_call',
        trigger_id: null,
        tool_id: 'TOOL_A',
      }),
    ).toBe('tool_trigger_miss');
  });

  it('tool_call + tool_id null → tool_recall_miss', () => {
    expect(
      inferStuckReason({
        step_index: 0,
        user_stuck_ms: 8000,
        user_revisit_count: 0,
        step_kind: 'tool_call',
        trigger_id: 'trig-1',
        tool_id: null,
      }),
    ).toBe('tool_recall_miss');
  });

  it('backward + revisit > 0 → backward_dead_end', () => {
    expect(
      inferStuckReason({
        step_index: 1,
        user_stuck_ms: 0,
        user_revisit_count: 3,
        step_kind: 'backward',
        trigger_id: 'trig-1',
        tool_id: 'TOOL_A',
      }),
    ).toBe('backward_dead_end');
  });

  it('forward + stuck_ms 큰 값 → forward_dead_end', () => {
    expect(
      inferStuckReason({
        step_index: 0,
        user_stuck_ms: 12000,
        user_revisit_count: 0,
        step_kind: 'forward',
        trigger_id: null,
        tool_id: null,
      }),
    ).toBe('forward_dead_end');
  });

  it('computation + revisit > 0 → computation_error', () => {
    expect(
      inferStuckReason({
        step_index: 0,
        user_stuck_ms: 0,
        user_revisit_count: 2,
        step_kind: 'computation',
        trigger_id: null,
        tool_id: null,
      }),
    ).toBe('computation_error');
  });

  it('parse + revisit > 0 → parse_failure', () => {
    expect(
      inferStuckReason({
        step_index: 0,
        user_stuck_ms: 0,
        user_revisit_count: 2,
        step_kind: 'parse',
        trigger_id: null,
        tool_id: null,
      }),
    ).toBe('parse_failure');
  });

  it('stuck_ms < 5000 + revisit 0 → reason undefined', () => {
    expect(
      inferStuckReason({
        step_index: 0,
        user_stuck_ms: 3000,
        user_revisit_count: 0,
        step_kind: 'forward',
        trigger_id: null,
        tool_id: null,
      }),
    ).toBeUndefined();
  });

  it('verify / answer / domain_id 등 → reason undefined (휴리스틱 미적용)', () => {
    expect(
      inferStuckReason({
        step_index: 0,
        user_stuck_ms: 9000,
        user_revisit_count: 1,
        step_kind: 'verify',
        trigger_id: null,
        tool_id: null,
      }),
    ).toBeUndefined();
  });
});

describe('aggregateStuck', () => {
  it('session 의 모든 step 반환 (step_index 정렬)', async () => {
    state.agg = [
      {
        step_index: 0,
        user_stuck_ms: 0,
        user_revisit_count: 0,
        step_kind: 'parse',
        trigger_id: null,
        tool_id: null,
      },
      {
        step_index: 1,
        user_stuck_ms: 7000,
        user_revisit_count: 1,
        step_kind: 'tool_call',
        trigger_id: null,
        tool_id: 'TOOL_A',
      },
      {
        step_index: 2,
        user_stuck_ms: 12000,
        user_revisit_count: 2,
        step_kind: 'backward',
        trigger_id: 'trig-x',
        tool_id: 'TOOL_B',
      },
    ];
    const snaps = await aggregateStuck('sess-1');
    expect(snaps).toHaveLength(3);
    expect(snaps.map((s) => s.step_index)).toEqual([0, 1, 2]);
    expect(snaps[0].reason).toBeUndefined(); // parse + 0,0 → 무신호
    expect(snaps[1].reason).toBe('tool_trigger_miss'); // tool_call + trigger_id null
    expect(snaps[2].reason).toBe('backward_dead_end'); // backward + revisit > 0
    expect(snaps[2].user_stuck_ms).toBe(12000);
    expect(snaps[2].revisit_count).toBe(2);
  });

  it('빈 session_id → 빈 배열', async () => {
    const snaps = await aggregateStuck('');
    expect(snaps).toEqual([]);
  });

  it('null user_stuck_ms / null revisit_count → 0 정규화', async () => {
    state.agg = [
      {
        step_index: 0,
        user_stuck_ms: null,
        user_revisit_count: null,
        step_kind: 'forward',
        trigger_id: null,
        tool_id: null,
      },
    ];
    const snaps = await aggregateStuck('sess-1');
    expect(snaps[0].user_stuck_ms).toBe(0);
    expect(snaps[0].revisit_count).toBe(0);
    expect(snaps[0].reason).toBeUndefined();
  });

  it('select error 시 throw', async () => {
    state.selectError = { message: 'rls denied' };
    await expect(aggregateStuck('sess-1')).rejects.toThrow(/rls denied/);
  });
});
