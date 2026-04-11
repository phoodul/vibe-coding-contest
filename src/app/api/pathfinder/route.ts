import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { PATHFINDER_SYSTEM_PROMPT } from "@/lib/ai/pathfinder-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMsg = messages?.find((m: { role: string }) => m.role === "user");
    let input: { dream?: string; grade?: string; region?: string } = {};
    try {
      input = JSON.parse(userMsg?.content || "{}");
    } catch {
      input = {};
    }

    const userMessage = `학생의 꿈/관심사: "${input.dream || "미입력"}"
현재 학년: ${input.grade === "middle" ? "중학생" : input.grade === "high" ? "고등학생" : input.grade === "college" ? "대학생" : input.grade === "adult" ? "성인" : "미입력"}
지역: ${input.region || "미입력"}

이 학생이 꿈을 이루기 위한 구체적인 로드맵, 갈 수 있는 학교·기관, 필요한 자격증, 활용 가능한 지원제도를 안내해주세요.`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: PATHFINDER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
