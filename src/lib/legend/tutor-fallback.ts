/**
 * Phase G-06 G06-09 — Tutor fallback 매트릭스 + Gemini 429 자동 전환.
 *
 * 베이스 문서:
 *   docs/architecture-g06-legend.md §9.5 (fallback 우선순위 표) + §9.1 (Gemini 250 RPD 정책).
 *   docs/implementation_plan_g06.md §G06-09.
 *
 * 정책:
 *   - architecture §9.5: 1단계 fallback 까지만 자동, 2단계 이후는 EscalationPrompt 로 학생 권유 (G06-11 처리).
 *   - silent fallback 금지: 모든 fallback 은 FallbackEvent 로 가시화 (console.warn + stream payload).
 *   - retry 호출은 call_kind='retry' 로 DB insert 되어 legend_tutor_sessions check 규칙 준수.
 *
 * G06-30 (Δ8): Tier 1 라마누잔 = Gemini 3.1 Pro baseline.
 *   - 250 RPD 한도 도달 → 라마누잔 페르소나 유지하면서 model_id/provider 만 Sonnet 4.6 baseline 으로 swap.
 *   - 가우스 (Tier 2) 의 Gemini quota 양보 + 라마누잔 페르소나 보존.
 *   - 다른 튜터 (가우스→폰 노이만 등) fallback 정책은 그대로.
 *
 * 영향 격리: src/lib/legend/ 전용. 외부 의존 없음.
 */
import type { TutorName } from './types';
import type { ModelMode, ModelProvider } from './call-model';

// ────────────────────────────────────────────────────────────────────────────
// 1단계 fallback 매트릭스 (architecture §9.5 표 그대로)
// ────────────────────────────────────────────────────────────────────────────
//
// | Primary 다운        | 1순위           | 2순위                |
// |---------------------|-----------------|----------------------|
// | 가우스 (Gemini)     | 폰 노이만 (GPT) | 라이프니츠 (Sonnet)  |
// | 폰 노이만 (GPT)     | 가우스 (Gemini) | 오일러 (Opus)        |
// | 오일러 (Opus)       | 라이프니츠      | 가우스               |
// | 라이프니츠 (Sonnet) | 오일러          | 폰 노이만            |
// | 라마누잔 calc       | 라마누잔 intuit | —                    |
// | 라마누잔 intuit     | (model swap*)   | —                    |
//
// 자동 fallback 은 1순위 (배열의 [0]) 까지만 사용. 2순위는 EscalationPrompt 후보.
//
// (*) G06-30 (Δ8): 라마누잔 intuit 의 1순위 fallback 은 "다른 튜터" 가 아닌
//     "같은 라마누잔 intuit + 다른 model" 동적 swap (페르소나 유지). RAMANUJAN_INTUIT_MODEL_SWAP
//     상수가 정의하며 callTutorWithFallback 의 catch 가 분기 처리한다.

export const FALLBACK_MATRIX: Record<TutorName, TutorName[]> = {
  ramanujan_calc: ['ramanujan_intuit'],
  // G06-30: 라마누잔 intuit 은 model swap 으로 처리 (RAMANUJAN_INTUIT_MODEL_SWAP).
  // FALLBACK_MATRIX 항목은 "튜터→튜터" 시멘틱이라 빈 배열로 두고, getNextFallback 도 null 반환.
  ramanujan_intuit: [],
  gauss: ['von_neumann', 'leibniz'],
  von_neumann: ['gauss', 'euler'],
  euler: ['leibniz', 'gauss'],
  leibniz: ['euler', 'von_neumann'],
};

// ────────────────────────────────────────────────────────────────────────────
// G06-30 (Δ8) — 라마누잔 intuit 전용 model swap 정의
// ────────────────────────────────────────────────────────────────────────────
//
// Gemini 3.1 Pro baseline 250 RPD 한도 도달 시 페르소나 유지하면서
// model_id/provider 만 Sonnet 4.6 baseline 으로 swap.
// orchestrator 의 callTutorWithFallback catch 블록이 이 상수를 읽어 직접 callModel 호출.

export interface RamanujanIntuitSwap {
  model_id: string;
  provider: ModelProvider;
  mode: ModelMode;
  /** legend_tutor_sessions.mode 컬럼에 기록되는 명시적 라벨 */
  mode_label: string;
}

