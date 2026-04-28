/**
 * Phase G-06 — Legend Tutor 모듈 진입점.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.
 * named re-export 만 한다. 구현은 각 stub 파일에서 단계별 (G06-05 / G06-06) 으로 채운다.
 */

export * from './types';
export { routeProblem } from './legend-router';
export { matchSimilarProblem } from './stage0-similar';
export { classifyDifficulty } from './stage1-manager';
export { runRamanujanProbe } from './stage2-probe';
export { detectEscalation } from './escalation-detector';
