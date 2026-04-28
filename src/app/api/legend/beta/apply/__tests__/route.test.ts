/**
 * G06-27 — POST /api/legend/beta/apply 단위 테스트
 *
 * 시나리오:
 *   1. 401 — 미인증
 *   2. 400 — invalid json
 *   3. 400 — motivation 50자 미만
 *   4. 400 — feedback_consent === false
 *   5. 201 — 정상 신청 (upsert)
 *   6. GET 401 — 미인증
 *   7. GET — 본인 신청 조회 정상
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const upsertMock = vi.fn();
const selectMock = vi.fn();
const eqMock = vi.fn();
const maybeSingleMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: (_table: string) => ({
      upsert: upsertMock,
      select: selectMock,
      eq: eqMock,
      maybeSingle: maybeSingleMock,
    }),
  }),
}));

import { POST, GET } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  upsertMock.mockReset();
  selectMock.mockReset();
  eqMock.mockReset();
  maybeSingleMock.mockReset();
});

describe('POST /api/legend/beta/apply', () => {
  it('미인증 시 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const req = new Request('http://test/api/legend/beta/apply', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('invalid json 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const req = new Request('http://test/api/legend/beta/apply', {
      method: 'POST',
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_json');
  });

  it('motivation 50자 미만 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const req = new Request('http://test/api/legend/beta/apply', {
      method: 'POST',
      body: JSON.stringify({
        motivation: '짧은 동기',
        feedback_consent: true,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('motivation_too_short');
  });

  it('feedback_consent false 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const longMotivation =
      '학생을 위한 수학 학습 도구를 직접 사용해 보고 정말 도움이 되는지 평가하고 싶습니다. 베타에 참여하여 다양한 문제를 풀어 보겠습니다.';
    expect(longMotivation.length).toBeGreaterThanOrEqual(50);
    const req = new Request('http://test/api/legend/beta/apply', {
      method: 'POST',
      body: JSON.stringify({
        motivation: longMotivation,
        feedback_consent: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('feedback_consent_required');
  });

  it('정상 신청 시 201 (upsert 호출)', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const upsertSelectSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'app-1', status: 'pending' },
      error: null,
    });
    upsertMock.mockReturnValue({
      select: () => ({ single: upsertSelectSingleMock }),
    });

    const longMotivation =
      '저는 수능 미적분 문제를 풀면서 사고 흐름이 막히는 단계가 어디인지 정확히 진단받고 싶어 신청합니다.';
    const req = new Request('http://test/api/legend/beta/apply', {
      method: 'POST',
      body: JSON.stringify({
        motivation: longMotivation,
        feedback_consent: true,
        grade: 'high3',
        area: 'calculus',
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u1',
        feedback_consent: true,
        grade: 'high3',
        area: 'calculus',
        status: 'pending',
      }),
      expect.objectContaining({ onConflict: 'user_id' }),
    );
    const body = (await res.json()) as { id: string; status: string };
    expect(body.id).toBe('app-1');
    expect(body.status).toBe('pending');
  });
});

describe('GET /api/legend/beta/apply', () => {
  it('미인증 시 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('본인 신청 정상 조회', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    selectMock.mockReturnValue({
      eq: () => ({
        maybeSingle: () =>
          Promise.resolve({
            data: { id: 'app-1', status: 'pending' },
            error: null,
          }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { application: { id: string } | null };
    expect(body.application?.id).toBe('app-1');
  });
});
