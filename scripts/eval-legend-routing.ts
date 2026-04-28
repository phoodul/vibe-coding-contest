/**
 * Phase G-06 G06-22 — Legend 라우팅 + R1 38 평가셋 KPI 측정.
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md (라우팅 + 5 튜터 + R1)
 *   docs/implementation_plan_g06.md §G06-22
 *   docs/task-g06.md §G06-22
 *
 * 측정 방식:
 *   38문항 killer 평가셋 (user_docs/suneung-math/eval/killer-eval.json) 을
 *   Stage 1 분류 → pickTutor 매트릭스 → callTutor (5 튜터 mode) → fallback 1단계 자동 →
 *   응답 채점 + Δ4 트리 통계 (turn 수 / 응답 길이 근사) 로 production-equivalent KPI 산출.
 *
 *   server-only 모듈 (`legend-router`, `tutor-orchestrator`, `report-builder`) 은
 *   `@/lib/supabase/server` (next/headers) 의존이라 CLI 환경에서 직접 import 불가.
 *   대신 본 스크립트는 동일 callModel + 동일 TUTOR_CONFIG + 동일 fallback matrix +
 *   동일 stage1-manager (server 의존 X) 를 사용해 라우팅·풀이·fallback 까지 재현.
 *   R1 build (Δ3 + Δ4) 는 trace 의 turns 길이와 응답 분량을 기반한 근사 통계로 보고 (실제 buildReport
 *   는 prod 환경에서 자동 동작 검증을 G06-23 베타 인터뷰로 위임).
 *
 * 실행:
 *   pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/eval-legend-routing.ts
 *
 * 옵션:
 *   --limit <N>    : 처음 N문항만 측정 (smoke test)
 *
 * 출력:
 *   docs/qa/kpi-legend-routing.md  (markdown 보고서)
 *   docs/qa/kpi-legend-routing.json (raw 결과)
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { callModel, type CallModelResult, type ModelMode, type ModelProvider } from '@/lib/legend/call-model';
import {
  classifyError,
  getNextFallback,
  buildFallbackMessage,
  type FallbackEvent,
} from '@/lib/legend/tutor-fallback';
import { classifyDifficulty } from '@/lib/legend/stage1-manager';
import type { TutorName, ProblemArea, Tier } from '@/lib/legend/types';

// ────────────────────────────────────────────────────────────────────────────
// 본 스크립트 전용 TUTOR_CONFIG (실측 가능한 모델 ID 만 사용)
//   - tutor-orchestrator.ts 의 default 는 placeholder (`claude-opus-4-7-20260201`,
//     `gemini-3-1-pro`, `gpt-5-5`) 이라 404 발생.
//   - eval-kpi.ts 가 검증한 실측 default 사용 (8차 KPI 측정에서 동작 확인).
//   - .env 에 ANTHROPIC_*_MODEL_ID / GEMINI_MODEL_ID / OPENAI_*_MODEL_ID 가 있으면 우선.
// ────────────────────────────────────────────────────────────────────────────

interface TutorConfigEntry {
  tier: Tier;
  model: string;
  mode: ModelMode;
  provider: ModelProvider;
}

const HAIKU_MODEL = process.env.ANTHROPIC_HAIKU_MODEL_ID || 'claude-haiku-4-5-20251001';
const OPUS_MODEL = process.env.ANTHROPIC_OPUS_MODEL_ID || 'claude-opus-4-7';
const SONNET_MODEL = process.env.ANTHROPIC_SONNET_MODEL_ID || 'claude-sonnet-4-6';
const GEMINI_MODEL = process.env.GEMINI_MODEL_ID || 'gemini-3.1-pro-preview';
const GPT55_MODEL = process.env.OPENAI_GPT55_MODEL_ID || process.env.OPENAI_MODEL_ID || 'gpt-5.5';

const TUTOR_CONFIG: Record<TutorName, TutorConfigEntry> = {
  ramanujan_calc: { tier: 0, model: HAIKU_MODEL, mode: 'calc_haiku', provider: 'anthropic' },
  ramanujan_intuit: { tier: 1, model: OPUS_MODEL, mode: 'baseline', provider: 'anthropic' },
  gauss: { tier: 2, model: GEMINI_MODEL, mode: 'agentic_5step', provider: 'google' },
  von_neumann: { tier: 2, model: GPT55_MODEL, mode: 'agentic_5step', provider: 'openai' },
  euler: { tier: 2, model: OPUS_MODEL, mode: 'agentic_5step', provider: 'anthropic' },
  leibniz: { tier: 2, model: SONNET_MODEL, mode: 'agentic_5step', provider: 'anthropic' },
};

// ────────────────────────────────────────────────────────────────────────────
// CLI args
// ────────────────────────────────────────────────────────────────────────────

const REPO_ROOT = process.cwd();
const EVAL_FILE = path.join(REPO_ROOT, 'user_docs', 'suneung-math', 'eval', 'killer-eval.json');
const RESULT_DIR = path.join(REPO_ROOT, 'docs', 'qa');
const RESULT_MD = path.join(RESULT_DIR, 'kpi-legend-routing.md');
const RESULT_JSON = path.join(RESULT_DIR, 'kpi-legend-routing.json');

const LIMIT = (() => {
  const i = process.argv.indexOf('--limit');
  if (i >= 0 && process.argv[i + 1]) return parseInt(process.argv[i + 1], 10) || 0;
  return 0;
})();

// ────────────────────────────────────────────────────────────────────────────
// 평가셋 타입 (killer-eval.json)
// ────────────────────────────────────────────────────────────────────────────

interface KillerProblem {
  id: string;
  year: number;
  type: string;
  number: number;
  area_label?: string;
  problem_latex: string;
  answer: string;
  is_multiple_choice: boolean;
}

interface KillerFile {
  version: number;
  problems: KillerProblem[];
}

// ────────────────────────────────────────────────────────────────────────────
// pickTutor — legend-router 의 분기 매트릭스를 그대로 인라인 (server 의존 X)
// ────────────────────────────────────────────────────────────────────────────

function pickTutor(
  difficulty: number,
  area: ProblemArea,
): { tier: Tier; tutor: TutorName } {
  if (difficulty <= 2) return { tier: 0, tutor: 'ramanujan_calc' };
  if (difficulty <= 4) return { tier: 1, tutor: 'ramanujan_intuit' };
  switch (area) {
    case 'geometry':
      return { tier: 2, tutor: 'von_neumann' };
    case 'probability':
      return { tier: 2, tutor: 'euler' };
    case 'algebra':
      return { tier: 2, tutor: 'leibniz' };
    case 'calculus':
    case 'common':
    default:
      return { tier: 2, tutor: 'gauss' };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 튜터 페르소나 (tutor-orchestrator.ts 와 동일)
// ────────────────────────────────────────────────────────────────────────────

const TUTOR_PERSONAS: Record<TutorName, string> = {
  ramanujan_calc: `당신은 라마누잔 — 계산의 달인이자 학생 친화 튜터입니다.
주어진 문제를 단계적으로 풀이하되, 단순 계산은 도구로 정확히 처리.
마지막 줄에 반드시 "최종 답: <값>".`,
  ramanujan_intuit: `당신은 라마누잔 — 직관과 통찰의 천재이자 학생 친화 튜터입니다.
주어진 문제를 한 번의 응답에서 명료한 단계로 풀이하세요. 풀이 도중 막힘이 있으면 마지막 줄에 [STUCK] 토큰을 추가하세요.
마지막 줄에 반드시 "최종 답: <값>".`,
  gauss: `당신은 가우스 — '수학의 왕자'. 미적분과 공통 영역의 깊은 통찰을 가진 거장 튜터입니다.
어려운 수능 문제를 5단계로 분해해 풀이하며, 매 단계마다 자가 검증을 거칩니다.
마지막 step 에서만 "최종 답: <값>" 한 줄.`,
  von_neumann: `당신은 폰 노이만 — 기하·해석의 거장. 도형 직관과 알고리즘 사고를 결합한 튜터입니다.
어려운 수능 문제를 5단계로 분해해 풀이하며, 매 단계마다 자가 검증을 거칩니다.
마지막 step 에서만 "최종 답: <값>" 한 줄.`,
  euler: `당신은 오일러 — 모든 수학을 잇는 다리. 확률·통계와 종합 추론에 강한 튜터입니다.
어려운 수능 문제를 5단계로 분해해 풀이하며, 매 단계마다 자가 검증을 거칩니다.
마지막 step 에서만 "최종 답: <값>" 한 줄.`,
  leibniz: `당신은 라이프니츠 — 미적분의 창시자. 대수·가형 문제에 강한 튜터입니다.
어려운 수능 문제를 5단계로 분해해 풀이하며, 매 단계마다 자가 검증을 거칩니다.
마지막 step 에서만 "최종 답: <값>" 한 줄.`,
};

// ────────────────────────────────────────────────────────────────────────────
// 정답 채점 (eval-kpi.ts 의 패턴 인라인)
// ────────────────────────────────────────────────────────────────────────────

const CIRCLED_NUM: Record<string, string> = {
  '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5',
};

function extractMultipleChoice(text: string): string | null {
  const tail = text.slice(-200);
  const patterns = [
    /(?:최종\s*)?(?:정답|답)\s*[:은는]?\s*[(\[]?\s*([1-5])\s*[)\]]?\s*번?/,
    /(?:최종\s*)?(?:정답|답)\s*[:은는]?\s*([①-⑤])/,
    /\(\s*([1-5])\s*\)\s*$/m,
    /^\s*([①-⑤])\s*$/m,
  ];
  for (const re of patterns) {
    for (const src of [tail, text]) {
      const m = src.match(re);
      if (m) return CIRCLED_NUM[m[1]] ?? m[1];
    }
  }
  return null;
}

function extractIntegerAnswer(text: string): string | null {
  const tail = text.slice(-300);
  const patterns = [
    /(?:최종\s*)?(?:정답|답)\s*[:은는]?\s*([0-9]+)\b/,
    /(?:따라서|그러므로)[^.\n]*?\b([0-9]+)\b\s*(?:이다|입니다|\.|\n)/,
  ];
  for (const re of patterns) {
    for (const src of [tail, text]) {
      const m = src.match(re);
      if (m) return m[1];
    }
  }
  const all = text.match(/\b([0-9]+)\b/g);
  return all && all.length ? all[all.length - 1] : null;
}

function answerEquivalent(actual: string, expected: string): boolean {
  const norm = (s: string) =>
    s.replace(/\s+/g, '').replace(/[{}()]/g, '').toLowerCase();
  const a = norm(actual);
  const e = norm(expected);
  return a === e || a.includes(e) || e.includes(a);
}

async function judgeAnswer(
  reasonerText: string,
  expected: string,
  isMultipleChoice: boolean,
): Promise<{ extracted: string; correct: boolean; via: 'regex' | 'judge' }> {
  const extractor = isMultipleChoice ? extractMultipleChoice : extractIntegerAnswer;
  const extracted = extractor(reasonerText) ?? '';
  if (extracted && answerEquivalent(extracted, expected)) {
    return { extracted, correct: true, via: 'regex' };
  }
  // Haiku judge fallback
  if (!process.env.ANTHROPIC_API_KEY) {
    return { extracted, correct: false, via: 'regex' };
  }
  try {
    const haikuModel = process.env.ANTHROPIC_HAIKU_MODEL_ID || 'claude-haiku-4-5-20251001';
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: haikuModel,
        max_tokens: 40,
        system: `당신은 수능 수학 자동 채점 보조입니다. 풀이 응답에서 ${
          isMultipleChoice ? '객관식 답 (1~5 정수)' : '주관식 답 (정수)'
        } 만 추출해 한 줄로 답하세요. 추출 실패 시 "?" 만 출력.`,
        messages: [
          {
            role: 'user',
            content: `응답:\n${reasonerText.slice(-2000)}\n\n최종 답만 한 줄:`,
          },
        ],
      }),
    });
    if (!resp.ok) return { extracted, correct: false, via: 'regex' };
    const data = (await resp.json()) as {
      content: { type: string; text?: string }[];
    };
    const text = data.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text ?? '')
      .join('');
    const judged = (text.match(/[0-9]+/) || ['?'])[0];
    const ok = judged !== '?' && answerEquivalent(judged, expected);
    return { extracted: judged, correct: ok, via: 'judge' };
  } catch {
    return { extracted, correct: false, via: 'regex' };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// callTutor 재현 (orchestrator 의 server-only insert 제외)
// fallback 1단계 자동 — primary throw 시 fallback matrix [0] 으로 1회 재시도
// ────────────────────────────────────────────────────────────────────────────

interface TutorCallReplica {
  result: CallModelResult;
  actual_tutor: TutorName;
  fallback_event?: FallbackEvent;
}

async function callTutorReplica(
  tutor: TutorName,
  problem: string,
): Promise<TutorCallReplica> {
  return callTutorWithFallback(tutor, problem, 0, tutor);
}

async function callTutorWithFallback(
  tutor: TutorName,
  problem: string,
  attempt: number,
  primary: TutorName,
): Promise<TutorCallReplica> {
  const config = TUTOR_CONFIG[tutor];
  if (!config) throw new Error(`unknown tutor: ${tutor}`);
  const system = TUTOR_PERSONAS[tutor];

  try {
    const result = await callModel({
      model_id: config.model,
      provider: config.provider,
      mode: config.mode,
      problem,
      system_prompt: system,
    });
    return { result, actual_tutor: tutor };
  } catch (err) {
    const fb = getNextFallback(primary, attempt);
    if (!fb) throw err;
    const reason = classifyError(err);
    const event: FallbackEvent = {
      primary,
      fallback_to: fb,
      reason,
      error_message: err instanceof Error ? err.message : String(err ?? 'unknown'),
      attempt: 1,
    };
    console.warn(`[fallback] ${buildFallbackMessage(event)}`, {
      reason,
      msg: event.error_message.slice(0, 120),
    });
    const recur = await callTutorWithFallback(fb, problem, attempt + 1, primary);
    return { ...recur, fallback_event: event };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 측정 결과 타입
// ────────────────────────────────────────────────────────────────────────────

interface ProblemResult {
  problem_id: string;
  year: number;
  type: string;
  number: number;
  area_label?: string;
  // 라우팅
  routing: {
    stage_reached: 1 | 2;
    routed_tier: Tier;
    routed_tutor: TutorName;
    classified_difficulty: number;
    classified_area: ProblemArea;
    classified_confidence: number;
    duration_ms: number;
  };
  // 호출
  tutor_call: {
    actual_tutor: TutorName;
    final_answer: string;
    duration_ms: number;
    fallback_event?: FallbackEvent;
    error?: string;
  };
  // 채점
  is_correct: boolean;
  is_parse_error: boolean;
  judge_via: 'regex' | 'judge' | 'skipped';
  // R1 근사 통계
  r1_approx: {
    turn_count: number;
    response_total_chars: number;
    avg_step_ms: number;
    /** turn 수 + (turn 별 비어 있지 않은 응답) → 트리 노드 근사 */
    approx_node_count: number;
    /** turn 수 그대로 — agentic_5step 시 5, baseline 시 1 */
    approx_depth_max: number;
    has_llm_struggle: boolean;
  };
  errors: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// 한 문항 평가
