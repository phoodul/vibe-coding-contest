/**
 * Reasoner 오케스트레이터 — Forward/Backward BFS.
 *
 * Phase C 단순 버전 (depth=1, 분기 1단계):
 *   - forward 1회 + backward 1회 **병렬** 호출 → facts/subgoals 도출
 *   - 결과를 BFSResult 로 반환 → orchestrator (route.ts) 가 systemPrompt 에 주입
 *
 * 추후 (Phase D+): depth>1, sub-task Promise.all 분기, 캐싱.
 *
 * 비용 통제: 호출 1회당 forward+backward = 2 LLM call (Sonnet 4.6 또는 GPT-5.1).
 */

import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText, type LanguageModelV1 } from "ai";
import {
  buildBackwardPrompt,
  buildForwardPrompt,
  type BackwardSubgoal,
  type ForwardFact,
  type ReasonerState,
} from "@/lib/ai/euler-reasoner-prompt";

export interface BFSResult {
  facts: ForwardFact[];
  subgoals: BackwardSubgoal[];
  forward_dead_end: boolean;
  backward_dead_end: boolean;
  /** 사용한 도구 이름 (Tier 1 보고용) */
  used_tools: string[];
  /** 총 LLM 호출 시간 (ms) */
  duration_ms: number;
}

interface ForwardJson {
  facts?: ForwardFact[];
  dead_end?: boolean;
}

interface BackwardJson {
  subgoals?: BackwardSubgoal[];
  dead_end?: boolean;
}

function tryParseJson<T>(text: string): T | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

function pickModel(useGpt: boolean): LanguageModelV1 {
  return (useGpt
    ? openai("gpt-5.1")
    : anthropic("claude-sonnet-4-5-20250929")) as LanguageModelV1;
}

async function runForward(state: ReasonerState, useGpt: boolean): Promise<ForwardJson | null> {
  const { system, user } = buildForwardPrompt(state);
  const { text } = await generateText({
    model: pickModel(useGpt),
    system,
    prompt: user,
    temperature: 0.2,
    maxTokens: 1200,
  });
  return tryParseJson<ForwardJson>(text);
}

async function runBackward(state: ReasonerState, useGpt: boolean): Promise<BackwardJson | null> {
  const { system, user } = buildBackwardPrompt(state);
  const { text } = await generateText({
    model: pickModel(useGpt),
    system,
    prompt: user,
    temperature: 0.2,
    maxTokens: 1000,
  });
  return tryParseJson<BackwardJson>(text);
}

export interface RunReasonerArgs {
  state: ReasonerState;
  useGpt?: boolean;
}

export async function runReasonerStep({ state, useGpt = false }: RunReasonerArgs): Promise<BFSResult> {
  const t0 = Date.now();
  const [fwdRes, bwdRes] = await Promise.allSettled([
    runForward(state, useGpt),
    runBackward(state, useGpt),
  ]);

  const fwd = fwdRes.status === "fulfilled" ? fwdRes.value : null;
  const bwd = bwdRes.status === "fulfilled" ? bwdRes.value : null;

  const facts = fwd?.facts ?? [];
  const subgoals = bwd?.subgoals ?? [];
  const forward_dead_end = !!fwd?.dead_end || facts.length === 0;
  const backward_dead_end = !!bwd?.dead_end || subgoals.length === 0;

  const tools = new Set<string>();
  for (const f of facts) if (f.tool) tools.add(f.tool);
  for (const s of subgoals) if (s.tool) tools.add(s.tool);

  return {
    facts,
    subgoals,
    forward_dead_end,
    backward_dead_end,
    used_tools: Array.from(tools),
    duration_ms: Date.now() - t0,
  };
}
