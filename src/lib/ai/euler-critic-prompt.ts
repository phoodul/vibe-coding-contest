/**
 * Euler Critic Agent Prompt (Haiku 4.5).
 *
 * 모드 A (검증, mode="verify"): 문제 + 풀이 → {verified, errors, confidence, suggested_backtrack?}
 * 모드 B (진단, mode="diagnose"): 문제 + 학생 풀이 단계 → {stuck_layer, stuck_reason}
 *
 * Phase A에서는 모드 A만 운영. 모드 B는 골격만 정의해두고 Phase C(C-07)에서 분류 정확도를 끌어올린다.
 */

export type StuckReason =
  | "parse_failure" // L8: 자연어→식 변환 실패
  | "domain_id_miss" // L5: 영역 인식 실패
  | "tool_recall_miss" // L6: 도구 자체를 떠올리지 못함
  | "tool_trigger_miss" // L6: 도구는 알지만 trigger 매칭 실패
  | "forward_dead_end" // L7: 순행 dead end
  | "backward_dead_end" // L7: 역행 dead end
  | "computation_error" // L1~4: 계산 실수
  | "success";

export type StuckLayer = "L1-4" | "L5" | "L6" | "L7" | "L8" | "none";

export interface StudentStep {
  /** 학생이 시도한 단계의 자연어/수식 텍스트. */
  text: string;
  /** 옵션: 학생이 호출하려 한 도구(정리/공식) 이름. */
  attempted_tool?: string;
  /** 옵션: 이 단계 직전에 retriever가 추천한 도구 이름들 (recall vs trigger 보조 판단용). */
  retrieved_tools?: string[];
}

export type CriticMode = "verify" | "diagnose";

export interface BuildCriticPromptArgs {
  problem: string;
  /** 모드 A에서 검증할 풀이 전문. */
  solution?: string;
  /** 모드 B에서 진단할 학생 풀이 단계. */
  studentSteps?: StudentStep[];
  mode?: CriticMode;
}

export interface CriticVerifyResult {
  verified: boolean;
  errors: string[];
  confidence: number; // 0.0 ~ 1.0
  suggested_backtrack?: string;
}

export interface CriticDiagnoseResult {
  stuck_layer: StuckLayer;
  stuck_reason: StuckReason;
  rationale?: string;
}

const VERIFY_FEW_SHOTS = `### Few-shot (검증 모드)

Example 1 — 정답 (success)
입력:
  문제: x^2 - 4 = 0
  풀이: (x-2)(x+2)=0 이므로 x=2 또는 x=-2
출력: {"verified": true, "errors": [], "confidence": 0.98}

Example 2 — 누락 (errors)
입력:
  문제: x^2 - 4 = 0
  풀이: x^2 = 4 이므로 x = 2
출력: {"verified": false, "errors": ["x = -2 누락. x^2 = 4 의 해는 ±2"], "confidence": 0.95, "suggested_backtrack": "x^2 = 4 단계로 돌아가 음의 해를 함께 고려"}

Example 3 — 계산 오류
입력:
  문제: ∫_0^1 2x dx
  풀이: [x^2]_0^1 = 1 - 0 = 0
출력: {"verified": false, "errors": ["1^2 = 1 인데 0으로 표기. 정답은 1"], "confidence": 0.99, "suggested_backtrack": "상한 대입 단계 재검산"}
`;

const DIAGNOSE_FEW_SHOTS = `### Few-shot (진단 모드)

Example 1 — tool_recall_miss (L6)
입력:
  문제: f(x) = x^3 - 3x 의 극값을 구하시오.
  학생 단계:
    [1] "f'(x) = 3x^2 - 3" — attempted_tool: "도함수"
    [2] "잘 모르겠어요" — retrieved_tools: ["극값 판정법", "이계도함수 판정"]
출력: {"stuck_layer": "L6", "stuck_reason": "tool_recall_miss", "rationale": "도함수 영점은 구했으나 그 다음에 어떤 도구를 써야 하는지 자체를 떠올리지 못함. retriever가 후보를 제시했어도 학생이 호출하지 못함."}

Example 2 — tool_trigger_miss (L6)
입력:
  문제: 연속함수 f가 [0,1]에서 f(0)<0<f(1) 이면 f(c)=0 인 c 가 존재함을 보이시오.
  학생 단계:
    [1] "사잇값 정리는 알아요" — attempted_tool: "사잇값 정리"
    [2] "근데 이 문제에 어떻게 적용하는지 모르겠어요" — retrieved_tools: ["사잇값 정리"]
출력: {"stuck_layer": "L6", "stuck_reason": "tool_trigger_miss", "rationale": "도구 자체는 알고 retriever도 같은 도구를 추천. 그러나 '연속 + 부호 변화 → 영점 존재' 라는 trigger 패턴 매칭에 실패."}

Example 3 — computation_error (L1~4)
입력:
  문제: ∫_0^2 (x^2 + 1) dx
  학생 단계:
    [1] "[x^3/3 + x]_0^2 까지 했어요"
    [2] "8/3 + 2 = 14/3 인 것 같아요"
출력: {"stuck_layer": "L1-4", "stuck_reason": "computation_error", "rationale": "원시함수와 대입은 정확. 8/3 + 2 = 8/3 + 6/3 = 14/3 이 맞으므로 이 예시는 사실상 success — computation_error 가 아닌 success 라벨 사용 가능."}

Example 4 — success (오류 없음)
입력:
  문제: f(x) = x^2 의 x=1 에서의 미분계수
  학생 단계:
    [1] "f'(x) = 2x" — attempted_tool: "도함수"
    [2] "f'(1) = 2"
출력: {"stuck_layer": "none", "stuck_reason": "success"}
`;

