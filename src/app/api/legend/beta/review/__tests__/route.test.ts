/**
 * G06-34 (Δ11) — POST/GET /api/legend/beta/review 단위 테스트
 *
 * 시나리오:
 *   1. POST 401 — 미인증
 *   2. POST 402 — trial 사용자 (beta 아님)
 *   3. POST 400 — invalid json
 *   4. POST 400 — pros 30자 미만
 *   5. POST 400 — cons 20자 미만
 *   6. POST 400 — purchase_intent 누락
 *   7. POST 400 — recommended_tutor 잘못된 값
 *   8. POST 400 — star_rating 범위 초과
 *   9. POST 201 — 정상 (upsert)
 *  10. POST 201 — 재제출 (upsert update)
 *  11. GET 401 — 미인증
 *  12. GET — 본인 리뷰 조회 정상
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  getUserMock,
  upsertMock,
  selectMock,
  eqMock,
  maybeSingleMock,
  getUserAccessTierMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  upsertMock: vi.fn(),
  selectMock: vi.fn(),
  eqMock: vi.fn(),
  maybeSingleMock: vi.fn(),
  getUserAccessTierMock: vi.fn(),
}));

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

vi.mock('@/lib/legend/access-tier', () => ({
  getUserAccessTier: getUserAccessTierMock,
}));

import { POST, GET } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  upsertMock.mockReset();
  selectMock.mockReset();
  eqMock.mockReset();
  maybeSingleMock.mockReset();
  getUserAccessTierMock.mockReset();
});

const VALID_PROS =
  '튜터의 사고 흐름 진단이 정확하고 풀이 정리가 명확해서 학습 효율이 크게 올라갑니다.';
const VALID_CONS = '응답이 가끔 느리고 이미지 인식 정확도 개선이 필요합니다.';

describe('POST /api/legend/beta/review', () => {
  it('미인증 시 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('trial 사용자는 402 (beta_only)', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('trial');
    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('beta_only');
  });

  it('invalid json 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('beta');
    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_json');
  });

  it('pros 30자 미만 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('beta');
    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({
        pros: '짧은 장점',
        cons: VALID_CONS,
        purchase_intent: true,
        recommended_tutor: 'gauss',
        star_rating: 5,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('pros_too_short');
  });

  it('cons 20자 미만 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('beta');
    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({
        pros: VALID_PROS,
        cons: '짧음',
        purchase_intent: true,
        recommended_tutor: 'gauss',
        star_rating: 5,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('cons_too_short');
  });

  it('purchase_intent 누락 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('beta');
    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({
        pros: VALID_PROS,
        cons: VALID_CONS,
        recommended_tutor: 'gauss',
        star_rating: 5,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('purchase_intent_required');
  });

  it('recommended_tutor 잘못된 값 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('beta');
    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({
        pros: VALID_PROS,
        cons: VALID_CONS,
        purchase_intent: true,
        recommended_tutor: 'someone_else',
        star_rating: 5,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_recommended_tutor');
  });

  it('star_rating 범위 초과 시 400', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('beta');
    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({
        pros: VALID_PROS,
        cons: VALID_CONS,
        purchase_intent: true,
        recommended_tutor: 'euler',
        star_rating: 7,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_star_rating');
  });

  it('정상 신청 시 201 (upsert 호출)', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('beta');

    const upsertSelectSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'rev-1', submitted_at: '2026-04-30T00:00:00Z' },
      error: null,
    });
    upsertMock.mockReturnValue({
      select: () => ({ single: upsertSelectSingleMock }),
    });

    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({
        pros: VALID_PROS,
        cons: VALID_CONS,
        purchase_intent: true,
        recommended_tutor: 'gauss',
        star_rating: 5,
        free_comment: '정말 만족합니다.',
        is_public: true,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u1',
        purchase_intent: true,
        recommended_tutor: 'gauss',
        star_rating: 5,
        is_public: true,
      }),
      expect.objectContaining({ onConflict: 'user_id' }),
    );
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe('rev-1');
  });

  it('is_public 미지정 시 default true', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    getUserAccessTierMock.mockResolvedValue('beta');

    const upsertSelectSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'rev-2', submitted_at: '2026-04-30T01:00:00Z' },
      error: null,
    });
    upsertMock.mockReturnValue({
      select: () => ({ single: upsertSelectSingleMock }),
    });

    const req = new Request('http://test/api/legend/beta/review', {
      method: 'POST',
      body: JSON.stringify({
        pros: VALID_PROS,
        cons: VALID_CONS,
        purchase_intent: false,
        recommended_tutor: 'leibniz',
        star_rating: 4,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ is_public: true }),
      expect.anything(),
    );
  });
});

describe('GET /api/legend/beta/review', () => {
  it('미인증 시 401', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('본인 리뷰 정상 조회', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    selectMock.mockReturnValue({
      eq: () => ({
        maybeSingle: () =>
          Promise.resolve({
            data: { id: 'rev-1', star_rating: 5, recommended_tutor: 'gauss' },
            error: null,
          }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      review: { id: string; star_rating: number } | null;
    };
    expect(body.review?.id).toBe('rev-1');
  });

  it('본인 리뷰 미작성 시 review=null', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });

    selectMock.mockReturnValue({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { review: unknown };
    expect(body.review).toBeNull();
  });
});
