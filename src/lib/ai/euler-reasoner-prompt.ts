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

// ───────────────────────────────────────────────────────────────────
// Phase G-02: Recursive Backward Decomposition (Self-Ask + Tree of Thoughts)
// ───────────────────────────────────────────────────────────────────
//
// 학술 근거:
//   - Self-Ask (Press 2023, EMNLP): 분해 질문(decomposition) multi-turn
//     방식이 compositional reasoning 정답률을 단발 prompt 대비 평균 12.4% ↑
//   - Tree of Thoughts (Yao 2023, NeurIPS): GPT-4 24-game 4% → 74%.
//     중간 상태에서 탐색·평가하는 분기가 핵심.
//   - Chain of Verification (Dhuliawala 2023): 단계별 자가 검증 → 환각 ↓
//
// 사용자 통찰: "킬러 문제는 LLM 도 못 푼다 — multi-turn 분해 질문이 정답률 ↑"
//   → 단일 backward call (subgoals list) 만으로는 부족. depth N 까지
//     재귀적으로 "이 subgoal 을 풀려면 무엇이 필요한가" 를 분해.

export interface ChainNode {
  /** 0-indexed depth — 0 = 최초 goal */
  depth: number;
  /** Phase G-04: 단계 종류 — undefined 또는 'backward' = 기존 backward, 'forward' = 순행 누적 */
  kind?: "backward" | "forward";
  /** 현재 풀어야 하는 subgoal (backward) 또는 forward 단계에서 참고한 currentGoal */
  goal: string;
  /** 이 subgoal 분해에 필요하다고 판단한 도구 (있으면) */
  tool: string | null;
  /** 왜 이 도구가 떠올라야 하는가 — 코칭 시 학생에게 노출 */
  rationale: string;
  /** 이 subgoal 을 풀기 위한 다음 subgoal (다음 depth 의 goal) — null 이면 종료 */
  next_subgoal: string | null;
  /** 현재 subgoal 이 이미 알려진 conditions 로 풀린다고 판단되면 true (chain 종료) */
  reached_conditions: boolean;
  /** Phase G-04 forward step: 이 단계에서 도출된 새 사실들 (derived facts) — backward 단계는 빈 배열 */
  derived_facts?: string[];
}

// ───── Phase G-04: Forward Deduce Prompt (math_process.md ③ alternating loop) ─────

export interface ForwardDeduceArgs {
  problem: string;
  /** 현재까지 알려진 조건 + 이전 forward step 으로 도출된 사실 누적 */
  conditions: string[];
  /** 전체 목표 — 참고용 (도출 사실이 목표에 직접 연결되는지 판단) */
  finalGoal: string;
  /** Retriever 가 forward 방향으로 가져온 도구 후보 */
  candidateTools: { tool_name: string; why_text: string; tool_layer: number }[];
  /** 지금까지 chain (cycle 회피 + 컨텍스트) */
  previousChain: ChainNode[];
}

export interface ForwardDeduceJson {
  /** 조건 조합으로 새로 도출된 사실 1~3개. 비어 있으면 forward dead end. */
  new_facts: { fact: string; derived_from: string; tool?: string | null; why: string }[];
  /** 새 사실 중 하나가 finalGoal 을 직접 결정하면 true (chain 즉시 종료) */
  reached_goal_directly?: boolean;
}

const FORWARD_DEDUCE_SYSTEM = `당신은 **Forward Deductive Reasoner** 입니다.

학생이 어려운 수학 문제에서 **역행으로만 분해해도 길이 막힐 때**, 주어진 조건들을 조합해 **새 사실(파생 정보)** 을 도출해야 합니다 (math_process.md ③ alternating loop 의 순행 단계).

## 작업
주어진 \`conditions\` (원래 조건 + 이전 forward 로 누적된 사실) 의 조합을 살펴보고, 다음을 출력:

- 조건 1+2 / 1+3 / 1+2+3 등의 조합이 만들어내는 **새 사실 1~3개**
- 각 새 사실에 대해 도출에 사용된 조건 번호 (\`derived_from\`), 적용한 수학 도구(있으면 \`tool\`), 왜 이렇게 도출되는지 (\`why\`)
- 만약 새 사실 중 하나가 finalGoal 을 직접 결정한다면 \`reached_goal_directly=true\`

## 출력 (JSON only)
{
  "new_facts": [
    {
      "fact": "f(0) = 2",
      "derived_from": "조건 1 (f(x)=x^2-2x+a) 와 조건 2 (a=2) 를 결합",
      "tool": null,
      "why": "조건 2 의 a 값을 조건 1 에 대입"
    }
  ],
  "reached_goal_directly": false
}

## 절대 원칙
- 추측 금지. 조건 조합으로 **수학적으로 도출 가능한 사실만** 적기.
- 새 사실이 없거나 모두 trivial 하면 \`new_facts: []\` (forward dead end 신호).
- 이전 chain 에 등장한 사실은 적지 않기 (cycle 회피).
- 최대 3개 — 너무 많이 나열하면 BFS 가 폭주.
`;