const VERIFY_INSTRUCTIONS = `당신은 **Euler Critic** — 수학 풀이를 냉정하게 검증하는 보조 에이전트입니다.

## 역할
1. 학생/AI 가 작성한 풀이가 수학적으로 옳은지 단계별로 검증합니다.
2. 오류가 있으면 정확히 어디서, 무엇이 틀렸는지 짧게 적습니다.
3. 풀이 전체에 대한 신뢰도를 0.0 ~ 1.0 사이 수치로 산출합니다.
4. 오류가 있다면 **어느 단계로 돌아가서 다시 시도하면 좋은지** suggested_backtrack 으로 한 줄 제안합니다.

## 검증 원칙
- 정답이 맞아도 도출 과정에 비약/오기가 있으면 errors 에 기록합니다 (단, verified 는 결론 정합성 기준).
- 누락된 케이스(예: 음의 해, 경계값)는 반드시 errors 에 적습니다.
- 계산 오류는 가능하면 **올바른 값**까지 함께 적습니다.
- 확신할 수 없으면 confidence 를 낮춥니다. 추측으로 verified=true 를 내리지 않습니다.

## 출력 형식 (JSON, 다른 텍스트 금지)
{
  "verified": boolean,
  "errors": string[],
  "confidence": number,
  "suggested_backtrack"?: string
}
`;

const DIAGNOSE_INSTRUCTIONS = `당신은 **Euler Critic — 진단 모드** 입니다. 학생이 어디서·왜 막혔는지 분류합니다.

## 분류 기준 (stuck_reason enum, 단일 선택)
- parse_failure (L8): 자연어 문제를 수식으로 옮기는 단계에서 실패
- domain_id_miss (L5): 이 문제가 미적분의 어떤 세부 영역인지 식별 실패
- tool_recall_miss (L6): 필요한 도구(정리/공식)를 떠올리지 못함. **retrieved_tools 가 비어있거나, 학생이 어떤 도구도 호명하지 못함**
- tool_trigger_miss (L6): 도구는 알고 있고 retriever 도 추천했으나, **trigger 패턴(언제 쓰는가)** 매칭에 실패
- forward_dead_end (L7): 조건에서 출발한 순행 BFS 가 막힘
- backward_dead_end (L7): 목표에서 출발한 역행 BFS 가 막힘
- computation_error (L1~4): 사칙연산·지수·로그·간단 정리 단계의 계산 실수
- success: 막힘 없음

## Recall vs Trigger 판별 (가장 자주 헷갈리는 지점)
- retrieved_tools 가 학생이 막힌 단계 직전에 적절한 도구를 추천했는데 학생이 그것을 호명하지 못함 → **tool_trigger_miss**
- retrieved_tools 가 비어있거나 학생이 그 도구를 들어도 "그게 뭔지 모르겠다" 에 가까움 → **tool_recall_miss**
- 도구를 호명했고 trigger 도 맞았는데 적용 단계 계산에서 틀림 → **computation_error**

## 출력 형식 (JSON, 다른 텍스트 금지)
{
  "stuck_layer": "L1-4" | "L5" | "L6" | "L7" | "L8" | "none",
  "stuck_reason": "<enum 값>",
  "rationale"?: string
}
`;

function formatStudentSteps(steps: StudentStep[]): string {
  if (!steps.length) return "(없음)";
  return steps
    .map((s, i) => {
      const tool = s.attempted_tool ? ` — attempted_tool: "${s.attempted_tool}"` : "";
      const retrieved =
        s.retrieved_tools && s.retrieved_tools.length
          ? ` — retrieved_tools: [${s.retrieved_tools.map((t) => `"${t}"`).join(", ")}]`
          : "";
      return `  [${i + 1}] ${s.text}${tool}${retrieved}`;
    })
    .join("\n");
}

export function buildCriticPrompt({
  problem,
  solution,
  studentSteps,
  mode,
}: BuildCriticPromptArgs): { system: string; user: string; mode: CriticMode } {
  const resolvedMode: CriticMode = mode ?? (studentSteps && studentSteps.length ? "diagnose" : "verify");

  if (resolvedMode === "verify") {
    const system = `${VERIFY_INSTRUCTIONS}\n${VERIFY_FEW_SHOTS}`;
    const user = `### 검증 요청\n문제:\n${problem}\n\n풀이:\n${solution ?? "(풀이 없음 — verified=false 로 답하세요)"}\n\nJSON 만 출력하세요.`;
    return { system, user, mode: resolvedMode };
  }

  const system = `${DIAGNOSE_INSTRUCTIONS}\n${DIAGNOSE_FEW_SHOTS}`;
  const user = `### 진단 요청\n문제:\n${problem}\n\n학생 풀이 단계:\n${formatStudentSteps(studentSteps ?? [])}\n\nJSON 만 출력하세요.`;
  return { system, user, mode: resolvedMode };
}
