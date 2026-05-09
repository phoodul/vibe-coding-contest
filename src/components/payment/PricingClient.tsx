/**
 * 22차 (2026-05-09) — 가격 카드 + 결제 시작 버튼.
 *
 * paymentActive=false (베타 동안): 버튼 disabled + "베타 종료 후 활성화" 안내.
 * paymentActive=true: /api/payment/checkout POST → toss 결제 페이지 redirect.
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PLANS, type PlanCode } from '@/lib/payment/plans';

const TIER_ORDER: PlanCode[] = ['basic', 'standard', 'premium'];

const ACCENT_BY_PLAN: Record<PlanCode, string> = {
  basic:
    'border-white/10 bg-white/5 hover:border-white/20',
  standard:
    'border-violet-400/40 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 hover:border-violet-300/60 ring-1 ring-violet-300/20',
  premium:
    'border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-rose-500/10 hover:border-amber-300/60',
  topup_100: '',
};

export function PricingClient({ paymentActive }: { paymentActive: boolean }) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanCode | null>(null);

  async function handleSubscribe(plan: PlanCode) {
    if (!paymentActive) return;
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan_code: plan }),
      });
      if (res.status === 401) {
        router.push(`/login?next=/pricing`);
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        alert(err.message ?? '결제를 시작할 수 없습니다.');
        return;
      }
      const data = (await res.json()) as { redirect_url?: string };
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {TIER_ORDER.map((code, i) => {
        const plan = PLANS[code];
        return (
          <motion.div
            key={code}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-2xl border p-6 transition-colors ${ACCENT_BY_PLAN[code]} ${
              plan.recommended ? 'md:scale-105' : ''
            }`}
          >
            {plan.recommended && (
              <div className="inline-block px-2.5 py-1 mb-3 rounded-full bg-violet-400/20 border border-violet-300/40 text-[10px] font-bold text-violet-100 tracking-wide">
                추천 ⭐
              </div>
            )}
            <h2 className="text-xl font-bold mb-1">{plan.label_ko}</h2>
            <p className="text-xs text-white/55 mb-4">{plan.tagline}</p>
            <div className="mb-5">
              <span className="text-3xl font-bold tabular-nums">
                ₩{plan.price_krw.toLocaleString('ko-KR')}
              </span>
              <span className="text-sm text-white/50 ml-1">/ 월</span>
              <p className="text-[10px] text-white/40 mt-0.5">VAT 10% 포함</p>
            </div>
            <ul className="space-y-2 mb-6 text-sm text-white/85">
              {plan.highlights.map((h, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="text-emerald-400/80 mt-0.5">✓</span>
                  <span className="flex-1">{h}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleSubscribe(code)}
              disabled={!paymentActive || loadingPlan === code}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                plan.recommended
                  ? 'bg-violet-500 hover:bg-violet-400 text-white disabled:bg-violet-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-white disabled:opacity-40'
              }`}
            >
              {loadingPlan === code
                ? '준비 중...'
                : paymentActive
                  ? '결제하고 시작하기'
                  : '베타 종료 후 활성화'}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
