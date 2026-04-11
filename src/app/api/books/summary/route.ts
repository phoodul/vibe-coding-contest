import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // useChat에서 보낸 마지막 user 메시지에서 요청사항+독서기록 추출
    const lastMsg = messages?.filter((m: { role: string }) => m.role === "user").pop();
    const userContent = lastMsg?.content || "";

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `당신은 학생의 독서 기록을 바탕으로 맞춤형 독서기록 요약문을 작성하는 교육 전문가입니다.

사용자가 [요청사항]과 [독서 기록 목록]을 함께 보냅니다.

## 핵심 원칙
1. **요청사항을 정확히 따르세요** — 용도(대입, 자기소개서 등), 지원 학과, 글자 수 제한 등
2. 독서 기록 중 요청 목적에 **관련성 높은 도서를 선별**하여 중심으로 서술하세요
3. 학생의 **독서 감상문에서 의미 있는 내용**을 반영하세요
4. 단순 나열이 아닌, 독서를 통한 **사고의 성장과 연결**을 보여주세요
5. 존댓말이 아닌 **학생부 기재 문체**(~함, ~였다, ~하였음)로 작성하세요
6. 글자 수 제한이 있으면 반드시 지키세요

## 출력 형식
- 요청에 맞는 요약문을 바로 출력하세요
- 부가 설명 없이 요약문 본문만 출력하세요`,
      messages: [{ role: "user" as const, content: userContent }],
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
