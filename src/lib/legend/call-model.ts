/**
 * Phase G-06 G06-08 — 5 모델 추상화 호출 (Anthropic / OpenAI / Google).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2 (TUTOR_CONFIG 매핑) +
 *             docs/implementation_plan_g06.md §G06-08 (callModel 5 분기).
 * 8차 세션 G-05 핵심 통찰 보존:
 *   - agentic_5step: 매 turn 마다 [원문제 + 누적 trace + 다음 step 지시] 주입 (89.5% KPI 핵심).
 *   - Gemini 3.1 Pro: safetySettings BLOCK_NONE × 4 + finishReason 로깅 (G-05c 보강).
 *   - max_tokens 5000 default (응답 잘림 방지).
 *
 * 참조 원본: scripts/eval-kpi.ts 의 callModel + runAgenticChain.
 *
 * 영향 격리: src/lib/legend/ 전용. 기존 src/lib/euler/* 는 import 만 가능 (sympy-client).
 *
 * 환경변수 (HIGH 위험 — silent fallback 금지):
 *   ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY 중 호출 provider 의 key 누락 시 명확한 에러.
 */

// ────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────

export type ModelProvider = 'anthropic' | 'openai' | 'google';
export type ModelMode = 'baseline' | 'agentic_5step' | 'calc_haiku';

export interface CallModelInput {
  /** 'claude-opus-4-7-20260201' / 'gpt-5-5' / 'gemini-3-1-pro' 등 provider 모델 ID */
  model_id: string;
  provider: ModelProvider;
  mode: ModelMode;
  /** 학생 문제 본문 (raw) */
  problem: string;
  /** 시스템 프롬프트 (튜터 페르소나) — 비우면 mode 별 default 사용 */
  system_prompt?: string;
  /** baseline 1회 또는 agentic 매 turn 의 max_tokens. default 5000 (G-05 응답 잘림 방지) */
  max_tokens?: number;
  /** calc_haiku 모드에서 SymPy tool 정의 전달용 (현 G06-08 단계에서는 미사용) */
  tools?: any[];
}

export interface CallModelTurn {
  step: number;
  response: string;
  duration_ms: number;
  /**
   * G06-16 보강 — agentic 모드에서도 provider raw 응답 보존.
   * trace-normalizer 가 provider 별 tool_use blocks / function_call / parts 를
   * 추출해 step 분해의 정확도를 높이는 데 사용.
   * 누락(undefined) 시에도 기존 string-only 소비 코드와 호환됨.
   */
  raw?: any;
}

export interface CallModelResult {
  /** 최종 응답 텍스트 (agentic_5step 시 마지막 turn) */
  text: string;
  /** turn-by-turn raw trace. agentic_5step 시 turns[] 5개. baseline/calc_haiku 시 1개 */
  trace: any;
  /** Anthropic tool_use blocks (calc_haiku 전용 — G06-08 에선 빈 배열) */
  tool_calls: any[];
  duration_ms: number;
  model_id: string;
}

// ────────────────────────────────────────────────────────────────────────────
// agentic_5step 시스템 프롬프트 (eval-kpi.ts AGENTIC_SYSTEM 보존)
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_AGENTIC_SYSTEM = `당신은 한국 수학 전문 시니어 강사입니다. 어려운 수능 문제를 단계적으로 분해해 풀이합니다.

## 핵심 원칙
- 매 step 마다 한 걸음만. 한 번에 답 도출 X.
- 매 step 마다 원문제 컨텍스트가 함께 주입됨 — 절대 잊지 마세요.
- 자가 검증 포함: 계산 오류, 누락 조건, 정의역 위반 점검.
- 마지막 step 에서만 "최종 답: <값>" 한 줄 출력 (객관식 1~5 또는 정수).`;

const DEFAULT_BASELINE_SYSTEM = `당신은 한국 수학 전문 시니어 강사 (라마누잔) 입니다.
주어진 문제를 한 번의 응답에서 단계적으로 풀이하고, 마지막 줄에 "최종 답: <값>" 을 출력하세요.`;

const DEFAULT_CALC_HAIKU_SYSTEM = `당신은 라마누잔 — 계산의 달인입니다.
필요 시 SymPy 도구로 정확히 계산. 마지막 줄에 "최종 답: <값>" 출력.`;

// ────────────────────────────────────────────────────────────────────────────
// 메시지 타입 (provider 공통)
// ────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Anthropic 호출 (raw fetch — eval-kpi 의 callAnthropic 보존)
// ────────────────────────────────────────────────────────────────────────────

