/**
 * 22차 (2026-05-09) — Maestro 전용 타입.
 *
 * 19차 도입 시 lib/legend/types.ts 에 함께 두었지만 22차 사용자 결정으로
 * Maestro / Legend 코드 분리. 본 모듈은 maestro 4 과목 페르소나 union 만 담당.
 *
 * Subject 는 lib/types/subject.ts (공통) 에서 import. legend (수학) 페르소나 타입
 * MathTutorName 은 lib/legend/types.ts 에 그대로 둔다 (수학 전용 인프라).
 */
export type EarthScienceTutorName = 'wegener' | 'galilei' | 'hubble' | 'sagan';
export type BiologyTutorName = 'darwin' | 'mendel' | 'watson' | 'pasteur';
export type PhysicsTutorName = 'newton' | 'einstein' | 'feynman' | 'fermi';
export type ChemistryTutorName = 'mendeleev' | 'lavoisier' | 'pauling' | 'curie';

/**
 * 모든 maestro 페르소나의 union — UI(TutorPickerModal) · 페르소나 모델 매핑 용.
 * 추가 maestro (Korean / English) 진입 시 union 확장.
 */
export type MaestroTutorName =
  | EarthScienceTutorName
  | BiologyTutorName
  | PhysicsTutorName
  | ChemistryTutorName;

/** 페르소나 → 모델 그룹 매핑 (4 maestro × 4 위치 동일) */
export const MAESTRO_SONNET_TUTORS = ['wegener', 'pasteur', 'fermi', 'curie'] as const;
export const MAESTRO_GEMINI_TUTORS = ['galilei', 'mendel', 'einstein', 'lavoisier'] as const;
export const MAESTRO_OPUS_TUTORS = ['hubble', 'watson', 'feynman', 'pauling'] as const;
export const MAESTRO_GPT_TUTORS = ['sagan', 'darwin', 'newton', 'mendeleev'] as const;

export const ALL_MAESTRO_TUTORS: readonly MaestroTutorName[] = [
  ...MAESTRO_SONNET_TUTORS,
  ...MAESTRO_GEMINI_TUTORS,
  ...MAESTRO_OPUS_TUTORS,
  ...MAESTRO_GPT_TUTORS,
] as const;
