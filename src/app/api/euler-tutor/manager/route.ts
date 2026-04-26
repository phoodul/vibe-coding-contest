import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildManagerPrompt, type ManagerResult } from "@/lib/ai/euler-manager-prompt";
import { tryParseJson } from "@/lib/euler/json";

export const maxDuration = 30;

const HAIKU_MODEL_ID = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { problem } = (await req.json()) as { problem?: string };
    if (!problem || typeof problem !== "string") {
      return NextResponse.json({ error: "problem (string) required" }, { status: 400 });
    }

    const { system, user: userPrompt } = buildManagerPrompt(problem);
    const { text } = await generateText({
      model: anthropic(HAIKU_MODEL_ID),
      system,
      prompt: userPrompt,
      temperature: 0.1,
      maxTokens: 600,
    });

    const parsed = tryParseJson<ManagerResult>(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "Manager returned non-JSON", raw: text },
        { status: 502 }
      );
    }

    // sanity clamp
    parsed.difficulty = Math.max(1, Math.min(6, Math.round(parsed.difficulty)));
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("euler-manager error:", err);
    return NextResponse.json({ error: "Manager 호출 실패" }, { status: 500 });
  }
}
