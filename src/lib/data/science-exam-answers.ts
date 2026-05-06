/**
 * 19차 Phase B5-f (2026-05-06) — 수능 과학 4 과목 정답 DB.
 *
 * 사용자가 KICE 정답표 PDF 보고 Excel 파일에 직접 입력 후, 변환 스크립트로 본
 * 파일이 채워짐 (scripts/convert-science-answers-xlsx.ts).
 *
 * 구조:
 *   subject → variant (Ⅰ/Ⅱ) → year (학년도) → number (1~20) → answer (1~5)
 *
 * 객관식 5지선다 가정. 일부 단답형 (수학 21~30번 패턴) 은 number 만 다르게 표기.
 *
 * 정답 자체는 학생 화면에 직접 노출 X (호기심 자극·소크라테스 코칭). LLM 이 학생
 * 풀이를 들으며 정답 매칭 시 사용 — admin/dev 디버깅 + 풀이 끝 검증 only.
 */
import type { Subject } from '@/lib/legend/types';

export type ExamVariant = 'I' | 'II';
export type AnswerChoice = 1 | 2 | 3 | 4 | 5;

/** subject → variant → year → number → 정답 */
export type ScienceAnswerDB = Partial<
  Record<Subject, Partial<Record<ExamVariant, Record<number, Record<number, AnswerChoice>>>>>
>;

/**
 * 정답 DB. 사용자 입력 후 변환 스크립트가 자동 채움.
 * 현재 상태 = 빈 placeholder. Phase B5-f 완료 후 갱신.
 */
export const SCIENCE_ANSWERS: ScienceAnswerDB = {
  // 'earth-science': {
  //   I: {
  //     2026: { 1: 3, 2: 5, ... },
  //     ...
  //   },
  // },
};

/**
 * 정답 조회. 미입력 (placeholder) 면 undefined — LLM 이 자체 추론으로 fallback.
 */
export function getScienceAnswer(
  subject: Subject,
  variant: ExamVariant,
  year: number,
  number: number,
): AnswerChoice | undefined {
  return SCIENCE_ANSWERS[subject]?.[variant]?.[year]?.[number];
}

/**
 * 사용자가 정답 DB 입력 진행률 — admin 페이지에서 표시 가능.
 */
export function getAnswerCoverage(): {
  total_filled: number;
  total_expected: number; // 4 subject × 2 variant × 10 year × 20 number = 1600
  by_subject: Record<string, number>;
} {
  const expected = 4 * 2 * 10 * 20; // 1600
  let filled = 0;
  const bySubject: Record<string, number> = {};
  for (const [subj, variants] of Object.entries(SCIENCE_ANSWERS)) {
    let count = 0;
    for (const variant of Object.values(variants ?? {})) {
      for (const year of Object.values(variant ?? {})) {
        count += Object.keys(year ?? {}).length;
      }
    }
    bySubject[subj] = count;
    filled += count;
  }
  return { total_filled: filled, total_expected: expected, by_subject: bySubject };
}
