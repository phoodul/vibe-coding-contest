import { NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * 수학 문제 이미지 → LaTeX 텍스트 변환
 * 우선순위: Mathpix (수학 전용) → Upstage (범용) → Vision fallback
 */
export async function POST(req: Request) {
  try {
    const { image, handwritten } = (await req.json()) as {
      image?: string;
      handwritten?: boolean;
    };

    const base64Match = image?.match(/^data:(.+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ text: null, fallback: true });
    }

    const base64Data = base64Match[2];

    // 1순위: Mathpix (수학 수식 OCR 최고 성능)
    const MATHPIX_APP_ID = process.env.MATHPIX_APP_ID;
    const MATHPIX_APP_KEY = process.env.MATHPIX_API_KEY;

    if (MATHPIX_APP_ID && MATHPIX_APP_KEY) {
      try {
        // 손글씨 모드: text+data 포맷, math+text OCR, 공백 보존
        const mathpixBody: Record<string, unknown> = handwritten
          ? {
              src: image,
              formats: ["text", "data"],
              ocr: ["math", "text"],
              math_inline_delimiters: ["$", "$"],
              math_display_delimiters: ["$$", "$$"],
              rm_spaces: false,
            }
          : {
              src: image,
              math_inline_delimiters: ["$", "$"],
              math_display_delimiters: ["$$", "$$"],
              rm_spaces: true,
            };

        const resp = await fetch("https://api.mathpix.com/v3/text", {
          method: "POST",
          headers: {
            "app_id": MATHPIX_APP_ID,
            "app_key": MATHPIX_APP_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mathpixBody),
        });

        if (resp.ok) {
          const data = await resp.json();
          const text = data.text || data.latex_styled || "";
          if (text.trim()) {
            return NextResponse.json({ text, fallback: false, parser: "mathpix" });
          }
        }
      } catch {}
    }

    // 2순위: Upstage Document Parse
    const UPSTAGE_API_KEY = process.env.UPSTAGE_API_KEY;
    if (UPSTAGE_API_KEY) {
      try {
        const mimeType = base64Match[1];
        const buffer = Buffer.from(base64Data, "base64");
        const uint8 = new Uint8Array(buffer);
        const blob = new Blob([uint8], { type: mimeType });
        const formData = new FormData();
        formData.append("document", blob, "math-problem.png");
        formData.append("output_formats", '["text"]');
        formData.append("model", "document-parse");
        formData.append("ocr", "auto");

        const resp = await fetch("https://api.upstage.ai/v1/document-digitization", {
          method: "POST",
          headers: { Authorization: `Bearer ${UPSTAGE_API_KEY}` },
          body: formData,
        });

        if (resp.ok) {
          const data = await resp.json();
          const text = data.content?.text || data.text || "";
          if (text.trim()) {
            return NextResponse.json({ text, fallback: false, parser: "upstage" });
          }
        }
      } catch {}
    }

    // 3순위: Vision fallback
    return NextResponse.json({ text: null, fallback: true });
  } catch {
    return NextResponse.json({ text: null, fallback: true });
  }
}
