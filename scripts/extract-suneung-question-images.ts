/**
 * 19차 (2026-05-07) — 80 PDF × 20 문제 = 1600 문제 영역 PNG 자동 추출.
 *
 * 알고리즘:
 *   1. PDF text layer 에서 문제 번호 (1.~20.) 좌표 추출
 *   2. 좌표를 column (좌·우) + y 위치로 grouping
 *   3. 각 문제 = (column_x, y_top) ~ (column_x_right, y_next_or_bottom)
 *   4. 페이지 PNG 에서 해당 영역 crop → 새 PNG 저장
 *
 * 출력: user_docs/suneung_science/questions/{subject}-{variant}/{year}/q-{N}.png
 *
 * 시간 추정: ~30 분 (80 PDF × 20 영역 × ~1초)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';

const ROOT = resolve(process.cwd(), 'user_docs/suneung_science/by-subject');
const OUT_ROOT = resolve(process.cwd(), 'user_docs/suneung_science/questions');
const SCALE = 2.0;
// 문제 영역 보정 (PDF 1× 좌표 기준)
const MARGIN_TOP = 12; // 번호 위쪽 여백 (다음 라벨이 잘리지 않게)
const MARGIN_BOTTOM = 8; // 다음 문제 영역 침범 방지
const COLUMN_LEFT_X = 50; // 좌측 column left 시작 (88 - 38)
const COLUMN_LEFT_RIGHT = 415; // 좌측 column right end (페이지 절반 약간 전)
const COLUMN_RIGHT_X = 415; // 우측 column left
const COLUMN_RIGHT_RIGHT = 800; // 우측 column right (842 페이지 width)

interface QuestionPos {
  number: number;
  page: number;
  column: 'L' | 'R';
  /** PDF 좌표 (yFromBottom). top = viewport.height - yFromBottom */
  x: number;
  yFromBottom: number;
}

interface SplitTarget {
  subject: string;
  variant: 'I' | 'II';
  year: number;
  src: string;
}

function findTargets(filterSubject?: string): SplitTarget[] {
  const targets: SplitTarget[] = [];
  if (!existsSync(ROOT)) return targets;
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
      targets.push({
        subject,
        variant,
        year: parseInt(ym[1], 10),
        src: join(dir, fname),
      });
    }
  }
  return targets;
}

async function extractQuestionPositions(
  pdf: import('pdfjs-dist').PDFDocumentProxy,
): Promise<QuestionPos[]> {
  const positions: QuestionPos[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const text = await page.getTextContent();
    const items = text.items as Array<{ str: string; transform: number[] }>;
    for (const it of items) {
      const str = it.str.trim();
      const m = str.match(/^(\d+)\s*\.\s*$/);
      if (!m) continue;
      const num = parseInt(m[1], 10);
      if (num < 1 || num > 20) continue;
      const x = it.transform[4];
      const yFromBottom = it.transform[5];
      // column 식별: x < 250 = 좌측 / >= 250 = 우측
      const column: 'L' | 'R' = x < 250 ? 'L' : 'R';
      // 같은 번호가 여러 번 매칭될 수 있음 (페이지 안 다른 위치) — 가장 위 (큰 yFromBottom) 만 사용
      const existing = positions.find((q) => q.number === num);
      if (existing) {
        if (existing.page === p && yFromBottom > existing.yFromBottom) {
          existing.x = x;
          existing.yFromBottom = yFromBottom;
          existing.column = column;
        }
        continue;
      }
      positions.push({ number: num, page: p, column, x, yFromBottom });
    }
  }
  return positions.sort((a, b) => a.number - b.number);
}

interface QuestionRect {
  number: number;
  page: number;
  /** PDF 1× 좌표 — top-left + size */
  pdfX: number;
  pdfY: number;
  pdfW: number;
  pdfH: number;
}

