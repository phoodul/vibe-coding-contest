/**
 * 난이도 분류기 (Haiku 4.5).
 * 입력: 문제 텍스트
 * 출력: { difficulty: 1~6, area: string, confidence: 0..1 }
 *
 * 사용 위치:
 *   - orchestrator (Phase B-12) 가 분기 결정 (1~3 단발 / 4~5 Retriever / 6+ Reasoner)
 */

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const HAIKU_MODEL_ID = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";

export interface DifficultyResult {
  difficulty: number; // 1..6
  area: string; // 'algebra' | 'calculus' | 'geometry' | 'sequence' | 'probability' | 'free'
  confidence: number;
  rationale?: string;
}

const SYSTEM = `당신은 한국 고등학교 수학 문제의 난이도와 영역을 빠르게 분류합니다.

## 난이도 척도 (1~6)
- 1: 직관적 단순 (수능 1~5번 수준, 한 번에 풀림)
- 2: 기본 공식 직접 적용 (6~10번)
- 3: 두 단계 결합 (11~17번 약식)
- 4: 영역 결합 + 사고 분기 (20~25번)
- 5: 복합 case 분기 (26~28번)
- 6: 킬러 (29~30번, BFS·역추적·다중 도구)

## 영역 enum
- "algebra" / "calculus" / "geometry" / "sequence" / "probability" / "free"

## 출력 (JSON only, 다른 텍스트 금지)
{
  "difficulty": 1..6,
  "area": "<enum>",
  "confidence": 0.0..1.0,
  "rationale"?: "한 줄 이유"
}`;

function tryParseJson<T>(text: string): T | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

export async function classifyDifficulty(problemText: string): Promise<DifficultyResult | null> {
  try {
    const { text } = await generateText({
      model: anthropic(HAIKU_MODEL_ID),
      system: SYSTEM,
      prompt: `문제:\n${problemText}\n\nJSON 만 출력.`,
      temperature: 0.1,
      maxTokens: 200,
    });
    const parsed = tryParseJson<DifficultyResult>(text);
    if (!parsed) return null;
    // sanity clamp
    parsed.difficulty = Math.max(1, Math.min(6, Math.round(parsed.difficulty)));
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
    return parsed;
  } catch (err) {
    console.error("classifyDifficulty error:", err);
    return null;
  }
}
