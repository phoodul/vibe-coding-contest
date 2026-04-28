/**
 * Phase G-06 G06-11 — POST /api/legend/escalate (학생의 escalation 응답 처리).
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §7 (라우트 표) + EscalationPrompt 정책
 *   docs/implementation_plan_g06.md §G06-11
 *
 * 처리 흐름:
 *   1. 인증 가드 — 미인증 401
 *   2. body 파싱 (routing_decision_id + choice 필수) — 누락 400
 *   3. RLS 보조 검증 + user_chose_escalation 갱신 — 다른 user 의 row 면 403
 *   4. choice 별 next_action 응답 (클라이언트가 후속 호출):
 *      - escalate  → /solve 호출 (target_tutor 동봉)
 *      - retry     → 같은 튜터 재시도 (probe 등)
 *      - hint_only → 힌트만 표시 (튜터 호출 X)
 */
import { createClient } from '@/lib/supabase/server';
import type { TutorName } from '@/lib/legend/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

type EscalationChoice = 'escalate' | 'retry' | 'hint_only';

interface EscalateRequestBody {
  routing_decision_id?: string;
  choice?: EscalationChoice;
  target_tutor?: TutorName;
}

const VALID_CHOICES: ReadonlyArray<EscalationChoice> = [
  'escalate',
  'retry',
  'hint_only',
];

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
  let body: EscalateRequestBody;
  try {
    body = (await req.json()) as EscalateRequestBody;
  } catch {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (
    !body.routing_decision_id ||
    !body.choice ||
    !VALID_CHOICES.includes(body.choice)
  ) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  // 3. RLS 보조 검증 + user_chose_escalation 갱신 (escalate 시만 true)
  const { data, error } = await supabase
    .from('legend_routing_decisions')
    .update({ user_chose_escalation: body.choice === 'escalate' })
    .eq('id', body.routing_decision_id)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  // 4. choice 별 next_action 매핑
  const next_action =
    body.choice === 'escalate'
      ? { kind: 'call_tutor' as const, target: body.target_tutor }
      : body.choice === 'retry'
        ? { kind: 'retry_probe' as const }
        : { kind: 'hint_only' as const };

  return Response.json({ ok: true, next_action });
}
