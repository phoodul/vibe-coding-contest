/**
 * 한 PDF 의 text layer + bounding box 추출 — 문제 번호 detection 패턴 분석.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

async function main() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const path = resolve(
    process.cwd(),
    'user_docs/suneung_science/by-subject/earth-science-I/2026.pdf',
  );
  const data = readFileSync(path);
  const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const pdf = await pdfjs.getDocument({ data: uint8 }).promise;

  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const viewport = page.getViewport({ scale: 1.0 });
    const text = await page.getTextContent();

    console.log(`\n=== PAGE ${n} (size: ${viewport.width.toFixed(0)} × ${viewport.height.toFixed(0)}) ===`);

    // Find items starting with a number followed by '.'
    const items = text.items as Array<{
      str: string;
      transform: number[];
      width: number;
      height: number;
    }>;

    for (const it of items) {
      const str = it.str.trim();
      const m = str.match(/^(\d+)\.\s*$/) || str.match(/^(\d+)\.$/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (num >= 1 && num <= 20) {
          // PDF 좌표: y 는 bottom-up (transform[5] = y from bottom)
          const x = it.transform[4];
          const yFromBottom = it.transform[5];
          console.log(
            `  Q${num}: "${str}" @ x=${x.toFixed(0)} yFromBottom=${yFromBottom.toFixed(0)} (yFromTop=${(viewport.height - yFromBottom).toFixed(0)})`,
          );
        }
      }
    }
  }
}

main().catch(console.error);
