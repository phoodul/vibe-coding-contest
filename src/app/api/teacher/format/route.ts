import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `당신은 K-에듀파인 공문서 양식 전문가입니다.

주어진 텍스트에서 공문서 양식 규칙 위반 사항을 찾아내세요.

## 검사 규칙
1. 항목 기호 순서: 1. → 가. → 1) → 가) → (1) → (가) → ① → ㉮
2. 날짜 표기: 2026. 4. 8. (연월일 뒤 점, 공백)
3. 시간 표기: 15 : 30 (24시각제, 쌍점 앞뒤 1타)
4. 금액 표기: 금10,000원(금일만원)
5. 붙임/끝 표시 확인
6. 2타 띄우기 규칙
7. 관련대호 표기 형식
8. 기타 문맥적 양식 오류

각 위반에 대해 줄 번호, 원본, 교정안, 위반 규칙을 알려주세요.
존댓말을 사용하세요.`,
      messages: [
        {
          role: "user",
          content: `다음 텍스트의 공문서 양식 규칙 위반을 찾아주세요:\n\n${text}`,
        },
      ],
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
