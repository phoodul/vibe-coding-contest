/**
 * Phase B-05: 사진 배치 입력 → 도구 후보 JSON 생성기.
 *
 * 동작:
 *   1) 입력 디렉터리의 이미지 파일 (jpg/png) 순회
 *   2) Mathpix 로 LaTeX/텍스트 OCR
 *   3) Sonnet 4.6 로 도구 메타데이터 (name, layer, why_text, triggers) 추출
 *   4) data/math-tools-seed-candidate.json 으로 출력
 *   5) 사용자가 어드민 화면(/admin/math-tools — B-11)에서 검수 후 적재
 *
 * 실행:
 *   pnpm dlx tsx scripts/seed-from-image.ts <input-dir>
 *
 * 환경변수: MATHPIX_APP_ID, MATHPIX_API_KEY, ANTHROPIC_API_KEY
 */

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = process.cwd();
const OUTPUT = path.join(REPO_ROOT, "data", "math-tools-seed-candidate.json");

interface OCRResult {
  file: string;
  latex: string;
  text: string;
}

interface CandidateTool {
  proposed_name: string;
  proposed_formula_latex: string;
  proposed_layer: number;
  proposed_why: string;
  proposed_trigger: string;
  source_image: string;
}

async function ocrImage(filepath: string): Promise<OCRResult | null> {
  const APP_ID = process.env.MATHPIX_APP_ID;
  const KEY = process.env.MATHPIX_API_KEY;
  if (!APP_ID || !KEY) throw new Error("MATHPIX env missing");

  const buf = await readFile(filepath);
  const base64 = buf.toString("base64");
  const ext = path.extname(filepath).slice(1).toLowerCase() || "png";
  const dataUrl = `data:image/${ext};base64,${base64}`;

  const resp = await fetch("https://api.mathpix.com/v3/text", {
    method: "POST",
    headers: { app_id: APP_ID, app_key: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      src: dataUrl,
      formats: ["text", "latex_styled"],
      math_inline_delimiters: ["$", "$"],
      math_display_delimiters: ["$$", "$$"],
    }),
  });
  if (!resp.ok) {
    console.warn(`[seed-from-image] OCR failed ${path.basename(filepath)}: ${resp.status}`);
    return null;
  }
  const data = (await resp.json()) as { text?: string; latex_styled?: string };
  return {
    file: path.basename(filepath),
    latex: data.latex_styled ?? "",
    text: data.text ?? "",
  };
}

async function classifyTool(ocr: OCRResult): Promise<CandidateTool | null> {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY missing");

  const system = `당신은 수학 도구(정리·공식)를 추출하는 보조입니다. 입력으로 LaTeX 또는 텍스트 OCR 결과를 받습니다.
다음 JSON 형식으로 한 도구만 추출하세요. 정석/교과서 원문을 그대로 인용하지 말고 AI 자체 표현으로 다시 쓰세요.
{
  "proposed_name": "도구 이름 (예: 평균값 정리 — 기본형)",
  "proposed_formula_latex": "수식 LaTeX",
  "proposed_layer": 1~6 정수,
  "proposed_why": "왜 이 도구를 쓰는가 (한 문장)",
  "proposed_trigger": "언제 쓰이는가 (한 문장)"
}
도구로 보이지 않으면 null 반환.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 600,
      system,
      messages: [
        { role: "user", content: `LaTeX:\n${ocr.latex}\n\nTEXT:\n${ocr.text}\n\nJSON 만 출력.` },
      ],
    }),
  });

  if (!resp.ok) {
    console.warn(`[seed-from-image] classify failed ${ocr.file}: ${resp.status}`);
    return null;
  }
  const data = (await resp.json()) as { content?: { text?: string }[] };
  const text = (data.content?.[0]?.text ?? "").trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  try {
    const parsed = JSON.parse(candidate) as Omit<CandidateTool, "source_image"> | null;
    if (!parsed) return null;
    return { ...parsed, source_image: ocr.file };
  } catch {
    return null;
  }
}

async function main() {
  const inputDir = process.argv[2];
  if (!inputDir) {
    console.error("usage: pnpm dlx tsx scripts/seed-from-image.ts <input-dir>");
    process.exit(1);
  }

  const files = (await readdir(inputDir))
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => path.join(inputDir, f));
  console.log(`[seed-from-image] ${files.length} images to process`);

  const candidates: CandidateTool[] = [];
  for (const f of files) {
    const ocr = await ocrImage(f);
    if (!ocr) continue;
    const tool = await classifyTool(ocr);
    if (!tool) {
      console.warn(`[seed-from-image] skipped ${path.basename(f)} (no tool detected)`);
      continue;
    }
    candidates.push(tool);
    console.log(`[seed-from-image] + ${tool.proposed_name} (${path.basename(f)})`);
  }

  await writeFile(OUTPUT, JSON.stringify({ generated_at: new Date().toISOString(), candidates }, null, 2));
  console.log(`[seed-from-image] ✓ ${candidates.length} candidates written to ${OUTPUT}`);
  console.log(`  → 어드민 화면 (/admin/math-tools) 에서 검수 후 적재하세요.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
