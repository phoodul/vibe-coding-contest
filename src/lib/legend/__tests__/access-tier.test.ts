/**
 * Phase G-06 G06-32 (Δ9) + Δ28 — getUserAccessTier 단위 테스트.
 *
 * Δ28 — 30일 만료 정책 도입. invites 단일 경로 + expires_at 검사.
 *
 * 시나리오:
 *   1. invites status=active + expires_at 미래 → 'beta'
 *   2. invites status=active + expires_at 과거 → 'trial' (만료)
 *   3. invites status=active + expires_at NULL → 'beta' (legacy 보존)
 *   4. invites row 없음 → 'trial'
 *   5. 빈 userId → 'trial' (defensive)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

interface MockRow {
  user_id?: string;
  status?: string;
  expires_at?: string | null;
}

const state = {
  inviteRow: null as MockRow | null,
  fromCalls: [] as string[],
};

function makeQueryChain(table: string) {
  state.fromCalls.push(table);

  const eqRet = (_col: string, _val: unknown) => {
    return {
      eq: eqRet,
      maybeSingle: async () => {
        if (table === 'euler_beta_invites') {
          return { data: state.inviteRow, error: null };
        }
        return { data: null, error: null };
      },
    };
  };

  return {
    select: (_cols: string) => ({ eq: eqRet }),
  };
}

const supabaseMock = {
  auth: {
    getUser: vi.fn(async () => ({ data: { user: { email: 'student@example.com' } } })),
  },
  from: vi.fn((table: string) => makeQueryChain(table)),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => supabaseMock,
}));

import { getUserAccessTier } from '../access-tier';

beforeEach(() => {
  state.inviteRow = null;
  state.fromCalls = [];
  supabaseMock.from.mockClear();
});

const USER_ID = '00000000-0000-0000-0000-000000000001';

describe('getUserAccessTier', () => {
  it('invites active + expires_at 미래 → beta', async () => {
    const future = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
    state.inviteRow = { user_id: USER_ID, status: 'active', expires_at: future };
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('beta');
    expect(state.fromCalls).toEqual(['euler_beta_invites']);
  });

  it('invites active + expires_at 과거 → trial (만료 자동 강등)', async () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    state.inviteRow = { user_id: USER_ID, status: 'active', expires_at: past };
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('trial');
  });

  it('invites active + expires_at NULL → beta (legacy 보존)', async () => {
    state.inviteRow = { user_id: USER_ID, status: 'active', expires_at: null };
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('beta');
  });

  it('invites row 없음 → trial', async () => {
    state.inviteRow = null;
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('trial');
    expect(state.fromCalls).toEqual(['euler_beta_invites']);
  });

  it('빈 userId → trial (defensive, 즉시 반환)', async () => {
    const tier = await getUserAccessTier('');
    expect(tier).toBe('trial');
    expect(state.fromCalls).toEqual([]);
  });
});
