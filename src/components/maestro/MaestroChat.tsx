'use client';

/**
 * 24차 (2026-05-10) B1a — Maestro 4 과목 (Earth Science / Biology / Physics / Chemistry)
 * 전용 채팅 컴포넌트. LegendChat 으로부터 진짜 분리.
 *
 * 23차까지 thin wrapper 였으나 LegendChat 1076 줄에 산재한 maestro 분기를 본 컴포넌트로
 * 추출. LegendChat 은 math 전용으로 단순화 (B1b 후속 commit).
 *
 * Maestro 특징 (Legend 와 차이):
 *   - 4 인물 거장 카드 (subject 별 매핑) — math 5명과 다름
 *   - Sonnet (idx 0) "곧 출시" disabled / Gemini (idx 1) "추천" default
 *   - I / II variant chip (math 의 영역 chip 대신)
 *   - useChat api = `/api/maestro/${subject}/tutor` (subject 전용 라우트)
 *   - ScienceExamPanel (수능 기출, 이미지 첨부 multimodal marker)
 *   - MaestroSolutionSummaryButton + MaestroSummaryCard (Legend 의 ToT 트리와 다른 구조)
 *   - localStorage 누적 (recent_summaries, 5 건 limit)
 *   - 후기 링크 X (Maestro 는 베타테스트 X — 사용자 결정 2026-05-06)
 *   - betaMeta 카운트다운 X (Maestro 는 만료 정책 X)
 */
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'katex/dist/katex.min.css';
import {
  EARTH_SCIENCE_PORTRAITS,
  BIOLOGY_PORTRAITS,
  PHYSICS_PORTRAITS,
  CHEMISTRY_PORTRAITS,
} from '@/lib/legend/portraits';
import type {
  EarthScienceTutorName,
  BiologyTutorName,
  PhysicsTutorName,
  ChemistryTutorName,
  MaestroTutorName,
  Subject,
} from '@/lib/legend/types';
import { InlineHandwritePanel } from '@/components/legend/InlineHandwritePanel';
import { StreamingMarkdown } from '@/components/legend/StreamingMarkdown';
import { ScienceExamPanel, type ExamSelection } from '@/components/maestro/ScienceExamPanel';
import {
  MaestroSolutionSummaryButton,
  type MaestroSummaryResponse,
} from '@/components/maestro/MaestroSolutionSummaryButton';
import { MaestroSummaryCard } from '@/components/maestro/MaestroSummaryCard';

interface User {
  id: string;
  email?: string | null;
}

/** Maestro 4 과목 — math · korean · english 제외 */
type MaestroSubject = Exclude<Subject, 'math' | 'korean' | 'english'>;

/** subject 별 4 인물 순서 — UI 카드 위치 + 모델 매핑
 *  (1번=Sonnet "곧 출시", 2번=Gemini "추천", 3번=Opus, 4번=GPT-5.5) */
const TUTORS_BY_SUBJECT: Record<MaestroSubject, readonly MaestroTutorName[]> = {
  'earth-science': ['wegener', 'galilei', 'hubble', 'sagan'],
  biology: ['pasteur', 'mendel', 'watson', 'darwin'],
  physics: ['fermi', 'einstein', 'feynman', 'newton'],
  chemistry: ['curie', 'lavoisier', 'pauling', 'mendeleev'],
};

const SUBJECT_HEADER_LABEL: Record<MaestroSubject, string> = {
  'earth-science': 'Earth Science Maestro',
  biology: 'Biology Maestro',
  physics: 'Physics Maestro',
  chemistry: 'Chemistry Maestro',
};

const SUBJECT_VARIANT_LABEL: Record<string, { label: string; icon: string }> = {
  'earth-science-I': { label: '지구과학Ⅰ', icon: '🌍' },
  'earth-science-II': { label: '지구과학Ⅱ', icon: '🌌' },
  'biology-I': { label: '생명과학Ⅰ', icon: '🧬' },
  'biology-II': { label: '생명과학Ⅱ', icon: '🧪' },
  'physics-I': { label: '물리학Ⅰ', icon: '⚛️' },
  'physics-II': { label: '물리학Ⅱ', icon: '🔬' },
  'chemistry-I': { label: '화학Ⅰ', icon: '🧫' },
  'chemistry-II': { label: '화학Ⅱ', icon: '⚗️' },
};

