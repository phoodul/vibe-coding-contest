import type { Textbook } from "@/lib/data/textbooks/ethics-index";
import type { StructuredSection, NoteNode } from "@/lib/data/textbooks/structured/ethics-structured-index";
import { ETHICS_TEXTBOOK } from "@/lib/data/textbooks/ethics";
import { BIOLOGY_TEXTBOOK } from "@/lib/data/textbooks/biology";
import { KOREAN_TEXTBOOK } from "@/lib/data/textbooks/korean";
import { ETHICS_STRUCTURED_CH1 } from "@/lib/data/textbooks/structured/ethics-structured-ch1";
import { ETHICS_STRUCTURED_CH2 } from "@/lib/data/textbooks/structured/ethics-structured-ch2";
import { ETHICS_STRUCTURED_CH3 } from "@/lib/data/textbooks/structured/ethics-structured-ch3";
import { ETHICS_STRUCTURED_CH4 } from "@/lib/data/textbooks/structured/ethics-structured-ch4";
import { ETHICS_STRUCTURED_CH5 } from "@/lib/data/textbooks/structured/ethics-structured-ch5";
import { ETHICS_STRUCTURED_CH6 } from "@/lib/data/textbooks/structured/ethics-structured-ch6";
import { BIOLOGY_STRUCTURED_CH1 } from "@/lib/data/textbooks/structured/biology-structured-ch1";
import { BIOLOGY_STRUCTURED_CH2 } from "@/lib/data/textbooks/structured/biology-structured-ch2";
import { BIOLOGY_STRUCTURED_CH3 } from "@/lib/data/textbooks/structured/biology-structured-ch3";
import { BIOLOGY_STRUCTURED_CH4 } from "@/lib/data/textbooks/structured/biology-structured-ch4";
import { BIOLOGY_STRUCTURED_CH5 } from "@/lib/data/textbooks/structured/biology-structured-ch5";
import { KOREAN_STRUCTURED_CH1 } from "@/lib/data/textbooks/structured/korean-structured-ch1";
import { KOREAN_STRUCTURED_CH2 } from "@/lib/data/textbooks/structured/korean-structured-ch2";
import { KOREAN_STRUCTURED_CH3 } from "@/lib/data/textbooks/structured/korean-structured-ch3";
import { KOREAN_STRUCTURED_CH4 } from "@/lib/data/textbooks/structured/korean-structured-ch4";
import { KOREAN_STRUCTURED_CH5 } from "@/lib/data/textbooks/structured/korean-structured-ch5";

const ETHICS_STRUCTURED: StructuredSection[] = [
  ...ETHICS_STRUCTURED_CH1,
  ...ETHICS_STRUCTURED_CH2,
  ...ETHICS_STRUCTURED_CH3,
  ...ETHICS_STRUCTURED_CH4,
  ...ETHICS_STRUCTURED_CH5,
  ...ETHICS_STRUCTURED_CH6,
];

const BIOLOGY_STRUCTURED: StructuredSection[] = [
  ...BIOLOGY_STRUCTURED_CH1,
  ...BIOLOGY_STRUCTURED_CH2,
  ...BIOLOGY_STRUCTURED_CH3,
  ...BIOLOGY_STRUCTURED_CH4,
  ...BIOLOGY_STRUCTURED_CH5,
];

const KOREAN_STRUCTURED: StructuredSection[] = [
  ...KOREAN_STRUCTURED_CH1,
  ...KOREAN_STRUCTURED_CH2,
  ...KOREAN_STRUCTURED_CH3,
  ...KOREAN_STRUCTURED_CH4,
  ...KOREAN_STRUCTURED_CH5,
];

export type SubjectKey = "ethics" | "biology" | "korean";

const SUBJECT_DATA: Record<SubjectKey, { textbook: Textbook; structured: StructuredSection[] }> = {
  ethics: { textbook: ETHICS_TEXTBOOK, structured: ETHICS_STRUCTURED },
  biology: { textbook: BIOLOGY_TEXTBOOK, structured: BIOLOGY_STRUCTURED },
  korean: { textbook: KOREAN_TEXTBOOK, structured: KOREAN_STRUCTURED },
};

/* ── 타입 ── */

export interface MindMapNode {
  id: string;
  label: string;
  detail?: string;
  depth: number;
  siblingIndex: number;
  children: MindMapNode[];
}

/* ── 11색 시스템 ── */

export const SIBLING_COLORS = [
  { name: "분홍", bg: "#ec4899", solid: "rgba(236,72,153,0.85)", border: "rgba(236,72,153,0.6)", text: "#fff" },
  { name: "파랑", bg: "#3b82f6", solid: "rgba(59,130,246,0.85)", border: "rgba(59,130,246,0.6)", text: "#fff" },
  { name: "주황", bg: "#f97316", solid: "rgba(249,115,22,0.85)", border: "rgba(249,115,22,0.6)", text: "#fff" },
  { name: "초록", bg: "#22c55e", solid: "rgba(34,197,94,0.85)", border: "rgba(34,197,94,0.6)", text: "#fff" },
  { name: "보라", bg: "#a855f7", solid: "rgba(168,85,247,0.85)", border: "rgba(168,85,247,0.6)", text: "#fff" },
  { name: "노랑", bg: "#eab308", solid: "rgba(234,179,8,0.85)", border: "rgba(234,179,8,0.6)", text: "#fff" },
  { name: "남색", bg: "#6366f1", solid: "rgba(99,102,241,0.85)", border: "rgba(99,102,241,0.6)", text: "#fff" },
  { name: "갈색", bg: "#78350f", solid: "rgba(120,53,15,0.85)", border: "rgba(120,53,15,0.6)", text: "#fff" },
  { name: "청록", bg: "#14b8a6", solid: "rgba(20,184,166,0.85)", border: "rgba(20,184,166,0.6)", text: "#fff" },
  { name: "금", bg: "#ca8a04", solid: "rgba(202,138,4,0.85)", border: "rgba(202,138,4,0.6)", text: "#fff" },
  { name: "은", bg: "#64748b", solid: "rgba(100,116,139,0.85)", border: "rgba(100,116,139,0.6)", text: "#fff" },
  { name: "동", bg: "#b87333", solid: "rgba(184,115,51,0.85)", border: "rgba(184,115,51,0.6)", text: "#fff" },
] as const;

