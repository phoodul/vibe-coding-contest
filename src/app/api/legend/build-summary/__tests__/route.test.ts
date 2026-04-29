/**
 * Phase G-06 G06-33 — POST /api/legend/build-summary 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized — auth.getUser 가 user=null 반환
 *   2. 400 invalid_input — problem_text 누락 / 빈 문자열
 *   3. 402 beta_only — trial 사용자 (Δ9 정책 — 풀이 정리는 베타 전용)
 *   4. 402 quota_exceeded — legend_call_daily 한도 초과
 *   5. 402 quota_exceeded — report_per_problem_daily 한도 초과
 *   6. 정상 — routeProblem → callTutor → buildReport → JSON 반환
 *   7. Tier 0/1 라우팅 → tutor='gauss' 강제 (정리 품질 ↑)
 *   8. session_id 없음 → 500 session_persist_failed
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 모킹 ──────────────────────────────────────────────────────────────
const getUserMock = vi.fn();
const callTutorMock = vi.fn();
const consumeQuotaMock = vi.fn();
const routeProblemMock = vi.fn();
const buildReportMock = vi.fn();
const getUserAccessTierMock = vi.fn(async () => 'beta' as const);

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock('@/lib/legend/tutor-orchestrator', () => ({
  callTutor: (...args: unknown[]) => callTutorMock(...args),
}));

vi.mock('@/lib/legend/quota-manager', () => ({
  consumeQuota: (...args: unknown[]) => consumeQuotaMock(...args),
}));

vi.mock('@/lib/legend/legend-router', () => ({
  routeProblem: (...args: unknown[]) => routeProblemMock(...args),
}));

vi.mock('@/lib/legend/report/report-builder', () => ({
  buildReport: (...args: unknown[]) => buildReportMock(...args),
}));

vi.mock('@/lib/legend/access-tier', () => ({
  getUserAccessTier: (...args: unknown[]) => getUserAccessTierMock(...args),
}));

import { POST } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  callTutorMock.mockReset();
  consumeQuotaMock.mockReset();
  routeProblemMock.mockReset();
  buildReportMock.mockReset();
  getUserAccessTierMock.mockReset();
  getUserAccessTierMock.mockResolvedValue('beta');
});

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/legend/build-summary', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/legend/build-summary', () => {
  it('미인증 시 401 unauthorized', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeReq({ problem_text: 'x^2-4=0' }));

    expect(res.status).toBe(401);
    expect(routeProblemMock).not.toHaveBeenCalled();
    expect(callTutorMock).not.toHaveBeenCalled();
    expect(buildReportMock).not.toHaveBeenCalled();
  });

  it('problem_text 누락 시 400 invalid_input', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'invalid_input' });
  });

  it('problem_text 빈 문자열 시 400 invalid_input', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res = await POST(makeReq({ problem_text: '   ' }));
    expect(res.status).toBe(400);
    expect(routeProblemMock).not.toHaveBeenCalled();
  });

  it('trial 사용자 시 402 beta_only + apply_url', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u-trial' } } });
    getUserAccessTierMock.mockResolvedValue('trial');

    const res = await POST(makeReq({ problem_text: 'x^2-4=0' }));

    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe('beta_only');
    expect(body.apply_url).toBe('/legend/beta/apply');
    expect(consumeQuotaMock).not.toHaveBeenCalled();
    expect(routeProblemMock).not.toHaveBeenCalled();
  });

  it('legend_call_daily quota 초과 시 402 quota_exceeded', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    consumeQuotaMock.mockResolvedValueOnce({
      kind: 'legend_call_daily',
      used: 3,
      limit: 3,
      allowed: false,
      blocked_reason: 'limit_exceeded',
      reset_at: 'x',
    });

    const res = await POST(makeReq({ problem_text: 'x^2-4=0' }));

    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe('quota_exceeded');
    expect(body.quota.kind).toBe('legend_call_daily');
    expect(routeProblemMock).not.toHaveBeenCalled();
  });

  it('report_per_problem_daily quota 초과 시 402 quota_exceeded', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    consumeQuotaMock
      .mockResolvedValueOnce({
        kind: 'legend_call_daily',
        used: 1,
        limit: 3,
        allowed: true,
        reset_at: 'x',
      })
      .mockResolvedValueOnce({
        kind: 'report_per_problem_daily',
        used: 1,
        limit: 1,
        allowed: false,
        blocked_reason: 'limit_exceeded',
        reset_at: 'x',
      });

    const res = await POST(makeReq({ problem_text: 'x^2-4=0' }));

    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe('quota_exceeded');
    expect(body.quota.kind).toBe('report_per_problem_daily');
    expect(routeProblemMock).not.toHaveBeenCalled();
  });

  it('정상 — routeProblem → callTutor → buildReport → JSON 반환', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    consumeQuotaMock
      .mockResolvedValueOnce({ kind: 'legend_call_daily', used: 1, limit: 3, allowed: true, reset_at: 'x' })
      .mockResolvedValueOnce({ kind: 'report_per_problem_daily', used: 1, limit: 1, allowed: true, reset_at: 'x' });
    routeProblemMock.mockResolvedValue({
      stage_reached: 1,
      routed_tier: 2,
      routed_tutor: 'gauss',
      routing_decision_id: 'rd-1',
      duration_ms: 200,
    });
    callTutorMock.mockResolvedValue({
      session_id: 'sess-1',
      trace_jsonb: { turns: [] },
      final_answer: '42',
      duration_ms: 5000,
      actual_tutor: 'gauss',
    });
    const mockReport = {
      schema_version: '1.3',
      problem_summary: { text_short: 'x^2-4=0', area: 'algebra', difficulty: 4 },
      tutor: { name: 'gauss', label_ko: '가우스', model_short: 'Gemini 3.1 Pro' },
      steps: [],
      pivotal_step_index: 0,
      trigger_summary: { primary: {}, expansions: [] },
      stuck_signals: { layer: null, reason: null, user_stuck_ms_total: 0, revisited_step_indices: [] },
      llm_struggle_summary: {
        hardest_step_index: 0,
        hardest_step_ms: 0,
        total_turns: 0,
        total_tool_retries: 0,
        resolution_narrative: '',
      },
      reasoning_tree: { schema_version: '1.0', root_id: 'answer', nodes: [], edges: [], conditions: [], depth_max: 0, node_count: 0 },
      solution_summary: {
        core_insight: '핵심',
        step_flow_narrative: '흐름',
        hardest_resolution: '어려움',
        generalization: '일반화',
        trigger_motivation: '떠올린 이유',
      },
    };
    buildReportMock.mockResolvedValue(mockReport);

    const res = await POST(makeReq({ problem_text: 'x^2-4=0' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.session_id).toBe('sess-1');
    expect(body.actual_tutor).toBe('gauss');
    expect(body.routing_decision_id).toBe('rd-1');
    expect(body.report.schema_version).toBe('1.3');
    expect(body.report.solution_summary.trigger_motivation).toBe('떠올린 이유');

    expect(consumeQuotaMock).toHaveBeenCalledTimes(2);
    expect(routeProblemMock).toHaveBeenCalledTimes(1);
    expect(callTutorMock).toHaveBeenCalledTimes(1);
    expect(buildReportMock).toHaveBeenCalledTimes(1);
  });

  it('Tier 0/1 라우팅 시 tutor=gauss 강제 (정리 품질)', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    consumeQuotaMock
      .mockResolvedValueOnce({ kind: 'legend_call_daily', used: 1, limit: 3, allowed: true, reset_at: 'x' })
      .mockResolvedValueOnce({ kind: 'report_per_problem_daily', used: 1, limit: 1, allowed: true, reset_at: 'x' });
    routeProblemMock.mockResolvedValue({
      stage_reached: 1,
      routed_tier: 1,
      routed_tutor: 'ramanujan_intuit', // Tier 1 — 강제 gauss 로 변경되어야 함
      routing_decision_id: 'rd-2',
      duration_ms: 200,
    });
    callTutorMock.mockResolvedValue({
      session_id: 'sess-2',
      trace_jsonb: { turns: [] },
      final_answer: '7',
      duration_ms: 5000,
      actual_tutor: 'gauss',
    });
    buildReportMock.mockResolvedValue({
      schema_version: '1.3',
      tutor: { name: 'gauss', label_ko: '가우스', model_short: 'Gemini 3.1 Pro' },
      solution_summary: {
        core_insight: 'a',
        step_flow_narrative: 'b',
        hardest_resolution: 'c',
        generalization: 'd',
        trigger_motivation: 'e',
      },
    });

    const res = await POST(makeReq({ problem_text: '간단한 문제' }));

    expect(res.status).toBe(200);
    // callTutor 호출 인자 검증 — tutor='gauss' 강제
    expect(callTutorMock).toHaveBeenCalledTimes(1);
    const callArg = callTutorMock.mock.calls[0][0];
    expect(callArg.tutor).toBe('gauss');
  });

  it('callTutor session_id 없음 → 500 session_persist_failed', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    consumeQuotaMock
      .mockResolvedValueOnce({ kind: 'legend_call_daily', used: 1, limit: 3, allowed: true, reset_at: 'x' })
      .mockResolvedValueOnce({ kind: 'report_per_problem_daily', used: 1, limit: 1, allowed: true, reset_at: 'x' });
    routeProblemMock.mockResolvedValue({
      stage_reached: 2,
      routed_tier: 2,
      routed_tutor: 'gauss',
      routing_decision_id: 'rd-3',
      duration_ms: 200,
    });
    callTutorMock.mockResolvedValue({
      session_id: '', // DB insert 실패 시
      trace_jsonb: { turns: [] },
      final_answer: '0',
      duration_ms: 5000,
    });

    const res = await POST(makeReq({ problem_text: 'x' }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('session_persist_failed');
    expect(buildReportMock).not.toHaveBeenCalled();
  });

  it('callTutor throw → 500 build_summary_failed', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    consumeQuotaMock
      .mockResolvedValueOnce({ kind: 'legend_call_daily', used: 1, limit: 3, allowed: true, reset_at: 'x' })
      .mockResolvedValueOnce({ kind: 'report_per_problem_daily', used: 1, limit: 1, allowed: true, reset_at: 'x' });
    routeProblemMock.mockResolvedValue({
      stage_reached: 2,
      routed_tier: 2,
      routed_tutor: 'gauss',
      routing_decision_id: 'rd-4',
      duration_ms: 200,
    });
    callTutorMock.mockRejectedValue(new Error('gemini 429'));

    const res = await POST(makeReq({ problem_text: 'x' }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('build_summary_failed');
    expect(body.message).toContain('gemini 429');
  });
});