/**
 * 22차 (2026-05-08) — 과목별 입력 placeholder.
 * 학생이 *없이 자연 표기 (F=ma, H2O 등) 가능함을 미리 안내. system prompt 의
 * INPUT_PARSING_RULES 와 짝.
 */
const PLACEHOLDER_BY_SUBJECT: Record<MaestroSubject, string> = {
  physics: '예: F=ma, v=20m/s, E=mc² · 필기(✏️) · 사진(📸)',
  chemistry: '예: H2O, 2H2 + O2 -> 2H2O · 필기(✏️) · 사진(📸)',
  biology: '예: AaBb × aabb, 9:3:3:1 · 필기(✏️) · 사진(📸)',
  'earth-science': '예: 30km, 위도 35°N, 마그마 · 필기(✏️) · 사진(📸)',
};

function getPortrait(subject: MaestroSubject, tutor: MaestroTutorName) {
  if (subject === 'earth-science') return EARTH_SCIENCE_PORTRAITS[tutor as EarthScienceTutorName];
  if (subject === 'biology') return BIOLOGY_PORTRAITS[tutor as BiologyTutorName];
  if (subject === 'physics') return PHYSICS_PORTRAITS[tutor as PhysicsTutorName];
  return CHEMISTRY_PORTRAITS[tutor as ChemistryTutorName];
}

function getVariants(subject: MaestroSubject): Array<{ id: string; label: string; icon: string }> {
  const out: Array<{ id: string; label: string; icon: string }> = [];
  for (const v of ['I', 'II']) {
    const key = `${subject}-${v}`;
    const meta = SUBJECT_VARIANT_LABEL[key];
    if (meta) out.push({ id: key, ...meta });
  }
  return out;
}

/**
 * G06-33a (Δ10) — build-summary 입력용 problem_text 추출.
 * Δ13 fix: 첫 user 메시지(원문제) 추출.
 */
