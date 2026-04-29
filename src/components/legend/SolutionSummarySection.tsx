/**
 * Phase G-06 G06-28 + G06-33 — R1 풀이 정리 섹션 (Δ7).
 *
 * 베이스: docs/project-decisions.md Δ7 + Δ10 (G06-33 trigger_motivation).
 *
 * 차원 분리:
 *   - LLMStruggleSection (Δ3) = "AI도 어려웠다" 정직성
 *   - SolutionSummarySection (Δ7) = "이렇게 정리해두면" 학습 코치 ⭐ 본 컴포넌트
 *
 * 5 필드 노출 (schema 1.3):
 *   1. core_insight — 💡 핵심 통찰 1문장
 *   2. step_flow_narrative — 단계 흐름 2~3문장
 *   3. hardest_resolution — 🎯 가장 어려운 부분 통찰 1문장 (italic, accent border)
 *   4. trigger_motivation — 💡 그 생각을 떠올린 이유 1문장 (G06-33, blue accent border)
 *   5. generalization — 💭 비슷한 문제 적용 일반 원칙 1문장 (footer 톤)
 */
'use client';

import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import type { SolutionSummary } from '@/lib/legend/types';

export interface SolutionSummarySectionProps {
  summary: SolutionSummary;
}

export function SolutionSummarySection({
  summary,
}: SolutionSummarySectionProps): ReactElement | null {
  // 빌더 fallback 또는 빈 입력 시 섹션 자체 숨김
  if (!summary || !summary.core_insight) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] p-4 backdrop-blur-sm"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-200/95">
        <span aria-hidden>📝</span>
        풀이 정리
      </h3>

      <div className="space-y-2.5 text-sm leading-relaxed">
        {/* 1. 핵심 통찰 */}
        <div className="font-medium text-white/90">
          <span className="mr-1.5" aria-hidden>
            💡
          </span>
          핵심: {summary.core_insight}
        </div>

        {/* 2. 단계 흐름 */}
        <div className="text-white/80">{summary.step_flow_narrative}</div>

        {/* 3. 가장 어려운 부분 */}
        {summary.hardest_resolution && (
          <div className="border-l-2 border-emerald-400/50 pl-3 italic text-emerald-100/85">
            <span className="mr-1.5 not-italic" aria-hidden>
              🎯
            </span>
            어려운 부분: {summary.hardest_resolution}
          </div>
        )}

        {/* 4. 그 생각을 떠올린 이유 (G06-33, schema 1.3) — blue accent */}
        {summary.trigger_motivation && (
          <div className="border-l-2 border-blue-400/50 pl-3 text-blue-100/90">
            <span className="mr-1.5" aria-hidden>
              💡
            </span>
            떠올린 이유: {summary.trigger_motivation}
          </div>
        )}

        {/* 5. 일반 원칙 (footer 톤) */}
        {summary.generalization && (
          <div className="border-t border-emerald-400/20 pt-2.5 text-xs text-white/55">
            <span className="mr-1.5" aria-hidden>
              💭
            </span>
            일반 원칙: {summary.generalization}
          </div>
        )}
      </div>
    </motion.section>
  );
}
