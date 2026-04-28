/**
 * Phase G-06 — Legend Tutor 라우트 layout.
 *
 * 베이스: docs/architecture-g06-legend.md §8 (라우팅 매핑).
 * 헤더에 QuotaIndicator (5종 quota dot) 노출.
 *
 * G06-17: layout + QuotaIndicator stub mount. G06-21 에서 /euler→/legend redirect 통합.
 */
import type { ReactNode } from 'react';
import { QuotaIndicator } from '@/components/legend/QuotaIndicator';

export const metadata = {
  title: 'Legend Tutor',
  description: '5명의 거장 — 라마누잔·가우스·폰 노이만·오일러·라이프니츠가 함께 푸는 수학',
};

export default function LegendLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">Legend Tutor</span>
          <span className="hidden text-xs text-white/50 sm:inline">5명의 거장이 함께 푸는 수학</span>
        </div>
        {/* QuotaIndicator stub — G06-20 에서 실제 데이터 fetch 연결 */}
        <QuotaIndicator />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
