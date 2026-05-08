/**
 * 19차 (2026-05-07) — PDF text layer → 문제 번호별 본문 + 보기 분리.
 *
 * 출력: user_docs/suneung_science/problem-texts-extract.json (git 미추적, 로컬 보강용)
 *   { "earth-science_I_2026_8": { "body": "...", "choices": ["...", "..."] } }
 *
 * 알고리즘:
 *   1. 페이지마다 text items (str + 좌표) 추출
 *   2. 문제 번호 (1.~20.) 위치 기반 영역 grouping
 *   3. 각 영역 안의 text 좌표 sort (column 분리 후 y desc)
 *   4. 보기 패턴 (①②③④⑤ 또는 (1)~(5)) 으로 splitting
 *   5. JSON 저장
 *
 * 한계: 한국어 cMap 누락 시 일부 문자 깨짐 → 그래도 LLM 이 image 와 함께 보면 보완 가능.
 * production maestro 는 multimodal 이미지 첨부로 작동 → 본 JSON 은 향후 fallback / context
 * augmentation 실험용. 22차에 user_docs 로 이동 (1.8MB → repo bloat 회피).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd(), 'user_docs/suneung_science/by-subject');
const OUT_PATH = resolve(
  process.cwd(),
  'user_docs/suneung_science/problem-texts-extract.json',
);

interface TextItem {
  str: string;
  x: number;
  yFromBottom: number;
  page: number;
}

interface Target {
  subject: string;
  variant: 'I' | 'II';
  year: number;
  src: string;
}

interface ProblemText {
  body: string;
  choices: string[];
}

function findTargets(): Target[] {
  const targets: Target[] = [];
  if (!existsSync(ROOT)) return targets;
  for (const dirName of readdirSync(ROOT)) {
    const dir = join(ROOT, dirName);
    const m = dirName.match(/^(.+)-(I|II)$/);
    if (!m) continue;
    for (const fname of readdirSync(dir)) {
      const ym = fname.match(/^(\d{4})\.pdf$/i);
      if (!ym) continue;
      targets.push({
        subject: m[1],
        variant: m[2] as 'I' | 'II',
        year: parseInt(ym[1], 10),
        src: join(dir, fname),
      });
    }
  }
  return targets;
}

async function extractTextItems(
  pdf: import('pdfjs-dist').PDFDocumentProxy,
): Promise<TextItem[]> {
  const all: TextItem[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const text = await page.getTextContent();
    for (const it of text.items as Array<{ str: string; transform: number[] }>) {
      if (!it.str) continue;
      all.push({
        str: it.str,
        x: it.transform[4],
        yFromBottom: it.transform[5],
        page: p,
      });
    }
  }
  return all;
}

interface QPos {
  number: number;
  page: number;
  column: 'L' | 'R';
  yFromBottom: number;
}

function findQuestionPositions(items: TextItem[]): QPos[] {
  const positions: QPos[] = [];
  for (const it of items) {
    const m = it.str.trim().match(/^(\d+)\.$/);
    if (!m) continue;
    const num = parseInt(m[1], 10);
    if (num < 1 || num > 20) continue;
    const column: 'L' | 'R' = it.x < 250 ? 'L' : 'R';
    const existing = positions.find((q) => q.number === num);
    if (existing) {
      if (it.page === existing.page && it.yFromBottom > existing.yFromBottom) {
        existing.yFromBottom = it.yFromBottom;
        existing.column = column;
      }
      continue;
    }
    positions.push({
      number: num,
      page: it.page,
      column,
      yFromBottom: it.yFromBottom,
    });
  }
  return positions.sort((a, b) => a.number - b.number);
}

function groupByQuestion(
  items: TextItem[],
  positions: QPos[],
): Record<number, TextItem[]> {
  const groups: Record<number, TextItem[]> = {};
  for (const q of positions) groups[q.number] = [];

  for (const it of items) {
    // skip 문제 번호 자체
    if (it.str.trim().match(/^\d+\.$/)) continue;
    // it 가 어떤 문제에 속하는지 결정
    // 같은 page + column 안에서 it.y 가 어떤 문제 y 보다 위? 아래?
    const itColumn: 'L' | 'R' = it.x < 250 ? 'L' : 'R';
    // 같은 column + page 안에서, it.yFromBottom <= q.yFromBottom 이고, 더 작은 yFromBottom 의 다음 문제 q' 보다 큰 것 = q 영역
    const candidates = positions.filter(
      (q) => q.page === it.page && q.column === itColumn,
    );
    if (candidates.length === 0) continue;
    // candidates sort by yFromBottom desc
    const sorted = [...candidates].sort((a, b) => b.yFromBottom - a.yFromBottom);
    let owner: number | null = null;
    for (let i = 0; i < sorted.length; i++) {
      const q = sorted[i];
      const next = sorted[i + 1];
      // q 의 yFromBottom 이상 ~ next 의 yFromBottom 사이 (= q 영역)
      // 또는 next 가 없으면 q 의 yFromBottom 이하 모두 (= q 영역)
      const upper = q.yFromBottom + 5; // 약간 margin
      const lower = next ? next.yFromBottom - 5 : -Infinity;
      if (it.yFromBottom <= upper && it.yFromBottom > lower) {
        owner = q.number;
        break;
      }
    }
    if (owner !== null) groups[owner].push(it);
  }
  return groups;
}

function reconstructText(items: TextItem[]): string {
  // y desc, then x asc 로 sort → 줄바꿈 grouping
  const sorted = [...items].sort((a, b) => {
    const dy = b.yFromBottom - a.yFromBottom;
    if (Math.abs(dy) > 3) return dy; // 다른 줄
    return a.x - b.x; // 같은 줄
  });
  // 같은 줄 = yFromBottom 차이 ≤ 3
  const lines: string[][] = [];
  let lastY: number | null = null;
  for (const it of sorted) {
    if (lastY === null || Math.abs(it.yFromBottom - lastY) > 3) {
      lines.push([it.str]);
      lastY = it.yFromBottom;
    } else {
      lines[lines.length - 1].push(it.str);
    }
  }
  return lines.map((parts) => parts.join('').trim()).join('\n').trim();
}

function splitBodyChoices(text: string): { body: string; choices: string[] } {
  // 보기 패턴: ① ~ ⑤ (한 글자 원숫자)
  const choiceMarkers = ['①', '②', '③', '④', '⑤'];
  const indices = choiceMarkers
    .map((m) => ({ m, i: text.indexOf(m) }))
    .filter((x) => x.i >= 0);
  if (indices.length === 0) {
    // (1) ~ (5) 패턴 시도
    const altRe = /\(\s*([1-5])\s*\)/g;
    const matches: { m: string; i: number }[] = [];
    let am: RegExpExecArray | null;
    while ((am = altRe.exec(text))) {
      matches.push({ m: am[0], i: am.index });
    }
    if (matches.length < 2) {
      return { body: text.trim(), choices: [] };
    }
    const first = matches[0].i;
    const body = text.slice(0, first).trim();
    const choices: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].i;
      const end = matches[i + 1]?.i ?? text.length;
      choices.push(text.slice(start, end).trim());
    }
    return { body, choices };
  }
  const first = indices[0].i;
  const body = text.slice(0, first).trim();
  const choices: string[] = [];
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].i;
    const end = indices[i + 1]?.i ?? text.length;
    choices.push(text.slice(start, end).trim());
  }
  return { body, choices };
}

async function extractTarget(
  target: Target,
  pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs'),
): Promise<Record<string, ProblemText>> {
  const data = readFileSync(target.src);
  const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const pdf = await pdfjs.getDocument({ data: uint8 }).promise;

  const items = await extractTextItems(pdf);
  const positions = findQuestionPositions(items);
  const groups = groupByQuestion(items, positions);

  const out: Record<string, ProblemText> = {};
  for (const q of positions) {
    const itemsOfQ = groups[q.number] ?? [];
    if (itemsOfQ.length === 0) continue;
    const text = reconstructText(itemsOfQ);
    const { body, choices } = splitBodyChoices(text);
    const key = `${target.subject}_${target.variant}_${target.year}_${q.number}`;
    out[key] = { body, choices };
  }
  await pdf.destroy();
  return out;
}

async function main() {
  const filterSubject = process.argv[2];
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const targets = findTargets().filter((t) => !filterSubject || t.subject === filterSubject);
  console.log(`[texts] 대상 ${targets.length} PDFs`);

  const merged: Record<string, ProblemText> = existsSync(OUT_PATH)
    ? JSON.parse(readFileSync(OUT_PATH, 'utf-8'))
    : {};

  let total = 0;
  let completed = 0;
  const start = Date.now();
  for (const t of targets) {
    try {
      const out = await extractTarget(t, pdfjs);
      Object.assign(merged, out);
      total += Object.keys(out).length;
      completed++;
      if (completed % 8 === 0 || completed === targets.length) {
        console.log(
          `  [${completed}/${targets.length}] ${t.subject}-${t.variant}/${t.year} += ${Object.keys(out).length}`,
        );
        // 중간 저장
        writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error(`  ✗ ${t.subject}-${t.variant}/${t.year}: ${(e as Error).message}`);
    }
  }
  writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  const totalSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\n[texts] OK — ${completed}/${targets.length} PDFs / ${total} 문제 / ${totalSec}s`,
  );
  console.log(`[texts] 출력: ${OUT_PATH}`);
}

main().catch((e) => {
  console.error('[texts] 실패:', e);
  process.exit(1);
});