async function callAnthropic(
  modelId: string,
  system: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<{ text: string; raw: unknown }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('[call-model] ANTHROPIC_API_KEY missing');

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: maxTokens,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`[call-model] Anthropic ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await resp.json()) as {
    content: { type: string; text?: string }[];
  };
  const text = data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('');
  return { text, raw: data };
}

// ────────────────────────────────────────────────────────────────────────────
// OpenAI 호출 (GPT-5.5 — eval-kpi 패턴 보존)
// ────────────────────────────────────────────────────────────────────────────

async function callOpenAI(
  modelId: string,
  system: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<{ text: string; raw: unknown }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('[call-model] OPENAI_API_KEY missing');

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      max_completion_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`[call-model] OpenAI ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await resp.json()) as {
    choices: { message: { content: string } }[];
  };
  return { text: data.choices[0]?.message?.content ?? '', raw: data };
}

// ────────────────────────────────────────────────────────────────────────────
// Google Gemini 호출 (eval-kpi G-05c 보강 — safetySettings BLOCK_NONE × 4 + finishReason 로깅)
// ────────────────────────────────────────────────────────────────────────────

async function callGemini(
  modelId: string,
  system: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<{ text: string; raw: unknown }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('[call-model] GEMINI_API_KEY missing');

  // RECITATION 트리거 감소 — 수능 기출 인용 방지
  const systemAug =
    system +
    '\n\n## 표현 원칙\n원문제 본문을 그대로 인용하지 말고 자신의 말로 다시 표현하세요. 수식·숫자는 그대로 사용해도 됩니다.';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemAug }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.2 },
      // G-05c: 4 카테고리 BLOCK_NONE — 수학 문제 false positive 차단 방지
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`[call-model] Gemini ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await resp.json()) as {
    candidates?: {
      content?: { parts?: { text?: string }[] };
      finishReason?: string;
      safetyRatings?: { category: string; probability: string; blocked?: boolean }[];
    }[];
    promptFeedback?: { blockReason?: string };
  };
  const cand = data.candidates?.[0];
  const text = (cand?.content?.parts ?? []).map((p) => p.text ?? '').join('');

  // G-05c: 빈 응답일 때 finishReason / promptBlock 로깅 — STOP / MAX_TOKENS / SAFETY 분기 진단
  if (!text) {
    const fr = cand?.finishReason ?? '?';
    const block = data.promptFeedback?.blockReason ?? '?';
    const blocked =
      cand?.safetyRatings?.filter((s) => s.blocked).map((s) => s.category).join(',') ?? '';
    console.warn(
      `[call-model gemini] empty response: finishReason=${fr}, promptBlock=${block}, blockedCats=[${blocked}]`,
    );
  }
  return { text, raw: data };
}

// ────────────────────────────────────────────────────────────────────────────
// provider 분기 1회 호출
// ────────────────────────────────────────────────────────────────────────────

async function callProviderOnce(
  provider: ModelProvider,
  modelId: string,
  system: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<{ text: string; raw: unknown }> {
  if (provider === 'anthropic') return callAnthropic(modelId, system, messages, maxTokens);
  if (provider === 'openai') return callOpenAI(modelId, system, messages, maxTokens);
  if (provider === 'google') return callGemini(modelId, system, messages, maxTokens);
  throw new Error(`[call-model] unknown provider: ${provider}`);
}

// ────────────────────────────────────────────────────────────────────────────
// agentic_5step (eval-kpi runAgenticChain 보존 — 매 turn 원문제 + 누적 trace 주입)
// ────────────────────────────────────────────────────────────────────────────

async function runAgenticChain(input: {
  provider: ModelProvider;
  modelId: string;
  problem: string;
  system: string;
  maxTokensPerTurn: number;
  maxTurns: number;
}): Promise<{
  text: string;
  turns: CallModelTurn[];
}> {
  const { provider, modelId, problem, system, maxTokensPerTurn, maxTurns } = input;
  const cap = Math.max(2, Math.min(maxTurns, 8));
  const turns: CallModelTurn[] = [];

  const problemContext = `### 원문제 (변하지 않는 컨텍스트)
${problem}

### 풀이 절차
${cap}단계로 나눠 풀이합니다. 각 단계는 한 걸음만.
- Step 1: 문제 구조화 — 구해야 할 것 / 조건 / 제약 분리 + 첫 추론 1걸음
- Step 2~${cap - 1}: 다음 1걸음 (forward 또는 backward) + 자가 검증
- Step ${cap}: 누적 추론 종합 + "최종 답: <값>" 한 줄`;

  let trace = '';
  for (let step = 0; step < cap; step++) {
    const stepStart = Date.now();
    const isLast = step === cap - 1;
    const instruction = isLast
      ? `### Step ${step + 1} (마지막): 최종 답
지금까지의 누적 추론을 모두 종합해 최종 답만 정리. 마지막 줄에 반드시 "최종 답: <값>". 객관식이면 1~5, 주관식이면 정수.`
      : step === 0
        ? `### Step 1: 문제 구조화 + 첫 추론 1걸음
