/**
 * 22차 (2026-05-09) 신설 → 23차 (2026-05-10) A2: 빌링키 분기 추가.
 *
 * 두 흐름 분기:
 *   1) 단발 결제 (topup_100): query = ?paymentKey=...&orderId=...&amount=...
 *      → POST /api/payment/confirm
 *   2) 정기결제 빌링키 등록 (Basic/Standard/Premium): query = ?authKey=...&customerKey=...&_flow=billing&order_id=...
 *      → POST /api/payment/billing-key (빌링키 발급 + 첫 결제 charge)
 */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaymentSuccessPage() {
  const sp = useSearchParams();
  const flow = sp.get('_flow');
  const authKey = sp.get('authKey');
  const customerKey = sp.get('customerKey');
  const orderIdFromBilling = sp.get('order_id');
  const paymentKey = sp.get('paymentKey');
  const orderId = sp.get('orderId');
  const amount = sp.get('amount');

  const [status, setStatus] = useState<'confirming' | 'ok' | 'fail'>('confirming');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 정기결제 빌링키 등록 흐름
        if (flow === 'billing' && authKey) {
          const res = await fetch('/api/payment/billing-key', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              authKey,
              customerKey,
              order_id: orderIdFromBilling,
            }),
          });
          if (cancelled) return;
          if (!res.ok) {
            const err = (await res.json().catch(() => ({}))) as { message?: string };
            setStatus('fail');
            setError(err.message ?? '빌링키 등록에 실패했습니다.');
            return;
          }
          const data = (await res.json()) as { receipt_url?: string };
          setReceiptUrl(data.receipt_url ?? null);
          setStatus('ok');
          return;
        }

        // 단발 결제 흐름 (topup_100)
        if (!paymentKey || !orderId || !amount) {
          setStatus('fail');
          setError('결제 정보가 누락되었습니다.');
          return;
        }
        const res = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount, 10),
          }),
        });
        if (cancelled) return;
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { message?: string };
          setStatus('fail');
          setError(err.message ?? '결제 승인에 실패했습니다.');
          return;
        }
        const data = (await res.json()) as { receipt_url?: string };
        setReceiptUrl(data.receipt_url ?? null);
        setStatus('ok');
      } catch (e) {
        if (cancelled) return;
        setStatus('fail');
        setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flow, authKey, customerKey, orderIdFromBilling, paymentKey, orderId, amount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
      >
        {status === 'confirming' && (
          <>
            <div className="mx-auto w-12 h-12 mb-4 rounded-full border-2 border-cyan-300/40 border-t-cyan-200 animate-spin" />
            <h1 className="text-xl font-bold mb-2">결제 승인 중...</h1>
            <p className="text-sm text-white/60">잠시만 기다려 주세요.</p>
          </>
        )}
        {status === 'ok' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-xl font-bold mb-2">결제가 완료되었습니다</h1>
            <p className="text-sm text-white/60 mb-6">
              구독이 활성화되었습니다. 지금 바로 이용을 시작할 수 있어요.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="block w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-sm font-semibold transition-colors"
              >
                대시보드로 이동
              </Link>
              {receiptUrl && (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white/70 transition-colors"
                >
                  영수증 보기 ↗
                </a>
              )}
              <Link
                href="/billing"
                className="block w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white/70 transition-colors"
              >
                구독 관리
              </Link>
            </div>
          </>
        )}
        {status === 'fail' && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold mb-2">결제 승인 실패</h1>
            <p className="text-sm text-rose-200/80 mb-6">{error}</p>
            <Link
              href="/pricing"
              className="block w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors"
            >
              요금제 다시 보기
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
