/**
 * Phase G-06 — Per-Problem Report 메인 카드 (R1).
 *
 * 베이스: docs/architecture-g06-legend.md §6.1 + §5.1.
 * 6 섹션 (problem / tree / steps / trigger / stuck / AI struggle).
 *
 * G06-17: stub. G06-18 에서 problem / steps / trigger 3 섹션 구현.
 * G06-19 에서 ReasoningTreeView 통합. G06-20 에서 LLMStruggleSection 통합.
 */
'use client';

import type { ReactElement } from 'react';
import type { PerProblemReport } from '@/lib/legend/types';

export interface PerProblemReportCardProps {
  report: PerProblemReport;
  /** step 클릭 → 상세 패널 펼침 */
  onExpandStep?: (index: number) => void;
  /** trigger 클릭 → 다른 도구·예제 모달 */
  onExpandTrigger?: (triggerId: string) => void;
  /** "다른 거장에게도 물어보기" 클릭 → TutorPickerModal */
  onCallSecondOpinion?: () => void;
}

export function PerProblemReportCard(_props: PerProblemReportCardProps): ReactElement {
  return (
    <div className="legend-report-card rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
      <p className="text-sm text-white/60">TODO: G06-18 에서 PerProblemReportCard 6 섹션 구현</p>
    </div>
  );
}
