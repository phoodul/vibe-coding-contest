import type { Textbook } from "./ethics-index";
import { KOREAN_CHAPTERS } from "./korean-index";
import { KOREAN_CH1_SECTIONS } from "./korean-ch1";
import { KOREAN_CH2_SECTIONS } from "./korean-ch2";
import { KOREAN_CH3_SECTIONS } from "./korean-ch3";
import { KOREAN_CH4_SECTIONS } from "./korean-ch4";
import { KOREAN_CH5_SECTIONS } from "./korean-ch5";

const sectionsByChapter: Record<string, typeof KOREAN_CH1_SECTIONS> = {
  kor_ch1: KOREAN_CH1_SECTIONS,
  kor_ch2: KOREAN_CH2_SECTIONS,
  kor_ch3: KOREAN_CH3_SECTIONS,
  kor_ch4: KOREAN_CH4_SECTIONS,
  kor_ch5: KOREAN_CH5_SECTIONS,
};

const chapters = KOREAN_CHAPTERS.map((ch) => ({
  ...ch,
  sections: sectionsByChapter[ch.id] || [],
}));

export const KOREAN_TEXTBOOK: Textbook = {
  subject: "언어와 매체",
  subjectKey: "korean",
  title: "언어와 매체 — 교과서 수준 완전 정리",
  chapters,
};

export function getKoreanStats() {
  let totalSections = 0;
  let totalContents = 0;
  let totalCharacters = 0;
  for (const ch of chapters) {
    totalSections += ch.sections.length;
    for (const sec of ch.sections) {
      totalContents += sec.contents.length;
      for (const c of sec.contents) totalCharacters += c.detail.length;
    }
  }
  return {
    chapters: chapters.length,
    sections: totalSections,
    contents: totalContents,
    estimatedPages: Math.round(totalCharacters / 800),
  };
}
