/**
 * Phase G-06 G06-12 — trace-normalizer 단위 테스트.
 *
 * 6 fixture × 3 provider 시나리오:
 *   - anthropic-baseline.json (single turn / text only)
 *   - anthropic-agentic.json  (5 turns / 2 tool_use)
 *   - openai-agentic.json     (5 turns / 2 tool_calls)
 *   - google-agentic.json     (5 turns / 2 functionCall)
 *   - chain-depth1.json       (single turn — anthropic baseline 형식)
 *   - chain-depth5.json       (5 turns + 5 tool_use 중 1개 retry)
 */
import { describe, it, expect } from 'vitest';
import {
  normalizeTrace,
  normalizeAnthropicTrace,
  normalizeOpenAITrace,
  normalizeGoogleTrace,
} from '../trace-normalizer';

import anthropicBaseline from '../fixtures/anthropic-baseline.json';
import anthropicAgentic from '../fixtures/anthropic-agentic.json';
import openaiAgentic from '../fixtures/openai-agentic.json';
import googleAgentic from '../fixtures/google-agentic.json';
import chainDepth1 from '../fixtures/chain-depth1.json';
import chainDepth5 from '../fixtures/chain-depth5.json';

describe('normalizeAnthropicTrace', () => {
  it('baseline (single turn) → 1 turn / text 추출 / 0 tool_calls', () => {
    const turns = normalizeAnthropicTrace(anthropicBaseline);
    expect(turns).toHaveLength(1);
    expect(turns[0].turn_index).toBe(0);
    expect(turns[0].text).toContain('극값');
    expect(turns[0].tool_calls).toHaveLength(0);
    expect(turns[0].reasoning_chars).toBeGreaterThan(0);
  });

  it('agentic 5 turns → 5 turn / step1·3 tool_use 인식', () => {
    const turns = normalizeAnthropicTrace(anthropicAgentic);
    expect(turns).toHaveLength(5);
    // Step1: tool_use=sympy_diff
    expect(turns[0].tool_calls.map((t) => t.tool_name)).toEqual(['sympy_diff']);
    expect(turns[0].tool_calls[0].is_retry).toBe(false);
    // Step3: tool_use=sympy_solve
    expect(turns[2].tool_calls.map((t) => t.tool_name)).toEqual(['sympy_solve']);
    // text 누적 — Step5 결론
    expect(turns[4].text).toContain('최종 답');
  });

  it('chain-depth1 (single short turn) → 1 turn', () => {
    const turns = normalizeAnthropicTrace(chainDepth1);
    expect(turns).toHaveLength(1);
    expect(turns[0].text).toContain('최종 답: 7');
  });

  it('chain-depth5 — Step3 의 동일 tool sympy_solve 두 번 호출 시 두 번째 is_retry=true', () => {
    const turns = normalizeAnthropicTrace(chainDepth5);
    expect(turns).toHaveLength(5);
    const step3 = turns[2];
    expect(step3.tool_calls).toHaveLength(2);
    expect(step3.tool_calls[0].tool_name).toBe('sympy_solve');
    expect(step3.tool_calls[0].is_retry).toBe(false);
    expect(step3.tool_calls[1].tool_name).toBe('sympy_solve');
    expect(step3.tool_calls[1].is_retry).toBe(true);
  });

  it('빈 trace 또는 null 입력 시 빈 배열', () => {
    expect(normalizeAnthropicTrace(null)).toEqual([]);
    expect(normalizeAnthropicTrace(undefined)).toEqual([]);
    expect(normalizeAnthropicTrace({})).toHaveLength(1); // raw 미존재 → 빈 turn 1개
    expect(normalizeAnthropicTrace({}).flatMap((t) => t.tool_calls)).toHaveLength(0);
  });
});

describe('normalizeOpenAITrace', () => {
  it('agentic 5 turns → 5 turn / step2·4 tool_calls', () => {
    const turns = normalizeOpenAITrace(openaiAgentic);
    expect(turns).toHaveLength(5);
    // Step2: tool_calls=sympy_solve
    expect(turns[1].tool_calls.map((t) => t.tool_name)).toEqual(['sympy_solve']);
    expect(turns[1].tool_calls[0].tool_input).toMatchObject({ eq: 'log(p)-1', var: 'p' });
    // Step4: tool_calls=sympy_simplify
    expect(turns[3].tool_calls.map((t) => t.tool_name)).toEqual(['sympy_simplify']);
    // 모든 turn 의 text 가 채워짐
    for (const t of turns) {
      expect(t.text.length).toBeGreaterThan(0);
    }
  });

  it('빈 tool_calls / null 응답 시 graceful', () => {
    const turns = normalizeOpenAITrace({
      mode: 'agentic_5step',
      turns: [{ step: 1, response: 'fallback', duration_ms: 100, raw: { choices: [] } }],
    });
    expect(turns).toHaveLength(1);
    // raw.choices 가 비어 있으면 fallback 텍스트 사용
    expect(turns[0].text).toBe('fallback');
    expect(turns[0].tool_calls).toHaveLength(0);
  });
});

describe('normalizeGoogleTrace', () => {
  it('agentic 5 turns → 5 turn / step1·4 functionCall', () => {
    const turns = normalizeGoogleTrace(googleAgentic);
    expect(turns).toHaveLength(5);
    // Step1: functionCall=geometry_inner_product
    expect(turns[0].tool_calls.map((t) => t.tool_name)).toEqual(['geometry_inner_product']);
    expect(turns[0].tool_calls[0].tool_input).toMatchObject({ a_norm: 2, b_norm: 3 });
    // Step4: functionCall=verify_parallel
    expect(turns[3].tool_calls.map((t) => t.tool_name)).toEqual(['verify_parallel']);
    // 마지막 turn 결론
    expect(turns[4].text).toContain('최종 답: 6');
  });
});

describe('normalizeTrace dispatcher', () => {
  it('provider="anthropic" 으로 직접 호출과 동일', () => {
    expect(normalizeTrace(anthropicAgentic, 'anthropic')).toEqual(
      normalizeAnthropicTrace(anthropicAgentic),
    );
  });
  it('provider="openai" 으로 직접 호출과 동일', () => {
    expect(normalizeTrace(openaiAgentic, 'openai')).toEqual(normalizeOpenAITrace(openaiAgentic));
  });
  it('provider="google" 으로 직접 호출과 동일', () => {
    expect(normalizeTrace(googleAgentic, 'google')).toEqual(normalizeGoogleTrace(googleAgentic));
  });
});
