import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runCritic } from "@/lib/euler/critic-client";
import type { BuildCriticPromptArgs } from "@/lib/ai/euler-critic-prompt";

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

    const body = (await req.json()) as BuildCriticPromptArgs;
    if (!body.problem || typeof body.problem !== "string") {
      return NextResponse.json({ error: "problem (string) required" }, { status: 400 });
    }

    const result = await runCritic(body);
    if (!result) {
      return NextResponse.json({ error: "Critic returned non-JSON or failed" }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("euler-critic error:", err);
    return NextResponse.json({ error: "Critic 호출 실패" }, { status: 500 });
  }
}
