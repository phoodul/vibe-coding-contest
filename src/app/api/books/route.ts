import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `당신은 한국 교육 전문 도서 큐레이터입니다.
학생의 학년, 희망 학과, 진로 목표를 고려하여 맞춤형 도서를 추천합니다.

규칙:
1. 10~15권을 추천합니다
2. 각 도서에 대해: **제목** — 저자 / 추천 이유(2-3문장) / 난이도를 마크다운으로 작성합니다
3. 읽는 순서를 제안합니다 (기초 → 심화 순)
4. 한국어 도서를 우선하되, 번역서도 포함합니다
5. 교양서, 전공 입문서, 진로 탐색서를 균형 있게 포함합니다
6. 존댓말을 사용합니다`,
      messages,
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
