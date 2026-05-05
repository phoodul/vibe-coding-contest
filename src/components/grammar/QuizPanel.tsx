'use client';

/**
 * QuizPanel — 헤밍웨이 영문법 인터랙티브 퀴즈.
 *
 * 흐름:
 *   1. 문제 N/M 진행 표시 + 4 선택지 라디오 → 학생 선택 → "확인"
 *   2. 채점 — 정답: ⭕ + 해당 선택지 초록 / 오답: ❌ + 오답 빨강 + 정답 초록
 *      그 자리에 해설 markdown 노출 → "다음 문제"
 *   3. 마지막 문제 후 "결과 보기" → 점수 + 번호별 ⭕❌ 요약
 *      틀린 문제 있으면 "틀린 문제 다시 보기" → 정답·해설만 review
 *   4. "처음부터 다시" 가능
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { QuizQuestion } from '@/lib/grammar/parse-lesson';

interface Props {
  quiz: QuizQuestion[];
}

type Mode = 'quiz' | 'result' | 'review';

// 공통 markdown 스타일
const MD_PROSE = 'prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-code:text-amber-200 prose-code:bg-white/5 prose-code:rounded prose-code:px-1 prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-amber-300/50 prose-blockquote:text-amber-100/90';

export function QuizPanel({ quiz }: Props) {
  const [mode, setMode] = useState<Mode>('quiz');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // questionId -> selectedIndex
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [reviewIdx, setReviewIdx] = useState(0);

  const total = quiz.length;
  const q = quiz[currentIdx];

  const correctCount = useMemo(
    () => quiz.filter((qq) => answers.get(qq.id) === qq.answerIndex).length,
    [quiz, answers],
  );
  const wrongQuestions = useMemo(
    () => quiz.filter((qq) => answers.get(qq.id) !== qq.answerIndex),
    [quiz, answers],
  );

  function handleSubmit() {
    if (selected === null) return;
    setAnswers((prev) => new Map(prev).set(q.id, selected));
    setSubmitted(true);
  }

  function handleNext() {
    if (currentIdx === total - 1) {
      setMode('result');
      return;
    }
    setCurrentIdx((i) => i + 1);
    // selected/submitted 는 아래 useEffect 가 답안 보유 여부에 따라 자동 복원
  }

  function handlePrev() {
    if (currentIdx === 0) return;
    setCurrentIdx((i) => i - 1);
  }

  // currentIdx 변경 시 — 이미 답한 문제는 채점 상태 복원, 아니면 초기화
  useEffect(() => {
    const ans = answers.get(quiz[currentIdx]?.id);
    if (ans !== undefined) {
      setSelected(ans);
      setSubmitted(true);
    } else {
      setSelected(null);
      setSubmitted(false);
    }
  }, [currentIdx, quiz, answers]);

  function handleRestart() {
    setMode('quiz');
    setCurrentIdx(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers(new Map());
    setReviewIdx(0);
  }

  function handleStartReview() {
    setMode('review');
    setReviewIdx(0);
  }

  if (quiz.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
        이 레슨에는 아직 실전 문제가 없어요.
      </div>
    );
  }

  // ── 결과 화면 ────────────────────────────────────────
  if (mode === 'result') {
    const percent = Math.round((correctCount / total) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="rounded-2xl border border-amber-300/40 bg-amber-400/5 p-6 text-center">
          <div className="text-5xl mb-2">{percent === 100 ? '🎉' : percent >= 60 ? '👏' : '💪'}</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
            {correctCount} / {total}
          </div>
          <p className="mt-2 text-sm text-white/70">{percent}점</p>
        </div>

        {/* 문제별 요약 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/70 mb-3">문제별 결과</p>
          <div className="flex flex-wrap gap-2">
            {quiz.map((qq) => {
              const isCorrect = answers.get(qq.id) === qq.answerIndex;
              return (
                <div
                  key={qq.id}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    isCorrect
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  <span>{isCorrect ? '⭕' : '❌'}</span>
                  <span>문제 {qq.id}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {wrongQuestions.length > 0 && (
            <button
              type="button"
              onClick={handleStartReview}
              className="flex-1 rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-400/20 transition-colors"
            >
              📖 틀린 문제 다시 보기 ({wrongQuestions.length})
            </button>
          )}
          <button
            type="button"
            onClick={handleRestart}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
          >
            🔄 처음부터 다시
          </button>
        </div>
      </motion.div>
    );
  }

  // ── 틀린 문제 다시 보기 ────────────────────────────────
  if (mode === 'review') {
    const rq = wrongQuestions[reviewIdx];
    if (!rq) {
      return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
          틀린 문제가 없어요.
        </div>
      );
    }
    return (
      <motion.div
        key={rq.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="font-mono">
            틀린 문제 {reviewIdx + 1} / {wrongQuestions.length}
          </span>
          <button
            type="button"
            onClick={() => setMode('result')}
            className="text-white/50 hover:text-white/80 transition-colors"
          >
            ← 결과로
          </button>
        </div>

        <ReviewCard q={rq} myAnswer={answers.get(rq.id) ?? null} />

        <div className="flex gap-2">
          <button
            type="button"
            disabled={reviewIdx === 0}
            onClick={() => setReviewIdx((i) => Math.max(0, i - 1))}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 이전
          </button>
          {reviewIdx < wrongQuestions.length - 1 ? (
            <button
              type="button"
              onClick={() => setReviewIdx((i) => i + 1)}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:scale-[1.005] transition-all"
            >
              다음 →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('result')}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:scale-[1.005] transition-all"
            >
              결과로 →
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // ── 풀이 화면 ────────────────────────────────────────
  const isCorrect = submitted && selected === q.answerIndex;

  return (
    <div className="space-y-4">
      {/* 진행 표시 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="font-mono">
            문제 {currentIdx + 1} / {total}
          </span>
          <div className="flex gap-1">
            {quiz.map((qq, i) => {
              if (i === currentIdx) {
                return (
                  <span
                    key={qq.id}
                    className="inline-block w-2 h-2 rounded-full bg-amber-400"
                  />
                );
              }
              const ans = answers.get(qq.id);
              if (ans === undefined) {
                return (
                  <span
                    key={qq.id}
                    className="inline-block w-2 h-2 rounded-full bg-white/20"
                  />
                );
              }
              const ok = ans === qq.answerIndex;
              return (
                <span
                  key={qq.id}
                  className={`inline-block w-2 h-2 rounded-full ${
                    ok ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
              );
            })}
          </div>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 1) / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 문제 카드 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5"
        >
          {/* 문제 번호 + 상태 마크 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-amber-300/80">
              문제 {q.id}.
            </span>
            {submitted && (
              <span
                className={`text-base ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {isCorrect ? '⭕' : '❌'}
              </span>
            )}
          </div>

          {/* 문제 본문 */}
          <div className={MD_PROSE}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question}</ReactMarkdown>
          </div>

          {/* 선택지 */}
          <div className="mt-4 space-y-2">
            {q.choices.map((c, i) => {
              const isSelected = selected === i;
              const isAnswer = i === q.answerIndex;
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
                  key={c.label}
                  type="button"
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${style} disabled:cursor-default`}
                >
                  <span className="text-base font-semibold">{c.label}</span>
                  <span className="flex-1">{c.text}</span>
                  {submitted && isAnswer && (
                    <span className="text-emerald-300">정답</span>
                  )}
                  {submitted && !isAnswer && isSelected && (
                    <span className="text-rose-300">선택</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 해설 (제출 후) */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/5 p-4">
                  <p className="text-xs font-semibold text-amber-200 mb-2">💡 해설</p>
                  <div className={MD_PROSE}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentIdx === 0}
          onClick={handlePrev}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← 이전
        </button>
        {!submitted ? (
          <button
            type="button"
            disabled={selected === null}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white hover:scale-[1.005] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            확인
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white hover:scale-[1.005] transition-all"
          >
            {currentIdx === total - 1 ? '결과 보기 →' : '다음 문제 →'}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ q, myAnswer }: { q: QuizQuestion; myAnswer: number | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono text-amber-300/80">문제 {q.id}.</span>
        <span className="text-base text-rose-400">❌</span>
      </div>

      <div className={MD_PROSE}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question}</ReactMarkdown>
      </div>

      <div className="mt-4 space-y-2">
        {q.choices.map((c, i) => {
          const isAnswer = i === q.answerIndex;
          const isMine = myAnswer === i;
          let style = 'border-white/10 bg-white/5 text-white/40';
          if (isAnswer) style = 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100';
          else if (isMine) style = 'border-rose-400/60 bg-rose-500/15 text-rose-100';
          return (
            <div
              key={c.label}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${style}`}
            >
              <span className="text-base font-semibold">{c.label}</span>
              <span className="flex-1">{c.text}</span>
              {isAnswer && <span className="text-emerald-300">정답</span>}
              {!isAnswer && isMine && <span className="text-rose-300">내 답</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/5 p-4">
        <p className="text-xs font-semibold text-amber-200 mb-2">💡 해설</p>
        <div className={MD_PROSE}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
