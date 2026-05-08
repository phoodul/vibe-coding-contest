/**
 * 22차 (2026-05-09) — Subject 공통 타입 (Legend + Maestro 공유).
 *
 * Maestro / Legend 분리 작업의 일부. Subject union 은 양쪽 모두 의존하므로
 * 중립 위치 (lib/types/) 에 둔다. legend/types.ts · maestro/types.ts 모두
 * 본 모듈에서 import.
 *
 * 기존 import (`@/lib/legend/types`) 호환성: legend/types.ts 가 본 모듈을
 * re-export 하므로 점진 migration 가능.
 */

/**
 * Maestro subject — 4 maestro (물리·화학·생물·지구과학) + 미래 확장 (국어·영어).
 * Legend Tutor = `subject='math'` 인스턴스. 19차 이전 모든 코드는 'math' 가정.
 */
export type Subject =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'earth-science'
  | 'korean'    // Phase 5+ (세종·정약용·이이)
  | 'english';  // Phase 5+ (셰익스피어·처칠·촘스키)

/** Phase 1~Phase D 에서 활성화된 subject */
export const ACTIVE_SUBJECTS: readonly Subject[] = [
  'math',
  'physics',
  'chemistry',
  'biology',
  'earth-science',
] as const;

/** subject → 한글 라벨 (학생 화면) */
export const SUBJECT_LABEL_KO: Record<Subject, string> = {
  math: '수학',
  physics: '물리',
  chemistry: '화학',
  biology: '생명과학',
  'earth-science': '지구과학',
  korean: '국어',
  english: '영어',
};

/** subject → URL slug ( `/legend` · `/physics` 등 ) */
export const SUBJECT_URL_SLUG: Record<Subject, string> = {
  math: 'legend',          // 기존 URL 보존 (/legend)
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  'earth-science': 'earth-science',
  korean: 'korean',
  english: 'english',
};

/** Maestro 4 과목 (math 제외) */
export const MAESTRO_SUBJECTS: readonly Subject[] = [
  'physics',
  'chemistry',
  'biology',
  'earth-science',
] as const;

export function isMaestroSubject(s: string): s is Exclude<Subject, 'math' | 'korean' | 'english'> {
  return (MAESTRO_SUBJECTS as readonly string[]).includes(s);
}
