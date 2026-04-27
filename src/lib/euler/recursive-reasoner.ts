/**
 * Phase G-02: Recursive Backward Reasoner.
 *
 * 사용자 통찰 (5차 세션 정립):
 *   "Euler Tutor 의 진짜 매력 = 방법 찾기 코칭"
 *   "킬러 문제는 LLM 도 못 푼다 — multi-turn 분해 질문이 정답률 ↑"
 *   "chain 시각화는 난이도 5+ 만 (단순엔 억지)"
 *
 * 학술 근거:
 *   - Self-Ask (Press 2023, EMNLP): 분해 질문 multi-turn 으로 compositional
 *     reasoning 정답률 ↑ (+12.4% on Bamboogle)
 *   - Tree of Thoughts (Yao 2023, NeurIPS): 분기 탐색이 GPT-4 24-game 4%→74%
 *   - Chain of Verification (Dhuliawala 2023): 자가 검증으로 환각 ↓
 *
 * 기존 `runReasonerStep` (single-turn forward+backward BFS) 와 보완 관계:
 *   - BFS: 분기 가능한 모든 사실/subgoal 을 list 로 도출 (폭 우선)
 *   - Recursive: 단일 분해 경로를 깊이 N 까지 추적 (깊이 우선)
 * Manager 의 layer_6_difficulty (도구 비자명성) 가 5+ 면 Recursive 가 더 적합.
 *
 * 비용: depth × (Sonnet 1 call + Retriever 1 call) ≈ 5 × (1.5s + 0.3s) = 9s.
 *   maxDepth 기본 5 + 조기 종료 로 평균 7s 내외.
 */

import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText, type LanguageModelV1 } from "ai";
import {
  buildSubgoalDecomposePrompt,
  buildForwardDeducePrompt,
  type ChainNode,
  type ForwardDeduceJson,
} from "@/lib/ai/euler-reasoner-prompt";
import { retrieveTools } from "./retriever";
import { tryParseJson } from "./json";

export interface RecursiveChainResult {
  /** depth 0 → N 의 chain 노드. 마지막 노드는 reached_conditions=true 이거나 maxDepth 도달. */
  chain: ChainNode[];
  /** 종료 사유. Phase G-04 에서 forward_only_progress 추가. */
  termination:
    | "reached_conditions"
    | "max_depth"
    | "dead_end"
    | "cycle"
    | "forward_only_progress";
  /** 사용된 도구 이름 (Tier 1 보고용 — 중복 제거) */
  used_tools: string[];
  /** 총 호출 시간 (ms) */
  duration_ms: number;
}

interface DecomposeJson {
  tool?: string | null;
  rationale?: string;
  next_subgoal?: string | null;
  reached_conditions?: boolean;
}

interface RunArgs {
  problem: string;
  conditions: string[];
  goal: string;
  /** 최대 분해 깊이. 기본 5. 안전상 8 로 cap. */
  maxDepth?: number;
  /** GPT-5.1 (가우스) 사용 시 true */
  useGpt?: boolean;
  /** Retriever topK. 기본 5. */
  retrieveTopK?: number;
}

function pickModel(useGpt: boolean): LanguageModelV1 {
  return (useGpt
    ? openai("gpt-5.1")
    : anthropic("claude-sonnet-4-5-20250929")) as LanguageModelV1;
}

/**
 * 새 subgoal 이 이전 chain 의 goal 과 매우 유사한지 판단 (cycle 회피).
 * 단순 trigram Jaccard. 0.7 이상이면 cycle 로 간주.
 */
function isCycle(newGoal: string, chain: ChainNode[]): boolean {
  if (!newGoal) return false;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const target = norm(newGoal);
  for (const n of chain) {
    if (norm(n.goal) === target) return true;
    // 짧은 chain 에서는 strict equality 만으로 충분
  }
  return false;
}

