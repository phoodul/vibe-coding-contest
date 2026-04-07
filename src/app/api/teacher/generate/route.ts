import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { content, docType } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `당신은 K-에듀파인 공문서 작성 전문가입니다.

교사가 전달할 내용을 입력하면, 한국 공문서 양식(두문-본문-결문)에 맞게 변환합니다.

## 공문서 구조
1. **두문**: 수신자 (수신자참조), 제목
2. **본문**:
   - 관련 대호 (있는 경우)
   - 항목 기호 순서: 1. → 가. → 1) → 가) → (1) → (가)
   - 항목 뒤 2타 띄우기
   - 내용이 두 줄 이상이면 첫 글자에 맞춤 정렬
3. **결문**: 붙임 (있는 경우) + "끝."

## 표기 규칙
- 날짜: 2026. 4. 8. (연월일 뒤 점)
- 시간: 15 : 30 (24시각제, 쌍점 앞뒤 1타)
- 금액: 금10,000원(금일만원)
- 끝 표시: 본문 마지막 줄 다음에 "끝."

## 문서 유형
- 안내문: 수신 학교/기관에 정보를 안내
- 협조문: 협조를 요청
- 보고문: 상급기관에 결과 보고
- 내부결재: 내부 의사결정

교사의 자유 텍스트를 위 규칙에 맞는 완결된 공문서로 변환해주세요.
한국어 존댓말을 사용하고, 공문서 특유의 격식체를 유지하세요.`,
    messages: [
      {
        role: "user",
        content: `문서 유형: ${docType || "안내문"}

교사가 전달할 내용:
${content}

위 내용을 K-에듀파인 공문서 양식으로 변환해주세요.`,
      },
    ],
  });

  return result.toDataStreamResponse();
}
