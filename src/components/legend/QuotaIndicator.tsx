/**
 * Phase G-06 — 헤더 quota 잔여 표시 (Δ1).
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §4.2.
 * 5 quota dot: problem_total_daily / legend_call_daily / report_per_problem_daily / weekly_report / monthly_report.
 *
 * G06-17: stub. G06-20 에서 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { QuotaStatus } from '@/lib/legend/types';

export interface QuotaIndicatorProps {
  /** /api/legend/quota 응답 — 5 종 */
  quotas?: QuotaStatus[];
}

export function QuotaIndicator(_props: QuotaIndicatorProps): ReactElement {
  return (
    <div className="legend-quota flex items-center gap-2 text-xs text-white/60">
      <span>TODO: G06-20 quota dot 5종 (Δ1)</span>
    </div>
  );
}
