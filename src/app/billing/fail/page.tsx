/**
 * 22차 (2026-05-09) — 결제 실패 redirect (/billing/fail).
 */
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaymentFailPage() {
  const sp = useSearchParams();
  const code = sp.get('code');
  const message = sp.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full rounded-2xl border border-rose-400/30 bg-rose-500/5 p-8 text-center"
      >
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">결제가 완료되지 않았습니다</h1>
        <p className="text-sm text-white/70 mb-2">
          {message ?? '결제 도중 문제가 발생했습니다.'}
        </p>
        {code && (
          <p className="text-[10px] font-mono text-white/40 mb-6">code: {code}</p>
        )}
        <div className="flex flex-col gap-2">
          <Link
            href="/pricing"
            className="block w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-sm font-semibold transition-colors"
          >
            요금제 다시 선택
          </Link>
          <Link
            href="/dashboard"
            className="block w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white/70 transition-colors"
          >
            대시보드로 이동
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
