export type { VocabGroup } from "./vocab-level-1";

import { LEVEL_1 } from "./vocab-level-1";
import { LEVEL_2 } from "./vocab-level-2";
import { LEVEL_3 } from "./vocab-level-3";
import { LEVEL_4 } from "./vocab-level-4";
import { LEVEL_5 } from "./vocab-level-5";
import { LEVEL_6 } from "./vocab-level-6";
import { LEVEL_7 } from "./vocab-level-7";
import { LEVEL_8 } from "./vocab-level-8";
import { LEVEL_9 } from "./vocab-level-9";
import { LEVEL_10 } from "./vocab-level-10";
import type { VocabGroup } from "./vocab-level-1";

/** 레벨 → 그룹 배열 (45그룹 × 40단어 = 1,800단어/레벨) */
export const VOCAB_DATA: Record<number, VocabGroup[]> = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
  4: LEVEL_4,
  5: LEVEL_5,
  6: LEVEL_6,
  7: LEVEL_7,
  8: LEVEL_8,
  9: LEVEL_9,
  10: LEVEL_10,
};

export const GROUPS_PER_LEVEL = 45;
export const WORDS_PER_GROUP = 40;
export const PASS_SCORE = 36; // 36/40 = 90%

export const CAMP_INFO = [
  { camp: 1, name: "Base Camp", altitude: "5,364m", label: "기초 단어" },
  { camp: 2, name: "Camp 1", altitude: "5,943m", label: "기본 확장" },
  { camp: 3, name: "Camp 2", altitude: "6,500m", label: "초등 심화" },
  { camp: 4, name: "Camp 3", altitude: "7,162m", label: "중등 준비" },
  { camp: 5, name: "Camp 4", altitude: "7,600m", label: "중학 기초" },
  { camp: 6, name: "Camp 5", altitude: "7,920m", label: "중학 심화" },
  { camp: 7, name: "Camp 6", altitude: "8,000m", label: "고등 기초" },
  { camp: 8, name: "Camp 7", altitude: "8,200m", label: "고등 심화" },
  { camp: 9, name: "Camp 8", altitude: "8,400m", label: "대학 준비" },
  { camp: 10, name: "Camp 9", altitude: "8,600m", label: "대학 심화" },
  { camp: 11, name: "Summit", altitude: "8,849m", label: "정상 도달" },
];
