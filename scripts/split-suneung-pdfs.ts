/**
 * 19차 (2026-05-07) — 80 수능 PDF → 페이지별 PNG 분할.
 *
 * 입력: user_docs/suneung_science/by-subject/{subject}-{variant}/{year}.pdf
 * 출력: user_docs/suneung_science/pages/{subject}-{variant}/{year}/page-{N}.png
 *
 * 사용:
 *   npx tsx scripts/split-suneung-pdfs.ts          # 전체
 *   npx tsx scripts/split-suneung-pdfs.ts physics  # subject 1개
 *
 * 원리: pdfjs-dist legacy build 로 PDF load → 각 페이지를 @napi-rs/canvas 에
 * render → toBuffer('image/png') 로 PNG 저장. scale=2 로 고해상도 (Vision LLM
 * OCR 정확도 ↑).
 *
 * 시간: 80 PDF × ~6 페이지 = ~480 PNG. 페이지당 ~1 sec → 8~10 분 소요.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';

// pdfjs-dist legacy ESM
async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjs;
}

const ROOT = resolve(process.cwd(), 'user_docs/suneung_science/by-subject');
const OUT_ROOT = resolve(process.cwd(), 'user_docs/suneung_science/pages');
const SCALE = 2.0; // 고해상도 — Vision LLM 정확도 ↑

interface SplitTarget {
  subject: string;
  variant: 'I' | 'II';
  year: number;
  src: string;
}

function findTargets(filterSubject?: string): SplitTarget[] {
  const targets: SplitTarget[] = [];
  if (!existsSync(ROOT)) {
    console.error(`[split] root 없음: ${ROOT}`);
    return targets;
  }
  for (const dirName of readdirSync(ROOT)) {
    const dir = join(ROOT, dirName);
    const m = dirName.match(/^(.+)-(I|II)$/);
    if (!m) continue;
    const subject = m[1];
    const variant = m[2] as 'I' | 'II';
    if (filterSubject && subject !== filterSubject) continue;
    for (const fname of readdirSync(dir)) {
      const ym = fname.match(/^(\d{4})\.pdf$/i);
      if (!ym) continue;
      const year = parseInt(ym[1], 10);
      targets.push({ subject, variant, year, src: join(dir, fname) });
    }
  }
  return targets.sort((a, b) =>
    a.subject !== b.subject
      ? a.subject.localeCompare(b.subject)
      : a.variant !== b.variant
        ? a.variant.localeCompare(b.variant)
        : b.year - a.year,
  );
}

async function splitPdf(target: SplitTarget, pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs')) {
  const outDir = join(OUT_ROOT, `${target.subject}-${target.variant}`, `${target.year}`);
  mkdirSync(outDir, { recursive: true });

  const data = readFileSync(target.src);
  // pdfjs needs Uint8Array
  const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const loadingTask = pdfjs.getDocument({ data: uint8 });
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;
  for (let n = 1; n <= pageCount; n++) {
    const outFile = join(outDir, `page-${n}.png`);
    if (existsSync(outFile)) continue; // 재실행 안전 (이미 분할됨)

    const page = await pdf.getPage(n);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    // pdfjs render — canvas type cast (napi canvas != browser CanvasRenderingContext2D)
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;

    const buf = canvas.toBuffer('image/png');
    writeFileSync(outFile, buf);
  }
  await pdf.destroy();
  return pageCount;
}

async function main() {
  const filterSubject = process.argv[2];
  const pdfjs = await loadPdfjs();
  const targets = findTargets(filterSubject);
  console.log(`[split] 대상 ${targets.length} PDFs`);

  let totalPages = 0;
  let completed = 0;
  const start = Date.now();

  for (const t of targets) {
    const t0 = Date.now();
    try {
      const pages = await splitPdf(t, pdfjs);
      totalPages += pages;
      completed++;
      const dt = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(
        `  [${completed}/${targets.length}] ${t.subject}-${t.variant}/${t.year} = ${pages}p (${dt}s)`,
      );
    } catch (e) {
      console.error(`  ✗ ${t.subject}-${t.variant}/${t.year}: ${(e as Error).message}`);
    }
  }

  const totalSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n[split] OK — ${completed}/${targets.length} PDFs / ${totalPages} pages / ${totalSec}s`);
  console.log(`[split] 출력: ${OUT_ROOT}`);
}

main().catch((e) => {
  console.error('[split] 실패:', e);
  process.exit(1);
});
