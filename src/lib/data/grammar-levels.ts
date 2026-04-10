/**
 * 영문법 핵심 문장 — 레벨 통합 인덱스
 * Lv1 (A1-A2) 100문장 + Lv2 (B1-B2) 100문장 + Lv3 (C1-C2) 100문장 = 300문장
 */
import {
  GRAMMAR_SENTENCES,
  GRAMMAR_CATEGORIES,
  type GrammarSentence,
} from "./grammar-sentences";
import { GRAMMAR_LV2, GRAMMAR_LV2_CATEGORIES } from "./grammar-lv2";
import { GRAMMAR_LV3, GRAMMAR_LV3_CATEGORIES } from "./grammar-lv3";

export type GrammarLevel = "lv1" | "lv2" | "lv3";

export interface LevelInfo {
  key: GrammarLevel;
  label: string;
  sublabel: string;
  sentences: GrammarSentence[];
  categories: readonly string[];
}

export const GRAMMAR_LEVELS: LevelInfo[] = [
  {
    key: "lv1",
    label: "Lv 1",
    sublabel: "기초 (A1-A2)",
    sentences: GRAMMAR_SENTENCES,
    categories: GRAMMAR_CATEGORIES,
  },
  {
    key: "lv2",
    label: "Lv 2",
    sublabel: "중급 (B1-B2)",
    sentences: GRAMMAR_LV2,
    categories: GRAMMAR_LV2_CATEGORIES,
  },
  {
    key: "lv3",
    label: "Lv 3",
    sublabel: "고급 (C1-C2)",
    sentences: GRAMMAR_LV3,
    categories: GRAMMAR_LV3_CATEGORIES,
  },
];

export { type GrammarSentence } from "./grammar-sentences";
