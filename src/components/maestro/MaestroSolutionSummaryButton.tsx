/**
 * 22차 (2026-05-08) — Maestro 풀이 정리 버튼.
 *
 * Legend SolutionSummaryButton 의 maestro 버전.
 *   - endpoint: /api/maestro/build-summary
 *   - subject + tutor 명시 전송
 *   - 응답 = MaestroSummary (key_concepts·solution_steps·pitfalls·next_practice·persona_takeaway)
 *   - onSummaryReady 콜백으로 부모 BetaChat 이 인라인 카드 렌더
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Subject, MaestroTutorName } from '@/lib/legend/types';

export interface MaestroSummaryStep {
  step: number;
  title: string;
  explanation: string;
}

export interface MaestroSummary {
  key_concepts: string[];
  solution_steps: MaestroSummaryStep[];
  pitfalls: string[];
  next_practice: string[];
  persona_takeaway: string;
}

export interface MaestroSummaryResponse {
  subject: Subject;
  tutor: MaestroTutorName;
  tutor_label: string;
  summary: MaestroSummary;
}

interface BuildError {
  error: string;
  message?: string;
}

export interface MaestroSolutionSummaryButtonProps {
  subject: Subject;
  tutor: MaestroTutorName;
  problemText: string;
  conversation: Array<{ role: string; content: unknown }>;
  onSummaryReady: (response: MaestroSummaryResponse) => void;
  hidden?: boolean;
}

export function MaestroSolutionSummaryButton({
  subject,
  tutor,
  problemText,
  conversation,
  onSummaryReady,
  hidden,
}: MaestroSolutionSummaryButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BuildError | null>(null);
  const [done, setDone] = useState(false);

  async function build() {
    if (!problemText?.trim()) {
      setError({ error: 'invalid_input', message: '문제 텍스트가 비어있습니다.' });
      return;
    }
    if (!conversation || conversation.length < 2) {
      setError({
        error: 'conversation_too_short',
        message: '한 단계 더 풀어보고 다시 시도해 주세요.',
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/maestro/build-summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          subject,
          tutor,
          problem_text: problemText,
          conversation,
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as BuildError;
        setError({
          error: errBody.error ?? 'build_failed',
          message: errBody.message ?? '풀이 정리 생성에 실패했습니다.',
        });
        return;
      }
      const data = (await res.json()) as MaestroSummaryResponse;
      onSummaryReady(data);
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
        className="w-full rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-400/10 to-violet-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 backdrop-blur-md transition-colors hover:border-cyan-300/60 hover:from-cyan-400/20 hover:to-violet-400/20 disabled:opacity-50"
        data-testid="maestro-solution-summary-button"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-cyan-300/40 border-t-cyan-200" />
            거장이 풀이를 정리하는 중입니다...
          </span>
        ) : (
          <>
            <span className="mr-1.5" aria-hidden>
              📝
            </span>
            풀이 정리 보기
            <span className="ml-2 text-[10px] font-normal text-cyan-200/60">
              핵심 개념 · 단계별 풀이 · 함정 · 다음 학습
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
        </motion.div>
      )}
    </motion.div>
  );
}