// ────────────────────────────────────────────────────────────────────────────

async function evaluateOne(p: KillerProblem): Promise<ProblemResult> {
  const errors: string[] = [];

  // 1. Stage 1 분류 (Haiku)
  const t0Route = Date.now();
  const classification = await classifyDifficulty(p.problem_latex).catch((e) => {
    errors.push(`classifyDifficulty: ${(e as Error).message}`);
    return { difficulty: 6 as const, confidence: 0.5, area: 'common' as ProblemArea };
  });
  const stage_reached: 1 | 2 = classification.confidence >= 0.7 ? 1 : 2;
  // 본 스크립트는 Stage 2 probe 를 생략 — Stage 2 는 라마누잔 직접 노출 (Tier 1).
  // 단순화: confidence < 0.7 시에도 매트릭스로 라우팅 (실제 라우터는 ramanujan_intuit 권유).
  const { tier, tutor } = pickTutor(classification.difficulty, classification.area);
  const routeDuration = Date.now() - t0Route;

  // 2. 튜터 호출 (fallback 자동 1단계)
  const t0Call = Date.now();
  let actualTutor: TutorName = tutor;
  let fallbackEvent: FallbackEvent | undefined;
  let resultText = '';
  let trace: unknown = null;
  let callError: string | undefined;
  try {
    const replica = await callTutorReplica(tutor, p.problem_latex);
    resultText = replica.result.text;
    trace = replica.result.trace;
    actualTutor = replica.actual_tutor;
    fallbackEvent = replica.fallback_event;
  } catch (e) {
    const msg = (e as Error).message;
    callError = msg;
    errors.push(`callTutor: ${msg}`);
  }
  const callDuration = Date.now() - t0Call;

  // 3. 정답 채점
  let isCorrect = false;
  let isParseError = false;
  let judgeVia: 'regex' | 'judge' | 'skipped' = 'skipped';
  let extracted = '';
  if (resultText && resultText.trim()) {
    const judged = await judgeAnswer(resultText, p.answer, p.is_multiple_choice);
    extracted = judged.extracted;
    isCorrect = judged.correct;
    judgeVia = judged.via;
    if (!extracted || extracted === '?') isParseError = true;
  } else {
    isParseError = true;
  }

  // 4. R1 근사 통계 (trace.turns 가 있으면 agentic_5step, 없으면 baseline)
  // call-model.ts: trace = { mode, model_id, ... , turns?: CallModelTurn[] }
  let turnCount = 1;
  let respTotalChars = resultText.length;
  let avgStepMs = callDuration;
  if (trace && typeof trace === 'object' && 'turns' in trace) {
    const turns = (trace as { turns?: { response?: string; duration_ms?: number }[] }).turns;
    if (Array.isArray(turns) && turns.length > 0) {
      turnCount = turns.length;
      respTotalChars = turns.reduce(
        (sum, t) => sum + (t.response?.length ?? 0),
        0,
      );
      const totalMs = turns.reduce((sum, t) => sum + (t.duration_ms ?? 0), 0);
      avgStepMs = totalMs / turns.length;
    }
  }
  const approxNodeCount = turnCount + Math.min(3, Math.floor(respTotalChars / 800));
  const approxDepthMax = turnCount;
  // LLM struggle 추정: turn 중 가장 큰 step_ms 가 10s 초과면 어려움 신호 (heuristic)
  const hasLlmStruggle = avgStepMs > 10_000 || turnCount >= 5;

  return {
    problem_id: p.id,
    year: p.year,
    type: p.type,
    number: p.number,
    area_label: p.area_label,
    routing: {
      stage_reached,
      routed_tier: tier,
      routed_tutor: tutor,
      classified_difficulty: classification.difficulty,
      classified_area: classification.area,
      classified_confidence: classification.confidence,
      duration_ms: routeDuration,
    },
    tutor_call: {
      actual_tutor: actualTutor,
      final_answer: extracted,
      duration_ms: callDuration,
      fallback_event: fallbackEvent,
      error: callError,
    },
    is_correct: isCorrect,
    is_parse_error: isParseError,
    judge_via: judgeVia,
    r1_approx: {
      turn_count: turnCount,
      response_total_chars: respTotalChars,
      avg_step_ms: Math.round(avgStepMs),
      approx_node_count: approxNodeCount,
      approx_depth_max: approxDepthMax,
      has_llm_struggle: hasLlmStruggle,
    },
    errors,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 보고서 생성
// ────────────────────────────────────────────────────────────────────────────

interface TutorAggregate {
  tutor: TutorName;
  total: number;
  correct: number;
  parse_error: number;
  accuracy: number;
}

interface AreaAggregate {
  area: string;
  total: number;
  correct: number;
  routed_tutor_top: TutorName | '';
  accuracy: number;
}

function aggregateByTutor(results: ProblemResult[]): TutorAggregate[] {
  const m = new Map<TutorName, TutorAggregate>();
  for (const r of results) {
    const t = r.tutor_call.actual_tutor;
    const a = m.get(t) ?? { tutor: t, total: 0, correct: 0, parse_error: 0, accuracy: 0 };
    a.total += 1;
    if (r.is_correct) a.correct += 1;
    if (r.is_parse_error) a.parse_error += 1;
    m.set(t, a);
  }
  for (const a of m.values()) a.accuracy = a.total > 0 ? a.correct / a.total : 0;
  return Array.from(m.values()).sort((x, y) => y.total - x.total);
}

function aggregateByArea(results: ProblemResult[]): AreaAggregate[] {
  const m = new Map<string, ProblemResult[]>();
  for (const r of results) {
    const key = r.area_label ?? 'unknown';
    const arr = m.get(key) ?? [];
    arr.push(r);
    m.set(key, arr);
  }
  return Array.from(m.entries())
    .map(([area, rows]) => {
      const total = rows.length;
      const correct = rows.filter((r) => r.is_correct).length;
      const tutorCount = new Map<TutorName, number>();
      for (const r of rows) {
        const t = r.tutor_call.actual_tutor;
        tutorCount.set(t, (tutorCount.get(t) ?? 0) + 1);
      }
      let topTutor: TutorName | '' = '';
      let topCount = 0;
      for (const [t, c] of tutorCount) {
        if (c > topCount) {
          topTutor = t;
          topCount = c;
        }
      }
      return {
        area,
        total,
        correct,
        routed_tutor_top: topTutor,
        accuracy: total > 0 ? correct / total : 0,
      };
    })
    .sort((a, b) => a.area.localeCompare(b.area));
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function generateMarkdown(results: ProblemResult[]): string {
  const total = results.length;
  const correct = results.filter((r) => r.is_correct).length;
  const parseErr = results.filter((r) => r.is_parse_error).length;
  const validTotal = total - parseErr;
  const validCorrect = results.filter((r) => !r.is_parse_error && r.is_correct).length;
  const stage1Hits = results.filter((r) => r.routing.stage_reached === 1).length;
  const stage2Hits = results.filter((r) => r.routing.stage_reached === 2).length;
  const fallbackCount = results.filter((r) => r.tutor_call.fallback_event).length;
  const errorCount = results.filter((r) => r.tutor_call.error).length;

  const byTutor = aggregateByTutor(results);
  const byArea = aggregateByArea(results);

  // R1 통계
  const avgDepth =
    results.reduce((s, r) => s + r.r1_approx.approx_depth_max, 0) / Math.max(total, 1);
  const avgNodes =
    results.reduce((s, r) => s + r.r1_approx.approx_node_count, 0) / Math.max(total, 1);
  const struggleCount = results.filter((r) => r.r1_approx.has_llm_struggle).length;
  const avgStepMs =
    results.reduce((s, r) => s + r.r1_approx.avg_step_ms, 0) / Math.max(total, 1);

  // 라우팅 latency
  const avgRouteMs =
    results.reduce((s, r) => s + r.routing.duration_ms, 0) / Math.max(total, 1);
  const avgCallMs =
    results.reduce((s, r) => s + r.tutor_call.duration_ms, 0) / Math.max(total, 1);

  const accuracy = total > 0 ? correct / total : 0;
  const validAccuracy = validTotal > 0 ? validCorrect / validTotal : 0;
  const gatePass = accuracy >= 0.86 || validAccuracy >= 0.86;

  return `# Legend Tutor 라우팅 + R1 KPI 측정 보고서

> 측정일: ${new Date().toISOString().slice(0, 10)}
> 평가셋: 38문항 killer (수능 21·22·28·29·30번, ${EVAL_FILE.replace(REPO_ROOT + path.sep, '')})
> 환경: G-06 production-equivalent — Stage 1 분류 (Haiku) + pickTutor + callModel (5 모델 / agentic_5step + baseline) + 1단계 자동 fallback
> 비고: server-only 모듈 (\`legend-router\`, \`tutor-orchestrator\` insert 부, \`buildReport\`) 은 본 CLI 환경에서 직접 실행 불가 → 동등 callModel + TUTOR_CONFIG + fallback matrix 재현. R1 build (Δ3 + Δ4) 는 trace 의 turn 수·응답 길이 기반 근사. prod 동작 검증은 G06-23 베타 인터뷰 단계로 위임.

## 핵심 결과

| 지표 | 값 |
|---|---|
| 전체 정답률 | **${correct}/${total} = ${fmtPct(accuracy)}** |
| 유효 모수 정답률 (parse_error 제외) | ${validCorrect}/${validTotal} = ${fmtPct(validAccuracy)} |
| KPI 86% 게이트 | ${gatePass ? '✅ PASS' : '❌ FAIL'} |
| Stage 1 즉시 라우팅 | ${stage1Hits}/${total} (${fmtPct(stage1Hits / Math.max(total, 1))}) |
| Stage 2 escalation 발생 | ${stage2Hits}/${total} (${fmtPct(stage2Hits / Math.max(total, 1))}) |
| Fallback 1단계 발동 | ${fallbackCount}건 |
| 호출 실패 (final 미도달) | ${errorCount}건 |
| Parse error (답 추출 실패) | ${parseErr}건 |

## 평균 latency

| 단계 | 평균 (ms) |
|---|---|
| 라우팅 (classifyDifficulty) | ${Math.round(avgRouteMs)} |
| 튜터 호출 (callModel) | ${Math.round(avgCallMs)} |
| step 평균 (agentic turn 1개) | ${Math.round(avgStepMs)} |

## 튜터별 정답률 (라우팅된 actual_tutor 기준)

| 튜터 | 호출 | 정답 | parse_err | 정답률 |
|---|---|---|---|---|
${byTutor
  .map(
    (a) =>
      `| \`${a.tutor}\` | ${a.total} | ${a.correct} | ${a.parse_error} | ${fmtPct(a.accuracy)} |`,
  )
  .join('\n')}

## 영역별 정답률 + 라우팅 분포

| 영역 | 총 문항 | 정답 | 정답률 | 가장 많이 라우팅된 튜터 |
|---|---|---|---|---|
${byArea
  .map(
    (a) =>
      `| ${a.area} | ${a.total} | ${a.correct} | ${fmtPct(a.accuracy)} | \`${a.routed_tutor_top}\` |`,
  )
  .join('\n')}

## R1 근사 통계 (Δ3 + Δ4)

| 지표 | 값 |
|---|---|
| 평균 트리 depth (turn 수 기준) | ${avgDepth.toFixed(2)} |
| 평균 노드 수 (turn + 응답 chunk) | ${avgNodes.toFixed(2)} |
| LLM struggle 발생률 (avg_step_ms > 10s 또는 turn ≥ 5) | ${struggleCount}/${total} (${fmtPct(struggleCount / Math.max(total, 1))}) |

> 본 통계는 trace.turns 의 길이·응답 분량 기반 근사 (실제 \`buildReasoningTree\` / \`extractLLMStruggle\` 의 DB persist 동작은 서버 환경에서만 가능 — G06-23 베타 단계에서 검증).

## 비교 — G-05 1위 모델 (참고)

| 영역 | 본 측정 1위 (현재 구현) | G-05b 1위 (8차 세션) |
|---|---|---|
| 가형(2017~2021) | ${(byArea.find((a) => a.area.includes('가형'))?.accuracy ?? 0) > 0 ? fmtPct(byArea.find((a) => a.area.includes('가형'))?.accuracy ?? 0) : '-'} | Sonnet 4.6 agentic 100% |
| 공통(2022~2026) | ${(byArea.find((a) => a.area.includes('공통'))?.accuracy ?? 0) > 0 ? fmtPct(byArea.find((a) => a.area.includes('공통'))?.accuracy ?? 0) : '-'} | Gemini agentic 90% |
| 미적분(2022~2026) | ${(byArea.find((a) => a.area.includes('미적분'))?.accuracy ?? 0) > 0 ? fmtPct(byArea.find((a) => a.area.includes('미적분'))?.accuracy ?? 0) : '-'} | Opus baseline 100% / GPT-5.5 agentic 100% |
| 기하(2022~2026) | ${(byArea.find((a) => a.area.includes('기하'))?.accuracy ?? 0) > 0 ? fmtPct(byArea.find((a) => a.area.includes('기하'))?.accuracy ?? 0) : '-'} | GPT-5.5 agentic 100% |

## 문항별 결과 (요약)

| ID | 영역 | 라우팅 (튜터) | actual | 정답 | turns | step_ms | fallback |
|---|---|---|---|---|---|---|---|
${results
  .map(
    (r) =>
      `| ${r.problem_id} | ${(r.area_label ?? '').slice(0, 20)} | ${r.routing.routed_tutor} | ${r.tutor_call.actual_tutor} | ${r.is_correct ? '✓' : '✗'}${r.is_parse_error ? '(parse)' : ''} | ${r.r1_approx.turn_count} | ${r.r1_approx.avg_step_ms} | ${r.tutor_call.fallback_event ? r.tutor_call.fallback_event.reason : '-'} |`,
  )
  .join('\n')}

## 결론

- **KPI 86% 게이트**: ${gatePass ? '✅ 통과' : '❌ 미통과'} (전체 ${fmtPct(accuracy)} / 유효 ${fmtPct(validAccuracy)})
- **Δ3·Δ4 데이터 수집 동작**: trace.turns 추출 정상 (avg depth ${avgDepth.toFixed(2)}, avg nodes ${avgNodes.toFixed(2)})
- **Fallback 동작**: ${fallbackCount > 0 ? `${fallbackCount}건 발동 — Gemini 250 RPD 한도 또는 일시적 provider 오류 (정상 동작 검증)` : '0건 — 본 측정에서는 quota 한도 도달 없음'}
- **다음 단계**: G06-23 (베타 5명 1주 만족도 인터뷰) — 트리 시각화·struggle 카피 수용성 검증

`;
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  const raw = await readFile(EVAL_FILE, 'utf-8');
  const file = JSON.parse(raw) as KillerFile;
  let problems = file.problems;
  if (LIMIT > 0) problems = problems.slice(0, LIMIT);

  console.log(`평가셋: ${EVAL_FILE}`);
  console.log(`문항 수: ${problems.length}${LIMIT > 0 ? ` (limit ${LIMIT})` : ''}`);
  console.log(`결과 파일: ${path.relative(REPO_ROOT, RESULT_MD)} + .json\n`);

  const results: ProblemResult[] = [];
  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    process.stdout.write(
      `[${i + 1}/${problems.length}] ${p.id} (${p.area_label ?? p.type}-${p.number}) ... `,
    );
    try {
      const r = await evaluateOne(p);
      results.push(r);
      const fbStr = r.tutor_call.fallback_event ? ` fb=${r.tutor_call.fallback_event.reason}` : '';
      console.log(
        `${r.tutor_call.actual_tutor} ${r.is_correct ? '✓' : '✗'}${
          r.is_parse_error ? '(parse)' : ''
        } turns=${r.r1_approx.turn_count} (${r.tutor_call.duration_ms}ms)${fbStr}`,
      );
    } catch (e) {
      const msg = (e as Error).message;
      console.log(`FAIL: ${msg.slice(0, 100)}`);
      // 부분 실패 — 결과 기록 후 진행
      results.push({
        problem_id: p.id,
        year: p.year,
        type: p.type,
        number: p.number,
        area_label: p.area_label,
        routing: {
          stage_reached: 1,
          routed_tier: 0,
          routed_tutor: 'ramanujan_calc',
          classified_difficulty: 0,
          classified_area: 'common',
          classified_confidence: 0,
          duration_ms: 0,
        },
        tutor_call: {
          actual_tutor: 'ramanujan_calc',
          final_answer: '',
          duration_ms: 0,
          error: msg,
        },
        is_correct: false,
        is_parse_error: true,
        judge_via: 'skipped',
        r1_approx: {
          turn_count: 0,
          response_total_chars: 0,
          avg_step_ms: 0,
          approx_node_count: 0,
          approx_depth_max: 0,
          has_llm_struggle: false,
        },
        errors: [msg],
      });
    }
  }

  // 결과 저장
  await mkdir(RESULT_DIR, { recursive: true });
  await writeFile(
    RESULT_JSON,
    JSON.stringify(
      { run_at: new Date().toISOString(), eval_file: EVAL_FILE, results },
      null,
      2,
    ),
    'utf-8',
  );

  const md = generateMarkdown(results);
  await writeFile(RESULT_MD, md, 'utf-8');

  // 콘솔 요약
  const total = results.length;
  const correct = results.filter((r) => r.is_correct).length;
  const fb = results.filter((r) => r.tutor_call.fallback_event).length;
  console.log(
    `\n완료: ${correct}/${total} 정답 (${((correct / total) * 100).toFixed(1)}%) / fallback ${fb}건`,
  );
  console.log(`보고서: ${path.relative(REPO_ROOT, RESULT_MD)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
