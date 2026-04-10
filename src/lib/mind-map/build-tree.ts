import type { Textbook } from "@/../lib/data/textbooks/ethics-index";
import type { StructuredSection, NoteNode } from "@/lib/data/textbooks/structured/ethics-structured-index";
import { ETHICS_TEXTBOOK } from "@/../lib/data/textbooks/ethics";
import { ETHICS_STRUCTURED_CH3 } from "@/lib/data/textbooks/structured/ethics-structured-ch3";

/* ── 타입 ── */

export interface MindMapNode {
  id: string;
  label: string;
  /** 교과서 원문 (leaf 노드에서 팝오버 표시용) */
  detail?: string;
  /** 깊이 (root=0) */
  depth: number;
  /** 형제 인덱스 (색상 결정) */
  siblingIndex: number;
  children: MindMapNode[];
}

/* ── 11색 시스템 ── */

export const SIBLING_COLORS = [
  { name: "빨", bg: "#ef4444", glass: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", text: "#fff" },
  { name: "노", bg: "#eab308", glass: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.4)", text: "#000" },
  { name: "초", bg: "#22c55e", glass: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", text: "#fff" },
  { name: "주", bg: "#f97316", glass: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.4)", text: "#fff" },
  { name: "파", bg: "#3b82f6", glass: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", text: "#fff" },
  { name: "보", bg: "#a855f7", glass: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.4)", text: "#fff" },
  { name: "갈", bg: "#92400e", glass: "rgba(146,64,14,0.15)", border: "rgba(146,64,14,0.4)", text: "#fff" },
  { name: "남", bg: "#1e3a5f", glass: "rgba(30,58,95,0.15)", border: "rgba(30,58,95,0.4)", text: "#fff" },
  { name: "금", bg: "#d4a017", glass: "rgba(212,160,23,0.15)", border: "rgba(212,160,23,0.4)", text: "#000" },
  { name: "은", bg: "#9ca3af", glass: "rgba(156,163,175,0.15)", border: "rgba(156,163,175,0.4)", text: "#000" },
  { name: "동", bg: "#b87333", glass: "rgba(184,115,51,0.15)", border: "rgba(184,115,51,0.4)", text: "#fff" },
] as const;

export function getNodeColor(siblingIndex: number) {
  return SIBLING_COLORS[siblingIndex % SIBLING_COLORS.length];
}

/* ── 트리 빌더 ── */

/** structured ch3 노트를 content ID → NoteNode[] 맵으로 변환 */
function buildStructuredMap(sections: StructuredSection[]): Map<string, NoteNode[]> {
  const map = new Map<string, NoteNode[]>();
  for (const sec of sections) {
    for (const note of sec.notes) {
      map.set(note.id, note.nodes);
    }
  }
  return map;
}

/** NoteNode 재귀 트리 → MindMapNode 재귀 변환 */
function noteNodesToMindMap(
  nodes: NoteNode[],
  parentId: string,
  depth: number,
): MindMapNode[] {
  return nodes.map((node, i) => {
    const id = `${parentId}_n${i}`;
    const children = node.children
      ? noteNodesToMindMap(node.children, id, depth + 1)
      : [];
    return {
      id,
      label: node.text,
      depth,
      siblingIndex: i,
      children,
    };
  });
}

export function buildMindMapTree(
  textbook: Textbook = ETHICS_TEXTBOOK,
  structuredSections: StructuredSection[] = ETHICS_STRUCTURED_CH3,
): MindMapNode {
  const structuredMap = buildStructuredMap(structuredSections);

  const root: MindMapNode = {
    id: "root",
    label: textbook.title.split("—")[0].trim(), // "생활과 윤리"
    depth: 0,
    siblingIndex: 0,
    children: textbook.chapters.map((ch, ci) => ({
      id: ch.id,
      label: `${ch.number}. ${ch.title}`,
      depth: 1,
      siblingIndex: ci,
      children: ch.sections.map((sec, si) => {
        const sectionNode: MindMapNode = {
          id: sec.id,
          label: sec.title,
          depth: 2,
          siblingIndex: si,
          children: sec.contents.map((content, cIdx) => {
            // ch3 structured 데이터가 있으면 깊은 트리로 대체
            const structuredNodes = structuredMap.get(content.id);
            if (structuredNodes && structuredNodes.length > 0) {
              return {
                id: content.id,
                label: content.label,
                detail: content.detail,
                depth: 3,
                siblingIndex: cIdx,
                children: noteNodesToMindMap(structuredNodes, content.id, 4),
              };
            }
            // flat 데이터: leaf 노드 (detail만 보유)
            return {
              id: content.id,
              label: content.label,
              detail: content.detail,
              depth: 3,
              siblingIndex: cIdx,
              children: [],
            };
          }),
        };
        return sectionNode;
      }),
    })),
  };

  return root;
}
