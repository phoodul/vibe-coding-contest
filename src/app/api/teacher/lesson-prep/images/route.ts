import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const maxDuration = 30;

interface UnsplashImage {
  query: string; // 원본 쿼리 (클라이언트 매칭용)
  url: string;
  alt: string;
  credit: string;
  creditUrl: string;
}

/** 한글 포함 여부 */
function hasKorean(s: string): boolean {
  return /[가-힣]/.test(s);
}

/** Haiku로 한국어 제목 배열을 영문 Unsplash 검색 키워드 배열로 배치 변환 */
async function translateToUnsplashKeywords(
  koreanTitles: string[],
  topic?: string
): Promise<Map<string, string>> {
  if (koreanTitles.length === 0) return new Map();

  try {
    const prompt = `다음은 한국어 수업 슬라이드 제목들입니다${topic ? ` (주제: ${topic})` : ""}.
각 제목을 Unsplash에서 관련 이미지를 찾기 좋은 **영문 키워드 3~5단어**로 변환하세요.
구체적이고 시각적인 명사구로 작성. 추상 개념은 상징 사물로.

반드시 JSON 배열 형식만 출력 (다른 말 일절 금지):
["english keywords 1", "english keywords 2", ...]

입력 제목:
${koreanTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      maxTokens: 1000,
      prompt,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return new Map();
    const keywords: string[] = JSON.parse(jsonMatch[0]);

    const map = new Map<string, string>();
    koreanTitles.forEach((korean, i) => {
      if (keywords[i]) map.set(korean, keywords[i]);
    });
    return map;
  } catch (e) {
    console.warn("title translation failed:", e);
    return new Map();
  }
}

/** Unsplash 단일 검색 */
async function searchUnsplash(
  keyword: string,
  originalQuery: string,
  accessKey: string
): Promise<UnsplashImage> {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", keyword);
  url.searchParams.set("per_page", "3");
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!res.ok) {
      return { query: originalQuery, url: "", alt: originalQuery, credit: "", creditUrl: "" };
    }
    const data = await res.json();
    const first = data.results?.[0];
    if (!first) {
      return { query: originalQuery, url: "", alt: originalQuery, credit: "", creditUrl: "" };
    }
    return {
      query: originalQuery,
      url: first.urls?.regular || first.urls?.small || "",
      alt: first.alt_description || keyword,
      credit: first.user?.name || "",
      creditUrl: first.user?.links?.html || "",
    };
  } catch {
    return { query: originalQuery, url: "", alt: originalQuery, credit: "", creditUrl: "" };
  }
}

/**
 * 클라이언트가 보내온 검색어 배열을 Unsplash로 조회
 * 한글 쿼리는 Haiku로 영문 키워드 변환 후 검색
 * POST { queries: string[], topic?: string } → { images: UnsplashImage[] }
 */
export async function POST(req: Request) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "UNSPLASH_ACCESS_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const { queries, topic } = (await req.json()) as {
      queries: string[];
      topic?: string;
    };
    if (!Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json({ images: [] });
    }

    const capped = queries.slice(0, 40);
    const koreanQueries = capped.filter(hasKorean);
    const translateMap = await translateToUnsplashKeywords(koreanQueries, topic);

    const results = await Promise.all(
      capped.map((query) => {
        const keyword = hasKorean(query) ? translateMap.get(query) || query : query;
        return searchUnsplash(keyword, query, key);
      })
    );

    return NextResponse.json({ images: results });
  } catch (e) {
    return NextResponse.json({ error: `이미지 검색 오류: ${e}` }, { status: 500 });
  }
}
