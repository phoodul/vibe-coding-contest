import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { EULER_SYSTEM_PROMPT } from "@/lib/ai/euler-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, area } = await req.json();

    const systemPrompt = `${EULER_SYSTEM_PROMPT}

현재 학습 영역: ${area || "자유 질문"}

첫 메시지라면 따뜻하게 인사하고, 학생에게 문제를 보여달라고 요청하세요.
"안녕! 오일러 튜터예요. 😊 어떤 수학 문제를 같이 풀어볼까요? 문제를 알려주세요!"`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
