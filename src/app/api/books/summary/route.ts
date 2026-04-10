import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { logsText, studentInfo } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `당신은 학생의 독서 여정을 분석하는 교육 전문가입니다.

학생의 독서 기록을 분석하여 다음을 제공합니다:
1. **독서 성향 분석**: 어떤 분야/주제를 주로 읽는지, 독서 패턴
2. **성장 포인트**: 독서를 통해 어떤 사고력/지식이 성장했는지
3. **추천 방향**: 다음에 읽으면 좋을 방향 (구체적 분야/주제)
4. **독서 이력 요약**: 대입/자소서에 활용할 수 있는 2~3문장 요약

따뜻하고 격려하는 어조로, 학생의 노력을 인정하며 작성합니다.
존댓말을 사용합니다.`,
    messages: [
      {
        role: "user",
        content: `${studentInfo ? `학생 정보: ${studentInfo}\n\n` : ""}독서 기록:\n${logsText}\n\n위 독서 기록을 분석하고 요약해주세요.`,
      },
    ],
  });

  return result.toDataStreamResponse();
}
