/**
 * 웹 검색 유틸리티 — Tavily API 기반 RAG 검색
 * 소크라테스 튜터가 최신 정보를 실시간으로 검색할 때 사용
 */

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export interface SearchResponse {
  answer?: string;
  results: SearchResult[];
}

/**
 * Tavily API로 웹 검색 수행
 * 환경변수: TAVILY_API_KEY (free tier: 1000 searches/month)
 */
export async function searchWeb(query: string): Promise<SearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    // Tavily 키 없으면 빈 결과 반환 (graceful degradation)
    return { results: [] };
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 5,
        include_answer: true,
        search_depth: "basic",
      }),
    });

    if (!res.ok) return { results: [] };

    const data = await res.json();

    return {
      answer: data.answer || undefined,
      results: (data.results || []).map((r: Record<string, string>) => ({
        title: r.title || "",
        url: r.url || "",
        content: r.content || "",
      })),
    };
  } catch {
    return { results: [] };
  }
}

/** 검색 결과를 LLM이 읽기 좋은 텍스트로 변환 */
export function formatSearchResults(response: SearchResponse): string {
  if (response.results.length === 0) {
    return "검색 결과가 없습니다.";
  }

  let text = "";

  if (response.answer) {
    text += `요약: ${response.answer}\n\n`;
  }

  text += "검색 결과:\n";
  for (const r of response.results) {
    text += `- [${r.title}](${r.url})\n  ${r.content.slice(0, 300)}\n\n`;
  }

  return text;
}
