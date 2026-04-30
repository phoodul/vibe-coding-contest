/**
 * Phase G-06 G06-33 — 풀이 정리 보기 버튼 (BetaChat 마지막 assistant 메시지 직후).
 *
 * 베이스: docs/project-decisions.md Δ10.
 *
 * 동작:
 *   1. "📝 풀이 정리 보기" 버튼 → /api/legend/build-summary POST
 *   2. 응답 PerProblemReport → onSummaryReady 콜백 → 부모가 인라인 카드 렌더
 *   3. 한 번 생성 후 hide (한 메시지당 1회)
 *   4. 에러 시 error message 표시 + retry 가능
 *
 * Vibe: amber accent + hover lift + Framer Motion fadeUp + tabular-nums.
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PerProblemReport, TutorName } from '@/lib/legend/types';

export interface SolutionSummaryButtonProps {
  problemText: string;
  onSummaryReady: (report: PerProblemReport, sessionId: string) => void;
  /** 외부에서 강제 hide (예: 새 메시지 도착) */
  hidden?: boolean;
  /**
   * G06-35b — 사용자가 채팅에서 선택한 튜터. build-summary 호출 시 그대로 전달되어
   * 풀이 정리도 같은 튜터로 생성됨 (모델·페르소나 일관성 보장).
   */
  selectedTutor?: TutorName;
}

interface BuildSummaryError {
  error: string;
  message?: string;
  apply_url?: string;
}

export function SolutionSummaryButton({
  problemText,
  onSummaryReady,
  hidden,
  selectedTutor,
}: SolutionSummaryButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BuildSummaryError | null>(null);
  const [done, setDone] = useState(false);

  async function build() {
    if (!problemText?.trim()) {
      setError({ error: 'invalid_input', message: '문제 텍스트가 비어있습니다.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/legend/build-summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          problem_text: problemText,
          ...(selectedTutor ? { selected_tutor: selectedTutor } : {}),
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as BuildSummaryError;
        setError({
          error: errBody.error ?? 'build_failed',
          message: errBody.message ?? '풀이 정리 생성에 실패했습니다.',
          apply_url: errBody.apply_url,
        });
        return;
      }
      const data = (await res.json()) as {
        report: PerProblemReport;
        session_id: string;
      };
      onSummaryReady(data.report, data.session_id);
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '풀이 정리 생성에 실패했습니다.';
      setError({ error: 'network_error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  if (hidden || done) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="my-3"
    >
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={build}
        disabled={loading}
        className="w-full rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/10 to-orange-400/10 px-4 py-3 text-sm font-semibold text-amber-100 backdrop-blur-md transition-colors hover:border-amber-300/60 hover:from-amber-400/20 hover:to-orange-400/20 disabled:opacity-50"
        data-testid="solution-summary-button"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-amber-300/40 border-t-amber-200" />
            거장이 풀이를 정리하는 중입니다...
          </span>
        ) : (
          <>
            <span className="mr-1.5" aria-hidden>
              📝
            </span>
            풀이 정리 보기
            <span className="ml-2 text-[10px] font-normal text-amber-200/60">
              ToT 트리 · AI도 어려웠던 순간 · 떠올린 이유
            </span>
          </>
        )}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 rounded-lg border border-rose-400/30 bg-rose-400/5 px-3 py-2 text-xs text-rose-200"
        >
          {error.message ?? '풀이 정리 생성에 실패했습니다.'}
          {error.apply_url && (
            <a
              href={error.apply_url}
              className="ml-2 text-rose-100 underline hover:text-rose-50"
            >
              베타 신청 →
            </a>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
