/**
 * Phase G-06 G06-33 — POST /api/legend/build-summary (풀이 정리 진입점).
 *
 * 베이스 문서:
 *   docs/project-decisions.md Δ10 (G06-33 풀이 정리 진입 + trigger_motivation)
 *   docs/architecture-g06-legend.md §5 (R1 build pipeline)
 *
 * 흐름:
 *   1. 인증 가드 (createClient server) — 미인증 401
 *   2. body 파싱 (problem_text 필수) — 누락 400
 *   3. Access Tier 게이트 — trial 거부 (402 beta_only)
 *   4. quota: legend_call_daily + report_per_problem_daily 둘 다 소진
 *   5. routeProblem (Stage 0~2) — Tier 결정
 *   6. callTutor — Tier 2 라우팅 결과 그대로 사용 (Tier 0/1 시 가우스 강제 — 정리 품질 ↑)
 *   7. buildReport — Δ3 + Δ4 + Δ7 + Δ10 trigger_motivation 통합
 *   8. { session_id, report, actual_tutor } JSON 반환
 *
 * 비-스트리밍 단발 응답 (UI 가 inline 카드로 노출). 60~90s P95 예상.
 *
 * 영향 격리: src/app/api/legend/build-summary/ 전용. 기존 /solve / /report 무수정.
 */
import { createClient } from '@/lib/supabase/server';
import { callTutor } from '@/lib/legend/tutor-orchestrator';
import { consumeQuota } from '@/lib/legend/quota-manager';
import { getUserAccessTier } from '@/lib/legend/access-tier';
import { routeProblem } from '@/lib/legend/legend-router';
import { buildReport } from '@/lib/legend/report/report-builder';
import type { TutorName } from '@/lib/legend/types';

export const runtime = 'nodejs';
export const maxDuration = 90;

interface BuildSummaryRequestBody {
  problem_text?: string;
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
  let body: BuildSummaryRequestBody;
  try {
    body = (await req.json()) as BuildSummaryRequestBody;
  } catch {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (!body.problem_text || typeof body.problem_text !== 'string' || !body.problem_text.trim()) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  // 3. Access Tier 게이트 — 풀이 정리는 베타 전용 (Δ9 정책 준수)
  const tier = await getUserAccessTier(user.id);
  if (tier === 'trial') {
    return Response.json(
      {
        error: 'beta_only',
        message:
          '풀이 정리 (ToT 트리 + AI도 어려웠던 순간 + 떠올린 이유) 는 베타 사용자 전용입니다. 베타 신청을 진행해주세요.',
        apply_url: '/legend/beta/apply',
      },
      { status: 402 },
    );
  }

  // 4. quota: legend_call_daily + report_per_problem_daily
  const legendQuota = await consumeQuota(user.id, 'legend_call_daily');
  if (!legendQuota.allowed) {
    return Response.json(
      { error: 'quota_exceeded', quota: legendQuota },
      { status: 402 },
    );
  }
  const reportQuota = await consumeQuota(user.id, 'report_per_problem_daily');
  if (!reportQuota.allowed) {
    return Response.json(
      { error: 'quota_exceeded', quota: reportQuota },
      { status: 402 },
    );
  }

  try {
    // 5. routeProblem (Stage 0~2)
    const decision = await routeProblem({
      user_id: user.id,
      problem_text: body.problem_text,
      input_mode: 'text',
    });

    // 6. callTutor — Tier 2 라우팅 시 routed_tutor 그대로,
    //    Tier 0/1 라우팅 시 가우스 강제 (정리 품질 ↑, agentic 5step trace 확보).
    const tutor: TutorName = decision.routed_tier === 2 ? decision.routed_tutor : 'gauss';
    const tutorResult = await callTutor({
      user_id: user.id,
      problem_text: body.problem_text,
      tutor,
      call_kind: 'primary',
      routing_decision_id: decision.routing_decision_id,
    });

    if (!tutorResult.session_id) {
      return Response.json(
        { error: 'session_persist_failed', message: '세션 저장 실패. 잠시 후 다시 시도해주세요.' },
        { status: 500 },
      );
    }

    // 7. buildReport — Δ3 + Δ4 + Δ7 + Δ10 통합
    const report = await buildReport({
      session_id: tutorResult.session_id,
      user_id: user.id,
      problem_text: body.problem_text,
    });

    // 8. JSON 반환
    return Response.json({
      session_id: tutorResult.session_id,
      report,
      actual_tutor: tutorResult.actual_tutor ?? tutor,
      routing_decision_id: decision.routing_decision_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'build_summary_failed';
    console.warn('[build-summary] failed:', message);
    return Response.json(
      { error: 'build_summary_failed', message },
      { status: 500 },
    );
  }
}
