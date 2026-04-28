/**
 * Phase G-06 — 라마누잔 막힘 시 escalation 인라인 메시지.
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §4.1 (EscalationPrompt).
 * 3 선택지: escalate (다른 튜터) / retry (다시 풀기) / hint_only (힌트만).
 *
 * G06-17: stub. G06-20 에서 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { EscalationPrompt as EscalationPromptData, TutorName } from '@/lib/legend/types';

export interface EscalationPromptProps {
  prompt: EscalationPromptData;
  onChoose: (kind: 'escalate' | 'retry' | 'hint_only', targetTutor?: TutorName) => void;
}

export function EscalationPrompt(_props: EscalationPromptProps): ReactElement {
  return (
    <div className="legend-escalation rounded-lg border border-amber-300/30 bg-amber-500/10 p-4">
      <p className="text-sm text-white/60">TODO: G06-20 에서 EscalationPrompt 3 선택지 구현</p>
    </div>
  );
}
