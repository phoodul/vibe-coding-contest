import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ corrections: [] });
    }

    const { text: result } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system: `당신은 한국어 맞춤법 검사 전문가입니다.
입력된 텍스트에서 맞춤법, 띄어쓰기, 문법 오류를 찾아 JSON 배열로 반환하세요.
오류가 없으면 빈 배열 []을 반환하세요.

형식: [{"original":"틀린 부분","corrected":"수정 제안","reason":"간단한 이유"}]
JSON만 반환하세요. 설명 없이.`,
      messages: [{ role: "user", content: text }],
    });

    try {
      const corrections = JSON.parse(result.trim());
      return NextResponse.json({ corrections });
    } catch {
      return NextResponse.json({ corrections: [] });
    }
  } catch {
    return NextResponse.json({ error: "맞춤법 검사 중 오류" }, { status: 500 });
  }
}
