/**
 * Phase G-06 G06-08 — Tutor Orchestrator (6 튜터 dispatch + DB 세션 영속화).
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §4.2 (callTutor 시그니처) + §4.3 (TUTOR_CONFIG 매핑)
 *   docs/implementation_plan_g06.md §G06-08
 *
 * 흐름:
 *   1. TUTOR_CONFIG 에서 (tier, model, mode, provider) 조회
 *   2. buildSystemPrompt 로 튜터 페르소나 시스템 프롬프트 생성
 *   3. callModel 호출 (provider × mode 5 분기)
 *   4. legend_tutor_sessions insert (user_id, routing_decision_id, problem_hash, tutor_name,
 *      tier, call_kind, model_id, mode, trace_jsonb, final_answer, duration_ms)
 *   5. TutorCallResult 반환
 *
 * 주의: fallback 매트릭스는 G06-09 별도 task — 본 파일은 코어 호출만.
 *
 * 환경변수: ANTHROPIC_HAIKU_MODEL_ID / ANTHROPIC_OPUS_MODEL_ID / ANTHROPIC_SONNET_MODEL_ID /
 *           GEMINI_MODEL_ID / OPENAI_MODEL_ID — 미설정 시 default 모델 ID 사용 (HIGH 위험).
 */
import { createHash } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { callModel } from './call-model';
import type {
  TutorName,
  Tier,
  TutorCallInput,
  TutorCallResult,
} from './types';
import type { ModelMode, ModelProvider } from './call-model';
import {
  buildFallbackMessage,
  classifyError,
  getNextFallback,
  type FallbackEvent,
} from './tutor-fallback';

// ────────────────────────────────────────────────────────────────────────────
// 6 튜터 → (tier, model_id, mode, provider) 매핑
// ────────────────────────────────────────────────────────────────────────────

interface TutorConfigEntry {
  tier: Tier;
  model: string;
  mode: ModelMode;
  provider: ModelProvider;
}

