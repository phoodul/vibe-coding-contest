import type { Textbook } from "./ethics-index";
import { BIOLOGY_CHAPTERS } from "./biology-index";
import { BIOLOGY_CH1_SECTIONS } from "./biology-ch1";
import { BIOLOGY_CH2_SECTIONS } from "./biology-ch2";
import { BIOLOGY_CH3_SECTIONS } from "./biology-ch3";
import { BIOLOGY_CH4_SECTIONS } from "./biology-ch4";
import { BIOLOGY_CH5_SECTIONS } from "./biology-ch5";

const sectionsByChapter: Record<string, typeof BIOLOGY_CH1_SECTIONS> = {
  bio_ch1: BIOLOGY_CH1_SECTIONS,
  bio_ch2: BIOLOGY_CH2_SECTIONS,
  bio_ch3: BIOLOGY_CH3_SECTIONS,
  bio_ch4: BIOLOGY_CH4_SECTIONS,
  bio_ch5: BIOLOGY_CH5_SECTIONS,
};

const chapters = BIOLOGY_CHAPTERS.map((ch) => ({
  ...ch,
  sections: sectionsByChapter[ch.id] || [],
}));

export const BIOLOGY_TEXTBOOK: Textbook = {
  subject: "생명과학Ⅰ",
  subjectKey: "biology",
  title: "생명과학Ⅰ — 교과서 수준 완전 정리",
  chapters,
};

export function getBiologyStats() {
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
    estimatedPages: Math.round(totalCharacters / 800),
  };
}
