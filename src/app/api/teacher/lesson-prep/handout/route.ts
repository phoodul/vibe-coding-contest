import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { parseLessonPrepRequest, buildUserContext } from "@/lib/lesson-prep/extract-text";

export const maxDuration = 60;

/** 학생 배부용 워크시트 (마크다운) */
export async function POST(req: Request) {
  try {
    const { topic, grade, docContent } = await parseLessonPrepRequest(req);
    if (!topic && !docContent) {
      return new Response(JSON.stringify({ error: "주제 또는 파일이 필요합니다" }), { status: 400 });
    }

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `당신은 한국의 베테랑 교사입니다. 학생 **배부용 워크시트**를 생성합니다.

## 출력 규칙
- 마크다운 형식, A4 2장 분량 (2,500자 내외)
- 다음 섹션을 모두 포함:

## 학습 목표
- 3가지, 구체적 행동 동사(설명할 수 있다, 분석할 수 있다 등)로

## 핵심 개념 정리 — 빈칸 채우기
- 5~8개 문항. 정답 단어를 \`(    )\`로 비우고, 문항 하단에 (정답: ...) 표시

## 개념 관계도
- 주요 개념 3~5개의 관계를 화살표로 표현 (텍스트 다이어그램 OK)

## 활동 1 — 자료 분석
- 주제 관련 짧은 지문/인용문(100~200자) 제시
- 분석 질문 2~3개

## 활동 2 — 적용 문제
- 실생활 적용 서술형 질문 2개

## 활동 3 — 토론 준비
- 찬반 논쟁 주제 1개
- 내 입장 / 근거 / 반대 의견 예상 정리칸

## 자기 평가
- 😊 잘 이해함 / 😐 보통 / 😢 복습 필요 — 체크 항목 3~5개`,
      messages: [{ role: "user", content: buildUserContext(topic, grade, docContent) }],
    });

    return result.toDataStreamResponse();
  } catch (e) {
    console.error("handout error:", e);
    return new Response(JSON.stringify({ error: "워크시트 생성 오류" }), { status: 500 });
  }
}
