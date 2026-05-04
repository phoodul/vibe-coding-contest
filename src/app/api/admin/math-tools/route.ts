import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedBatch } from "@/lib/euler/embed";
import { isAdminEmail } from "@/lib/legend/access-tier";

export const maxDuration = 30;

interface TriggerInput {
  direction: "forward" | "backward" | "both";
  condition?: string;
  derived_fact?: string;
  goal_pattern?: string;
  premises?: string[];
  why: string;
}

interface ToolInput {
  id: string;
  name: string;
  knowledge_layer: number;
  formula_latex: string;
  prerequisites?: string[];
  triggers: TriggerInput[];
}

function validate(t: ToolInput): string | null {
  if (!t.id || !/^[A-Z][A-Z0-9_]{1,49}$/.test(t.id)) return "id 는 대문자/숫자/언더스코어 2~50자 (대문자 시작)";
  if (!t.name?.trim()) return "name 필수";
  if (!t.formula_latex?.trim()) return "formula_latex 필수";
  if (!Number.isInteger(t.knowledge_layer) || t.knowledge_layer < 1 || t.knowledge_layer > 6)
    return "knowledge_layer 는 1~6 정수";
  if (!Array.isArray(t.triggers) || t.triggers.length === 0) return "triggers 1개 이상 필요";
  for (const trig of t.triggers) {
    if (!trig.why?.trim()) return "각 trigger 에 why 필수";
    if (trig.direction === "forward" && !trig.condition?.trim())
      return "forward trigger 는 condition 필수";
    if (trig.direction === "backward" && !trig.goal_pattern?.trim())
      return "backward trigger 는 goal_pattern 필수";
  }
  return null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ToolInput;
  try {
    body = (await req.json()) as ToolInput;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  // 1) 중복 체크
  const { data: existing } = await supabase
    .from("math_tools")
    .select("id")
    .eq("id", body.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: `id "${body.id}" 이미 존재` }, { status: 409 });
  }

  // 2) math_tools insert
  const { error: toolErr } = await supabase.from("math_tools").insert({
    id: body.id,
    name: body.name,
    knowledge_layer: body.knowledge_layer,
    formula_latex: body.formula_latex,
    prerequisites: body.prerequisites ?? [],
    source: "user",
    source_meta: { added_by: user.email, added_at: new Date().toISOString() },
  });
  if (toolErr) {
    return NextResponse.json({ error: `tool insert 실패: ${toolErr.message}` }, { status: 500 });
  }

  // 3) 각 trigger 양방향 임베딩 생성
  let fwdVecs: number[][] = [];
  let bwdVecs: number[][] = [];
  try {
    const fwdTexts = body.triggers.map((t) =>
      [t.condition, t.derived_fact, t.why].filter(Boolean).join(" / ")
    );
    const bwdTexts = body.triggers.map((t) =>
      [t.goal_pattern, ...(t.premises ?? []), t.why].filter(Boolean).join(" / ")
    );
    fwdVecs = await embedBatch(fwdTexts);
    bwdVecs = await embedBatch(bwdTexts);
  } catch (e) {
    // tool 은 들어갔지만 trigger 가 실패한 경우 — 롤백
    await supabase.from("math_tools").delete().eq("id", body.id);
    return NextResponse.json(
      { error: `embedding 실패 (tool 롤백): ${(e as Error).message}` },
      { status: 500 }
    );
  }

  // 4) trigger insert
  const triggerRows = body.triggers.map((t, i) => ({
    tool_id: body.id,
    direction: t.direction,
    trigger_condition: t.condition ?? "",
    derived_fact: t.derived_fact ?? null,
    goal_pattern: t.goal_pattern ?? null,
    required_premises: t.premises ?? [],
    why_text: t.why,
    embedding_forward: fwdVecs[i],
    embedding_backward: bwdVecs[i],
  }));
  const { error: trigErr } = await supabase.from("math_tool_triggers").insert(triggerRows);
  if (trigErr) {
    await supabase.from("math_tools").delete().eq("id", body.id);
    return NextResponse.json(
      { error: `trigger insert 실패 (tool 롤백): ${trigErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    tool_id: body.id,
    triggers_inserted: triggerRows.length,
  });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { count: toolCount } = await supabase
    .from("math_tools")
    .select("*", { count: "exact", head: true });
  const { count: triggerCount } = await supabase
    .from("math_tool_triggers")
    .select("*", { count: "exact", head: true });
  return NextResponse.json({
    tools: toolCount ?? 0,
    triggers: triggerCount ?? 0,
  });
}
