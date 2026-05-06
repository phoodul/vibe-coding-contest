/**
 * Phase G-06 — Legend Tutor 공통 타입.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.1 (라우팅 타입) + §5.1 (R1 PerProblemReport).
 * Δ1 (5종 quota), Δ3 (LLM struggle), Δ4 (ToT reasoning tree) 반영.
 *
 * 영향 격리: 본 파일은 src/lib/legend/ 모듈 전용. 기존 src/lib/euler/* 와 import 만 가능.
 */

// ────────────────────────────────────────────────────────────────────────────
// Subject — 19차 (2026-05-06) maestro 4과목 일반화 도입
// ────────────────────────────────────────────────────────────────────────────

/**
 * Maestro subject — 4 maestro (물리·화학·생물·지구과학) + 미래 확장 (국어·영어).
 * Legend Tutor = `subject='math'` 인스턴스. 19차 이전 모든 코드는 'math' 가정.
 */
export type Subject =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'earth-science'
  | 'korean'    // Phase 5+ (세종·정약용·이이)
  | 'english';  // Phase 5+ (셰익스피어·처칠·촘스키)

/** Phase 1~Phase D 에서 활성화된 subject */
export const ACTIVE_SUBJECTS: readonly Subject[] = [
  'math',
  'physics',
  'chemistry',
  'biology',
  'earth-science',
] as const;

/** subject → 한글 라벨 (학생 화면) */
export const SUBJECT_LABEL_KO: Record<Subject, string> = {
  math: '수학',
  physics: '물리',
  chemistry: '화학',
  biology: '생명과학',
  'earth-science': '지구과학',
  korean: '국어',
  english: '영어',
};

/** subject → URL slug ( `/legend` · `/physics` 등 ) */
export const SUBJECT_URL_SLUG: Record<Subject, string> = {
  math: 'legend',          // 기존 URL 보존 (/legend)
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  'earth-science': 'earth-science',
  korean: 'korean',
  english: 'english',
};

// ────────────────────────────────────────────────────────────────────────────
// 튜터 · tier · 영역
// ────────────────────────────────────────────────────────────────────────────

/** Legend (수학) 5 거장 — 19차 이전부터 사용된 핵심 페르소나. TUTOR_CONFIG·FALLBACK·PORTRAITS 의 Record key. */
export type MathTutorName =
  | 'ramanujan_calc'   // Tier 0: Haiku + SymPy
  | 'ramanujan_intuit' // Tier 1: Opus 4.7 baseline
  | 'gauss'            // Tier 2: Gemini 3.1 Pro agentic
  | 'von_neumann'      // Tier 2: GPT-5.5 agentic
  | 'euler'            // Tier 2: Opus 4.7 agentic
  | 'leibniz';         // Tier 2: Sonnet 4.6 agentic

/**
 * 19차 Phase B/C — 4 maestro 페르소나 (각 4 인물).
 *
 * 영역 매칭 X — 모든 인물이 모든 단원 답변 가능. 모델 차이만.
 * 4 인물 = 4 모델 1:1 매핑 (모든 maestro 동일 위치 순서):
 *   - 1번 (Sonnet 4.6, 기본 사용량 ↑)
 *   - 2번 (Gemini 3.1 Pro, 거장)
 *   - 3번 (Opus 4.7, 거장)
 *   - 4번 (GPT-5.5, 거장)
 */
export type EarthScienceTutorName = 'wegener' | 'galilei' | 'hubble' | 'sagan';
export type BiologyTutorName = 'darwin' | 'mendel' | 'watson' | 'pasteur';
export type PhysicsTutorName = 'newton' | 'einstein' | 'feynman' | 'fermi';
export type ChemistryTutorName = 'mendeleev' | 'lavoisier' | 'pauling' | 'curie';

/**
 * Legend (수학) 페르소나 alias.
 *
 * 기존 코드 다수가 `TutorName` 을 import 하고 있어 호환성 위해 alias 유지.
 * Maestro 4 과목 페르소나는 EarthScienceTutorName / BiologyTutorName / ... 별도 type
 * + 별도 Record (예: EARTH_SCIENCE_PORTRAITS) 로 분리.
 */
export type TutorName = MathTutorName;

/**
 * 모든 maestro 페르소나의 union — PERSONAS_BY_SUBJECT 매핑·UI(TutorPickerModal) 용.
 * 추가 maestro (Biology / Physics / Chemistry / Korean / English) 진입 시 union 확장.
 */
