'use client';

/**
 * SuneungSection — 슬러그에 매핑된 수능 영어 어법 기출 문제 인터랙티브 카드.
 *
 * 학생 흐름:
 *   1. 카드 펼침 → 본문 + 5 선택지 표시
 *   2. 학생 선택 → "확인" → 정답·오답 색깔 + 옳은 형태 + 풀이
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SuneungQuestion } from '@/lib/data/grammar-suneung';

interface Props {
  questions: SuneungQuestion[];
}

const CHOICE_LABELS = ['①', '②', '③', '④', '⑤'];

const MD_PROSE = 'prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:my-2 prose-code:text-amber-200 prose-code:bg-white/5 prose-code:rounded prose-code:px-1 prose-code:before:content-none prose-code:after:content-none';

export function SuneungSection({ questions }: Props) {
  if (questions.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-amber-200">
          🎯 관련 수능 기출 ({questions.length})
        </h2>
        <span className="text-[11px] text-white/40">
          출처: 한국교육과정평가원 (KICE)
        </span>
      </div>
      <div className="space-y-3">
        {questions.map((q) => (
          <SuneungCard key={`${q.year}-${q.number}`} q={q} />
        ))}
      </div>
    </section>
  );
}

function SuneungCard({ q }: { q: SuneungQuestion }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = submitted && selected === q.answer;

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  function handleReset() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <div className="rounded-xl border border-amber-300/30 bg-amber-400/5 backdrop-blur-md overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-amber-400/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-mono font-bold text-amber-200">
            {q.year}
          </span>
          <span className="text-sm font-medium text-white/90">
            수능 {q.number}번
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
            어법
          </span>
        </div>
        <span
          className={`text-xs text-amber-300/70 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 border-t border-white/10 space-y-4">
              {/* 본문 */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] text-white/50 mb-2">
                  다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?
                </p>
                <div className={MD_PROSE}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.passage}</ReactMarkdown>
                </div>
              </div>

              {/* 선택지 */}
              <div className="space-y-2">
                {q.choices.map((c, i) => {
                  const isAnswer = i === q.answer;
                  const isSelected = selected === i;
                  let style = 'border-white/15 bg-white/5 hover:bg-white/10';
                  if (submitted) {
                    if (isAnswer) {
                      style = 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100';
                    } else if (isSelected) {
                      style = 'border-rose-400/60 bg-rose-500/15 text-rose-100';
                    } else {
                      style = 'border-white/10 bg-white/5 text-white/40';
                    }
                  } else if (isSelected) {
                    style = 'border-amber-300/60 bg-amber-400/15 text-amber-100';
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={submitted}
                      onClick={() => setSelected(i)}
                      className={`w-full flex items-start gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${style} disabled:cursor-default`}
                    >
                      <span className="text-base font-semibold">{CHOICE_LABELS[i]}</span>
                      <span className="flex-1 font-mono text-xs">{c}</span>
                      {submitted && isAnswer && (
                        <span className="text-emerald-300 text-xs">정답 (틀린 부분)</span>
                      )}
                      {submitted && !isAnswer && isSelected && (
                        <span className="text-rose-300 text-xs">선택</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 액션 */}
              {!submitted ? (
                <button
                  type="button"
                  disabled={selected === null}
                  onClick={handleSubmit}
                  className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  확인
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
                >
                  🔄 다시 풀기
                </button>
              )}

              {/* 결과 + 풀이 */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div
                      className={`rounded-lg border p-3 text-sm ${
                        isCorrect
                          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                          : 'border-rose-400/40 bg-rose-500/10 text-rose-100'
                      }`}
                    >
                      {isCorrect ? '⭕ 정답!' : '❌ 오답'} — 틀린 부분:{' '}
                      <span className="font-mono font-semibold">
                        {CHOICE_LABELS[q.answer]} {q.errorPart}
                      </span>{' '}
                      →{' '}
                      <span className="font-mono font-semibold text-emerald-300">
                        {q.correctedForm}
                      </span>
                    </div>

                    <div className="rounded-lg border border-amber-300/30 bg-amber-400/5 p-4">
                      <p className="text-xs font-semibold text-amber-200 mb-2">
                        💡 왜 틀렸나
                      </p>
                      <div className={MD_PROSE}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                      </div>
                    </div>

                    {q.otherChoicesNote && (
                      <details className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                        <summary className="cursor-pointer font-semibold text-white/80">
                          📚 다른 선택지가 옳은 이유 (선택)
                        </summary>
                        <div className={`mt-2 ${MD_PROSE}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.otherChoicesNote}</ReactMarkdown>
                        </div>
                      </details>
                    )}

                    {q.reviewNeeded && (
                      <div className="rounded-lg border border-yellow-400/30 bg-yellow-500/5 p-3 text-[11px] text-yellow-100/80">
                        ⚠️ {q.reviewNeeded}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
