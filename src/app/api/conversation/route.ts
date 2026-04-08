import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { CONVERSATION_SYSTEM_PROMPT, REPORT_SYSTEM_PROMPT, TOPICS } from "@/lib/ai/conversation-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, level, topicId, mode } = await req.json();

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
  const scenario = TOPICS.flatMap((t) => t.scenarios).find((s) => s.id === topicId);
  const scenarioPrompt = scenario?.prompt || "You are a friendly conversation partner.";

  const systemPrompt = CONVERSATION_SYSTEM_PROMPT.replace("{level}", level) + `\n\n## Scenario\n${scenarioPrompt}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
