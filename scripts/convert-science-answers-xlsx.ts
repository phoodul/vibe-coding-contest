/**
 * 19차 Phase B5-f — 사용자 입력 Excel 정답 DB → TypeScript 자동 변환.
 *
 * 사용자 엑셀 구조 (user_docs/suneung_science/answers.xlsx):
 *   8 시트 (subject × variant 1:1 매핑):
 *     - 물리1 → physics, I
 *     - 물리2 → physics, II
 *     - 화학1 → chemistry, I
 *     - 화학2 → chemistry, II
 *     - 생물1 → biology, I
 *     - 생물2 → biology, II
 *     - 지구과학1 → earth-science, I
 *     - 지구과학2 → earth-science, II
 *
 *   각 시트 형식:
 *     A1: (빈 셀) | B1~U1: 1~20 (문제 번호 헤더)
 *     A2: 2026     | B2~U2: 정답 1~20
 *     A3: 2025     | B3~U3: 정답 1~20
 *     ... 학년도별 행
 *
 * 사용법:
 *   1. user_docs/suneung_science/answers.xlsx 작성
 *   2. `npx tsx scripts/convert-science-answers-xlsx.ts`
 *   3. src/lib/data/science-exam-answers.ts 의 SCIENCE_ANSWERS 자동 갱신
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as XLSX from 'xlsx';

const CANDIDATE_PATHS = [
  resolve(process.cwd(), 'user_docs/suneung_science/answers.xlsx'),
  resolve(process.cwd(), 'data/seeds/science-exam-answers.xlsx'),
];
const XLSX_PATH = CANDIDATE_PATHS.find((p) => existsSync(p)) ?? CANDIDATE_PATHS[0];
const TS_PATH = resolve(process.cwd(), 'src/lib/data/science-exam-answers.ts');

/** 시트 이름 → subject + variant */
const SHEET_MAP: Record<string, { subject: string; variant: 'I' | 'II' }> = {
  '물리1': { subject: 'physics', variant: 'I' },
  '물리2': { subject: 'physics', variant: 'II' },
  '화학1': { subject: 'chemistry', variant: 'I' },
  '화학2': { subject: 'chemistry', variant: 'II' },
  '생물1': { subject: 'biology', variant: 'I' },
  '생물2': { subject: 'biology', variant: 'II' },
  '지구과학1': { subject: 'earth-science', variant: 'I' },
  '지구과학2': { subject: 'earth-science', variant: 'II' },
};

function main() {
  if (!existsSync(XLSX_PATH)) {
    console.error(`[convert] Excel 파일 없음: ${XLSX_PATH}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_PATH);
  const db: Record<string, Record<string, Record<number, Record<number, number>>>> = {};
  let valid = 0;
  let invalid = 0;

  for (const sheetName of wb.SheetNames) {
    const map = SHEET_MAP[sheetName];
    if (!map) {
      console.warn(`[convert] unknown sheet "${sheetName}", skip`);
      continue;
    }
    const { subject, variant } = map;

    const sheet = wb.Sheets[sheetName];
    const arr = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false });
    if (arr.length < 2) {
      console.warn(`[convert] sheet ${sheetName} too short, skip`);
      continue;
    }

    // 1행 = 헤더 (1~20). 그 외 = year + 정답 20개.
    for (let i = 1; i < arr.length; i++) {
      const row = arr[i];
      if (!row || row.length < 2) continue;

      const year = Number(row[0]);
      if (!Number.isInteger(year) || year < 2017 || year > 2026) {
        console.warn(`[convert] sheet ${sheetName} row ${i + 1}: invalid year=${row[0]}, skip`);
        invalid++;
        continue;
      }

      for (let n = 1; n <= 20; n++) {
        const raw = row[n];
        const ans = Number(raw);
        if (!Number.isInteger(ans) || ans < 1 || ans > 5) {
          if (raw !== undefined && raw !== null && raw !== '') {
            console.warn(
              `[convert] ${sheetName} ${year} 번호=${n} answer=${raw} invalid, skip`,
            );
            invalid++;
          }
          continue;
        }

        db[subject] ??= {};
        db[subject][variant] ??= {};
        db[subject][variant][year] ??= {};
        db[subject][variant][year][n] = ans;
        valid++;
      }
    }
  }

  // TypeScript 파일 갱신
  const existing = readFileSync(TS_PATH, 'utf-8');
  const marker = 'export const SCIENCE_ANSWERS: ScienceAnswerDB = {';
  const startIdx = existing.indexOf(marker);
  if (startIdx === -1) {
    console.error('[convert] SCIENCE_ANSWERS marker not found');
    process.exit(1);
  }
  let depth = 0;
  let endIdx = startIdx + marker.length;
  while (endIdx < existing.length) {
    const c = existing[endIdx];
    if (c === '{') depth++;
    else if (c === '}') {
      if (depth === 0) {
        endIdx++;
        break;
      }
      depth--;
    }
    endIdx++;
  }
  while (endIdx < existing.length && existing[endIdx] !== ';') endIdx++;
  endIdx++;

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
        .sort((a, b) => b - a);
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
  console.log(`[convert] 출처: ${XLSX_PATH}`);
  console.log(`[convert] 갱신: ${TS_PATH}`);
}

main();
