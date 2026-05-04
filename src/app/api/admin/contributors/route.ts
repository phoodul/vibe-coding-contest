/**
 * Phase G-04 G04-8: contributor 권한 토글 (admin 전용).
 * GET: 목록 (전체 + can_contribute_triggers=true 만)
 * PATCH: { user_id, can_contribute }
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/legend/access-tier";

export const maxDuration = 15;

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const onlyContributors = url.searchParams.get("only") === "contributors";

  let q = supabase
    .from("profiles")
    .select("id, display_name, can_contribute_triggers, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (onlyContributors) q = q.eq("can_contribute_triggers", true);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profiles: data ?? [] });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { user_id?: string; can_contribute?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.user_id || typeof body.can_contribute !== "boolean") {
    return NextResponse.json(
      { error: "user_id, can_contribute (boolean) 필수" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ can_contribute_triggers: body.can_contribute })
    .eq("id", body.user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, user_id: body.user_id, can_contribute: body.can_contribute });
}
