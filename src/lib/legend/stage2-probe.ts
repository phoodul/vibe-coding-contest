/**
 * Phase G-06 — Stage 2: Ramanujan probe (stub).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2.
 * 구현은 G06-06 에서: Opus 4.7 baseline 1회 호출 + SymPy 검증 + self-eval "막힘" 토큰.
 */

export interface ProbeResult {
  solved: boolean;
  trace_jsonb: unknown;
  escalation_signals: ('sympy_fail' | 'stuck_token')[];
  duration_ms: number;
}

export async function runRamanujanProbe(problem: string): Promise<ProbeResult> {
  void problem;
  throw new Error('not_implemented: G06-06 에서 구현');
}
