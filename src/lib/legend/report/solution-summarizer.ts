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

const SOLUTION_SUMMARY_SYSTEM = `당신은 친근한 학습 코치입니다. 학생이 방금 푼 문제를 다시 보면 어떻게 접근할지 시각으로 5~7 문장으로 정리해주세요.

## 톤·원칙
- 한국어 존댓말, 친근하고 명료. 결론·답이 아닌 "사고 흐름" 위주.
- 학생 입장에서 "다음에 비슷한 문제 만나면 이렇게" 관점.
- 계산·숫자 나열 X. 통찰·전략·발동 조건 위주.

## 출력 (반드시 JSON 만, 다른 텍스트 금지)
{
  "core_insight": "1문장 — 이 문제의 핵심 통찰 (왜 이 도구·전략이 필요했는지)",
  "step_flow_narrative": "2~3문장 — 단계 흐름 ('1단계에서 X를 알고, 2단계에서 Y로 변환...' 형식)",
  "hardest_resolution": "1문장 — 가장 어려운 부분의 해결 통찰",
  "generalization": "1문장 — 비슷한 문제 적용 일반 원칙",
  "trigger_motivation": "1문장 — 그 생각을 떠올려야 하는 이유. 어떤 조건·패턴이 이 도구·접근법을 떠올리게 했는가? 비슷한 문제 만났을 때 어떤 신호로 같은 도구를 떠올릴지. trigger 발동의 핵심 동기를 학생 친화적 문장으로."
}`;

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
    const result = await callModel({
      model_id: process.env.ANTHROPIC_HAIKU_MODEL_ID ?? 'claude-haiku-4-5-20251201',
      provider: 'anthropic',
      mode: 'baseline',
      problem: buildUserPayload(args),
      system_prompt: SOLUTION_SUMMARY_SYSTEM,
      max_tokens: 500,
    });
    return parseSummaryJson(result.text ?? '');
  } catch (e) {
    console.warn('[solution-summarizer] failed:', (e as Error).message);
    return FALLBACK_SUMMARY;
  }
}

// 내부 함수 export — 단위 테스트용
export const __test = { parseSummaryJson, buildUserPayload, FALLBACK_SUMMARY };
