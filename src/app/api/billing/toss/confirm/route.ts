import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Toss Payments — 결제 승인 콜백 (successUrl).
 * 클라이언트 SDK 가 successUrl 로 redirect 하면서 query 로 paymentKey/orderId/amount 전달.
 *
 * 1) Toss API 로 confirm 호출 → 위변조 검증
 * 2) user_subscriptions upsert
 * 3) /euler/billing/success 로 redirect
 *
 * 보안: server-side amount 재계산 + Toss 응답 amount 일치 확인.
 * 정기결제(빌링키)는 Phase E 로 이월 — 여기서는 1회 결제만.
 */

const TOSS_SECRET = process.env.TOSS_SECRET_KEY ?? "";

const PLAN_AMOUNTS: Record<string, number> = {
  student: 12000,
  family: 19000,
  academy: 5000,
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const paymentKey = url.searchParams.get("paymentKey");
  const orderId = url.searchParams.get("orderId");
  const amount = parseInt(url.searchParams.get("amount") ?? "0", 10);
  const plan = url.searchParams.get("plan") ?? "";

  if (!paymentKey || !orderId || !amount || !plan || !PLAN_AMOUNTS[plan]) {
    return NextResponse.redirect(new URL("/euler/billing?failed=1&reason=bad_params", req.url));
  }

  // server-side amount 재검증
  const expected = PLAN_AMOUNTS[plan];
  if (amount !== expected) {
    return NextResponse.redirect(new URL("/euler/billing?failed=1&reason=amount_mismatch", req.url));
  }

  if (!TOSS_SECRET) {
    return NextResponse.redirect(new URL("/euler/billing?failed=1&reason=not_configured", req.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login?next=/euler/billing", req.url));
  }

  // Toss confirm API
  try {
    const auth = Buffer.from(`${TOSS_SECRET}:`).toString("base64");
    const resp = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[toss-confirm] api error:", resp.status, errText);
      return NextResponse.redirect(
        new URL(`/euler/billing?failed=1&reason=toss_${resp.status}`, req.url)
      );
    }
    const data = (await resp.json()) as { totalAmount: number; status: string; mId: string };
    if (data.totalAmount !== expected || data.status !== "DONE") {
      return NextResponse.redirect(new URL("/euler/billing?failed=1&reason=verify_failed", req.url));
    }

    // 구독 등록 (period_end = +30일)
    const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const { error: subErr } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan,
          status: "active",
          amount: expected,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    if (subErr) {
      console.error("[toss-confirm] subscription upsert failed:", subErr);
      // 결제는 성공했으나 적재 실패 — 운영 알림 필요
      return NextResponse.redirect(
        new URL("/euler/billing?failed=1&reason=record_failed", req.url)
      );
    }

    return NextResponse.redirect(new URL("/euler/billing?success=1", req.url));
  } catch (err) {
    console.error("[toss-confirm] error:", err);
    return NextResponse.redirect(new URL("/euler/billing?failed=1&reason=exception", req.url));
  }
}
