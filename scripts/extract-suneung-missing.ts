/**
 * 2026-05-06 — 수능 수학 problem-texts.json 누락 보완 스크립트.
 *
 * 배경: src/lib/data/problem-texts.json 에 18건이 누락되어 있음.
 *   - raw md (`user_docs/suneung-math/parsed/*.md`) 에 본문이 살아있는 12건 → 자동 추출
 *   - mathpix 본문 자체에서 누락된 6건 (2018_가형_4, 2020_가형_26, 2022_공통_3,
 *     2023_공통_3, 2025_공통_3, 2026_공통_4) → 본 스크립트로는 채울 수 없음.
 *     PDF 페이지를 별도 OCR/사람 입력으로 보완해야 함.
 *
 * 파싱 규칙:
 *   - 줄 시작이 `^N\.` (또는 `^N\.공백0~1`) 인 곳을 문제 N 의 시작점으로 본다.
 *   - 다음 문제 시작 또는 다음 섹션 헤더 (`## ...`) 직전까지를 본문으로 잘라낸다.
 *   - 본문 중간의 ![](https://...) 이미지 마커는 그대로 둔다 (학생용 채팅에서 무시되며,
 *     문제 식별에는 도움이 됨).
 *
 * 실행: `npx tsx scripts/extract-suneung-missing.ts`
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

interface MissingKey {
  year: number;
  type: string;
  number: number;
}

const MISSING_IN_RAW: MissingKey[] = [
  { year: 2017, type: '가형', number: 5 },
  { year: 2017, type: '나형', number: 18 },
  { year: 2018, type: '나형', number: 18 },
  { year: 2018, type: '나형', number: 30 },
  { year: 2019, type: '가형', number: 30 },
  { year: 2019, type: '나형', number: 28 },
  { year: 2019, type: '나형', number: 30 },
  { year: 2020, type: '나형', number: 19 },
  { year: 2021, type: '가형', number: 19 },
  { year: 2021, type: '가형', number: 30 },
  { year: 2021, type: '나형', number: 29 },
  { year: 2022, type: '공통', number: 10 },
];

const NOT_IN_RAW: MissingKey[] = [
  { year: 2018, type: '가형', number: 4 },
  { year: 2020, type: '가형', number: 26 },
  { year: 2022, type: '공통', number: 3 },
  { year: 2023, type: '공통', number: 3 },
  { year: 2025, type: '공통', number: 3 },
  { year: 2026, type: '공통', number: 4 },
];

function rawMdPath(year: number, type: string): string {
  if (year <= 2021) {
    return path.join('user_docs/suneung-math/parsed', `${year}수능_${type}_홀.md`);
  }
  return path.join('user_docs/suneung-math/parsed', `${year}수능문제.md`);
}

/**
 * 2022~2026 통합 md 는 한 파일에 공통 + 확통 + 미적분 + 기하 + 짝수회차 등이 섞여 있다.
 * 문제 번호로만 검색하면 같은 번호가 여러 섹션에 등장 → 첫 매칭이 공통 섹션이 맞도록 ##
 * 헤더 (특히 "## 5지선다형" 처음 등장 후 "## 단답형" 처음 등장) 영역을 우선 찾아간다.
 *
 * 본 함수는 단순히 첫 매칭만 가져온다 — 검증은 사람이 한다 (각 entry 의 [N점] 표기 확인).
 */
function extractProblem(md: string, num: number): string | null {
  // 줄 시작 `^N\.` 또는 `^N\.공백` 매칭. 다음 문제 시작 또는 ## 헤더 직전까지.
  // 줄바꿈 보존. m flag.
  const lines = md.split('\n');
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`^${num}\\.\\s*\\S`).test(lines[i]) || new RegExp(`^${num}\\.$`).test(lines[i])) {
      startIdx = i;
      break;
    }
  }
  if (startIdx < 0) return null;

  // 끝점: 다음 문제 시작 (^M.) 또는 ## 헤더
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^##\s/.test(l)) {
      endIdx = i;
      break;
    }
    // 다음 번호 (1~30 사이)
    const m = l.match(/^(\d+)\.\s*\S/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n !== num && n >= 1 && n <= 30) {
        endIdx = i;
        break;
      }
    }
  }

  let body = lines.slice(startIdx, endIdx).join('\n').trim();

  // 본문 중간의 그림 별도 페이지 마커 (![](...)) 는 보존 — 단, 끝에 매달린 이미지 줄은 제거.
  body = body.replace(/\n!\[\]\([^)]*\)\s*$/, '');
  return body;
}

function main() {
  const jsonPath = 'src/lib/data/problem-texts.json';
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as Record<string, string>;

  const summary: { added: string[]; failed: string[]; manual: string[] } = {
    added: [],
    failed: [],
    manual: NOT_IN_RAW.map((k) => `${k.year}_${k.type}_${k.number}`),
  };

  for (const k of MISSING_IN_RAW) {
    const key = `${k.year}_${k.type}_${k.number}`;
    if (data[key]) {
      console.log(`[skip] ${key} already present`);
      continue;
    }
    const md = fs.readFileSync(rawMdPath(k.year, k.type), 'utf-8');
    const body = extractProblem(md, k.number);
    if (!body) {
      summary.failed.push(key);
      console.log(`[fail] ${key} not found in ${rawMdPath(k.year, k.type)}`);
      continue;
    }
    data[key] = body;
    summary.added.push(key);
    console.log(`[ok]   ${key} (${body.length} chars)`);
  }

  // 정렬해서 저장 (기존 키 순서 유지하지 않고 사람이 읽기 편하게 정렬)
  const sortedKeys = Object.keys(data).sort();
  const sorted: Record<string, string> = {};
  for (const k of sortedKeys) sorted[k] = data[k];
  fs.writeFileSync(jsonPath, JSON.stringify(sorted) + '\n', 'utf-8');

  console.log('\n=== Summary ===');
  console.log(`added (raw md → JSON): ${summary.added.length}`);
  console.log(`failed (raw md 매칭 실패): ${summary.failed.length}`);
  console.log(`manual needed (raw md 본문 자체 누락): ${summary.manual.length}`);
  console.log(`  → ${summary.manual.join(', ')}`);
}

main();
