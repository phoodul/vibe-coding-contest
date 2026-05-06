/**
 * 19차 Phase B5-h (2026-05-06) — Maestro 단순 chat 컴포넌트.
 *
 * Earth Science Maestro PoC. Legend BetaChat 의 단순화 버전 — Manager·retriever·
 * critic 등 수학 인프라 의존 없이 4 인물 chip + ScienceExamPanel + 캡쳐 입력만.
 *
 * 4 인물 (베게너·갈릴레이·허블·세이건) = 모델의 차이만. 학생에게 모델명 비공개.
 * 채팅 body 에 selected_tutor 전달 → /api/legend/tutor 가 페르소나·모델 매핑.
 */
'use client';

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { useChat } from 'ai/react';
import { motion } from 'framer-motion';
import { StreamingMarkdown } from '@/components/legend/StreamingMarkdown';
import { ScienceExamPanel, type ExamSelection } from './ScienceExamPanel';
import {
  EARTH_SCIENCE_PORTRAITS,
  PERSONAS_BY_SUBJECT,
} from '@/lib/legend/portraits';
import type {
  Subject,
  EarthScienceTutorName,
  MaestroTutorName,
} from '@/lib/legend/types';

interface MaestroChatProps {
  subject: Subject;
  user: { id: string; email: string | null };
}

const SUBJECT_TITLE: Record<string, string> = {
  'earth-science': '지구과학 Maestro',
  biology: '생명과학 Maestro',
  physics: '물리학 Maestro',
  chemistry: '화학 Maestro',
};

export function MaestroChat({ subject, user: _user }: MaestroChatProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'past-exam'>('chat');
  const [selectedTutor, setSelectedTutor] = useState<MaestroTutorName>('wegener');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personas = PERSONAS_BY_SUBJECT[subject] ?? [];

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
    useChat({
      api: '/api/legend/tutor',
      body: {
        useGpt: false, // unused for maestro path (selected_tutor 가 우선)
        input_mode: 'text',
        subject,
        selected_tutor: selectedTutor,
      },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function getPortrait(t: MaestroTutorName) {
    if (subject === 'earth-science') {
      return EARTH_SCIENCE_PORTRAITS[t as EarthScienceTutorName];
    }
    return undefined;
  }

  function handleExamSelect(sel: ExamSelection) {
    const subjectKo =
      sel.subject === 'earth-science'
        ? '지구과학'
        : sel.subject === 'biology'
          ? '생명과학'
          : sel.subject === 'physics'
            ? '물리학'
            : '화학';
    const variant = sel.variant === 'I' ? 'Ⅰ' : 'Ⅱ';
    const prefill = `${sel.year}학년도 ${subjectKo}${variant} ${sel.number}번을 풀어보고 싶어요. 문제 페이지를 캡쳐해서 올릴게요.`;
    void append({ role: 'user', content: prefill });
    setActiveTab('chat');
  }

  function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    handleSubmit(e);
  }

  return (
    <div className="space-y-4">
      {/* 4 인물 chip */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-[11px] font-medium text-white/60">
          함께 풀 인물을 골라주세요 (다시 바꿀 수 있어요)
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {personas.map((t) => {
            const p = getPortrait(t);
            if (!p) return null;
            const active = t === selectedTutor;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTutor(t)}
                className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                  active
                    ? 'border-emerald-300/70 bg-emerald-400/15 ring-1 ring-emerald-300/40'
                    : 'border-white/10 bg-white/5 hover:border-emerald-300/30 hover:bg-emerald-400/5'
                }`}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800">
                  <Image src={p.src} alt={p.alt} fill className="object-cover" sizes="40px" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold">{p.label_ko}</div>
                  <div className="truncate text-[10px] text-white/50">{p.persona_desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'chat'
              ? 'bg-emerald-400/20 text-emerald-100'
              : 'text-white/60 hover:text-white'
          }`}
        >
          💬 코칭 대화
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past-exam')}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'past-exam'
              ? 'bg-amber-400/20 text-amber-100'
              : 'text-white/60 hover:text-white'
          }`}
        >
          📜 수능 기출
        </button>
      </div>

      {/* 본문 */}
      {activeTab === 'past-exam' ? (
        <ScienceExamPanel subject={subject} onSelect={handleExamSelect} />
      ) : (
        <>
          {/* 메시지 list */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 min-h-[300px]">
            {messages.length === 0 && (
              <p className="py-8 text-center text-sm text-white/50">
                {SUBJECT_TITLE[subject] ?? 'Maestro'} 와 함께 시작해보세요. 문제를 알려주거나 캡쳐를 첨부해주세요.
              </p>
            )}
            {messages.map((m, i) => {
              const isUser = m.role === 'user';
              return (
                <motion.div
                  key={m.id ?? i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      isUser
                        ? 'bg-emerald-500/20 text-white'
                        : 'bg-white/10 text-white/95'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <StreamingMarkdown content={m.content} streaming={isLoading} />
                    )}
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 */}
          <form
            onSubmit={onFormSubmit}
            className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-2"
          >
            <input
              value={input}
              onChange={handleInputChange as (e: ChangeEvent<HTMLInputElement>) => void}
              placeholder="문제·풀이 단계·궁금한 점을 적어주세요"
              disabled={isLoading}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:bg-emerald-600 disabled:opacity-40"
            >
              {isLoading ? '...' : '보내기'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
