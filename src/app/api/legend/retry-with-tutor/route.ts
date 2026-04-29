/**
 * Phase G-06 G06-11 — POST /api/legend/retry-with-tutor (다른 튜터 재호출).
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표)
 *   docs/implementation_plan_g06.md §G06-11
 *   docs/project-decisions.md Δ1 결정 #5 — second opinion 도 quota 동일 소진
 *
 * 처리 흐름:
 *   1. 인증 가드 — 미인증 401
 *   2. body 파싱 (routing_decision_id, target_tutor, problem_text 필수) — 누락 400
 *   3. RLS 보조 검증 — routing_decision.user_id === user.id, 아니면 403
 *   4. quota 소진:
 *      - problem_total_daily 무조건 소진
 *      - target_tutor 가 Tier 2 면 legend_call_daily 추가 소진 (Δ1 #5)
 *      - 차단 시 402 quota_exceeded
 *   5. SSE 스트림 시작 → callTutor (call_kind='second_opinion' 또는 'retry')
 *      - tutor_turn / tool_call / final / fallback / error
 *   6. stream 종료
 *
 * /solve 와 차이: 학생이 직접 튜터 선택 (라우팅 skip), call_kind 기본값이 second_opinion.
 */
import { createClient } from '@/lib/supabase/server';
import { callTutor } from '@/lib/legend/tutor-orchestrator';
import { consumeQuota } from '@/lib/legend/quota-manager';
import { createSSEStream } from '@/lib/legend/sse';
import { TUTOR_CONFIG } from '@/lib/legend/tutor-orchestrator';
import { getUserAccessTier } from '@/lib/legend/access-tier';
import type { TutorName } from '@/lib/legend/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface RetryRequestBody {
  routing_decision_id?: string;
  target_tutor?: TutorName;
  problem_text?: string;
  call_kind?: 'second_opinion' | 'retry';
}

interface RoutingDecisionRow {
  user_id: string;
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
  let body: RetryRequestBody;
  try {
    body = (await req.json()) as RetryRequestBody;
  } catch {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (
    !body.routing_decision_id ||
    !body.target_tutor ||
    !body.problem_text ||
    typeof body.problem_text !== 'string' ||
    !TUTOR_CONFIG[body.target_tutor]
  ) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  // 3. RLS 보조 검증
  const { data: rd } = await supabase
    .from('legend_routing_decisions')
    .select('user_id')
    .eq('id', body.routing_decision_id)
    .maybeSingle();
  const decision = rd as RoutingDecisionRow | null;
  if (!decision || decision.user_id !== user.id) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  // 4. Access Tier 게이트 (Δ9, G06-32) — target_tutor tier 기준 (Δ1 #5):
  //    - trial: Tier 2 거부 + 라마누잔만 trial_ramanujan_daily 소진
  //    - beta:  problem_total_daily + Tier 2 면 legend_call_daily 추가 소진
  const tier = await getUserAccessTier(user.id);
  const targetTier = TUTOR_CONFIG[body.target_tutor].tier;

  if (tier === 'trial') {
    if (targetTier === 2) {
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
    const problemQuota = await consumeQuota(user.id, 'problem_total_daily');
    if (!problemQuota.allowed) {
      return Response.json(
        { error: 'quota_exceeded', quota: problemQuota },
        { status: 402 },
      );
    }
    if (targetTier === 2) {
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
        tutor: body.target_tutor!,
        call_kind: body.call_kind ?? 'second_opinion',
        routing_decision_id: body.routing_decision_id!,
      });

      if (result.fallback_event) {
        write({ type: 'fallback', payload: result.fallback_event });
      }

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
      const message = err instanceof Error ? err.message : 'retry_failed';
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
