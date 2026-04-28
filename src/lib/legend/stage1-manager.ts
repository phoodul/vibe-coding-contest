/**
 * Phase G-06 — Stage 1: Manager Haiku 난이도·영역 분류 (stub).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2.
 * 구현은 G06-05 에서: Haiku 4.5 JSON 출력. 기존 src/lib/euler/manager 의
 * difficulty-classifier 패턴 재활용.
 */
import type { ProblemArea } from './types';

export async function classifyDifficulty(
  problem: string,
  area_hint?: string,
): Promise<{ difficulty: 1 | 2 | 3 | 4 | 5 | 6; confidence: number; area: ProblemArea }> {
  void problem;
  void area_hint;
  throw new Error('not_implemented: G06-05 에서 구현');
}
