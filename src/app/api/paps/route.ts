import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { PAPS_SYSTEM_PROMPT } from "@/lib/ai/paps-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const userMsg = messages?.find((m: { role: string }) => m.role === "user");
  let input: Record<string, string> = {};
  try {
    input = JSON.parse(userMsg?.content || "{}");
  } catch {
    input = {};
  }

  const gradeLabel =
    input.grade === "middle1" ? "중1" :
    input.grade === "middle2" ? "중2" :
    input.grade === "middle3" ? "중3" :
    input.grade === "high1" ? "고1" :
    input.grade === "high2" ? "고2" :
    input.grade === "high3" ? "고3" : "미입력";

  const genderLabel = input.gender === "male" ? "남학생" : input.gender === "female" ? "여학생" : "미입력";

  const userMessage = `학생 정보: ${gradeLabel}, ${genderLabel}

PAPS 측정 결과:
- 왕복오래달리기(PACER): ${input.pacer || "미측정"}회
- 앉아윗몸앞으로굽히기: ${input.flexibility || "미측정"}cm
- 윗몸말아올리기(60초): ${input.situp || "미측정"}회
- 50m 달리기: ${input.sprint || "미측정"}초
- BMI: ${input.bmi || "미측정"}kg/m²

이 학생의 PAPS 결과를 분석하고, 맞춤 운동 프로그램을 제공해주세요.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: PAPS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  return result.toDataStreamResponse();
}
