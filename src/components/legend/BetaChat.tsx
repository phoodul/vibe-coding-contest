'use client';

/**
 * Phase G-06 G06-32 (Δ9) — Beta (베타 사용자) 메인 채팅.
 *
 * 베타 사용자 진입 화면. 5 거장 카드 활성화 + R1/R2 리포트 + Δ1 5종 quota.
 *
 * 본 컴포넌트는 베타 사용자 우선 진입점이지만, 본격적인 5튜터 SSE + 라우팅 분기 통합은
 * G-07 callTutor 위임 시점에 진입한다 (architecture §8.1, G06-26 코멘트).
 *
 * 현재 단계: 기존 /euler-tutor 채팅을 베이스로 하되 5 거장 카드 + 베타 indicator 표시.
 * 향후: TutorChoicePrompt + callTutor SSE 통합 (G-07).
 */
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useEffect, useRef, useState } from 'react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { PORTRAITS } from '@/lib/legend/portraits';
import type { TutorName } from '@/lib/legend/types';

interface User {
  id: string;
  email?: string | null;
}

const ALL_TUTORS: TutorName[] = [
  'ramanujan_intuit',
  'gauss',
  'von_neumann',
  'euler',
  'leibniz',
];

export function BetaChat({ user: _user }: { user: User }) {
  const [useGpt, setUseGpt] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorName>('ramanujan_intuit');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 라마누잔 (Tier 1) = useGpt=false → Sonnet 4.6 (G-05 격상 적용)
  // 가우스 / 폰 노이만 등 거장 = useGpt=true → GPT-5.5 (G-05 격상 적용)
  // 본격적 5튜터 분기는 G-07 callTutor 위임에서 처리 — 현 단계는 binary toggle.
  const { messages, input, handleInputChange, handleSubmit, isLoading, status } =
    useChat({
      api: '/api/euler-tutor',
      body: { area: '자유 질문', useGpt, input_mode: 'text' },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleTutorClick(tutor: TutorName) {
    setSelectedTutor(tutor);
    // 라마누잔 = 직관 (Sonnet 4.6 기본). 가우스 (Gemini) / 폰 노이만 (GPT-5.5) /
    // 오일러 (Opus 4.7) / 라이프니츠 (Sonnet 4.6 agentic) — Tier 2 본격 분기는 G-07.
    // 현재는 ramanujan/euler/leibniz = Sonnet, gauss/von_neumann = GPT 토글 매핑.
    if (tutor === 'gauss' || tutor === 'von_neumann') {
      setUseGpt(true);
    } else {
      setUseGpt(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <Link
            href="/dashboard"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            ← 대시보드
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src={PORTRAITS[selectedTutor].src}
              alt={PORTRAITS[selectedTutor].alt}
              width={28}
              height={28}
              className="rounded-full object-cover ring-2 ring-amber-400/30"
            />
            <div className="text-center leading-tight">
              <h1 className="text-sm font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Legend Tutor — 베타
              </h1>
              <p className="text-[10px] text-white/50">
                {PORTRAITS[selectedTutor].label_ko} · {PORTRAITS[selectedTutor].tier_label}
              </p>
            </div>
          </div>
          <Link
            href="/euler/report"
            className="text-[11px] px-2.5 py-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20 transition-colors font-semibold"
          >
            📊 리포트
          </Link>
        </div>
      </header>

      {/* 5 튜터 선택 카드 */}
      <section className="max-w-4xl mx-auto w-full px-4 pt-6 pb-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-amber-300/90">⭐</span>
            <span className="text-sm font-bold text-white">5 명의 거장 — 자유롭게 선택하세요</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {ALL_TUTORS.map((t) => {
              const p = PORTRAITS[t];
              const active = selectedTutor === t;
              return (
                <motion.button
                  key={t}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleTutorClick(t)}
                  className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors ${
                    active
                      ? 'border-amber-300/60 bg-amber-400/10 ring-2 ring-amber-300/30'
                      : 'border-white/10 bg-white/5 hover:border-amber-300/40 hover:bg-amber-400/5'
                  }`}
                  data-testid={`beta-tutor-${t}`}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={44}
                    height={44}
                    className="rounded-full object-cover ring-2 ring-white/10"
                  />
                  <span className="text-xs font-medium text-white">{p.label_ko}</span>
                  <span className="text-[9px] leading-tight text-white/50">
                    {p.tier_label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border border-amber-400/30 ring-2 ring-amber-400/10">
                <Image
                  src={PORTRAITS[selectedTutor].src}
                  alt={PORTRAITS[selectedTutor].alt}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-sm text-white/70 mb-1">
                안녕하세요. {PORTRAITS[selectedTutor].label_ko}이에요. 어떤 문제를 같이 풀어볼까요?
              </p>
              <p className="text-xs text-white/40">
                위에서 다른 튜터를 선택할 수도 있어요.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/30 flex-shrink-0 mt-1">
                    <Image
                      src={PORTRAITS[selectedTutor].src}
                      alt={PORTRAITS[selectedTutor].alt}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-amber-500/20 border border-amber-400/30 text-white'
                      : 'bg-white/5 border border-white/10 text-white'
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(status === 'streaming' || status === 'submitted') &&
            messages[messages.length - 1]?.role !== 'assistant' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start gap-2"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/30 flex-shrink-0">
                  <Image
                    src={PORTRAITS[selectedTutor].src}
                    alt={PORTRAITS[selectedTutor].alt}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                  <span className="text-sm text-white/60 animate-pulse">
                    문제를 분석하고 있어요...
                  </span>
                </div>
              </motion.div>
            )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 */}
      <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/70 backdrop-blur-xl px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="문제를 입력하세요 (베타: 일 5문제 + 거장 일 3회)"
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
              disabled={isLoading}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 160) + 'px';
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-medium text-sm disabled:opacity-40 transition-all flex-shrink-0"
            >
              전송
            </motion.button>
          </form>
          <p className="mt-2 text-center text-[10px] text-white/40">
            베타 한도: 일 5문제 + 거장 일 3회 (자정 KST 리셋)
          </p>
        </div>
      </div>
    </div>
  );
}
