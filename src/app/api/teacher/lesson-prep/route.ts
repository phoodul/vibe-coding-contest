import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { searchWeb } from "@/lib/search";
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

    // 영상 검색 (Tavily) — 주제 기반
    const searchQuery = topic || docContent.slice(0, 200);
    const videoSearch = await searchWeb(`${searchQuery} 수업 교육 영상 site:youtube.com`);
    const videos = videoSearch.results
      .filter((r) => r.url.includes("youtube.com") || r.url.includes("youtu.be"))
      .slice(0, 3)
      .map((r) => ({ title: r.title, url: r.url }));
    if (videos.length < 3) {
      for (const r of videoSearch.results) {
        if (videos.length >= 3) break;
        if (!videos.find((v) => v.url === r.url)) {
          videos.push({ title: r.title, url: r.url });
        }
      }
    }

    const videoSection = videos.length > 0
      ? videos.map((v, i) => `${i + 1}. [${v.title}](${v.url})`).join("\n")
      : "관련 영상을 찾지 못했습니다.";

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
${videoSection}
===VIDEOS_END===

## 슬라이드 규칙
- 6~10장 분량
- 각 슬라이드: # 제목 + 핵심 내용 (글머리 기호 3~5개)
- 첫 슬라이드: 수업 제목 + 학습 목표
- 마지막 슬라이드: 핵심 정리 + 다음 시간 예고
- 슬라이드 사이는 ---로 구분

## 워크시트 규칙
- A4 1장 분량
- 학습 목표, 핵심 개념 정리 빈칸, 활동 문제 2~3개 포함
- 학생이 수업 중 직접 작성할 수 있는 형태

## 모의 테스트 규칙
- 객관식 5문항 + 서술형 2문항
- 각 문항 뒤에 (정답: ...) 형태로 정답 포함
- 난이도: 중

## 영상 섹션 규칙
- 위에 제공된 검색 결과를 그대로 출력하세요
- 검색 결과가 없으면 "관련 영상을 찾지 못했습니다."로 출력`,
      messages: [{ role: "user", content: userContent }],
    });

    return result.toDataStreamResponse();
  } catch (e) {
    console.error("lesson-prep error:", e);
    return new Response(JSON.stringify({ error: "생성 중 오류가 발생했습니다." }), { status: 500 });
  }
}
