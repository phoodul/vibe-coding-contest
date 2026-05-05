import type { Textbook } from "./ethics-index";
import { EARTH_SCIENCE_CHAPTERS } from "./earth-science-index";
import { EARTH_SCIENCE_CH1_SECTIONS } from "./earth-science-ch1";
import { EARTH_SCIENCE_CH2_SECTIONS } from "./earth-science-ch2";
import { EARTH_SCIENCE_CH3_SECTIONS } from "./earth-science-ch3";
import { EARTH_SCIENCE_CH4_SECTIONS } from "./earth-science-ch4";
import { EARTH_SCIENCE_CH5_SECTIONS } from "./earth-science-ch5";

const sectionsByChapter: Record<string, typeof EARTH_SCIENCE_CH1_SECTIONS> = {
  ch1: EARTH_SCIENCE_CH1_SECTIONS,
  ch2: EARTH_SCIENCE_CH2_SECTIONS,
  ch3: EARTH_SCIENCE_CH3_SECTIONS,
  ch4: EARTH_SCIENCE_CH4_SECTIONS,
  ch5: EARTH_SCIENCE_CH5_SECTIONS,
};

const chapters = EARTH_SCIENCE_CHAPTERS.map((ch) => ({
  ...ch,
  sections: sectionsByChapter[ch.id] || [],
}));

export const EARTH_SCIENCE_TEXTBOOK: Textbook = {
  subject: "지구과학Ⅰ",
  subjectKey: "earth-science",
  title: "지구과학Ⅰ — 교과서 수준 완전 정리",
  chapters,
};

export function getEarthScienceStats() {
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
  };
}
