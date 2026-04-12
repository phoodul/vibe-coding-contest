import { NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * 수학 문제 이미지 → Upstage Document Parse → LaTeX 텍스트 변환
 * 오일러 튜터가 text-only로 정확한 수학 코칭을 하기 위한 전처리
 */
export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // base64 data URL

    const UPSTAGE_API_KEY = process.env.UPSTAGE_API_KEY;
    if (!UPSTAGE_API_KEY) {
      // Upstage 키가 없으면 원본 이미지 텍스트를 그대로 반환 (fallback)
      return NextResponse.json({ text: null, fallback: true });
    }

    // base64 data URL에서 실제 데이터 추출
    const base64Match = image.match(/^data:(.+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ text: null, fallback: true });
    }

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];

    // Upstage Document Parse API 호출
    const formData = new FormData();
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: mimeType });
    formData.append("document", blob, "math-problem.png");
    formData.append("output_formats", "[\"text\", \"html\"]");
    formData.append("model", "document-parse");
    formData.append("ocr", "force");

    const response = await fetch("https://api.upstage.ai/v1/document-digitization", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTAGE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Upstage API error:", err);
      return NextResponse.json({ text: null, fallback: true });
    }

    const data = await response.json();

    // 파싱된 텍스트 추출
    const parsedText = data.content?.text || data.text || "";

    if (!parsedText.trim()) {
      return NextResponse.json({ text: null, fallback: true });
    }

    return NextResponse.json({ text: parsedText, fallback: false });
  } catch (error) {
    console.error("Parse image error:", error);
    return NextResponse.json({ text: null, fallback: true });
  }
}
