/**
 * Phase G-06 G06-16 — GET /api/legend/report/[sessionId] 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized
 *   2. 404 session_not_found
 *   3. 403 session 의 user_id 불일치
 *   4. 캐시 hit + If-None-Match 일치 → 304
 *   5. 캐시 hit + 미일치 → 200 + report + ETag
 *   6. 캐시 miss + problem_text 누락 → 422
 *   7. 캐시 miss + problem_text 존재 → buildReport 호출 + 200
 *   8. 캐시 miss + quota 차단 → 402
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const sessionRow: { value: { user_id: string } | null } = { value: null };
const cachedRow: { value: { report_jsonb: unknown; generated_at: string } | null } = { value: null };
const freshGeneratedAt = '2026-04-28T12:00:00.000Z';
const buildReportMock = vi.fn();
const consumeQuotaMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: (table: string) => {
      if (table === 'legend_tutor_sessions') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: sessionRow.value, error: null }),
            }),
          }),
        };
      }
      if (table === 'per_problem_reports') {
        // First call returns cachedRow, subsequent (freshRow lookup after build) returns generated_at
        return {
          select: (cols: string) => ({
            eq: () => ({
              maybeSingle: async () => {
                if (cols.includes('report_jsonb')) {
                  return { data: cachedRow.value, error: null };
                }
                return { data: { generated_at: freshGeneratedAt }, error: null };
              },
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
        }),
      };
    },
  }),
}));

vi.mock('@/lib/legend/report/report-builder', () => ({
  buildReport: (...args: unknown[]) => buildReportMock(...args),
}));

vi.mock('@/lib/legend/quota-manager', () => ({
  consumeQuota: (...args: unknown[]) => consumeQuotaMock(...args),
}));

import { GET } from '../route';

const SESSION_ID = '00000000-0000-0000-0000-000000000123';

function makeReq(opts?: { ifNoneMatch?: string; problemText?: string }): Request {
  const url = new URL(
    `http://localhost/api/legend/report/${SESSION_ID}${
      opts?.problemText ? `?problem_text=${encodeURIComponent(opts.problemText)}` : ''
    }`,
  );
  const headers = new Headers();
  if (opts?.ifNoneMatch) headers.set('if-none-match', opts.ifNoneMatch);
  return new Request(url, { method: 'GET', headers });
}

beforeEach(() => {
  getUserMock.mockReset();
  buildReportMock.mockReset();
  consumeQuotaMock.mockReset();
  sessionRow.value = null;
  cachedRow.value = null;
});

describe('GET /api/legend/report/[sessionId]', () => {
  it('미인증 → 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const res = await GET(makeReq(), { params: Promise.resolve({ sessionId: SESSION_ID }) });

    expect(res.status).toBe(401);
  });

  it('session 없음 → 404', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = null;

    const res = await GET(makeReq(), { params: Promise.resolve({ sessionId: SESSION_ID }) });

    expect(res.status).toBe(404);
  });

  it('session.user_id 불일치 → 403', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'other-user' };

    const res = await GET(makeReq(), { params: Promise.resolve({ sessionId: SESSION_ID }) });

    expect(res.status).toBe(403);
  });

  it('캐시 hit + If-None-Match 일치 → 304 (body 없음)', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'u1' };
    cachedRow.value = {
      report_jsonb: { schema_version: '1.1', tutor: { name: 'gauss' } },
      generated_at: '2026-04-28T01:00:00.000Z',
    };
    const expectedEtag = `"${SESSION_ID}-1.1-2026-04-28T01:00:00.000Z"`;

    const res = await GET(makeReq({ ifNoneMatch: expectedEtag }), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    });

    expect(res.status).toBe(304);
    expect(res.headers.get('etag')).toBe(expectedEtag);
    expect(buildReportMock).not.toHaveBeenCalled();
  });

  it('캐시 hit + If-None-Match 미일치 → 200 + body + etag', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'u1' };
    cachedRow.value = {
      report_jsonb: { schema_version: '1.1', tutor: { name: 'gauss' } },
      generated_at: '2026-04-28T01:00:00.000Z',
    };

    const res = await GET(makeReq(), { params: Promise.resolve({ sessionId: SESSION_ID }) });

    expect(res.status).toBe(200);
    expect(res.headers.get('etag')).toBeTruthy();
    expect(res.headers.get('cache-control')).toContain('private');
    const body = await res.json();
    expect(body.tutor.name).toBe('gauss');
    expect(buildReportMock).not.toHaveBeenCalled();
  });

  it('캐시 miss + problem_text 누락 → 422', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'u1' };
    cachedRow.value = null;

    const res = await GET(makeReq(), { params: Promise.resolve({ sessionId: SESSION_ID }) });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe('missing_problem_text');
  });

  it('캐시 miss + quota 차단 → 402', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'u1' };
    cachedRow.value = null;
    consumeQuotaMock.mockResolvedValue({ allowed: false, blocked_reason: 'limit_exceeded' });

    const res = await GET(makeReq({ problemText: 'p' }), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    });

    expect(res.status).toBe(402);
    expect(buildReportMock).not.toHaveBeenCalled();
  });

  it('캐시 miss + problem_text 존재 + quota 통과 → buildReport + 200', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    sessionRow.value = { user_id: 'u1' };
    cachedRow.value = null;
    consumeQuotaMock.mockResolvedValue({ allowed: true });
    buildReportMock.mockResolvedValue({
      schema_version: '1.1',
      tutor: { name: 'euler' },
    });

    const res = await GET(makeReq({ problemText: '문제 본문 텍스트' }), {
      params: Promise.resolve({ sessionId: SESSION_ID }),
    });

    expect(res.status).toBe(200);
    expect(buildReportMock).toHaveBeenCalledTimes(1);
    expect(res.headers.get('etag')).toContain(SESSION_ID);
    const body = await res.json();
    expect(body.tutor.name).toBe('euler');
  });
});
