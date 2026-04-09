/**
 * 구조화 텍스트 타입 정의
 * 원본 교과서(서술형) → 암기 친화 노트(계층 트리, 명사형 종결)
 */

export interface NoteNode {
  text: string;
  children?: NoteNode[];
}

export interface StructuredNote {
  id: string; // 원본 content id와 동일 (ch1_s1_c1)
  label: string; // 원본 label 그대로
  nodes: NoteNode[];
}

export interface StructuredSection {
  id: string;
  title: string;
  summary: string;
  notes: StructuredNote[];
}

export interface StructuredChapter {
  id: string;
  number: number;
  title: string;
  sections: StructuredSection[];
}

export interface StructuredTextbook {
  subject: string;
  subjectKey: string;
  title: string;
  chapters: StructuredChapter[];
}
