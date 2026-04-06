import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const SubNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string(),
});

const MindMapNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  subNodes: z.array(SubNodeSchema).optional(),
});

const MindMapSchema = z.object({
  centerNode: z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
  }),
  childNodes: z.array(MindMapNodeSchema),
});

const PDF_MINDMAP_PROMPT = `너는 교과서 PDF를 분석하여 마인드맵을 생성하는 교육 전문가다.

## 핵심 지시
업로드된 PDF 문서의 내용을 분석하여, 학습에 최적화된 마인드맵 구조를 생성한다.

## 구조 원칙
- centerNode: 문서의 대주제/단원명
- childNodes: 주요 소주제/절(3~6개)
- subNodes: 각 소주제의 핵심 개념(2~4개)
  - detail에는 시험에 나올 핵심 내용을 2~3문장으로 상세 서술

## 규칙
- PDF 본문에 있는 내용만 포함 (추가 창작 금지)
- 핵심 정의, 비교, 예시를 우선 추출
- 사상가/이론이 나오면 반드시 포함`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File;
    if (!file) {
      return Response.json({ error: "PDF 파일이 필요합니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: MindMapSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PDF_MINDMAP_PROMPT },
            {
              type: "file",
              data: base64,
              mediaType: "application/pdf",
            },
            { type: "text", text: "이 PDF의 내용을 분석하여 마인드맵을 생성해줘." },
          ],
        },
      ],
      temperature: 0.3,
    });

    return Response.json(object);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("PDF mindmap generation error:", errorMessage);
    return Response.json(
      { error: "PDF 마인드맵 생성에 실패했습니다.", detail: errorMessage },
      { status: 500 }
    );
  }
}
