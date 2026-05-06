import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

async function main() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = readFileSync(resolve(process.cwd(), 'user_docs/suneung_science/by-subject/chemistry-II/2020.pdf'));
  const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const pdf = await pdfjs.getDocument({ data: uint8 }).promise;
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const text = await page.getTextContent();
    const items = text.items as Array<{ str: string; transform: number[] }>;
    // 모든 number-only items 출력
    for (const it of items) {
      const s = it.str.trim();
      if (/^\d+\.?$/.test(s) || /^[78]/.test(s)) {
        console.log(`p${p}: "${it.str}" @ x=${it.transform[4].toFixed(0)} y=${it.transform[5].toFixed(0)}`);
      }
    }
  }
}
main();
