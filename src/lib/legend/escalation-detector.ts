/**
 * Phase G-06 — Escalation detector.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §1.2 + §4.2.
 * 결정: project-decisions.md G-06 — sympy_fail AND stuck_token 둘 다일 때만 권유.
 *   (자동 escalate ✗ — 학생에게 3 선택지 제공)
 *
 * 한쪽 신호만 있는 경우는 null 반환 → 라마누잔 답변 그대로 노출.
 * target_tutor 는 임시 'gauss' (legend-router 가 area 기반으로 최종 결정 + 덮어쓰기 가능).
 */
import type { EscalationPrompt } from './types';
import type { ProbeResult } from './stage2-probe';

export function detectEscalation(probe: ProbeResult): EscalationPrompt | null {
  const hasSympy = probe.escalation_signals.includes('sympy_fail');
  const hasStuck = probe.escalation_signals.includes('stuck_token');

  // 결정 #1 (project-decisions G-06): 둘 다 신호일 때만 권유
  if (!(hasSympy && hasStuck)) return null;

  return {
    signals: probe.escalation_signals,
    message: '라마누잔이 이 문제에서 막힘을 보입니다. 어떻게 할까요?',
    options: [
      { kind: 'escalate', label: '레전드 튜터 호출', target_tutor: 'gauss' },
      { kind: 'retry', label: '제가 더 시도해볼게요' },
      { kind: 'hint_only', label: '힌트만 받기' },
    ],
  };
}
