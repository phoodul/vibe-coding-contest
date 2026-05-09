/**
 * 22차 (2026-05-09) — 약관 페이지 공통 레이아웃.
 *
 * 일관된 글꼴·여백·시행일 배지·관련 약관 nav.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface LegalLayoutProps {
  title: string;
  effectiveDate: string;
  version: string;
  children: ReactNode;
}

const NAV = [
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/refund', label: '환불 정책' },
  { href: '/business-info', label: '사업자 정보' },
];

export function LegalLayout({ title, effectiveDate, version, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav className="mb-8 flex flex-wrap gap-2 text-xs">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <header className="mb-8 pb-6 border-b border-white/10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>버전 {version}</span>
            <span>·</span>
            <span>시행일 {effectiveDate}</span>
          </div>
        </header>

        <article className="prose prose-invert prose-sm max-w-none text-white/85 leading-relaxed">
          {children}
        </article>

        <footer className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40">
          <p>
            본 문서에 대한 문의는{' '}
            <Link href="/business-info" className="underline hover:text-white/60">
              사업자 정보
            </Link>
            의 연락처를 이용해 주세요.
          </p>
        </footer>
      </div>
    </div>
  );
}
