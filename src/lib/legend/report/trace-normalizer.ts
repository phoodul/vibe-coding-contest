/**
 * Phase G-06 G06-12 — provider 별 raw trace → 통합 NormalizedTurn[].
 *
 * 베이스 문서: docs/architecture-g06-legend.md §5.2 (step-decomposer 알고리즘) +
 *             §9.6 (R1 의 step kind 분류 정확도 — provider 포맷 차이 핵심).
 *
 * trace 입력 형태 (G06-08 callModel 출력):
 *   - mode='baseline'    : { mode, model_id, raw }                — single turn (raw = provider 응답)
 *   - mode='agentic_5step': { mode, model_id, provider, turns[] } — turns[i].response 순차 누적
 *   - mode='calc_haiku'  : { mode, model_id, raw }                — Anthropic single turn
 *
 * provider 별 turn 구조 차이:
 *   - Anthropic : content[] 의 {type:'text'} + {type:'tool_use', name, input} blocks
 *   - OpenAI    : choices[0].message.content + tool_calls[].function.{name, arguments}
 *   - Google    : candidates[0].content.parts[] 의 {text} + {functionCall:{name, args}}
 *
 * 단, agentic_5step 모드는 callModel 이 turn.response 를 string 으로만 보존하므로
 * (raw provider 응답 미보존) tool_calls 는 baseline/calc_haiku 또는 turns[i].raw 가
 * 있는 fixture 시나리오에서만 추출한다 (정상 callModel 결과는 string only).
 *
 * 영향 격리: src/lib/legend/report/ 전용. 기존 모듈 무수정.
 */

// ────────────────────────────────────────────────────────────────────────────
// 공통 출력 타입
// ────────────────────────────────────────────────────────────────────────────

export interface NormalizedToolCall {
  tool_name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tool_input: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tool_output?: any;
  /** 같은 tool_name 이 같은 turn 내 두 번째 이상 호출일 때 true */
  is_retry: boolean;
  ok: boolean;
}

export interface NormalizedTurn {
  turn_index: number;
  /** reasoning + 답 텍스트 합본 */
  text: string;
  tool_calls: NormalizedToolCall[];
  duration_ms?: number;
  reasoning_chars: number;
}

export type Provider = 'anthropic' | 'openai' | 'google';

// ────────────────────────────────────────────────────────────────────────────
// Anthropic
// ────────────────────────────────────────────────────────────────────────────

interface AnthropicContentBlock {
  type: string;
  text?: string;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input?: any;
}

interface AnthropicRaw {
  content?: AnthropicContentBlock[];
  // 일부 fixture 가 직접 통합한 형태도 허용
  text?: string;
}

function parseAnthropicTurn(
  turn_index: number,
  duration_ms: number | undefined,
  raw: AnthropicRaw | undefined,
  fallbackText: string,
): NormalizedTurn {
  const blocks: AnthropicContentBlock[] = Array.isArray(raw?.content) ? raw!.content! : [];
  const textParts: string[] = [];
  const tool_calls: NormalizedToolCall[] = [];
  const seenNames = new Set<string>();

  for (const b of blocks) {
    if (b.type === 'text' && typeof b.text === 'string') {
      textParts.push(b.text);
    } else if (b.type === 'tool_use' && typeof b.name === 'string') {
      const is_retry = seenNames.has(b.name);
      seenNames.add(b.name);
      tool_calls.push({
        tool_name: b.name,
        tool_input: b.input ?? {},
        is_retry,
        ok: true,
      });
    }
  }

  const text = textParts.length > 0 ? textParts.join('\n') : fallbackText;
  return {
    turn_index,
    text,
    tool_calls,
    duration_ms,
    reasoning_chars: text.length,
  };
}

export function normalizeAnthropicTrace(trace: unknown): NormalizedTurn[] {
  if (!trace || typeof trace !== 'object') return [];
  const t = trace as {
    mode?: string;
    raw?: AnthropicRaw;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    turns?: any[];
  };

  // agentic 5step: turns[]
  if (Array.isArray(t.turns) && t.turns.length > 0) {
    return t.turns.map((turn, i) => {
      const raw = (turn?.raw ?? undefined) as AnthropicRaw | undefined;
      const fallback = typeof turn?.response === 'string' ? turn.response : '';
      return parseAnthropicTurn(i, turn?.duration_ms, raw, fallback);
    });
  }

  // baseline / calc_haiku: raw 단일
  return [parseAnthropicTurn(0, undefined, t.raw, '')];
}

// ────────────────────────────────────────────────────────────────────────────
// OpenAI
// ────────────────────────────────────────────────────────────────────────────

