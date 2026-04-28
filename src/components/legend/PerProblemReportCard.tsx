/**
 * Phase G-06 — Per-Problem Report 메인 카드 (R1).
 *
 * 베이스: docs/architecture-g06-legend.md §6.1 + §5.1.
 *
 * 6 섹션:
 *   1. Tutor + Problem 헤더
 *   2. Reasoning Tree (G06-19 본 구현 — stub 호출)
 *   3. Step Decomposition (G06-18 본 구현)
 *   4. Trigger Expansion (G06-18 본 구현)
 *   5. Stuck Signals (G06-18 인라인)
 *   6. LLM Struggle (G06-20 본 구현 — stub 호출)
 *   + Second Opinion CTA
 *
 * G06-18: problem / steps / trigger 3 섹션 + stuck 인라인 + tree·struggle stub mount.
 */
'use client';

import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { TutorBadge } from './TutorBadge';
import { StepDecompositionView } from './StepDecompositionView';
import { TriggerExpansionCard } from './TriggerExpansionCard';
import { ReasoningTreeView } from './ReasoningTreeView';
import { LLMStruggleSection } from './LLMStruggleSection';
import type { PerProblemReport } from '@/lib/legend/types';

export interface PerProblemReportCardProps {
  report: PerProblemReport;
  /** step 클릭 → 상세 패널 펼침 */
  onExpandStep?: (index: number) => void;
  /** trigger 클릭 → 다른 도구·예제 모달 */
  onExpandTrigger?: (triggerId: string) => void;
  /** "다른 거장에게도 물어보기" 클릭 → TutorPickerModal */
  onCallSecondOpinion?: () => void;
}

const STUCK_REASON_LABEL: Record<NonNullable<PerProblemReport['stuck_signals']['reason']>, string> = {
  tool_recall_miss: '도구 회상 실패',
  tool_trigger_miss: 'trigger 인식 실패',
  computation_error: '계산 오류',
  forward_dead_end: '순방향 막힘',
  backward_dead_end: '역추적 막힘',
  parse_failure: '문제 해석 실패',
};

export function PerProblemReportCard({
  report,
  onExpandStep,
  onExpandTrigger,
  onCallSecondOpinion,
}: PerProblemReportCardProps): ReactElement {
  const stuckSec = Math.round(report.stuck_signals.user_stuck_ms_total / 1000);
  const stuckReasonLabel = report.stuck_signals.reason
    ? STUCK_REASON_LABEL[report.stuck_signals.reason]
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'legend-report-card overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md',
        'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]',
      )}
    >
      {/* 1. Tutor + Problem 헤더 */}
      <header className="flex flex-col gap-3 border-b border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5">
        <div className="flex items-center justify-between gap-3">
          <TutorBadge tutor={report.tutor.name} label={report.tutor.label_ko} model={report.tutor.model_short} />
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/65">
              {report.problem_summary.area}
            </span>
            <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-2.5 py-1 text-[11px] text-sky-200">
              난이도 {report.problem_summary.difficulty}
            </span>
          </div>
        </div>
        <h2 className="text-base leading-relaxed text-white/90 sm:text-lg">
          {report.problem_summary.text_short}
        </h2>
      </header>

      <div className="space-y-6 p-5">
        {/* 2. Reasoning Tree (G06-19 본 구현 — preview) */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
            <span aria-hidden>🌳</span> 추론 트리
            <span className="text-[10px] font-normal text-white/40">
              {report.reasoning_tree.node_count} 노드 · 깊이 {report.reasoning_tree.depth_max}
            </span>
          </h3>
          <ReasoningTreeView
            tree={report.reasoning_tree}
            preview
            onNodeClick={onExpandStep}
          />
        </section>

        {/* 3. Step Decomposition */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
            <span aria-hidden>📋</span> 풀이 단계
            <span className="text-[10px] font-normal text-white/40">{report.steps.length}단계</span>
          </h3>
          <StepDecompositionView
            steps={report.steps}
            pivotalStepIndex={report.pivotal_step_index}
            onExpandStep={onExpandStep}
          />
        </section>

        {/* 4. Trigger Expansion */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
            <span aria-hidden>💡</span> 같은 발동 조건의 도구
          </h3>
          <TriggerExpansionCard
            primary={report.trigger_summary.primary}
            expansions={report.trigger_summary.expansions}
            onExpandTrigger={onExpandTrigger}
          />
        </section>

        {/* 5. Stuck Signals */}
        {(stuckSec > 0 || stuckReasonLabel) && (
          <section className="flex items-start gap-3 rounded-md border border-amber-400/30 bg-amber-400/5 p-3 text-sm text-amber-100/85">
            <span aria-hidden className="text-base leading-tight">
              ⚠
            </span>
            <div className="flex-1">
              {stuckSec > 0 && (
                <span className="font-semibold">총 {stuckSec}초 멈춤</span>
              )}
              {stuckReasonLabel && (
                <span className="ml-2 text-amber-200/70">— {stuckReasonLabel}</span>
              )}
              {report.stuck_signals.revisited_step_indices.length > 0 && (
                <span className="ml-2 text-amber-200/60">
                  (재방문 단계 {report.stuck_signals.revisited_step_indices.map((n) => n + 1).join(', ')})
                </span>
              )}
            </div>
          </section>
        )}

        {/* 6. LLM Struggle (Δ3) — hardest_step_ms < 1s 시 섹션 자체 숨김 */}
        {report.llm_struggle_summary && report.llm_struggle_summary.hardest_step_ms >= 1000 && (
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
              <span aria-hidden>🤖</span> AI도 어려웠던 순간
            </h3>
            <LLMStruggleSection
              llmStruggleSummary={report.llm_struggle_summary}
              steps={report.steps}
            />
          </section>
        )}

        {/* 7. Second Opinion CTA */}
        {onCallSecondOpinion && (
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCallSecondOpinion}
            className={cn(
              'group flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white',
              'bg-gradient-to-r from-sky-500/20 via-violet-500/20 to-amber-500/20',
              'transition-colors hover:border-white/30',
            )}
          >
            다른 거장에게도 물어보기
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}
