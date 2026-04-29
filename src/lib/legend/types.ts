/**
 * Phase G-06 — Legend Tutor 공통 타입.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.1 (라우팅 타입) + §5.1 (R1 PerProblemReport).
 * Δ1 (5종 quota), Δ3 (LLM struggle), Δ4 (ToT reasoning tree) 반영.
 *
 * 영향 격리: 본 파일은 src/lib/legend/ 모듈 전용. 기존 src/lib/euler/* 와 import 만 가능.
 */

// ────────────────────────────────────────────────────────────────────────────
// 튜터 · tier · 영역
// ────────────────────────────────────────────────────────────────────────────

export type TutorName =
  | 'ramanujan_calc'   // Tier 0: Haiku + SymPy
  | 'ramanujan_intuit' // Tier 1: Opus 4.7 baseline
  | 'gauss'            // Tier 2: Gemini 3.1 Pro agentic
  | 'von_neumann'      // Tier 2: GPT-5.5 agentic
  | 'euler'            // Tier 2: Opus 4.7 agentic
  | 'leibniz';         // Tier 2: Sonnet 4.6 agentic

export type Tier = 0 | 1 | 2;

export type ProblemArea =
  | 'common'
  | 'calculus'
  | 'geometry'
  | 'probability'
  | 'algebra';

// ────────────────────────────────────────────────────────────────────────────
// 라우팅 (Stage 0 → 1 → 2)
// ────────────────────────────────────────────────────────────────────────────

export interface RouteInput {
  user_id: string;
  problem_text: string;
  problem_image_url?: string;
  input_mode: 'text' | 'photo' | 'handwrite' | 'voice';
  /** 사전 계산되어 있으면 재사용 */
  embedding?: number[];
}

export interface RouteDecision {
  stage_reached: 0 | 1 | 2;
  routed_tier: Tier;
  routed_tutor: TutorName;
  area?: ProblemArea;
  confidence?: number;
  /** Stage 0 hit 시 채워짐 */
  precomputed_triggers?: TriggerLabel[];
  /** Stage 2 escalation 신호 시 채워짐 */
  escalation_prompt?: EscalationPrompt;
  /** legend_routing_decisions.id */
  routing_decision_id: string;
  duration_ms: number;
}

export interface EscalationPrompt {
  signals: ('sympy_fail' | 'stuck_token')[];
  /** 학생 노출 카피 */
  message: string;
  options: Array<{
    kind: 'escalate' | 'retry' | 'hint_only';
    label: string;
    /** escalate 시 추천 튜터 */
    target_tutor?: TutorName;
  }>;
}

