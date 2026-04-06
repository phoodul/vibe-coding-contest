import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { PALACE_SYSTEM_PROMPT } from "@/lib/ai/palace-prompt";

const SubPlacementSchema = z.object({
  conceptId: z.string(),
  conceptLabel: z.string(),
  position: z.string(),
  story: z.string(),
});

const HierarchicalPlacementSchema = z.array(
  z.object({
    topicId: z.string(),
    topicLabel: z.string(),
    zoneId: z.string(),
    zoneName: z.string(),
    subPlacements: z.array(SubPlacementSchema),
  })
);

export async function POST(req: Request) {
  try {
    const { topics, locationName, zones } = await req.json();

    // Build detailed prompt with topic hierarchy
    const topicDesc = topics
      .map(
        (t: {
          id: string;
          label: string;
          description: string;
          subNodes?: { id: string; label: string; detail: string }[];
        }, i: number) => {
          let desc = `\n### 대주제 ${i + 1}: "${t.label}" (id: ${t.id})\n설명: ${t.description}`;
          if (t.subNodes && t.subNodes.length > 0) {
            desc += `\n하위 개념:`;
            t.subNodes.forEach((sub) => {
              desc += `\n  - "${sub.label}" (id: ${sub.id}): ${sub.detail}`;
            });
          }
          return desc;
        }
      )
      .join("\n");

    const zoneDesc = zones
      .map((z: { id: string; name: string; description: string }) =>
        `- ${z.name} (id: ${z.id}): ${z.description}`
      )
      .join("\n");

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: HierarchicalPlacementSchema,
      system: PALACE_SYSTEM_PROMPT,
      prompt: `기억의 궁전 장소: ${locationName}

사용 가능한 구역:
${zoneDesc}

배치할 학습 내용:
${topicDesc}

## 지시
1. 각 대주제를 하나의 구역에 배정하세요.
2. 각 대주제의 하위 개념들을 해당 구역 내의 구체적 위치(기둥, 천장, 바닥, 벽, 소품 등)에 배치하세요.
3. 관련된 하위 개념은 공간적으로 가까운 위치에 배치하세요.
4. 각 배치에 대해 핵심 학습 내용이 포함된 기억 스토리를 작성하세요.`,
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
