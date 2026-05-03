'use client';

/**
 * 헤밍웨이 영문법 코치 — 메인 페이지 (placeholder, 2026-05-04 night mode).
 *
 * 현재 상태:
 *   - UI 골조 (Legend vibe — 다크 글래스 + 헤밍웨이 portrait + 입력 textarea)
 *   - LLM 호출 미연결 — Phase 1 시점에 P0-07 임베딩 + P0-08c 헤밍웨이 LLM
 *     호출 통합 예정 (사용자 비용 승인 후).
 *
 * 다음 단계 (P0-08c/d):
 *   1. POST /api/grammar/coach — 학생 입력 + HEMINGWAY_PERSONA system prompt + LLM 호출
 *   2. trigger 매칭 결과 카드 표시 (subject_anchor='english_grammar' 필터)
 *   3. KaTeX 미사용 (영문법은 LaTeX 거의 없음 — plain text + 영어 강조)
 */
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/shared/glass-card';

const ANCHORS = [
  { key: 'tense', label: '시제', icon: '⏱️' },
  { key: 'relative_pronoun', label: '관계대명사', icon: '🔗' },
  { key: 'conditional', label: '가정법', icon: '🌀' },
  { key: 'passive', label: '수동태', icon: '🔄' },
  { key: 'participle_gerund', label: '분사·동명사', icon: '🌱' },
  { key: 'sentence_structure', label: '문장 구조', icon: '🏛️' },
];

export default function GrammarPage() {
  const [input, setInput] = useState('');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-stone-950 to-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300/30 to-orange-500/30 ring-2 ring-amber-300/40 flex items-center justify-center text-3xl">
              ✒️
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                헤밍웨이 영문법 코치
              </h1>
              <p className="text-xs text-white/50 mt-0.5">정확함 위에 단순함</p>
            </div>
          </motion.div>
          <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xl mx-auto">
            영어 문장을 입력하면 헤밍웨이가 오류 패턴을 진단하고 한 문장씩 교정합니다.
            <br />
            6 anchor (시제 / 관계대명사 / 가정법 / 수동태 / 분사·동명사 / 문장 구조) 의 trigger 라이브러리 기반.
          </p>
        </header>

        {/* 6 anchor 카드 */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-white/70 mb-3">코칭 영역</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ANCHORS.map((a, i) => (
              <motion.div
                key={a.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-3 text-center hover:border-amber-300/30 transition-colors"
              >
                <div className="text-xl mb-1">{a.icon}</div>
                <div className="text-[10px] text-white/70">{a.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 입력 영역 — placeholder (LLM 호출 미연결) */}
        <GlassCard hover={false}>
          <h2 className="text-base font-semibold text-white mb-3">
            교정 받을 문장 입력
          </h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder="예: I have met him three years ago."
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-white/40">{input.trim().length} 자</span>
            <button
              type="button"
              disabled
              className="px-5 py-2 rounded-full font-semibold text-sm bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
              title="Phase 1 LLM 호출 통합 후 활성화"
            >
              헤밍웨이에게 코칭 받기 (준비 중)
            </button>
          </div>
        </GlassCard>

        {/* 안내 — 베타 흐름 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/5 backdrop-blur-md p-5 text-sm text-white/80 leading-relaxed"
        >
          <p className="font-semibold text-amber-200 mb-2">🚧 베타 준비 중</p>
          <p>
            현재 영문법 코치는 인프라 (30 도구 / 90 trigger 라이브러리 + 페르소나
            정의) 구축이 완료됐고, LLM 호출 통합과 5문제 검증 (≥ 70%) 을 거쳐
            Phase 1 시점에 정식 오픈됩니다. 베타 사용자는{' '}
            <Link href="/legend/beta" className="text-amber-300 underline hover:text-amber-200">
              Legend Tutor 베타 신청
            </Link>{' '}
            과 동일한 계정으로 액세스하게 됩니다.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
