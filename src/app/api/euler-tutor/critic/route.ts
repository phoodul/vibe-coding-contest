import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildCriticPrompt,
  type BuildCriticPromptArgs,
  type CriticDiagnoseResult,
  type CriticVerifyResult,
} from "@/lib/ai/euler-critic-prompt";

export const maxDuration = 30;

const HAIKU_MODEL_ID = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";

function tryParseJson<T>(text: string): T | null {
  const trimmed = text.trim();
  // Haiku 가 ```json ... ``` 로 감싸는 케이스 방어
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

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

    const { system, user: userPrompt, mode } = buildCriticPrompt(body);

    const { text } = await generateText({
      model: anthropic(HAIKU_MODEL_ID),
      system,
      prompt: userPrompt,
      temperature: 0.1,
      maxTokens: 600,
    });

    if (mode === "verify") {
      const parsed = tryParseJson<CriticVerifyResult>(text);
      if (!parsed) {
        return NextResponse.json(
          { error: "Critic returned non-JSON", raw: text, mode },
          { status: 502 }
        );
      }
      return NextResponse.json({ mode, ...parsed });
    }

    const parsed = tryParseJson<CriticDiagnoseResult>(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "Critic returned non-JSON", raw: text, mode },
        { status: 502 }
      );
    }
    return NextResponse.json({ mode, ...parsed });
  } catch (err) {
    console.error("euler-critic error:", err);
    return NextResponse.json({ error: "Critic 호출 실패" }, { status: 500 });
  }
}
