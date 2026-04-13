/**
 * 공통 문서 파싱 유틸리티
 * Upstage Document Parse를 1순위로 사용하고, 실패 시 기존 파서로 fallback
 */

/** Upstage Document Parse로 PDF/이미지를 텍스트로 변환 */
export async function parseWithUpstage(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; parser: string } | null> {
  const UPSTAGE_API_KEY = process.env.UPSTAGE_API_KEY;
  if (!UPSTAGE_API_KEY) return null;

  try {
    const ext = fileName.toLowerCase().split(".").pop() || "";
    const mimeMap: Record<string, string> = {
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
    };
    const mimeType = mimeMap[ext] || "application/octet-stream";

    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    const formData = new FormData();
    formData.append("document", blob, fileName);
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
    const text = data.content?.text || data.text || "";
    if (text.trim()) {
      return { text: text.slice(0, 50000), parser: "upstage" };
    }
  } catch {
    // Upstage 실패 → null 반환, 호출측에서 fallback 처리
  }
  return null;
}

/** PDF 파싱: Upstage 우선, 실패 시 pdf-parse fallback */
export async function parsePdf(
  buffer: Buffer,
  fileName: string = "document.pdf"
): Promise<{ text: string; parser: string }> {
  // 1순위: Upstage
  const upstage = await parseWithUpstage(buffer, fileName);
  if (upstage) return upstage;

  // 2순위: pdf-parse (텍스트만)
  const mod = await import("pdf-parse") as any;
  const PDFParse = mod.PDFParse;
  const parser = new PDFParse(buffer);
  await parser.load();
  const text = ((await parser.getText()) as string).slice(0, 30000);
  return { text, parser: "pdf-parse" };
}
