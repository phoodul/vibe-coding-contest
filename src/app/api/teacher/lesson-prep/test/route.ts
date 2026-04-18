import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { parseLessonPrepRequest, buildUserContext } from "@/lib/lesson-prep/extract-text";

export const maxDuration = 60;

/** 모의 테스트 (객관식 7 + 서술형 3) */
export async function POST(req: Request) {
  try {
    const { topic, grade, docContent } = await parseLessonPrepRequest(req);
    if (!topic && !docContent) {
      return new Response(JSON.stringify({ error: "주제 또는 파일이 필요합니다" }), { status: 400 });
    }

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `당신은 한국의 평가 전문 교사입니다. 주제에 맞는 **모의 테스트**를 출제합니다.

## 출력 규칙
- 마크다운 형식
- **객관식 7문항 + 서술형 3문항 = 총 10문항**
- 난이도 배분: 하(3) + 중(4) + 상(3)
- 학년 수준에 맞춘 어휘·지문 길이

## 각 문항 포맷

### 문항 1 [난이도: 하/중/상]
문제 지문 (필요 시 자료·그래프 설명 포함)

① 선택지1
② 선택지2
③ 선택지3
④ 선택지4
⑤ 선택지5

**정답:** ③
**해설:** 한 줄 요약 해설

### 서술형 (문항 8~10)
- 각 문항은 조건(글자수, 관점 등) 명시
- **모범답안:** 섹션에 예시 답안 제시
- **채점 포인트:** 3~4개 체크리스트`,
      messages: [{ role: "user", content: buildUserContext(topic, grade, docContent) }],
    });

    return result.toDataStreamResponse();
  } catch (e) {
    console.error("test error:", e);
    return new Response(JSON.stringify({ error: "테스트 생성 오류" }), { status: 500 });
  }
}
