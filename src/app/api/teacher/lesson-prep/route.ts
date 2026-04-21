import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { parseLessonPrepRequest, buildUserContext } from "@/lib/lesson-prep/extract-text";

export const maxDuration = 300;

/**
 * 2단계 파이프라인으로 슬라이드 마크다운 생성
 *  Step A — Haiku: 25~28장의 개요(JSON) 생성 (~5초)
 *  Step B — Sonnet × 2 병렬: 개요를 앞/뒤 절반으로 나눠 상세 마크다운 작성 (~30초)
 *  Step C — 합쳐서 JSON 응답
 *
 *  이전 단일 스트림 방식이 60s 안에 25장 풀 디테일을 내놓지 못해 중간 잘림이 발생 → 분할로 해결.
 */

interface OutlineSlide {
  n: number;
  title: string;
  core: string;
  img: string;
}

async function generateOutline(ctx: string): Promise<OutlineSlide[]> {
  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    maxTokens: 3000,
    system: `당신은 한국의 교수설계 전문가입니다.
수업 주제를 받아 **정확히 25~28장**의 슬라이드 개요를 JSON 배열로 출력합니다.

## 출력 형식 (JSON 배열만, 다른 설명 절대 금지)
[
  {"n":1,"title":"표지 — 학습 목표","core":"오늘 배울 3가지","img":"classroom chalkboard"},
  {"n":2,"title":"...","core":"...","img":"..."},
  ...
]

## 필수 구성 (총 25~28장)
- n=1: 표지 (학습 목표 3개)
- n=2~3: 동기유발·배경·시대적 맥락
- n=4~18: 핵심 개념 4~5개를 각 3~4장씩 상세 분해
- n=19~20: 비교·대조 (표 형태 권장)
- n=21~22: 현대적 의의·적용 사례
- n=23: 형성평가 (퀴즈 3문제)
- n=24: 토론 주제
- n=25: 핵심 정리
- n=26~28: (선택) 심화·다음 차시 예고

## 규칙
- title·core는 **한국어**, 간결 (title 20자 이내, core 40자 이내)
- img는 **반드시 영문 3~5 단어 명사구** (Unsplash 검색용). 추상 개념은 상징 사물로.
- 슬라이드 간 논리적 흐름 (개념 → 예시 → 적용)`,
    prompt: ctx,
  });

  const match = text.match(/\[[\s\S]+\]/);
  if (!match) throw new Error("개요 JSON 파싱 실패");
  const parsed: OutlineSlide[] = JSON.parse(match[0]);
  if (!Array.isArray(parsed) || parsed.length < 15) {
    throw new Error(`개요 슬라이드가 너무 적습니다 (${parsed?.length ?? 0}장)`);
  }
  return parsed;
}

async function detailSlides(slides: OutlineSlide[], ctx: string, isFirstHalf: boolean): Promise<string> {
  const outlineStr = slides
    .map((s) => `[${s.n}] 제목: ${s.title} / 핵심: ${s.core} / img: ${s.img}`)
    .join("\n");

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    maxTokens: 8000,
    system: `당신은 한국의 베테랑 교사이자 교수설계 전문가입니다.
제공된 슬라이드 개요를 기반으로 **각 슬라이드를 상세 마크다운**으로 작성합니다.

## 출력 규칙
- 개요에 나열된 **모든 슬라이드를 순서대로 빠짐없이** 작성
- 슬라이드 구분자: 각 슬라이드 사이에 정확히 \`\\n---\\n\` 한 줄
- 첫 슬라이드 앞과 마지막 슬라이드 뒤에는 구분자 붙이지 말 것
- 각 슬라이드 본문 분량: **200~280자** (충분한 깊이 확보)

## 각 슬라이드 포맷
# {개요의 title}
{{IMG:{개요의 img 값 그대로}}}

> 💡 {개요의 core 문장을 자연스럽게 다듬어}

**[설명]** 2문단으로 상세히. 각 문단 3~4문장. 개념·원리·맥락을 논리적으로 연결.

**[핵심 포인트]**
- ✅ 포인트 1
- ✅ 포인트 2
- ✅ 포인트 3

**[예시]** 실제 사례·비유·데이터 1~2개 (2~3문장)

**[생각해보기]** 🤔 질문 1개

## 특수 슬라이드
- **표지**: 학습 목표 3개를 번호 리스트로. 이미지 토큰은 생략.
- **비교·대조**: markdown 표(\`|---|\`) 사용
- **형성평가**: 퀴즈 3문제 + 정답 표시 (**정답:** 형식)
- **핵심 정리**: 키워드 요약만, \`[설명]\`/\`[예시]\` 생략 가능
- **마지막(정리/다음차시)**: 이미지 토큰 생략

## 절대 금지
- 개요에 없는 슬라이드 추가
- 순서 변경
- 한국어 이미지 토큰 (반드시 개요의 영문 img 그대로 사용)`,
    prompt: `${ctx}

# 작성 지시
당신은 전체 커리큘럼의 **${isFirstHalf ? "앞부분" : "뒷부분"}**을 담당합니다.
앞/뒤 다른 작성자와 일관된 문체·난이도를 유지하세요. 중복되는 도입부/결론부 설명은 피하세요.

# 작성할 슬라이드 개요 (이 순서·내용대로 모두 작성)
${outlineStr}`,
  });

  return text.trim();
}

export async function POST(req: Request) {
  try {
    const { topic, grade, docContent } = await parseLessonPrepRequest(req);
    if (!topic && !docContent) {
      return new Response(JSON.stringify({ error: "주제 또는 파일이 필요합니다" }), { status: 400 });
    }

    const ctx = buildUserContext(topic, grade, docContent);

    // Step A: 개요 생성
    const outline = await generateOutline(ctx);

    // Step B: 절반 분할 → Sonnet × 2 병렬
    const mid = Math.ceil(outline.length / 2);
    const firstHalf = outline.slice(0, mid);
    const secondHalf = outline.slice(mid);

    const [detail1, detail2] = await Promise.all([
      detailSlides(firstHalf, ctx, true),
      detailSlides(secondHalf, ctx, false),
    ]);

    // Step C: 합치기 (두 결과 사이에도 슬라이드 구분자 삽입)
    const content = `${detail1}\n\n---\n\n${detail2}`;

    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lesson-prep slides error:", e);
    return new Response(
      JSON.stringify({ error: `생성 오류: ${(e as Error).message || e}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
