/**
 * Phase G-06 G06-07 — POST /api/legend/route (라우팅 진입점, SSE).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §7.1 (인증·권한 가드) + §7.2 (SSE 메시지 형식).
 *
 * 처리 흐름:
 *   1. 인증 가드 (createClient server) — 미인증 401
 *   2. rate limit (in-memory 5 req/sec/user) — 초과 429
 *   3. body 파싱 (problem_text 필수) — 누락 400
 *   4. quota check — TODO: G06-10 quota-manager 통합 후 활성
 *   5. SSE 스트림 시작 → routeProblem 비동기 실행
 *      - stage_progress (stage_reached 까지 0..N) 차례 emit
 *      - route_decided 1건 emit (tutor/tier/decision_id/escalation_prompt)
 *      - 실패 시 error emit
 *   6. stream 종료
 *
 * 인증: createClient (server) 가 RLS user_id = auth.uid() 자동 적용.
 */
import { createClient } from '@/lib/supabase/server';
import { routeProblem } from '@/lib/legend/legend-router';
import { createSSEStream } from '@/lib/legend/sse';
import type { RouteInput } from '@/lib/legend/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ────────────────────────────────────────────────────────────────────────────
// in-memory rate limit (개발용)
// TODO(G-07): production 은 Vercel KV 또는 Redis 권장 — 인스턴스 간 공유 필요
// ────────────────────────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_PER_SEC = 5;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 1000 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_PER_SEC) return false;
  entry.count += 1;
  return true;
}

// ────────────────────────────────────────────────────────────────────────────
// POST handler
// ────────────────────────────────────────────────────────────────────────────

interface RouteRequestBody {
  problem_text?: string;
  problem_image_url?: string;
  input_mode?: RouteInput['input_mode'];
  embedding?: number[];
}

export async function POST(req: Request) {
  // 1. 인증 가드
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2. rate limit
  if (!checkRateLimit(user.id)) {
    return Response.json(
      { error: 'rate_limit', retry_after: 1 },
      { status: 429 },
    );
  }

  // 3. body 파싱
  let body: RouteRequestBody;
  try {
    body = (await req.json()) as RouteRequestBody;
  } catch {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  if (!body.problem_text || typeof body.problem_text !== 'string') {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  // 4. quota check — TODO(G06-11): G06-10 quota-manager 완료 후 통합
  //    const quota = await consumeQuota(user.id, 'problem_total_daily');
  //    if (!quota.allowed) {
  //      return Response.json({ error: 'quota_exceeded', kind: quota.kind }, { status: 402 });
  //    }

  const input: RouteInput = {
    user_id: user.id,
    problem_text: body.problem_text,
    problem_image_url: body.problem_image_url,
    input_mode: body.input_mode ?? 'text',
    embedding: body.embedding,
  };

  // 5. SSE 스트림 시작
  const { stream, write, close } = createSSEStream();

  // 비동기 라우팅 (응답 stream 에 결과 enqueue)
  void (async () => {
    try {
      const decision = await routeProblem(input);

      // stage_progress: 도달한 stage 까지 0..N 차례 emit (간이 가시화)
      for (let s = 0; s <= decision.stage_reached; s++) {
        write({
          type: 'stage_progress',
          stage: s as 0 | 1 | 2,
          payload: { reached: s === decision.stage_reached },
        });
      }

      write({
        type: 'route_decided',
        payload: {
          tutor: decision.routed_tutor,
          tier: decision.routed_tier,
          routing_decision_id: decision.routing_decision_id,
          escalation_prompt: decision.escalation_prompt,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'route_failed';
      write({ type: 'error', payload: { message } });
    } finally {
      close();
    }
  })();

  // 6. SSE 응답
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
}
