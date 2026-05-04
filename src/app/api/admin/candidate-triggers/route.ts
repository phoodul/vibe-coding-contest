/**
 * Phase G-04 G04-9: candidate_triggers 검수 큐 list (admin 전용).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/legend/access-tier";

export const maxDuration = 15;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("candidate_triggers")
    .select(
      "id, tool_id, direction, condition_pattern, goal_pattern, why, occurrence_count, similarity_to_existing, status, created_at",
    )
    .in("status", ["mining", "pending_review"])
    .order("occurrence_count", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data ?? [] });
}
