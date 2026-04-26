import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 15;

interface DailyStat {
  day: string; // YYYY-MM-DD
  attempts: number;
  correct: number;
}

interface LayerSeriesPoint {
  day: string;
  layer: number;
  attempts: number;
  successes: number;
  pass_rate: number;
}

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
    const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "30", 10), 7), 180);
    const sinceIso = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    // 1) 일자별 풀이 수 + 정답률 + Phase G-03 chain 종료 분포
    const { data: logs } = await supabase
      .from("euler_solve_logs")
      .select("created_at, is_correct, area, tools_used, chain_termination, chain_depth")
      .eq("user_id", user.id)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true });

    const daily: Map<string, DailyStat> = new Map();
    const toolFreq: Map<string, number> = new Map();
    const areaFreq: Map<string, number> = new Map();
    const chainDist: Record<
      "reached_conditions" | "max_depth" | "dead_end" | "cycle",
      number
    > = { reached_conditions: 0, max_depth: 0, dead_end: 0, cycle: 0 };
    let chainExecCount = 0;
    let chainDepthSum = 0;

    for (const row of (logs ?? []) as {
      created_at: string;
      is_correct: boolean | null;
      area: string | null;
      tools_used: string[] | null;
      chain_termination: keyof typeof chainDist | null;
      chain_depth: number | null;
    }[]) {
      const day = row.created_at.slice(0, 10);
      const stat = daily.get(day) ?? { day, attempts: 0, correct: 0 };
      stat.attempts += 1;
      if (row.is_correct === true) stat.correct += 1;
      daily.set(day, stat);
      if (row.area) areaFreq.set(row.area, (areaFreq.get(row.area) ?? 0) + 1);
      for (const t of row.tools_used ?? []) {
        toolFreq.set(t, (toolFreq.get(t) ?? 0) + 1);
      }
      if (row.chain_termination) {
        chainDist[row.chain_termination] = (chainDist[row.chain_termination] ?? 0) + 1;
        chainExecCount += 1;
        if (row.chain_depth) chainDepthSum += row.chain_depth;
      }
    }

    // 2) Layer 별 통과율 (현재 시점 누적 — 시계열은 향후 확장)
    const { data: layerRows } = await supabase
      .from("user_layer_stats")
      .select("layer, area, attempts, successes")
      .eq("user_id", user.id);

    const layerSeries: LayerSeriesPoint[] = ((layerRows ?? []) as {
      layer: number;
      area: string;
      attempts: number;
      successes: number;
    }[]).map((r) => ({
      day: new Date().toISOString().slice(0, 10),
      layer: r.layer,
      attempts: r.attempts,
      successes: r.successes,
      pass_rate: r.attempts > 0 ? r.successes / r.attempts : 0,
    }));

    // 3) 도구 다양성
    const distinctTools = toolFreq.size;
    const topTools = Array.from(toolFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 리포트 게이트 — 사용자 전체 누적 (window 무관) 첫 풀이 시점 + 총 풀이 수
    const { data: firstSolve } = await supabase
      .from("euler_solve_logs")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const { count: totalEverCount } = await supabase
      .from("euler_solve_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const firstSolveAt = (firstSolve as { created_at: string } | null)?.created_at ?? null;
    const totalEver = totalEverCount ?? 0;

    return NextResponse.json({
      window_days: days,
      total_attempts: (logs ?? []).length,
      total_correct: (logs ?? []).filter((l) => (l as { is_correct: boolean | null }).is_correct === true).length,
      daily: Array.from(daily.values()),
      layer_series: layerSeries,
      area_distribution: Array.from(areaFreq.entries()).map(([area, count]) => ({ area, count })),
      distinct_tools_used: distinctTools,
      top_tools: topTools,
      // 리포트 게이트 메타 (페이지에서 7일 + 10문제 검증)
      first_solve_at: firstSolveAt,
      total_solves_ever: totalEver,
      // Phase G-03: Recursive Chain 통계
      chain: {
        executed_count: chainExecCount,
        avg_depth: chainExecCount > 0 ? chainDepthSum / chainExecCount : 0,
        distribution: chainDist,
        success_rate:
          chainExecCount > 0 ? chainDist.reached_conditions / chainExecCount : 0,
      },
    });
  } catch (err) {
    console.error("euler-progress error:", err);
    return NextResponse.json({ error: "Progress 리포트 실패" }, { status: 500 });
  }
}
