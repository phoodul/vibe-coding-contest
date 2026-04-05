import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { MINDMAP_SYSTEM_PROMPT } from "@/lib/ai/mindmap-prompt";
import { SUBJECTS } from "@/lib/data/curriculum";

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

export async function POST(req: Request) {
  try {
    const { subject, unitTitle, standards } = await req.json();

    const subjectLabel = SUBJECTS.find(s => s.key === subject)?.label || subject;
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: MindMapSchema,
      system: MINDMAP_SYSTEM_PROMPT,
      prompt: `과목: ${subjectLabel}
단원명: ${unitTitle}

성취기준:
${standards.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}`,
      temperature: 0.3,
    });

    return Response.json(object);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Mindmap generation error:", errorMessage);
    return Response.json(
      { error: "마인드맵 생성에 실패했습니다.", detail: errorMessage },
      { status: 500 }
    );
  }
}
