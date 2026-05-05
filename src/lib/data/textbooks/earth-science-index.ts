import type { TextbookChapter } from "./ethics-index";

/**
 * 지구과학Ⅰ 교과서 — 2022 개정 교육과정 기반
 *
 * 5 chapter / 25 section / ~200 content / 약 400K 자 (≈ 200 페이지) 자체 제작.
 * spec: docs/earth-science-textbook-spec.md
 *
 * 패턴: ethics/biology/korean 과 동일 (TextbookChapter[] + sectionsByChapter merge).
 */

export const EARTH_SCIENCE_CHAPTERS: TextbookChapter[] = [
  {
    id: "ch1",
    number: 1,
    title: "지권의 변동",
    overview:
      "대륙 이동설에서 판 구조론까지의 발전 과정과 판의 운동·경계, 화산 활동, 지진 발생, 한반도 지각 변동을 학습한다. 고체 지구의 동역학을 이해하는 단원이다.",
    sections: [],
  },
  {
    id: "ch2",
    number: 2,
    title: "지구의 역사",
    overview:
      "지층의 형성과 퇴적 환경, 지층 대비와 상대·절대 연령 측정, 지질 시대 구분, 표준화석, 대멸종과 한반도 지질 역사를 학습한다.",
    sections: [],
  },
  {
    id: "ch3",
    number: 3,
    title: "대기와 해양의 변화",
    overview:
      "대기의 층상 구조와 안정도, 구름·강수의 형성, 일기도와 한반도 기상, 해수의 성질과 해류·조석을 학습하며 유체 지구의 작동 원리를 이해한다.",
    sections: [],
  },
  {
    id: "ch4",
    number: 4,
    title: "대기와 해양의 상호작용",
    overview:
      "대기 대순환과 표층 해류, 엘니뇨와 라니냐(ENSO), 자연적 기후 변화 요인과 인간 활동에 의한 지구 온난화, 한반도 미래 기후를 학습한다.",
    sections: [],
  },
  {
    id: "ch5",
    number: 5,
    title: "별과 우주",
    overview:
      "별빛에서 얻을 수 있는 정보(분광·시선속도), H-R도와 별의 진화, 외계 행성 탐사, 우주의 구조와 빅뱅 우주론·암흑 물질·암흑 에너지를 학습한다.",
    sections: [],
  },
];
