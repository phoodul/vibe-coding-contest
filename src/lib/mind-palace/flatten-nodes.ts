import type {
  NoteNode,
  StructuredNote,
  StructuredSection,
} from "@/lib/data/textbooks/structured/ethics-structured-index";

/**
 * 나레이터용 평탄화 아이템
 * 트리 구조를 depth-first로 순회하여 순차 리스트로 변환
 */
export interface FlatNarratorItem {
  id: string;
  text: string;
  keyword?: string;       // Scene object 위 키워드
  originalText?: string;  // 나레이터 읽기용 원본 텍스트
  depth: number; // 노드의 중첩 깊이 (0 = 최상위)
  noteId: string; // 소속 StructuredNote id
  sectionId: string;
  sectionTitle: string;
  noteLabel: string;
  globalIndex: number;
  hasChildren: boolean;
}

/**
 * StructuredSection[] → FlatNarratorItem[] (depth-first 순회)
 * 나레이터가 순차적으로 읽을 수 있는 flat 리스트를 생성
 */
export function flattenStructuredSections(
  sections: StructuredSection[]
): FlatNarratorItem[] {
  const items: FlatNarratorItem[] = [];

  for (const section of sections) {
    for (const note of section.notes) {
      walkNodes(note.nodes, 0, note, section, items);
    }
  }

  return items;
}

function walkNodes(
  nodes: NoteNode[],
  depth: number,
  note: StructuredNote,
  section: StructuredSection,
  items: FlatNarratorItem[]
) {
  for (const node of nodes) {
    items.push({
      id: `${note.id}_n${items.length}`,
      text: node.text,
      keyword: node.keyword,
      originalText: node.originalText,
      depth,
      noteId: note.id,
      sectionId: section.id,
      sectionTitle: section.title,
      noteLabel: note.label,
      globalIndex: items.length,
      hasChildren: !!node.children?.length,
    });
    if (node.children) {
      walkNodes(node.children, depth + 1, note, section, items);
    }
  }
}

/**
 * 특정 noteId에 해당하는 아이템들만 필터
 */
export function getItemsByNote(
  items: FlatNarratorItem[],
  noteId: string
): FlatNarratorItem[] {
  return items.filter((item) => item.noteId === noteId);
}

/**
 * 특정 sectionId에 해당하는 아이템들만 필터
 */
export function getItemsBySection(
  items: FlatNarratorItem[],
  sectionId: string
): FlatNarratorItem[] {
  return items.filter((item) => item.sectionId === sectionId);
}
