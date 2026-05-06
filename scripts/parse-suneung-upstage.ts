/**
 * 19차 (2026-05-07) — Upstage Document Parse 로 1600 영역 PNG → markdown 추출.
 *
 * 입력: user_docs/suneung_science/questions/{subject}-{variant}/{year}/q-{N}.png
 * 출력: src/lib/data/suneung-problem-texts-science.json
 *   { "earth-science_I_2026_8": { "markdown": "..." } }
 *
 * Upstage Document Parse API:
 *   POST https://api.upstage.ai/v1/document-digitization/document-parse
 *   Authorization: Bearer ${UPSTAGE_API_KEY}
 *   Content-Type: multipart/form-data
 *   - document: file
 *   - model: 'document-parse'
 *   - ocr: 'force' (image input)
 *   - output_formats: ["markdown"]
 *
 * 비용: ~$0.005/page × 1598 = ~$8 (1회성). 결측 2건 (정답 없음) 제외.
 *
 * 재실행 안전: 이미 markdown 있으면 skip. 매 50장 중간 저장.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

// .env / .env.local 에서 env 읽기 (값에 공백·따옴표·대소문자 mix 허용)
function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = resolve(process.cwd(), name);
    if (!existsSync(p)) continue;
    const content = readFileSync(p, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx <= 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      if (!key || !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}
loadEnv();

const QUESTIONS_ROOT = resolve(process.cwd(), 'user_docs/suneung_science/questions');
const OUT_PATH = resolve(process.cwd(), 'src/lib/data/suneung-problem-texts-science.json');
const ANSWERS_PATH = resolve(process.cwd(), 'src/lib/data/science-exam-answers.ts');

const ENDPOINT = 'https://api.upstage.ai/v1/document-ai/document-parse';

interface ParsedProblem {
  markdown: string;
  parsed_at: string;
}

type ProblemDB = Record<string, ParsedProblem>;

interface Target {
  key: string; // earth-science_I_2026_8
  subject: string;
  variant: 'I' | 'II';
  year: number;
  number: number;
  src: string;
}

/** 정답 DB 에서 출제 오류 (정답 없음) 페어 추출 */
function getMissingAnswers(): Set<string> {
  // 단순 fix: 사용자 메모에서 명시한 2건만 hardcode
  // 향후 자동 검증 가능: ANSWERS_PATH parse → undefined 페어 extract
  return new Set<string>([
    'physics_II_2017_9',
    'biology_II_2022_20',
  ]);
}

function findAllTargets(): Target[] {
  const out: Target[] = [];
  if (!existsSync(QUESTIONS_ROOT)) return out;
  for (const dirName of readdirSync(QUESTIONS_ROOT)) {
    const dir = join(QUESTIONS_ROOT, dirName);
    const m = dirName.match(/^(.+)-(I|II)$/);
    if (!m) continue;
    const subject = m[1];
    const variant = m[2] as 'I' | 'II';
    for (const yearStr of readdirSync(dir)) {
      const yearDir = join(dir, yearStr);
      const year = parseInt(yearStr, 10);
      if (Number.isNaN(year)) continue;
      for (const fname of readdirSync(yearDir)) {
        const qm = fname.match(/^q-(\d+)\.png$/);
        if (!qm) continue;
        const number = parseInt(qm[1], 10);
        out.push({
          key: `${subject}_${variant}_${year}_${number}`,
          subject,
          variant,
          year,
          number,
          src: join(yearDir, fname),
        });
      }
    }
  }
  return out;
}

async function parseOne(file: string, apiKey: string): Promise<string> {
  const buf = readFileSync(file);
  const form = new FormData();
  form.append('document', new Blob([new Uint8Array(buf)], { type: 'image/png' }), 'q.png');
  form.append('model', 'document-parse');
  form.append('ocr', 'force');
  form.append('output_formats', '["markdown"]');
  form.append('coordinates', 'false');
  form.append('chart_recognition', 'true');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { content?: { markdown?: string }; markdown?: string };
  return data.content?.markdown ?? data.markdown ?? '';
}

async function main() {
  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    console.error('[upstage] UPSTAGE_API_KEY 없음 (.env / .env.local)');
    process.exit(1);
  }

  const filterSubject = process.argv[2];
  const limitArg = process.argv[3];
  const limit = limitArg ? parseInt(limitArg, 10) : undefined;

  const missing = getMissingAnswers();
  let targets = findAllTargets()
    .filter((t) => !missing.has(t.key))
    .filter((t) => !filterSubject || t.subject === filterSubject)
    .sort((a, b) => a.key.localeCompare(b.key));

  if (limit) targets = targets.slice(0, limit);

  console.log(
    `[upstage] 대상 ${targets.length} (출제 오류 ${missing.size}건 자동 제외)`,
  );

  const db: ProblemDB = existsSync(OUT_PATH)
    ? (JSON.parse(readFileSync(OUT_PATH, 'utf-8')) as ProblemDB)
    : {};

  const remaining = targets.filter((t) => !db[t.key]);
  console.log(`[upstage] 신규 (이미 parsed 제외): ${remaining.length}`);

  let count = 0;
  let failed = 0;
  const start = Date.now();
  const SAVE_EVERY = 50;

  for (const t of remaining) {
    try {
      const markdown = await parseOne(t.src, apiKey);
      db[t.key] = { markdown, parsed_at: new Date().toISOString() };
      count++;
      if (count % SAVE_EVERY === 0 || count === remaining.length) {
        const dt = ((Date.now() - start) / 1000).toFixed(0);
        console.log(`  [${count}/${remaining.length}] ${t.key} (${dt}s 누적)`);
        writeFileSync(OUT_PATH, JSON.stringify(db, null, 2), 'utf-8');
      }
    } catch (e) {
      failed++;
      console.error(`  ✗ ${t.key}: ${(e as Error).message}`);
    }
  }
  writeFileSync(OUT_PATH, JSON.stringify(db, null, 2), 'utf-8');

  const totalSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\n[upstage] OK — 신규 ${count} / 실패 ${failed} / ${totalSec}s`,
  );
  console.log(`[upstage] 출력: ${OUT_PATH}`);
  console.log(`[upstage] 누적 DB: ${Object.keys(db).length}/${targets.length}`);
}

main().catch((e) => {
  console.error('[upstage] 실패:', e);
  process.exit(1);
});

void ANSWERS_PATH; // 향후 정답 DB 자동 결측 검출 시 사용