function extractFirstUserText(messages: Array<{ role: string; content: unknown }>): string {
  for (const m of messages) {
    if (m.role !== 'user') continue;
    if (typeof m.content === 'string') return m.content;
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

export interface MaestroChatProps {
  user: User;
  subject: MaestroSubject;
}

export function MaestroChat({ user: _user, subject }: MaestroChatProps) {
  const tutorList = TUTORS_BY_SUBJECT[subject];

  const [selectedTutor, setSelectedTutor] = useState<MaestroTutorName>(
    tutorList[1] ?? tutorList[0] ?? 'galilei',
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(`${subject}-I`);
  const [activeView, setActiveView] = useState<'chat' | 'past-exam'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentPortrait = useMemo(
    () => getPortrait(subject, selectedTutor),
    [subject, selectedTutor],
  );

  const [maestroSummary, setMaestroSummary] = useState<MaestroSummaryResponse | null>(null);

  // 20차 — maestro 수능 영역 PNG preview (message id → image url 매핑).
  const [attachedByMsgId, setAttachedByMsgId] = useState<Record<string, string>>({});

  // Δ13 — 필기/사진 입력 채널
  const [handwriteOpen, setHandwriteOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 22차 — Maestro/Legend 분리. subject 별 전용 라우트.
  // selected_tutor 가 모델 결정 (useGpt 무시).
  const { messages, input, handleInputChange, handleSubmit, isLoading, status, append } =
    useChat({
      api: `/api/maestro/${subject}/tutor`,
      body: {
        useGpt: false,
        input_mode: 'text',
        subject_hint: selectedSubject,
        subject,
        selected_tutor: selectedTutor,
      },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 마지막 메시지 = assistant 이고 스트리밍 종료 시점 → 풀이 정리 버튼 노출 가능
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const canShowSummaryButton =
    lastMsg?.role === 'assistant' &&
    !isLoading &&
    status !== 'streaming' &&
    status !== 'submitted';
  const firstUserText = useMemo(() => extractFirstUserText(messages), [messages]);

  // Δ13 — 필기 OCR 결과 채팅에 append
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

  // Δ13 — 이미지 업로드
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // 2026-05-31 — 스크린샷 즉시 첨부. textarea 포커스와 무관하게 페이지 어디서든
  // (PrintScreen / ⊞+Shift+S 캡처 직후) Ctrl+V 하면 클립보드 이미지를 바로 미리보기.
  // document 전역 리스너 — paste 이벤트는 버블링되므로 textarea 안 paste 도 함께 처리.
  useEffect(() => {
    const onDocPaste = (e: ClipboardEvent) => {
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
    };
    document.addEventListener('paste', onDocPaste);
    return () => document.removeEventListener('paste', onDocPaste);
  }, []);

  // Δ13 — 이미지 전송 (Upstage parse → fallback Vision)
  // 주: parse-image 라우트는 legend 공유 (math 와 동일 OCR 파이프라인)
  const sendImage = useCallback(async () => {
    if (!imagePreview) return;
    setParsing(true);
    try {
      const parseRes = await fetch('/api/legend/tutor/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imagePreview }),
      });
      const parseData = await parseRes.json();

      if (parseData.text && !parseData.fallback) {
        append({
          role: 'user',
          content: `[문제 이미지에서 추출된 텍스트]\n\n${parseData.text}\n\n${input.trim() || '이 문제를 같이 풀어보고 싶어요.'}`,
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

  // 19차 (2026-05-07): question 단위 image + Upstage markdown 자동 첨부 (multimodal)
  // v15 — useChat v4 의 body/data 옵션 둘 다 server 까지 안 도달.
  // 우회: message.content 에 image URL marker 포함 → server 가 정규식으로 추출.
  const handleSelectScienceExam = useCallback(
    async (sel: ExamSelection) => {
      setActiveView('chat');
      const subjectKo =
        sel.subject === 'earth-science'
          ? '지구과학'
          : sel.subject === 'biology'
            ? '생명과학'
            : sel.subject === 'physics'
              ? '물리학'
              : '화학';
      const variant = sel.variant === 'I' ? 'Ⅰ' : 'Ⅱ';
      const header = `[${sel.year}학년도 수능 ${subjectKo}${variant} ${sel.number}번]`;

      try {
        const { getSuneungQuestionImage } = await import('@/lib/data/suneung-question-manifest');
        const imageUrl = getSuneungQuestionImage(sel.subject, sel.variant, sel.year, sel.number);

        const requestText = `${header} 이 문제를 함께 풀어주세요.`;

        if (!imageUrl) {
          await append({ role: 'user', content: requestText });
          return;
        }

        const msgId = `maestro-${sel.subject}-${sel.variant}-${sel.year}-${sel.number}-${Date.now()}`;
        setAttachedByMsgId((prev) => ({ ...prev, [msgId]: imageUrl }));
        const contentWithMarker = `${requestText}\n\n[__MAESTRO_IMG__]${imageUrl}[/__MAESTRO_IMG__]`;
        await append({ id: msgId, role: 'user', content: contentWithMarker });
      } catch {
        await append({ role: 'user', content: header });
      }
    },
    [append],
  );

  function handleTutorClick(tutor: MaestroTutorName) {
    setSelectedTutor(tutor);
    // maestro 4 인물 = useGpt 무시. selected_tutor 가 모델 결정 (API 라우트).
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
              src={currentPortrait.src}
              alt={currentPortrait.alt}
              width={28}
              height={28}
              className="rounded-full object-cover ring-2 ring-amber-400/30"
            />
            <div className="text-center leading-tight">
              <h1 className="text-sm font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                {SUBJECT_HEADER_LABEL[subject]}
              </h1>
              <p className="text-[10px] text-white/50">
                {currentPortrait.label_ko} · {currentPortrait.tier_label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/maestro/${subject}/triggers`}
              className="text-[11px] px-2.5 py-1 rounded-full border border-violet-400/40 bg-violet-400/10 text-violet-200 hover:bg-violet-400/20 transition-colors font-semibold"
            >
              🎯 Trigger
            </Link>
            <Link
              href={`/maestro/${subject}/report`}
              className="text-[11px] px-2.5 py-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20 transition-colors font-semibold"
            >
              📊 리포트
            </Link>
          </div>
        </div>
      </header>

      {/* 학년/과목 (I·II) chip */}
      <section className="max-w-4xl mx-auto w-full px-4 pt-6 pb-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-cyan-300/90">📚</span>
            <span className="text-xs font-semibold text-white">학년/과목</span>
            <span className="text-[10px] text-white/40">선택하면 그 과목 맞춤 코칭으로 진행돼요</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {getVariants(subject).map((v) => {
              const active = selectedSubject === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedSubject(v.id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/40'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-cyan-300/30 hover:bg-cyan-400/5'
                  }`}
                  data-testid={`maestro-subject-${v.id}`}
                >
                  <span className="mr-1">{v.icon}</span>
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 거장 4 카드 */}
      <section className="max-w-4xl mx-auto w-full px-4 pt-2 pb-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-amber-300/90">⭐</span>
            <span className="text-sm font-bold text-white">
              4 명의 거장 — 자유롭게 선택하세요
            </span>
          </div>
          <div className="grid gap-2 grid-cols-4">
            {tutorList.map((t, idx) => {
              const p = getPortrait(subject, t);
              const active = selectedTutor === t;
              // 19차 (2026-05-07): 첫 인물 (Sonnet) "곧 출시" disabled, 둘째 (Gemini) "추천".
              const isComingSoon = idx === 0;
              const isRecommended = idx === 1;
              return (
                <motion.button
                  key={t}
                  whileHover={isComingSoon ? undefined : { y: -2 }}
                  whileTap={isComingSoon ? undefined : { scale: 0.97 }}
                  type="button"
                  disabled={isComingSoon}
                  onClick={() => !isComingSoon && handleTutorClick(t)}
                  className={`group relative flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors ${
                    isComingSoon
                      ? 'cursor-not-allowed border-white/5 bg-white/5 opacity-50'
                      : active
                        ? 'border-amber-300/60 bg-amber-400/10 ring-2 ring-amber-300/30'
                        : 'border-white/10 bg-white/5 hover:border-amber-300/40 hover:bg-amber-400/5'
                  }`}
                  data-testid={`tutor-${t}`}
                  title={
                    isComingSoon
                      ? `${p.label_ko} — 곧 출시 (모델 준비 중)`
                      : isRecommended
                        ? `${p.label_ko} — 추천`
                        : p.label_ko
                  }
                >
                  {isComingSoon && (
                    <span className="absolute right-1 top-1 rounded-full bg-slate-700/80 px-1.5 py-0.5 text-[8px] font-semibold text-white/70">
                      곧
                    </span>
                  )}
                  {isRecommended && (
                    <span className="absolute right-1 top-1 rounded-full bg-emerald-500/80 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                      추천
                    </span>
                  )}
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={44}
                    height={44}
                    className={`rounded-full object-cover ring-2 ${
                      isComingSoon ? 'ring-white/5 grayscale' : 'ring-white/10'
                    }`}
                  />
                  <span className="text-xs font-medium text-white">{p.label_ko}</span>
                  <span className="text-[9px] leading-tight text-white/50">
                    {isComingSoon ? '곧 출시' : p.tier_label}
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
          <ScienceExamPanel subject={subject} onSelect={handleSelectScienceExam} />
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
                      src={currentPortrait.src}
                      alt={currentPortrait.alt}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-sm text-white/70 mb-1">
                    안녕하세요. {currentPortrait.label_ko}이에요. 어떤 문제를 같이 풀어볼까요?
                  </p>
                  <p className="text-xs text-white/40">위에서 다른 튜터를 선택할 수도 있어요.</p>
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
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/30 flex-shrink-0 mt-1">
                          <Image
                            src={currentPortrait.src}
                            alt={currentPortrait.alt}
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
                        {/* multimodal user 메시지 — 이미지 + 텍스트 모두 표시
                            attachedByMsgId 매핑이 있으면 user 메시지 카드 위에 image preview */}
                        {Array.isArray(m.content) ? (
                          <div className="space-y-2">
                            {(
                              m.content as Array<{ type?: string; image?: string; text?: string }>
                            ).map((p, i) => {
                              if (p.type === 'image' && typeof p.image === 'string') {
                                return (
                                  <a
                                    key={i}
                                    href={p.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={p.image}
                                      alt={`첨부 ${i + 1}`}
                                      className="rounded-lg max-w-full h-auto border border-white/10"
                                    />
                                  </a>
                                );
                              }
                              if (p.type === 'text' && typeof p.text === 'string') {
                                return (
                                  <div key={i} className="prose prose-invert prose-sm max-w-none">
                                    <StreamingMarkdown
                                      content={p.text}
                                      streaming={isStreamingNow}
                                    />
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        ) : attachedByMsgId[m.id] ? (
                          <div className="space-y-2">
                            <a
                              href={attachedByMsgId[m.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={attachedByMsgId[m.id]}
                                alt="첨부 시험지"
                                className="rounded-lg max-w-full h-auto border border-white/10"
                              />
                            </a>
                            <div className="prose prose-invert prose-sm max-w-none">
                              <StreamingMarkdown
                                content={
                                  typeof m.content === 'string'
                                    ? m.content.replace(
                                        /\n*\[__MAESTRO_IMG__\][^[]*\[\/__MAESTRO_IMG__\]/g,
                                        '',
                                      )
                                    : m.content
                                }
                                streaming={isStreamingNow}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-sm max-w-none">
                            <StreamingMarkdown
                              content={
                                typeof m.content === 'string'
                                  ? m.content.replace(
                                      /\n*\[__MAESTRO_IMG__\][^[]*\[\/__MAESTRO_IMG__\]/g,
                                      '',
                                    )
                                  : m.content
                              }
                              streaming={isStreamingNow}
                            />
                          </div>
                        )}
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
                        src={currentPortrait.src}
                        alt={currentPortrait.alt}
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

              {/* 22차 — Maestro 풀이 정리 버튼 (subject 별 가벼운 정리) */}
              {canShowSummaryButton && firstUserText && !maestroSummary && (
                <MaestroSolutionSummaryButton
                  subject={subject}
                  tutor={selectedTutor}
                  problemText={firstUserText}
                  conversation={messages}
                  onSummaryReady={(response) => {
                    setMaestroSummary(response);
                    // 22차 — /maestro/[subject]/report 의 "최근 풀이 정리" 카드용
                    // localStorage 누적. 20건 limit. DB 누적은 다음 commit.
                    try {
                      const key = 'maestro_recent_summaries';
                      const raw = localStorage.getItem(key);
                      const arr = raw ? (JSON.parse(raw) as Array<unknown>) : [];
                      const next = [
                        {
                          date: new Date().toISOString().slice(0, 10),
                          subject: response.subject,
                          tutor: response.tutor_label,
                          takeaway: response.summary.persona_takeaway,
                        },
                        ...(Array.isArray(arr) ? arr : []),
                      ].slice(0, 20);
                      localStorage.setItem(key, JSON.stringify(next));
                    } catch {}
                  }}
                />
              )}

              {/* 22차 — Maestro 풀이 정리 카드 */}
              {maestroSummary && (
                <div className="mt-4">
                  <MaestroSummaryCard data={maestroSummary} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 입력 */}
          <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/70 backdrop-blur-xl px-4 py-3">
            <div className="max-w-4xl mx-auto">
              {/* Δ13 — 필기 패널 */}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder={PLACEHOLDER_BY_SUBJECT[subject]}
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
                📋 화면 캡처 후 <kbd className="rounded bg-white/10 px-1">Ctrl</kbd>+
                <kbd className="rounded bg-white/10 px-1">V</kbd> 로 바로 첨부 · 입력{' '}
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
