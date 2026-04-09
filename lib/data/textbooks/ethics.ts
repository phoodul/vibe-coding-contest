import type { Textbook } from "./ethics-index";
import { ETHICS_CHAPTERS } from "./ethics-index";
import { ETHICS_CH1_SECTIONS } from "./ethics-ch1";
import { ETHICS_CH2_SECTIONS } from "./ethics-ch2";
import { ETHICS_CH3_SECTIONS } from "./ethics-ch3";
import { ETHICS_CH4_SECTIONS } from "./ethics-ch4";
import { ETHICS_CH5_SECTIONS } from "./ethics-ch5";
import { ETHICS_CH6_SECTIONS } from "./ethics-ch6";

const sectionsByChapter: Record<string, typeof ETHICS_CH1_SECTIONS> = {
  ch1: ETHICS_CH1_SECTIONS,
  ch2: ETHICS_CH2_SECTIONS,
  ch3: ETHICS_CH3_SECTIONS,
  ch4: ETHICS_CH4_SECTIONS,
  ch5: ETHICS_CH5_SECTIONS,
  ch6: ETHICS_CH6_SECTIONS,
};

// Merge sections into chapters
const chapters = ETHICS_CHAPTERS.map((ch) => ({
  ...ch,
  sections: sectionsByChapter[ch.id] || [],
}));

export const ETHICS_TEXTBOOK: Textbook = {
  subject: "생활과 윤리",
  subjectKey: "ethics",
  title: "생활과 윤리 — 교과서 수준 완전 정리",
  chapters,
};

// Helper: 전체 콘텐츠 수 계산
export function getEthicsStats() {
  let totalSections = 0;
  let totalContents = 0;
  let totalCharacters = 0;

  for (const ch of chapters) {
    totalSections += ch.sections.length;
    for (const sec of ch.sections) {
      totalContents += sec.contents.length;
      for (const c of sec.contents) {
        totalCharacters += c.detail.length;
      }
    }
  }

  return {
    chapters: chapters.length,
    sections: totalSections,
    contents: totalContents,
    characters: totalCharacters,
    estimatedPages: Math.round(totalCharacters / 500), // 1페이지 ≈ 500자
  };
}
