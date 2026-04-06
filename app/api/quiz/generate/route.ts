import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const QuizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctIndex: z.number().min(0).max(3),
      explanation: z.string(),
    })
  ),
});

const QUIZ_PROMPT = `너는 한국 고등학교 시험 출제 전문가다.

## 지시
제공된 학습 내용을 바탕으로 4지선다형 문제를 생성한다.

## 규칙
- 문제는 단순 암기가 아닌 이해와 적용을 평가
- 선지는 그럴듯하되 명확하게 구분 가능
- 오답 선지도 교과서에 나올 법한 내용으로 구성
- explanation은 정답 이유를 2~3문장으로 설명
- 난이도: 중상 (내신/수능 수준)`;

export async function POST(req: Request) {
  try {
    const { concepts, unitTitle, count = 5 } = await req.json();

    const conceptText = concepts
      .map((c: { label: string; story: string }) => `- ${c.label}: ${c.story}`)
      .join("\n");

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: QuizSchema,
      system: QUIZ_PROMPT,
      prompt: `단원: ${unitTitle}

학습한 개념들:
${conceptText}

위 내용을 바탕으로 ${count}개의 4지선다형 문제를 만들어줘.`,
      temperature: 0.5,
    });

    return Response.json(object);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Quiz generation error:", msg);
    return Response.json({ error: "퀴즈 생성에 실패했습니다.", detail: msg }, { status: 500 });
  }
}