export function getNodeColor(siblingIndex: number) {
  return SIBLING_COLORS[siblingIndex % SIBLING_COLORS.length];
}

/* ── detail 텍스트 → 트리 자동 파싱 ── */

/**
 * "의의: ① X ② Y ③ Z 한계: ① A ② B ③ C" 형태의 detail 텍스트를
 * 토픽 → 번호 항목 트리로 변환한다.
 */
function parseDetailToTree(
  detail: string,
  parentId: string,
  baseDepth: number,
): MindMapNode[] {
  // 원형 번호(①②③...)가 없으면 구조 없음
  if (!/[①②③④⑤⑥⑦⑧⑨⑩]/.test(detail)) return [];

  // 토픽 레이블 찾기: 한글 단어 + ":" + 바로 뒤에 ①
  const topicRegex = /([가-힣]+(?:\s[가-힣]+)*)\s*[:：]\s*(?=[①②③④⑤⑥⑦⑧⑨⑩])/g;
  const matches = [...detail.matchAll(topicRegex)];

  if (matches.length >= 2) {
    // 토픽 기반 분할 (의의/한계 패턴)
    return matches.map((tm, tIdx) => {
      const label = tm[1];
      const start = tm.index! + tm[0].length;
      const end =
        tIdx + 1 < matches.length ? matches[tIdx + 1].index! : detail.length;
      const content = detail.slice(start, end).trim();
      const bullets = splitBullets(content);

      return {
        id: `${parentId}_t${tIdx}`,
        label,
        depth: baseDepth,
        siblingIndex: tIdx,
        children: bullets.map((b, bIdx) => ({
          id: `${parentId}_t${tIdx}_b${bIdx}`,
          label: b,
          depth: baseDepth + 1,
          siblingIndex: bIdx,
          children: [],
        })),
      };
    });
  }

  // 토픽 없이 번호만 있으면 flat 리스트
  const flat = splitBullets(detail);
  if (flat.length >= 2) {
    return flat.map((b, i) => ({
      id: `${parentId}_b${i}`,
      label: b,
      depth: baseDepth,
      siblingIndex: i,
      children: [],
    }));
  }

  return [];
}

function splitBullets(text: string): string[] {
  return text
    .split(/[①②③④⑤⑥⑦⑧⑨⑩]\s*/)
    .map((s) => s.replace(/[.。]\s*$/, "").trim())
    .filter((s) => s.length > 0);
}

/* ── structured NoteNode → MindMapNode ── */

function buildStructuredMap(
  sections: StructuredSection[],
): Map<string, NoteNode[]> {
  const map = new Map<string, NoteNode[]>();
  for (const sec of sections) {
    for (const note of sec.notes) {
      map.set(note.id, note.nodes);
    }
  }
  return map;
}

function noteNodesToMindMap(
  nodes: NoteNode[],
  parentId: string,
  depth: number,
): MindMapNode[] {
  return nodes.map((node, i) => ({
    id: `${parentId}_n${i}`,
    label: node.text,
    depth,
    siblingIndex: i,
    children: node.children
      ? noteNodesToMindMap(node.children, `${parentId}_n${i}`, depth + 1)
      : [],
  }));
}

/* ── 메인 빌더 ── */

export function buildMindMapTree(
  subject: SubjectKey = "ethics",
): MindMapNode {
  const { textbook, structured: structuredSections } = SUBJECT_DATA[subject];
  const structuredMap = buildStructuredMap(structuredSections);

  return {
    id: "root",
    label: textbook.title.split("—")[0].trim(),
    depth: 0,
    siblingIndex: 0,
    children: textbook.chapters.map((ch, ci) => ({
      id: ch.id,
      label: `${ch.number}. ${ch.title}`,
      depth: 1,
      siblingIndex: ci,
      children: ch.sections.map((sec, si) => ({
        id: sec.id,
        label: sec.title,
        depth: 2,
        siblingIndex: si,
        children: sec.contents.map((content, cIdx) => {
          // 1) ch3 structured 데이터가 있으면 그것 사용
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
          // 2) detail 텍스트 자동 파싱 시도
          const parsed = content.detail
            ? parseDetailToTree(content.detail, content.id, 4)
            : [];
          return {
            id: content.id,
            label: content.label,
            detail: parsed.length === 0 ? content.detail : undefined,
            depth: 3,
            siblingIndex: cIdx,
            children: parsed,
          };
        }),
      })),
    })),
  };
}

/* ── 트리 헬퍼 ── */

export function findNode(
  node: MindMapNode,
  id: string,
): MindMapNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function getAncestors(
  root: MindMapNode,
  targetId: string,
): MindMapNode[] {
  const path: MindMapNode[] = [];
  function dfs(node: MindMapNode): boolean {
    if (node.id === targetId) return true;
    for (const child of node.children) {
      if (dfs(child)) {
        path.unshift(node);
        return true;
      }
    }
    return false;
  }
  dfs(root);
  return path;
}