function buildRects(
  positions: QuestionPos[],
  pageHeight: number,
): QuestionRect[] {
  const rects: QuestionRect[] = [];
  // 각 문제 영역 = same page + same column 의 다음 문제까지
  for (const q of positions) {
    const yTop = pageHeight - q.yFromBottom - MARGIN_TOP;
    // 같은 page 의 같은 column 안에서 q 보다 아래 (yFromBottom 더 작음) 가장 가까운 문제
    const samePageColumn = positions.filter(
      (p) =>
        p.page === q.page &&
        p.column === q.column &&
        p.yFromBottom < q.yFromBottom,
    );
    let yBottom: number;
    if (samePageColumn.length > 0) {
      const next = samePageColumn.reduce((a, b) =>
        a.yFromBottom > b.yFromBottom ? a : b,
      );
      yBottom = pageHeight - next.yFromBottom - MARGIN_BOTTOM;
    } else {
      // 페이지 마지막 — 페이지 bottom
      yBottom = pageHeight - 30; // 하단 여백
    }

    const left = q.column === 'L' ? COLUMN_LEFT_X : COLUMN_RIGHT_X;
    const right = q.column === 'L' ? COLUMN_LEFT_RIGHT : COLUMN_RIGHT_RIGHT;

    rects.push({
      number: q.number,
      page: q.page,
      pdfX: left,
      pdfY: yTop,
      pdfW: right - left,
      pdfH: Math.max(0, yBottom - yTop),
    });
  }
  return rects;
}

async function extractTarget(
  target: SplitTarget,
  pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs'),
): Promise<{ extracted: number; skipped: number }> {
  const outDir = join(
    OUT_ROOT,
    `${target.subject}-${target.variant}`,
    `${target.year}`,
  );
  mkdirSync(outDir, { recursive: true });

  const data = readFileSync(target.src);
  const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const pdf = await pdfjs.getDocument({ data: uint8 }).promise;

  const positions = await extractQuestionPositions(pdf);
  if (positions.length === 0) {
    console.warn(`  ⚠ ${target.subject}-${target.variant}/${target.year}: 문제 번호 0 추출`);
    await pdf.destroy();
    return { extracted: 0, skipped: 0 };
  }

  // 페이지별 처리
  let extracted = 0;
  let skipped = 0;
  const pagesUsed = new Set(positions.map((p) => p.page));
  // 페이지를 한 번만 render → 캐시
  const pageCanvases: Record<number, unknown> = {};

  for (const p of pagesUsed) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;
    pageCanvases[p] = canvas;
  }

  // 페이지 높이 (1× 기준) 사용을 위해 첫 번째 페이지 viewport
  const firstPage = await pdf.getPage(positions[0].page);
  const v1x = firstPage.getViewport({ scale: 1.0 });
  const pageHeight1x = v1x.height;
  const rects = buildRects(positions, pageHeight1x);

  for (const r of rects) {
    const outFile = join(outDir, `q-${r.number}.png`);
    if (existsSync(outFile)) {
      skipped++;
      continue;
    }
    const pageCanvas = pageCanvases[r.page];
    if (!pageCanvas) continue;

    // PDF 1× → canvas (SCALE 적용) 좌표 변환
    const sx = Math.floor(r.pdfX * SCALE);
    const sy = Math.floor(r.pdfY * SCALE);
    const sw = Math.ceil(r.pdfW * SCALE);
    const sh = Math.ceil(r.pdfH * SCALE);

    if (sw <= 0 || sh <= 0) {
      skipped++;
      continue;
    }

    const cropCanvas = createCanvas(sw, sh);
    const cropCtx = cropCanvas.getContext('2d') as unknown as SKRSContext2D;
    cropCtx.drawImage(
      pageCanvas as unknown as Parameters<SKRSContext2D['drawImage']>[0],
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      sw,
      sh,
    );
    writeFileSync(outFile, cropCanvas.toBuffer('image/png'));
    extracted++;
  }

  await pdf.destroy();
  return { extracted, skipped };
}

async function main() {
  const filterSubject = process.argv[2];
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const targets = findTargets(filterSubject);
  console.log(`[extract] 대상 ${targets.length} PDFs`);

  let totalExtracted = 0;
  let totalSkipped = 0;
  let completed = 0;
  const start = Date.now();

  for (const t of targets) {
    const t0 = Date.now();
    try {
      const { extracted, skipped } = await extractTarget(t, pdfjs);
      totalExtracted += extracted;
      totalSkipped += skipped;
      completed++;
      const dt = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(
        `  [${completed}/${targets.length}] ${t.subject}-${t.variant}/${t.year} = ${extracted} new / ${skipped} skip (${dt}s)`,
      );
    } catch (e) {
      console.error(`  ✗ ${t.subject}-${t.variant}/${t.year}: ${(e as Error).message}`);
    }
  }

  const totalSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\n[extract] OK — ${completed}/${targets.length} PDFs / ${totalExtracted} 문제 추출 / ${totalSkipped} 스킵 / ${totalSec}s`,
  );
  console.log(`[extract] 출력: ${OUT_ROOT}`);
}

main().catch((e) => {
  console.error('[extract] 실패:', e);
  process.exit(1);
});
