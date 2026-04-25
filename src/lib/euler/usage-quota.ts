/**
 * Free 사용자 일일 풀이 시작 한도.
 *
 * project-decisions.md: 답 공개는 무제한, 풀이 **시작** 만 카운트.
 * Family/Academy/Student 유료 구독자는 한도 미적용.
 */

import { createClient } from "@/lib/supabase/server";

const FREE_DAILY_LIMIT = parseInt(process.env.EULER_FREE_DAILY_LIMIT ?? "10", 10);

export interface QuotaCheck {
  allowed: boolean;
  used: number;
  limit: number;
  is_paid: boolean;
}

function todayStartIso(): string {
  // KST(+9) 자정 기준
  const now = new Date();
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffsetMs);
  const kstMidnight = new Date(
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate())
  );
  return new Date(kstMidnight.getTime() - kstOffsetMs).toISOString();
}

async function isPaidUser(userId: string): Promise<boolean> {
  // Phase D-08 의 결제 테이블이 아직 없으므로 false 반환.
  // 향후 user_subscriptions 테이블 검증으로 교체.
  void userId;
  return false;
}

export async function checkFreeQuota(): Promise<QuotaCheck | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const paid = await isPaidUser(user.id);
  if (paid) {
    return { allowed: true, used: 0, limit: -1, is_paid: true };
  }

  const since = todayStartIso();
  const { count, error } = await supabase
    .from("euler_solve_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);

  if (error) {
    console.warn("usage-quota count error:", error);
    // 에러 시 conservative: 허용 (가용성 우선)
    return { allowed: true, used: 0, limit: FREE_DAILY_LIMIT, is_paid: false };
  }

  const used = count ?? 0;
  return {
    allowed: used < FREE_DAILY_LIMIT,
    used,
    limit: FREE_DAILY_LIMIT,
    is_paid: false,
  };
}