interface OpenAIToolCall {
  type?: string;
  function?: { name?: string; arguments?: string };
}

interface OpenAIChoice {
  message?: {
    content?: string | null;
    tool_calls?: OpenAIToolCall[];
  };
}

interface OpenAIRaw {
  choices?: OpenAIChoice[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJsonArgs(args: string | undefined): any {
  if (!args) return {};
  try {
    return JSON.parse(args);
  } catch {
    return { _raw: args };
  }
}

function parseOpenAITurn(
  turn_index: number,
  duration_ms: number | undefined,
  raw: OpenAIRaw | undefined,
  fallbackText: string,
): NormalizedTurn {
  const choice = raw?.choices?.[0];
  const text = (typeof choice?.message?.content === 'string' && choice.message.content) || fallbackText;
  const tcRaw = Array.isArray(choice?.message?.tool_calls) ? choice!.message!.tool_calls! : [];
  const tool_calls: NormalizedToolCall[] = [];
  const seen = new Set<string>();
  for (const tc of tcRaw) {
    const name = tc?.function?.name;
    if (typeof name !== 'string' || !name) continue;
    const is_retry = seen.has(name);
    seen.add(name);
    tool_calls.push({
      tool_name: name,
      tool_input: parseJsonArgs(tc.function?.arguments),
      is_retry,
      ok: true,
    });
  }
  return {
    turn_index,
    text,
    tool_calls,
    duration_ms,
    reasoning_chars: text.length,
  };
}

export function normalizeOpenAITrace(trace: unknown): NormalizedTurn[] {
  if (!trace || typeof trace !== 'object') return [];
  const t = trace as {
    mode?: string;
    raw?: OpenAIRaw;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    turns?: any[];
  };

  if (Array.isArray(t.turns) && t.turns.length > 0) {
    return t.turns.map((turn, i) => {
      const raw = (turn?.raw ?? undefined) as OpenAIRaw | undefined;
      const fallback = typeof turn?.response === 'string' ? turn.response : '';
      return parseOpenAITurn(i, turn?.duration_ms, raw, fallback);
    });
  }

  return [parseOpenAITurn(0, undefined, t.raw, '')];
}

// ────────────────────────────────────────────────────────────────────────────
// Google Gemini
// ────────────────────────────────────────────────────────────────────────────

interface GeminiPart {
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  functionCall?: { name?: string; args?: any };
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
}

interface GeminiRaw {
  candidates?: GeminiCandidate[];
}

function parseGeminiTurn(
  turn_index: number,
  duration_ms: number | undefined,
  raw: GeminiRaw | undefined,
  fallbackText: string,
): NormalizedTurn {
  const parts: GeminiPart[] = raw?.candidates?.[0]?.content?.parts ?? [];
  const textParts: string[] = [];
  const tool_calls: NormalizedToolCall[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    if (typeof p.text === 'string') {
      textParts.push(p.text);
    } else if (p.functionCall && typeof p.functionCall.name === 'string') {
      const name = p.functionCall.name;
      const is_retry = seen.has(name);
      seen.add(name);
      tool_calls.push({
        tool_name: name,
        tool_input: p.functionCall.args ?? {},
        is_retry,
        ok: true,
      });
    }
  }
  const text = textParts.length > 0 ? textParts.join('\n') : fallbackText;
  return {
    turn_index,
    text,
    tool_calls,
    duration_ms,
    reasoning_chars: text.length,
  };
}

export function normalizeGoogleTrace(trace: unknown): NormalizedTurn[] {
  if (!trace || typeof trace !== 'object') return [];
  const t = trace as {
    mode?: string;
    raw?: GeminiRaw;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    turns?: any[];
  };

  if (Array.isArray(t.turns) && t.turns.length > 0) {
    return t.turns.map((turn, i) => {
      const raw = (turn?.raw ?? undefined) as GeminiRaw | undefined;
      const fallback = typeof turn?.response === 'string' ? turn.response : '';
      return parseGeminiTurn(i, turn?.duration_ms, raw, fallback);
    });
  }

  return [parseGeminiTurn(0, undefined, t.raw, '')];
}

// ────────────────────────────────────────────────────────────────────────────
// dispatcher
// ────────────────────────────────────────────────────────────────────────────

export function normalizeTrace(trace: unknown, provider: Provider): NormalizedTurn[] {
  switch (provider) {
    case 'anthropic':
      return normalizeAnthropicTrace(trace);
    case 'openai':
      return normalizeOpenAITrace(trace);
    case 'google':
      return normalizeGoogleTrace(trace);
    default: {
      const _exhaustive: never = provider;
      throw new Error(`[trace-normalizer] unknown provider: ${String(_exhaustive)}`);
    }
  }
}
