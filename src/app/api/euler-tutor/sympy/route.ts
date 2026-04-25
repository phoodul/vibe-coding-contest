import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callSympy, isSympyError, type SympyOp } from "@/lib/euler/sympy-client";

export const maxDuration = 40;

const ALLOWED_OPS: SympyOp[] = [
  "differentiate",
  "integrate",
  "solve_equation",
  "simplify",
  "factor",
  "series_expand",
];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { op?: string; args?: Record<string, unknown> };
    if (!body.op || !ALLOWED_OPS.includes(body.op as SympyOp)) {
      return NextResponse.json(
        { error: "invalid_op", allowed: ALLOWED_OPS },
        { status: 400 }
      );
    }
    if (!body.args || typeof body.args !== "object") {
      return NextResponse.json({ error: "args (object) required" }, { status: 400 });
    }

    const result = await callSympy(body.op as SympyOp, body.args);
    if (isSympyError(result)) {
      return NextResponse.json(result, { status: 502 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("euler-sympy proxy error:", err);
    return NextResponse.json({ error: "SymPy 프록시 실패" }, { status: 500 });
  }
}