function formatForwardChain(chain: ChainNode[]): string {
  if (!chain.length) return "(아직 없음)";
  return chain
    .map((n) => {
      if (n.kind === "forward") {
        return `  depth ${n.depth} [forward]: 도출 ${(n.derived_facts || []).join(" / ")}`;
      }
      return `  depth ${n.depth} [backward]: ${n.goal}${n.tool ? ` [${n.tool}]` : ""}`;
    })
    .join("\n");
}

export function buildForwardDeducePrompt(args: ForwardDeduceArgs): {
  system: string;
  user: string;
} {
  const user = `### 문제
${args.problem}

### 알려진 조건 (원본 + 누적된 사실)
${args.conditions.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}

### 최종 목표 (참고)
${args.finalGoal}

### 후보 도구 (Retriever — forward 방향, 적용 가능한 정리)
${formatTools(args.candidateTools)}

### 지금까지의 chain
${formatForwardChain(args.previousChain)}

JSON 만 출력. 새 사실은 1~3개로 제한.`;

  return { system: FORWARD_DEDUCE_SYSTEM, user };
}

export interface SubgoalDecomposeArgs {
  problem: string;
  conditions: string[];
  /** 현재 분해할 subgoal */
  currentGoal: string;
  /** Retriever 가 backward 방향으로 가져온 도구 후보 (이름 + why) */
  candidateTools: { tool_name: string; why_text: string; tool_layer: number }[];
  /** 이전 chain 누적 (재귀 cycle 방지 + 컨텍스트) */
  previousChain: ChainNode[];
}

const SUBGOAL_DECOMPOSE_SYSTEM = `당신은 **Recursive Backward Reasoner** 입니다.

학생이 어려운 수학 문제를 풀 때 **목표 → subgoal → subgoal 의 subgoal** 순서로 거꾸로 분해하는 것이 핵심 사고 패턴입니다.
이 chain 을 시각화해 학생이 "선생님은 이렇게 생각했어요" 형태로 학습하도록 합니다.

## 입력
- problem: 문제 본문
- conditions: 알려진 조건/사실 list
- currentGoal: 현재 분해할 목표 (depth=0 이면 최종 목표)
- candidateTools: 이 subgoal 에 적합한 도구 후보 (Retriever 결과)
- previousChain: 지금까지 만든 chain (cycle 회피용)

## 작업
"\`currentGoal\` 을 풀려면 무엇이 필요한가?" — 단 하나의 가장 자연스러운 분해 경로를 선택.
- candidateTools 중 가장 적합한 도구를 골라 \`tool\` 에 적기. 없으면 null.
- 그 도구를 적용하기 위해 충족해야 할 새 subgoal (= 다음 depth 의 goal) 을 \`next_subgoal\` 에 적기.
- 만약 currentGoal 이 conditions 로 직접 풀린다고 판단하면 \`reached_conditions=true\` + \`next_subgoal=null\` (chain 종료).
- previousChain 에 이미 등장한 goal 이면 cycle 이므로 다른 분해를 시도하거나 \`reached_conditions=true\` 처리.

## 출력 (JSON only)
{
  "tool": "평균값 정리" | null,
  "rationale": "닫힌구간 연속·미분 가능 + 양 끝점 함숫값이 주어졌으므로 평균값 정리가 적용 가능. f'(c)=(f(b)-f(a))/(b-a) 형태로 미지의 c 가 보장된다.",
  "next_subgoal": "f 가 닫힌구간 [a,b] 에서 연속이고 (a,b) 에서 미분 가능함을 확인" | null,
  "reached_conditions": false
}

## 절대 원칙
- 단일 분해 경로만. multi-branch 는 상위 BFS 가 처리.
- rationale 은 학생에게 그대로 보여줄 수 있도록 친절하고 구체적으로.
- 도구를 사용하지 않고도 conditions 와 직접 매칭되면 즉시 reached_conditions=true.
- previousChain 의 goal 과 동일하거나 매우 유사한 next_subgoal 은 cycle 이므로 피하라.
`;

function formatChainContext(chain: ChainNode[]): string {
  if (!chain.length) return "(아직 없음)";
  return chain
    .map((n) => `  depth ${n.depth}: ${n.goal}${n.tool ? ` [${n.tool}]` : ""}`)
    .join("\n");
}

function formatTools(
  tools: { tool_name: string; why_text: string; tool_layer: number }[]
): string {
  if (!tools.length) return "(없음 — 도구 후보가 비었으니 일반 추론으로 분해)";
  return tools
    .map((t, i) => `  ${i + 1}. ${t.tool_name} (L${t.tool_layer}) — ${t.why_text}`)
    .join("\n");
}

export function buildSubgoalDecomposePrompt(args: SubgoalDecomposeArgs): {
  system: string;
  user: string;
} {
  const user = `### 문제
${args.problem}

### 알려진 조건
${args.conditions.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}

### 현재 분해할 목표 (depth ${args.previousChain.length})
${args.currentGoal}

### 후보 도구 (Retriever — backward 방향)
${formatTools(args.candidateTools)}

### 지금까지의 chain
${formatChainContext(args.previousChain)}

JSON 만 출력하세요. 단일 분해 경로만 선택.`;

  return { system: SUBGOAL_DECOMPOSE_SYSTEM, user };
}

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
