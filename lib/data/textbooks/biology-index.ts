/**
 * 생명과학Ⅰ 교과서 전체 목차 및 구조
 * 2022 개정 교육과정 기반 — 교과서 수준 상세 내용
 *
 * 구조: 대단원(5개) → 중단원 → 소단원 → 핵심 내용
 */

import type { TextbookChapter } from "./ethics-index";

export const BIOLOGY_CHAPTERS: TextbookChapter[] = [
  {
    id: "bio_ch1",
    number: 1,
    title: "생명 과학의 이해",
    overview: "생물의 특성(세포, 물질대사, 자극과 반응, 항상성, 생식과 유전, 적응과 진화)을 이해하고, 생명 과학의 탐구 방법(귀납적·연역적 탐구, 대조 실험)을 학습한다.",
    sections: [],
  },
  {
    id: "bio_ch2",
    number: 2,
    title: "세포의 특성",
    overview: "세포의 구조(원핵세포·진핵세포, 세포소기관)와 세포막을 통한 물질 이동(확산, 삼투, 능동수송), 효소의 구조와 기능을 학습한다.",
    sections: [],
  },
  {
    id: "bio_ch3",
    number: 3,
    title: "세포 분열과 유전",
    overview: "체세포 분열과 감수 분열의 과정을 이해하고, 멘델의 유전 법칙과 사람의 유전(상염색체·성염색체 유전, 가계도 분석), 염색체와 유전자 이상을 학습한다.",
    sections: [],
  },
  {
    id: "bio_ch4",
    number: 4,
    title: "항상성과 몸의 조절",
    overview: "신경계(뉴런, 흥분의 전도와 전달, 중추·말초 신경계)와 내분비계(호르몬, 혈당량·체온 조절), 면역 작용(선천 면역, 적응 면역, 항원항체 반응)을 학습한다.",
    sections: [],
  },
  {
    id: "bio_ch5",
    number: 5,
    title: "생태계와 상호 작용",
    overview: "생태계의 구성(개체군, 군집, 생태계)과 상호 작용, 에너지 흐름과 물질 순환(탄소·질소 순환), 생물 다양성의 중요성과 보전 방안을 학습한다.",
    sections: [],
  },
];
