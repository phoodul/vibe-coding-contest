/**
 * Phase G-06 G06-20 — Stage 0/1/2 흐름 디버그 패널 (admin only).
 *
 * 베이스: docs/architecture-g06-legend.md §6.
 *   - /admin/legend-routing 등 admin 페이지에서만 노출 (admin role check 는 server)
 *   - RouteDecision 의 stage_reached / routed_tier / routed_tutor / area / confidence /
 *     duration_ms / escalation_prompt.signals 표시
 *
 * Vibe: monospace + slate 톤 + Framer Motion fade-in.
 */
'use client';

import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { RouteDecision } from '@/lib/legend/types';

export interface RoutingTraceProps {
  decision: RouteDecision;
}

export function RoutingTrace({ decision }: RoutingTraceProps): ReactElement {
  const lines: Array<[label: string, value: string]> = [
    ['Stage reached', String(decision.stage_reached)],
    ['Tier', String(decision.routed_tier)],
    ['Tutor', decision.routed_tutor],
    ['Area', decision.area ?? '-'],
    [
      'Confidence',
      typeof decision.confidence === 'number' ? decision.confidence.toFixed(2) : '-',
    ],
    ['Duration', `${decision.duration_ms}ms`],
    ['Decision id', decision.routing_decision_id],
  ];

  const signals = decision.escalation_prompt?.signals ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'legend-routing-trace space-y-1 rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs text-white/75',
      )}
    >
      <div className="mb-2 text-[10px] uppercase tracking-wider text-white/40">routing trace</div>
      {lines.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <span className="text-white/45">{label}</span>
          <span className="text-white/85">{value}</span>
        </div>
      ))}
      {signals.length > 0 && (
        <div className="mt-2 border-t border-white/10 pt-2">
          <div className="text-amber-300/85">
            Signals: {signals.join(', ')}
          </div>
          {decision.escalation_prompt?.message && (
            <div className="mt-1 text-amber-200/65">{decision.escalation_prompt.message}</div>
          )}
        </div>
      )}
      {decision.precomputed_triggers && decision.precomputed_triggers.length > 0 && (
        <div className="mt-2 border-t border-white/10 pt-2 text-sky-200/75">
          Stage 0 hit: {decision.precomputed_triggers.length} triggers
        </div>
      )}
    </motion.div>
  );
}
