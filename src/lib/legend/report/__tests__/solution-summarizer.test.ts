/**
 * Phase G-06 G06-28 — solution-summarizer 단위 테스트 (Δ7).
 *
 * 시나리오:
 *   1. 정상 JSON 응답 → 4 필드 정상 파싱
 *   2. 코드펜스 감싼 JSON → 정상 파싱
 *   3. 잡설 + JSON 혼합 → 추출 성공
 *   4. 잘못된 JSON → fallback
 *   5. 일부 필드 누락 → 누락 필드만 fallback 채움
 *   6. 빈 problem_text → 즉시 fallback (callModel 호출 없음)
 *   7. 빈 steps → 즉시 fallback (callModel 호출 없음)
 *   8. callModel throw → fallback
 *   9. 다중 step pivotal 포함 user payload 정상 빌드
 *   10. hardest_resolution_text 주입 시 payload 에 포함
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/legend/call-model', () => ({
  callModel: vi.fn(),
}));

import { callModel } from '@/lib/legend/call-model';
import { summarizeSolution, __test } from '../solution-summarizer';
import type { PerProblemStep } from '@/lib/legend/types';

const baseSteps: PerProblemStep[] = [
  { index: 0, kind: 'parse', summary: '문제 분해', difficulty: 2, is_pivotal: false },
  {
    index: 1,
    kind: 'tool_call',
    summary: 'sympy_diff 호출',
    difficulty: 5,
    is_pivotal: true,
    trigger_id: 'trig-1',
    tool_id: 'TOOL_DIFF',
  },
  { index: 2, kind: 'answer', summary: '최종 답: 12', difficulty: 3, is_pivotal: false },
];

beforeEach(() => {
  vi.mocked(callModel).mockReset();
});

// ────────────────────────────────────────────────────────────────────────────
// parseSummaryJson (내부)
// ────────────────────────────────────────────────────────────────────────────

describe('parseSummaryJson', () => {
  const { parseSummaryJson, FALLBACK_SUMMARY } = __test;

  it('정상 JSON → 4 필드 trim 파싱', () => {
    const raw = `{
  "core_insight": "  핵심은 미분 후 0 근  ",
  "step_flow_narrative": "1단계에서 식 분해, 2단계에서 미분.",
  "hardest_resolution": "도함수 0 근 찾기",
  "generalization": "극값 = 미분 0"
}`;
    const result = parseSummaryJson(raw);
    expect(result.core_insight).toBe('핵심은 미분 후 0 근');
    expect(result.step_flow_narrative).toBe('1단계에서 식 분해, 2단계에서 미분.');
    expect(result.hardest_resolution).toBe('도함수 0 근 찾기');
    expect(result.generalization).toBe('극값 = 미분 0');
  });

  it('코드펜스 ```json ~ ``` 제거 후 파싱', () => {
    const raw = '```json\n{"core_insight":"a","step_flow_narrative":"b","hardest_resolution":"c","generalization":"d"}\n```';
    const result = parseSummaryJson(raw);
    expect(result.core_insight).toBe('a');
    expect(result.generalization).toBe('d');
  });

  it('잡설 + JSON 혼합 → 첫 { ~ 마지막 } 추출', () => {
    const raw = '네, 정리하겠습니다:\n{"core_insight":"insight","step_flow_narrative":"flow","hardest_resolution":"hard","generalization":"gen"}\n끝.';
    const result = parseSummaryJson(raw);
    expect(result.core_insight).toBe('insight');
  });

  it('빈 문자열 → fallback', () => {
    expect(parseSummaryJson('')).toEqual(FALLBACK_SUMMARY);
  });

  it('JSON 문법 오류 → fallback', () => {
    const raw = '{core_insight: "no quotes"}';
    expect(parseSummaryJson(raw)).toEqual(FALLBACK_SUMMARY);
  });

  it('일부 필드 누락 → 누락만 fallback', () => {
    const raw = '{"core_insight":"only this","step_flow_narrative":"","hardest_resolution":"hard","generalization":"gen"}';
    const result = parseSummaryJson(raw);
    expect(result.core_insight).toBe('only this');
    expect(result.step_flow_narrative).toBe(FALLBACK_SUMMARY.step_flow_narrative);
    expect(result.hardest_resolution).toBe('hard');
    expect(result.generalization).toBe('gen');
  });

  it('JSON 없음 (괄호 없음) → fallback', () => {
    expect(parseSummaryJson('plain text only')).toEqual(FALLBACK_SUMMARY);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildUserPayload (내부)
// ────────────────────────────────────────────────────────────────────────────

describe('buildUserPayload', () => {
  const { buildUserPayload } = __test;

  it('pivotal step 에 ★ 마커', () => {
    const payload = buildUserPayload({
      problem_text: 'f(x)=x^2 의 최솟값',
      steps: baseSteps,
      pivotal_step_index: 1,
    });
    expect(payload).toContain('★pivotal');
    expect(payload).toContain('2단계 [tool_call]');
  });

  it('hardest_resolution_text 주입 시 payload 포함', () => {
    const payload = buildUserPayload({
      problem_text: 'p',
      steps: baseSteps,
      pivotal_step_index: 1,
      hardest_resolution_text: 'sympy_diff 로 미분 후 0 근',
    });
    expect(payload).toContain('AI 가 어려워한 부분');
    expect(payload).toContain('sympy_diff 로 미분 후 0 근');
  });

  it('hardest_resolution_text 없으면 참고 섹션 미포함', () => {
    const payload = buildUserPayload({
      problem_text: 'p',
      steps: baseSteps,
      pivotal_step_index: 1,
    });
    expect(payload).not.toContain('AI 가 어려워한 부분');
  });

  it('problem_text 2000자 초과 → 잘림', () => {
    const longProblem = 'a'.repeat(3000);
    const payload = buildUserPayload({
      problem_text: longProblem,
      steps: baseSteps,
      pivotal_step_index: 0,
    });
    // 잘린 problem 길이는 2000자 초과 안 함
    const aRunMatch = payload.match(/a+/);
    expect(aRunMatch).toBeTruthy();
    expect((aRunMatch?.[0].length ?? 0) <= 2000).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// summarizeSolution — 통합
// ────────────────────────────────────────────────────────────────────────────

describe('summarizeSolution', () => {
  it('정상 응답 → 4 필드 SolutionSummary 반환', async () => {
    vi.mocked(callModel).mockResolvedValue({
      text: JSON.stringify({
        core_insight: '미분 후 0 근',
        step_flow_narrative: '1단계 분해, 2단계 미분, 3단계 답.',
        hardest_resolution: '도함수 0 근',
        generalization: '극값 = 미분 0',
      }),
      trace: {},
      tool_calls: [],
      duration_ms: 100,
      model_id: 'haiku',
    });

    const result = await summarizeSolution({
      problem_text: 'f(x)=x^2 최솟값',
      steps: baseSteps,
      pivotal_step_index: 1,
    });

    expect(result.core_insight).toBe('미분 후 0 근');
    expect(result.step_flow_narrative).toContain('1단계');
    expect(result.hardest_resolution).toBe('도함수 0 근');
    expect(result.generalization).toBe('극값 = 미분 0');
    expect(callModel).toHaveBeenCalledTimes(1);
  });

  it('JSON 파싱 실패 → fallback 반환 (4 필드 모두 안전)', async () => {
    vi.mocked(callModel).mockResolvedValue({
      text: 'garbage non-json response',
      trace: {},
      tool_calls: [],
      duration_ms: 100,
      model_id: 'haiku',
    });

    const result = await summarizeSolution({
      problem_text: 'p',
      steps: baseSteps,
      pivotal_step_index: 0,
    });

    expect(result.core_insight).toContain('정리하지 못했습니다');
    expect(result.step_flow_narrative).toContain('정리하지 못했습니다');
    expect(result.hardest_resolution).toContain('정리하지 못했습니다');
    expect(result.generalization).toContain('정리하지 못했습니다');
  });

  it('빈 problem_text → callModel 호출 없이 fallback', async () => {
    const result = await summarizeSolution({
      problem_text: '',
      steps: baseSteps,
      pivotal_step_index: 0,
    });

    expect(result.core_insight).toContain('정리하지 못했습니다');
    expect(callModel).not.toHaveBeenCalled();
  });

  it('빈 steps → callModel 호출 없이 fallback', async () => {
    const result = await summarizeSolution({
      problem_text: '문제',
      steps: [],
      pivotal_step_index: 0,
    });

    expect(result.core_insight).toContain('정리하지 못했습니다');
    expect(callModel).not.toHaveBeenCalled();
  });

  it('callModel throw → fallback (예외 격리)', async () => {
    vi.mocked(callModel).mockRejectedValue(new Error('haiku 429'));

    const result = await summarizeSolution({
      problem_text: 'p',
      steps: baseSteps,
      pivotal_step_index: 0,
    });

    expect(result.core_insight).toContain('정리하지 못했습니다');
  });

  it('단일 step → 정상 처리', async () => {
    vi.mocked(callModel).mockResolvedValue({
      text: '{"core_insight":"x","step_flow_narrative":"y","hardest_resolution":"z","generalization":"w"}',
      trace: {},
      tool_calls: [],
      duration_ms: 100,
      model_id: 'haiku',
    });

    const result = await summarizeSolution({
      problem_text: '간단한 문제',
      steps: [
        { index: 0, kind: 'answer', summary: '답: 1', difficulty: 1, is_pivotal: true },
      ],
      pivotal_step_index: 0,
    });

    expect(result.core_insight).toBe('x');
    expect(callModel).toHaveBeenCalledTimes(1);
  });

  it('callModel 호출 인자: provider=anthropic + max_tokens=2500 (Δ16 Sonnet 격상)', async () => {
    vi.mocked(callModel).mockResolvedValue({
      text: '{}',
      trace: {},
      tool_calls: [],
      duration_ms: 100,
      model_id: 'sonnet',
    });

    await summarizeSolution({
      problem_text: 'p',
      steps: baseSteps,
      pivotal_step_index: 1,
    });

    const args = vi.mocked(callModel).mock.calls[0][0];
    expect(args.provider).toBe('anthropic');
    expect(args.mode).toBe('baseline');
    expect(args.max_tokens).toBe(2500);
    expect(args.system_prompt).toBeTruthy();
  });
});
