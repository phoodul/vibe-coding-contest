import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { streamText, type LanguageModelV1 } from "ai";
import { NextResponse } from "next/server";
import { EULER_SYSTEM_PROMPT } from "@/lib/ai/euler-prompt";
import { getSolution } from "@/lib/solution-cache";

export const maxDuration = 60;

/** 첫 메시지에서 기출문제 정보 파싱 */
function parseProblemInfo(messages: { role: string; content: string }[]) {
  const first = messages.find((m) => m.role === "user");
  if (!first || typeof first.content !== "string") return null;

  // [2025학년도 수능 미적분 30번 — 주관식]
  const match = first.content.match(
    /\[(\d{4})학년도\s*수능\s*(공통|미적분|확률과통계|기하|가형|나형)\s*(\d+)번/
  );
  if (!match) return null;

  const year = parseInt(match[1]);
  const type = match[2];
  const number = parseInt(match[3]);

  // (힌트: 정답은 X번입니다) or (힌트: 정답은 X입니다)
  const ansMatch = first.content.match(/정답은\s*(\d+)/);
  const answer = ansMatch ? ansMatch[1] : "";

  return { year, type, number, answer };
}

export async function POST(req: Request) {
  try {
    const { messages, area, useGpt } = await req.json();

    const tutorName = useGpt ? "가우스 튜터" : "오일러 튜터";

    // 기출문제인 경우 풀이 검색
    let solutionContext = "";
    const problemInfo = parseProblemInfo(messages);
    if (problemInfo && problemInfo.answer) {
      try {
        const solution = await getSolution(
          problemInfo.year,
          problemInfo.type,
          problemInfo.number,
          problemInfo.answer
        );
        if (solution) {
          solutionContext = `\n\n## 참고 풀이 (내부 자료 — 학생에게 직접 보여주지 마세요)
이 문제의 검증된 풀이 방향입니다. 학생을 이 방향으로 코칭하되, 풀이를 그대로 읽어주지 말고 단계적으로 사고를 유도하세요.
정답: ${problemInfo.answer}

${solution}`;
        }
      } catch {
        // 풀이 검색 실패 시 무시
      }
    }

    const systemPrompt = `${EULER_SYSTEM_PROMPT}

현재 학습 영역: ${area || "자유 질문"}
당신의 이름: ${tutorName}

첫 메시지라면 따뜻하게 인사하고, 학생에게 문제를 보여달라고 요청하세요.
"안녕! ${tutorName}예요. 😊 어떤 수학 문제를 같이 풀어볼까요? 문제를 알려주세요!"
학생이 한 번에 여러 문제를 보내면, 한 문제씩 풀자고 안내하세요.${solutionContext}`;

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
