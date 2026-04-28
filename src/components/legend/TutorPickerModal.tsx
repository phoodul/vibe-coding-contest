/**
 * Phase G-06 — 같은 문제 다른 튜터 호출 모달.
 *
 * 베이스: docs/architecture-g06-legend.md §6.
 * 4 legend (가우스/폰노이만/오일러/라이프니츠) + 라마누잔 카드 + quota 표시 (호출 시 +1 소진).
 *
 * G06-17: stub. G06-20 에서 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { QuotaStatus, TutorName } from '@/lib/legend/types';

export interface TutorPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** 현재 풀이 튜터 — picker 에서 비활성화 표시 */
  currentTutor?: TutorName;
  quotas: QuotaStatus[];
  onPickTutor: (tutor: TutorName) => void;
}

export function TutorPickerModal(_props: TutorPickerModalProps): ReactElement {
  return (
    <div className="legend-tutor-picker">
      <p className="text-sm text-white/60">TODO: G06-20 에서 TutorPickerModal 5 튜터 카드 구현</p>
    </div>
  );
}
