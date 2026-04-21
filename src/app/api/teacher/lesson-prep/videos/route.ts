import { NextResponse } from "next/server";
import { parseLessonPrepRequest } from "@/lib/lesson-prep/extract-text";

export const maxDuration = 30;

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  url: string;
  thumbnail: string;
  duration?: string;
  viewCount?: string;
}

/** ISO 8601 duration(PT1M30S) → "1:30" */
function formatDuration(iso?: string): string {
  if (!iso) return "";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const [, h, m, s] = match;
  const hh = h ? `${h}:` : "";
  const mm = h ? (m || "0").padStart(2, "0") : m || "0";
  const ss = (s || "0").padStart(2, "0");
  return `${hh}${mm}:${ss}`;
}

function formatViews(count?: string): string {
  if (!count) return "";
  const n = parseInt(count);
  if (n >= 10000) return `조회수 ${(n / 10000).toFixed(1)}만회`;
  if (n >= 1000) return `조회수 ${(n / 1000).toFixed(1)}천회`;
  return `조회수 ${n}회`;
}

/** search.list 호출 — 필터 단계별 완화하며 재시도 */
async function searchVideos(apiKey: string, query: string) {
  // 1차: 한국어 + 한국 지역 + embeddable (학교에서 바로 재생 가능한 것 우선)
  // 2차: 한국어 + embeddable (지역 필터 제거)
  // 3차: 한국어만 (모든 필터 최소화)
  const attempts: Array<Record<string, string>> = [
    { regionCode: "KR", relevanceLanguage: "ko", videoEmbeddable: "true" },
    { relevanceLanguage: "ko", videoEmbeddable: "true" },
    { relevanceLanguage: "ko" },
  ];

  for (const extraParams of attempts) {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "15");
    url.searchParams.set("safeSearch", "strict");
    for (const [k, v] of Object.entries(extraParams)) url.searchParams.set(k, v);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const errText = await res.text();
      // 쿼터 초과·키 오류는 즉시 반환
      if (res.status === 403) throw new Error(`YouTube API 403: ${errText.slice(0, 200)}`);
      continue;
    }
    const data = await res.json();
    const items = data.items || [];
    if (items.length > 0) return items;
  }
  return [];
}

/** YouTube Data API로 교육 영상 검색 */
export async function POST(req: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY가 설정되지 않았습니다. Vercel 환경변수에 추가해주세요." },
      { status: 500 }
    );
  }

  try {
    const { topic } = await parseLessonPrepRequest(req);
    if (!topic) {
      return NextResponse.json({ error: "주제가 필요합니다" }, { status: 400 });
    }

    const query = `${topic} 설명`;
    const items = await searchVideos(apiKey, query);
    if (items.length === 0) {
      return NextResponse.json({ videos: [], notice: "관련 영상을 찾지 못했습니다." });
    }

    // videos.list — 조회수·길이 등 상세 정보
    const videoIds = items.map((it: any) => it.id.videoId).filter(Boolean).join(",");
    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("key", apiKey);
    videosUrl.searchParams.set("id", videoIds);
    videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");

    const videosRes = await fetch(videosUrl.toString());
    const videosData = videosRes.ok ? await videosRes.json() : { items: [] };
    const detailsMap = new Map<string, any>();
    for (const v of videosData.items || []) {
      detailsMap.set(v.id, v);
    }

    // 정규화 + 1분 미만 Shorts 제거 + 조회수 높은 순 → 상위 3개
    const videos: YouTubeVideo[] = items
      .map((it: any) => {
        const id = it.id.videoId;
        const detail = detailsMap.get(id);
        return {
          id,
          title: it.snippet.title,
          channel: it.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${id}`,
          thumbnail:
            it.snippet.thumbnails?.high?.url ||
            it.snippet.thumbnails?.medium?.url ||
            it.snippet.thumbnails?.default?.url ||
            "",
          duration: formatDuration(detail?.contentDetails?.duration),
          viewCount: formatViews(detail?.statistics?.viewCount),
          _rawDuration: detail?.contentDetails?.duration || "",
          _rawViews: parseInt(detail?.statistics?.viewCount || "0"),
        };
      })
      .filter((v: any) => v.id)
      // Shorts(60초 미만) 제외 — 교육 영상 품질 보장
      .filter((v: any) => {
        const m = v._rawDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!m) return true;
        const totalSec = (parseInt(m[1] || "0") * 3600) + (parseInt(m[2] || "0") * 60) + parseInt(m[3] || "0");
        return totalSec >= 60;
      })
      .sort((a: any, b: any) => b._rawViews - a._rawViews)
      .slice(0, 3)
      .map(({ _rawDuration, _rawViews, ...rest }: any) => rest);

    return NextResponse.json({ videos });
  } catch (e) {
    console.error("videos error:", e);
    return NextResponse.json(
      { error: `영상 검색 오류: ${(e as Error).message || e}` },
      { status: 500 }
    );
  }
}
