/**
 * Phase G-06 G06-12 — chain step → trigger 매핑 + DB insert.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §5.2 (모듈 시그니처) +
 *             §3.3 (solve_step_decomposition 스키마).
 *
 * 알고리즘:
 *   1. trace → NormalizedTurn[] (trace-normalizer)
 *   2. 각 turn 마다:
 *      - tool_calls 가 있으면 각 tool 마다 PerProblemStep(kind='tool_call') 생성
 *      - 추가로 turn 의 reasoning text 자체에서 step_kind heuristic 분류 (parse / forward / backward / answer / verify / computation / domain_id)
 *   3. trigger 매칭 3-tier:
 *      - 1차: tool_call → math_tools.id 직접 lookup (또는 같은 tool_id 의 trigger 1개)
 *      - 2차: text → embedText → match_math_tool_triggers RPC (cosine ≥ 0.7)
 *      - 3차: 매칭 실패 → null (Haiku fallback 은 G06-13 에서 통합)
 *   4. pivotal: max difficulty (tie-break: kind='tool_call' 우선)
 *   5. solve_step_decomposition insert
 *
 * 영향 격리: src/lib/legend/report/ 전용. retriever/embed 는 read-only import.
 */

import { createClient } from '@/lib/supabase/server';
import { embedText } from '@/lib/euler/embed';
import { callModel } from '@/lib/legend/call-model';
import { tryParseJson } from '@/lib/euler/json';
import type { PerProblemStep } from '@/lib/legend/types';
import { normalizeTrace, type NormalizedTurn, type Provider } from './trace-normalizer';

// G06-35d: ANN cosine threshold 완화 (베타 결함 4 fix — trigger 추출 0건 방지).
// 0.7 (정밀) → 0.5 (회수율 우선). 의미 불일치는 나중에 1순위 1건만 채택해 완화.
const STEP_MATCH_THRESHOLD = 0.5;

/** G06-35d: agentic_5step 응답 시작에 callTutor 가 강제하는 마커 정규식. */
const STEP_KIND_MARKER_RE = /\[STEP_KIND:\s*(parse|domain_id|forward|backward|tool_call|computation|verify|answer)\s*\]/i;
const TRIGGER_MARKER_RE = /\[TRIGGER:\s*([^\]\n]+?)\s*\]/i;

const VALID_STEP_KINDS = new Set<PerProblemStep['kind']>([
  'parse',
  'domain_id',
  'forward',
  'backward',
  'tool_call',
  'computation',
  'verify',
  'answer',
]);

/**
 * G06-35d — agentic 응답에서 [STEP_KIND: ...] 마커 추출 (1차 — 정확).
 * 매칭 실패 시 null → classifyStepKind heuristic fallback.
 */
export function extractStepKindMarker(text: string): PerProblemStep['kind'] | null {
  if (!text) return null;
  const m = text.match(STEP_KIND_MARKER_RE);
  if (!m) return null;
  const kind = m[1].toLowerCase() as PerProblemStep['kind'];
  return VALID_STEP_KINDS.has(kind) ? kind : null;
}

/**
 * G06-35d — agentic 응답에서 [TRIGGER: ...] 마커 추출.
 * "없음" 또는 빈 문자열은 null. text 그대로 반환 (한글 도구 이름).
 */
export function extractTriggerMarker(text: string): string | null {
  if (!text) return null;
  const m = text.match(TRIGGER_MARKER_RE);
  if (!m) return null;
  const raw = m[1].trim();
  if (!raw || raw === '없음' || raw === 'none' || raw === 'None') return null;
  // 마지막 'trigger' 접미사 제거 — DB 도구 이름과 매칭 정확도 향상
  return raw.replace(/\s*trigger\s*$/i, '').trim();
}

interface TriggerMatch {
  trigger_id: string;
  tool_id: string;
}

// ────────────────────────────────────────────────────────────────────────────
// step_kind heuristic 분류
// ────────────────────────────────────────────────────────────────────────────

export function classifyStepKind(text: string): PerProblemStep['kind'] {
  if (!text || !text.trim()) return 'forward';

  // 우선순위: 명시적 신호가 강한 것부터.
  if (/(최종\s*답|결론|따라서|그러므로)/.test(text)) return 'answer';
  if (/(검증|확인|체크|재확인|sanity)/.test(text)) return 'verify';
  if (/(역으로|역추적|구하려면|필요한 것|subgoal|backward)/.test(text)) return 'backward';
  if (/(영역|범위|정의역|치역|domain)/.test(text)) return 'domain_id';
  if (/(문제\s*분해|구해야 할 것|조건\s*[:：]|주어진|문제 구조화|구조화)/.test(text)) return 'parse';
  if (/(계산|값을 구|값:|=\s*[-+\d])/.test(text)) return 'computation';
  return 'forward';
}

