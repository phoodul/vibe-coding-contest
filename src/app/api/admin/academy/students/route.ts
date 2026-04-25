import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 15;

const ADMIN_EMAILS = ["phoodul@gmail.com"];

interface LayerRow {
  user_id: string;
  layer: number;
  area: string;
  attempts: number;
  successes: number;
  stuck_count: number;
  failure_count: number;
  l6_recall_miss: number;
  l6_trigger_miss: number;
  l5_domain_miss: number;
}

interface SolveRow {
  user_id: string;
  is_correct: boolean | null;
}

interface PerStudent {
  user_id: string;
  total_attempts: number;
  total_correct: number;
  area_attempts: Record<string, number>;
  l6_recall_miss: number;
  l6_trigger_miss: number;
  l5_domain_miss: number;
  computation_failure: number;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // user_layer_stats (전체 — 향후 academy 매핑 도입 시 학원별 필터)
    const { data: layerData } = await supabase
      .from("user_layer_stats")
      .select(
        "user_id, layer, area, attempts, successes, stuck_count, failure_count, l6_recall_miss, l6_trigger_miss, l5_domain_miss"
      );

    const { data: solveData } = await supabase
      .from("euler_solve_logs")
      .select("user_id, is_correct");

    const map = new Map<string, PerStudent>();
    for (const r of (layerData ?? []) as LayerRow[]) {
      const s = map.get(r.user_id) ?? {
        user_id: r.user_id,
        total_attempts: 0,
        total_correct: 0,
        area_attempts: {},
        l6_recall_miss: 0,
        l6_trigger_miss: 0,
        l5_domain_miss: 0,
        computation_failure: 0,
      };
      s.area_attempts[r.area] = (s.area_attempts[r.area] ?? 0) + r.attempts;
      s.l6_recall_miss += r.l6_recall_miss;
      s.l6_trigger_miss += r.l6_trigger_miss;
      s.l5_domain_miss += r.l5_domain_miss;
      if (r.layer >= 1 && r.layer <= 4) s.computation_failure += r.failure_count;
      map.set(r.user_id, s);
    }
    for (const log of (solveData ?? []) as SolveRow[]) {
      const s = map.get(log.user_id);
      if (!s) continue;
      s.total_attempts += 1;
      if (log.is_correct === true) s.total_correct += 1;
    }

    const students = Array.from(map.values()).sort((a, b) => b.total_attempts - a.total_attempts);

    // 반 종합 통계
    const aggregate = students.reduce(
      (acc, s) => ({
        students: acc.students + 1,
        total_attempts: acc.total_attempts + s.total_attempts,
        total_correct: acc.total_correct + s.total_correct,
        l6_recall_miss: acc.l6_recall_miss + s.l6_recall_miss,
        l6_trigger_miss: acc.l6_trigger_miss + s.l6_trigger_miss,
        l5_domain_miss: acc.l5_domain_miss + s.l5_domain_miss,
        computation_failure: acc.computation_failure + s.computation_failure,
      }),
      {
        students: 0,
        total_attempts: 0,
        total_correct: 0,
        l6_recall_miss: 0,
        l6_trigger_miss: 0,
        l5_domain_miss: 0,
        computation_failure: 0,
      }
    );

    return NextResponse.json({ students, aggregate });
  } catch (err) {
    console.error("academy-students error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
