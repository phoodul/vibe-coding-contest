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

5. **trigger_motivation** (6~10 문장)

   ### 이 차원의 학습 목표
   학생이 수많은 문제를 풀어야 어렴풋이 익히는 "왜 이 문제에서 이 도구를 떠올려야 하는가" 의 인지 구조를, **이 한 문단으로 명쾌하게 언어화** 하세요. 수십 문제 → 하나의 인사이트로 학습 압축.

   ### 출력 작성 방식 — 용어보다 자문·형식 중심
   "Trigger", "Cue", "Mathematical tool" 같은 영어·메타 용어 라벨을 출력에 박지 마세요. LLM 은 이 용어를 사전 일반 의미로 해석해 빗나갑니다. 대신 **다음 자문 질문에 답하고 형식대로 한국어 한 문단으로 작성**:

   #### 자문 (메타인지의 정수)
   > **"왜 이 문제에서는 [그 도구]를 호출해야 할까?"**
   - 이 질문의 답이 곧 학생에게 전달할 통찰의 본질.
   - 답이 "이 문제이기 때문" 처럼 일반적이면 다시 사고. 답이 **"이 형태·꼴·조건·구조·키워드 때문"** 으로 구체화되면 그것이 표면 단서.

   #### 출력 형식 템플릿 (한국어 자연 문단, 라벨 X)
   "이 문제에서 핵심 도구는 [구체 도구]입니다. 그 도구를 호출해야 하는 이유는 [표면 단서 — 문제의 형태·꼴·조건·키워드 X 가 등장하기 때문]입니다. [표면 단서] 일 때 [그 도구] 를 적용한다는 매핑 자체가 바로 이런 유형 문제의 핵심 정석입니다. 다른 가능 도구 [대안 1·2] 도 시도 가능했으나, [그 대안이 비효율적이거나 작동하지 않는 이유] 이므로 [그 도구] 가 가장 자연스럽거나 불가피한 선택이 됩니다. 다음에 비슷한 [표면 단서] 를 만나면 [그 도구] 가 자동으로 떠오르도록 이 매핑을 새겨두세요."

   ### 4 분류 체계 (도구 ≠ 공식·정리)
   - **수학 공식**: 이미 알려진 공식 자체 (예: \\(a^2+b^2=c^2\\), \\(S=\\tfrac{1}{2}ab\\sin\\theta\\)). 이건 도구 아님.
   - **수학 정리**: 이름 있는 정리 (롤의 정리, 평균값 정리, IVT). 이건 도구 아님.
   - **수학 도구** = **알려진 사실 + 그 활용 방법** 의 결합 명제.
     - 예 "매개변수로 나타낸 함수의 정적분은 치환적분을 이용한다"
     - 예 "함수 \\(f\\) 와 \\(g\\) 가 역함수면 \\(y=f(x)\\) 와 \\(y=g(x)\\) 는 직선 \\(y=x\\) 에 대해 대칭이다"
     - 예 "두 변과 끼인각이 주어졌을 때 삼각형 넓이는 \\(S=\\tfrac{1}{2}ab\\sin\\theta\\) 로 구한다"
     - 예 "\\(\\sqrt{f(x)}\\) 를 포함한 부정적분이라면 \\(\\sqrt{f(x)}=t\\) 혹은 \\(f(x)=t\\) 로 치환한다"
     - 단원 이름 (치환·보조선·여사건) X — 더 세밀한 활용 명제 O.
   - **Trigger** = **"이 문제는 왜 [그 도구] 를 사용해야 하는가?" 의 답** (이 특정 문제에서 그 도구가 호출되는 이유의 인과 명제).
     - 예 "이 문제의 식이 매개변수로 나타낸 함수의 정적분을 이용하는 형태이기 때문에 치환적분을 이용한다"
     - 예 "이 문제는 왜 구분구적법을 사용해야 하는가?" 의 답.

   ### 표면 단서 작성 시 주의
   - 학생이 문제 표면에서 즉시 인지 가능한 형태·꼴·조건·키워드.
   - 예: "∞/∞ 꼴 유리함수 극한", "두 변과 끼인각", "반복되는 도형", "매개변수로 나타낸 정적분 형태", "닫힌구간 연속+미분가능 동시 명시", "극값 단어".

   ### 형식 매핑 anchor (참고용 — 모방 X, 메타 패턴만 흡수)
   > 예 ① "반복되는 도형 → 닮음비를 이용한 점화식"
   > 예 ② "두 직선의 기울기 → \\(\\tan(a-b)\\) 로 예각"
   > 예 ③ "두 변과 끼인각 → \\(S=\\tfrac{1}{2}ab\\sin\\theta\\) 로 넓이"
   > 예 ④ "∞/∞ 꼴 유리함수 극한 → 분모 최고차항으로 분모·분자 나누기"
   > 예 ⑤ "밑·지수 모두 변수 또는 복잡한 함수 → 양변 절댓값 로그 + \\(x\\) 미분"

   ### 출력 전 자기 검증 (모두 통과해야 출력)
   - [ ] "왜 이 문제에서 [그 도구] 를 호출해야 할까?" 자문에 명료히 답했는가?
   - [ ] 학생이 즉시 인지 가능한 표면 단서를 정확히 짚었는가?
   - [ ] 도구가 단원 이름이 아니라 세밀한 수단인가?
   - [ ] 다른 가능 도구와의 비교 (왜 그것이 아닌 이 도구인가) 가 포함되었는가?
   - [ ] "양방향·순행·역행·forward·backward" 같은 추상 메타가 하나도 없는가?
   - [ ] "Trigger / Tool / Cue" 같은 영어·메타 용어 라벨이 출력 본문에 없는가?
   - [ ] 다음에 비슷한 단서를 만나면 같은 도구가 떠오르도록 인식 강화 한 줄이 있는가?

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
