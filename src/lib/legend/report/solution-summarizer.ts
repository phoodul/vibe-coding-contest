/**
 * Phase G-06 G06-28 — 풀이 정리 요약 (Δ7).
 *
 * 베이스 문서: docs/project-decisions.md Δ7 (R1 SolutionSummarySection 결정).
 *
 * 알고리즘:
 *   1. Haiku 4.5 1회 호출 (max_tokens 500, ~$0.001/문제)
 *   2. JSON 모드 — 4 필드 강제 출력
 *   3. 시스템 프롬프트: 학습 코치 톤 + 4~6 문장 + "다시 풀면 어떻게" 시각
 *   4. JSON 파싱 실패 시 fallback (4 필드 모두 안전한 기본 문구)
 *
 * 차원 분리:
 *   - LLMStruggleSection (Δ3) = "AI도 어려웠다" 정직성 — 학생 동질감
 *   - SolutionSummarySection (Δ7) = "이렇게 정리해두면" 학습 코치 — 학습 효과
 *
 * 영향 격리: src/lib/legend/report/ 전용. call-model 만 import.
 */

import { callModel } from '@/lib/legend/call-model';
import type {
  PerProblemStep,
  ReasoningTree,
  SolutionSummary,
  TriggerCard,
} from '@/lib/legend/types';

// ────────────────────────────────────────────────────────────────────────────
// Args
// ────────────────────────────────────────────────────────────────────────────

export interface SummarizeSolutionArgs {
  problem_text: string;
  steps: PerProblemStep[];
  pivotal_step_index: number;
  reasoning_tree?: ReasoningTree;
  /** LLMStruggleSection 의 narrative — 참고용 (있으면 hardest_resolution 정확도 ↑) */
  hardest_resolution_text?: string;
  /**
   * G06-33 — primary trigger 카드 (있으면 trigger_motivation 생성 정확도 ↑).
   * tool_name + pattern_short + why_text 가 "떠올린 이유" 시각의 단서.
   */
  primary_trigger?: TriggerCard;
}

// ────────────────────────────────────────────────────────────────────────────
// 시스템 프롬프트 + JSON 강제
// ────────────────────────────────────────────────────────────────────────────

