'use client';

/**
 * Phase G-06 G06-32 (Δ9) + G06-33 (Δ10) — Beta (베타 사용자) 메인 채팅.
 *
 * 베타 사용자 진입 화면. 5 거장 카드 활성화 + R1/R2 리포트 + Δ1 5종 quota.
 *
 * G06-33 추가:
 *   - 마지막 assistant 메시지 직후 SolutionSummaryButton (📝 풀이 정리 보기)
 *   - 클릭 → /api/legend/build-summary POST → 인라인 PerProblemReportCard
 *   - LaTeX 스트리밍 깜빡임 fix (rehypeKatex throwOnError:false + errorColor 회색)
 *   - 홀수 $ 감지 시 KaTeX 렌더 보류 (incomplete LaTeX raw 출력)
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'katex/dist/katex.min.css';
import { PORTRAITS } from '@/lib/legend/portraits';
import type { PerProblemReport, TutorName } from '@/lib/legend/types';
import { InlineHandwritePanel } from '@/components/legend/InlineHandwritePanel';
import { SolutionSummaryButton } from './SolutionSummaryButton';
import { PerProblemReportCard } from './PerProblemReportCard';
import { StreamingMarkdown } from './StreamingMarkdown';
import { MATH_AREAS } from '@/lib/ai/euler-prompt';
import { PastExamPanel } from './PastExamPanel';
import problemTexts from '@/lib/data/problem-texts.json';
import type { MathProblem } from '@/lib/data/math-problems';

interface User {
  id: string;
  email?: string | null;
}

interface BetaMeta {
  is_active: boolean;
  expires_at: string | null;
  days_left: number | null;
}

const ALL_TUTORS: TutorName[] = [
  'ramanujan_intuit',
  'gauss',
  'von_neumann',
  'euler',
  'leibniz',
];

/**
 * G06-33a (Δ10) — build-summary 입력용 problem_text 추출.
 * Δ13 fix: 마지막 user 가 아닌 **첫** user 메시지(원문제) 추출.
 *   이전: 풀이 중간 짧은 user 메시지 ("이걸 인수분해할게요") 가 problem_text 로 전달되어
 *         routeProblem 이 난이도 1로 분류 → ToT 트리가 빈약했음.
 *   현재: 첫 user 메시지 = 원문제 → routeProblem 이 정확한 난이도 분류 → ToT 풍부.
 */
function extractFirstUserText(messages: Array<{ role: string; content: unknown }>): string {
  for (const m of messages) {
    if (m.role !== 'user') continue;
    if (typeof m.content === 'string') return m.content;
    // multimodal (필기/사진) — text 부분만 합치기
    if (Array.isArray(m.content)) {
      const parts = m.content as { type?: string; text?: string }[];
      const text = parts
        .filter((p) => p.type === 'text' && p.text)
        .map((p) => p.text!)
        .join('\n');
      if (text) return text;
    }
  }
  return '';
}

const SUBJECT_STORAGE_KEY = 'legend_selected_subject';

