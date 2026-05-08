/**
 * 22차 (2026-05-08) — Maestro 풀이 정리 카드.
 *
 * MaestroSummaryResponse 를 인라인 카드로 렌더. 4 섹션:
 *   1. persona_takeaway (페르소나 한 줄 메시지)
 *   2. key_concepts (사용한 개념·법칙)
 *   3. solution_steps (단계별 풀이 — KaTeX 수식 렌더)
 *   4. pitfalls + next_practice (함정·다음 학습)
 *
 * KaTeX 렌더 일관성: StreamingMarkdown 재사용.
 */
'use client';

import { motion } from 'framer-motion';
import { StreamingMarkdown } from '@/components/legend/StreamingMarkdown';
import type { MaestroSummaryResponse } from './MaestroSolutionSummaryButton';

export function MaestroSummaryCard({ data }: { data: MaestroSummaryResponse }) {
  const { tutor_label, summary } = data;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/70 via-cyan-900/10 to-violet-900/20 backdrop-blur-md p-5 space-y-5"
    >
      <header className="flex items-center gap-2 pb-3 border-b border-white/10">
        <span className="text-xl" aria-hidden>📝</span>
        <span className="text-sm font-semibold text-white/90">
          {tutor_label} 의 풀이 정리
        </span>
      </header>

      <section>
        <p className="text-sm leading-relaxed text-cyan-100 italic">
          “{summary.persona_takeaway}”
        </p>
      </section>

      <section>
        <h3 className="text-xs font-bold text-cyan-300/90 mb-2 tracking-wide">
          핵심 개념
        </h3>
        <ul className="space-y-1">
          {summary.key_concepts.map((c, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-white/85"
            >
              <span className="text-cyan-400/70 mt-0.5">◆</span>
              <span className="flex-1">
                <StreamingMarkdown content={c} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-bold text-violet-300/90 mb-2 tracking-wide">
          단계별 풀이
        </h3>
        <ol className="space-y-3">
          {summary.solution_steps.map((s) => (
            <li
              key={s.step}
              className="rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-400/20 border border-violet-300/40 text-xs font-bold text-violet-100">
                  {s.step}
                </span>
                <span className="text-sm font-semibold text-white/95">
                  {s.title}
                </span>
              </div>
              <div className="text-sm text-white/80 leading-relaxed pl-8">
                <StreamingMarkdown content={s.explanation} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/5 p-3">
          <h3 className="text-xs font-bold text-rose-300/90 mb-2 tracking-wide flex items-center gap-1.5">
            <span aria-hidden>⚠️</span>
            자주 빠지는 함정
          </h3>
          <ul className="space-y-1.5">
            {summary.pitfalls.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-rose-100/90"
              >
                <span className="text-rose-400/70 mt-0.5">·</span>
                <span className="flex-1">
                  <StreamingMarkdown content={p} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/5 p-3">
          <h3 className="text-xs font-bold text-emerald-300/90 mb-2 tracking-wide flex items-center gap-1.5">
            <span aria-hidden>🎯</span>
            다음 학습 권장
          </h3>
          <ul className="space-y-1.5">
            {summary.next_practice.map((n, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-emerald-100/90"
              >
                <span className="text-emerald-400/70 mt-0.5">→</span>
                <span className="flex-1">
                  <StreamingMarkdown content={n} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </motion.div>
  );
}
