/**
 * 22차 (2026-05-09) — /maestro/[subject]/triggers 페이지.
 *
 * 사용자 신고: "Maestro Trigger 에 왜 Legend trigger 로 연결되는 거야"
 *
 * Server Component:
 *   1. subject 파라미터 검증 (maestro 4 과목)
 *   2. 인증 가드 (베타·trial 모두 열람 허용 — Legend 와 동일 정책)
 *   3. data/seeds/{subject}-anchors.json 시드 로드
 *   4. MaestroTriggerLibrary 카드 렌더 (anchor → tool → trigger 트리)
 */
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isMaestroSubject, loadMaestroSeed } from '@/lib/maestro/seed-loader';
import { MaestroTriggerLibrary } from '@/components/maestro/MaestroTriggerLibrary';
import type { Subject } from '@/lib/legend/types';

export const dynamic = 'force-dynamic';

interface SubjectMeta {
  ko: string;
  emoji: string;
  gradient: string;
}

const SUBJECT_META: Record<string, SubjectMeta> = {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const meta = SUBJECT_META[subject];
  if (!meta) return { title: 'Maestro Triggers' };
  return {
    title: `${meta.ko} Trigger 라이브러리 — Maestro`,
    description: `${meta.ko} Maestro 의 정석 도구·trigger 명제 모음. 정답으로 가는 최적 방법 학습.`,
  };
}

export default async function MaestroTriggersPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  if (!isMaestroSubject(subject)) {
    notFound();
  }
  const subjectKey = subject as Subject;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/maestro/${subject}/triggers`);
  }

  const seed = loadMaestroSeed(subjectKey);
  const meta = SUBJECT_META[subject];

  if (!seed) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center`}
      >
        <div className="max-w-md text-center px-6">
          <h1 className="text-xl font-bold mb-2">{meta.ko} Trigger 시드 미구비</h1>
          <p className="text-sm text-white/60 mb-6">
            {meta.ko} 의 trigger 시드가 아직 준비 중입니다. 곧 추가됩니다.
          </p>
          <a
            href={`/${subject}`}
            className="inline-block text-sm text-cyan-200 hover:text-cyan-100 underline"
          >
            ← 채팅으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${meta.gradient} text-white`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <MaestroTriggerLibrary
          seed={seed}
          subjectKo={meta.ko}
          subjectEmoji={meta.emoji}
          homePath={`/${subject}`}
        />
      </div>
    </div>
  );
}
