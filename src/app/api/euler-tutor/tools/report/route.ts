import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportTools, type ToolReportInput } from "@/lib/euler/tool-reporter";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { tools?: ToolReportInput[] };
    if (!Array.isArray(body.tools) || body.tools.length === 0) {
      return NextResponse.json({ error: "tools[] required" }, { status: 400 });
    }
    if (body.tools.length > 20) {
      return NextResponse.json({ error: "max 20 tools per call" }, { status: 400 });
    }

    const results = await reportTools(body.tools);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("euler-tools-report error:", err);
    return NextResponse.json({ error: "Tool report 실패" }, { status: 500 });
  }
}
