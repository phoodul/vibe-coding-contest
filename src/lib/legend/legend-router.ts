/**
 * Phase G-06 — Legend Router (stub).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2.
 * 구현은 G06-06 에서: Stage 0 → Stage 1 → Stage 2 흐름 통합.
 * legend_routing_decisions insert 후 RouteDecision 반환.
 */
import type { RouteInput, RouteDecision } from './types';

export async function routeProblem(input: RouteInput): Promise<RouteDecision> {
  void input;
  throw new Error('not_implemented: G06-06 에서 구현');
}
