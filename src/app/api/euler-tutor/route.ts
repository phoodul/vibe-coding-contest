import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText, streamText, type LanguageModelV1 } from "ai";
import { NextResponse } from "next/server";
import { EULER_SYSTEM_PROMPT } from "@/lib/ai/euler-prompt";
import { getSolution } from "@/lib/solution-cache";
import { runCritic } from "@/lib/euler/critic-client";
import { buildManagerPrompt, type ManagerResult } from "@/lib/ai/euler-manager-prompt";
import { retrieveTools } from "@/lib/euler/retriever";
import { runReasonerStep } from "@/lib/euler/reasoner";
import { reportTools } from "@/lib/euler/tool-reporter";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { EULER_EVENTS, trackServerEvent } from "@/lib/analytics/events";

const CRITIC_ENABLED = process.env.EULER_CRITIC_ENABLED === "true";
const MANAGER_ENABLED = process.env.EULER_MANAGER_ENABLED !== "false"; // 기본 on
const REASONER_ENABLED = process.env.EULER_REASONER_ENABLED !== "false"; // 기본 on
const REASONER_MIN_DIFFICULTY = parseInt(process.env.EULER_REASONER_MIN_DIFFICULTY ?? "6", 10);
const HAIKU_MODEL_ID = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";

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

    // 분석 트래킹용 supabase 클라이언트 (옵셔널)
    let supabaseForTracking: Awaited<ReturnType<typeof createSupabaseServer>> | null = null;
    let userIdForTracking: string | null = null;
    try {
      supabaseForTracking = await createSupabaseServer();
      const { data } = await supabaseForTracking.auth.getUser();
      userIdForTracking = data.user?.id ?? null;
    } catch {
      supabaseForTracking = null;
    }

    // Manager + Retriever (첫 user 메시지의 문제 본문에 대해서만 — 후속 코칭 턴은 스킵)
    let managerContext = "";
    let retrievedContext = "";
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

          // 난이도 4+ 또는 conditions/goal 충실 시 Retriever 호출
          if (mgr.difficulty >= 4 || mgr.conditions.length >= 2) {
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

          // Reasoner BFS — 난이도 6+ 만 (비용 통제)
          if (REASONER_ENABLED && mgr.difficulty >= REASONER_MIN_DIFFICULTY) {
            try {
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
              console.log(
                `[euler-tutor] reasoner: ${bfs.facts.length} facts / ${bfs.subgoals.length} subgoals / ${bfs.duration_ms}ms`
              );

              // C-05: Reasoner 가 사용한 도구를 candidate_tools 에 fire-and-forget 보고
              if (bfs.used_tools.length) {
                const sourceKey = problemInfo
                  ? `${problemInfo.year}_${problemInfo.type}_${problemInfo.number}`
                  : null;
                void reportTools(
                  bfs.used_tools.map((tool) => ({
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

    const systemPrompt = `${EULER_SYSTEM_PROMPT}

현재 학습 영역: ${area || "자유 질문"}
당신의 이름: ${tutorName}
입력 모드: ${inputMode}

첫 메시지라면 따뜻하게 인사하고, 학생에게 문제를 보여달라고 요청하세요.
"안녕! ${tutorName}예요. 😊 어떤 수학 문제를 같이 풀어볼까요? 문제를 알려주세요!"
학생이 한 번에 여러 문제를 보내면, 한 문제씩 풀자고 안내하세요.${inputModeNote}${solutionContext}${managerContext}${retrievedContext}${criticContext}`;

    console.log(
      `[euler-tutor] persona=${tutorPersona} input_mode=${inputMode} critic=${CRITIC_ENABLED} mgr=${managerContext ? "Y" : "N"} retriever=${retrievedContext ? "Y" : "N"} messages=${messages.length}`
    );

    const model = (useGpt
      ? openai("gpt-5.1")
      : anthropic("claude-sonnet-4-5-20250929")) as LanguageModelV1;

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error("euler-tutor error:", err);
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
