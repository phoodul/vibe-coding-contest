import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { parseLessonPrepRequest, buildUserContext } from "@/lib/lesson-prep/extract-text";

export const maxDuration = 60;

/**
 * 슬라이드 텍스트 생성 (마크다운, 각 슬라이드 --- 로 구분)
 * 이미지 플레이스홀더는 `![이미지:<검색어>](PLACEHOLDER)` 형식으로 출력 → 클라이언트에서 Unsplash로 치환
 */
export async function POST(req: Request) {
  try {
    const { topic, grade, docContent } = await parseLessonPrepRequest(req);
    if (!topic && !docContent) {
      return new Response(JSON.stringify({ error: "주제 또는 파일이 필요합니다" }), { status: 400 });
    }

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      maxTokens: 16000,
      system: `당신은 한국의 베테랑 교사이자 교수설계 전문가입니다.
수업 주제(또는 업로드 자료)를 받아, 바로 수업에 쓸 수 있는 **슬라이드 마크다운**을 생성합니다.

## 출력 규칙
- **정확히 25~28장**, 각 슬라이드는 ---로 구분 (15장 이하 절대 금지)
- 각 슬라이드 1장당 180~250자 본문 (너무 길게 쓰지 말 것 — 25장 완주가 최우선)
- 표지(1번)와 마지막 정리 슬라이드를 제외하고 **모든 슬라이드 첫 줄 바로 아래에 이미지 토큰을 삽입**:
  \`{{IMG:<english search keywords 3~5 words>}}\`
  - 반드시 영문 명사구 (Unsplash 검색용). 예: "french revolution storming bastille", "social contract philosophy", "rousseau geneva portrait"
  - 한국어 토큰 금지, 괄호 형식 정확히 지킬 것

## 각 슬라이드 구조
# 슬라이드 제목
{{IMG:search terms in english}}

> 💡 핵심 메시지 (한 문장)

**[설명]** 2문단으로 상세히.

**[핵심 포인트]**
- ✅ 포인트 1
- ✅ 포인트 2
- ✅ 포인트 3

**[예시]** 실제 사례·비유
**[생각해보기]** 🤔 질문 1개

## 필수 슬라이드 구성 (총 25~28장)
1. 표지 (학습 목표 3개 + 학년)
2. 도입/동기유발
3. 배경·시대적 맥락
4~6. 핵심 개념 1
7~9. 핵심 개념 2
10~12. 핵심 개념 3
13~15. 핵심 개념 4
16~18. 비교·대조 (표 형태 권장)
19~20. 현대적 의의·적용 사례
21~22. 토론 주제
23. 핵심 정리 (키워드)
24. 형성평가 (빠른 퀴즈 3문제)
25. 다음 차시 예고

**중요:** 반드시 25장 이상 쓰세요. 분량이 모자라면 핵심 개념을 더 세분화하세요.`,
      messages: [{ role: "user", content: buildUserContext(topic, grade, docContent) }],
    });

    return result.toDataStreamResponse();
  } catch (e) {
    console.error("lesson-prep slides error:", e);
    return new Response(JSON.stringify({ error: "생성 중 오류가 발생했습니다." }), { status: 500 });
  }
}
