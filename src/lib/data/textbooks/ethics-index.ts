/**
 * 생활과 윤리 교과서 전체 목차 및 구조
 * 2022 개정 교육과정 기반 — 교과서 수준 상세 내용
 *
 * 구조: 대단원(6개) → 중단원 → 소단원 → 핵심 내용
 * 각 소단원에는 시험 대비에 필요한 모든 내용이 포함됨
 */

export interface TextbookContent {
  id: string;
  label: string;
  detail: string; // 교과서 수준 상세 설명 (시험 대비)
}

export interface TextbookSection {
  id: string;
  title: string;
  summary: string;
  contents: TextbookContent[];
}

export interface TextbookChapter {
  id: string;
  number: number;
  title: string;
  overview: string;
  sections: TextbookSection[];
}

export interface Textbook {
  subject: string;
  subjectKey: string;
  title: string;
  chapters: TextbookChapter[];
}

export const ETHICS_CHAPTERS: TextbookChapter[] = [
  {
    id: "ch1",
    number: 1,
    title: "현대 생활과 실천 윤리",
    overview: "윤리학의 기본 개념과 현대 사회에서 실천 윤리가 필요한 이유를 학습하고, 다양한 윤리적 접근 방법(의무론, 공리주의, 덕 윤리, 배려 윤리, 담론 윤리)을 이해한다.",
    sections: [], // ethics-ch1.ts에서 import
  },
  {
    id: "ch2",
    number: 2,
    title: "생명과 윤리",
    overview: "출생에서 죽음까지 생명의 전 과정에서 발생하는 윤리적 쟁점(낙태, 안락사, 뇌사, 장기이식)과 생명 과학 기술(유전공학, 동물 실험)의 윤리적 문제를 탐구한다.",
    sections: [],
  },
  {
    id: "ch3",
    number: 3,
    title: "사회와 윤리",
    overview: "직업윤리, 사회 정의(분배적 정의, 교정적 정의), 국가와 시민의 관계에서 발생하는 윤리적 문제를 다양한 사상가의 관점에서 분석한다.",
    sections: [],
  },
  {
    id: "ch4",
    number: 4,
    title: "과학과 윤리",
    overview: "과학 기술의 가치 중립성 논쟁, 정보 사회의 윤리(사생활, 저작권, 사이버 폭력), 자연과 환경에 대한 다양한 윤리적 관점을 탐구한다.",
    sections: [],
  },
  {
    id: "ch5",
    number: 5,
    title: "문화와 윤리",
    overview: "예술과 대중문화의 윤리, 의식주와 윤리적 소비, 다문화 사회에서의 관용과 공존의 윤리를 학습한다.",
    sections: [],
  },
  {
    id: "ch6",
    number: 6,
    title: "평화와 공존의 윤리",
    overview: "갈등 해결과 소통, 민족 통합(남북 관계), 지구촌 평화와 국제 정의의 문제를 윤리적 관점에서 탐구한다.",
    sections: [],
  },
];