export function BetaChat({ user: _user, betaMeta }: { user: User; betaMeta?: BetaMeta }) {
  const [useGpt, setUseGpt] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorName>('ramanujan_intuit');
  const [selectedSubject, setSelectedSubject] = useState<string>('free');
  const [activeView, setActiveView] = useState<'chat' | 'past-exam'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 학년/과목 선택 localStorage hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(SUBJECT_STORAGE_KEY);
    if (saved && MATH_AREAS.some((a) => a.id === saved)) {
      setSelectedSubject(saved);
    }
  }, []);

  const handleSubjectClick = useCallback((id: string) => {
    setSelectedSubject(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SUBJECT_STORAGE_KEY, id);
    }
  }, []);

  // G06-33: 풀이 정리 인라인 카드 상태 (마지막 assistant 메시지 1개만 유지)
  const [inlineReport, setInlineReport] = useState<PerProblemReport | null>(null);

  // Δ13 — 필기/사진 입력 채널 (EulerTutorPage 패턴 차용)
  const [handwriteOpen, setHandwriteOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 라마누잔 (Tier 1) = useGpt=false → Sonnet 4.6 (G-05 격상 적용)
  // 가우스 / 폰 노이만 등 거장 = useGpt=true → GPT-5.5 (G-05 격상 적용)
  // 본격적 5튜터 분기는 G-07 callTutor 위임에서 처리 — 현 단계는 binary toggle.
  // P0-01b: area 자동분류는 backend Manager 가 problem_text 분석으로 처리 (보존).
  // selectedSubject 는 사용자가 명시적으로 선택한 학년/과목 hint — 'free' 면 백엔드 자동분류.
  const { messages, input, handleInputChange, handleSubmit, isLoading, status, append } =
    useChat({
      api: '/api/euler-tutor',
      body: {
        useGpt,
        input_mode: 'text',
        subject_hint: selectedSubject === 'free' ? null : selectedSubject,
      },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 수능 기출 문제 클릭 → 채팅 탭으로 전환 + 문제 텍스트 prefill
  const handleSelectExamProblem = useCallback(
    (problem: MathProblem) => {
      setActiveView('chat');
      setTimeout(() => {
        const textKey = `${problem.year}_${problem.type}_${problem.number}`;
        const raw = (problemTexts as Record<string, string>)[textKey];
        // 문제와 보기 사이 빈 줄 + 보기 각 항목 줄바꿈 보장
        const formatted = raw
          ?.replace(/\n(\(1\))/, '\n\n$1')
          .replace(/\n(\(\d\))/g, '  \n$1');
        const header = `[${problem.year}학년도 수능 ${problem.type} ${problem.number}번 — ${problem.isMultipleChoice ? '객관식' : '주관식'}]`;
        const content = formatted
          ? `${header}\n\n${formatted}\n\n이 문제를 같이 풀어보고 싶어요!`
          : `${header}\n\n이 문제를 함께 풀어보고 싶어요. 문제를 보여주시면 같이 풀어볼게요!`;
        append({ role: 'user', content });
      }, 200);
    },
    [append],
  );

  // 새 메시지가 시작되면 이전 inline report 숨김 (메시지당 1 정리)
  useEffect(() => {
    if (status === 'submitted') {
      setInlineReport(null);
    }
  }, [status]);

  // 마지막 메시지가 assistant 인지 + 풀이 정리 버튼 노출 가능 시점 판정
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const canShowSummaryButton =
    lastMsg?.role === 'assistant' &&
    !isLoading &&
    status !== 'streaming' &&
    status !== 'submitted';
  // Δ13 — 첫 user 메시지(원문제) 를 build-summary 에 전달 (마지막 user 짧은 계산 단계 회피)
  const firstUserText = useMemo(() => extractFirstUserText(messages), [messages]);

  // Δ13 — 필기 OCR 결과를 채팅에 append
  const handleHandwriteResult = useCallback(
    (text: string) => {
      const isFirst = messages.length === 0;
      append({
        role: 'user',
        content: isFirst
          ? `[필기로 입력]\n\n${text}\n\n이 문제를 같이 풀어보고 싶어요!`
          : `[필기로 입력한 답/풀이]\n\n${text}`,
      });
    },
    [append, messages.length],
  );

  // Δ13 — 이미지 업로드 핸들러
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // Δ13 — 클립보드 paste 이미지 (스크린샷 → Ctrl+V)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }
    }
  }, []);

  // Δ13 — 이미지 전송 (Upstage parse → fallback Vision)
  const sendImage = useCallback(async () => {
    if (!imagePreview) return;
    setParsing(true);
    try {
      const parseRes = await fetch('/api/euler-tutor/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imagePreview }),
      });
      const parseData = await parseRes.json();

      if (parseData.text && !parseData.fallback) {
        append({
          role: 'user',
          content: `[수학 문제 이미지에서 추출된 텍스트]\n\n${parseData.text}\n\n${input.trim() || '이 문제를 같이 풀어보고 싶어요.'}`,
        });
      } else {
        const [header, base64] = imagePreview.split(',');
        const mimeMatch = header.match(/data:(.+);base64/);
        const mimeType = mimeMatch?.[1] || 'image/jpeg';
        append({
          role: 'user',
          content: [
            { type: 'image', image: `data:${mimeType};base64,${base64}` },
            { type: 'text', text: input.trim() || '이 문제를 같이 풀어보고 싶어요.' },
          ] as unknown as string,
        });
      }
    } catch {
      const [header, base64] = imagePreview.split(',');
      const mimeMatch = header.match(/data:(.+);base64/);
      const mimeType = mimeMatch?.[1] || 'image/jpeg';
      append({
        role: 'user',
        content: [
          { type: 'image', image: `data:${mimeType};base64,${base64}` },
          { type: 'text', text: input.trim() || '이 문제를 같이 풀어보고 싶어요.' },
        ] as unknown as string,
      });
    } finally {
      setParsing(false);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [imagePreview, input, append]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (imagePreview) {
        sendImage();
      } else {
        handleSubmit(e);
      }
    },
    [imagePreview, sendImage, handleSubmit],
  );

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
          <div className="flex items-center gap-1.5">
            {/* Δ28 — 베타 만료 카운트다운 (≤ 7일 임박 시 amber, 평시 emerald) */}
            {betaMeta?.is_active && betaMeta.days_left !== null && (
              <span
                className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${
                  betaMeta.days_left <= 0
                    ? 'border-rose-400/40 bg-rose-400/10 text-rose-200'
                    : betaMeta.days_left <= 7
                      ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                      : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                }`}
                title={
                  betaMeta.expires_at
                    ? `만료: ${new Date(betaMeta.expires_at).toLocaleDateString('ko-KR')}`
                    : ''
                }
              >
                {betaMeta.days_left <= 0 ? '⚠ 만료' : `⏳ ${betaMeta.days_left}일`}
              </span>
            )}
            <Link
              href="/legend/triggers"
              className="text-[11px] px-2.5 py-1 rounded-full border border-violet-400/40 bg-violet-400/10 text-violet-200 hover:bg-violet-400/20 transition-colors font-semibold"
            >
              🎯 Trigger
            </Link>
            <Link
              href="/legend/beta/review"
              className="text-[11px] px-2.5 py-1 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 transition-colors font-semibold"
            >
              📝 후기
            </Link>
            <Link
              href="/legend/report"
              className="text-[11px] px-2.5 py-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20 transition-colors font-semibold"
            >
              📊 리포트
            </Link>
          </div>
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
                  data-testid={`beta-subject-${a.id}`}
                >
                  <span className="mr-1">{a.icon}</span>
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 튜터 선택 카드 */}
      <section className="max-w-4xl mx-auto w-full px-4 pt-2 pb-3">
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

      {/* AI 코칭 / 수능 기출 탭 */}
      <section className="max-w-4xl mx-auto w-full px-4 pt-1 pb-2">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveView('chat')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              activeView === 'chat'
                ? 'bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🗨️ AI 코칭
          </button>
          <button
            type="button"
            onClick={() => setActiveView('past-exam')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              activeView === 'past-exam'
                ? 'bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            📜 수능 기출
          </button>
        </div>
      </section>

      {activeView === 'past-exam' ? (
        <section className="max-w-4xl mx-auto w-full flex-1 px-4 pb-6">
          <PastExamPanel onSelectProblem={handleSelectExamProblem} />
        </section>
      ) : (
        <>
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
            {messages.map((m, idx) => {
              // 스트리밍 중인 마지막 assistant 메시지에만 deferred 렌더 (typewriter throttle)
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

          {/* G06-33 — 풀이 정리 버튼 (마지막 assistant 직후, 스트리밍 종료 시) */}
          {/* G06-35b — selectedTutor 전달: 채팅 튜터와 정리 튜터 일관성 강제 */}
          {/* Δ13 — firstUserText (원문제) 전달: 짧은 마지막 user → 난이도 1 오판정 fix */}
          {/* Δ14 — conversation 전달: 학생 막힘 5 차원 (stuck_step·trigger·AI hint·resolution) */}
          {canShowSummaryButton && firstUserText && !inlineReport && (
            <SolutionSummaryButton
              problemText={firstUserText}
              selectedTutor={selectedTutor}
              conversation={messages}
              onSummaryReady={(report) => setInlineReport(report)}
            />
          )}

          {/* G06-33 — 인라인 PerProblemReportCard (ToT + AI 어려움 + 떠올린 이유) */}
          {inlineReport && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4"
            >
              <PerProblemReportCard report={inlineReport} />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 */}
      <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/70 backdrop-blur-xl px-4 py-3">
        <div className="max-w-4xl mx-auto">
          {/* Δ13 — 필기 패널 (handwriteOpen 시 펼침) */}
          <InlineHandwritePanel
            open={handwriteOpen}
            onClose={() => setHandwriteOpen(false)}
            onConfirm={(text) => {
              handleHandwriteResult(text);
              setHandwriteOpen(false);
            }}
          />

          {/* Δ13 — 이미지 미리보기 */}
          {imagePreview && (
            <div className="mb-2 rounded-xl border border-amber-400/30 bg-amber-400/5 p-2">
              <div className="flex items-start gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="문제 이미지"
                  className="max-h-32 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-white/60 hover:text-white"
                  aria-label="이미지 제거"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-[10px] text-amber-200/70">
                {parsing ? '이미지 인식 중...' : '전송 버튼을 누르면 거장이 분석합니다.'}
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex gap-2 items-end">
            {/* Δ13 — 필기 버튼 */}
            <button
              type="button"
              onClick={() => setHandwriteOpen((v) => !v)}
              disabled={isLoading || parsing}
              className="px-3 py-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20 transition-colors disabled:opacity-40 flex-shrink-0"
              title="필기로 입력"
              aria-label="필기로 입력"
            >
              ✏️
            </button>

            {/* Δ13 — 사진 업로드 버튼 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || parsing}
              className="px-3 py-3 rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20 transition-colors disabled:opacity-40 flex-shrink-0"
              title="사진·스크린샷 업로드 (Ctrl+V 도 가능)"
              aria-label="사진 업로드"
            >
              📸
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <textarea
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="문제 입력 · 필기(✏️) · 사진(📸) · Ctrl+V 스크린샷"
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
              disabled={isLoading || parsing}
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
              disabled={isLoading || parsing || (!input.trim() && !imagePreview)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-medium text-sm disabled:opacity-40 transition-all flex-shrink-0"
            >
              전송
            </motion.button>
          </form>
          <p className="mt-2 text-center text-[10px] text-white/40">
            베타 한도: 일 5문제 + 거장 일 3회 (자정 KST 리셋) · 입력{' '}
            <Link href="/legend/help" className="underline hover:text-white/70">
              가이드
            </Link>
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
