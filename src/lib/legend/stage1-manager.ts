/**
 * Phase G-06 — Stage 1: Manager Haiku 난이도·영역 분류.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §4.2.
 * - 기존 src/lib/euler/critic-client.ts 의 Haiku 4.5 JSON 모드 패턴 차용
 *   (model: ANTHROPIC_HAIKU_MODEL_ID || claude-haiku-4-5-20251001, temp 0.1, JSON 출력).
 * - 한국 수능/모의고사 수학 난이도 1~6 분류 + confidence 0~1 + area enum.
 * - 보수적 분류: 모호하면 +1 (오버라우팅 > 언더라우팅, project-decisions G-06).
 * - JSON 파싱 실패 / API 오류 시 fallback {difficulty:4, confidence:0.5, area:'common'}.
 */
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { tryParseJson } from '@/lib/euler/json';
import type { ProblemArea } from './types';

const HAIKU_MODEL_ID =
  process.env.ANTHROPIC_HAIKU_MODEL_ID || 'claude-haiku-4-5-20251001';

const VALID_AREAS: ProblemArea[] = [
  'common',
  'calculus',
  'geometry',
  'probability',
  'algebra',
];

interface RawClassification {
  difficulty?: number;
  confidence?: number;
  area?: string;
}

const SYSTEM_PROMPT = `너는 한국 수능/모의고사 수학 문제의 난이도·영역 분류기다.

**난이도 1~6 척도** (1=최쉬움, 6=킬러):
- 1: 기초 계산
- 2: 단순 개념 적용
- 3: 표준 응용
- 4: 다개념 결합
- 5: 비표준 발상 필요
- 6: 킬러 (다단계 추론 + 비자명 trigger)

**영역 (area) 5종**:
- common: 공통 (수학Ⅰ·Ⅱ)
- calculus: 미적분
- geometry: 기하
- probability: 확률과통계
- algebra: 대수 일반

**보수적 분류 원칙**: 모호하면 +1 (오버라우팅이 언더라우팅보다 안전).
**confidence 0~1**: 자신감.

응답은 **JSON 단일 객체** 만:
{"difficulty": 1~6, "confidence": 0.0~1.0, "area": "common"|"calculus"|"geometry"|"probability"|"algebra"}

JSON 외 텍스트·해설·코드펜스 모두 금지.`;

function buildUserPrompt(problem: string, area_hint?: string): string {
  const hint = area_hint ? `\n\n사전 영역 힌트: ${area_hint}` : '';
  return `문제:\n${problem}${hint}\n\nJSON 분류:`;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function normalizeArea(raw: unknown): ProblemArea {
  if (typeof raw !== 'string') return 'common';
  const lower = raw.toLowerCase();
  return (VALID_AREAS as string[]).includes(lower)
    ? (lower as ProblemArea)
    : 'common';
}

function normalizeDifficulty(raw: unknown): 1 | 2 | 3 | 4 | 5 | 6 {
  const n = typeof raw === 'number' ? Math.round(raw) : 4;
  return clamp(n, 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
}

function normalizeConfidence(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : 0.5;
  return clamp(n, 0, 1);
}

const FALLBACK = {
  difficulty: 4 as const,
  confidence: 0.5,
  area: 'common' as const,
};

export async function classifyDifficulty(
  problem: string,
  area_hint?: string,
): Promise<{ difficulty: 1 | 2 | 3 | 4 | 5 | 6; confidence: number; area: ProblemArea }> {
  if (!problem?.trim()) return { ...FALLBACK };
  try {
    const { text } = await generateText({
      model: anthropic(HAIKU_MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(problem, area_hint),
      temperature: 0.1,
      maxTokens: 200,
    });
    const parsed = tryParseJson<RawClassification>(text);
    if (!parsed) {
      console.warn('[stage1-manager] JSON parse failed, using fallback');
      return { ...FALLBACK };
    }
    return {
      difficulty: normalizeDifficulty(parsed.difficulty),
      confidence: normalizeConfidence(parsed.confidence),
      area: normalizeArea(parsed.area),
    };
  } catch (e) {
    console.warn('[stage1-manager] generateText failed:', (e as Error).message);
    return { ...FALLBACK };
  }
}
