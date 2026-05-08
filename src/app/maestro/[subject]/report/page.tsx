/**
 * 22차 (2026-05-08) — /maestro/[subject]/report 페이지 (1차).
 *
 * 사용자 신고: "리포트를 클릭하자 갑자기 legend tutor로 가버려. maestro는 maestro
 * 각 과목에 대한 리포트여야지"
 *
 * 1차 (이번 commit) 범위:
 *   - subject 별 라우트 신설 + 인증 가드 + maestro 4 과목 검증
 *   - 풀이 활동 카드 (현재는 placeholder — DB 누적 인프라 다음 commit)
 *   - 자주 쓴 페르소나 stub (localStorage 기반)
 *   - 채팅 / 다른 maestro 페이지 / 대시보드로 navigation
 *
 * 다음 commit (Phase 2):
 *   - maestro tutor route 분기에 legend_tutor_sessions insert (subject 컬럼)
 *   - 과목별 풀이 수 · 사용 페르소나 분포 · 자주 다룬 단원 · 평균 단계 차트
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Subject } from '@/lib/legend/types';

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

interface MaestroSummaryRow {
  date: string;
  subject: string;
  tutor: string;
  takeaway: string;
}

export default function MaestroReportPage() {
  const params = useParams<{ subject: string }>();
  const router = useRouter();
  const subjectParam = (params?.subject ?? '') as Subject;

  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [recentSummaries, setRecentSummaries] = useState<MaestroSummaryRow[]>([]);

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
      setAuthorized(Boolean(user));
      // 1차: localStorage 기반 최근 정리 5건 (DB 누적은 다음 commit)
      try {
        const raw = localStorage.getItem('maestro_recent_summaries');
        if (raw) {
          const arr = JSON.parse(raw) as MaestroSummaryRow[];
          setRecentSummaries(arr.filter((r) => r.subject === subjectParam).slice(0, 5));
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [subjectParam, valid, router]);

  const homePath = `/${subjectParam}`;

  if (!valid) {
    return null;
  }

  if (!authChecked) {
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

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${meta.gradient} text-white`}
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden>
                {meta.emoji}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold">{meta.ko} 활동 리포트</h1>
            </div>
            <p className="text-sm text-white/60">
              {meta.ko} Maestro 와 함께한 학습 기록과 약점 분석을 보여드립니다.
            </p>
          </div>
          <Link href={homePath} className="text-sm text-white/60 hover:text-white">
            ← 채팅으로
          </Link>
        </header>

        {/* 안내: DB 누적 인프라 진행 중 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-400/30"
        >
          <h2 className="text-lg font-bold mb-2">📚 활동 데이터 누적 시작</h2>
          <p className="text-sm text-white/70 leading-relaxed mb-3">
            {meta.ko} Maestro 풀이 활동 통계는 곧 자동 누적됩니다. 풀이를 마친 뒤
            <span className="mx-1 px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-100 text-xs font-mono">
              📝 풀이 정리 보기
            </span>
            를 누르면 그 정리가 이 페이지에 한 줄씩 쌓여요.
          </p>
          <p className="text-xs text-white/50">
            (1차 출시: 로컬 기록만 표시. 2차에서 약점 분석 차트와 페르소나 분포가 추가됩니다.)
          </p>
        </motion.div>

        {/* 빠른 시작 카드 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <QuickCard
            href={homePath}
            emoji={meta.emoji}
            label="채팅으로 돌아가기"
            hint={`${meta.ko} 거장과 함께 한 문제 더`}
          />
          <QuickCard
            href="/dashboard"
            emoji="🏠"
            label="대시보드"
            hint="모든 도구 둘러보기"
          />
          <QuickCard
            href="/grammar"
            emoji="📖"
            label="다른 학습"
            hint="영문법 헤밍웨이 둘러보기"
          />
        </section>

        {/* 최근 풀이 정리 5건 (localStorage) */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">최근 풀이 정리</h2>
          {recentSummaries.length > 0 ? (
            <ul className="space-y-2">
              {recentSummaries.map((r, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                    <span>{r.date}</span>
                    <span>{r.tutor}</span>
                  </div>
                  <p className="text-sm text-white/85 italic">“{r.takeaway}”</p>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-sm text-white/50">
              아직 풀이 정리 기록이 없어요. 채팅에서 한 문제 풀고
              <span className="mx-1 px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-100 text-xs font-mono">
                📝 풀이 정리 보기
              </span>
              를 눌러보세요.
            </div>
          )}
        </section>

        {/* 향후 차트 placeholder */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Placeholder title="페르소나 분포" hint="자주 함께 푼 거장 (다음 업데이트)" />
          <Placeholder title="단원별 풀이 수" hint="강점·약점 단원 (다음 업데이트)" />
        </section>
      </div>
    </div>
  );
}

function QuickCard({
  href,
  emoji,
  label,
  hint,
}: {
  href: string;
  emoji: string;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" aria-hidden>
          {emoji}
        </span>
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <p className="text-xs text-white/50">{hint}</p>
    </Link>
  );
}

function Placeholder({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
      <h3 className="text-sm font-semibold text-white/70 mb-1">{title}</h3>
      <p className="text-xs text-white/40">{hint}</p>
      <div className="mt-3 h-16 rounded-lg bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/5 flex items-center justify-center text-xs text-white/30">
        ▸ 데이터 누적 후 표시
      </div>
    </div>
  );
}

