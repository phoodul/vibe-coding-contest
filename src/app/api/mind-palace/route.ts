import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const OBJECT_TYPES = [
  "painting",
  "book",
  "scroll",
  "globe",
  "clock",
  "scale",
  "plant",
  "lamp",
  "trophy",
  "notebook",
  "gavel",
  "shield",
  "flag",
  "phone",
  "poster",
  "nameplate",
  "blackboard",
  "handcuffs",
  "magnifier",
  "stone",
  "chart",
  "sign",
  "portrait",
  "certificate",
  "lawbook",
] as const;

const ObjectPartSchema = z.object({
  id: z.string().describe("고유 ID, 예: mengzi_left"),
  keyword: z.string().describe("작은 글씨 키워드, 3-5자"),
  text: z.string().describe("structured_text 내용"),
  flatIndex: z.number().describe("flattenStructuredSections의 globalIndex"),
});

const SceneObjectSchema = z.object({
  id: z.string().describe("고유 ID, 예: obj_mengzi"),
  type: z.enum(OBJECT_TYPES).describe("오브젝트 타입"),
  x: z
    .number()
    .min(30)
    .max(1150)
    .describe("SVG viewBox(1200x700) 내 x좌표"),
  y: z
    .number()
    .min(30)
    .max(650)
    .describe("SVG viewBox(1200x700) 내 y좌표"),
  scale: z.number().min(0.6).max(1.5).optional().describe("크기 배율"),
  keyword: z.string().describe("오브젝트 대표 키워드"),
  label: z.string().describe("오브젝트 설명 라벨"),
  noteId: z.string().describe("소속 StructuredNote id"),
  parts: z
    .array(ObjectPartSchema)
    .min(1)
    .describe("1+ 파트, 각 leaf NoteNode 1개"),
});

const RoomSceneConfigSchema = z.object({
  roomId: z.string(),
  sectionId: z.string(),
  title: z.string(),
  background: z.enum(["classroom", "library", "courtroom", "office"]),
  objects: z
    .array(SceneObjectSchema)
    .min(3)
    .max(30)
    .describe("방 안의 오브젝트 목록"),
  walkPath: z
    .array(z.string())
    .describe("오브젝트 ID 순서 — 시계 방향 탐색 경로"),
});

const SYSTEM_PROMPT = `당신은 "기억의 궁전(Method of Loci)" 전문가이자 교육 콘텐츠 디자이너입니다.
학습 내용을 방 안의 사물(오브젝트)에 매핑하여 기억의 궁전 Scene을 설계합니다.

## 핵심 원칙
1. **1 leaf NoteNode = 1 ObjectPart**: 모든 최하위 텍스트가 정확히 하나의 파트에 매핑됨
2. **자연스러운 배치**: 오브젝트는 방 안에 자연스럽게 배치 (벽면, 책상, 바닥 등)
3. **시계 방향 walkPath**: 북쪽 벽 → 동쪽 벽 → 남쪽/바닥 → 서쪽 벽
4. **다양한 오브젝트 타입**: 같은 타입 반복 최소화, 내용과 어울리는 타입 선택
5. **겹치지 않는 좌표**: 오브젝트 간 최소 80px 간격

## SVG viewBox: 1200 x 700
- 북쪽 벽: y=20~200 (칠판, 액자, 초상화 등)
- 서쪽 벽: x=20~200, y=200~400
- 동쪽 벽: x=880~1150, y=100~400
- 중앙/책상: x=300~700, y=350~500
- 남쪽/입구: y=500~650

## 오브젝트-내용 매칭 가이드
- 사상가/인물 → portrait, painting
- 법/제도 → lawbook, gavel, certificate
- 개념/이론 → book, scroll, blackboard
- 데이터/통계 → chart, globe
- 경고/위험 → sign, shield
- 현대/기술 → phone, poster
- 윤리/도덕 → scale (저울), stone (비석)
- 기록/메모 → notebook, nameplate`;

export async function POST(req: Request) {
  const { sections, roomId, sectionId, background } = await req.json();

  if (!sections || !roomId || !sectionId) {
    return Response.json(
      { error: "sections, roomId, sectionId are required" },
      { status: 400 }
    );
  }

  // sections: StructuredSection[] (해당 방에 해당하는 section들)
  const sectionSummary = JSON.stringify(sections, null, 2);

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: RoomSceneConfigSchema,
    system: SYSTEM_PROMPT,
    prompt: `다음 structured_text 데이터를 기억의 궁전 Scene으로 변환하세요.

roomId: "${roomId}"
sectionId: "${sectionId}"
background: "${background || "classroom"}"

## Structured Sections 데이터:
${sectionSummary}

## 중요 규칙:
- flatIndex는 depth-first 순회 순서대로 0부터 시작합니다
- 모든 leaf NoteNode(children이 없는 노드)는 정확히 하나의 ObjectPart에 매핑되어야 합니다
- branch NoteNode(children이 있는 노드)도 ObjectPart에 매핑할 수 있습니다
- keyword는 3~5자 이내의 핵심 키워드여야 합니다
- 같은 note의 파트들은 하나의 오브젝트에 그룹핑하세요
- walkPath는 모든 오브젝트 ID를 시계 방향 순서로 나열하세요`,
  });

  return Response.json(object);
}
