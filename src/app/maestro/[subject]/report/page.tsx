/**
 * 22차 (2026-05-09) — /maestro/[subject]/report 페이지 (2차).
 *
 * Phase 5 — DB 누적 데이터 활성화. /api/maestro/[subject]/report 에서 학생 본인의
 * 풀이 stat 을 fetch. SQL 마이그레이션 미적용 시 빈 응답 → fallback UI.
 *
 * 데이터:
 *   - total_sessions, last_7_days, multimodal_count
 *   - tutor_distribution (페르소나 분포 막대)
 *   - recent_summaries (최근 5건 풀이 정리 takeaway)
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Subject } from '@/lib/types/subject';

const VALID_SUBJECTS: Subject[] = ['earth-science', 'biology', 'physics', 'chemistry'];

const SUBJECT_LABEL: Record<string, { ko: string; emoji: string; gradient: string }> = {
  'earth-science': {
    ko: '지구과학',
    emoji: '🌍',
    gradient: 'from-emerald-900/30 via-cyan-900/30 to-slate-950',
  },
  biology: {
    ko: '생명과학',
    emoji: '🧬',
    gradient: 'from-emerald-900/30 via-violet-900/30 to-slate-950',
  },
  physics: {
    ko: '물리학',
    emoji: '⚛️',
    gradient: 'from-violet-900/30 via-indigo-900/30 to-slate-950',
  },
  chemistry: {
    ko: '화학',
    emoji: '🧪',
    gradient: 'from-rose-900/30 via-amber-900/30 to-slate-950',
  },
};

const TUTOR_LABEL: Record<string, string> = {
  wegener: '베게너',
  galilei: '갈릴레이',
  hubble: '허블',
  sagan: '칼 세이건',
  pasteur: '파스퇴르',
  mendel: '멘델',
  watson: '왓슨',
  darwin: '다윈',
  fermi: '페르미',
  einstein: '아인슈타인',
  feynman: '파인만',
  newton: '뉴턴',
  curie: '마리 퀴리',
  lavoisier: '라부아지에',
  pauling: '폴링',
  mendeleev: '멘델레예프',
};

interface ReportData {
  total_sessions: number;
  last_7_days: number;
  multimodal_count: number;
  tutor_distribution: Array<{ tutor: string; count: number }>;
  recent_summaries: Array<{ tutor: string; takeaway: string; created_at: string }>;
}

const EMPTY_REPORT: ReportData = {
  total_sessions: 0,
  last_7_days: 0,
  multimodal_count: 0,
  tutor_distribution: [],
  recent_summaries: [],
};

export default function MaestroReportPage() {
  const params = useParams<{ subject: string }>();
  const router = useRouter();
  const subjectParam = (params?.subject ?? '') as Subject;

  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [report, setReport] = useState<ReportData>(EMPTY_REPORT);
  const [loading, setLoading] = useState(true);

  const valid = VALID_SUBJECTS.includes(subjectParam);
  const meta = SUBJECT_LABEL[subjectParam];

  useEffect(() => {
    if (!valid) {
      router.replace('/dashboard');
      return;
    }
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setAuthChecked(true);
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);

      try {
        const res = await fetch(`/api/maestro/${subjectParam}/report`);
        if (res.ok) {
          const data = (await res.json()) as ReportData;
          if (!cancelled) setReport({ ...EMPTY_REPORT, ...data });
        }
      } catch (e) {
        console.warn('[maestro/report] fetch failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [subjectParam, valid, router]);

  const homePath = `/${subjectParam}`;

  if (!valid) return null;

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 text-sm bg-slate-950">
        리포트 불러오는 중...
      </div>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-white">
        <h1 className="text-2xl font-bold">로그인이 필요해요</h1>
        <Link
          href={`/login?next=/maestro/${subjectParam}/report`}
          className="text-violet-400 underline mt-4 inline-block"
        >
          로그인하러 가기
        </Link>
      </main>
    );
  }

  const hasData = report.total_sessions > 0 || report.recent_summaries.length > 0;
  const maxTutorCount = Math.max(...report.tutor_distribution.map((t) => t.count), 1);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${meta.gradient} text-white`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden>{meta.emoji}</span>
              <h1 className="text-2xl md:text-3xl font-bold">{meta.ko} 활동 리포트</h1>
            </div>
            <p className="text-sm text-white/60">
              {meta.ko} Maestro 와 함께한 학습 기록입니다.
            </p>
          </div>
          <Link href={homePath} className="text-sm text-white/60 hover:text-white">
            ← 채팅으로
          </Link>
        </header>

        {!hasData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-400/30"
          >
            <h2 className="text-lg font-bold mb-2">📚 첫 풀이를 시작해 보세요</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              {meta.ko} Maestro 와 한 문제를 풀고{' '}
              <span className="mx-1 px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-100 text-xs font-mono">
                📝 풀이 정리 보기
              </span>
              를 누르면 이 페이지에 누적됩니다.
            </p>
          </motion.div>
        )}

        {hasData && (
          <section className="grid grid-cols-3 gap-3 mb-8">
            <SummaryCard label="총 풀이" value={report.total_sessions} />
            <SummaryCard label="최근 7일" value={report.last_7_days} />
            <SummaryCard label="시험지 첨부" value={report.multimodal_count} />
          </section>
        )}

        {report.tutor_distribution.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-3">함께 푼 거장</h2>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
              {report.tutor_distribution.map((t, i) => {
                const widthPct = (t.count / maxTutorCount) * 100;
                return (
                  <motion.div
                    key={t.tutor}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm font-medium w-24 text-white/85">
                      {TUTOR_LABEL[t.tutor] ?? t.tutor}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full bg-gradient-to-r from-cyan-400/60 to-violet-400/60"
                      />
                    </div>
                    <span className="text-xs text-white/60 tabular-nums w-12 text-right">
                      {t.count}회
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">최근 풀이 정리</h2>
          {report.recent_summaries.length > 0 ? (
            <ul className="space-y-2">
              {report.recent_summaries.map((r, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                    <span>{r.created_at?.slice(0, 10)}</span>
                    <span>{TUTOR_LABEL[r.tutor] ?? r.tutor}</span>
                  </div>
                  <p className="text-sm text-white/85 italic">“{r.takeaway}”</p>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-sm text-white/50">
              아직 풀이 정리가 없어요. 채팅에서 한 문제 풀고{' '}
              <span className="mx-1 px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-100 text-xs font-mono">
                📝 풀이 정리 보기
              </span>
              를 눌러보세요.
            </div>
          )}
        </section>

        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickCard href={homePath} emoji={meta.emoji} label="채팅으로" hint={`${meta.ko} 거장과 함께`} />
          <QuickCard href={`/maestro/${subjectParam}/triggers`} emoji="🎯" label="Trigger 라이브러리" hint={`${meta.ko} 정석 도구 모음`} />
          <QuickCard href="/dashboard" emoji="🏠" label="대시보드" hint="모든 도구" />
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
    </motion.div>
  );
}

function QuickCard({ href, emoji, label, hint }: { href: string; emoji: string; label: string; hint: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" aria-hidden>{emoji}</span>
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <p className="text-xs text-white/50">{hint}</p>
    </Link>
  );
}