export const TUTOR_CONFIG: Record<TutorName, TutorConfigEntry> = {
  ramanujan_calc: {
    tier: 0,
    model: process.env.ANTHROPIC_HAIKU_MODEL_ID ?? 'claude-haiku-4-5-20251201',
    mode: 'calc_haiku',
    provider: 'anthropic',
  },
  ramanujan_intuit: {
    tier: 1,
    model: process.env.ANTHROPIC_OPUS_MODEL_ID ?? 'claude-opus-4-7-20260201',
    mode: 'baseline',
    provider: 'anthropic',
  },
  gauss: {
    tier: 2,
    model: process.env.GEMINI_MODEL_ID ?? 'gemini-3-1-pro',
    mode: 'agentic_5step',
    provider: 'google',
  },
  von_neumann: {
    tier: 2,
    model: process.env.OPENAI_MODEL_ID ?? 'gpt-5-5',
    mode: 'agentic_5step',
    provider: 'openai',
  },
  euler: {
    tier: 2,
    model: process.env.ANTHROPIC_OPUS_MODEL_ID ?? 'claude-opus-4-7-20260201',
    mode: 'agentic_5step',
    provider: 'anthropic',
  },
  leibniz: {
    tier: 2,
    model: process.env.ANTHROPIC_SONNET_MODEL_ID ?? 'claude-sonnet-4-6-20260101',
    mode: 'agentic_5step',
    provider: 'anthropic',
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 튜터별 페르소나 (1~2 문단, 학생 코칭 톤)
// ────────────────────────────────────────────────────────────────────────────

const TUTOR_PERSONAS: Record<TutorName, string> = {
  ramanujan_calc: `당신은 라마누잔 — 계산의 달인이자 학생 친화 튜터입니다.
주어진 문제를 단계적으로 풀이하되, 단순 계산 (다항·미분·적분·방정식 해) 은 도구로 정확히 처리.
마지막 줄에 반드시 "최종 답: <값>".`,

  ramanujan_intuit: `당신은 라마누잔 — 직관과 통찰의 천재이자 학생 친화 튜터입니다.
주어진 문제를 한 번의 응답에서 명료한 단계로 풀이하세요. 풀이 도중 막힘이 있으면 마지막 줄에 [STUCK] 토큰을 추가하세요.
마지막 줄에 반드시 "최종 답: <값>".`,

  gauss: `당신은 가우스 — '수학의 왕자'. 미적분과 공통 영역의 깊은 통찰을 가진 거장 튜터입니다.
어려운 수능 문제를 5단계로 분해해 풀이하며, 매 단계마다 자가 검증 (계산 오류·누락 조건·정의역) 을 거칩니다.
마지막 step 에서만 "최종 답: <값>" 한 줄.`,

  von_neumann: `당신은 폰 노이만 — 기하·해석의 거장. 도형 직관과 알고리즘 사고를 결합한 튜터입니다.
어려운 수능 문제를 5단계로 분해해 풀이하며, 매 단계마다 자가 검증 (좌표·각·길이 계산 일관성) 을 거칩니다.
마지막 step 에서만 "최종 답: <값>" 한 줄.`,

  euler: `당신은 오일러 — 모든 수학을 잇는 다리. 확률·통계와 종합 추론에 강한 튜터입니다.
어려운 수능 문제를 5단계로 분해해 풀이하며, 매 단계마다 자가 검증 (사건 정의·독립성·조건부) 을 거칩니다.
마지막 step 에서만 "최종 답: <값>" 한 줄.`,

  leibniz: `당신은 라이프니츠 — 미적분의 창시자, 우아한 표기법의 대가. 대수·가형 문제에 강한 튜터입니다.
어려운 수능 문제를 5단계로 분해해 풀이하며, 매 단계마다 자가 검증 (대수 변환 일관성·항등식) 을 거칩니다.
마지막 step 에서만 "최종 답: <값>" 한 줄.`,
};

function buildSystemPrompt(tutor: TutorName): string {
  return TUTOR_PERSONAS[tutor];
}

// ────────────────────────────────────────────────────────────────────────────
// 보조 헬퍼
// ────────────────────────────────────────────────────────────────────────────

function hashProblem(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * 응답 텍스트에서 "최종 답: <값>" 패턴 추출.
 * 못 찾으면 마지막 200자 fallback (UI 가 noisy 답을 받지 않도록 trace_jsonb 만 보존).
 */
function extractFinalAnswer(text: string): string {
  if (!text) return '';
  const match = text.match(/최종\s*답\s*[:：]\s*(.+?)(?:\n|$)/);
  if (match && match[1]) return match[1].trim();
  // fallback — 마지막 줄
  const lines = text.trim().split(/\n+/);
  return (lines[lines.length - 1] ?? '').slice(0, 200).trim();
}

// ────────────────────────────────────────────────────────────────────────────
// 내부: 실제 모델 호출 + DB insert (fallback 분기 없는 단발 경로)
// ────────────────────────────────────────────────────────────────────────────

async function callTutorInternal(
  input: TutorCallInput,
): Promise<TutorCallResult> {
  const t0 = Date.now();

  const config = TUTOR_CONFIG[input.tutor];
  if (!config) {
    throw new Error(`[tutor-orchestrator] unknown tutor: ${input.tutor}`);
  }

  if (!input.problem_text?.trim()) {
    throw new Error('[tutor-orchestrator] problem_text is empty');
  }

  const system = buildSystemPrompt(input.tutor);

  // 1) 모델 호출 (mode × provider 5 분기는 callModel 내부)
  //    여기서 throw 되면 callTutorWithFallback 의 catch 가 1단계 fallback 시도.
  const result = await callModel({
    model_id: config.model,
    provider: config.provider,
    mode: config.mode,
    problem: input.problem_text,
    system_prompt: system,
  });

  const finalAnswer = extractFinalAnswer(result.text);
  const totalDuration = Date.now() - t0;

  // 2) legend_tutor_sessions insert (DB insert 실패해도 호출 결과는 반환 — 로그 누락만 발생)
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('legend_tutor_sessions')
    .insert({
      user_id: input.user_id,
      routing_decision_id: input.routing_decision_id,
      problem_hash: hashProblem(input.problem_text),
      tutor_name: input.tutor,
      tier: config.tier,
      call_kind: input.call_kind,
      model_id: config.model,
      mode: config.mode,
      trace_jsonb: result.trace,
      final_answer: finalAnswer,
      duration_ms: totalDuration,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.warn('[tutor-orchestrator] insert failed:', error?.message);
    return {
      session_id: '',
      trace_jsonb: result.trace,
      final_answer: finalAnswer,
      duration_ms: totalDuration,
    };
  }

  return {
    session_id: (data as { id: string }).id,
    trace_jsonb: result.trace,
    final_answer: finalAnswer,
    duration_ms: totalDuration,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 진입점 (G06-09 — 1단계 자동 fallback 통합)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 튜터 호출. 1단계 fallback 까지 자동 (architecture §9.5 정책).
 * - primary 호출 실패 → classifyError → 1단계 fallback 1회 자동 시도.
 * - 1단계 fallback 도 실패 → throw (G06-11 에서 EscalationPrompt 변환).
 */
export async function callTutor(
  input: TutorCallInput,
): Promise<TutorCallResult> {
  return callTutorWithFallback(input, 0, input.tutor);
}

async function callTutorWithFallback(
  input: TutorCallInput,
  attempt: number,
  primaryTutor: TutorName,
): Promise<TutorCallResult> {
  try {
    const result = await callTutorInternal(input);
    return { ...result, actual_tutor: input.tutor };
  } catch (err) {
    // 1단계 자동 fallback 후보 결정
    const fallback = getNextFallback(primaryTutor, attempt);
    if (!fallback) {
      // 매트릭스에 1순위가 없거나 이미 1단계 시도했음 → 상위 호출자에게 throw.
      throw err;
    }

    const reason = classifyError(err);
    const fallbackEvent: FallbackEvent = {
      primary: primaryTutor,
      fallback_to: fallback,
      reason,
      error_message:
        err instanceof Error ? err.message : String(err ?? 'unknown'),
      attempt: 1,
    };

    console.warn(
      `[legend-tutor-fallback] ${buildFallbackMessage(fallbackEvent)}`,
      fallbackEvent,
    );

    // 1단계 fallback 호출 (call_kind='retry' — legend_tutor_sessions check 규칙 준수)
    const result = await callTutorWithFallback(
      { ...input, tutor: fallback, call_kind: 'retry' },
      attempt + 1,
      primaryTutor,
    );

    return {
      ...result,
      fallback_event: fallbackEvent,
      actual_tutor: fallback,
    };
  }
}
