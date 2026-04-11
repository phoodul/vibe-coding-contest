import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { MUSIC_REVIEW_SYSTEM_PROMPT } from "@/lib/ai/music-review-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMsg = messages?.find((m: { role: string }) => m.role === "user");
    let input: Record<string, string> = {};
    try {
      input = JSON.parse(userMsg?.content || "{}");
    } catch {
      input = {};
    }

    const userMessage = `감상할 곡 정보:
- 곡명: ${input.title || "미입력"}
- 작곡가/아티스트: ${input.artist || "미입력"}
- 장르: ${input.genre || "미입력"}
- 들은 느낌/메모: ${input.feeling || "미입력"}

이 곡에 대한 음악 감상문 작성을 도와주세요.`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: MUSIC_REVIEW_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
