import { NextRequest, NextResponse } from "next/server";

/**
 * 국립중앙도서관 Open API를 통한 도서 검색
 * GET /api/books/search?kwd=키워드&pageNum=1&pageSize=10
 */

const NL_API_URL = "https://www.nl.go.kr/NL/search/openApi/search.do";

export interface NLBookResult {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  classNo: string;
  className: string;
  detailLink: string;
  imageUrl: string;
  type: string;
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.Open_API_Key;
  if (!apiKey) {
    return NextResponse.json(
      { error: "국립중앙도서관 API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const kwd = searchParams.get("kwd") || "";
  const pageNum = searchParams.get("pageNum") || "1";
  const pageSize = searchParams.get("pageSize") || "10";
  const isbn = searchParams.get("isbn") || "";

  if (!kwd && !isbn) {
    return NextResponse.json(
      { error: "검색 키워드(kwd) 또는 ISBN을 입력하세요." },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      apiType: "json",
      srchTarget: "total",
      pageNum,
      pageSize: String(Math.max(Number(pageSize), 30)), // 도서 필터링을 위해 넉넉히 요청
    });

    if (isbn) {
      params.set("isbn", isbn);
    } else {
      params.set("kwd", kwd);
    }

    const res = await fetch(`${NL_API_URL}?${params.toString()}`, {
      headers: { "Accept-Charset": "UTF-8" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `국립중앙도서관 API 오류: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    const allResults = (data.result || []).map(
      (item: Record<string, string>) => ({
        isbn: item.isbn || "",
        title: stripHtml(item.titleInfo || ""),
        author: stripHtml(item.authorInfo || ""),
        publisher: stripHtml(item.pubInfo || ""),
        year: item.pubYearInfo || "",
        classNo: item.classNo || "",
        className: stripHtml(item.kdcName1s || ""),
        detailLink: item.detailLink
          ? `https://www.nl.go.kr${item.detailLink}`
          : "",
        imageUrl: item.imageUrl || "",
        type: stripHtml(item.typeName || ""),
      })
    );

    // 도서 타입만 우선, 나머지는 뒤로
    const books: NLBookResult[] = [
      ...allResults.filter((b: NLBookResult) => b.type === "도서"),
      ...allResults.filter((b: NLBookResult) => b.type !== "도서"),
    ];

    return NextResponse.json({
      total: data.total || 0,
      pageNum: Number(pageNum),
      pageSize: Number(pageSize),
      books,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 }
    );
  }
}