export interface TriggerLabel {
  trigger_id: string;
  tool_name: string;
  pattern_short: string;
  direction?: 'forward' | 'backward' | 'both';
  why?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// 튜터 호출
// ────────────────────────────────────────────────────────────────────────────

export interface TutorCallInput {
  user_id: string;
  problem_text: string;
  tutor: TutorName;
  call_kind: 'primary' | 'second_opinion' | 'retry';
  routing_decision_id: string;
  /** second_opinion 시 비교용 prior session 들 */
  prior_session_ids?: string[];
}

export interface TutorCallResult {
  session_id: string;
  trace_jsonb: unknown;
  final_answer: string;
  duration_ms: number;
  /** G06-09 — 1단계 자동 fallback 발생 시 set. 정상 호출 시 undefined. */
  fallback_event?: import('./tutor-fallback').FallbackEvent;
  /** G06-09 — 실제 응답한 튜터 (fallback 시 primary 와 다름). 정상 시 input.tutor 와 동일. */
  actual_tutor?: TutorName;
}

// ────────────────────────────────────────────────────────────────────────────
// Δ1 — 5종 quota
// ────────────────────────────────────────────────────────────────────────────

export type QuotaKind =
  | 'problem_total_daily'
  | 'legend_call_daily'
  | 'report_per_problem_daily'
  | 'weekly_report'
  | 'monthly_report'
  // Δ9 (G06-32): 비-베타 (체험판) 사용자의 라마누잔 일 3회 quota.
  | 'trial_ramanujan_daily';

export interface QuotaStatus {
  kind: QuotaKind;
  used: number;
  /** -1 = 무제한 */
  limit: number;
  allowed: boolean;
  /** limit_exceeded = 한도 초과, eligibility_gate = 누적 풀이 게이트 미충족 */
  blocked_reason?: 'limit_exceeded' | 'eligibility_gate';
  /** 누적 풀이 게이트 (weekly/monthly report 한정) */
  eligibility?: { current: number; required: number };
  /** ISO 일/주/월 종료 시각 */
  reset_at: string;
}

// ────────────────────────────────────────────────────────────────────────────
// R1 PerProblemReport schema 1.1 (Δ3 + Δ4 확장)
// ────────────────────────────────────────────────────────────────────────────

export interface PerProblemReport {
  schema_version: '1.2';
  problem_summary: {
    /** 80자 발췌 */
    text_short: string;
    area: ProblemArea;
    difficulty: number;
  };
  tutor: {
    name: TutorName;
    /** '가우스' */
    label_ko: string;
    /** 'Gemini 3.1 Pro' */
    model_short: string;
  };
  steps: PerProblemStep[];
  /** "가장 어려운 단계" — 학생에게 강조 */
  pivotal_step_index: number;
  trigger_summary: {
    /** 핵심 trigger 1개 */
    primary: TriggerCard;
    /** 같은 trigger 가진 다른 도구·예제 (max 3) */
    expansions: TriggerCard[];
  };
  /** 학생 stuck 추적 */
  stuck_signals: {
    layer: number | null;
    reason:
      | 'tool_recall_miss'
      | 'tool_trigger_miss'
      | 'computation_error'
      | 'forward_dead_end'
      | 'backward_dead_end'
      | 'parse_failure'
      | null;
    user_stuck_ms_total: number;
    revisited_step_indices: number[];
  };
  /** Δ3 — LLM struggle 추적 */
  llm_struggle_summary: {
    /** LLM 기준 가장 오래 걸린 step */
    hardest_step_index: number;
    hardest_step_ms: number;
    /** agentic 총 turn 수 */
    total_turns: number;
    total_tool_retries: number;
    /** "AI도 어려웠던 순간" 카피 — Haiku 요약 1~2문장 */
    resolution_narrative: string;
  };
  /** Δ4 — 추론 트리 */
  reasoning_tree: ReasoningTree;
  /** Δ7 — 풀이 정리 (학습 코치 톤, 4~6 문장) */
  solution_summary: SolutionSummary;
}

/**
 * Δ7 — R1 카드 "📝 풀이 정리" 섹션.
 *
 * LLMStruggleSection (정직성 차원) 과 분리된 학습 코치 차원.
 * 합산 4~6 문장. 학생이 이 문제를 다시 보면 어떻게 접근할지 시각.
 */
export interface SolutionSummary {
  /** 1문장 핵심 통찰 */
  core_insight: string;
  /** 2~3문장 단계 흐름 ("1단계에서 X, 2단계에서 Y로...") */
  step_flow_narrative: string;
  /** 1문장 가장 어려운 부분 통찰 */
  hardest_resolution: string;
  /** 1문장 비슷한 문제 적용 일반 원칙 */
  generalization: string;
}

export interface PerProblemStep {
  index: number;
  kind:
    | 'parse'
    | 'domain_id'
    | 'forward'
    | 'backward'
    | 'tool_call'
    | 'computation'
    | 'verify'
    | 'answer';
  summary: string;
  /** tool_call/forward/backward 시 trigger.why_text */
  why_text?: string;
  difficulty: number;
  is_pivotal: boolean;
  trigger_id?: string;
  tool_id?: string;
  /** Δ3 — LLM struggle 신호 */
  llm_struggle?: {
    turns_at_step: number;
    tool_retries: number;
    reasoning_chars: number;
    step_ms: number;
    resolution_text?: string;
  };
}

export interface TriggerCard {
  trigger_id: string;
  tool_name: string;
  direction: 'forward' | 'backward' | 'both';
  pattern_short: string;
  why_text: string;
  example_problem_ref?: { year: number; type: string; number: number };
}

// ────────────────────────────────────────────────────────────────────────────
// Δ4 — ToT 시각화 모델
// ────────────────────────────────────────────────────────────────────────────

export interface ReasoningTree {
  schema_version: '1.0';
  /** '답' 노드 id */
  root_id: string;
  nodes: ReasoningTreeNode[];
  edges: ReasoningTreeEdge[];
  /** 문제의 조건 1~N */
  conditions: { idx: number; text: string }[];
  depth_max: number;
  node_count: number;
  /** Δ4 — node_count ≥ LEGEND_TREE_COLLAPSE_NODE_THRESHOLD 시 UI 가 default collapsed 렌더 */
  collapse_hint?: boolean;
}

export interface ReasoningTreeNode {
  id: string;
  /** 'a', 'b', '답' */
  label: string;
  /** "곡선 위의 한 점 P의 좌표" */
  text: string;
  kind: 'goal' | 'subgoal' | 'condition' | 'derived_fact' | 'answer';
  depth: number;
  /** 문제의 조건 N (kind='condition' 시) */
  source_condition_idx?: number;
  /** PerProblemStep 와의 연결 */
  step_index?: number;
  trigger_id?: string;
  // 시각화 강조 신호
  is_pivotal: boolean;
  student_stuck_ms?: number;
  llm_struggle_ms?: number;
}

export interface ReasoningTreeEdge {
  /** 자식 (필요로 하는 쪽) */
  from: string;
  /** 부모 (필요한 대상) */
  to: string;
  kind: 'requires' | 'derived_from';
}
