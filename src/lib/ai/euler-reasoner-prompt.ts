/**
 * Reasoner Agent — 사용자 정의 BFS 프롬프트.
 *
 * Forward: 현재 조건 집합에서 알 수 있는 **모든** 새 사실 list 반환.
 * Backward: 목표 도달에 필요한 **모든** 가능한 경로 list 반환.
 *
 * 사용자 정정 (user_docs/math_layers.md):
 *   "단일 사실/단일 경로 만 반환하면 분기 불가능 + 단방향 직선 풀이로 환원."
 *   따라서 list 반환을 강제. 분기는 orchestrator 가 sub-task 병렬 Promise.all 로 진행.
 *
 * extended thinking 권장 (Sonnet 4.6).
 */

export interface ReasonerState {
  /** 문제 본문. */
  problem: string;
  /** 변수·미지수. */
  variables: string[];
  /** 현재까지 알려진 사실/조건 (forward 기점). */
  conditions: string[];
  /** 구하려는 목표 (backward 기점). */
  goal: string;
  /** 이전 단계에서 사용된 도구 (중복 회피용 힌트). */
  used_tools?: string[];
  /** 이전 BFS 경로 누적 (depth 추적). */
  path_so_far?: string[];
  /** 현재 BFS 깊이 (0..n). */
  depth?: number;
}

export interface ForwardFact {
  /** 새로 도출된 사실 (자연어 + 수식 혼용 가능) */
  fact: string;
  /** 사용한 도구 이름 (있으면) */
  tool?: string;
  /** 왜 이 사실이 도출되는가 (한 줄) */
  rationale: string;
}

export interface BackwardSubgoal {
  /** 목표 달성을 위해 필요한 중간 목표 */
  subgoal: string;
  /** 사용한 도구 이름 (있으면) */
  tool?: string;
  /** 왜 이 경로가 가능한가 */
  rationale: string;
}

const FORWARD_SYSTEM = `당신은 **Reasoner — Forward BFS** 입니다.

## 입력
- problem: 문제 본문
- variables: 변수
- conditions: 현재까지 알려진 조건/사실 list
- used_tools (옵션): 이미 사용한 도구 (피하라)
- depth: 현재 BFS 깊이

## 작업
**현재 conditions 집합으로 알 수 있는 모든 새 사실** 을 list 로 반환합니다.

## 절대 원칙
- **단일 사실 1개만 반환 금지**. 분기 가능한 모든 사실을 나열.
- 이미 conditions 에 있는 사실은 **반환 금지** (순환 방지).
- 자연수 정수 등의 자명한 정의는 반환 금지.
- 가능한 사실이 없으면 빈 list \`[]\`. 빈 list = forward dead-end 신호.

## 출력 (JSON only)
{
  "facts": [
    { "fact": "f'(x) = 3x^2 - 6x", "tool": "도함수", "rationale": "다항식 미분 규칙 적용" },
    { "fact": "f'(x) = 0 의 해는 x = 0, 2", "tool": "이차방정식 인수분해", "rationale": "도함수 영점 계산" },
    ...
  ],
  "dead_end": false
}

## 분기 양 권장
- depth 0~1: 3~5 개
- depth 2~3: 2~4 개
- depth 4+: 0~2 개 (수렴)
`;

const BACKWARD_SYSTEM = `당신은 **Reasoner — Backward BFS** 입니다.

## 입력
- problem: 문제 본문
- goal: 구하려는 대상
- conditions: 현재까지 알려진 조건/사실
- used_tools (옵션)
- depth: 현재 BFS 깊이

## 작업
**goal 도달에 필요한 가능한 모든 중간 목표(subgoal) list** 를 반환합니다.

## 절대 원칙
- **단일 경로만 반환 금지**. 분기 가능한 모든 subgoal 을 나열.
- 이미 conditions 로 충족되는 subgoal 은 반환 금지 (그건 forward 의 일).
- 가능한 경로 없으면 빈 list \`[]\`. 빈 list = backward dead-end 신호.

## 출력 (JSON only)
{
  "subgoals": [
    { "subgoal": "f(x) 의 극값을 구한다", "tool": "1계도함수극값", "rationale": "최댓값=극값 후보 + 끝점 비교" },
    { "subgoal": "f(x) 의 끝점 함숫값을 구한다", "tool": "직접대입", "rationale": "닫힌구간 최댓값에는 끝점도 후보" }
  ],
  "dead_end": false
}

## 분기 양 권장
- depth 0~1: 2~4 개
- depth 2+: 1~3 개
`;

function formatState(state: ReasonerState): string {
  return `### 현재 상태
problem: ${state.problem}
variables: [${state.variables.join(", ")}]
conditions:
${state.conditions.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}
goal: ${state.goal}${
    state.used_tools && state.used_tools.length
      ? `\nused_tools: [${state.used_tools.join(", ")}]`
      : ""
  }
depth: ${state.depth ?? 0}

JSON 만 출력.`;
}

export function buildForwardPrompt(state: ReasonerState): { system: string; user: string } {
  return { system: FORWARD_SYSTEM, user: formatState(state) };
}

export function buildBackwardPrompt(state: ReasonerState): { system: string; user: string } {
  return { system: BACKWARD_SYSTEM, user: formatState(state) };
}
