import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { ZONE_EXPANSION_PROMPT } from "@/lib/ai/palace-prompt";

const SubLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  direction: z.enum(["위", "아래", "안", "옆", "인물"]),
});

const ExpandedZoneSchema = z.object({
  expandedZones: z.array(
    z.object({
      parentZoneId: z.string(),
      subLocations: z.array(SubLocationSchema),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const { locationName, zones, nodeCount } = await req.json();

    const zoneCount = zones.length;
    const extraNeeded = nodeCount - zoneCount;

    if (extraNeeded <= 0) {
      return Response.json({ expandedZones: [] });
    }

    const zoneDesc = zones
      .map((z: { id: string; name: string; description: string }) =>
        `- ${z.name} (id: ${z.id}): ${z.description}`
      )
      .join("\n");

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5"),
      schema: ExpandedZoneSchema,
      system: ZONE_EXPANSION_PROMPT,
      prompt: `장소: ${locationName}
기존 구역:
${zoneDesc}

현재 구역 수: ${zoneCount}
필요한 총 배치 수: ${nodeCount}
추가로 필요한 위치 수: ${extraNeeded}

각 기존 구역에 소품/세부위치를 추가하여 총 ${nodeCount}개의 배치 위치를 확보해주세요.
고르게 분배하되, 구역의 특성에 맞는 소품을 선택해주세요.`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Zone expansion error:", error);
    return Response.json(
      { error: "구역 확장에 실패했습니다." },
      { status: 500 }
    );
  }
}
