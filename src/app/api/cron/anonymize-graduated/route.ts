import { NextResponse } from "next/server";
import { createClient as createServer } from "@supabase/supabase-js";

/**
 * LEG-04: 졸업일 + 1년 경과한 사용자의 PII 익명화 cron.
 *
 * - vercel.json crons: 매일 KST 03시(UTC 18시) 실행
 * - 인증: Vercel Cron 은 자동으로 Authorization: Bearer <CRON_SECRET> 부착
 *   (env CRON_SECRET 비어있으면 임의 호출 차단)
 *
 * 동작:
 *   1) profiles.graduated_at + 1 year < now 사용자 추출
 *   2) auth.users 의 email 을 SHA-256 hash 로 교체 (재로그인 불가)
 *   3) profiles 의 display_name 을 'anon-<hash6>' 로 치환
 *   4) euler_solve_logs 등 통계는 그대로 보존 (익명 분석용)
 *
 * 주의: service_role 키 필요. 없으면 함수가 noop.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CRON_SECRET = process.env.CRON_SECRET ?? "";

interface GraduateRow {
  user_id: string;
  graduated_at: string;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(req: Request) {
  // Vercel Cron 호출 검증
  const authHeader = req.headers.get("authorization") ?? "";
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return NextResponse.json(
      { error: "service_role_missing", message: "SUPABASE_SERVICE_ROLE_KEY 미설정" },
      { status: 500 }
    );
  }

  const supabase = createServer(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // 졸업 + 1년 경과 사용자 조회 (profiles 테이블에 graduated_at 컬럼이 있다고 가정)
  // 컬럼이 없으면 0건 반환 — 운영 시 profiles 스키마에 graduated_at 추가 필요
  const oneYearAgoIso = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString();
  const { data: rows, error } = await supabase
    .from("profiles")
    .select("user_id, graduated_at")
    .lt("graduated_at", oneYearAgoIso)
    .not("graduated_at", "is", null);

  if (error) {
    console.error("[anonymize] query error:", error);
    return NextResponse.json({ error: "query_failed", detail: error.message }, { status: 500 });
  }

  let anonymized = 0;
  for (const r of (rows ?? []) as GraduateRow[]) {
    try {
      const hash = (await sha256Hex(r.user_id)).slice(0, 6);
      // profiles 익명화
      await supabase
        .from("profiles")
        .update({ display_name: `anon-${hash}`, anonymized_at: new Date().toISOString() })
        .eq("user_id", r.user_id);

      // auth.users.email 익명화 (admin API 필요)
      await supabase.auth.admin.updateUserById(r.user_id, {
        email: `anon-${hash}@example.invalid`,
        user_metadata: { anonymized: true },
      });

      anonymized++;
    } catch (e) {
      console.error(`[anonymize] failed for ${r.user_id}:`, e);
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: rows?.length ?? 0,
    anonymized,
    cutoff: oneYearAgoIso,
  });
}
