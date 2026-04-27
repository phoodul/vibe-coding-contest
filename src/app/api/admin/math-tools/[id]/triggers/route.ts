/**
 * Phase G-04 G04-8: 기존 도구에 trigger 단독 추가.
 *
 * 권한: ADMIN_EMAILS hardcode OR profiles.can_contribute_triggers = true.
 * 출처(source) 추적: developer / 정석 / 해법서 / beta_contributor.
 *   - admin → 'developer' 또는 사용자가 명시한 출처 (정석/해법서)
 *   - 베타 contributor → 무조건 'beta_contributor' (위변조 방지)
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedText } from "@/lib/euler/embed";

export const maxDuration = 30;

const ADMIN_EMAILS = ["phoodul@gmail.com"];
const ALLOWED_SOURCES_DEV = ["developer", "정석", "해법서"] as const;

interface TriggerInput {
  direction: "forward" | "backward" | "both";
  condition?: string;
  derived_fact?: string;
  goal_pattern?: string;
  premises?: string[];
  why: string;
  source?: string;
  note?: string;
}

function validate(t: TriggerInput): string | null {
  if (!t.why?.trim()) return "why 필수";
  if (t.direction === "forward" && !t.condition?.trim())
    return "forward 는 condition 필수";
  if (t.direction === "backward" && !t.goal_pattern?.trim())
    return "backward 는 goal_pattern 필수";
  if (t.direction === "both" && !(t.condition?.trim() || t.goal_pattern?.trim()))
    return "both 는 condition 또는 goal_pattern 중 하나 이상 필수";
  if (t.why.length > 500) return "why 는 500자 이내";
  return null;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");
  let isContributor = false;
  if (!isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("can_contribute_triggers")
      .eq("id", user.id)
      .maybeSingle();
    isContributor = profile?.can_contribute_triggers === true;
  }
  if (!isAdmin && !isContributor) {
    return NextResponse.json(
      { error: "trigger 추가 권한이 없습니다 (admin 에게 contributor 권한 요청 필요)" },
      { status: 403 }
    );
  }

  const { id: toolId } = await ctx.params;
  if (!toolId) return NextResponse.json({ error: "tool id 필수" }, { status: 400 });

  let body: TriggerInput;
  try {
    body = (await req.json()) as TriggerInput;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const verr = validate(body);
  if (verr) return NextResponse.json({ error: verr }, { status: 400 });

  // 도구 존재 확인
  const { data: tool } = await supabase
    .from("math_tools")
    .select("id, name")
    .eq("id", toolId)
    .maybeSingle();
  if (!tool) {
    return NextResponse.json({ error: `도구 "${toolId}" 가 없습니다` }, { status: 404 });
  }

  // 출처 결정 (베타 contributor 는 무조건 beta_contributor 로 강제)
  let source: string;
  if (isContributor && !isAdmin) {
    source = "beta_contributor";
  } else {
    const userSrc = (body.source ?? "developer").trim();
    source = ALLOWED_SOURCES_DEV.includes(userSrc as (typeof ALLOWED_SOURCES_DEV)[number])
      ? userSrc
      : "developer";
  }

  // 임베딩
  const fwdText = [body.condition, body.derived_fact, body.why].filter(Boolean).join(" / ");
  const bwdText = [body.goal_pattern, ...(body.premises ?? []), body.why]
    .filter(Boolean)
    .join(" / ");
  let fwdVec: number[];
  let bwdVec: number[];
  try {
    [fwdVec, bwdVec] = await Promise.all([
      embedText(fwdText || body.why),
      embedText(bwdText || body.why),
    ]);
  } catch (e) {
    return NextResponse.json(
      { error: `embedding 실패: ${(e as Error).message}` },
      { status: 500 }
    );
  }

  const { data: inserted, error: insErr } = await supabase
    .from("math_tool_triggers")
    .insert({
      tool_id: toolId,
      direction: body.direction,
      trigger_condition: body.condition ?? "",
      derived_fact: body.derived_fact ?? null,
      goal_pattern: body.goal_pattern ?? null,
      required_premises: body.premises ?? [],
      why_text: body.why,
      embedding_forward: fwdVec,
      embedding_backward: bwdVec,
      source,
    })
    .select("id")
    .single();
  if (insErr) {
    return NextResponse.json(
      { error: `trigger insert 실패: ${insErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    trigger_id: inserted?.id,
    tool_id: toolId,
    tool_name: tool.name,
    source,
    contributed_by: user.email,
  });
}
