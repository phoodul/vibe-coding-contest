import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import {
  buildCriticPrompt,
  type BuildCriticPromptArgs,
  type CriticDiagnoseResult,
  type CriticVerifyResult,
} from "@/lib/ai/euler-critic-prompt";

const HAIKU_MODEL_ID = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";

export type CriticResult =
  | ({ mode: "verify" } & CriticVerifyResult)
  | ({ mode: "diagnose" } & CriticDiagnoseResult);

function tryParseJson<T>(text: string): T | null {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

/**
 * Critic Agent 직접 호출 (서버 내부에서 fetch 우회).
 * 실패 시 null 반환 — 호출자는 폴백 동작 결정.
 */
export async function runCritic(args: BuildCriticPromptArgs): Promise<CriticResult | null> {
  try {
    const { system, user, mode } = buildCriticPrompt(args);
    const { text } = await generateText({
      model: anthropic(HAIKU_MODEL_ID),
      system,
      prompt: user,
      temperature: 0.1,
      maxTokens: 600,
    });

    if (mode === "verify") {
      const parsed = tryParseJson<CriticVerifyResult>(text);
      if (!parsed) return null;
      return { mode, ...parsed };
    }

    const parsed = tryParseJson<CriticDiagnoseResult>(text);
    if (!parsed) return null;
    return { mode, ...parsed };
  } catch (err) {
    console.error("runCritic error:", err);
    return null;
  }
}
