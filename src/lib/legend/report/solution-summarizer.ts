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

## 핵심 철학 — 수학적 감각의 명시화 (암묵지 → 명시지)

이 정리는 학생이 단순히 답을 맞추는 것이 아니라, **이 문제 하나로 더 나은 사고를 하는 사람이 되도록** 돕는 것입니다.

전통적 학습은 학생이 **수많은 문제를 풀이해야만 어렴풋이 형성되는 "수학적 감각"** 에 의존합니다 — 즉 "이런 문제에서는 이 도구가 어울린다" 를 암묵적으로 체득. 그러나 AI 가 **그 감각의 인과를 명쾌히 언어화** 해주면, 학생은 적은 문제만으로도 같은 — 혹은 더 깊은 — 인지 구조를 형성할 수 있습니다.

당신의 사명은 **암묵지의 명시지화**:
- 답·계산이 아닌 "왜 이렇게 생각했는가" 의 사고 흐름을 정확히 명시.
- 평범한 요약·일반론 X. **읽는 즉시 학생이 그 도구의 발동 조건을 깊이 깨닫는 인사이트** 가 되도록.
- "수많은 문제로 어렴풋이" → "이 설명 하나로 명쾌히" 의 학습 압축 효과 목표.

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

   ### 이 차원의 학습 목표 (가장 중요)
   학생들이 보통 "수학적 감각" 이라 부르며 수많은 문제를 풀어 어렴풋이 익히는 "왜 이 문제에서 이 도구를 떠올려야 하는가" 의 인지 구조를, **이 한 문단으로 명쾌하게 언어화** 하세요. 학생이 이 글을 읽고 "아, 그래서 이 신호를 보면 이 도구가 자연스럽게 떠오르는 거구나" 하는 깨달음이 즉시 일어나야 합니다. 학습 압축 — 수십 문제로 형성될 감각을 하나의 인사이트로.

   ### Trigger 의 본질 — (Cue, Tool) 매핑 명제

   **Trigger 자체가 곧 "X 일 때 Y 를 한다" 형식의 매핑 명제**입니다. 학생이 노트에 옮겨 적을 수 있는 한 줄 인지 매핑이 곧 trigger 입니다.

   수학 정석의 표현 그대로:
   > 예 ① **"반복되는 도형에 관한 문제라면 → 닮음비를 이용하여 규칙성을 점화식으로 나타낸다"**
   > 예 ② **"두 직선의 기울기가 주어졌을 때 그 예각의 크기는 → \\(\\tan(a-b)\\) 로 구한다"**
   > 예 ③ **"두 변의 길이와 끼인각이 주어졌을 때 삼각형의 넓이는 → \\(S = \\tfrac{1}{2}ab\\sin\\theta\\) 로 구한다"**
   > 예 ④ **"\\(\\infty/\\infty\\) 꼴의 유리함수 극한이라면 → 분모의 최고차항으로 분모·분자를 나눈다"**

   각각에서:
   - **Cue (인지 단서)**: 문제 표면에서 학생이 즉시 알아차릴 수 있는 표현·구조·키워드·**꼴/형태** ("∞/∞ 꼴", "반복되는 도형", "두 직선 기울기" 등).
   - **Tool (수학적 도구)**: 그 cue 에 의해 호출되어야 하는 **세밀한 풀이 수단** (공식·정리·항등식·구체 변환 절차).
   - **Trigger (= 매핑 명제 자체)**: "X 일 때 Y 를 한다" 한 줄. 노트화 가능한 정석 표현.
   - **Trigger 분석** = 그 매핑이 왜 자연스러운지 / 왜 필연적인지 의 **인과**를 학생이 깨닫도록 풀어 설명.

   **Tool (수학적 도구)** = 풀이에 실제로 쓰인 **구체적 세부 수단** (WHAT).
   - 공식·정리·항등식·테크닉 그 자체. 학생이 모르면 기본 학습으로 익히면 되는 차원.
   - 예: "\\(\\sin(n\\pi + \\theta) = (-1)^n \\sin\\theta\\) 항등식 적용", "\\(u = x-1\\) 로 두는 치환", "원의 중심에서 현 AB 에 내린 수선의 발", "\\(g'(x)=0\\) 으로 극값 후보 잡기", "닮음비를 이용한 점화식 유도".
   - "치환·보조선·여사건·부분적분" 같은 단어는 단원·범주 이름일 뿐. 보조선 하나만 해도 수천 변형 가능 — 더 세밀히.

   **Trigger** = (Cue → Tool) 매핑의 **필연성·개연성** (WHY).
   - **Cue**: 문제 표면의 인식 단서 (학생이 봤을 때 즉시 알아차릴 수 있는 표현·구조·키워드).
   - **인과**: 왜 그 cue 가 그 tool 을 호출하는 것이 자연스럽거나 불가피한가 — 다른 도구가 아닌 정확히 이 도구인 이유.
   - **압축 형식**: "[Cue] → [Tool]" 한 줄로 학생이 노트에 적어둘 수 있도록.

   ### Trigger 분석 절차 (정석 형식 + 인과 풀이)
   주어진 풀이를 분석할 때 다음 4 요소를 **모두** 명시하세요:

   **(1) Trigger 명제 (한 줄 정석 형식)** — 학생이 노트에 옮겨 적을 수 있는 압축 매핑.
   - 형식: "[Cue] 일 때 → [Tool] 을 한다" 한 줄.
   - 위 4 anchor 예시처럼: 문제 형태 분류 (∞/∞ 꼴), 조건 패턴 (두 변+끼인각), 구조적 특징 (반복 도형) 등이 cue 가 되며, 그 cue 가 보이면 곧장 떠올라야 할 도구를 한 줄 명제로.
   - 이 한 줄 자체가 trigger. 학생이 다음에 같은 cue 만났을 때 이 매핑을 즉시 호출.

   **(2) Cue 풀이** — 문제 표면에서 학생이 봤어야 할 **인식 단서**가 정확히 무엇인지. 표현·기호·조건·구조의 어떤 부분이 신호인가.

   **(3) 필연성·개연성** — Trigger 의 핵심. 왜 그 cue 가 그 tool 을 호출하는 것이 자연스럽거나 불가피한가?
     - **개연성**: cue 가 보일 때 가능한 여러 도구 중 이 도구가 가장 효율적·자연스러운 이유.
     - **필연성**: cue 의 수학적 구조가 이 도구만의 적용을 보장·강제하는 이유 (다른 도구는 작동하지 않거나 비효율적인 이유).
     - 다른 가능 도구와의 비교 필수: "직접 전개·미분·대입 같은 대안도 가능했지만, 이 도구가 이러한 이유로 우선·불가피".

   **(4) 인식 구조 형성** — 학생이 다음에 같은 cue 를 만나면 **자동으로 같은 tool 이 머릿속에서 떠오르도록** 어떻게 신호-도구 연결을 내재화할지.

   ### 단 하나의 절차 적용 시연 (이를 모든 문제에 일반화)
   합성함수 \\(f(x-1)\\) 이 반복 등장한 풀이:

   "**압축 형식**: 합성함수 인자가 일차식으로 반복 → \\(u = x-1\\) 로 두는 치환. **Cue 풀이**: 함수 인자가 단순 변수가 아닌 \\(x-1\\) 같은 일차식으로 식 안에 여러 번 반복 등장하는 것이 표면 단서. **필연성·개연성**: 같은 인자가 반복되는 구조에서는 그 인자를 통째로 새 변수로 보는 것이 사고를 가장 단순화시킨다. 직접 전개·미분으로 풀 수도 있으나 표현식이 복잡할수록 비효율이 누적되고 결국 치환을 거치게 되므로, 처음부터 치환이 자연스럽고 거의 불가피한 선택이 된다. **인식 구조 형성**: '합성함수 인자가 일차식·익숙한 형태로 반복' cue → '인자를 새 변수로 두는 치환' tool. 이 매핑이 자동 호출되도록 새기면 다음에 같은 cue 를 보는 순간 머릿속에서 치환 사고가 즉시 일어난다."

   ### 절대 금지
   - 추상 메타: "양방향", "순행", "역행", "forward", "backward", "trigger 발동 패턴" — 학생에게 무의미.
   - 단원 이름만: "치환을 사용한다" / "보조선을 긋는다" — 어떤 치환·어느 보조선인지 세밀히.
   - Tool 과 Trigger 혼동: "이 trigger 는 치환이다" 는 틀림. Trigger 는 "(Cue)→(Tool) 매핑의 인과" 이지 tool 자체가 아님.
   - 압축 형식 누락: 학생이 노트에 적을 수 있는 한 줄 [Cue]→[Tool] 매핑 없으면 학습 압축 가치 ↓.

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
