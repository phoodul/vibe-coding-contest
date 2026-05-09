/**
 * 23차 (2026-05-10) A3 — /admin/billing 환불 검토 + 결제 모니터링.
 *
 * admin layout 가 자동 가드. UI 진입점 = admin nav 의 "결제·환불" 링크.
 *
 * 기능:
 *   1. 이번 달 통계: 결제·매출·환불 건수+금액·pending 건수
 *   2. Pending 환불 목록 (7일 초과 사용자 신청건) — 승인/반려 버튼
 *   3. 최근 결제 50건 (status·plan·금액·email·영수증)
 */
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Stats {
  paid_this_month: number;
  revenue_this_month: number;
  refunded_this_month: number;
  refund_amount_this_month: number;
  pending_refunds: number;
}

interface RefundRow {
  id: string;
  payment_id: string;
  user_email: string;
  amount_requested_krw: number;
  reason: string;
  reason_text: string | null;
  status: string;
  created_at: string;
  plan_code: string | null;
  paid_at: string | null;
}

interface PaymentRow {
  id: string;
  user_email: string;
  plan_code: string;
  amount_krw: number;
  status: string;
  paid_at: string | null;
  receipt_url: string | null;
}

interface ApiResponse {
  stats: Stats;
  refunds: RefundRow[];
  recent_payments: PaymentRow[];
}

type Tab = 'pending' | 'all';

export default function AdminBillingPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/billing/refunds?tab=${tab}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleAction(refundId: string, action: 'approve' | 'reject') {
    const adminNote =
      action === 'approve'
        ? prompt('승인 사유 (선택)') ?? undefined
        : prompt('반려 사유 (필수)');
    if (action === 'reject' && !adminNote) return;
    if (!confirm(action === 'approve' ? '환불을 승인할까요?' : '환불을 반려할까요?')) return;

    setBusy(refundId);
    try {
      const res = await fetch('/api/admin/billing/refund-action', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refund_id: refundId, action, admin_note: adminNote }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        alert(json.message ?? '처리 실패');
      } else {
        alert(action === 'approve' ? '환불 처리 완료' : '환불 반려됨');
        void load();
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">결제 · 환불 관리</h1>
        <p className="text-sm text-white/60">이번 달 통계 + pending 환불 검토 + 최근 결제 모니터링</p>
      </header>

      {/* 통계 카드 */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard label="이번 달 결제" value={`${data.stats.paid_this_month}건`} accent="cyan" />
          <StatCard
            label="이번 달 매출"
            value={`₩${data.stats.revenue_this_month.toLocaleString('ko-KR')}`}
            accent="emerald"
          />
          <StatCard
            label="이번 달 환불"
            value={`${data.stats.refunded_this_month}건`}
            accent="rose"
          />
          <StatCard
            label="환불 금액"
            value={`₩${data.stats.refund_amount_this_month.toLocaleString('ko-KR')}`}
            accent="rose"
          />
          <StatCard
            label="Pending 환불"
            value={`${data.stats.pending_refunds}건`}
            accent="amber"
            highlight={data.stats.pending_refunds > 0}
          />
        </div>
      )}

      {/* 환불 검토 */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">환불 신청</h2>
          <div className="flex gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setTab('pending')}
              className={`px-2.5 py-1 rounded-full font-semibold ${
                tab === 'pending'
                  ? 'bg-amber-400/20 border border-amber-300/40 text-amber-100'
                  : 'border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`px-2.5 py-1 rounded-full font-semibold ${
                tab === 'all'
                  ? 'bg-white/15 border border-white/20 text-white'
                  : 'border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-white/40 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
            불러오는 중...
          </p>
        ) : error ? (
          <p className="text-sm text-rose-300 p-6 rounded-xl bg-rose-500/10 border border-rose-400/30 text-center">
            오류: {error}
          </p>
        ) : data && data.refunds.length > 0 ? (
          <ul className="space-y-2">
            {data.refunds.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{r.user_email}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-white/10 text-white/70">
                        {r.plan_code ?? '?'}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-white/55 mb-1">
                      신청 {r.created_at.slice(0, 16).replace('T', ' ')} · 결제일{' '}
                      {r.paid_at?.slice(0, 10) ?? '?'} · 환불 요청 ₩
                      {r.amount_requested_krw.toLocaleString('ko-KR')}
                    </p>
                    <p className="text-xs text-white/70">
                      <span className="text-white/40">사유</span> {r.reason}
                      {r.reason_text && (
                        <>
                          {' · '}
                          <span className="text-white/40">메모</span> {r.reason_text}
                        </>
                      )}
                    </p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(r.id, 'approve')}
                        disabled={busy === r.id}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-400/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-40"
                      >
                        {busy === r.id ? '처리 중...' : '승인'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(r.id, 'reject')}
                        disabled={busy === r.id}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-rose-400/40 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25 disabled:opacity-40"
                      >
                        반려
                      </button>
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/40 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
            {tab === 'pending' ? 'Pending 환불이 없어요.' : '환불 이력이 없어요.'}
          </p>
        )}
      </section>

      {/* 최근 결제 */}
      <section>
        <h2 className="text-lg font-bold mb-3">최근 결제 (50건)</h2>
        {data && data.recent_payments.length > 0 ? (
          <ul className="space-y-1.5">
            {data.recent_payments.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.015 }}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-white/50 text-xs tabular-nums w-[88px]">
                    {p.paid_at?.slice(0, 10) ?? '미결제'}
                  </span>
                  <span className="font-mono text-xs text-white/70 w-[140px]">
                    {p.user_email.slice(0, 18)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-white/10 text-white/70">
                    {p.plan_code}
                  </span>
                  <StatusBadge status={p.status} />
                  <span className="text-white/85 tabular-nums">
                    ₩{p.amount_krw.toLocaleString('ko-KR')}
                  </span>
                </div>
                {p.receipt_url && (
                  <a
                    href={p.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-white/50 hover:text-white"
                  >
                    영수증 ↗
                  </a>
                )}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/40 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
            결제 이력이 없어요.
          </p>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  accent: 'cyan' | 'emerald' | 'rose' | 'amber';
  highlight?: boolean;
}) {
  const accentColor = {
    cyan: 'border-cyan-400/30 bg-cyan-500/5',
    emerald: 'border-emerald-400/30 bg-emerald-500/5',
    rose: 'border-rose-400/30 bg-rose-500/5',
    amber: 'border-amber-400/30 bg-amber-500/5',
  }[accent];
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${accentColor} ${
        highlight ? 'ring-2 ring-amber-300/40 animate-pulse' : ''
      }`}
    >
      <p className="text-[10px] text-white/55 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'paid' || status === 'completed'
      ? 'bg-emerald-400/20 text-emerald-200'
      : status === 'pending'
        ? 'bg-amber-400/20 text-amber-200'
        : status === 'rejected' || status === 'failed' || status === 'canceled' || status === 'partial_canceled'
          ? 'bg-rose-400/20 text-rose-200'
          : 'bg-white/10 text-white/70';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${cls}`}>{status}</span>;
}
