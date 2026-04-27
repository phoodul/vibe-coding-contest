/**
 * Phase G-04 G04-9 cron: 자체 학습 trigger mining (매일 1회).
 * 인증: Authorization: Bearer ${CRON_SECRET}.
 * vercel.json 에 cron 등록.
 */
import { NextResponse } from "next/server";
import { runTriggerMiner } from "@/lib/euler/trigger-miner";

export const maxDuration = 300; // 5분 (Haiku 호출 누적)
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const start = Date.now();
  try {
    const result = await runTriggerMiner();
    return NextResponse.json({
      ok: true,
      duration_ms: Date.now() - start,
      ...result,
    });
  } catch (e) {
    console.error("[cron mine-triggers]", e);
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    );
  }
}

// Vercel cron 은 GET 으로 호출. POST 도 허용.
export const POST = GET;
