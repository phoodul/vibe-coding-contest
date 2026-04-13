import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  // URL 모드
  if (contentType.includes("application/json")) {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL이 필요합니다" }, { status: 400 });
    }
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; EasyEduBot/1.0)" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      // HTML → 텍스트 추출 (태그 제거, 스크립트/스타일 제거)
      const cleaned = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "");

      // 섹션 분리: h1~h3 태그 또는 구분선 기준
      const sections: { title: string; content: string }[] = [];
      const sectionRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
      const headings: { title: string; index: number }[] = [];
      let match;
      while ((match = sectionRegex.exec(cleaned)) !== null) {
        const title = match[1].replace(/<[^>]+>/g, "").trim();
        if (title.length > 0 && title.length < 200) {
          headings.push({ title, index: match.index });
        }
      }

      if (headings.length >= 3) {
        for (let i = 0; i < headings.length; i++) {
          const start = headings[i].index;
          const end = i + 1 < headings.length ? headings[i + 1].index : cleaned.length;
          const chunk = cleaned.slice(start, end)
            .replace(/<[^>]+>/g, " ")
            .replace(/&[a-z]+;/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (chunk.length > 50) {
            sections.push({ title: headings[i].title, content: chunk.slice(0, 5000) });
          }
        }
      }

      const fullText = cleaned
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 50000);

      return NextResponse.json({
        text: fullText,
        sections: sections.length >= 3 ? sections : [],
        source: url,
      });
    } catch (e) {
      return NextResponse.json({ error: `URL을 가져올 수 없습니다: ${e}` }, { status: 400 });
    }
  }

  // 파일 업로드 모드 (multipart/form-data)
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "파일이 필요합니다" }, { status: 400 });
    }

    const name = file.name.toLowerCase();

    // MD / TXT
    if (name.endsWith(".md") || name.endsWith(".txt")) {
      const text = await file.text();
      return NextResponse.json({ text: text.slice(0, 30000), source: file.name });
    }

    // PDF
    if (name.endsWith(".pdf")) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mod = await import("pdf-parse") as any;
        const PDFParse = mod.PDFParse;
        const parser = new PDFParse(buffer);
        await parser.load();
        const text = await parser.getText();
        return NextResponse.json({ text: (text as string).slice(0, 30000), source: file.name });
      } catch (e) {
        return NextResponse.json({ error: `PDF 파싱 실패: ${e}` }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "지원하지 않는 파일 형식입니다 (PDF, MD, TXT만 가능)" }, { status: 400 });
  }

  return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
}
