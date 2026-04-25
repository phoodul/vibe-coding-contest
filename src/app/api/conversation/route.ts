import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { CONVERSATION_SYSTEM_PROMPT, REPORT_SYSTEM_PROMPT, TOPICS } from "@/lib/ai/conversation-prompt";

export const maxDuration = 60;

const ANTHROPIC_CACHE = {
  anthropic: { cacheControl: { type: "ephemeral" as const } },
};

// 긴 대화에서 과거 메시지 누적을 방지 — 최근 N턴만 전송
const MAX_HISTORY_TURNS = 20;

export async function POST(req: Request) {
  try {
    const { messages, level, topicId, customTopic, mode } = await req.json();

    // 리포트 모드 — 전체 대화 원문 전달 (정확도 유지, 수정 금지)
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

    const trimmedHistory =
      Array.isArray(messages) && messages.length > MAX_HISTORY_TURNS
        ? messages.slice(-MAX_HISTORY_TURNS)
        : messages;

    // 회화는 빠른 Haiku 사용 (2-3문장 응답에 최적, 응답 속도 3-5배 빠름)
    const result = streamText({
      model: anthropic("claude-haiku-4-5-20251001"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
          providerOptions: ANTHROPIC_CACHE,
        },
        ...trimmedHistory,
      ],
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
