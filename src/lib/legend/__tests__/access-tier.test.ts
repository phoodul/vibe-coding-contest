/**
 * Phase G-06 G06-32 (Δ9) — getUserAccessTier 단위 테스트.
 *
 * 시나리오:
 *   1. beta_applications.status='approved' 매칭 → 'beta'
 *   2. euler_beta_invites.redeemed_by 매칭 (status check 무관) → 'beta'
 *   3. 두 테이블 모두 row 없음 → 'trial'
 *   4. 빈 userId → 'trial' (defensive)
 *   5. beta_applications 조회 우선 (단락 평가 — invite 조회 호출 안 됨)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 모킹 ────────────────────────────────────────────────────────────

interface MockRow {
  id?: string;
  status?: string;
}

const state = {
  betaAppRow: null as MockRow | null,
  inviteRow: null as MockRow | null,
  /** 호출 추적 */
  fromCalls: [] as string[],
};

function makeQueryChain(table: string) {
  // .select(...).eq(...).eq(...).maybeSingle()  또는
  // .select(...).eq(...).maybeSingle()
  state.fromCalls.push(table);

  const eqRet = (col: string, val: unknown) => {
    return {
      eq: eqRet,
      maybeSingle: async () => {
        if (table === 'beta_applications') {
          return { data: state.betaAppRow, error: null };
        }
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
  // G06-32 (Δ9) — access-tier 자체가 admin 이메일 가드용 auth.getUser 호출.
  // 기본은 비-관리자 (정상 tier 흐름).
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
  state.betaAppRow = null;
  state.inviteRow = null;
  state.fromCalls = [];
  supabaseMock.from.mockClear();
});

const USER_ID = '00000000-0000-0000-0000-000000000001';

describe('getUserAccessTier', () => {
  it('beta_applications.status=approved → beta', async () => {
    state.betaAppRow = { status: 'approved' };
    state.inviteRow = null;
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('beta');
    // 단락 평가 — invite 조회 안 함
    expect(state.fromCalls).toEqual(['beta_applications']);
  });

  it('beta_applications 없고 euler_beta_invites 매칭 → beta (기존 EULER2026 사용자)', async () => {
    state.betaAppRow = null;
    state.inviteRow = { id: 'invite-1' };
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('beta');
    expect(state.fromCalls).toEqual(['beta_applications', 'euler_beta_invites']);
  });

  it('두 테이블 모두 row 없음 → trial', async () => {
    state.betaAppRow = null;
    state.inviteRow = null;
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('trial');
    expect(state.fromCalls).toEqual(['beta_applications', 'euler_beta_invites']);
  });

  it('빈 userId → trial (defensive)', async () => {
    const tier = await getUserAccessTier('');
    expect(tier).toBe('trial');
    // 빈 userId 는 즉시 반환 — Supabase 호출 안 함
    expect(state.fromCalls).toEqual([]);
  });

  it('회귀: 기존 베타 사용자 (invite redeemed_by) 가 beta_applications 없어도 beta 판정', async () => {
    // 60명 베타 baseline 사용자 시나리오 — 신청서 안 냈지만 EULER2026 코드로 redeemed.
    state.betaAppRow = null;
    state.inviteRow = { id: 'baseline-invite' };
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('beta');
  });

  it('beta_applications.status=pending 은 approved 가 아니므로 invite 조회로 진행', async () => {
    // .eq('status', 'approved') 가 server 측 필터 — pending row 는 maybeSingle 결과 null.
    // 본 테스트는 pending 사용자가 invite 도 없으면 trial 임을 확인.
    state.betaAppRow = null; // server filter status=approved 결과 null
    state.inviteRow = null;
    const tier = await getUserAccessTier(USER_ID);
    expect(tier).toBe('trial');
  });
});
