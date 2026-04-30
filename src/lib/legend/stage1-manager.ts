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

**난이도 1~6 척도 — 한국 수능 기준 정밀 매핑**:
- 1: 6번 단순 계산 (기본 공식 1회 적용, 정의 직접 대입). 예) "f(x)=x²+1 일 때 f(2)?"
- 2: 9번 중위 (개념 1회 + 단순 변환). 예) "log₂8 + log₂4 의 값?", 등비수열 일반항 구하기
- 3: 12번 표준 응용 (그래프 해석 / 2단계 계산 / 다개념 1회 결합). 예) 미분계수와 접선·표준편차 1회 응용
- 4: 14번 고난도 (다개념 결합 + 케이스 분석 + 보조 도구 1~2회). 예) 함수 합성·적분 영역 분할·확률 조건부
- 5: 21·28번 킬러 (비표준 발상 + 다단계 backward + 새 보조함수 정의). 예) 함수 g(x) 정의·역함수 미분·기하 좌표화
- 6: 29·30번 슈퍼킬러 (다단계 추론 + 비자명 trigger + 케이스 5+ + 정수 조건). 예) 격자점 셈·함수족 분류·미적분 종합

**영역 (area) 5종**:
- common: 공통 (수학Ⅰ·Ⅱ — 함수·수열·삼각함수·지수로그·미분 기초)
- calculus: 미적분 (선택과목 — 합성·역·치환·부분적분·정적분의 활용)
- geometry: 기하 (선택과목 — 벡터·이차곡선·공간도형)
- probability: 확률과통계 (선택과목 — 순열조합·확률·통계·이항분포·정규분포)
- algebra: 대수 일반 (방정식·부등식·복소수 — 위 4종 어디에도 안 맞을 때)

**Few-shot 예시** (난이도 정답 + 영역 정답):
1) "이차함수 f(x)=x²-4x+3 의 최솟값을 구하시오" → {"difficulty":1,"confidence":0.95,"area":"common"}
2) "수열 aₙ=2n+1 의 첫째항부터 제 10항까지의 합?" → {"difficulty":2,"confidence":0.9,"area":"common"}
3) "함수 f(x)=x³-3x 의 극댓값과 극솟값의 차?" → {"difficulty":3,"confidence":0.85,"area":"common"}
4) "∫₀¹ x·eˣ dx 의 값?" → {"difficulty":3,"confidence":0.85,"area":"calculus"}
5) "함수 f(x)=x³+ax+b 가 x=1 에서 극값 0 을 가질 때 a+b?" → {"difficulty":4,"confidence":0.85,"area":"calculus"}
6) "확률변수 X 가 정규분포 N(50,10²) 따를 때 P(40≤X≤60) 을 표준정규 표로 구하시오" → {"difficulty":4,"confidence":0.9,"area":"probability"}
7) "미분가능한 f 가 (가)(나)(다) 조건 모두 만족시키는 함수의 개수" → {"difficulty":5,"confidence":0.85,"area":"calculus"}
8) "벡터 a,b,c 에 대해 |a|=2, |b|=3, a·b=4 일 때 |a+2b-c| 의 최솟값" → {"difficulty":5,"confidence":0.85,"area":"geometry"}
9) "함수 f(x)=∫₀ˣ |t-a| dt 의 그래프 개형 분류 + 정수 a 의 개수" → {"difficulty":6,"confidence":0.9,"area":"calculus"}
10) "주머니 6개 공·뽑기·조건부 + 함수 g 정의 + 5케이스 분석" → {"difficulty":6,"confidence":0.9,"area":"probability"}

**보수적 분류 원칙 (매우 중요)**:
- 모호하면 +1 (오버라우팅이 언더라우팅보다 안전).
- "(가)(나)(다)" 조건이 2개 이상이면 최소 4 부터 시작.
- 함수 정의 + 그래프 해석 + 합성/역함수 결합 시 5 부터 고려.
- "정수 ~의 개수" / "조건을 모두 만족시키는 ~의 개수" 형태는 5~6.
- 응답 길이가 200자 이상 (조건이 많으면) 자동 +1.
- 단순 계산처럼 보여도 (가)(나) 조건 + 미지수 2개 이상이면 4 이상.

**confidence 0~1**: 자신감 (분류에 자신 있을수록 1.0 에 가깝게).

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
