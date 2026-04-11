import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt, subject, byteLimit } = await req.json();

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `당신은 한국 학교 생활기록부 세부능력 및 특기사항(세특) 작성 전문가입니다.

## 규칙
1. NEIS EUC-KR 기준 ${byteLimit || 500}바이트 이내로 작성 (한글 1자=2바이트, 영문/숫자=1바이트)
2. 아래 금지어를 절대 포함하지 마세요:
   - 교외 수상/대회 실적
   - 부모(보호자)의 직업, 사회적 지위
   - 사교육(학원, 과외, 인강) 관련 내용
   - TOEIC, TOEFL 등 공인어학시험
   - 구체적 등수, 석차, 백분율
   - 선행학습 유발 표현 (대학교/대학원 수준)
   - 자격증 취득 사실
3. 교사의 직접 관찰 소견을 반영하는 구체적이고 개별화된 문장을 작성하세요.
4. "~을 통해 ~을 배우는 계기가 되었다" 같은 AI 특유의 상투적 표현을 피하세요.
5. 학생의 구체적 행동, 태도, 성장 과정을 서술하세요.
6. 과목: ${subject || "교과"}

## 좋은 세특 예시
"수업 중 토론 활동에서 자신의 주장을 논리적으로 전개하며 상대방 의견을 경청하는 자세가 돋보임. 특히 '기본권 제한의 한계' 주제에서 비례원칙의 4가지 요소를 실제 판례와 연결하여 분석하는 능력을 보여줌."`,
      messages: [
        {
          role: "user",
          content: `과목: ${subject || "교과"}

학생 특성/활동 키워드:
${prompt}

위 내용을 바탕으로 세부능력 및 특기사항을 작성해주세요. ${byteLimit || 500}바이트 이내로 작성하세요.`,
        },
      ],
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