원문제를 분해 — (구해야 할 것 list) / (조건 list) / (제약 list) 분리. 그 다음 첫 1걸음만 (forward = 조건 조합으로 새 사실, 또는 backward = 목표를 subgoal 로 분해). 답 도출 X.`
        : `### Step ${step + 1}: 다음 1걸음 추론
직전 step 결과를 받아 다음 1걸음 (forward 또는 backward). 자가 검증 (계산 오류, 누락 조건). 답 도출 X.`;

    const userMsg = `${problemContext}

### 누적 reasoning trace (Step 1~${step} 결과)
${trace || '(아직 없음 — 이번이 Step 1)'}

${instruction}`;

    let respText: string;
    let respRaw: unknown = undefined;
    try {
      const result = await callProviderOnce(
        provider,
        modelId,
        system,
        [{ role: 'user', content: userMsg }],
        // 마지막 step 도 풀이 잘리지 않게 — Gemini 응답 길이 5000 까지 허용
        isLast ? Math.min(maxTokensPerTurn, 5000) : maxTokensPerTurn,
      );
      respText = result.text;
      respRaw = result.raw;
    } catch (e) {
      console.warn(`[call-model agentic] step ${step + 1} failed:`, (e as Error).message);
      break;
    }

    const stepDur = Date.now() - stepStart;
    turns.push({ step: step + 1, response: respText, duration_ms: stepDur, raw: respRaw });

    // G-05c: 빈 응답일 때 trace 에 명시 — 다음 turn 이 단서 활용 가능
    const traceBody =
      respText && respText.trim()
        ? respText
        : '(이전 step 응답이 비어 있습니다 — 모델이 차단됐거나 거절했습니다. 이번 step 에서 처음부터 다시 시도하세요.)';
    trace += `\n--- Step ${step + 1} 결과 ---\n${traceBody}\n`;
  }

  return {
    text: turns[turns.length - 1]?.response ?? '',
    turns,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 진입점 — mode × provider 5 분기
// ────────────────────────────────────────────────────────────────────────────

export async function callModel(input: CallModelInput): Promise<CallModelResult> {
  const t0 = Date.now();
  const maxTokens = input.max_tokens ?? 5000;

  if (!input.problem?.trim()) {
    throw new Error('[call-model] problem is empty');
  }

  // ── 1) calc_haiku: Anthropic Haiku 단발 (SymPy tools 통합은 G06-12+) ──
  if (input.mode === 'calc_haiku') {
    if (input.provider !== 'anthropic') {
      throw new Error(
        `[call-model] calc_haiku mode requires anthropic provider (got ${input.provider})`,
      );
    }
    const system = input.system_prompt ?? DEFAULT_CALC_HAIKU_SYSTEM;
    const { text, raw } = await callAnthropic(
      input.model_id,
      system,
      [{ role: 'user', content: `문제:\n${input.problem}\n\n풀이:` }],
      maxTokens,
    );
    return {
      text,
      trace: { mode: 'calc_haiku', model_id: input.model_id, raw },
      tool_calls: [],
      duration_ms: Date.now() - t0,
      model_id: input.model_id,
    };
  }

  // ── 2) baseline: 단발 호출 (Anthropic / OpenAI / Google 모두 가능) ──
  if (input.mode === 'baseline') {
    const system = input.system_prompt ?? DEFAULT_BASELINE_SYSTEM;
    const { text, raw } = await callProviderOnce(
      input.provider,
      input.model_id,
      system,
      [{ role: 'user', content: `문제:\n${input.problem}\n\n풀이:` }],
      maxTokens,
    );
    return {
      text,
      trace: { mode: 'baseline', model_id: input.model_id, raw },
      tool_calls: [],
      duration_ms: Date.now() - t0,
      model_id: input.model_id,
    };
  }

  // ── 3) agentic_5step: 5 turn 매 turn 원문제 + 누적 trace 주입 (G-05 89.5% 핵심) ──
  if (input.mode === 'agentic_5step') {
    const system = input.system_prompt ?? DEFAULT_AGENTIC_SYSTEM;
    const { text, turns } = await runAgenticChain({
      provider: input.provider,
      modelId: input.model_id,
      problem: input.problem,
      system,
      maxTokensPerTurn: maxTokens,
      maxTurns: 5,
    });
    return {
      text,
      trace: {
        mode: 'agentic_5step',
        model_id: input.model_id,
        provider: input.provider,
        turns,
      },
      tool_calls: [],
      duration_ms: Date.now() - t0,
      model_id: input.model_id,
    };
  }

  throw new Error(`[call-model] unknown mode: ${input.mode satisfies never}`);
}
