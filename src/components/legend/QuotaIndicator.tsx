/**
 * Phase G-06 G06-20 — 헤더 quota 잔여 표시 (Δ1).
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §4.2.
 *   5 quota dot: problem_total_daily / legend_call_daily / report_per_problem_daily / weekly_report / monthly_report
 *   - props.quotas 우선 (server fetch)
 *   - 미지정 시 client 측 /api/legend/quota fetch
 *   - hover 시 reset_at + 자격 게이트 tooltip
 *
 * 의존성 격리: swr 미설치 → fetch + useState 패턴.
 */
'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { QuotaKind, QuotaStatus } from '@/lib/legend/types';

const QUOTA_DISPLAY: Record<QuotaKind, { icon: string; label: string }> = {
  problem_total_daily: { icon: '📝', label: '문제' },
  legend_call_daily: { icon: '⭐', label: '레전드' },
  report_per_problem_daily: { icon: '📊', label: '리포트' },
  weekly_report: { icon: '📅', label: '주간' },
  monthly_report: { icon: '🗓️', label: '월간' },
  // Δ9 (G06-32) — 체험판 라마누잔 일 3회. 베타 사용자에게는 노출되지 않으나
  // QuotaKind union 완전성을 위해 매핑 유지.
  trial_ramanujan_daily: { icon: '🎓', label: '체험' },
};

const ORDER: QuotaKind[] = [
  'problem_total_daily',
  'legend_call_daily',
  'report_per_problem_daily',
  'weekly_report',
  'monthly_report',
];

export interface QuotaIndicatorProps {
  /** server fetch 결과 — 미지정 시 client fetch */
  quotas?: QuotaStatus[];
}

function formatResetAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function QuotaIndicator({ quotas: initial }: QuotaIndicatorProps): ReactElement | null {
  const [quotas, setQuotas] = useState<QuotaStatus[] | undefined>(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial && initial.length > 0) {
      setQuotas(initial);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch('/api/legend/quota', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { quotas?: QuotaStatus[] } | null) => {
        if (!cancelled && data?.quotas) setQuotas(data.quotas);
      })
      .catch(() => {
        // silent — 헤더 UI 비표시로 처리
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  if (loading && !quotas) {
    return (
      <div className="legend-quota flex items-center gap-2 text-[11px] text-white/40" aria-hidden>
        quota 확인 중…
      </div>
    );
  }

  if (!quotas || quotas.length === 0) return null;

  const sorted = ORDER.map((kind) => quotas.find((q) => q.kind === kind)).filter(
    (q): q is QuotaStatus => Boolean(q),
  );

  return (
    <div className="legend-quota flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
      {sorted.map((q) => {
        const display = QUOTA_DISPLAY[q.kind];
        const remainingNum = q.limit < 0 ? Infinity : Math.max(q.limit - q.used, 0);
        const remaining = remainingNum === Infinity ? '∞' : String(remainingNum);
        const limit = q.limit < 0 ? '∞' : String(q.limit);
        const tooltipParts: string[] = [];
        if (q.eligibility) {
          tooltipParts.push(`자격 게이트: ${q.eligibility.current}/${q.eligibility.required}`);
        }
        tooltipParts.push(`reset: ${formatResetAt(q.reset_at)}`);
        if (q.blocked_reason === 'eligibility_gate') {
          tooltipParts.push('누적 풀이 게이트 미충족');
        } else if (q.blocked_reason === 'limit_exceeded') {
          tooltipParts.push('한도 초과');
        }

        return (
          <span
            key={q.kind}
            title={tooltipParts.join(' · ')}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors',
              q.allowed
                ? 'border-white/15 bg-white/5 text-white/80'
                : 'border-rose-300/30 bg-rose-400/10 text-rose-200/80',
            )}
          >
            <span aria-hidden>{display.icon}</span>
            <span className="hidden sm:inline">{display.label}</span>
            <span className="tabular-nums">
              {remaining}/{limit}
            </span>
          </span>
        );
      })}
    </div>
  );
}
