/**
 * English Village — 영어 단어 기억의 궁전
 * 18,000단어 · 10단계 · CEFR + 한국 교육과정 기반
 */

export interface EnglishWord {
  word: string;
  meaning: string;
  pronunciation: string;
  pos: "noun" | "verb" | "adjective" | "adverb" | "preposition" | "conjunction" | "phrase";
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  example: string;
  exampleKo: string;
}

export interface VillageZone {
  id: string;
  name: string;
  nameKo: string;
  emoji: string;
  description: string;
  words: EnglishWord[];
}

export interface VillageLocation {
  id: string;
  name: string;
  nameKo: string;
  emoji: string;
  gradient: string;
  description: string;
  zones: VillageZone[];
}

/**
 * 10단계 난이도 체계
 *
 * CEFR(유럽공통참조기준) + 한국 교육과정 + 국제시험 매핑
 *
 * Lv.1  A1   초등3-4  첫 영어        ~1,200단어  hello, book, play
 * Lv.2  A1+  초등5-6  초등 필수      ~1,500단어  kitchen, favorite, celebrate
 * Lv.3  A2   중1      초등 완성      ~1,800단어  adventure, discover, gradually
 * Lv.4  A2+  중2      중학 입문      ~1,800단어  experiment, tradition, frequently
 * Lv.5  B1   중3      중학 완성      ~2,000단어  demonstrate, consequence, atmosphere
 * Lv.6  B1+  고1      고등 입문      ~2,000단어  hypothesis, infrastructure, sustainable
 * Lv.7  B2   수능     수능 필수      ~2,200단어  unprecedented, paradigm, inherent
 * Lv.8  B2+  토플80   토플 기초      ~2,000단어  anthropology, pragmatic, ubiquitous
 * Lv.9  C1   토플100  토플/편입      ~1,800단어  epistemological, juxtaposition, ameliorate
 * Lv.10 C1+  GRE     최고급/학술    ~1,700단어  perspicacious, recondite, sesquipedalian
 */
export const LEVEL_LABELS: Record<number, { label: string; tag: string; cefr: string; color: string; target: string; words: string }> = {
  1:  { label: "Starter",            tag: "Lv.1",  cefr: "A1",  color: "#4CAF50", target: "초등 3-4학년",     words: "~1,200" },
  2:  { label: "Basic",              tag: "Lv.2",  cefr: "A1+", color: "#66BB6A", target: "초등 5-6학년",     words: "~1,500" },
  3:  { label: "Elementary",         tag: "Lv.3",  cefr: "A2",  color: "#8BC34A", target: "중학 1학년",       words: "~1,800" },
  4:  { label: "Pre-Intermediate",   tag: "Lv.4",  cefr: "A2+", color: "#CDDC39", target: "중학 2학년",       words: "~1,800" },
  5:  { label: "Intermediate",       tag: "Lv.5",  cefr: "B1",  color: "#FFC107", target: "중학 3학년",       words: "~2,000" },
  6:  { label: "Upper-Intermediate", tag: "Lv.6",  cefr: "B1+", color: "#FF9800", target: "고등 1학년",       words: "~2,000" },
  7:  { label: "Advanced",           tag: "Lv.7",  cefr: "B2",  color: "#FF5722", target: "수능",             words: "~2,200" },
  8:  { label: "TOEFL",              tag: "Lv.8",  cefr: "B2+", color: "#E91E63", target: "토플 80+",         words: "~2,000" },
  9:  { label: "Academic",           tag: "Lv.9",  cefr: "C1",  color: "#9C27B0", target: "토플 100+ / 편입", words: "~1,800" },
  10: { label: "Expert",             tag: "Lv.10", cefr: "C1+", color: "#673AB7", target: "GRE / 학술",       words: "~1,700" },
};