export function getRamanujanIntuitSwap(): RamanujanIntuitSwap {
  return {
    model_id:
      process.env.LEGEND_RAMANUJAN_FALLBACK_MODEL ??
      process.env.ANTHROPIC_SONNET_MODEL_ID ??
      'claude-sonnet-4-6-20260101',
    provider: 'anthropic',
    mode: 'baseline',
    mode_label: 'baseline_sonnet_fallback',
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Fallback 이벤트 타입
// ────────────────────────────────────────────────────────────────────────────

export interface FallbackEvent {
  primary: TutorName;
  fallback_to: TutorName;
  reason:
    | 'gemini_429'
    | 'openai_rate_limit'
    | 'anthropic_rate_limit'
    | 'generic_error';
  error_message: string;
  /** 1단계 자동 fallback 만 허용 → 항상 1 */
  attempt: 1 | 2;
}

// ────────────────────────────────────────────────────────────────────────────
// 1단계 자동 fallback 후보 결정
// ────────────────────────────────────────────────────────────────────────────

/**
 * 다음 fallback 튜터 반환. 1단계만 자동, 2단계 이후는 null (EscalationPrompt 분기).
 *
 * @param tutor   primary 튜터
 * @param attempt 현재 시도 횟수 (0 = 첫 시도, 1 = 1단계 fallback 시도 후)
 * @returns 1단계 fallback 튜터 / null
 */
export function getNextFallback(
  tutor: TutorName,
  attempt: number,
): TutorName | null {
  const candidates = FALLBACK_MATRIX[tutor];
  if (!candidates || candidates.length === 0) return null;
  // 1단계 자동만 허용 — attempt >= 1 이면 이미 1단계 fallback 시도한 것.
  if (attempt >= 1) return null;
  return candidates[0] ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// 에러 분류 (provider 별 rate limit / overload 신호 구분)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 에러 객체에서 fallback reason 추출.
 *
 * - Gemini 429 RESOURCE_EXHAUSTED → gemini_429 (250 RPD 한도 도달)
 * - OpenAI 429 rate → openai_rate_limit
 * - Anthropic 429 또는 529 (overload) → anthropic_rate_limit
 * - 그 외 → generic_error
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function classifyError(error: any): FallbackEvent['reason'] {
  const msg = String(error?.message ?? error ?? '');
  const status = error?.status ?? error?.statusCode;

  // call-model.ts 의 raw fetch 는 throw new Error(`[call-model] Gemini 429: ...`) 형식 →
  // status 가 undefined 이지만 메시지에 "Gemini 429" / "RESOURCE_EXHAUSTED" / "quota" 포함.
  const msgLower = msg.toLowerCase();
  const isGeminiSignal =
    msg.includes('Gemini 429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msgLower.includes('quota');
  if (isGeminiSignal) return 'gemini_429';

  if (status === 429) {
    if (msg.includes('OpenAI') || msgLower.includes('openai')) {
      return 'openai_rate_limit';
    }
    if (msg.includes('Anthropic') || msgLower.includes('anthropic')) {
      return 'anthropic_rate_limit';
    }
    if (msgLower.includes('rate')) return 'openai_rate_limit';
    return 'anthropic_rate_limit';
  }

  // 529 = Anthropic overload
  if (status === 529) return 'anthropic_rate_limit';

  // status 코드 없이 메시지에 provider 명만 있는 경우
  if (msg.includes('Anthropic 429') || msg.includes('Anthropic 529')) {
    return 'anthropic_rate_limit';
  }
  if (msg.includes('OpenAI 429')) return 'openai_rate_limit';

  return 'generic_error';
}

// ────────────────────────────────────────────────────────────────────────────
// UI 메시지 (stream payload 용 — G06-11 에서 SSE 삽입)
// ────────────────────────────────────────────────────────────────────────────

const TUTOR_LABEL_KO: Record<TutorName, string> = {
  ramanujan_calc: '라마누잔',
  ramanujan_intuit: '라마누잔',
  gauss: '가우스',
  von_neumann: '폰 노이만',
  euler: '오일러',
  leibniz: '라이프니츠',
};

export function buildFallbackMessage(event: FallbackEvent): string {
  // G06-30 (Δ8): 라마누잔 intuit → ramanujan_intuit (model swap) 인 경우 별도 카피.
  if (
    event.primary === 'ramanujan_intuit' &&
    event.fallback_to === 'ramanujan_intuit'
  ) {
    return '라마누잔 (Gemini) 가 잠시 쉬어요. Sonnet 모드로 전환합니다.';
  }
  const primary = TUTOR_LABEL_KO[event.primary];
  const fallback = TUTOR_LABEL_KO[event.fallback_to];
  return `${primary}이 잠시 휴식 중, ${fallback}이 응답합니다.`;
}
