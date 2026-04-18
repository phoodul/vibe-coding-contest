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

/** YouTube Data API로 교육 영상 검색 */
export async function POST(req: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY가 설정되지 않았습니다. .env에 추가해주세요." },
      { status: 500 }
    );
  }

  try {
    const { topic, grade } = await parseLessonPrepRequest(req);
    if (!topic) {
      return NextResponse.json({ error: "주제가 필요합니다" }, { status: 400 });
    }

    // 1. 검색 쿼리 — 단순화 (학년 hint는 관련성 떨어뜨림, 주제 + 한 단어)
    const query = `${topic} 설명`;

    // 2. search.list — 비디오 ID 추출 (100 쿼터)
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", "10");
    searchUrl.searchParams.set("regionCode", "KR");
    searchUrl.searchParams.set("relevanceLanguage", "ko");
    searchUrl.searchParams.set("safeSearch", "strict");
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("videoDuration", "medium"); // 4~20분

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      const err = await searchRes.text();
      return NextResponse.json(
        { error: `YouTube 검색 실패 (${searchRes.status}): ${err.slice(0, 200)}` },
        { status: 500 }
      );
    }
    const searchData = await searchRes.json();
    const items = searchData.items || [];
    if (items.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    // 3. videos.list — 조회수·길이 등 상세 정보 (1 쿼터)
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

    // 4. 정규화 + 조회수 높은 순 정렬 → 상위 3개
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
        };
      })
      .filter((v: YouTubeVideo) => v.id)
      .sort((a: YouTubeVideo, b: YouTubeVideo) => {
        const av = parseInt(detailsMap.get(a.id)?.statistics?.viewCount || "0");
        const bv = parseInt(detailsMap.get(b.id)?.statistics?.viewCount || "0");
        return bv - av;
      })
      .slice(0, 3);

    return NextResponse.json({ videos });
  } catch (e) {
    console.error("videos error:", e);
    return NextResponse.json({ error: `영상 검색 오류: ${e}` }, { status: 500 });
  }
}
