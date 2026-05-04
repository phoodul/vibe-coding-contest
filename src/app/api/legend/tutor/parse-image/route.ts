import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const SONNET_MODEL = "claude-sonnet-4-5-20250929";

/**
 * 수학 문제 이미지 → LaTeX 텍스트 변환.
 *
 * 분기:
 *   - handwritten=true (필기): Claude Sonnet 4.6 Vision (한글 + 수식 + 손글씨 강)
 *     · 실패 시 Mathpix → Upstage 폴백 (보험)
 *   - handwritten=false (사진/스크린샷): Mathpix → Upstage → null fallback
 *     (인쇄체에선 Mathpix 가 가장 빠르고 정확)
 *
 * 비싼 외부 API 호출 — 인증 가드 필수 (봇 어뷰징 방지).
 */

interface AnthropicTextBlock {
  type: "text";
  text: string;
}

async function callClaudeVision(
  base64Data: string,
  mimeType: string
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  // Anthropic 이 허용하는 image media_type 만
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const mediaType = allowed.includes(mimeType) ? mimeType : "image/png";

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SONNET_MODEL,
        max_tokens: 1500,
        system: `당신은 손글씨 수학 노트를 정확히 텍스트로 변환하는 OCR 엔진입니다.

규칙:
- 한글은 한글 그대로, 영어는 영어 그대로 보존
- 수식은 LaTeX 표기 (인라인 $...$, 디스플레이 $$...$$)
- 줄바꿈도 보존
- 추가 설명·해석·풀이 금지 — **있는 그대로의 텍스트** 만 반환
- 인식 불가능한 부분은 [?] 로 표시`,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: "이 손글씨 이미지의 내용을 위 규칙에 따라 텍스트로 변환해주세요.",
              },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      console.warn("[parse-image] claude vision", resp.status);
      return null;
    }

    const data = (await resp.json()) as { content: AnthropicTextBlock[] };
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text || null;
  } catch (e) {
    console.warn("[parse-image] claude vision error", e);
    return null;
  }
}

async function callMathpix(image: string, handwritten: boolean): Promise<string | null> {
  const MATHPIX_APP_ID = process.env.MATHPIX_APP_ID;
  const MATHPIX_APP_KEY = process.env.MATHPIX_API_KEY;
  if (!MATHPIX_APP_ID || !MATHPIX_APP_KEY) return null;

  try {
    const body: Record<string, unknown> = handwritten
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
        app_id: MATHPIX_APP_ID,
        app_key: MATHPIX_APP_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = (data.text || data.latex_styled || "").trim();
    return text || null;
  } catch {
    return null;
  }
}

async function callUpstage(base64Data: string, mimeType: string): Promise<string | null> {
  const UPSTAGE_API_KEY = process.env.UPSTAGE_API_KEY;
  if (!UPSTAGE_API_KEY) return null;
  try {
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
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = (data.content?.text || data.text || "").trim();
    return text || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image, handwritten } = (await req.json()) as {
      image?: string;
      handwritten?: boolean;
    };

    const base64Match = image?.match(/^data:(.+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ text: null, fallback: true });
    }

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];

    // 손글씨 → Claude Sonnet 4.6 Vision (한글 + 수식 강)
    if (handwritten === true) {
      const visionText = await callClaudeVision(base64Data, mimeType);
      if (visionText) {
        return NextResponse.json({ text: visionText, fallback: false, parser: "claude-vision" });
      }
      // Vision 실패 시 Mathpix → Upstage 폴백 (보험)
      const mathpixText = await callMathpix(image!, true);
      if (mathpixText) {
        return NextResponse.json({ text: mathpixText, fallback: false, parser: "mathpix-fallback" });
      }
      const upstageText = await callUpstage(base64Data, mimeType);
      if (upstageText) {
        return NextResponse.json({ text: upstageText, fallback: false, parser: "upstage-fallback" });
      }
      return NextResponse.json({ text: null, fallback: true });
    }

    // 사진 / 스크린샷 → Mathpix → Upstage → null fallback (Vision 폴백 가능)
    const mathpixText = await callMathpix(image!, false);
    if (mathpixText) {
      return NextResponse.json({ text: mathpixText, fallback: false, parser: "mathpix" });
    }
    const upstageText = await callUpstage(base64Data, mimeType);
    if (upstageText) {
      return NextResponse.json({ text: upstageText, fallback: false, parser: "upstage" });
    }
    // 마지막 보험: Vision LLM
    const visionText = await callClaudeVision(base64Data, mimeType);
    if (visionText) {
      return NextResponse.json({ text: visionText, fallback: false, parser: "claude-vision-fallback" });
    }
    return NextResponse.json({ text: null, fallback: true });
  } catch {
    return NextResponse.json({ text: null, fallback: true });
  }
}
