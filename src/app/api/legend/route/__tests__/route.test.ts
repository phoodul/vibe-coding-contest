/**
 * Phase G-06 G06-07 — POST /api/legend/route 단위 테스트.
 *
 * 시나리오:
 *   1. 401 unauthorized — auth.getUser 가 user=null 반환
 *   2. 400 invalid_input — problem_text 누락
 *   3. 정상 SSE — stage_progress (1+) + route_decided 1건 + 스트림 종료
 *   4. 429 rate_limit — 같은 user 가 1초 내 6회 호출 시 6번째에서 429
 *
 * 모킹: supabase server / legend-router.routeProblem.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 모킹 ──────────────────────────────────────────────────────────────
const getUserMock = vi.fn();
const routeProblemMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock('@/lib/legend/legend-router', () => ({
  routeProblem: (...args: unknown[]) => routeProblemMock(...args),
}));

import { POST } from '../route';

beforeEach(() => {
  getUserMock.mockReset();
  routeProblemMock.mockReset();
});

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/legend/route', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readSSEMessages(stream: ReadableStream<Uint8Array>): Promise<unknown[]> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const events: unknown[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE 구분: `\n\n`
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);
      if (chunk.startsWith('data:')) {
        const payload = chunk.slice('data:'.length).trim();
        events.push(JSON.parse(payload));
      }
    }
  }
  return events;
}

describe('POST /api/legend/route', () => {
  it('미인증 시 401 unauthorized', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeReq({ problem_text: 'x^2-4=0' }));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'unauthorized' });
    expect(routeProblemMock).not.toHaveBeenCalled();
  });

  it('problem_text 누락 시 400 invalid_input', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-400' } } });

    const res = await POST(makeReq({ input_mode: 'text' }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'invalid_input' });
    expect(routeProblemMock).not.toHaveBeenCalled();
  });

  it('정상 입력 — SSE stage_progress (1+) + route_decided 1건', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-ok' } } });
    routeProblemMock.mockResolvedValue({
      stage_reached: 1,
      routed_tier: 1,
      routed_tutor: 'ramanujan_intuit',
      area: 'common',
      confidence: 0.85,
      routing_decision_id: 'decision-uuid-1',
      duration_ms: 120,
    });

    const res = await POST(makeReq({ problem_text: 'x^2-4=0의 해를 구하시오', input_mode: 'text' }));

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    expect(res.body).toBeTruthy();

    const events = await readSSEMessages(res.body!);
    // stage 0, 1 progress 2건 + route_decided 1건 = 3
    expect(events.length).toBeGreaterThanOrEqual(2);

    const progressEvents = events.filter(
      (e: unknown) => (e as { type: string }).type === 'stage_progress',
    );
    const decidedEvents = events.filter(
      (e: unknown) => (e as { type: string }).type === 'route_decided',
    );

    expect(progressEvents.length).toBeGreaterThanOrEqual(1);
    expect(decidedEvents).toHaveLength(1);

    const decided = decidedEvents[0] as { payload: Record<string, unknown> };
    expect(decided.payload.tutor).toBe('ramanujan_intuit');
    expect(decided.payload.tier).toBe(1);
    expect(decided.payload.routing_decision_id).toBe('decision-uuid-1');

    expect(routeProblemMock).toHaveBeenCalledTimes(1);
    const callArg = routeProblemMock.mock.calls[0][0];
    expect(callArg.user_id).toBe('user-ok');
    expect(callArg.problem_text).toBe('x^2-4=0의 해를 구하시오');
  });

  it('rate limit — 같은 user 1초 내 6회 호출 시 6번째 429', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-rl' } } });
    routeProblemMock.mockResolvedValue({
      stage_reached: 0,
      routed_tier: 0,
      routed_tutor: 'ramanujan_calc',
      routing_decision_id: 'd',
      duration_ms: 10,
    });

    const responses: Response[] = [];
    for (let i = 0; i < 6; i++) {
      responses.push(await POST(makeReq({ problem_text: `문제 ${i}` })));
    }

    // 1~5 정상, 6번째 429
    for (let i = 0; i < 5; i++) {
      expect(responses[i].status).toBe(200);
    }
    expect(responses[5].status).toBe(429);
    const body = await responses[5].json();
    expect(body.error).toBe('rate_limit');

    // body 들 소비 (테스트 종료 시 dangling stream 방지)
    for (let i = 0; i < 5; i++) {
      if (responses[i].body) {
        await responses[i].body!.cancel();
      }
    }
  });
});
