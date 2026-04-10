import type { Textbook } from "./life-index";
import { LIFE_CHAPTERS } from "./life-index";
import { LIFE_CH1_SECTIONS } from "./life-ch1";
import { LIFE_CH2_SECTIONS } from "./life-ch2";
import { LIFE_CH3_SECTIONS } from "./life-ch3";
import { LIFE_CH4_SECTIONS } from "./life-ch4";
import { LIFE_CH5_SECTIONS } from "./life-ch5";
import { LIFE_CH6_SECTIONS } from "./life-ch6";

const sectionsByChapter: Record<string, typeof LIFE_CH1_SECTIONS> = {
  life_ch1: LIFE_CH1_SECTIONS,
  life_ch2: LIFE_CH2_SECTIONS,
  life_ch3: LIFE_CH3_SECTIONS,
  life_ch4: LIFE_CH4_SECTIONS,
  life_ch5: LIFE_CH5_SECTIONS,
  life_ch6: LIFE_CH6_SECTIONS,
};

const chapters = LIFE_CHAPTERS.map((ch) => ({
  ...ch,
  sections: sectionsByChapter[ch.id] || [],
}));

export const LIFE_TEXTBOOK: Textbook = {
  subject: "생활과 윤리",
  subjectKey: "life",
  title: "생활과 윤리 — 교과서 구조화 정리",
  chapters,
};

export function getLifeStats() {
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
    estimatedPages: Math.round(totalCharacters / 500),
  };
}