export async function recursiveBackwardChain({
  problem,
  conditions,
  goal,
  maxDepth = 5,
  useGpt = false,
  retrieveTopK = 5,
}: RunArgs): Promise<RecursiveChainResult> {
  const t0 = Date.now();
  const cap = Math.max(1, Math.min(maxDepth, 8));
  const chain: ChainNode[] = [];
  const usedTools = new Set<string>();
  let currentGoal = goal;
  let termination: RecursiveChainResult["termination"] = "max_depth";

  for (let depth = 0; depth < cap; depth++) {
    // 1) Backward Retriever — 현재 subgoal 에 적합한 도구 후보
    const tools = await retrieveTools({
      conditions,
      goal: currentGoal,
      direction: "backward",
      topK: retrieveTopK,
    }).catch((e) => {
      console.warn(`[recursive-reasoner] retrieve failed @depth=${depth}:`, e);
      return [];
    });

    const candidateTools = tools.map((t) => ({
      tool_name: t.tool_name,
      why_text: t.why_text,
      tool_layer: t.tool_layer,
    }));

    // 2) Sonnet 분해 — 단일 분해 경로 선택
    const { system, user } = buildSubgoalDecomposePrompt({
      problem,
      conditions,
      currentGoal,
      candidateTools,
      previousChain: chain,
    });

    let decomposed: DecomposeJson | null = null;
    try {
      const { text } = await generateText({
        model: pickModel(useGpt),
        system,
        prompt: user,
        temperature: 0.2,
        maxTokens: 600,
      });
      decomposed = tryParseJson<DecomposeJson>(text);
    } catch (e) {
      console.warn(`[recursive-reasoner] sonnet failed @depth=${depth}:`, e);
    }

    if (!decomposed) {
      termination = "dead_end";
      break;
    }

    const node: ChainNode = {
      depth,
      goal: currentGoal,
      tool: decomposed.tool ?? null,
      rationale: decomposed.rationale ?? "",
      next_subgoal: decomposed.next_subgoal ?? null,
      reached_conditions: !!decomposed.reached_conditions,
    };
    chain.push(node);
    if (node.tool) usedTools.add(node.tool);

    if (node.reached_conditions) {
      termination = "reached_conditions";
      break;
    }
    if (!node.next_subgoal) {
      termination = "dead_end";
      break;
    }
    if (isCycle(node.next_subgoal, chain)) {
      termination = "cycle";
      break;
    }
    currentGoal = node.next_subgoal;
  }

  return {
    chain,
    termination,
    used_tools: Array.from(usedTools),
    duration_ms: Date.now() - t0,
  };
}

/**
 * Phase G-04: Alternating Chain (역행 ↔ 순행 교차 루프).
 *
 * math_process.md ③ 에서 정립된 사용자 사고 절차:
 *   "역행 1단계 → '주어진 조건으로 도달 가능?' 체크 → 안 되면 순행 1단계
 *    (조건 조합으로 새 사실 도출) → 다시 역행 2단계 → 반복"
 *
 * 동작:
 *   - depth 짝수: backward step (subgoal 분해, 기존 recursiveBackwardChain 과 동일)
 *   - depth 홀수: forward step (조건 조합 → 새 사실 도출, conditions 에 누적)
 *   - 종료: reached_conditions / reached_goal_directly / max_depth /
 *           양 방향 모두 dead_end (dead_end 또는 forward_only_progress)
 *
 * G-03 측정 결과 (chain ON 정답률 0pp 향상) 의 가설적 원인 — "역행만 했음" — 을
 * 본 함수가 해결하려는 것이 핵심 가설.
 */
