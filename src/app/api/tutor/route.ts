import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TUTOR_SYSTEM_PROMPT, SUBJECTS } from "@/lib/ai/tutor-prompt";
import { searchWeb, formatSearchResults } from "@/lib/search";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, subject, topic, concept } = await req.json();

    // 단원별 핵심 개념 찾기
    const subjectData = SUBJECTS.find((s) => s.name === subject);
    const topicData = subjectData?.topics.find((t) => t.name === topic);
    const concepts = topicData?.concepts?.join(", ") || "";

    const isCurrent = subjectData?.id === "current";

    const focusInstruction = isCurrent
      ? `학생이 "시사 · 최신 주제" 교과를 선택했습니다. 학생의 질문이나 주제에 맞게 자유롭게 Guided Learning을 진행하세요. 최신 주제이므로 searchWeb 도구를 적극 활용하세요.`
      : concept
        ? `학생이 "${concept}" 개념을 집중 학습하려 합니다. 이 개념을 중심으로 깊이 있게 다루되, 필요시 관련 개념도 연결하세요.`
        : `이 교과와 단원의 내용에 집중하여 Guided Learning 방식으로 학생을 이끄세요.
하나의 개념을 충분히 다루면 자연스럽게 다음 핵심 개념으로 넘어가세요.`;

    const systemPrompt = `${TUTOR_SYSTEM_PROMPT}

현재 교과: ${subject}
현재 단원: ${topic || "(자유 질문)"}
${concepts ? `이 단원의 핵심 개념: ${concepts}` : ""}

${focusInstruction}
학생의 답변에서 빠진 부분이 있으면 "혹시 ~에 대해서도 생각해볼 수 있지 않을까요?" 식으로 부드럽게 이끌어주세요.`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages,
      tools: {
        searchWeb: tool({
          description:
            "웹에서 최신 정보를 검색합니다. 시사 주제, 최신 뉴스, 학생이 언급한 새로운 사실을 확인할 때 사용하세요. 교과서 수준의 확립된 지식은 검색하지 마세요.",
          parameters: z.object({
            query: z
              .string()
              .describe("검색할 키워드 또는 질문 (한국어 또는 영어)"),
          }),
          execute: async ({ query }) => {
            const response = await searchWeb(query);
            return formatSearchResults(response);
          },
        }),
      },
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
