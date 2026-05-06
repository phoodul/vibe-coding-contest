/**
 * 19차 (2026-05-06) — Maestro 4 과목 adapter.
 *
 * 현재는 src/lib/legend/* 의 thin re-export. 4 maestro
 * (Earth Science / Biology / Physics / Chemistry) 페이지·라우트는
 * 본 모듈을 import 한다. Legend 자체 (subject='math') 는 기존
 * src/lib/legend/* 를 직접 사용 (회귀 0 보장).
 *
 * Phase D 끝에 lib/legend → lib/maestro 진짜 rename 예정 (그 시점에
 * Legend 도 본 모듈 사용으로 전환).
 *
 * 미래 확장:
 *   - Korean Maestro (Phase 5+, 세종·정약용·이이)
 *   - English Maestro (Phase 5+, 셰익스피어·처칠·촘스키)
 */

export type {
  Subject,
  MathTutorName,
  EarthScienceTutorName,
  MaestroTutorName,
} from '@/lib/legend/types';
export {
  ACTIVE_SUBJECTS,
  SUBJECT_LABEL_KO,
  SUBJECT_URL_SLUG,
} from '@/lib/legend/types';
export {
  PERSONAS_BY_SUBJECT,
  getPersonasForSubject,
  getMaestroPortrait,
  EARTH_SCIENCE_PORTRAITS,
} from '@/lib/legend/portraits';

// 19차 (2026-05-06) — Vision LLM (표·그림 분석) 인프라
export type { FigureKind, VisionInput, VisionOutput, VisionExtracted } from './vision';
export {
  FIGURE_ANALYSIS_5_STEPS,
  SUBJECT_FIGURE_HINTS,
  analyzeVision,
} from './vision';
