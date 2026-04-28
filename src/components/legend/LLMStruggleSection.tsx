/**
 * Phase G-06 — "AI도 어려웠던 순간" 섹션 (Δ3).
 *
 * 베이스: docs/architecture-g06-legend.md §6 + Δ3 카피.
 * hardest_step / step_ms / tool_retries / resolution_narrative 표시.
 *
 * G06-17: stub. G06-20 에서 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { PerProblemReport } from '@/lib/legend/types';

export interface LLMStruggleSectionProps {
  llmStruggleSummary: PerProblemReport['llm_struggle_summary'];
  steps: PerProblemReport['steps'];
}

export function LLMStruggleSection(_props: LLMStruggleSectionProps): ReactElement {
  return (
    <div className="legend-struggle rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/60">TODO: G06-20 에서 LLMStruggleSection 구현 (Δ3)</p>
    </div>
  );
}
