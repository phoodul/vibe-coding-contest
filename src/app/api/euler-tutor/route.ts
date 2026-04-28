import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText, streamText, StreamData, type LanguageModelV1 } from "ai";
import { NextResponse } from "next/server";
import { EULER_SYSTEM_PROMPT } from "@/lib/ai/euler-prompt";
import { getSolution } from "@/lib/solution-cache";
import { runCritic } from "@/lib/euler/critic-client";
import {
  buildManagerPrompt,
  effectiveDifficulty,
  shouldRunRecursiveChain,
  type ManagerResult,
} from "@/lib/ai/euler-manager-prompt";
import { retrieveTools } from "@/lib/euler/retriever";
import {
  retrieveSimilarProblems,
  formatSimilarProblemsContext,
} from "@/lib/euler/similar-problems";
import { runReasonerStep } from "@/lib/euler/reasoner";
import { runReasonerWithTools } from "@/lib/euler/reasoner-with-tools";
import {
  recursiveBackwardChain,
  alternatingChain,
  chainToCoachingText,
} from "@/lib/euler/recursive-reasoner";
import { REASONER_THRESHOLD_BY_AREA, normalizeArea } from "@/lib/ai/euler-tools-schema";
import { crossCheck } from "@/lib/euler/cross-check";
import { buildWolframQuery } from "@/lib/euler/wolfram-query-builder";
import { reportTools } from "@/lib/euler/tool-reporter";
import { logSolve } from "@/lib/euler/solve-logger";
import { checkFreeQuota } from "@/lib/euler/usage-quota";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { EULER_EVENTS, trackServerEvent } from "@/lib/analytics/events";
import { tryParseJson } from "@/lib/euler/json";
import { routeProblem } from "@/lib/legend/legend-router";
import type { RouteDecision } from "@/lib/legend/types";

const CRITIC_ENABLED = process.env.EULER_CRITIC_ENABLED === "true";
const MANAGER_ENABLED = process.env.EULER_MANAGER_ENABLED !== "false"; // 기본 on
const REASONER_ENABLED = process.env.EULER_REASONER_ENABLED !== "false"; // 기본 on
const REASONER_MIN_DIFFICULTY = parseInt(process.env.EULER_REASONER_MIN_DIFFICULTY ?? "6", 10);
const HAIKU_MODEL_ID = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";
// Phase F-09: Wolfram cross-check — 비용 통제를 위해 기본 off + 난이도 5+ 만
const CROSSCHECK_ENABLED = process.env.EULER_CROSSCHECK_ENABLED === "true";
const CROSSCHECK_MIN_DIFFICULTY = parseInt(process.env.EULER_CROSSCHECK_MIN_DIFFICULTY ?? "5", 10);

/** 첫 user 메시지 텍스트 (문제 본문) */
function firstUserText(messages: { role: string; content: unknown }[]): string | null {
  const m = messages.find((x) => x.role === "user");
  if (!m) return null;
  if (typeof m.content === "string") return m.content;
  // Vision message (array of parts) 인 경우 text 부분만
  if (Array.isArray(m.content)) {
    const parts = m.content as { type?: string; text?: string }[];
    return parts.filter((p) => p.type === "text" && p.text).map((p) => p.text!).join("\n");
  }
  return null;
}

/** messages 배열에서 (문제, 직전 풀이) 추출. 검증할 데이터가 부족하면 null. */
function extractCriticInputs(
  messages: { role: string; content: string }[]
): { problem: string; solution: string } | null {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser || typeof firstUser.content !== "string") return null;
  // 마지막 assistant 메시지(이전 턴 AI 풀이)
  let lastAssistant: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "assistant" && typeof m.content === "string") {
      lastAssistant = m.content;
      break;
    }
  }
  if (!lastAssistant) return null;
  return { problem: firstUser.content, solution: lastAssistant };
}

export const maxDuration = 60;

