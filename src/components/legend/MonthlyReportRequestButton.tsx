/**
 * Phase G-06 G06-20 — 월간 리포트 요청 버튼 (Δ1).
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §4.2.
 *   - quota.eligibility 게이트 (누적 풀이 ≥ 20) 미충족 시 "n/20 풀이 후 활성화" 비활성화
 *   - quota 한도 소진 시 "이번 달 사용 완료" 비활성화
 *   - Weekly 와 거의 동일하나 카피·아이콘 분리.
 */
'use client';

import { motion } from 'framer-motion';
import { useState, type ReactElement } from 'react';
import { cn } from '@/lib/utils';
import type { QuotaStatus } from '@/lib/legend/types';

export interface MonthlyReportRequestButtonProps {
  quota: QuotaStatus;
  onRequest?: () => void | Promise<void>;
}

export function MonthlyReportRequestButton({
  quota,
  onRequest,
}: MonthlyReportRequestButtonProps): ReactElement {
  const [loading, setLoading] = useState(false);

  const remaining = quota.limit < 0 ? Infinity : Math.max(quota.limit - quota.used, 0);
  const eligibilityGate = quota.blocked_reason === 'eligibility_gate' || (quota.eligibility && quota.eligibility.current < quota.eligibility.required);
  const limitGate = remaining === 0;
  const disabled = !quota.allowed || eligibilityGate || limitGate || loading;

  const handleClick = async () => {
    if (disabled || !onRequest) return;
    setLoading(true);
    try {
      await onRequest();
    } finally {
      setLoading(false);
    }
  };

  let detail: string | null = null;
  if (eligibilityGate && quota.eligibility) {
    detail = `${quota.eligibility.current}/${quota.eligibility.required} 풀이 후 활성화`;
  } else if (limitGate) {
    detail = '이번 달 사용 완료';
  } else if (loading) {
    detail = '생성 중…';
  }

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'legend-monthly-btn flex w-full flex-col items-start gap-1 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/85 transition-colors',
        'hover:border-white/30 hover:bg-white/10',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/10 disabled:hover:bg-white/5',
      )}
    >
      <span className="flex items-center gap-2 font-semibold">
        <span aria-hidden>🗓️</span>
        월간 리포트 요청
      </span>
      {detail && <span className="text-[11px] text-white/55">{detail}</span>}
    </motion.button>
  );
}
