import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { MINDMAP_SYSTEM_PROMPT } from "@/lib/ai/mindmap-prompt";

const MindMapNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
});

const MindMapSchema = z.object({
  centerNode: MindMapNodeSchema,
  childNodes: z.array(MindMapNodeSchema),
});

export async function POST(req: Request) {
  try {
    const { subject, unitTitle, standards } = await req.json();

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250514"),
      schema: MindMapSchema,
      system: MINDMAP_SYSTEM_PROMPT,
      prompt: `과목: ${subject}\n단원: ${unitTitle}\n성취기준:\n${standards.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Mindmap generation error:", error);
    return Response.json(
      { error: "마인드맵 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
