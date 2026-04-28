/**
 * Phase G-06 — Stage 2: Ramanujan probe (Opus 4.7 baseline + SymPy 검증).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2 (probe 시그니처) + §1.2 (escalation 신호 정의).
 * 결정: project-decisions.md G-06 — escalation 신호는 sympy_fail AND stuck_token 둘 다일 때만 권유.
 *
 * 흐름:
 *   1. Opus 4.7 baseline 1회 호출 (max_tokens 5000, temperature 0)
 *   2. self-eval 프롬프트로 막힘 시 [STUCK] 토큰 출력 강제
 *   3. answer 추출 시 SymPy cross-check (단순 계산 식 한정)
 *   4. signals = ['stuck_token'?, 'sympy_fail'?]
 *   5. duration_ms 측정
 *
 * 응답 시간 ≤ 8s 보장: Opus 4.7 baseline 1회 + SymPy 1회 (선택). agentic 다중 turn 금지.
 */
import { callSympy, isSympyError } from '@/lib/euler/sympy-client';
import { tryParseJson } from '@/lib/euler/json';

const OPUS_MODEL_ID = process.env.ANTHROPIC_OPUS_MODEL_ID || 'claude-opus-4-7';

export interface ProbeResult {
  solved: boolean;
  trace_jsonb: unknown;
  escalation_signals: ('sympy_fail' | 'stuck_token')[];
  duration_ms: number;
}

interface ProbeJson {
  answer?: string;
  reasoning_steps?: string[];
  stuck?: boolean;
  /** SymPy 로 검증할 수 있는 단순 식 (예: "x**2 - 4 = 0" 의 해 = "{-2, 2}") — 선택적 */
  sympy_check?: { op: string; expr: string; expected: string };
}

const SYSTEM_PROMPT = `당신은 라마누잔 — 직관적 계산의 달인입니다.
주어진 문제를 한 번에 풀이하세요. agentic 멀티 턴 금지 — 한 번의 응답에서 결론까지.

**자가 평가 규칙**:
- 자신 있게 풀이를 마쳤다면: \`stuck=false\` 로 표기.
- 풀이 도중 어느 단계에서든 명확한 진전이 막혔다면: 풀이 마지막 줄에 \`[STUCK]\` 토큰을 출력하고 \`stuck=true\` 로 표기.
- "정확한 답에 도달했지만 검산이 불가능하다"고 느껴도 stuck=false 가 원칙. stuck 은 풀이 자체의 막힘에만 사용.

**응답 형식 — JSON 단일 객체만**:
{
  "answer": "최종 답 (수치 또는 식)",
  "reasoning_steps": ["단계1", "단계2", "..."],
  "stuck": false,
  "sympy_check": { "op": "solve_equation|simplify|differentiate|integrate", "expr": "수식 문자열", "expected": "검증할 답" }
}

\`sympy_check\` 는 선택. 풀이가 단순 계산 (다항·미분·적분·간단한 방정식) 일 때만 채우세요. 기하·확률·복합 문제는 생략.

JSON 외 텍스트·코드펜스 금지. 단, 풀이가 막혔을 때만 JSON 뒤 줄에 \`[STUCK]\` 추가 가능.`;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callOpusBaseline(
  problem: string,
  maxTokens = 5000,
  timeoutMs = 30_000,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing');

  const messages: AnthropicMessage[] = [
    { role: 'user', content: `문제:\n${problem}\n\nJSON 응답:` },
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPUS_MODEL_ID,
        max_tokens: maxTokens,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages,
      }),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Anthropic ${resp.status}: ${errText.slice(0, 200)}`);
    }
    const data = (await resp.json()) as { content: { type: string; text: string }[] };
    return data.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');
  } finally {
    clearTimeout(timer);
  }
}

function detectStuckToken(rawText: string, parsed: ProbeJson | null): boolean {
  if (parsed && parsed.stuck === true) return true;
  return /\[STUCK\]/i.test(rawText);
}

/**
 * sympy_check 결과를 cross-check.
 * - solve_equation: SymPy result 가 expected 와 정렬·공백 무시 일치
 * - 그 외: SymPy result 가 expected 와 정규화 일치 / 또는 simplify((result)-(expected))=0
 */
async function verifyWithSympy(
  check: NonNullable<ProbeJson['sympy_check']>,
): Promise<{ ok: boolean; sympy_result?: string; error?: string }> {
  const validOps = new Set([
    'solve_equation',
    'simplify',
    'differentiate',
    'integrate',
    'factor',
  ]);
  if (!validOps.has(check.op)) {
    return { ok: false, error: 'unsupported_op' };
  }
  try {
    const args: Record<string, unknown> = { expr: check.expr };
    if (check.op === 'solve_equation') {
      args.equation = check.expr;
    }
    const result = await callSympy(check.op as Parameters<typeof callSympy>[0], args, 8_000);
    if (isSympyError(result)) {
      return { ok: false, error: result.error };
    }
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[(){}[\]]/g, '')
        .replace(/\*\*/g, '^');
    const a = normalize(result.result || '');
    const b = normalize(check.expected || '');
    if (a === b) return { ok: true, sympy_result: result.result };
    return { ok: false, sympy_result: result.result };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function runRamanujanProbe(problem: string): Promise<ProbeResult> {
  const t0 = Date.now();
  const signals: ('sympy_fail' | 'stuck_token')[] = [];
  let parsed: ProbeJson | null = null;
  let rawText = '';
  let sympyVerification: unknown = null;

  try {
    rawText = await callOpusBaseline(problem);
    parsed = tryParseJson<ProbeJson>(rawText);
  } catch (e) {
    // API 오류는 stuck 신호로 간주 (probe 실패 = 막힘 동일 효과)
    return {
      solved: false,
      trace_jsonb: { error: (e as Error).message, raw: rawText },
      escalation_signals: ['stuck_token'],
      duration_ms: Date.now() - t0,
    };
  }

  if (detectStuckToken(rawText, parsed)) {
    signals.push('stuck_token');
  }

  if (parsed?.sympy_check) {
    const v = await verifyWithSympy(parsed.sympy_check);
    sympyVerification = v;
    if (!v.ok) signals.push('sympy_fail');
  }

  const solved = signals.length === 0 && Boolean(parsed?.answer);

  return {
    solved,
    trace_jsonb: {
      model: OPUS_MODEL_ID,
      raw_text: rawText,
      parsed,
      sympy_verification: sympyVerification,
    },
    escalation_signals: signals,
    duration_ms: Date.now() - t0,
  };
}
