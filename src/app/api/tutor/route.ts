import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { TUTOR_SYSTEM_PROMPT, SUBJECTS } from "@/lib/ai/tutor-prompt";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, subject, topic } = await req.json();

  // 단원별 핵심 개념 찾기
  const subjectData = SUBJECTS.find((s) => s.name === subject);
  const topicData = subjectData?.topics.find((t) => t.name === topic);
  const concepts = topicData?.concepts?.join(", ") || "";

  const systemPrompt = `${TUTOR_SYSTEM_PROMPT}

현재 교과: ${subject}
현재 단원: ${topic}
${concepts ? `이 단원의 핵심 개념: ${concepts}` : ""}

이 교과와 단원의 내용에 집중하여 Guided Learning 방식으로 학생을 이끄세요.
학생의 답변에서 빠진 부분이 있으면 "혹시 ~에 대해서도 생각해볼 수 있지 않을까요?" 식으로 부드럽게 이끌어주세요.
하나의 개념을 충분히 다루면 자연스럽게 다음 핵심 개념으로 넘어가세요.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
