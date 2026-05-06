/**
 * 19차 Phase B5-f — 사용자 입력 Excel 정답 DB → TypeScript 자동 변환.
 *
 * 사용법:
 *   1. 사용자가 `data/seeds/science-exam-answers.xlsx` 작성
 *   2. `npx tsx scripts/convert-science-answers-xlsx.ts`
 *   3. `src/lib/data/science-exam-answers.ts` 의 SCIENCE_ANSWERS 가 자동 갱신
 *
 * Excel 시트 형식 (header 1행 + 데이터):
 *   | subject       | variant | year | number | answer |
 *   | earth-science | I       | 2026 | 1      | 3      |
 *   | earth-science | I       | 2026 | 2      | 5      |
 *   | physics       | II      | 2018 | 7      | 4      |
 *   ...
 *
 * subject = earth-science / biology / physics / chemistry
 * variant = I / II (대문자 알파벳)
 * year    = 2017~2026 (학년도)
 * number  = 1~20
 * answer  = 1~5 (객관식 보기 번호)
 *
 * 빈 칸 / 미입력 row 는 자동 skip. 잘못된 값은 console.warn + skip.
 *
 * @prerequisite npm install -D xlsx
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
// xlsx 는 사용자가 설치 후 동작. 미설치 시 명시적 에러로 안내.
import * as XLSX from 'xlsx';

const XLSX_PATH = resolve(process.cwd(), 'data/seeds/science-exam-answers.xlsx');
const TS_PATH = resolve(process.cwd(), 'src/lib/data/science-exam-answers.ts');

interface RawRow {
  subject?: string;
  variant?: string;
  year?: number | string;
  number?: number | string;
  answer?: number | string;
}

const VALID_SUBJECTS = new Set([
  'earth-science',
  'biology',
  'physics',
  'chemistry',
]);

function main() {
  if (!existsSync(XLSX_PATH)) {
    console.error(`[convert] Excel 파일 없음: ${XLSX_PATH}`);
    console.error('  사용자가 KICE 정답표 PDF 보고 직접 작성 후 위 경로에 저장하세요.');
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_PATH);
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    console.error('[convert] 빈 워크북');
    process.exit(1);
  }
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet);

  const db: Record<string, Record<string, Record<number, Record<number, number>>>> = {};
  let valid = 0;
  let invalid = 0;
  const seen = new Set<string>();

  for (const [i, raw] of rows.entries()) {
    const subject = String(raw.subject ?? '').trim();
    const variant = String(raw.variant ?? '').trim().toUpperCase();
    const year = Number(raw.year);
    const number = Number(raw.number);
    const answer = Number(raw.answer);

    // 유효성 검증
    if (!VALID_SUBJECTS.has(subject)) {
      console.warn(`[convert] row ${i + 2}: invalid subject="${subject}", skip`);
      invalid++;
      continue;
    }
    if (variant !== 'I' && variant !== 'II') {
      console.warn(`[convert] row ${i + 2}: invalid variant="${variant}", skip`);
      invalid++;
      continue;
    }
    if (!Number.isInteger(year) || year < 2017 || year > 2026) {
      console.warn(`[convert] row ${i + 2}: invalid year=${year}, skip`);
      invalid++;
      continue;
    }
    if (!Number.isInteger(number) || number < 1 || number > 20) {
      console.warn(`[convert] row ${i + 2}: invalid number=${number}, skip`);
      invalid++;
      continue;
    }
    if (!Number.isInteger(answer) || answer < 1 || answer > 5) {
      console.warn(`[convert] row ${i + 2}: invalid answer=${answer}, skip`);
      invalid++;
      continue;
    }

    const key = `${subject}_${variant}_${year}_${number}`;
    if (seen.has(key)) {
      console.warn(`[convert] row ${i + 2}: duplicate ${key}, overriding`);
    }
    seen.add(key);

    db[subject] ??= {};
    db[subject][variant] ??= {};
    db[subject][variant][year] ??= {};
    db[subject][variant][year][number] = answer;
    valid++;
  }

  // TypeScript 파일 갱신 — SCIENCE_ANSWERS 객체만 교체
  const existing = readFileSync(TS_PATH, 'utf-8');
  const marker = 'export const SCIENCE_ANSWERS: ScienceAnswerDB = {';
  const startIdx = existing.indexOf(marker);
  if (startIdx === -1) {
    console.error('[convert] SCIENCE_ANSWERS marker not found in', TS_PATH);
    process.exit(1);
  }

  // 객체 끝 closing brace 찾기 (간단한 brace counting)
  let depth = 0;
  let endIdx = startIdx + marker.length;
  while (endIdx < existing.length) {
    const c = existing[endIdx];
    if (c === '{') depth++;
    else if (c === '}') {
      if (depth === 0) {
        endIdx++; // include the closing brace
        break;
      }
      depth--;
    }
    endIdx++;
  }
  // 다음 ';' 까지 포함
  while (endIdx < existing.length && existing[endIdx] !== ';') endIdx++;
  endIdx++; // ';' 포함

  // 새 객체 생성
  const subjectsOrdered = ['earth-science', 'biology', 'physics', 'chemistry'];
  const lines: string[] = [marker];
  for (const subj of subjectsOrdered) {
    if (!db[subj]) continue;
    lines.push(`  '${subj}': {`);
    for (const variant of ['I', 'II']) {
      if (!db[subj][variant]) continue;
      lines.push(`    ${variant}: {`);
      const years = Object.keys(db[subj][variant])
        .map(Number)
        .sort((a, b) => b - a); // 최신 → 과거
      for (const year of years) {
        const nums = db[subj][variant][year];
        const numEntries = Object.keys(nums)
          .map(Number)
          .sort((a, b) => a - b)
          .map((n) => `${n}: ${nums[n]}`)
          .join(', ');
        lines.push(`      ${year}: { ${numEntries} },`);
      }
      lines.push(`    },`);
    }
    lines.push(`  },`);
  }
  lines.push('};');

  const newBlock = lines.join('\n');
  const updated = existing.slice(0, startIdx) + newBlock + existing.slice(endIdx);
  writeFileSync(TS_PATH, updated, 'utf-8');

  console.log(`[convert] OK — ${valid} 정답 입력 / ${invalid} skip`);
  console.log(`[convert] 갱신 파일: ${TS_PATH}`);
}

main();