const SOLUTION_SUMMARY_SYSTEM = `당신은 학생의 깊이있는 사고 발달을 돕는 학습 코치입니다. 학생이 방금 푼 문제를 통해 다음에 비슷한 문제를 만났을 때 같은 사고 도약을 스스로 해낼 수 있도록 5 차원으로 정리해주세요.

## 핵심 철학
이 정리는 학생이 단순히 답을 맞추는 것이 아니라, **이 문제를 통해 더 나은 사고를 하는 사람이 되도록** 돕는 것입니다.
- 답·계산이 아닌 "왜 이렇게 생각했는가" 의 사고 흐름을 명시화.
- 학생이 "아, 그래서 이 trigger 가 떠올라야 하는구나" 를 깨닫게 합니다.
- 단순 요약 X. 학습 전이가 일어나도록 깊이있게.

## 톤·원칙
- 한국어 존댓말, 따뜻하고 명료. 학생을 존중하는 어조.
- 결론·답·숫자 나열 X. 통찰·전략·발동 조건·비교 위주.
- "이렇게 풀면 됩니다" 가 아니라 "이런 신호를 보고 이 도구가 떠올라야 합니다" 관점.

## 5 차원 정리 (각 필드의 깊이 있는 분석)

1. **core_insight** (2~3 문장) — 이 문제의 본질적 핵심 통찰
   - 왜 이 도구·전략이 정확히 이 문제에 필요했는가?
   - 다른 가능한 접근법이 왜 비효율적이거나 안 되는가?
   - 표면적 풀이 단계가 아닌, "이 문제 유형의 본질"을 짚어야 합니다.

2. **step_flow_narrative** (4~6 문장) — 풀이의 사고 흐름
   - "1단계에서 X 를 발견했고, 그 발견이 2단계의 Y 변환을 가능하게 했으며..." 형식.
   - 각 단계가 다음 단계를 어떻게 가능하게 했는지 인과 명시.
   - 단순 단계 나열 X. 단계 사이의 논리적 연결을 그리세요.

3. **hardest_resolution** (2~3 문장) — 가장 어려운 부분의 해결 통찰
   - 어디서 막힘 가능성이 가장 컸는가?
   - 그 막힘을 어떤 사고·관점 전환으로 풀었는가?
   - 학생이 같은 자리에서 막혔다면 무엇을 떠올려야 하는가?

4. **generalization** (2~3 문장) — 일반 원칙 (학습 전이)
   - 이 문제 유형에서 반복되는 패턴은 무엇인가?
   - "X 조건 + Y 목표 → Z 도구" 같은 일반 공식.
   - 비슷한 문제군의 메타 전략 한 줄.

5. **trigger_motivation** (6~10 문장) — Tool 과 Trigger 의 분리, Trigger 의 본질은 "필연성·개연성"

   ### Tool 과 Trigger 의 엄격한 분리

   **Tool (수학적 도구)** = 풀이에 실제로 쓰인 **구체적 세부 수단** (WHAT).
   - "치환·보조선·여사건·부분적분" 같은 단어는 **단원·범주 이름**일 뿐. 진짜 tool 이 아님.
   - 진짜 tool 은 더 세밀하게: "\\(u = x-1\\) 로 두는 치환", "원의 중심에서 현 AB 에 내린 수선의 발 H", "\\(\\frac{a+b}{2} \\ge \\sqrt{ab}\\) 형태로 AM-GM 적용", "\\(g'(x)=0\\) 의 해를 통해 극값 후보를 잡기" 같이.
   - 보조선 하나만 해도 수천 가지 변형이 가능. 풀이 노트에 적힐 수 있을 만큼 구체적인 수단을 명시.

   **Trigger** = 무수한 가능 도구 중 **왜 하필 이 도구를 떠올려야 했는가의 필연성·개연성** (WHY).
   - 사람이 문제를 보고 머릿속에서 **그 특정 도구가 자연스럽게 호출되는 인과적 근거**.
   - "이 도구를 사용했다" 가 아니라 "이 도구가 떠올라야만 했던 이유" 가 trigger 의 전부.
   - 다른 무수한 도구가 아닌 **정확히 이 도구** 가 호출되는 개연성·필연성을 학생이 인식하도록 명시화.

   ### Trigger 를 구성하는 사고 요소 (절차)
   주어진 풀이를 분석할 때 다음을 모두 명시하세요:

   **(1) Tool 식별** — 풀이에 사용된 정확한 도구를 한 줄로 (단원 이름 X, 세밀한 도구 O).

   **(2) 신호 (signal)** — 문제 표면에서 사람의 눈에 보이는 어떤 단서가 그 도구를 부르는가? 학생이 즉시 인지할 수 있는 표현·기호·조건·구조.

   **(3) 개연성 / 필연성 (necessity)** — Trigger 의 핵심. 왜 다른 도구가 아닌 정확히 이 도구를 떠올리는 것이 자연스럽거나 불가피한가?
     - **개연성**: 그 신호가 보일 때 가능한 여러 도구 중 이 도구가 가장 효율적·자연스러운 이유.
     - **필연성**: 그 신호의 수학적 구조가 이 도구만의 적용을 보장·강제하는 이유 (다른 도구는 작동하지 않거나 비효율적인 이유).
     - 비교 관점 필수: "직접 전개·미분·다른 변환 같은 대안이 가능했지만, 이 도구가 이러한 이유로 우선" 형식.

   **(4) 인식 구조 (recognition pattern)** — 학생이 다음에 같은 신호를 만나면 **자동으로 같은 도구가 머릿속에서 떠오르도록** 신호-도구 연결을 어떻게 내재화할지.

   ### 단 하나의 절차 적용 시연
   합성함수 \\(f(x-1)\\) 이 반복 등장한 풀이:
   "**Tool**: \\(u = x-1\\) 로 두고 \\(f(u)\\) 형태로 재기술하는 치환. **신호**: 함수 인자가 단순 변수가 아닌 \\(x-1\\) 같은 일차식으로 반복 등장. **개연성·필연성**: 같은 인자 표현식이 반복되면 그 인자를 통째로 새 변수로 보는 것이 사고를 가장 단순화시키며, 직접 전개나 미분 같은 대안은 표현식이 복잡할수록 비효율이 누적되어 결국 치환을 다시 거치게 되므로, 처음부터 치환이 자연스럽고 거의 불가피한 선택이 된다. **인식 구조**: '합성함수 인자가 일차식·익숙한 형태로 반복' 신호 → '인자를 새 변수로 두는 치환' 도구. 이 신호-도구 연결을 자동 호출되도록 새겨두면 다음에 같은 신호를 보는 순간 치환 사고가 머리에서 즉시 일어난다."

   ### 절대 금지
   - 추상적 메타: "양방향", "순행", "역행", "forward", "backward", "trigger 발동 패턴" — 학생에게 무의미.
   - 단원 이름만 쓰고 끝: "치환을 사용한다" / "보조선을 긋는다" — 어떤 치환·어느 보조선인지 세밀히.
   - Trigger 와 Tool 혼동: "이 trigger 는 치환이다" 는 잘못. Trigger 는 "치환이 떠오르는 이유" 이지 치환 자체가 아님.

## 출력 (반드시 JSON 만, 다른 텍스트·코드펜스·해설 금지)
{
  "core_insight": "...",
  "step_flow_narrative": "...",
  "hardest_resolution": "...",
  "generalization": "...",
  "trigger_motivation": "..."
}

각 필드는 비워두지 마세요. 풀이 정보가 부족해도 문제 유형으로부터 추론해서라도 채우세요. 학생이 "정리하지 못했습니다" 메시지를 보지 않도록.`;

// ────────────────────────────────────────────────────────────────────────────
// JSON 파싱 + fallback
// ────────────────────────────────────────────────────────────────────────────