export function estimateDifficulty(turn: NormalizedTurn): number {
  // reasoning 길이 + tool_calls 수 가중. 1~6 clamp.
  const baseFromChars =
    turn.reasoning_chars > 3000
      ? 5
      : turn.reasoning_chars > 1500
        ? 4
        : turn.reasoning_chars > 500
          ? 3
          : 2;
  const toolBoost = Math.min(turn.tool_calls.length, 2); // tool 사용 자체가 난이도 신호
  const d = baseFromChars + toolBoost;
  return Math.max(1, Math.min(6, d));
}

export function selectPivotal(steps: PerProblemStep[]): number {
  if (steps.length === 0) return -1;
  let bestIdx = 0;
  let bestScore = -1;
  steps.forEach((s, i) => {
    // difficulty × 10 + tool_call tie-break
    const score = (s.difficulty ?? 0) * 10 + (s.kind === 'tool_call' ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });
  return bestIdx;
}

// ────────────────────────────────────────────────────────────────────────────
// trigger 매칭 (3-tier)
// ────────────────────────────────────────────────────────────────────────────

/** 1차: tool_name → math_tools.id / first trigger lookup. */
export async function matchTriggerByToolName(tool_name: string): Promise<TriggerMatch | null> {
  if (!tool_name) return null;
  try {
    const supabase = await createClient();
    // math_tools.id (text PK) 또는 name (한글) 양방향 lookup
    const { data: tools, error: e1 } = await supabase
      .from('math_tools')
      .select('id, name')
      .or(`id.eq.${tool_name},name.eq.${tool_name}`)
      .limit(1);
    if (e1 || !tools?.length) return null;
    const tool_id = tools[0].id as string;
    const { data: triggers, error: e2 } = await supabase
      .from('math_tool_triggers')
      .select('id')
      .eq('tool_id', tool_id)
      .limit(1);
    if (e2 || !triggers?.length) {
      // tool 은 있으나 trigger 가 없는 경우 — tool_id 만 보존
      return { trigger_id: '', tool_id };
    }
    return { trigger_id: triggers[0].id as string, tool_id };
  } catch (e) {
    console.warn('[step-decomposer] matchTriggerByToolName failed:', (e as Error).message);
    return null;
  }
}

/** 2차: text → embed → match_math_tool_triggers ANN ≥ 0.7. */
export async function matchTriggerByText(text: string): Promise<TriggerMatch | null> {
  const cleaned = (text ?? '').trim();
  if (!cleaned) return null;
  try {
    const embedding = await embedText(cleaned);
    if (!embedding || embedding.length === 0) return null;
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('match_math_tool_triggers', {
      query_embedding: embedding,
      direction_filter: 'both',
      match_count: 1,
    });
    if (error) {
      console.warn('[step-decomposer] match_math_tool_triggers failed:', error.message);
      return null;
    }
    const rows = (data ?? []) as { trigger_id: string; tool_id: string; similarity: number }[];
    if (!rows.length) return null;
    const top = rows[0];
    if (typeof top.similarity !== 'number' || top.similarity < STEP_MATCH_THRESHOLD) return null;
    return { trigger_id: top.trigger_id, tool_id: top.tool_id };
  } catch (e) {
    console.warn('[step-decomposer] matchTriggerByText failed:', (e as Error).message);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 진입점
// ────────────────────────────────────────────────────────────────────────────

export interface DecomposeOptions {
  /** test 시 supabase insert 생략 (vitest mock 우선) */
  skipPersist?: boolean;
}

/**
 * Δ16 — 빈 trace fallback. trace 가 빈 또는 normalizeTrace 가 0 turn 일 때
 * Sonnet 4.6 으로 problem + final_answer 직접 분석해 5~8 step 추출.
 *
 * "0단계 / 단계가 추출되지 않았습니다" 메시지가 학생에게 보이지 않도록.
 */
const STEP_FALLBACK_SYSTEM = `당신은 수학 풀이 분석가입니다. 주어진 수학 문제와 풀이 텍스트를 5~8 개의 의미있는 step 으로 분해해 JSON 으로 응답합니다.

각 step 은 풀이의 하나의 사고 도약 단계입니다.

## step.kind 종류
- "parse": 문제 구조 파악, 조건 정리
- "domain_id": 영역·정의역·치역·범위 식별
- "forward": 조건에서 사실 도출 (순방향 추론)
- "backward": 답에서 역추적 (subgoal 분해)
- "tool_call": 정리·공식·도구 적용 (예: 평균값 정리, IVT, 부분적분)
- "computation": 계산 수행
- "verify": 검증·확인
- "answer": 최종 답 도출

## difficulty (1~6)
1~2: 단순 정의 적용 / 3~4: 표준 기법 / 5~6: 고난도 사고 도약

## 출력 (JSON 만, 코드펜스·해설 금지)
{
  "steps": [
    {"kind": "parse", "summary": "구체적 한 줄 요약 (60자 내)", "difficulty": 2},
    {"kind": "forward", "summary": "...", "difficulty": 3},
    ...
  ]
}

규칙:
- 5~8 개 step 강제. 너무 적으면 빈약, 너무 많으면 노이즈.
- summary 는 학생이 읽고 무슨 사고였는지 즉시 이해할 수준의 구체성.
- pivotal (가장 어려운) 단계가 명백하면 difficulty 5~6 으로 표시.`;

interface FallbackStepJson {
  kind?: string;
  summary?: string;
  difficulty?: number;
}

async function decomposeWithLLMFallback(
  problem_text: string,
  trace: unknown,
): Promise<PerProblemStep[]> {
  // trace 에서 final answer text 추출 시도
  let answerText = '';
  try {
    if (trace && typeof trace === 'object') {
      const t = trace as { text?: string; final_answer?: string };
      answerText = (t.text ?? t.final_answer ?? '').slice(0, 3000);
    }
  } catch {
    // ignore
  }

  const prompt = `### 원문제
${problem_text.slice(0, 2000)}

${answerText ? `### 풀이 텍스트 (LLM 응답)\n${answerText}` : '### 풀이 텍스트\n(없음 — 문제만 보고 표준 풀이 흐름 추론)'}

위 풀이를 5~8 step 으로 분해. JSON 만.`;

  try {
    const result = await callModel({
      model_id:
        process.env.LEGEND_REPORT_MODEL ??
        process.env.ANTHROPIC_SONNET_MODEL_ID ??
        'claude-sonnet-4-6',
      provider: 'anthropic',
      mode: 'baseline',
      problem: prompt,
      system_prompt: STEP_FALLBACK_SYSTEM,
      max_tokens: 2500,
    });
    const parsed = tryParseJson<{ steps?: FallbackStepJson[] }>((result.text ?? '').trim());
    const raw = parsed?.steps;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    const steps: PerProblemStep[] = [];
    raw.forEach((s, i) => {
      const kindRaw = (s.kind ?? '').toLowerCase();
      const kind: PerProblemStep['kind'] = VALID_STEP_KINDS.has(
        kindRaw as PerProblemStep['kind'],
      )
        ? (kindRaw as PerProblemStep['kind'])
        : 'forward';
      const summary =
        typeof s.summary === 'string' && s.summary.trim()
          ? s.summary.trim().slice(0, 200)
          : `${i + 1}단계`;
      const difficulty =
        typeof s.difficulty === 'number'
          ? Math.max(1, Math.min(6, Math.floor(s.difficulty)))
          : 3;
      steps.push({
        index: i,
        kind,
        summary,
        difficulty,
        is_pivotal: false,
      });
    });
    if (steps.length === 0) return [];

    // pivotal 선정
    const pivotalIdx = selectPivotal(steps);
    if (pivotalIdx >= 0) steps[pivotalIdx].is_pivotal = true;
    return steps;
  } catch (e) {
    console.warn('[step-decomposer] LLM fallback failed:', (e as Error).message);
    return [];
  }
}

export async function decomposeChainSteps(
  trace: unknown,
  session_id: string,
  provider: Provider,
  opts: DecomposeOptions = {},
  /** Δ16 — LLM fallback 활성화 시 problem_text 필요 */
  problem_text?: string,
): Promise<PerProblemStep[]> {
  const turns = normalizeTrace(trace, provider);
  const steps: PerProblemStep[] = [];
  let stepIndex = 0;

  for (const turn of turns) {
    const turnDifficulty = estimateDifficulty(turn);

    // 1) tool_calls 가 있으면 각 tool 마다 step (tool_call kind)
    for (const tc of turn.tool_calls) {
      const trig = await matchTriggerByToolName(tc.tool_name);
      steps.push({
        index: stepIndex++,
        kind: 'tool_call',
        summary: `${tc.tool_name} 호출`,
        difficulty: Math.max(turnDifficulty, 4), // tool_call 은 최소 4
        is_pivotal: false,
        trigger_id: trig?.trigger_id || undefined,
        tool_id: trig?.tool_id,
        llm_struggle: {
          turns_at_step: turn.turn_index + 1,
          tool_retries: tc.is_retry ? 1 : 0,
          reasoning_chars: turn.reasoning_chars,
          step_ms: turn.duration_ms ?? 0,
        },
      });
    }

    // 2) text 자체 step (reasoning 이 비어있지 않으면)
    if (turn.text && turn.text.trim()) {
      // G06-35d: 마커 우선 (1차 — 정확). 없으면 heuristic (2차 — 한국어 키워드).
      const markerKind = extractStepKindMarker(turn.text);
      const kind = markerKind ?? classifyStepKind(turn.text);
      const triggerHint = extractTriggerMarker(turn.text);

      // tool_call 이 이미 있고 text 가 짧으면 중복 생성 안 함 (text < 40자)
      const skipText = turn.tool_calls.length > 0 && turn.text.trim().length < 40;
      if (!skipText) {
        // G06-35d: trigger 매칭 우선순위
        //   (1) 마커 hint → matchTriggerByToolName (한글 정규식 직접 매칭, 정확)
        //   (2) (1) 실패 시 forward/backward/computation/tool_call → matchTriggerByText (ANN)
        let trig: TriggerMatch | null = null;
        if (triggerHint) {
          trig = await matchTriggerByToolName(triggerHint);
        }
        if (!trig && (
          kind === 'forward' ||
          kind === 'backward' ||
          kind === 'computation' ||
          kind === 'tool_call'
        )) {
          trig = await matchTriggerByText(turn.text);
        }
        steps.push({
          index: stepIndex++,
          kind,
          summary: turn.text.slice(0, 80).replace(/\s+/g, ' ').trim(),
          difficulty: turnDifficulty,
          is_pivotal: false,
          trigger_id: trig?.trigger_id || undefined,
          tool_id: trig?.tool_id,
          llm_struggle: {
            turns_at_step: turn.turn_index + 1,
            tool_retries: 0,
            reasoning_chars: turn.reasoning_chars,
            step_ms: turn.duration_ms ?? 0,
          },
        });
      }
    }
  }

  // Δ16 — 빈 trace 시 LLM fallback (problem_text 있을 때만)
  if (steps.length === 0) {
    if (problem_text && problem_text.trim()) {
      const fallback = await decomposeWithLLMFallback(problem_text, trace);
      if (fallback.length > 0) {
        if (!opts.skipPersist) await insertSteps(session_id, fallback);
        return fallback;
      }
    }
    return steps;
  }

  // pivotal 선정
  const pivotalIdx = selectPivotal(steps);
  if (pivotalIdx >= 0) steps[pivotalIdx].is_pivotal = true;

  if (!opts.skipPersist) {
    await insertSteps(session_id, steps);
  }
  return steps;
}

async function insertSteps(session_id: string, steps: PerProblemStep[]): Promise<void> {
  if (!session_id || steps.length === 0) return;
  try {
    const supabase = await createClient();
    const rows = steps.map((s) => ({
      session_id,
      step_index: s.index,
      step_kind: s.kind,
      step_summary: s.summary,
      trigger_id: s.trigger_id || null,
      tool_id: s.tool_id || null,
      difficulty: s.difficulty,
      is_pivotal: s.is_pivotal,
      time_ms: s.llm_struggle?.step_ms ?? null,
      llm_turns_at_step: s.llm_struggle?.turns_at_step ?? null,
      llm_tool_retries: s.llm_struggle?.tool_retries ?? 0,
      llm_reasoning_chars: s.llm_struggle?.reasoning_chars ?? null,
      llm_step_ms: s.llm_struggle?.step_ms ?? null,
    }));
    const { error } = await supabase.from('solve_step_decomposition').insert(rows);
    if (error) {
      console.warn('[step-decomposer] insert failed:', error.message);
    }
  } catch (e) {
    console.warn('[step-decomposer] insert unexpected:', (e as Error).message);
  }
}
