import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { INTERNSHIP_SYSTEM_PROMPT } from "@/lib/ai/internship-prompt";

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

    const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

    const userMessage = `현장실습 정보:
- 실습일자: ${today}
- 실습 분야: ${input.field || "미입력"}
- 실습 업체: ${input.company || "미입력"}
- 오늘 한 일: ${input.tasks || "미입력"}
- 배운 점: ${input.learned || "미입력"}

이 내용을 바탕으로 학교 제출용 현장실습 일지를 작성해주세요. 실습일자는 ${today}입니다.`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: INTERNSHIP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