const FALLBACK_SUMMARY: SolutionSummary = {
  core_insight: '핵심 통찰을 정리하지 못했습니다.',
  step_flow_narrative: '단계 흐름을 정리하지 못했습니다.',
  hardest_resolution: '가장 어려운 부분의 해결 통찰을 정리하지 못했습니다.',
  generalization: '일반 원칙을 정리하지 못했습니다.',
  trigger_motivation: '그 생각을 떠올린 이유를 정리하지 못했습니다.',
};

function parseSummaryJson(raw: string): SolutionSummary {
  if (!raw) return FALLBACK_SUMMARY;
  // 모델이 코드펜스로 감싸는 경우 제거
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  // 첫 { ~ 마지막 } 추출 (앞뒤 잡설 방지)
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) return FALLBACK_SUMMARY;
  const jsonText = cleaned.slice(start, end + 1);
  try {
    const obj = JSON.parse(jsonText) as Partial<SolutionSummary>;
    return {
      core_insight:
        typeof obj.core_insight === 'string' && obj.core_insight.trim()
          ? obj.core_insight.trim()
          : FALLBACK_SUMMARY.core_insight,
      step_flow_narrative:
        typeof obj.step_flow_narrative === 'string' && obj.step_flow_narrative.trim()
          ? obj.step_flow_narrative.trim()
          : FALLBACK_SUMMARY.step_flow_narrative,
      hardest_resolution:
        typeof obj.hardest_resolution === 'string' && obj.hardest_resolution.trim()
          ? obj.hardest_resolution.trim()
          : FALLBACK_SUMMARY.hardest_resolution,
      generalization:
        typeof obj.generalization === 'string' && obj.generalization.trim()
          ? obj.generalization.trim()
          : FALLBACK_SUMMARY.generalization,
      trigger_motivation:
        typeof obj.trigger_motivation === 'string' && obj.trigger_motivation.trim()
          ? obj.trigger_motivation.trim()
          : FALLBACK_SUMMARY.trigger_motivation,
    };
  } catch {
    return FALLBACK_SUMMARY;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 사용자 페이로드 빌더
// ────────────────────────────────────────────────────────────────────────────

const MAX_PROBLEM_CHARS = 2000;
const MAX_STEPS_FOR_PAYLOAD = 10;

function buildUserPayload(args: SummarizeSolutionArgs): string {
  const problem = (args.problem_text ?? '').slice(0, MAX_PROBLEM_CHARS);

  const stepsForPayload = args.steps.slice(0, MAX_STEPS_FOR_PAYLOAD);
  const stepsText = stepsForPayload
    .map((s) => {
      const star = s.index === args.pivotal_step_index ? ' ★pivotal' : '';
      return `- ${s.index + 1}단계 [${s.kind}]${star}: ${s.summary}`;
    })
    .join('\n');

  const hardestNote = args.hardest_resolution_text
    ? `\n### 참고: AI 가 어려워한 부분 해결 통찰 (이미 분석됨)\n${args.hardest_resolution_text.slice(0, 500)}`
    : '';

  const triggerNote = args.primary_trigger && args.primary_trigger.tool_name
    ? `\n### 참고: 핵심 trigger (왜 이 도구를 떠올렸는가)\n- 도구: ${args.primary_trigger.tool_name}\n- 발동 조건 패턴: ${args.primary_trigger.pattern_short}\n- 왜: ${args.primary_trigger.why_text}\n→ trigger_motivation 필드 작성 시 이 정보를 학생 친화 톤으로 풀어 설명하세요.`
    : '';

  return `### 원문제 (요약)
${problem}

### 풀이 단계 (${stepsForPayload.length}/${args.steps.length}개)
${stepsText || '(단계 없음)'}
${hardestNote}
${triggerNote}

위 풀이를 학생에게 5~7 문장으로 정리해주세요. JSON 만 출력 (5 필드 모두).`;
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 진입점
// ────────────────────────────────────────────────────────────────────────────

export async function summarizeSolution(
  args: SummarizeSolutionArgs,
): Promise<SolutionSummary> {
  if (!args.problem_text?.trim() || args.steps.length === 0) {
    return FALLBACK_SUMMARY;
  }

  try {
    // Δ16 — Haiku → Sonnet 4.6 격상. max_tokens 500 → 2500. 시간·토큰 더 투자.
    // 사용자 결정: "리포트 생성에 더 많은 시간 할애 + 토큰 더 사용 — 학생이 더 나은 사고를 하도록".
    const result = await callModel({
      model_id:
        process.env.LEGEND_REPORT_MODEL ??
        process.env.ANTHROPIC_SONNET_MODEL_ID ??
        'claude-sonnet-4-6-20260101',
      provider: 'anthropic',
      mode: 'baseline',
      problem: buildUserPayload(args),
      system_prompt: SOLUTION_SUMMARY_SYSTEM,
      max_tokens: 2500,
    });
    return parseSummaryJson(result.text ?? '');
  } catch (e) {
    console.warn('[solution-summarizer] failed:', (e as Error).message);
    return FALLBACK_SUMMARY;
  }
}

// 내부 함수 export — 단위 테스트용
export const __test = { parseSummaryJson, buildUserPayload, FALLBACK_SUMMARY };
