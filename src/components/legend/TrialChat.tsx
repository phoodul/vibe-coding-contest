'use client';

/**
 * Phase G-06 G06-32 (Δ9) — Trial (체험판) 메인 채팅.
 *
 * 비-베타 사용자 진입 화면. 라마누잔 페르소나만 노출, 5 거장 카드는 잠금.
 *
 * 흐름:
 *   1. /api/euler-tutor 동일 호출 (서버측 access-tier 가드는 trial → 라마누잔 baseline 만 호출)
 *   2. 일 3회 trial_ramanujan_daily quota 소진 시 402 → 베타 신청 CTA
 *   3. 5 거장 카드는 시각적으로 잠금 + "🔒 베타 신청 후 사용" + /legend/beta/apply 링크
 *
 * 베이스 UI: /euler-tutor 채팅 패턴 차용 (useChat + ReactMarkdown + KaTeX).
 */
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import 'katex/dist/katex.min.css';
import { PORTRAITS } from '@/lib/legend/portraits';
import type { TutorName } from '@/lib/legend/types';
import { StreamingMarkdown } from './StreamingMarkdown';
import { MATH_AREAS } from '@/lib/ai/euler-prompt';

interface User {
  id: string;
  email?: string | null;
}

const LEGEND_TUTORS: TutorName[] = ['gauss', 'von_neumann', 'euler', 'leibniz'];
const SUBJECT_STORAGE_KEY = 'legend_selected_subject';

