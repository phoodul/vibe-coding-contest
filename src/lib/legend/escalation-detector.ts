/**
 * Phase G-06 — Escalation detector (stub).
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2.
 * 구현은 G06-06 에서: sympy_fail AND stuck_token 둘 다일 때만 권유 (자동 escalate ✗).
 * message: "라마누잔이 이 문제에서 막힘을 보입니다. 어떻게 할까요?"
 */
import type { EscalationPrompt } from './types';
import type { ProbeResult } from './stage2-probe';

export function detectEscalation(probe: ProbeResult): EscalationPrompt | null {
  void probe;
  throw new Error('not_implemented: G06-06 에서 구현');
}
