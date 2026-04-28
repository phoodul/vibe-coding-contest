/**
 * Phase G-06 — Legend Router (Stage 0 → 1 → 2 통합 + DB insert).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §1.2 (Tier 매트릭스) + §3.3 (legend_routing_decisions) + §4.2.
 *
 * 흐름:
 *   1. problem_hash = sha256(problem_text)
 *   2. embedding 미제공 시 embedText 로 즉시 계산
 *   3. Stage 0 (matchSimilarProblem ≥ 0.85) hit → 사전 라벨 사용 + area + difficulty 기반 라우팅
 *   4. miss → Stage 1 (Manager Haiku classify). confidence ≥ 0.7 시 즉시 라우팅
 *   5. confidence < 0.7 → Stage 2 (Ramanujan probe + escalation-detector)
 *   6. legend_routing_decisions insert → RouteDecision 반환
 *
 * Tier/튜터 결정 매트릭스 (§1.2 다이어그램):
 *   - difficulty 1~2 → ramanujan_calc (Tier 0)
 *   - difficulty 3~4 → ramanujan_intuit (Tier 1)
 *   - difficulty ≥ 5 + area:
 *       calculus | common  → gauss (Tier 2, Gemini 3.1 Pro agentic)
 *       geometry           → von_neumann (Tier 2, GPT-5.5 agentic)
 *       probability        → euler (Tier 2, Opus 4.7 agentic, 종합·약점 보강)
 *       algebra            → leibniz (Tier 2, Sonnet 4.6 agentic, 가형)
 *
 * 인증: createClient (server) 가 RLS user_id = auth.uid() 자동 적용.
 *   input.user_id 는 인서트 행 user_id 컬럼에 사용 (RLS policy 가 일치 확인).
 */
import { createHash } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { embedText } from '@/lib/euler/embed';
import { matchSimilarProblem, type SimilarProblemRow } from './stage0-similar';
import { classifyDifficulty } from './stage1-manager';
import { runRamanujanProbe, type ProbeResult } from './stage2-probe';
import { detectEscalation } from './escalation-detector';
import type {
  RouteInput,
  RouteDecision,
  TutorName,
  Tier,
  ProblemArea,
  TriggerLabel,
  EscalationPrompt,
} from './types';

const STAGE0_THRESHOLD = parseFloat(process.env.LEGEND_STAGE0_THRESHOLD ?? '0.85');
const STAGE1_CONFIDENCE_THRESHOLD = parseFloat(
  process.env.LEGEND_STAGE1_CONFIDENCE_THRESHOLD ?? '0.7',
);

// ────────────────────────────────────────────────────────────────────────────
// Tier/튜터 결정
// ────────────────────────────────────────────────────────────────────────────

/**
 * difficulty + area → (tier, tutor).
 *
 * §1.2 다이어그램의 분기 매트릭스 그대로.
 */
