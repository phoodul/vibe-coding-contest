import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

import { parsePdf } from "@/lib/parse-document";

export const maxDuration = 60;

/** 파일에서 텍스트 추출 */
async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);

  // TXT / MD
  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return (await file.text()).slice(0, 30000);
  }

  // HWP / HWPX
  if (name.endsWith(".hwp") || name.endsWith(".hwpx")) {
    const { parseHwp, parseHwpx } = await import("kordoc");
    const result = name.endsWith(".hwpx")
      ? await parseHwpx(ab as ArrayBuffer)
      : await parseHwp(ab as ArrayBuffer);
    if (!result.success) throw new Error("HWP 파싱 실패");
    return (result.markdown || "").slice(0, 30000);
  }

  // PDF (Upstage 우선 → pdf-parse fallback)
  if (name.endsWith(".pdf")) {
    const result = await parsePdf(buffer, name);
    return result.text;
  }

  // DOCX, PPTX, DOC, PPT (officeparser)
  if (/\.(docx?|pptx?)$/.test(name)) {
    const { OfficeParser } = await import("officeparser");
    const ast = await OfficeParser.parseOffice(buffer);
    const text = ast.toText();
    return (text || "").slice(0, 30000);
  }

  throw new Error("지원하지 않는 파일 형식입니다");
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let topic = "";
    let grade = "";
    let docContent = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      topic = (formData.get("topic") as string) || "";
      grade = (formData.get("grade") as string) || "";
      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        docContent = await extractText(file);
      }
    } else {
      const json = await req.json();
      topic = json.topic || "";
      grade = json.grade || "";
    }

    if (!topic && !docContent) {
      return new Response(JSON.stringify({ error: "주제 또는 파일이 필요합니다" }), { status: 400 });
    }

    const userContent = docContent
      ? `수업 주제: ${topic || "(업로드 자료 기반)"}\n${grade ? `대상 학년: ${grade}\n` : ""}\n--- 업로드된 수업 자료 ---\n${docContent}`
      : `수업 주제: ${topic}${grade ? `\n대상 학년: ${grade}` : ""}`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `당신은 한국의 베테랑 교사이자 교수설계 전문가입니다.
사용자가 수업 주제(또는 수업 자료)를 제공하면, 아래 4개 섹션을 한 번에 생성합니다.
업로드된 자료가 있으면 그 내용을 기반으로 생성하세요.

## 출력 형식 (반드시 이 구조를 지키세요)

===SLIDES_START===
(슬라이드 내용 — 각 슬라이드를 ---로 구분)
===SLIDES_END===

===HANDOUT_START===
(학생 배부용 워크시트 — 마크다운)
===HANDOUT_END===

===TEST_START===
(모의 테스트 — 마크다운)
===TEST_END===

===VIDEOS_START===
(주제와 대상 학년에 가장 적합한 YouTube 교육 영상 3개를 추천하세요.)
===VIDEOS_END===

## 슬라이드 규칙 (50분 수업 1시간 분량)
- **25~30장** 분량, **총 8,000자 이상** (절대 15장 이하로 만들지 마세요)
- 슬라이드 1장당 최소 200~300자의 상세 설명을 포함하세요
- 슬라이드 사이는 ---로 구분

### 각 슬라이드 구조:
# 슬라이드 제목
> 💡 핵심 메시지 (한 문장 요약)

**[설명]** 본문 내용을 2~3 문단으로 상세히 작성. 단순 나열이 아니라 이야기하듯 설명.

**[핵심 포인트]**
- ✅ 포인트 1: 구체적 설명
- ✅ 포인트 2: 구체적 설명
- ✅ 포인트 3: 구체적 설명

**[예시/사례]** 실제 사례, 비유, 일상 예시를 반드시 포함
**[생각해보기]** 🤔 학생에게 던질 질문 1개

### 필수 슬라이드 구성:
1. **표지**: 수업 제목 + 학습 목표 3가지 + 대상 학년
2. **도입 (동기유발)**: 흥미로운 질문이나 실생활 사례로 시작
3. **배경/맥락**: 이 주제가 왜 중요한지, 역사적·사회적 배경
4~8. **핵심 내용**: 주요 개념을 하나씩 깊이 있게 설명 (각 슬라이드에 예시 필수)
9. **비교/대조**: 관련 개념과의 비교 (표 형태 권장)
10. **현대적 의의**: 오늘날에 어떻게 적용되는지
11. **토론 주제**: 학생들이 논의할 수 있는 질문 2~3개
12. **핵심 정리**: 배운 내용 요약 + 키워드 정리
13. **형성평가**: 빠른 이해도 확인 퀴즈 2~3문제
14. **다음 수업 예고**: 이어질 내용과의 연결

## 워크시트 규칙 (실제 수업에서 바로 사용 가능하도록)
- A4 2장 분량
- **학습 목표** (3가지)
- **핵심 개념 정리** — 빈칸 채우기 형태 (5~8개)
- **개념 관계도** — 주요 개념 간 관계를 화살표로 정리하는 빈칸
- **활동 1: 자료 분석** — 짧은 지문/인용문 제시 + 분석 질문
- **활동 2: 적용 문제** — 실생활에 적용하는 서술형 질문
- **활동 3: 토론 준비** — 찬반 논쟁 주제 + 자기 입장 정리칸
- **자기 평가** — 이해도 체크 (😊 잘 이해함 / 😐 보통 / 😢 복습 필요)

## 모의 테스트 규칙
- 객관식 7문항 + 서술형 3문항 = 총 10문항
- 난이도 배분: 하(3) + 중(4) + 상(3)
- 각 문항 뒤에 (정답: ...) + 해설 1줄 포함
- 서술형은 모범답안 예시 포함

## 영상 섹션 규칙 (매우 중요)
- 반드시 YouTube 동영상 3개를 추천하세요. 절대 "영상을 찾지 못했습니다"라고 하지 마세요.
- 검색 결과에 적절한 유튜브 영상이 있으면 그것을 사용하세요.
- 검색 결과가 부적절하거나 없으면, 당신이 알고 있는 해당 주제의 교육용 YouTube 영상을 직접 추천하세요.
- 형식: 번호. [영상 제목](https://youtube.com/watch?v=...) 으로 작성하세요.`,
      messages: [{ role: "user", content: userContent }],
    });

    return result.toDataStreamResponse();
  } catch (e) {
    console.error("lesson-prep error:", e);
    return new Response(JSON.stringify({ error: "생성 중 오류가 발생했습니다." }), { status: 500 });
  }
}
