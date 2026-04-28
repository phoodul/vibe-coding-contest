/**
 * Phase G-06 — 튜터 이름 + 모델 한 줄 배지.
 *
 * 베이스: docs/architecture-g06-legend.md §6.
 * portraits.ts 의 src + label_ko + model_short 사용. 모든 메시지 헤더에 노출.
 *
 * G06-17: stub. G06-18 에서 구현 (PerProblemReportCard 의존).
 */
'use client';

import type { ReactElement } from 'react';
import type { TutorName } from '@/lib/legend/types';

export interface TutorBadgeProps {
  tutor: TutorName;
  /** tooltip / aria-label 추가 정보 */
  size?: 'sm' | 'md';
}

export function TutorBadge(_props: TutorBadgeProps): ReactElement {
  return (
    <span className="legend-tutor-badge inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      TODO: G06-18 TutorBadge
    </span>
  );
}
