/**
 * 19차 (2026-05-06) — 수능 과학 PDF 80개 표준 위치로 정규화.
 *
 * 입력: user_docs/suneung_science/<연도 변동 이름>/<8 PDF>
 *   - 4교시_과학탐구영역_문제지2021 / 2022 / 2023
 *   - 과학탐구_문제지2020
 *   - 과학탐구영역_문제지2017 ~ 2026
 *   - 일부는 nested (2025 → 4교시2_과학탐구/)
 *
 * 출력: user_docs/suneung_science/by-subject/<subject>-<variant>/<year>.pdf
 *   - physics-I / physics-II
 *   - chemistry-I / chemistry-II
 *   - biology-I / biology-II
 *   - earth-science-I / earth-science-II
 *
 * 파일 명명 규칙: 첫 두 자리 (01~08) = subject 번호.
 *   01=물리Ⅰ / 02=화학Ⅰ / 03=생명Ⅰ / 04=지구Ⅰ / 05=물리Ⅱ / 06=화학Ⅱ / 07=생명Ⅱ / 08=지구Ⅱ
 *
 * @prerequisite npx tsx scripts/normalize-suneung-pdfs.ts
 */
import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd(), 'user_docs/suneung_science');
const OUT = resolve(ROOT, 'by-subject');

/** 첫 두 자리 (01~08) → subject + variant */
const NUMBER_TO_SUBJECT: Record<string, { subject: string; variant: 'I' | 'II' }> = {
  '01': { subject: 'physics', variant: 'I' },
  '02': { subject: 'chemistry', variant: 'I' },
  '03': { subject: 'biology', variant: 'I' },
  '04': { subject: 'earth-science', variant: 'I' },
  '05': { subject: 'physics', variant: 'II' },
  '06': { subject: 'chemistry', variant: 'II' },
  '07': { subject: 'biology', variant: 'II' },
  '08': { subject: 'earth-science', variant: 'II' },
};

/** 연도 폴더 → year 추출 (4자리 숫자). 없으면 null. */
function extractYear(folderName: string): number | null {
  const m = folderName.match(/(\d{4})/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  if (y < 2017 || y > 2026) return null;
  return y;
}

interface FoundPDF {
  year: number;
  subject: string;
  variant: 'I' | 'II';
  src: string;
}

/** 한 폴더에서 8 PDF 찾기 (nested 1단계 까지) */
function findPDFs(dir: string, year: number, out: FoundPDF[]) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      // nested 1단계 (예: 2025/4교시2_과학탐구/)
      findPDFs(full, year, out);
      continue;
    }
    // case-insensitive (.pdf / .PDF 모두 매치)
    if (!entry.toLowerCase().endsWith('.pdf')) continue;
    // 첫 두 자리 (01~08) — 공백 유무 무관
    const m = entry.match(/^(\d{2})/);
    if (!m) continue;
    const map = NUMBER_TO_SUBJECT[m[1]];
    if (!map) continue;
    out.push({ year, ...map, src: full });
  }
}

function main() {
  if (!existsSync(ROOT)) {
    console.error(`[normalize] root 없음: ${ROOT}`);
    process.exit(1);
  }

  // 1) 전체 PDF 인벤토리
  const allPDFs: FoundPDF[] = [];
  for (const entry of readdirSync(ROOT)) {
    const full = join(ROOT, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry === 'by-subject') continue; // 자기 자신 제외
    if (entry === 'answers') continue;
    if (entry.includes('정답')) continue; // 정답표 폴더 제외
    const year = extractYear(entry);
    if (year === null) {
      console.warn(`[normalize] year 추출 실패: ${entry}, skip`);
      continue;
    }
    findPDFs(full, year, allPDFs);
  }

  console.log(`[normalize] 발견 PDF: ${allPDFs.length} (예상 80)`);

  // 2) by-subject 디렉터리 생성 + 복사
  mkdirSync(OUT, { recursive: true });
  let copied = 0;
  let skipped = 0;
  for (const p of allPDFs) {
    const dirName = `${p.subject}-${p.variant}`;
    const dir = join(OUT, dirName);
    mkdirSync(dir, { recursive: true });
    const dest = join(dir, `${p.year}.pdf`);
    if (existsSync(dest)) {
      skipped++;
      continue;
    }
    copyFileSync(p.src, dest);
    copied++;
  }

  console.log(`[normalize] 복사 ${copied} / 스킵 (이미 존재) ${skipped}`);

  // 3) 인벤토리 표 출력
  const bySubject: Record<string, number[]> = {};
  for (const p of allPDFs) {
    const key = `${p.subject}-${p.variant}`;
    bySubject[key] ??= [];
    bySubject[key].push(p.year);
  }
  console.log('\n[normalize] 과목별 인벤토리:');
  for (const [key, years] of Object.entries(bySubject).sort()) {
    const sorted = [...years].sort((a, b) => a - b);
    console.log(`  ${key}: ${sorted.length}년 [${sorted.join(', ')}]`);
  }
}

main();
