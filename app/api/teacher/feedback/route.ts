import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { FEEDBACK_SYSTEM_PROMPT } from "@/lib/ai/feedback-prompt";

export async function POST(req: Request) {
  const { rubric, studentAnswer, title } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system: FEEDBACK_SYSTEM_PROMPT,
    prompt: `## 평가 제목: ${title}\n\n## 루브릭 (채점 기준):\n${rubric}\n\n## 학생 답안:\n${studentAnswer}\n\n위 루브릭을 기준으로 이 학생에게 건설적인 피드백을 작성해주세요.`,
  });

  return result.toTextStreamResponse();
}
