import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Earth Science Maestro — 베게너·갈릴레이·허블·세이건',
  description:
    '4 가지 사고방식의 가이드와 함께 푸는 수능 지구과학Ⅰ — 정답으로 가는 최적의 길을 단계별로 학습',
};

export default function EarthScienceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link
            href="/earth-science"
            className="text-base font-semibold tracking-tight hover:text-white/80"
          >
            🌍 Earth Science Maestro
          </Link>
          <span className="hidden text-xs text-white/50 sm:inline">
            4 가지 사고방식과 함께 푸는 수능 지구과학
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/mind-map?subject=earth-science"
            className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/20"
          >
            🧠 마인드맵
          </Link>
          <Link
            href="/tutor"
            className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            📖 교과서 학습
          </Link>
          <Link
            href="/dashboard"
            className="text-xs text-white/60 transition-colors hover:text-white"
          >
            대시보드
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
