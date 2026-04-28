/**
 * Phase G-06 G06-18 — Per-Problem Report 페이지.
 *
 * 베이스: docs/architecture-g06-legend.md §6.1 + docs/task-g06.md §G06-18.
 *
 * 흐름:
 *   1. 인증 가드 (미인증 → /login)
 *   2. session ownership 검증 (RLS 우회 차단)
 *   3. per_problem_reports 캐시 hit 시 즉시 렌더 (R1 빠른 경로)
 *   4. 캐시 miss 시 problem_text query 필요 → 직접 buildReport 호출
 *   5. PerProblemReportCard 렌더
 *
 * 영향 격리: 신규 라우트. 기존 /euler/* 무수정.
 */
import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import { createClient } from '@/lib/supabase/server';
import { buildReport } from '@/lib/legend/report/report-builder';
import { consumeQuota } from '@/lib/legend/quota-manager';
import { PerProblemReportCard } from '@/components/legend/PerProblemReportCard';
import type { PerProblemReport } from '@/lib/legend/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ problem_text?: string }>;
}

export default async function LegendSolveSessionPage({
  params,
  searchParams,
}: PageProps): Promise<ReactElement> {
  const { sessionId } = await params;
  const { problem_text: problemText } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/legend/solve/${sessionId}`)}`);
  }

  // session ownership
  const { data: sessionRow } = await supabase
    .from('legend_tutor_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .maybeSingle();
  const session = sessionRow as { user_id: string } | null;

  if (!session) {
    return <ReportError title="세션을 찾을 수 없어요" detail={`session_id=${sessionId}`} />;
  }
  if (session.user_id !== user.id) {
    return <ReportError title="권한이 없어요" detail="이 풀이는 다른 사용자의 것입니다." />;
  }

  // 캐시 조회
  const { data: cachedRow } = await supabase
    .from('per_problem_reports')
    .select('report_jsonb')
    .eq('session_id', sessionId)
    .maybeSingle();

  let report: PerProblemReport | null =
    (cachedRow as { report_jsonb: PerProblemReport } | null)?.report_jsonb ?? null;

  if (!report) {
    if (!problemText || !problemText.trim()) {
      return (
        <ReportError
          title="리포트를 새로 만들려면 problem_text 가 필요해요"
          detail="?problem_text=... 쿼리를 붙여서 다시 시도하세요."
        />
      );
    }

    const quota = await consumeQuota(user.id, 'report_per_problem_daily');
    if (!quota.allowed) {
      return (
        <ReportError
          title="오늘은 더 이상 새 리포트를 만들 수 없어요"
          detail={
            quota.blocked_reason === 'eligibility_gate'
              ? `누적 풀이 ${quota.eligibility?.current ?? 0}/${quota.eligibility?.required ?? 0} 충족 후 가능합니다.`
              : '내일 자정 이후 다시 시도하세요.'
          }
        />
      );
    }

    try {
      report = await buildReport({
        session_id: sessionId,
        user_id: user.id,
        problem_text: problemText,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'build_failed';
      return <ReportError title="리포트 생성 실패" detail={msg} />;
    }
  }

  return (
    <section className="space-y-4">
      <PerProblemReportCard report={report} />
    </section>
  );
}

function ReportError({ title, detail }: { title: string; detail: string }): ReactElement {
  return (
    <div className="rounded-lg border border-rose-400/30 bg-rose-400/5 p-6">
      <h2 className="text-base font-semibold text-rose-100">{title}</h2>
      <p className="mt-2 text-sm text-rose-200/75">{detail}</p>
    </div>
  );
}
