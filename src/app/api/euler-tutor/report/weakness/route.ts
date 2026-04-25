import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aggregateWeakness } from "@/lib/euler/weakness-aggregator";

export const maxDuration = 30;

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const windowDays = Math.min(
      Math.max(parseInt(url.searchParams.get("window") ?? "30", 10), 7),
      180
    );

    const report = await aggregateWeakness({ windowDays });
    if (!report) {
      return NextResponse.json({ error: "report 생성 실패" }, { status: 500 });
    }
    return NextResponse.json(report);
  } catch (err) {
    console.error("euler-weakness error:", err);
    return NextResponse.json({ error: "Weakness 리포트 실패" }, { status: 500 });
  }
}