/** 첫 메시지에서 기출문제 정보 파싱 (정답은 메시지에 포함하지 않음) */
function parseProblemInfo(messages: { role: string; content: string }[]) {
  const first = messages.find((m) => m.role === "user");
  if (!first || typeof first.content !== "string") return null;

  const match = first.content.match(
    /\[(\d{4})학년도\s*수능\s*(공통|미적분|확률과통계|기하|가형|나형)\s*(\d+)번/
  );
  if (!match) return null;

  return {
    year: parseInt(match[1]),
    type: match[2],
    number: parseInt(match[3]),
  };
}

export async function POST(req: Request) {
  try {
    const { messages, area, useGpt, input_mode } = await req.json();

    const tutorName = useGpt ? "가우스 튜터" : "오일러 튜터";
    const tutorPersona = useGpt ? "gauss" : "euler";
    const inputMode = input_mode ?? "text";

    // C-12: Free 일일 한도 — 첫 user turn 일 때만 체크 (후속 코칭 턴은 통과)
    const isFirstUserTurn = messages.filter((m: { role: string }) => m.role === "assistant").length === 0;
    if (isFirstUserTurn) {
      const quota = await checkFreeQuota();
      if (quota && !quota.allowed) {
        return NextResponse.json(
          {
            error: "free_daily_limit_reached",
            used: quota.used,
            limit: quota.limit,
            message: "오늘 무료 풀이 한도에 도달했어요. 내일 다시 만나거나 정기구독으로 무제한 이용해보세요.",
          },
          { status: 429 }
        );
      }
    }

    // 기출문제인 경우 풀이 DB에서 조회 (정답+풀이 모두 서버측에서만 처리)
    let solutionContext = "";
    const problemInfo = parseProblemInfo(messages);
    if (problemInfo) {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const problemKey = `${problemInfo.year}_${problemInfo.type}_${problemInfo.number}`;
        const res = await fetch(
          `${url}/rest/v1/problem_solutions?problem_key=eq.${encodeURIComponent(problemKey)}&select=correct_answer,solution_text`,
          { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
        );
        if (res.ok) {
          const rows = await res.json();
          if (rows.length > 0) {
            const { correct_answer, solution_text } = rows[0];
            solutionContext = `\n\n## 참고 풀이 (내부 자료 — 학생에게 정답이나 풀이를 직접 보여주지 마세요)
이 문제의 정답: ${correct_answer}
검증된 풀이 방향입니다. 학생을 이 방향으로 코칭하되, 풀이를 그대로 읽어주지 말고 단계적으로 사고를 유도하세요.

${solution_text}`;
          }
        }
      } catch {
        // 풀이 조회 실패 시 무시
      }
    }

    // Critic 사전 검증: 이전 턴 AI 풀이를 Haiku 4.5 로 검증 → verified 신호를 system 에 주입
    let criticContext = "";
    if (CRITIC_ENABLED) {
      const inputs = extractCriticInputs(messages);
      if (inputs) {
        const result = await runCritic({ ...inputs, mode: "verify" });
        if (result && result.mode === "verify") {
          criticContext = `\n\n## Critic 사전 검증 결과 (내부 신호)
verified=${result.verified}, confidence=${result.confidence.toFixed(2)}
${result.verified
  ? "이전 풀이는 Critic 검증을 통과했습니다. **재검산하자거나 의심하는 멘트를 추가하지 마세요.** 학생이 다음 단계로 자신감 있게 나아가도록 코칭하세요."
  : `이전 풀이에서 다음 오류가 감지되었습니다: ${result.errors.join(" / ")}. ${result.suggested_backtrack ? `다음 단계로 돌아가서 함께 검산하도록 유도하세요: ${result.suggested_backtrack}` : "학생과 함께 단계별로 확인하세요."}`}`;
        }
      }
    }

    const inputModeNote =
      inputMode === "handwrite"
        ? "\n\n학생은 **필기(손글씨)** 로 문제를 입력했습니다. OCR 결과가 일부 부정확할 수 있으니, 모호한 기호는 학생에게 다시 확인해주세요."
        : inputMode === "photo"
          ? "\n\n학생은 **사진** 으로 문제를 올렸습니다. 인쇄·스크린샷일 가능성이 높습니다."
          : "";

    // 분석 트래킹용 supabase 클라이언트 (옵셔널) + Family lock_reveal 조회
    let supabaseForTracking: Awaited<ReturnType<typeof createSupabaseServer>> | null = null;
    let userIdForTracking: string | null = null;
    let lockReveal = false;
    try {
      supabaseForTracking = await createSupabaseServer();
      const { data } = await supabaseForTracking.auth.getUser();
      userIdForTracking = data.user?.id ?? null;
      if (userIdForTracking) {
        const { data: family } = await supabaseForTracking
          .from("euler_family_settings")
          .select("lock_reveal")
          .eq("user_id", userIdForTracking)
          .maybeSingle();
        lockReveal = !!family?.lock_reveal;
      }
    } catch {
      supabaseForTracking = null;
    }

    // D-06: Family/Self lock_reveal — 답 공개 차단
    const lockNote = lockReveal
      ? "\n\n## 답 공개 잠금 활성화 (부모/자기 잠금)\n학생이 '답 보기/포기' 를 요청해도 정답을 직접 공개하지 마세요. 항상 단계 코칭을 유지하세요."
      : "";

    // Manager + Retriever (첫 user 메시지의 문제 본문에 대해서만 — 후속 코칭 턴은 스킵)
    let managerContext = "";
    let retrievedContext = "";
    let chainContext = "";
    let similarContext = ""; // Phase G-04 G04-5: similar_problems RAG (백엔드 한정)
    // Phase G-03: solve_logs 적재용 chain 메타 (logSolve 호출 시 사용)
    let chainLogMeta: {
      termination:
        | "reached_conditions"
        | "max_depth"
        | "dead_end"
        | "cycle"
        | "forward_only_progress";
      depth: number;
      used_tools: string[];
    } | null = null;
    // Phase G-02: client 시각화용 chain payload (BackwardChain 컴포넌트가 useChat data 로 수신)
    const streamData = new StreamData();
    const isFirstTurn = messages.filter((m: { role: string }) => m.role === "assistant").length === 0;
    const problemText = firstUserText(messages);
    if (MANAGER_ENABLED && isFirstTurn && problemText && problemText.length >= 5) {
      try {
        const { system: mgrSys, user: mgrUser } = buildManagerPrompt(problemText);
        const { text: mgrText } = await generateText({
          model: anthropic(HAIKU_MODEL_ID),
          system: mgrSys,
          prompt: mgrUser,
          temperature: 0.1,
          maxTokens: 600,
        });
        const mgr = tryParseJson<ManagerResult>(mgrText);
        if (mgr) {
          managerContext = `\n\n## Manager 분류 결과 (내부 신호)
영역: ${mgr.area} / 난이도: ${mgr.difficulty}/6
변수: ${mgr.variables.join(", ")}
조건:
${mgr.conditions.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}
목표: ${mgr.goal}`;

          if (supabaseForTracking) {
            void trackServerEvent(supabaseForTracking, {
              user_id: userIdForTracking,
              feature: "euler",
              event: EULER_EVENTS.MANAGER_CLASSIFIED,
              metadata: { area: mgr.area, difficulty: mgr.difficulty, n_conditions: mgr.conditions.length },
            });
          }

          // Phase G-04 G04-5: similar_problems RAG (백엔드 한정, 학생 노출 X)
          // 환경변수 EULER_SIMILAR_RAG=true 일 때만 활성화. killer 수준 (eff>=5) 만 호출.
          if (process.env.EULER_SIMILAR_RAG === "true") {
            try {
              const eff_pre = effectiveDifficulty(mgr);
              if (eff_pre >= 5) {
                const sims = await retrieveSimilarProblems(problemText, 3);
                similarContext = formatSimilarProblemsContext(sims);
              }
            } catch (e) {
              console.warn("[euler-tutor] similar_problems failed:", (e as Error).message);
            }
          }

          // Phase G-02: Manager 가 layer_6_difficulty 를 보낸 경우 그 값을 우선.
          // 단순 difficulty 만 보낸 경우 fallback.
          const eff = effectiveDifficulty(mgr);

          // 난이도 4+ 또는 conditions/goal 충실 시 Retriever 호출
          if (eff >= 4 || mgr.conditions.length >= 2) {
            const tools = await retrieveTools({
              conditions: mgr.conditions,
              goal: mgr.goal,
              direction: "both",
              topK: 5,
            });
            if (tools.length) {
              retrievedContext = `\n\n## 도구 검색 결과 (Retriever — 학생에게 정답을 직접 가르치지 마세요)
이 문제 해결에 도움이 되는 정리·공식 후보:
${tools
  .map(
    (t, i) =>
      `  ${i + 1}. ${t.tool_name} (L${t.tool_layer}, score=${t.score.toFixed(2)})\n     why: ${t.why_text}`
  )
  .join("\n")}

코칭 시 위 도구들을 떠올리도록 유도하되, 도구 이름을 먼저 말하지 말고 학생이 떠올릴 기회를 먼저 주세요.`;

              if (supabaseForTracking) {
                void trackServerEvent(supabaseForTracking, {
                  user_id: userIdForTracking,
                  feature: "euler",
                  event: EULER_EVENTS.TOOL_RETRIEVED,
                  metadata: {
                    n_tools: tools.length,
                    top_tool: tools[0]?.tool_name,
                    top_score: tools[0]?.score,
                  },
                });
              }
            }
          }

          // Reasoner BFS — 영역별 임계값 (확통·기하·미적분은 4+, 중학·공통은 5+)
          // F-09 fix: Manager 가 한글 area 를 반환할 수 있으므로 normalize.
          const normalizedArea = normalizeArea(mgr.area);
          const areaThreshold = REASONER_THRESHOLD_BY_AREA[normalizedArea] ?? REASONER_MIN_DIFFICULTY;
          // Phase G-02: Recursive Chain — 도구 비자명성(layer_6_difficulty) 5+ 일 때만
          const runChain = REASONER_ENABLED && shouldRunRecursiveChain(mgr);
          console.log(
            `[euler-tutor] manager: area="${mgr.area}" → "${normalizedArea}" eff=${eff} (l6=${mgr.layer_6_difficulty ?? "?"}, comp=${mgr.computational_load ?? "?"}) threshold=${areaThreshold} reasoner=${eff >= areaThreshold ? "Y" : "N"} chain=${runChain ? "Y" : "N"}`
          );
          // Reasoner-with-tools 가 활성화되면 BFS 는 중복이므로 skip (속도 절약 ~8s)
          const willUseTools = !useGpt && !!process.env.EULER_SYMPY_URL;
          const runBFS = REASONER_ENABLED && eff >= areaThreshold && !willUseTools;
          const runTools = REASONER_ENABLED && eff >= areaThreshold && willUseTools;
          // Phase G-02: Recursive Backward Chain — 도구 비자명성이 큰 문제만.
          // BFS / with-tools 와 sequential (병렬화는 후속). chain 평균 7s.
          if (runChain) {
            try {
              // Phase G-04: alternating loop (역행↔순행) 를 기본 활성화. 환경변수
              // EULER_LEGACY_BACKWARD_ONLY=true 설정 시 G-02 backward-only 로 회귀.
              const useAlternating = process.env.EULER_LEGACY_BACKWARD_ONLY !== "true";
              const chainFn = useAlternating ? alternatingChain : recursiveBackwardChain;
              const chainRes = await chainFn({
                problem: problemText,
                conditions: mgr.conditions,
                goal: mgr.goal,
                maxDepth: 5,
                useGpt: !!useGpt,
              });
              chainLogMeta = {
                termination: chainRes.termination,
                depth: chainRes.chain.length,
                used_tools: chainRes.used_tools,
              };
              if (chainRes.chain.length > 0) {
                chainContext = `\n\n## Recursive Backward Chain (Phase G-02 — 학생 코칭용 사고 경로)
${chainToCoachingText(chainRes)}

위 chain 을 학생에게 "선생님은 이렇게 생각했어요" 라고 자연스럽게 노출하되, 단계별로 학생이 먼저 떠올릴 기회를 주세요. 한 번에 모든 depth 를 쏟아내지 말고 학생이 막힌 지점의 다음 노드 1개만 질문 형태로 제시하세요.`;
                // 시각화용 payload — ai SDK JSONValue 호환을 위해 plain object 로 직렬화
                streamData.append({
                  kind: "recursive_chain",
                  termination: chainRes.termination,
                  used_tools: chainRes.used_tools,
                  duration_ms: chainRes.duration_ms,
                  chain: chainRes.chain.map((n) => ({
                    depth: n.depth,
                    goal: n.goal,
                    tool: n.tool ?? null,
                    rationale: n.rationale,
                    next_subgoal: n.next_subgoal ?? null,
                    reached_conditions: n.reached_conditions,
                  })),
                });
                console.log(
                  `[euler-tutor] recursive-chain: depth=${chainRes.chain.length} termination=${chainRes.termination} ${chainRes.duration_ms}ms`
                );
                // chain 의 used_tools 도 candidate_tools 보고
                if (chainRes.used_tools.length) {
                  const sourceKey = problemInfo
                    ? `${problemInfo.year}_${problemInfo.type}_${problemInfo.number}`
                    : null;
                  void reportTools(
                    chainRes.used_tools.map((tool) => ({
                      proposed_name: tool,
                      proposed_layer: 6,
                      source_problem_key: sourceKey ?? undefined,
                    }))
                  ).catch((e) => console.warn("[euler-tutor] chain tool report failed:", e));
                }
              }
            } catch (e) {
              console.warn("[euler-tutor] recursive-chain skipped:", e);
            }
          }

          if (runBFS || runTools) {
            try {
              let usedToolsForReport: string[] = [];
              if (runBFS) {
                const bfs = await runReasonerStep({
                  state: {
                    problem: problemText,
                    variables: mgr.variables,
                    conditions: mgr.conditions,
                    goal: mgr.goal,
                    depth: 0,
                  },
                  useGpt: !!useGpt,
                });
                const factsSection = bfs.facts.length
                  ? `\n\n## Reasoner Forward — 도출 가능한 사실 (학생에게 직접 알려주지 마세요)
${bfs.facts.slice(0, 6).map((f, i) => `  ${i + 1}. ${f.fact}${f.tool ? ` [${f.tool}]` : ""} — ${f.rationale}`).join("\n")}`
                  : "";
                const subgoalsSection = bfs.subgoals.length
                  ? `\n\n## Reasoner Backward — 가능한 중간 목표
${bfs.subgoals.slice(0, 5).map((s, i) => `  ${i + 1}. ${s.subgoal}${s.tool ? ` [${s.tool}]` : ""} — ${s.rationale}`).join("\n")}`
                  : "";
                if (factsSection || subgoalsSection) {
                  retrievedContext += factsSection + subgoalsSection;
                }
                usedToolsForReport = bfs.used_tools;
                console.log(
                  `[euler-tutor] reasoner: ${bfs.facts.length} facts / ${bfs.subgoals.length} subgoals / ${bfs.duration_ms}ms`
                );
              }

              // D-05 + F-07: Tool calling 으로 보강된 결과 (오일러 + SymPy URL 설정 시만)
              // 영역별 tool 부분집합을 사용해 컨텍스트 절약 + LLM 의 tool 선택 정확도 ↑
              if (runTools) {
                try {
                  const tooled = await runReasonerWithTools({
                    problem: problemText,
                    conditions: mgr.conditions,
                    goal: mgr.goal,
                    maxSteps: 3,
                    area: normalizedArea,
                  });
                  if (tooled && tooled.text) {
                    retrievedContext += `\n\n## Reasoner 계산 결과 (SymPy 검증)
${tooled.text}
사용 도구: ${tooled.used_tools.map((t) => `${t.name}(${JSON.stringify(t.input)})${t.result ? `=${t.result}` : ""}`).join(", ")}`;
                    console.log(
                      `[euler-tutor] reasoner-with-tools: ${tooled.steps} steps / ${tooled.used_tools.length} tools / ${tooled.duration_ms}ms`
                    );

                    // F-09: cross-check — 마지막 의미 있는 tool 의 결과를 Wolfram 으로 교차검증
                    // (wolfram_query / plot_* 자체 호출은 제외)
                    if (!CROSSCHECK_ENABLED) {
                      console.log(`[euler-tutor] crosscheck skipped: env disabled`);
                    } else if (eff < CROSSCHECK_MIN_DIFFICULTY) {
                      console.log(
                        `[euler-tutor] crosscheck skipped: eff=${eff} < min=${CROSSCHECK_MIN_DIFFICULTY}`
                      );
                    }
                    if (CROSSCHECK_ENABLED && eff >= CROSSCHECK_MIN_DIFFICULTY) {
                      const checkable = [...tooled.used_tools]
                        .reverse()
                        .find(
                          (t) =>
                            t.name !== "wolfram_query" &&
                            !t.name.startsWith("plot_") &&
                            t.result &&
                            t.result.length > 0 &&
                            t.result.length < 200
                        );
                      const wolframQ = checkable ? buildWolframQuery(checkable) : null;
                      if (checkable && wolframQ) {
                        try {
                          const cc = await crossCheck({
                            sympyResult: checkable.result!,
                            wolframQuery: wolframQ,
                          });
                          retrievedContext += `\n\n## 교차검증 (Phase F-05)
${cc.message} (신뢰도 ${(cc.confidence * 100).toFixed(0)}%)
SymPy: ${cc.sympy_result ?? "—"}${cc.wolfram_result ? `\nWolfram: ${cc.wolfram_result}` : ""}

${cc.verified
                            ? "두 엔진이 동일한 답을 도출했습니다. 학생에게 자신감 있게 코칭하되, 정답을 직접 알려주지는 마세요."
                            : cc.confidence >= 0.6
                              ? "한 엔진만 답을 도출했습니다. 단계별로 신중히 코칭하세요."
                              : "두 엔진의 결과가 다릅니다. 학생과 함께 단계별로 검산하세요. 정답 단정 금지."}`;
                          console.log(
                            `[euler-tutor] cross-check: verified=${cc.verified} confidence=${cc.confidence.toFixed(2)} via=${cc.sources.join("+")}`
                          );

                          if (supabaseForTracking) {
                            void trackServerEvent(supabaseForTracking, {
                              user_id: userIdForTracking,
                              feature: "euler",
                              event: EULER_EVENTS.CROSSCHECK,
                              metadata: {
                                verified: cc.verified,
                                confidence: cc.confidence,
                                sources: cc.sources,
                                tool_name: checkable.name,
                              },
                            });
                          }
                        } catch (e) {
                          console.warn("[euler-tutor] crosscheck skipped:", e);
                        }
                      }
                    }
                  }
                } catch (e) {
                  console.warn("[euler-tutor] reasoner-with-tools skipped:", e);
                }
              }

              // C-05: Reasoner 가 사용한 도구를 candidate_tools 에 fire-and-forget 보고
              if (usedToolsForReport.length) {
                const sourceKey = problemInfo
                  ? `${problemInfo.year}_${problemInfo.type}_${problemInfo.number}`
                  : null;
                void reportTools(
                  usedToolsForReport.map((tool) => ({
                    proposed_name: tool,
                    proposed_layer: 6,
                    source_problem_key: sourceKey ?? undefined,
                  }))
                ).catch((e) => console.warn("[euler-tutor] tool report failed:", e));
              }
            } catch (e) {
              console.warn("[euler-tutor] reasoner skipped:", e);
            }
          }
        }
      } catch (e) {
        console.warn("[euler-tutor] manager/retriever skipped:", e);
      }
    }

    // G06-24: Legend Router 점진적 위임 — best-effort 비차단.
    // 외부 시그니처 무변경 절대 원칙. routeProblem 만 호출하여 routing_decision 을 DB 적재 +
    // streamData 에 legend_routing payload 옵셔널 추가. 본 코칭 streamText 흐름은 무파괴.
    // tutor-orchestrator (callTutor) 본격 위임은 G-07 으로 이관 — 비스트리밍 단발 호출 vs
    // 기존 chat coaching streamText 의 시그니처 차이 + 베타 50명 회귀 위험으로 본 task 보류.
    let legendRouting: RouteDecision | null = null;
    if (
      isFirstTurn &&
      problemText &&
      problemText.length >= 5 &&
      userIdForTracking &&
      process.env.LEGEND_DELEGATION_ENABLED !== "false"
    ) {
      try {
        // 3초 timeout — 라우팅 지연이 본 응답 지연으로 전파되지 않도록.
        const ROUTE_TIMEOUT_MS = parseInt(
          process.env.LEGEND_ROUTE_TIMEOUT_MS ?? "3000",
          10,
        );
        legendRouting = await Promise.race([
          routeProblem({
            user_id: userIdForTracking,
            problem_text: problemText,
            input_mode: inputMode === "voice" ? "voice" : (inputMode as
              | "text"
              | "photo"
              | "handwrite"),
          }),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), ROUTE_TIMEOUT_MS),
          ),
        ]);
        if (legendRouting) {
          // 시각화 + client legend_session_id 호환을 위해 streamData append.
          // 기존 client 는 이 kind 를 무시하므로 외부 호환 보존.
          streamData.append({
            kind: "legend_routing",
            routing_decision_id: legendRouting.routing_decision_id,
            stage_reached: legendRouting.stage_reached,
            routed_tier: legendRouting.routed_tier,
            routed_tutor: legendRouting.routed_tutor,
            area: legendRouting.area ?? null,
            confidence: legendRouting.confidence ?? null,
            duration_ms: legendRouting.duration_ms,
          });
          console.log(
            `[euler-tutor] legend-route: stage=${legendRouting.stage_reached} tier=${legendRouting.routed_tier} tutor=${legendRouting.routed_tutor} ${legendRouting.duration_ms}ms`,
          );
        }
      } catch (e) {
        // best-effort — 어떤 실패도 본 응답을 막지 않음.
        console.warn(
          "[euler-tutor] legend-route skipped:",
          (e as Error).message,
        );
      }
    }

    const systemPrompt = `${EULER_SYSTEM_PROMPT}

현재 학습 영역: ${area || "자유 질문"}
당신의 이름: ${tutorName}
입력 모드: ${inputMode}

첫 메시지라면 따뜻하게 인사하고, 학생에게 문제를 보여달라고 요청하세요.
"안녕! ${tutorName}예요. 😊 어떤 수학 문제를 같이 풀어볼까요? 문제를 알려주세요!"
학생이 한 번에 여러 문제를 보내면, 한 문제씩 풀자고 안내하세요.${inputModeNote}${lockNote}${solutionContext}${managerContext}${retrievedContext}${similarContext}${chainContext}${criticContext}`;

    console.log(
      `[euler-tutor] persona=${tutorPersona} input_mode=${inputMode} critic=${CRITIC_ENABLED} mgr=${managerContext ? "Y" : "N"} retriever=${retrievedContext ? "Y" : "N"} similar=${similarContext ? "Y" : "N"} chain=${chainContext ? "Y" : "N"} messages=${messages.length}`
    );

    // C-06: 풀이 1건이 시작되는 시점(첫 user turn) 에 비동기 로그 적재
    if (isFirstTurn && problemText && supabaseForTracking) {
      const sourceKey = problemInfo
        ? `${problemInfo.year}_${problemInfo.type}_${problemInfo.number}`
        : null;
      void logSolve({
        problem_text: problemText.slice(0, 4000),
        problem_key: sourceKey,
        area: area ?? null,
        input_mode: inputMode === "voice" ? "voice" : (inputMode as "text" | "photo" | "handwrite"),
        tutor_persona: tutorPersona as "euler" | "gauss",
        chain_termination: chainLogMeta?.termination ?? null,
        chain_depth: chainLogMeta?.depth ?? null,
        chain_used_tools: chainLogMeta?.used_tools ?? [],
      });
    }

    const model = (useGpt
      ? openai("gpt-5.1")
      : anthropic("claude-sonnet-4-5-20250929")) as LanguageModelV1;

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      onFinish: () => {
        // Phase G-02: stream 종료 시 streamData 닫기 (chain payload 포함)
        void streamData.close();
      },
    });

    return result.toDataStreamResponse({ data: streamData });
  } catch (err) {
    console.error("euler-tutor error:", err);
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
