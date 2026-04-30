/**
 * Phase G-06 Δ22b — Trigger 라이브러리 학생 열람 페이지.
 *
 * 사용자 결정 (Δ22): trigger 자산을 DB 누적 → 학생도 직접 열람 가능한 학습 자료.
 *
 * 흐름:
 *   1. Server Component — Supabase auth 가드 (베타·trial 모두 열람 허용)
 *   2. math_tool_triggers + math_tools join 조회 (forward direction 우선)
 *   3. 정석 형식 카드 그리드 렌더 — A (cue) → B (활용) + why_text 풀이
 *
 * 가치:
 *   - 학생이 자기가 학습한 trigger 들을 회고 가능
 *   - "수학적 감각의 명시화" 사명의 학생 대면 산출물
 *
 * 영향 격리: src/app/legend/triggers/ 전용. 기존 라우트 무수정.
 */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import { TriggerCardList } from '@/components/legend/TriggerLibraryView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Trigger 라이브러리 — Legend Tutor',
  description:
    '"A 일 때 → B 를 한다" 형식의 정석 trigger 모음. 수학적 감각을 명시지로.',
};

export interface TriggerRow {
  id: string;
  tool_id: string;
  direction: 'forward' | 'backward' | 'both';
  trigger_condition: string;
  derived_fact: string | null;
  goal_pattern: string | null;
  why_text: string;
  tool_name: string;
  knowledge_layer: number;
}

interface RawRow {
  id: string;
  tool_id: string;
  direction: 'forward' | 'backward' | 'both';
  trigger_condition: string;
  derived_fact: string | null;
  goal_pattern: string | null;
  why_text: string;
  math_tools?:
    | { name: string; knowledge_layer: number }
    | { name: string; knowledge_layer: number }[]
    | null;
}

async function loadTriggers(): Promise<TriggerRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('math_tool_triggers')
    .select(
      'id, tool_id, direction, trigger_condition, derived_fact, goal_pattern, why_text, math_tools(name, knowledge_layer)',
    )
    .in('direction', ['forward', 'both'])
    .order('created_at', { ascending: true })
    .limit(500);
  if (error || !data) {
    console.warn('[legend/triggers] load failed:', error?.message);
    return [];
  }
  return (data as RawRow[]).map((r) => {
    const tool = Array.isArray(r.math_tools) ? r.math_tools[0] : r.math_tools;
    return {
      id: r.id,
      tool_id: r.tool_id,
      direction: r.direction,
      trigger_condition: r.trigger_condition,
      derived_fact: r.derived_fact,
      goal_pattern: r.goal_pattern,
      why_text: r.why_text,
      tool_name: tool?.name ?? '',
      knowledge_layer: tool?.knowledge_layer ?? 0,
    };
  });
}

export default async function LegendTriggersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/legend/triggers');

  const triggers = await loadTriggers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
          <Link
            href="/legend"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            ← Legend
          </Link>
          <div className="text-center leading-tight">
            <h1 className="text-sm font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              Trigger 라이브러리
            </h1>
            <p className="text-[10px] text-white/50">
              &ldquo;A 일 때 → B 를 한다&rdquo; 정석 모음 ({triggers.length} 개)
            </p>
          </div>
          <Link
            href="/legend/help"
            className="text-[11px] px-2.5 py-1 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 transition-colors font-semibold"
          >
            입력 가이드
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
          <h2 className="text-base font-semibold text-amber-100 mb-2">
            Trigger 란?
          </h2>
          <p className="text-sm text-white/75 leading-relaxed">
            모든 수학 도구는 <strong>&ldquo;A 이면 B 하라&rdquo;</strong> 형식의 조건부 명제로 표현할 수 있습니다.
            <br />
            <strong className="text-amber-200">A</strong> = 문제 표면에서 인지 가능한 형태·꼴·구조 (cue),{' '}
            <strong className="text-amber-200">B</strong> = 호출되어야 할 구체 도구·절차.
            <br />
            아래 trigger 들은 그 매핑을 정석 형식으로 정리한 것입니다. 수많은 문제로 어렴풋이 익힐 &ldquo;수학적 감각&rdquo;을 명시지로 변환한 학습 자산입니다.
          </p>
        </section>

        {triggers.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-white/60">
            아직 등록된 trigger 가 없습니다. 운영자가 곧 추가할 예정입니다.
          </div>
        ) : (
          <TriggerCardList triggers={triggers} />
        )}
      </main>
    </div>
  );
}
