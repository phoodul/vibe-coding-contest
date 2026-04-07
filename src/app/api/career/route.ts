import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { CAREER_SYSTEM_PROMPT } from "@/lib/ai/career-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { assessment } = await req.json();

  const userMessage = `다음은 학생의 프로필입니다:

- MBTI: ${assessment.mbti || "미입력"}
- 관심 분야: ${assessment.interests?.join(", ") || "미입력"}
- 취미: ${assessment.hobbies || "미입력"}
- 적성/잘하는 것: ${assessment.aptitude || "미입력"}
- 주로 읽는 책: ${assessment.reading || "미입력"}
- 성적 분포: ${assessment.grades || "미입력"}
- 운동 능력: ${assessment.sports || "미입력"}

이 학생에게 맞는 직업 15~20개를 추천해주세요. 잘 알려지지 않은 직업도 반드시 포함하세요.
각 직업에 대해 직업명, 설명, 추천 이유, 관련 전공, 연봉 범위, 성장 전망을 알려주세요.
마지막에 진로 경로(현재 → 과목 선택 → 대학 전공 → 직업)도 제시해주세요.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: CAREER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  return result.toDataStreamResponse();
}
