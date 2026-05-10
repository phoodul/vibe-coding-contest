/**
 * 22차 (2026-05-09) 신설 → 23차 (2026-05-10) A2: 토스 V2 SDK 결제 위젯 연동.
 *
 * paymentActive=false (베타 동안): 버튼 disabled + "베타 종료 후 활성화" 안내.
 * paymentActive=true:
 *   1. /api/payment/checkout POST → orderId / customerKey / amount / success_url / fail_url 받음
 *   2. recurring=true (Basic/Standard/Premium) → payment.requestBillingAuth (카드 등록)
 *      → /billing/success?authKey=... → /api/payment/billing-key (빌링키 발급 + 첫 결제)
 *   3. recurring=false (topup_100) → payment.requestPayment (단발 결제)
 *      → /billing/success?paymentKey=... → /api/payment/confirm (결제 승인)
 *
 * env 의존:
 *   NEXT_PUBLIC_TOSS_CLIENT_KEY — 토스 가맹점 client key (live/test 분리)
 *   NEXT_PUBLIC_PAYMENT_ACTIVE  — 'true' 일 때만 결제 활성
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

interface CheckoutResponse {
  order_id: string;
  customer_key: string;
  plan_code: string;
  plan_label: string;
  amount_krw: number;
  is_recurring: boolean;
  success_url: string;
  fail_url: string;
}

export function PricingClient({ paymentActive }: { paymentActive: boolean }) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanCode | null>(null);

  async function handleSubscribe(plan: PlanCode) {
    if (!paymentActive) return;
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      alert('결제 키가 설정되지 않았습니다. 관리자에게 문의해 주세요.');
      return;
    }

    setLoadingPlan(plan);
    try {
      // 1. server 가 pending payment row 생성 + orderId / customerKey 발급
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
      const checkout = (await res.json()) as CheckoutResponse;

      // 2. 토스 V2 SDK 동적 import (번들 사이즈 최소화)
      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: checkout.customer_key });

      const orderName = `${checkout.plan_label} (월 ₩${checkout.amount_krw.toLocaleString('ko-KR')})`;

      if (checkout.is_recurring) {
        // 정기결제: 빌링키 등록창. success url 에 authKey + customerKey 가 query 로 자동 추가됨.
        // /billing/success 가 authKey 분기로 /api/payment/billing-key 호출.
        await payment.requestBillingAuth({
          method: 'CARD',
          successUrl: `${checkout.success_url}?_flow=billing&order_id=${encodeURIComponent(checkout.order_id)}`,
          failUrl: checkout.fail_url,
        });
      } else {
        // 단발 결제 (topup_100). success url 에 paymentKey + orderId + amount 가 query 로 자동 추가됨.
        await payment.requestPayment({
          method: 'CARD',
          amount: { currency: 'KRW', value: checkout.amount_krw },
          orderId: checkout.order_id,
          orderName,
          successUrl: checkout.success_url,
          failUrl: checkout.fail_url,
        });
      }
      // requestPayment / requestBillingAuth 는 Redirect 방식 → window.location 이동
      // 여기 도달 시 사용자가 결제창 닫음 (UserCancelError) 또는 SDK 내부 오류
    } catch (e) {
      const err = e as { code?: string; message?: string };
      // 사용자가 결제창 닫음 — alert 안 함 (다시 시도 자연스러움)
      if (err.code === 'USER_CANCEL') {
        return;
      }
      console.error('[PricingClient] subscribe failed:', err);
      alert(err.message ?? '결제 진행 중 오류가 발생했습니다.');
    } finally {
      setLoadingPlan(null);
    }
  }

  const topup = PLANS.topup_100;

  return (
    <>
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
                  ? '결제창 여는 중...'
                  : paymentActive
                    ? '결제하고 시작하기'
                    : '베타 종료 후 활성화'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* 24차 — Top-up 100회 단발 충전 카드 (한도 소진 시 사용) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-5 flex flex-col md:flex-row items-start md:items-center gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold">{topup.label_ko}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-300/30 text-cyan-100 font-mono">
              단발
            </span>
          </div>
          <p className="text-xs text-white/65 mb-2">{topup.tagline}</p>
          <ul className="text-xs text-white/70 space-y-0.5">
            {topup.highlights.map((h, j) => (
              <li key={j} className="flex items-start gap-1.5">
                <span className="text-cyan-400/70 mt-0.5">·</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
          <span className="text-xl font-bold tabular-nums">
            ₩{topup.price_krw.toLocaleString('ko-KR')}
          </span>
          <button
            type="button"
            onClick={() => handleSubscribe('topup_100')}
            disabled={!paymentActive || loadingPlan === 'topup_100'}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-300/30 text-cyan-100 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {loadingPlan === 'topup_100'
              ? '결제창 여는 중...'
              : paymentActive
                ? '100회 충전하기'
                : '베타 종료 후 활성화'}
          </button>
        </div>
      </motion.div>
    </>
  );
}
