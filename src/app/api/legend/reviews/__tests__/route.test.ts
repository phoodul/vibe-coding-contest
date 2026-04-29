/**
 * G06-34 (Δ11) — GET /api/legend/reviews 단위 테스트 (공개)
 *
 * 시나리오:
 *   1. anon 정상 조회 + 통계 + 페이지네이션
 *   2. sort_by=rating 시 별점 내림차순
 *   3. has_next 판정 (PAGE_SIZE+1 row 시)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { rpcMock, orderMock, rangeMock, eqMock, selectMock, fromMock } = vi.hoisted(
  () => ({
    rpcMock: vi.fn(),
    orderMock: vi.fn(),
    rangeMock: vi.fn(),
    eqMock: vi.fn(),
    selectMock: vi.fn(),
    fromMock: vi.fn(),
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    rpc: rpcMock,
    from: fromMock,
  }),
}));

import { GET } from '../route';

beforeEach(() => {
  rpcMock.mockReset();
  orderMock.mockReset();
  rangeMock.mockReset();
  eqMock.mockReset();
  selectMock.mockReset();
  fromMock.mockReset();
});

function setupHappyPath(reviews: Record<string, unknown>[]) {
  rpcMock.mockResolvedValue({
    data: {
      total: reviews.length,
      avg_rating: 4.5,
      purchase_intent_rate: 80.0,
      tutor_distribution: { gauss: 3, euler: 2 },
    },
    error: null,
  });

  rangeMock.mockResolvedValue({ data: reviews, error: null });
  orderMock.mockReturnValue({ range: rangeMock });
  eqMock.mockReturnValue({ order: orderMock });
  selectMock.mockReturnValue({ eq: eqMock });
  fromMock.mockReturnValue({ select: selectMock });
}

describe('GET /api/legend/reviews', () => {
  it('anon 정상 조회 — 통계 + 리뷰 + 페이지 정보', async () => {
    setupHappyPath([
      { id: 'r1', star_rating: 5, recommended_tutor: 'gauss' },
      { id: 'r2', star_rating: 4, recommended_tutor: 'euler' },
    ]);

    const req = new Request('http://test/api/legend/reviews');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      stats: { total: number; avg_rating: number };
      reviews: Array<{ id: string }>;
      page_info: { page: number; has_next: boolean; sort_by: string };
    };
    expect(body.stats.total).toBe(2);
    expect(body.reviews).toHaveLength(2);
    expect(body.page_info.page).toBe(1);
    expect(body.page_info.has_next).toBe(false);
    expect(body.page_info.sort_by).toBe('latest');
  });

  it('sort_by=rating 시 별점 정렬 컬럼 사용', async () => {
    setupHappyPath([{ id: 'r1', star_rating: 5, recommended_tutor: 'gauss' }]);

    const req = new Request('http://test/api/legend/reviews?sort_by=rating');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(orderMock).toHaveBeenCalledWith(
      'star_rating',
      expect.objectContaining({ ascending: false }),
    );
  });

  it('has_next 판정 (PAGE_SIZE+1 row 반환 시 trim)', async () => {
    const rows = Array.from({ length: 11 }, (_, i) => ({
      id: `r${i + 1}`,
      star_rating: 5,
      recommended_tutor: 'gauss',
    }));
    setupHappyPath(rows);

    const req = new Request('http://test/api/legend/reviews');
    const res = await GET(req);
    const body = (await res.json()) as {
      reviews: unknown[];
      page_info: { has_next: boolean };
    };
    expect(body.reviews).toHaveLength(10);
    expect(body.page_info.has_next).toBe(true);
  });

  it('rpc 에러 시 500', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'rpc fail' } });

    const req = new Request('http://test/api/legend/reviews');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
