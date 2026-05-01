/**
 * Phase G-06 Δ27 — 관리자 페이지 가드 (Server Component).
 *
 * 보안 핵심: 누구나 /admin/* URL 직접 입력으로 페이지 자체에 도달했던 문제 fix.
 * Server-side 에서 user.email 을 ADMIN_EMAILS (또는 LEGEND_ADMIN_EMAILS env) 와
 * 비교 → 비-admin 시 즉시 /dashboard 로 redirect. UI 자체가 렌더되지 않음.
 *
 * 진입 경로:
 *   - dashboard 의 "관리자" 카드 (admin 이메일에만 노출)
 *   - 직접 URL 입력 (admin 이면 정상, 비-admin 이면 차단)
 *
 * 영향 격리: /admin/* 모든 페이지에 자동 적용 (Next.js layout 중첩).
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/legend/access-tier';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '관리자 — Vibe Coding',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin/beta-applications');
  }

  if (!isAdminEmail(user.email)) {
    // 비-admin 진입 시도 → 대시보드로 즉시 redirect (UI 노출 없음)
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-30 border-b border-amber-400/30 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
              🔐 관리자 모드
            </span>
            <span className="text-xs text-white/60">{user.email}</span>
          </div>
          <nav className="flex items-center gap-3 text-xs">
            <Link
              href="/admin/beta-applications"
              className="text-white/70 hover:text-white transition-colors"
            >
              베타 신청
            </Link>
            <Link
              href="/admin/math-tools"
              className="text-white/70 hover:text-white transition-colors"
            >
              도구·트리거
            </Link>
            <Link
              href="/admin/candidate-triggers"
              className="text-white/70 hover:text-white transition-colors"
            >
              후보 트리거
            </Link>
            <Link
              href="/admin/contributors"
              className="text-white/70 hover:text-white transition-colors"
            >
              기여자
            </Link>
            <Link
              href="/dashboard"
              className="ml-2 rounded-full border border-white/15 px-2.5 py-0.5 text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              ← 대시보드
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
