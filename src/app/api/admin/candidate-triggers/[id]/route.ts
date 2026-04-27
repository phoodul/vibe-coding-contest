/**
 * Phase G-04 G04-9: candidate_triggers 검수 (approve / reject).
 * admin 전용. approve 시 math_tool_triggers 에 source='auto_mined' 로 머지.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedText } from "@/lib/euler/embed";

export const maxDuration = 30;
const ADMIN_EMAILS = ["phoodul@gmail.com"];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("candidate_triggers")
    .select("id, tool_id, direction, condition_pattern, goal_pattern, why, occurrence_count, similarity_to_existing, status, created_at")
    .in("status", ["mining", "pending_review"])
    .order("occurrence_count", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data ?? [] });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json()) as { action?: "approve" | "reject" };
  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const { data: cand, error: fetchErr } = await supabase
    .from("candidate_triggers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !cand) {
    return NextResponse.json({ error: "candidate not found" }, { status: 404 });
  }

  if (body.action === "reject") {
    await supabase.from("candidate_triggers").update({ status: "rejected" }).eq("id", id);
    return NextResponse.json({ ok: true, action: "reject", id });
  }

  // approve → math_tool_triggers insert
  const fwdText = [cand.condition_pattern, cand.why].filter(Boolean).join(" / ");
  const bwdText = [cand.goal_pattern, cand.why].filter(Boolean).join(" / ");
  let fwdVec: number[];
  let bwdVec: number[];
  try {
    [fwdVec, bwdVec] = await Promise.all([
      embedText(fwdText || (cand.why as string)),
      embedText(bwdText || (cand.why as string)),
    ]);
  } catch (e) {
    return NextResponse.json(
      { error: `embedding 실패: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  const { error: insErr } = await supabase.from("math_tool_triggers").insert({
    tool_id: cand.tool_id,
    direction: cand.direction,
    trigger_condition: cand.condition_pattern ?? "",
    derived_fact: null,
    goal_pattern: cand.goal_pattern ?? null,
    required_premises: [],
    why_text: cand.why,
    embedding_forward: fwdVec,
    embedding_backward: bwdVec,
    source: "auto_mined",
  });
  if (insErr) {
    return NextResponse.json(
      { error: `trigger insert 실패: ${insErr.message}` },
      { status: 500 },
    );
  }
  await supabase.from("candidate_triggers").update({ status: "approved" }).eq("id", id);
  return NextResponse.json({ ok: true, action: "approve", id });
}
