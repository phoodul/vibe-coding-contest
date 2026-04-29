/**
 * Phase G-06 G06-11 — POST /api/legend/solve (SSE 튜터 풀이 스트림).
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표) + §7.2 (SSE 메시지 형식)
 *   docs/implementation_plan_g06.md §G06-11
 *
 * 처리 흐름:
 *   1. 인증 가드 (createClient server) — 미인증 401
 *   2. body 파싱 (routing_decision_id, tutor, problem_text 필수) — 누락 400
 *   3. RLS 보조 검증 — routing_decision.user_id === user.id, 아니면 403
 *   4. quota 소진:
 *      - problem_total_daily 무조건 소진
 *      - routed_tier === 2 인 경우 legend_call_daily 추가 소진
 *      - 차단 시 402 quota_exceeded
 *   5. SSE 스트림 시작 → callTutor 비동기 실행
 *      - fallback_event 가 있으면 fallback 메시지 emit
 *      - trace.turns 순회하며 tutor_turn / tool_call emit
 *      - 마지막 final 메시지 emit
 *      - 실패 시 error emit
 *   6. stream 종료
 */
import { createClient } from '@/lib/supabase/server';
import { callTutor } from '@/lib/legend/tutor-orchestrator';
import { consumeQuota } from '@/lib/legend/quota-manager';
import { createSSEStream } from '@/lib/legend/sse';
import { getUserAccessTier } from '@/lib/legend/access-tier';
import type { TutorName } from '@/lib/legend/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface SolveRequestBody {
  routing_decision_id?: string;
  tutor?: TutorName;
  problem_text?: string;
  call_kind?: 'primary' | 'second_opinion' | 'retry';
}

interface RoutingDecisionRow {
  user_id: string;
  routed_tier: number;
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

  // 2. body 파싱
  let body: SolveRequestBody;
  try {
    body = (await req.json()) as SolveRequestBody;
  } catch {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (
    !body.routing_decision_id ||
    !body.tutor ||
    !body.problem_text ||
    typeof body.problem_text !== 'string'
  ) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  // 3. RLS 보조 검증 — routing_decision user_id 일치
  const { data: rd } = await supabase
    .from('legend_routing_decisions')
    .select('user_id, routed_tier')
    .eq('id', body.routing_decision_id)
    .maybeSingle();
  const decision = rd as RoutingDecisionRow | null;
  if (!decision || decision.user_id !== user.id) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  // 4. Access Tier 게이트 (Δ9, G06-32):
  //    - trial: Tier 2 호출 거부 (402 beta_only) + 라마누잔만 trial_ramanujan_daily quota 소진
  //    - beta:  기존 5종 quota (problem_total_daily + legend_call_daily) 그대로
  const tier = await getUserAccessTier(user.id);
  const isLegendTier = decision.routed_tier === 2;

  if (tier === 'trial') {
    if (isLegendTier) {
      return Response.json(
        {
          error: 'beta_only',
          message:
            '레전드 튜터 (가우스/폰 노이만/오일러/라이프니츠) 는 베타 사용자만 이용 가능합니다. 베타 신청을 진행해주세요.',
          apply_url: '/legend/beta/apply',
        },
        { status: 402 },
      );
    }
    // 라마누잔 호출 (Tier 0/1) — 체험 quota 소진
    const trialQuota = await consumeQuota(user.id, 'trial_ramanujan_daily');
    if (!trialQuota.allowed) {
      return Response.json(
        {
          error: 'trial_quota_exceeded',
          quota: trialQuota,
          message:
            '오늘 체험 한도 (3회) 를 모두 사용했습니다. 베타 신청 후 더 많은 기능을 이용해보세요.',
          apply_url: '/legend/beta/apply',
        },
        { status: 402 },
      );
    }
  } else {
    // beta — 기존 5종 quota 게이트
    const problemQuota = await consumeQuota(user.id, 'problem_total_daily');
    if (!problemQuota.allowed) {
      return Response.json(
        { error: 'quota_exceeded', quota: problemQuota },
        { status: 402 },
      );
    }
    if (isLegendTier) {
      const legendQuota = await consumeQuota(user.id, 'legend_call_daily');
      if (!legendQuota.allowed) {
        return Response.json(
          { error: 'quota_exceeded', quota: legendQuota },
          { status: 402 },
        );
      }
    }
  }

  // 5. SSE 스트림 시작
  const { stream, write, close } = createSSEStream();

  void (async () => {
    try {
      const result = await callTutor({
        user_id: user.id,
        problem_text: body.problem_text!,
        tutor: body.tutor!,
        call_kind: body.call_kind ?? 'primary',
        routing_decision_id: body.routing_decision_id!,
      });

      // fallback 이벤트 가시화 (G06-09 매트릭스 결과)
      if (result.fallback_event) {
        write({ type: 'fallback', payload: result.fallback_event });
      }

      // trace.turns 순회 — 모델별 trace 포맷이 다양하므로 안전 가드
      const trace = result.trace_jsonb as
        | {
            turns?: Array<{
              content?: string;
              tool_calls?: Array<{ name?: string; error?: unknown }>;
            }>;
          }
        | null
        | undefined;

      if (trace?.turns?.length) {
        trace.turns.forEach((turn, i) => {
          write({
            type: 'tutor_turn',
            payload: { turn: i + 1, content: turn.content ?? '' },
          });
          if (turn.tool_calls?.length) {
            turn.tool_calls.forEach((tc) => {
              write({
                type: 'tool_call',
                payload: {
                  tool_id: tc.name ?? 'unknown',
                  ok: !tc.error,
                },
              });
            });
          }
        });
      }

      write({
        type: 'final',
        payload: {
          answer: result.final_answer,
          session_id: result.session_id,
          actual_tutor: result.actual_tutor,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'solve_failed';
      write({ type: 'error', payload: { message } });
    } finally {
      close();
    }
  })();

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
}