export function TrialChat({ user: _user }: { user: User }) {
  const [trialQuotaError, setTrialQuotaError] = useState<{
    message: string;
    apply_url?: string;
  } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('free');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(SUBJECT_STORAGE_KEY);
    if (saved && MATH_AREAS.some((a) => a.id === saved)) {
      setSelectedSubject(saved);
    }
  }, []);

  const handleSubjectClick = (id: string) => {
    setSelectedSubject(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SUBJECT_STORAGE_KEY, id);
    }
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading, status } =
    useChat({
      api: '/api/euler-tutor',
      // selectedSubject 는 사용자 hint — 'free' 면 백엔드 자동분류.
      body: {
        useGpt: false,
        input_mode: 'text',
        subject_hint: selectedSubject === 'free' ? null : selectedSubject,
      },
      onError: (error) => {
        // 402 응답을 fetch 가 throw 하지 않으므로 onError 는 네트워크/스트림 에러용.
        // trial_quota_exceeded 는 onResponse 에서 분기.
        console.warn('[TrialChat] error:', error.message);
      },
      onResponse: async (res) => {
        if (res.status === 402) {
          try {
            const data = await res.clone().json();
            if (data?.error === 'trial_quota_exceeded' || data?.error === 'beta_only') {
              setTrialQuotaError({
                message: data?.message ?? '체험 한도를 초과했습니다.',
                apply_url: data?.apply_url ?? '/legend/beta/apply',
              });
            }
          } catch {
            // ignore parse error
          }
        }
      },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
              src="/ramanujan-portrait.jpg"
              alt="라마누잔"
              width={28}
              height={28}
              className="rounded-full object-cover ring-2 ring-violet-400/30"
            />
            <div className="text-center leading-tight">
              <h1 className="text-sm font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                Legend Tutor — 체험판
              </h1>
              <p className="text-[10px] text-white/50">라마누잔 일 3회</p>
            </div>
          </div>
          <Link
            href="/legend/beta/apply"
            className="text-[11px] px-2.5 py-1 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 transition-colors font-semibold"
          >
            🎓 베타 신청
          </Link>
        </div>
      </header>

      {/* 학년/과목 선택 chip */}
      <section className="max-w-4xl mx-auto w-full px-4 pt-6 pb-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-cyan-300/90">📚</span>
            <span className="text-xs font-semibold text-white">학년/과목</span>
            <span className="text-[10px] text-white/40">선택하면 그 과목 맞춤 코칭으로 진행돼요</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MATH_AREAS.map((a) => {
              const active = selectedSubject === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleSubjectClick(a.id)}
                  title={a.desc}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/40'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-cyan-300/30 hover:bg-cyan-400/5'
                  }`}
                >
                  <span className="mr-1">{a.icon}</span>
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 튜터 안내 (잠금) */}
      <section className="max-w-4xl mx-auto w-full px-4 pt-2 pb-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-white mb-1">
                💡 5 명의 거장 튜터, 모두 베타 사용자에게 공개됩니다
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                체험판은 <strong className="text-violet-200">라마누잔</strong> 일 3회만 가능합니다.
                <br />
                베타 신청 후 가우스·폰 노이만·오일러·라이프니츠 + 추론 트리·R1 리포트 모두 이용 가능합니다.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LEGEND_TUTORS.map((t) => {
              const p = PORTRAITS[t];
              return (
                <Link
                  key={t}
                  href="/legend/beta/apply"
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 opacity-50 hover:opacity-90 hover:border-amber-300/40 transition-all"
                >
                  <div className="relative">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      width={44}
                      height={44}
                      className="rounded-full object-cover ring-2 ring-white/10 grayscale group-hover:grayscale-0 transition-all"
                    />
                    <span className="absolute -top-1 -right-1 text-[10px]">🔒</span>
                  </div>
                  <span className="text-xs font-medium text-white/80">{p.label_ko}</span>
                  <span className="text-[9px] leading-tight text-white/40">베타 한정</span>
                </Link>
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
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border border-violet-400/30 ring-2 ring-violet-400/10">
                <Image
                  src="/ramanujan-portrait.jpg"
                  alt="라마누잔"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-sm text-white/70 mb-1">
                안녕하세요. 라마누잔이에요. 어떤 수학 문제를 같이 풀어볼까요?
              </p>
              <p className="text-xs text-white/40">
                고난도 거장 튜터는 베타 신청 후 사용 가능합니다.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, idx) => {
              const isLast = idx === messages.length - 1;
              const isStreamingNow =
                isLast &&
                m.role === 'assistant' &&
                (status === 'streaming' || status === 'submitted');
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-violet-400/30 flex-shrink-0 mt-1">
                      <Image
                        src="/ramanujan-portrait.jpg"
                        alt="라마누잔"
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-violet-500/20 border border-violet-400/30 text-white'
                        : 'bg-white/5 border border-white/10 text-white'
                    }`}
                  >
                    <div className="prose prose-invert prose-sm max-w-none">
                      <StreamingMarkdown content={m.content} streaming={isStreamingNow} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {(status === 'streaming' || status === 'submitted') &&
            messages[messages.length - 1]?.role !== 'assistant' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start gap-2"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-violet-400/30 flex-shrink-0">
                  <Image
                    src="/ramanujan-portrait.jpg"
                    alt="라마누잔"
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

          {trialQuotaError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4"
            >
              <p className="text-sm text-amber-100 mb-2">
                {trialQuotaError.message}
              </p>
              <Link
                href={trialQuotaError.apply_url ?? '/legend/beta/apply'}
                className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-xs font-bold hover:scale-105 transition-transform"
              >
                🎓 베타 신청하기 →
              </Link>
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
              placeholder="문제를 입력하세요 (체험판: 일 3회)"
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400/50 transition-colors text-sm resize-none"
              disabled={isLoading || !!trialQuotaError}
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
              disabled={isLoading || !input.trim() || !!trialQuotaError}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium text-sm disabled:opacity-40 transition-all flex-shrink-0"
            >
              전송
            </motion.button>
          </form>
          <p className="mt-2 text-center text-[10px] text-white/40">
            체험판은 라마누잔 일 3회 한정 — 더 많은 기능은{' '}
            <Link
              href="/legend/beta/apply"
              className="underline text-amber-300/80 hover:text-amber-200"
            >
              베타 신청
            </Link>{' '}
            후 이용 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