function pickTutor(
  difficulty: number,
  area: ProblemArea,
): { tier: Tier; tutor: TutorName } {
  if (difficulty <= 2) return { tier: 0, tutor: 'ramanujan_calc' };
  if (difficulty <= 4) return { tier: 1, tutor: 'ramanujan_intuit' };
  // difficulty ≥ 5 — Tier 2 영역별 분기
  switch (area) {
    case 'geometry':
      return { tier: 2, tutor: 'von_neumann' };
    case 'probability':
      return { tier: 2, tutor: 'euler' };
    case 'algebra':
      return { tier: 2, tutor: 'leibniz' };
    case 'calculus':
    case 'common':
    default:
      return { tier: 2, tutor: 'gauss' };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// DB insert + 반환 헬퍼
// ────────────────────────────────────────────────────────────────────────────

interface RoutingInsertRow {
  user_id: string;
  problem_hash: string;
  stage_reached: 0 | 1 | 2;
  stage0_similar_id?: string | null;
  stage0_similarity?: number | null;
  stage1_difficulty?: number | null;
  stage1_confidence?: number | null;
  stage1_area?: string | null;
  stage2_probe_solved?: boolean | null;
  stage2_signals: string[];
  routed_tier: Tier;
  routed_tutor: TutorName;
  duration_ms: number;
}

async function insertRoutingDecision(
  row: RoutingInsertRow,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('legend_routing_decisions')
    .insert(row)
    .select('id')
    .single();
  if (error || !data) {
    console.warn('[legend-router] insert failed:', error?.message);
    // insert 실패해도 라우팅 결과는 반환 — 로그 누락만 발생
    return '';
  }
  return (data as { id: string }).id;
}

// ────────────────────────────────────────────────────────────────────────────
// Stage 0 / Stage 1 결과 → RouteDecision
// ────────────────────────────────────────────────────────────────────────────

interface RouteFromLabelArgs {
  user_id: string;
  problem_hash: string;
  similar: { row: SimilarProblemRow; triggers: TriggerLabel[] };
  duration_ms: number;
}

/**
 * Stage 0 hit 시 사전 라벨 + similar_problems.type → area·difficulty 추정.
 * type 매핑 (한국 수능 분류명 기반):
 *   '미적분'   → calculus
 *   '기하'     → geometry
 *   '확률과통계'/'확률통계' → probability
 *   '공통'/'수학Ⅰ'/'수학Ⅱ'  → common
 *   기타        → algebra
 * difficulty 는 number (수능 문항 번호) 기반 보수적 추정: ≥ 28 → 6, ≥ 22 → 5, ≥ 14 → 4, 그 외 → 3.
 *   (이는 매트릭스 기준일 뿐 — Stage 0 hit 시점부터 Tier 2 로 라우팅하기 위함)
 */
function inferAreaFromType(type: string): ProblemArea {
  if (!type) return 'common';
  const t = type.replace(/\s+/g, '');
  if (t.includes('미적분')) return 'calculus';
  if (t.includes('기하')) return 'geometry';
  if (t.includes('확률') || t.includes('통계')) return 'probability';
  if (t.includes('공통') || t.includes('수학')) return 'common';
  return 'algebra';
}

function inferDifficultyFromNumber(n: number): number {
  if (!Number.isFinite(n)) return 5;
  if (n >= 28) return 6;
  if (n >= 22) return 5;
  if (n >= 14) return 4;
  return 3;
}

async function routeFromLabel(args: RouteFromLabelArgs): Promise<RouteDecision> {
  const { user_id, problem_hash, similar, duration_ms } = args;
  const area = inferAreaFromType(similar.row.type);
  const difficulty = inferDifficultyFromNumber(similar.row.number);
  const { tier, tutor } = pickTutor(difficulty, area);

  const id = await insertRoutingDecision({
    user_id,
    problem_hash,
    stage_reached: 0,
    stage0_similar_id: similar.row.id,
    stage0_similarity: similar.row.similarity,
    stage2_signals: [],
    routed_tier: tier,
    routed_tutor: tutor,
    duration_ms,
  });

  return {
    stage_reached: 0,
    routed_tier: tier,
    routed_tutor: tutor,
    area,
    confidence: similar.row.similarity,
    precomputed_triggers: similar.triggers,
    routing_decision_id: id,
    duration_ms,
  };
}

interface RouteFromClassificationArgs {
  user_id: string;
  problem_hash: string;
  classification: { difficulty: number; confidence: number; area: ProblemArea };
  duration_ms: number;
}

async function routeFromClassification(
  args: RouteFromClassificationArgs,
): Promise<RouteDecision> {
  const { user_id, problem_hash, classification, duration_ms } = args;
  const { tier, tutor } = pickTutor(classification.difficulty, classification.area);

  const id = await insertRoutingDecision({
    user_id,
    problem_hash,
    stage_reached: 1,
    stage1_difficulty: classification.difficulty,
    stage1_confidence: classification.confidence,
    stage1_area: classification.area,
    stage2_signals: [],
    routed_tier: tier,
    routed_tutor: tutor,
    duration_ms,
  });

  return {
    stage_reached: 1,
    routed_tier: tier,
    routed_tutor: tutor,
    area: classification.area,
    confidence: classification.confidence,
    routing_decision_id: id,
    duration_ms,
  };
}

interface RouteFromProbeArgs {
  user_id: string;
  problem_hash: string;
  classification: { difficulty: number; confidence: number; area: ProblemArea };
  probe: ProbeResult;
  escalation: EscalationPrompt | null;
  duration_ms: number;
}

async function routeFromProbe(args: RouteFromProbeArgs): Promise<RouteDecision> {
  const { user_id, problem_hash, classification, probe, escalation, duration_ms } = args;

  // Stage 2 probe 결과로 라마누잔 직접 노출 (의도: 답 + escalation 권유 동봉).
  // 라우터가 자동 escalate 하지 않음 — 학생 응답은 별도 /api/legend/escalate.
  // tier/tutor: probe 가 baseline Opus 4.7 이므로 ramanujan_intuit 그대로.
  const tier: Tier = 1;
  const tutor: TutorName = 'ramanujan_intuit';

  const id = await insertRoutingDecision({
    user_id,
    problem_hash,
    stage_reached: 2,
    stage1_difficulty: classification.difficulty,
    stage1_confidence: classification.confidence,
    stage1_area: classification.area,
    stage2_probe_solved: probe.solved,
    stage2_signals: probe.escalation_signals,
    routed_tier: tier,
    routed_tutor: tutor,
    duration_ms,
  });

  return {
    stage_reached: 2,
    routed_tier: tier,
    routed_tutor: tutor,
    area: classification.area,
    confidence: classification.confidence,
    escalation_prompt: escalation ?? undefined,
    routing_decision_id: id,
    duration_ms,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 라우터
// ────────────────────────────────────────────────────────────────────────────

export async function routeProblem(input: RouteInput): Promise<RouteDecision> {
  const t0 = Date.now();
  const problem_hash = createHash('sha256')
    .update(input.problem_text)
    .digest('hex');

  // Stage 0: similar_problems
  const embedding =
    input.embedding && input.embedding.length > 0
      ? input.embedding
      : await embedText(input.problem_text);
  const stage0 = await matchSimilarProblem(embedding, STAGE0_THRESHOLD);
  if (stage0) {
    return routeFromLabel({
      user_id: input.user_id,
      problem_hash,
      similar: stage0,
      duration_ms: Date.now() - t0,
    });
  }

  // Stage 1: Manager Haiku
  const classification = await classifyDifficulty(input.problem_text);
  if (classification.confidence >= STAGE1_CONFIDENCE_THRESHOLD) {
    return routeFromClassification({
      user_id: input.user_id,
      problem_hash,
      classification,
      duration_ms: Date.now() - t0,
    });
  }

  // Stage 2: Ramanujan probe
  const probe = await runRamanujanProbe(input.problem_text);
  const escalation = detectEscalation(probe);
  return routeFromProbe({
    user_id: input.user_id,
    problem_hash,
    classification,
    probe,
    escalation,
    duration_ms: Date.now() - t0,
  });
}
