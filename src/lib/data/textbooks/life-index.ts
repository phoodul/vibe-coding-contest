/**
 * 생활과 윤리 교과서 (PDF 원문 기반) 전체 목차 및 구조
 * Upstage Document Parse로 추출한 실제 교과서 텍스트 → 구조화
 *
 * 타입은 ethics-index.ts와 동일한 형태를 재사용
 */

export type { TextbookContent, TextbookSection, TextbookChapter, Textbook } from "./ethics-index";

import type { TextbookChapter } from "./ethics-index";

export const LIFE_CHAPTERS: TextbookChapter[] = [
  {
    id: "life_ch1",
    number: 1,
    title: "현대의 삶과 실천 윤리",
    overview:
      "현대 사회의 다양한 윤리 문제 특징을 이해하고, 동양(유교·불교·도가)과 서양(의무론·공리주의·덕 윤리)의 윤리적 접근 방법 및 도덕적 탐구·성찰의 방법을 학습한다.",
    sections: [],
  },
  {
    id: "life_ch2",
    number: 2,
    title: "생명과 윤리",
    overview:
      "출생과 죽음의 윤리, 생명 복제·유전자 치료·동물 실험의 생명 윤리, 사랑과 성·결혼과 가족의 윤리를 탐구한다.",
    sections: [],
  },
  {
    id: "life_ch3",
    number: 3,
    title: "사회와 윤리",
    overview:
      "직업과 청렴의 윤리, 분배적·교정적 사회 정의, 국가 권위와 시민 불복종 등 사회 윤리 쟁점을 다양한 사상가의 관점에서 분석한다.",
    sections: [],
  },
  {
    id: "life_ch4",
    number: 4,
    title: "과학과 윤리",
    overview:
      "과학 기술의 가치 중립성 논쟁과 사회적 책임, 정보 사회 윤리(사생활·저작권·매체 윤리), 자연과 환경에 대한 동서양 관점을 탐구한다.",
    sections: [],
  },
  {
    id: "life_ch5",
    number: 5,
    title: "문화와 윤리",
    overview:
      "예술과 대중문화의 윤리, 의식주와 윤리적 소비, 다문화 사회에서의 문화 다양성 존중과 종교 관용을 학습한다.",
    sections: [],
  },
  {
    id: "life_ch6",
    number: 6,
    title: "평화와 공존의 윤리",
    overview:
      "사회 갈등 해결과 소통의 윤리, 민족 통합(통일)의 윤리, 국제 분쟁 해결과 해외 원조 등 지구촌 평화의 윤리를 탐구한다.",
    sections: [],
  },
];
