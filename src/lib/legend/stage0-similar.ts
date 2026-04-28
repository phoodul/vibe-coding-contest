/**
 * Phase G-06 — Stage 0: similar_problems 매칭 (stub).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2.
 * 구현은 G06-05 에서: match_similar_problems RPC 호출 + threshold 미달 시 null.
 */
import type { TriggerLabel } from './types';

export interface SimilarProblemRow {
  id: string;
  year: number;
  type: string;
  number: number;
  problem_latex: string;
  answer: string;
  similarity: number;
}

export async function matchSimilarProblem(
  embedding: number[],
  threshold = 0.85,
): Promise<{ row: SimilarProblemRow; triggers: TriggerLabel[] } | null> {
  void embedding;
  void threshold;
  throw new Error('not_implemented: G06-05 에서 구현');
}
