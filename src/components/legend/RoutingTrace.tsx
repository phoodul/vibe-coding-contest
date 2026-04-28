/**
 * Phase G-06 — Stage 0/1/2 흐름 디버그 패널 (admin only).
 *
 * 베이스: docs/architecture-g06-legend.md §6.
 * /admin/legend-routing 에서 노출. 일반 사용자에게는 보이지 않음.
 *
 * G06-17: stub. G06-20 에서 구현.
 */
'use client';

import type { ReactElement } from 'react';
import type { RouteDecision } from '@/lib/legend/types';

export interface RoutingTraceProps {
  decision: RouteDecision;
}

export function RoutingTrace(_props: RoutingTraceProps): ReactElement {
  return (
    <div className="legend-routing-trace rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs text-white/60">
      TODO: G06-20 RoutingTrace (admin)
    </div>
  );
}