export type MaestroTutorName =
  | MathTutorName
  | EarthScienceTutorName
  | BiologyTutorName
  | PhysicsTutorName
  | ChemistryTutorName;

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
  /** Legend (수학) 페르소나 한정. 다른 maestro 는 별도 호출자에서 처리. */
  tutor: MathTutorName;
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
  actual_tutor?: MathTutorName;
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

/**
 * Δ14 — 학생 막힘 분석 (R1 카드 student_struggle 섹션).
 *
 * 베타 단계에서 `legend_step_stuck_snapshots` 테이블이 비어 있어 `stuck_signals` 가 0 으로
 * 나오는 문제 보강. 학생-AI 대화 이력을 Haiku 가 분석하여 "학생이 어디서 막혔고,
 * AI 가 어떤 hint 로 도왔는가" 를 1 카드로 추출.
 *
 * 가용성: build-summary 호출 시 `conversation` 가 함께 전달된 경우에만 채워진다.
 *         legacy 캐시 row 호환을 위해 optional.
 */
export interface StudentStruggleSummary {
  /** 학생이 막힌 step (steps[].index 와 매칭, 없으면 -1) */
  stuck_step_index: number;
  /** 한 문장 요약 — "지수 변환 단계에서 어떤 변환을 적용할지 망설임" */
  stuck_summary: string;
  /** 그 step 에서 떠올렸어야 하는 trigger·접근법 (학생 친화 톤, 1~2문장) */
  trigger_quote: string;
  /** AI 가 학생을 도왔던 핵심 hint 인용 (한 줄, 따옴표 포함 가능) */
  ai_hint_quote: string;
  /** 학생이 어떻게 극복했는지 — 못 했으면 "끝까지 망설임" 등 (1문장) */
  resolution: string;
}

export interface PerProblemReport {
  schema_version: '1.3' | '1.4';
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
  /**
   * Δ14 — 학생 막힘 분석. build-summary 에 conversation 이 함께 전달된 경우에만 채워진다.
   * stuck_signals 가 비어있는 베타 단계에서 학생 코칭 차원을 채우는 핵심 섹션.
   */
  student_struggle?: StudentStruggleSummary;
}

/**
 * Δ7 — R1 카드 "📝 풀이 정리" 섹션.
 *
 * LLMStruggleSection (정직성 차원) 과 분리된 학습 코치 차원.
 * 합산 4~6 문장. 학생이 이 문제를 다시 보면 어떻게 접근할지 시각.
 *
 * G06-33 (schema 1.3): trigger_motivation 신규 — "그 생각을 떠올린 이유"
 * 차원. trigger 발동의 핵심 동기 (어떤 조건·패턴이 이 도구·접근법을 떠올리게
 * 했는가) 를 학생 친화 문장으로.
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
  /**
   * G06-33 — 1문장 "그 생각을 떠올려야 하는 이유" (motivation).
   * 어떤 조건·패턴이 이 도구·접근법을 떠올리게 했는지.
   * trigger 발동의 핵심 동기 → 학생 친화 톤.
   *
   * schema 1.2 호환: 본 필드 없는 캐시 row 도 안전 (UI 가 falsy 체크 후 숨김).
   */
  trigger_motivation?: string;
  /**
   * Δ23 — LLM 자동 누적용 구조화 trigger.
   * trigger_motivation 자연어 문단과 별개로 (Cue A, Tool B, Why) 를 명시 분리하여
   * 풀이 종료 시 candidate_triggers / candidate_tools 큐에 자동 누적하는 입력으로 사용.
   * 학생 UI 에는 노출되지 않음 (back-end accumulation 전용).
   */
  structured_trigger?: {
    /** A — 문제 표면 단서 (40~80자, 정석 형식의 좌변) */
    cue_a: string;
    /** B — 호출되는 구체 도구 (40~80자, 정석 형식의 우변) */
    tool_b: string;
    /** 인과 풀이 (200자 내외) */
    why_text: string;
  };
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

// ────────────────────────────────────────────────────────────────────────────
// G06-34 (Δ11) — 베타 리뷰 시스템
// ────────────────────────────────────────────────────────────────────────────

export type RecommendedTutor =
  | 'ramanujan'
  | 'gauss'
  | 'von_neumann'
  | 'euler'
  | 'leibniz';

export interface BetaReview {
  id: string;
  pros: string | null;
  cons: string | null;
  purchase_intent: boolean | null;
  recommended_tutor: RecommendedTutor | null;
  star_rating: number;
  free_comment?: string | null;
  is_public: boolean;
  submitted_at: string;
}

export interface BetaReviewStats {
  total: number;
  avg_rating: number;
  purchase_intent_responded: number;
  purchase_intent_rate: number;
  tutor_distribution: Record<string, number>;
}
