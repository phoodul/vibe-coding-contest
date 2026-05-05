'use client';

/**
 * LessonView — 헤밍웨이 영문법 레슨 탭 wrapper.
 *
 * '설명' 탭: parsed body (핵심 명제 + 설명 + 대표 문장) 마크다운.
 * '문제 풀이' 탭: QuizPanel (인터랙티브 채점 + 결과 + 틀린 문제 다시 보기).
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QuizPanel } from './QuizPanel';
import type { QuizQuestion } from '@/lib/grammar/parse-lesson';

type Tab = 'study' | 'quiz';

interface Props {
  body: string;
  quiz: QuizQuestion[];
  nextNote?: string;
}

export function LessonView({ body, quiz, nextNote }: Props) {
  const [tab, setTab] = useState<Tab>('study');

  return (
    <div className="space-y-6">
      {/* 탭 */}
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 w-fit">
        <TabButton active={tab === 'study'} onClick={() => setTab('study')}>
          📖 설명
        </TabButton>
        <TabButton active={tab === 'quiz'} onClick={() => setTab('quiz')}>
          ✏️ 문제 풀이 {quiz.length > 0 && `(${quiz.length})`}
        </TabButton>
      </div>

      {/* 콘텐츠 */}
      {tab === 'study' ? (
        <motion.div
          key="study"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <article className="prose prose-invert prose-amber max-w-none prose-headings:text-amber-100 prose-headings:font-semibold prose-h2:mt-10 prose-h2:text-xl prose-h3:mt-6 prose-h3:text-base prose-p:leading-relaxed prose-p:text-white/85 prose-blockquote:border-amber-300/50 prose-blockquote:text-amber-100/90 prose-blockquote:bg-amber-400/5 prose-blockquote:rounded-r-lg prose-code:text-amber-200 prose-code:bg-white/5 prose-code:rounded prose-code:px-1 prose-code:before:content-none prose-code:after:content-none prose-table:text-sm prose-th:bg-white/5 prose-hr:border-white/10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </article>

          {nextNote && (
            <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4">
              <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white/80 prose-headings:text-sm prose-p:text-white/60 prose-code:text-amber-200 prose-code:bg-white/5 prose-code:rounded prose-code:px-1 prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{nextNote}</ReactMarkdown>
              </article>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-400/5 p-4 text-xs text-amber-100/80">
            ✏️ 다 읽었으면 위의 <span className="font-semibold">&ldquo;문제 풀이&rdquo;</span> 탭에서 5문제로 점검해보세요.
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="quiz"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <QuizPanel quiz={quiz} />
        </motion.div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40'
          : 'text-white/60 hover:text-white/80'
      }`}
    >
      {children}
    </button>
  );
}
