/**
 * Phase G-06 Δ22b — Trigger 라이브러리 카드 그리드 (학생 열람용).
 *
 * 정석 형식 카드: A (cue) → B (활용) + why_text 인과 풀이.
 * 검색·필터 (knowledge_layer 별).
 */
'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TriggerRow } from '@/app/legend/triggers/page';

const LAYER_LABELS: Record<number, string> = {
  1: '중1',
  2: '중2',
  3: '중3',
  4: '고1·수학Ⅰ',
  5: '수학Ⅱ·미적',
  6: '심화·확통·기하',
};

interface Props {
  triggers: TriggerRow[];
}

export function TriggerCardList({ triggers }: Props) {
  const [query, setQuery] = useState('');
  const [layerFilter, setLayerFilter] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const layers = useMemo(() => {
    const set = new Set(triggers.map((t) => t.knowledge_layer));
    return Array.from(set).sort((a, b) => a - b);
  }, [triggers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return triggers.filter((t) => {
      if (layerFilter !== null && t.knowledge_layer !== layerFilter) return false;
      if (!q) return true;
      return (
        t.trigger_condition.toLowerCase().includes(q) ||
        (t.derived_fact ?? '').toLowerCase().includes(q) ||
        t.tool_name.toLowerCase().includes(q) ||
        t.why_text.toLowerCase().includes(q)
      );
    });
  }, [triggers, query, layerFilter]);

  return (
    <div className="space-y-4">
      {/* 검색·필터 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="text"
          placeholder="검색 (예: 극한, 치환, 점화식, 두 직선)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setLayerFilter(null)}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
              layerFilter === null
                ? 'border-amber-300/60 bg-amber-400/15 text-amber-200'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25'
            }`}
          >
            전체
          </button>
          {layers.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLayerFilter(l)}
              className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                layerFilter === l
                  ? 'border-amber-300/60 bg-amber-400/15 text-amber-200'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25'
              }`}
            >
              {LAYER_LABELS[l] ?? `L${l}`}
            </button>
          ))}
        </div>
      </div>

      {/* 통계 */}
      <p className="text-[11px] text-white/40">
        {filtered.length} / {triggers.length} 개 노출
      </p>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {filtered.map((t, i) => {
            const isExpanded = expandedId === t.id;
            const B = t.derived_fact ?? t.goal_pattern ?? t.tool_name;
            return (
              <motion.button
                key={t.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2), duration: 0.3 }}
                onClick={() => setExpandedId(isExpanded ? null : t.id)}
                className="text-left rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:border-amber-300/30 hover:bg-amber-400/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80">
                    A → B
                  </span>
                  <span className="text-[10px] text-white/40">
                    {LAYER_LABELS[t.knowledge_layer] ?? `L${t.knowledge_layer}`}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm leading-relaxed">
                  <p className="text-white/85">
                    <span className="text-amber-200/80 font-semibold">A</span>{' '}
                    {t.trigger_condition}
                  </p>
                  <p className="text-white/85">
                    <span className="text-amber-200/80 font-semibold">→ B</span>{' '}
                    {B}
                  </p>
                </div>

                <div className="mt-2 text-[11px] text-white/50">
                  도구: {t.tool_name}
                </div>

                <AnimatePresence>
                  {isExpanded && t.why_text && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/70 leading-relaxed">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">
                          왜 (필연성·개연성)
                        </span>
                        <p className="mt-1">{t.why_text}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isExpanded && (
                  <p className="mt-2 text-[10px] text-white/35">
                    클릭하여 인과 풀이 펼치기
                  </p>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center text-sm text-white/50">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
