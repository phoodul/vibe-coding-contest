/**
 * 22차 (2026-05-09) — 구독 관리 페이지 (/billing).
 *
 * 현재 구독 + 사용량 진행도 + 다음 결제일 + 결제 이력 + 환불 신청.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface BillingStatus {
  quota: {
    has_subscription: boolean;
    plan_code: string | null;
    monthly_quota: number | null;
    legend_used: number;
    maestro_used: number;
    total_used: number;
    topup_remaining: number;
    period_end: string | null;
  };
  plan: {
    code: string;
    label_ko: string;
    price_krw: number;
    monthly_quota: number | null;
  } | null;
  subscription: {
    id: string;
    status: string;
    period_start: string;
    period_end: string;
    cancel_at_period_end: boolean;
    has_billing_key: boolean;
  } | null;
  payments: Array<{
    id: string;
    plan_code: string;
    amount_krw: number;
    status: string;
    paid_at: string | null;
    receipt_url: string | null;
    refundable_amount_krw: number | null;
  }>;
  refunds: Array<{
    id: string;
    payment_id: string;
    amount_refunded_krw: number | null;
    status: string;
    created_at: string;
  }>;
}

export default function BillingPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [data, setData] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setAuthChecked(true);
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      try {
        const res = await fetch('/api/billing/status');
        if (res.ok) {
          const d = (await res.json()) as BillingStatus;
          setData(d);
        }
      } catch (e) {
        console.warn('billing status fetch failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCancel() {
    if (!confirm('정기결제를 해지하시겠어요? 현재 기간은 정상 이용 가능합니다.')) return;
    setActioning('cancel');
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        alert(err.message ?? '해지에 실패했습니다.');
      } else {
        location.reload();
      }
    } finally {
      setActioning(null);
    }
  }

  async function handleRefund(paymentId: string) {
    const reason_text = prompt('환불 사유를 적어주세요 (선택)');
    if (reason_text === null) return; // cancel
    setActioning(paymentId);
    try {
      const res = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, reason_text, reason: 'user_request' }),
      });
      const json = (await res.json()) as { ok?: boolean; auto?: boolean; message?: string; refund_amount_krw?: number };
      if (!res.ok) {
        alert(json.message ?? '환불 처리 실패');
        return;
      }
      alert(
        json.auto
          ? `환불이 완료되었습니다. ₩${(json.refund_amount_krw ?? 0).toLocaleString('ko-KR')} (카드 입금 3~5 영업일)`
          : '환불 신청이 접수되었습니다. 관리자 검토 후 처리됩니다.',
      );
      location.reload();
    } finally {
      setActioning(null);
    }
  }

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 text-sm bg-slate-950">
        구독 정보 불러오는 중...
      </div>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-white">
        <h1 className="text-2xl font-bold">로그인이 필요해요</h1>
        <Link href="/login?next=/billing" className="text-violet-400 underline mt-4 inline-block">
          로그인
        </Link>
      </main>
    );
  }

  const quota = data?.quota;
  const sub = data?.subscription;
  const plan = data?.plan;

  const totalUsed = quota?.total_used ?? 0;
  const monthlyQuota = quota?.monthly_quota;
  const topup = quota?.topup_remaining ?? 0;
  const totalLimit = (monthlyQuota ?? 0) + topup;
  const usagePct = monthlyQuota === null ? 0 : Math.min(100, totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">구독 관리</h1>
            <p className="text-sm text-white/60">현재 구독·사용량·결제 이력</p>
          </div>
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white">
            ← 대시보드
          </Link>
        </header>

        {/* 구독 미존재 — Pricing 안내 */}
        {!sub || !plan ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 text-center"
          >
            <h2 className="text-lg font-bold mb-2">아직 구독이 없어요</h2>
            <p className="text-sm text-white/70 mb-6">
              요금제를 선택하면 Legend Tutor + Maestro 4 과목을 본격적으로 이용할 수 있어요.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-sm font-semibold transition-colors"
            >
              요금제 보러가기 →
            </Link>
          </motion.div>
        ) : (
          <>
            {/* 현재 구독 카드 */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-6 mb-6"
            >
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{plan.label_ko}</h2>
                  <p className="text-xs text-white/55">
                    ₩{plan.price_krw.toLocaleString('ko-KR')} / 월
                    {sub.cancel_at_period_end && (
                      <span className="ml-2 text-amber-300">(다음 결제일에 해지 예정)</span>
                    )}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    sub.status === 'active'
                      ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30'
                      : 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              {/* 사용량 progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                  <span>이번 달 사용량</span>
                  <span className="tabular-nums">
                    {totalUsed} / {monthlyQuota === null ? '무제한' : `${totalLimit}회`}
                    {topup > 0 && (
                      <span className="ml-1 text-cyan-300">
                        (+ Top-up {topup})
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePct}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full ${
                      usagePct > 90 ? 'bg-rose-400/70' : usagePct > 70 ? 'bg-amber-400/70' : 'bg-emerald-400/70'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1.5">
                  Legend {quota?.legend_used ?? 0}회 · Maestro {quota?.maestro_used ?? 0}회 · 라마누잔·부속 도구 무제한
                </p>
              </div>

              <div className="text-xs text-white/50 pt-3 border-t border-white/10">
                다음 결제일: {sub.period_end?.slice(0, 10)}
                {sub.has_billing_key ? ' · 카드 등록됨' : ' · 카드 미등록 (결제 시 등록)'}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/pricing"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  요금제 변경
                </Link>
                {!sub.cancel_at_period_end && sub.status === 'active' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={actioning === 'cancel'}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 disabled:opacity-40"
                  >
                    {actioning === 'cancel' ? '처리 중...' : '정기결제 해지'}
                  </button>
                )}
              </div>
            </motion.section>

            {/* 결제 이력 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-3">결제 이력</h2>
              {data && data.payments.length > 0 ? (
                <ul className="space-y-2">
                  {data.payments.map((p, i) => {
                    const refundable = (p.refundable_amount_krw ?? 0) > 0 && p.status === 'paid';
                    return (
                      <motion.li
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3 flex-wrap"
                      >
                        <div className="flex-1 min-w-[180px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">{p.plan_code}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                                p.status === 'paid'
                                  ? 'bg-emerald-400/20 text-emerald-200'
                                  : p.status === 'canceled' || p.status === 'partial_canceled'
                                    ? 'bg-rose-400/20 text-rose-200'
                                    : 'bg-amber-400/20 text-amber-200'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          <p className="text-xs text-white/55">
                            {p.paid_at?.slice(0, 10) ?? '미결제'} · ₩{p.amount_krw.toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {p.receipt_url && (
                            <a
                              href={p.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-white/60 hover:text-white underline"
                            >
                              영수증
                            </a>
                          )}
                          {refundable && (
                            <button
                              type="button"
                              onClick={() => handleRefund(p.id)}
                              disabled={actioning === p.id}
                              className="px-2.5 py-1 rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 disabled:opacity-40"
                            >
                              {actioning === p.id ? '처리 중...' : '환불 신청'}
                            </button>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-white/40 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  결제 이력이 없어요.
                </p>
              )}
            </section>

            {/* 환불 이력 */}
            {data && data.refunds.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-3">환불 이력</h2>
                <ul className="space-y-2">
                  {data.refunds.map((r, i) => (
                    <motion.li
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm flex items-center justify-between"
                    >
                      <span className="text-white/75">
                        {r.created_at.slice(0, 10)} · ₩
                        {(r.amount_refunded_krw ?? 0).toLocaleString('ko-KR')}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          r.status === 'completed'
                            ? 'bg-emerald-400/20 text-emerald-200'
                            : r.status === 'pending'
                              ? 'bg-amber-400/20 text-amber-200'
                              : 'bg-rose-400/20 text-rose-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        <footer className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40 text-center">
          <Link href="/terms" className="mx-2 hover:text-white/70">이용약관</Link>·
          <Link href="/privacy" className="mx-2 hover:text-white/70">개인정보처리방침</Link>·
          <Link href="/refund" className="mx-2 hover:text-white/70">환불 정책</Link>·
          <Link href="/business-info" className="mx-2 hover:text-white/70">사업자 정보</Link>
        </footer>
      </div>
    </div>
  );
}
