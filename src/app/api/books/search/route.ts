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
  const searchType = searchParams.get("searchType") || "title"; // "title" | "author"

  if (!kwd && !isbn) {
    return NextResponse.json(
      { error: "검색 키워드(kwd) 또는 ISBN을 입력하세요." },
      { status: 400 }
    );
  }

  try {
    async function searchNL(target: string, keyword: string): Promise<NLBookResult[]> {
      const params = new URLSearchParams({
        key: apiKey!,
        apiType: "json",
        srchTarget: target,
        pageNum: "1",
        pageSize: "30",
        kwd: keyword,
      });
      const res = await fetch(`${NL_API_URL}?${params.toString()}`, {
        headers: { "Accept-Charset": "UTF-8" },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.result || [])
        .map((item: Record<string, string>) => ({
          isbn: item.isbn || "",
          title: stripHtml(item.titleInfo || ""),
          author: stripHtml(item.authorInfo || ""),
          publisher: stripHtml(item.pubInfo || ""),
          year: item.pubYearInfo || "",
          classNo: item.classNo || "",
          className: stripHtml(item.kdcName1s || ""),
          detailLink: item.detailLink ? `https://www.nl.go.kr${item.detailLink}` : "",
          imageUrl: item.imageUrl || "",
          type: stripHtml(item.typeName || ""),
        }))
        .filter((b: NLBookResult) => b.type === "도서");
    }

    let books: NLBookResult[];

    if (isbn) {
      const params = new URLSearchParams({ key: apiKey, apiType: "json", isbn });
      const res = await fetch(`${NL_API_URL}?${params.toString()}`);
      const data = res.ok ? await res.json() : { result: [] };
      books = (data.result || []).map((item: Record<string, string>) => ({
        isbn: item.isbn || "", title: stripHtml(item.titleInfo || ""),
        author: stripHtml(item.authorInfo || ""), publisher: stripHtml(item.pubInfo || ""),
        year: item.pubYearInfo || "", classNo: item.classNo || "",
        className: stripHtml(item.kdcName1s || ""),
        detailLink: item.detailLink ? `https://www.nl.go.kr${item.detailLink}` : "",
        imageUrl: item.imageUrl || "", type: stripHtml(item.typeName || ""),
      }));
    } else {
      // 사용자가 선택한 검색 타입으로 검색
      books = await searchNL(searchType === "author" ? "author" : "title", kwd);
    }

    return NextResponse.json({
      total: books.length,
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
