import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { CONVERSATION_SYSTEM_PROMPT, REPORT_SYSTEM_PROMPT, TOPICS } from "@/lib/ai/conversation-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, level, topicId, customTopic, mode } = await req.json();

  // 리포트 모드
  if (mode === "report") {
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: REPORT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Student level: ${level}\n\nConversation:\n${JSON.stringify(messages)}`,
        },
      ],
    });
    return result.toDataStreamResponse();
  }

  // 시나리오 프롬프트 찾기
  let scenarioPrompt: string;
  if (topicId === "custom" && customTopic) {
    scenarioPrompt = `The student wants to discuss: "${customTopic}". Engage naturally with this topic as a knowledgeable conversation partner.`;
  } else {
    const scenario = TOPICS.flatMap((t) => t.scenarios).find((s) => s.id === topicId);
    scenarioPrompt = scenario?.prompt || "You are a friendly conversation partner.";
  }

  const systemPrompt = CONVERSATION_SYSTEM_PROMPT.replace("{level}", level) + `\n\n## Scenario\n${scenarioPrompt}`;

  // 회화는 빠른 Haiku 사용 (2-3문장 응답에 최적, 응답 속도 3-5배 빠름)
  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
