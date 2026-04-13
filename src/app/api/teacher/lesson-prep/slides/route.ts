import { NextResponse } from "next/server";

export const maxDuration = 60;

const API_BASE = "https://2slides.com";

/**
 * 2Slides API로 PowerPoint 슬라이드 생성
 * POST: { content: string } → { jobId, downloadUrl? }
 * GET: ?jobId=xxx → { status, downloadUrl? }
 */
export async function POST(req: Request) {
  const apiKey = process.env.TWOSLIDES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "2Slides API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "슬라이드 내용이 필요합니다." }, { status: 400 });
    }

    // 1. 테마 검색 (교육용)
    let themeId = "";
    try {
      const themeRes = await fetch(`${API_BASE}/api/v1/themes?query=education`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (themeRes.ok) {
        const themeData = await themeRes.json();
        const themes = themeData.themes || themeData.data || [];
        if (themes.length > 0) {
          themeId = themes[0].id;
        }
      }
    } catch {
      // 테마 검색 실패 시 기본값 사용
    }

    // 테마 없으면 corporate으로 재검색
    if (!themeId) {
      try {
        const themeRes = await fetch(`${API_BASE}/api/v1/themes?query=corporate`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (themeRes.ok) {
          const themeData = await themeRes.json();
          const themes = themeData.themes || themeData.data || [];
          if (themes.length > 0) themeId = themes[0].id;
        }
      } catch {}
    }

    if (!themeId) {
      return NextResponse.json({ error: "슬라이드 테마를 찾을 수 없습니다." }, { status: 500 });
    }

    // 2. 슬라이드 생성 (async)
    const genRes = await fetch(`${API_BASE}/api/v1/slides/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userInput: content,
        themeId,
        responseLanguage: "Korean",
        mode: "async",
      }),
    });

    if (!genRes.ok) {
      const err = await genRes.text();
      return NextResponse.json({ error: `슬라이드 생성 실패: ${err}` }, { status: 500 });
    }

    const genData = await genRes.json();
    const jobId = genData.data?.jobId || genData.jobId;

    if (!jobId) {
      return NextResponse.json({ error: "작업 ID를 받지 못했습니다." }, { status: 500 });
    }

    return NextResponse.json({ jobId });
  } catch (e) {
    return NextResponse.json({ error: `오류: ${e}` }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const apiKey = process.env.TWOSLIDES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API 키 없음" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId 필요" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "상태 조회 실패" }, { status: 500 });
    }

    const data = await res.json();
    const job = data.data || data;

    return NextResponse.json({
      status: job.status,
      downloadUrl: job.downloadUrl || null,
      slidePageCount: job.slidePageCount || null,
    });
  } catch (e) {
    return NextResponse.json({ error: `오류: ${e}` }, { status: 500 });
  }
}
