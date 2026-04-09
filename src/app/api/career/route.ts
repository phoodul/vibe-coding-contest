import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { CAREER_SYSTEM_PROMPT } from "@/lib/ai/career-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // useChat이 전송한 messages에서 첫 번째 user 메시지(assessment JSON)를 추출
  const userMsg = messages?.find((m: { role: string }) => m.role === "user");
  let assessment: Record<string, string | string[]> = {};
  try {
    assessment = JSON.parse(userMsg?.content || "{}");
  } catch {
    assessment = {};
  }

  const userMessage = `다음은 학생의 프로필입니다:

- 성별: ${assessment.gender || "미입력"}
- 나이: ${assessment.age || "미입력"}
- 최종 학력: ${assessment.education || "미입력"}
- 전공: ${assessment.major || "미입력"}
- MBTI: ${assessment.mbti || "미입력"}
- 관심 분야: ${Array.isArray(assessment.interests) && assessment.interests.length > 0 ? assessment.interests.map((v: string, i: number) => `${i + 1}순위: ${v}`).join(", ") : "미입력"}
- 희망 직업: ${assessment.dreamJob || "미입력"}
- 특기 사항/수상 경력: ${assessment.achievements || "미입력"}
- 취미: ${assessment.hobbies || "미입력"}
- 적성/잘하는 것: ${assessment.aptitude || "미입력"}
- 주로 읽는 책: ${assessment.reading || "미입력"}
- 전체 성적 백분위: ${assessment.grades || "미입력"}
- 강한 과목: ${Array.isArray(assessment.strongSubjects) && assessment.strongSubjects.length > 0 ? assessment.strongSubjects.join(", ") : "미입력"}
- 운동 능력: ${assessment.sports || "미입력"}
- 음악적 재능: ${assessment.music || "미입력"}
- 미술적 재능: ${assessment.art || "미입력"}

이 학생에게 맞는 직업 15~20개를 추천해주세요. 잘 알려지지 않은 숨겨진 직업도 반드시 포함하세요.

**관심 분야 우선순위 기반 추천 구조** (관심 분야가 3개인 경우):
관심 분야에 순서(1순위, 2순위, 3순위)가 있습니다. 아래 구조로 직업을 배치해주세요:
1. 1순위 분야 중심 직업 (3~4개)
2. 1순위+2순위 융합 직업 (3~4개)
3. 1순위+2순위+3순위 융합 직업 (2~3개)
4. 1순위+3순위 융합 직업 (2~3개)
5. 2순위 분야 중심 직업 (2~3개)
6. 2순위+3순위 융합 직업 (1~2개)
7. 3순위 분야 중심 직업 (1~2개)

각 직업에 대해 직업명, 설명, 추천 이유, 관련 전공, 연봉 범위, 성장 전망을 알려주세요.
마지막에 진로 경로(현재 → 과목 선택 → 대학 전공 → 직업)도 제시해주세요.
Markdown 형식으로 보기 좋게 정리해주세요. 각 섹션 제목에 어떤 분야 조합인지 표시해주세요.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: CAREER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  return result.toDataStreamResponse();
}
