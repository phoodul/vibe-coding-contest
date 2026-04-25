"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";

interface PlanDef {
  id: "student" | "family" | "academy";
  name: string;
  amount: number;
  features: string[];
  badge?: string;
}

const PLANS: PlanDef[] = [
  {
    id: "student",
    name: "Student",
    amount: 12000,
    features: ["일일 풀이 무제한", "약점 리포트", "사고 과정 코칭"],
  },
  {
    id: "family",
    name: "Family",
    amount: 19000,
    features: ["부모 잠금 (lock_reveal)", "자녀 2명 포함", "부모 대시보드"],
    badge: "추천",
  },
  {
    id: "academy",
    name: "Academy",
    amount: 5000,
    features: ["학생당 5,000~8,000원", "교사 대시보드", "반 종합 약점 뷰"],
  },
];

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        options: Record<string, unknown>
      ) => Promise<unknown>;
    };
  }
}

export default function EulerBillingPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? null } : null);
      setAuthChecked(true);
    });
  }, []);

  async function pay(plan: PlanDef) {
    if (!user) {
      alert("로그인 후 결제를 진행해주세요.");
      return;
    }
    if (!TOSS_CLIENT_KEY) {
      alert("결제 키가 설정되지 않았습니다. (NEXT_PUBLIC_TOSS_CLIENT_KEY)");
      return;
    }
    if (!window.TossPayments) {
      alert("결제 SDK 로드 실패. 잠시 후 다시 시도해주세요.");
      return;
    }
    setBusy(plan.id);
    try {
      const orderId = `euler-${plan.id}-${user.id.slice(0, 8)}-${Date.now()}`;
      const tp = window.TossPayments(TOSS_CLIENT_KEY);
      await tp.requestPayment("카드", {
        amount: plan.amount,
        orderId,
        orderName: `Euler Tutor ${plan.name}`,
        customerName: user.email ?? user.id.slice(0, 8),
        successUrl: `${window.location.origin}/api/billing/toss/confirm?plan=${plan.id}`,
        failUrl: `${window.location.origin}/euler/billing?failed=1`,
      });
    } catch (e) {
      console.error(e);
      alert(`결제 시도 중 오류: ${String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <Script src="https://js.tosspayments.com/v1/payment" strategy="afterInteractive" />
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">오일러 튜터 구독</h1>
          <p className="text-sm text-white/60 mt-2">정답을 가르치지 않는 코치를 무제한으로 만나세요.</p>
          <p className="text-xs text-white/40 mt-1">
            <Link href="/euler-tutor" className="underline hover:text-white">
              ← 채팅으로 돌아가기
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`relative p-6 rounded-2xl border ${
                p.badge
                  ? "bg-gradient-to-b from-violet-500/15 to-violet-500/5 border-violet-400/40"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 right-4 text-[10px] px-2 py-0.5 rounded-full bg-violet-500 text-white">
                  {p.badge}
                </span>
              )}
              <h3 className="font-bold text-lg">{p.name}</h3>
              <div className="mt-2 text-2xl font-bold">
                ₩{p.amount.toLocaleString()}
                <span className="text-sm font-normal text-white/60">/월</span>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-white/80">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button
                onClick={() => pay(p)}
                disabled={busy !== null || !authChecked}
                className="mt-5 w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
              >
                {busy === p.id ? "결제창 여는 중..." : "구독 시작"}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-xs text-center text-white/40">
          결제는 Toss Payments 를 통해 안전하게 처리됩니다.
          <br />
          첫 7일 무료 체험 후 자동 결제됩니다. 언제든 취소 가능.
        </p>
      </div>
    </div>
  );
}
