import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { PALACE_SYSTEM_PROMPT } from "@/lib/ai/palace-prompt";

const StorySchema = z.array(
  z.object({
    nodeId: z.string(),
    zoneId: z.string(),
    story: z.string(),
  })
);

export async function POST(req: Request) {
  try {
    const { placements, locationName, nodes } = await req.json();

    const placementDesc = placements
      .map(
        (p: { nodeLabel: string; zoneName: string; nodeId: string; zoneId: string; nodeDescription?: string; subNodes?: { label: string; detail: string }[] }) => {
          let desc = `- 개념 "${p.nodeLabel}" (id: ${p.nodeId}) → 장소 "${p.zoneName}" (id: ${p.zoneId})`;
          if (p.nodeDescription) desc += `\n  설명: ${p.nodeDescription}`;
          if (p.subNodes && p.subNodes.length > 0) {
            desc += `\n  세부 내용:`;
            p.subNodes.forEach((sub) => {
              desc += `\n    - ${sub.label}: ${sub.detail}`;
            });
          }
          return desc;
        }
      )
      .join("\n");

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: StorySchema,
      system: PALACE_SYSTEM_PROMPT,
      prompt: `기억의 궁전 장소: ${locationName}\n\n배치된 개념-장소 연결:\n${placementDesc}\n\n각 연결에 대해, 세부 학습 내용(정의, 과정, 예시 등)이 상세히 포함된 기억 스토리를 만들어주세요.`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Palace connect error:", error);
    return Response.json(
      { error: "기억 연결 스토리 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
