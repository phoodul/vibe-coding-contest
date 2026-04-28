/**
 * Phase G-06 — 월간 리포트 요청 버튼 (Δ1).
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §4.2.
 * 자격 게이트 (누적 풀이 ≥ 20) 미충족 시 "n/20 풀이 후 활성화" 비활성 표시.
 *
 * G06-17: stub. G06-20 에서 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { QuotaStatus } from '@/lib/legend/types';

export interface MonthlyReportRequestButtonProps {
  quota: QuotaStatus;
  onRequest?: () => void;
}

export function MonthlyReportRequestButton(_props: MonthlyReportRequestButtonProps): ReactElement {
  return (
    <button
      type="button"
      className="legend-monthly-btn rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70"
      disabled
    >
      TODO: G06-20 월간 리포트 버튼
    </button>
  );
}
