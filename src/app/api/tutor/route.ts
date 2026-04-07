import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/ai/tutor-prompt";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, subject, topic } = await req.json();

  const systemPrompt = `${TUTOR_SYSTEM_PROMPT}

현재 교과: ${subject}
현재 단원: ${topic}

이 교과와 단원의 내용에 집중하여 소크라테스식으로 학생을 지도하세요.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
