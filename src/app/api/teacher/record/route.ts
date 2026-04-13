import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { pseudonymize, type NameMapping } from "@/lib/data/neis-rules";

export const maxDuration = 30;

const AREA_PROMPTS: Record<string, string> = {
  subject_specific: `당신은 한국 학교 생활기록부 '과목별 세부능력 및 특기사항' 작성 전문가입니다.
교과 수업에서 직접 관찰한 학생의 구체적 행동, 태도, 성장 과정을 서술하세요.
"~을 통해 ~을 배우는 계기가 되었다" 같은 상투적 표현을 피하세요.`,

  individual_specific: `당신은 한국 학교 생활기록부 '개인별 세부능력 및 특기사항' 작성 전문가입니다.
교과 전반에 걸친 학생의 개별 학습 특성, 강점, 성장을 종합적으로 서술하세요.`,

  behavior: `당신은 한국 학교 생활기록부 '행동특성 및 종합의견' 작성 전문가입니다.
학생의 인성, 대인관계, 자기관리, 리더십, 협동심, 사회성 등 행동 특성을 구체적 사례와 함께 종합 서술하세요.
교사의 총평이므로 긍정적이면서도 객관적인 어조를 유지하세요.`,

  autonomous: `당신은 한국 학교 생활기록부 '자율·자치활동 특기사항' 작성 전문가입니다.
학생회, 자치법정, 학급자치, 적응활동 등 학생의 자율·자치 참여 내용과 역할을 구체적으로 서술하세요.`,

  club: `당신은 한국 학교 생활기록부 '동아리활동 특기사항' 작성 전문가입니다.
정규/자율 동아리에서의 구체적 활동 내용, 맡은 역할, 성장 과정을 서술하세요.`,

  career: `당신은 한국 학교 생활기록부 '진로활동 특기사항' 작성 전문가입니다.
진로 탐색, 직업 체험, 진로 상담, 관심 분야 탐구 등 진로 관련 활동과 그 과정에서의 변화를 서술하세요.`,

  reading_common: `당신은 한국 학교 생활기록부 '독서활동상황(공통)' 작성 전문가입니다.
학생이 읽은 도서명과 독서를 통해 관찰된 사고의 확장, 관심 분야 심화 등을 서술하세요.`,

  reading_subject: `당신은 한국 학교 생활기록부 '독서활동상황(과목별)' 작성 전문가입니다.
해당 교과 관련 도서의 독서 활동과 교과 학습과의 연계를 서술하세요.`,

  attendance: `당신은 한국 학교 생활기록부 '출결상황 특기사항' 작성 전문가입니다.
출결 관련 특이사항을 사실에 기반하여 간결하게 서술하세요.`,

  daily_life: `당신은 한국 학교 생활기록부 '일상생활 활동상황 특기사항' 작성 전문가입니다.
일상생활에서 관찰된 학생의 특성, 습관, 태도 등을 구체적으로 서술하세요.`,
};

const COMMON_RULES = `
## 공통 규칙
1. 아래 금지어를 절대 포함하지 마세요:
   - 교외 수상/대회 실적
   - 부모(보호자)의 직업, 사회적 지위
   - 사교육(학원, 과외, 인강) 관련 내용
   - TOEIC, TOEFL 등 공인어학시험
   - 구체적 등수, 석차, 백분율
   - 선행학습 유발 표현 (대학교/대학원 수준)
   - 자격증 취득 사실
2. 교사의 직접 관찰 소견을 반영하는 구체적이고 개별화된 문장을 작성하세요.
3. 사실에 기반한 관찰 내용을 서술하세요. 과장하지 마세요.
4. 가명(학생A, 학생B 등)이 포함된 경우 그대로 유지하세요.`;

export async function POST(req: Request) {
  try {
    const { prompt, subject, byteLimit, areaId, nameMap, image } = await req.json();

    const areaPrompt = AREA_PROMPTS[areaId] || AREA_PROMPTS.subject_specific;
    const limit = byteLimit || 1500;

    // 가명처리
    const mappings: NameMapping[] = nameMap || [];
    const pseudonymizedPrompt = mappings.length > 0 ? pseudonymize(prompt, mappings) : prompt;

    const textContent = `${subject ? `과목: ${subject}\n\n` : ""}학생 특성/활동 키워드:\n${pseudonymizedPrompt}\n\n위 내용을 바탕으로 작성해주세요. ${limit}바이트 이내로 작성하세요.`;

    // 이미지가 있으면 multipart content
    const userContent: any[] = [];
    if (image) {
      userContent.push({ type: "image", image });
    }
    userContent.push({ type: "text", text: textContent });

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      temperature: 0.3, // 사실 기반 + 장점 부각, 허위/과장 방지
      system: `${areaPrompt}
${COMMON_RULES}
5. NEIS UTF-8 기준 ${limit}바이트 이내로 작성 (한글 1자=3바이트, 영문/숫자=1바이트)
6. 한글 기준 약 ${Math.floor(limit / 3)}자 이내
${subject ? `7. 과목: ${subject}` : ""}
${image ? "8. 첨부된 이미지(관찰 기록, 메모, 스크린샷)를 참고하여 내용에 반영하세요." : ""}`,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
