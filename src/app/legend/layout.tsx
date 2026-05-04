import type { ReactNode } from 'react';
import Link from 'next/link';
import { QuotaIndicator } from '@/components/legend/QuotaIndicator';
import { createClient } from '@/lib/supabase/server';
import { getUserAccessTier } from '@/lib/legend/access-tier';

export const metadata = {
  title: 'Legend Tutor',
  description: '5명의 거장 — 라마누잔·가우스·폰 노이만·오일러·라이프니츠가 함께 푸는 수학',
};

export default async function LegendLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isBeta = user ? (await getUserAccessTier(user.id)) === 'beta' : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href="/legend" className="text-base font-semibold tracking-tight hover:text-white/80">
            Legend Tutor
          </Link>
          <span className="hidden text-xs text-white/50 sm:inline">5명의 거장이 함께 푸는 수학</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {isBeta && (
            <>
              <Link
                href="/legend/beta/review"
                className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200 transition-colors hover:bg-amber-400/20"
              >
                📝 후기 쓰기
              </Link>
              <Link
                href="/legend/reviews"
                className="hidden rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 sm:inline-block"
              >
                ⭐ 후기 보기
              </Link>
            </>
          )}
          <Link
            href="/legend/help"
            className="text-xs text-white/60 transition-colors hover:text-white"
          >
            입력 가이드
          </Link>
          <QuotaIndicator />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