export async function alternatingChain({
  problem,
  conditions: initialConditions,
  goal,
  maxDepth = 5,
  useGpt = false,
  retrieveTopK = 5,
}: RunArgs): Promise<RecursiveChainResult> {
  const t0 = Date.now();
  const cap = Math.max(2, Math.min(maxDepth * 2, 10)); // backward N + forward N
  const chain: ChainNode[] = [];
  const usedTools = new Set<string>();
  let currentGoal = goal;
  const knownFacts: string[] = []; // forward 단계에서 누적
  let termination: RecursiveChainResult["termination"] = "max_depth";

  // 누적 조건 = 초기 조건 + forward 도출 사실
  const accConditions = (): string[] => [...initialConditions, ...knownFacts];

  for (let depth = 0; depth < cap; depth++) {
    const isBackward = depth % 2 === 0;

    if (isBackward) {
      // ═══ Backward step ═══
      const tools = await retrieveTools({
        conditions: accConditions(),
        goal: currentGoal,
        direction: "backward",
        topK: retrieveTopK,
      }).catch((e) => {
        console.warn(`[alternating-chain] backward retrieve failed @d=${depth}:`, e);
        return [];
      });

      const candidateTools = tools.map((t) => ({
        tool_name: t.tool_name,
        why_text: t.why_text,
        tool_layer: t.tool_layer,
      }));

      const { system, user } = buildSubgoalDecomposePrompt({
        problem,
        conditions: accConditions(),
        currentGoal,
        candidateTools,
        previousChain: chain,
      });

      let decomposed: DecomposeJson | null = null;
      try {
        const { text } = await generateText({
          model: pickModel(useGpt),
          system,
          prompt: user,
          temperature: 0.2,
          maxTokens: 600,
        });
        decomposed = tryParseJson<DecomposeJson>(text);
      } catch (e) {
        console.warn(`[alternating-chain] backward sonnet failed @d=${depth}:`, e);
      }

      if (!decomposed) {
        // backward 실패 — forward 한번 더 시도하고 그것도 실패면 종료
        chain.push({
          depth, kind: "backward", goal: currentGoal,
          tool: null, rationale: "backward 분해 실패",
          next_subgoal: null, reached_conditions: false,
        });
        if (depth + 1 >= cap) { termination = "dead_end"; break; }
        continue; // 다음 iteration → forward
      }

      const node: ChainNode = {
        depth,
        kind: "backward",
        goal: currentGoal,
        tool: decomposed.tool ?? null,
        rationale: decomposed.rationale ?? "",
        next_subgoal: decomposed.next_subgoal ?? null,
        reached_conditions: !!decomposed.reached_conditions,
      };
      chain.push(node);
      if (node.tool) usedTools.add(node.tool);

      if (node.reached_conditions) { termination = "reached_conditions"; break; }
      if (!node.next_subgoal) {
        // backward dead end — forward 시도 (다음 iteration)
        if (depth + 1 >= cap) { termination = "dead_end"; break; }
        continue;
      }
      if (isCycle(node.next_subgoal, chain)) {
        // cycle — forward 로 돌파 시도
        if (depth + 1 >= cap) { termination = "cycle"; break; }
        continue;
      }
      currentGoal = node.next_subgoal;
    } else {
      // ═══ Forward step ═══
      const tools = await retrieveTools({
        conditions: accConditions(),
        goal: currentGoal,
        direction: "forward",
        topK: retrieveTopK,
      }).catch((e) => {
        console.warn(`[alternating-chain] forward retrieve failed @d=${depth}:`, e);
        return [];
      });

      const candidateTools = tools.map((t) => ({
        tool_name: t.tool_name,
        why_text: t.why_text,
        tool_layer: t.tool_layer,
      }));

      const { system, user } = buildForwardDeducePrompt({
        problem,
        conditions: accConditions(),
        finalGoal: goal,
        candidateTools,
        previousChain: chain,
      });

      let deduced: ForwardDeduceJson | null = null;
      try {
        const { text } = await generateText({
          model: pickModel(useGpt),
          system,
          prompt: user,
          temperature: 0.2,
          maxTokens: 600,
        });
        deduced = tryParseJson<ForwardDeduceJson>(text);
      } catch (e) {
        console.warn(`[alternating-chain] forward sonnet failed @d=${depth}:`, e);
      }

      const newFacts = (deduced?.new_facts ?? []).filter(
        (f) => f && f.fact && !knownFacts.includes(f.fact)
      );

      const node: ChainNode = {
        depth,
        kind: "forward",
        goal: currentGoal,
        tool: newFacts.find((f) => f.tool)?.tool ?? null,
        rationale: newFacts.map((f) => `${f.fact} (${f.why})`).join(" / "),
        next_subgoal: null,
        reached_conditions: false,
        derived_facts: newFacts.map((f) => f.fact),
      };
      chain.push(node);
      for (const f of newFacts) if (f.tool) usedTools.add(f.tool);

      if (deduced?.reached_goal_directly && newFacts.length > 0) {
        termination = "reached_conditions";
        break;
      }
      if (newFacts.length === 0) {
        // forward 도 dead end — 마지막 backward 가 진전했으면 forward_only_progress, 아니면 dead_end
        const hadBackwardProgress = chain.some(
          (n) => n.kind === "backward" && n.next_subgoal !== null
        );
        termination = hadBackwardProgress ? "forward_only_progress" : "dead_end";
        break;
      }
      // 다음 backward step 을 위해 새 사실들을 conditions 에 추가
      for (const f of newFacts) knownFacts.push(f.fact);
    }
  }

  return {
    chain,
    termination,
    used_tools: Array.from(usedTools),
    duration_ms: Date.now() - t0,
  };
}

/**
 * chain 을 학생 친화적 텍스트로 직렬화 — systemPrompt 에 inject.
 * "선생님은 이렇게 생각했어요" 형식.
 */
export function chainToCoachingText(result: RecursiveChainResult): string {
  if (!result.chain.length) return "";
  const lines = result.chain.map((n) => {
    const head = n.depth === 0
      ? `최종 목표: ${n.goal}`
      : `↳ 그래서 다음을 풀어야 해요: ${n.goal}`;
    const tool = n.tool ? `\n   사용 도구: ${n.tool}` : "";
    const why = n.rationale ? `\n   이유: ${n.rationale}` : "";
    return `${head}${tool}${why}`;
  });
  const tail =
    result.termination === "reached_conditions"
      ? "\n\n→ 마지막 subgoal 이 주어진 조건과 직접 매칭되어 chain 이 닫힙니다."
      : result.termination === "cycle"
        ? "\n\n→ chain 이 이전 단계로 돌아오려 했어요. 다른 접근이 필요할 수 있습니다."
        : result.termination === "dead_end"
          ? "\n\n→ 더 분해할 수 없어요. 새로운 보조 도구·관점이 필요해 보입니다."
          : result.termination === "forward_only_progress"
            ? "\n\n→ 순행으로 사실은 누적했지만 역행 분해가 막혔어요."
            : `\n\n→ 깊이 ${result.chain.length} 에서 멈췄어요 (maxDepth 도달).`;
  return lines.join("\n") + tail;
}
