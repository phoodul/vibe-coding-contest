import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { RECORD_SYSTEM_PROMPT } from "@/lib/ai/record-prompt";

export async function POST(req: Request) {
  const { studentName, attendance, performance, club, volunteer, special } =
    await req.json();

  const prompt = `다음 학생의 활동 데이터를 바탕으로 생활기록부 서술형 문장을 작성해주세요.

## 학생 정보
- 이름: ${studentName}
- 출결: ${attendance}
- 수행평가: ${performance}
- 동아리: ${club}
- 봉사활동: ${volunteer}
- 특기사항: ${special}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system: RECORD_SYSTEM_PROMPT,
    prompt,
  });

  return result.toTextStreamResponse();
}
