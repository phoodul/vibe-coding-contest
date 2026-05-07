/**
 * 19차 (2026-05-07) — 1598 문제 영역 PNG → Vercel Blob 업로드.
 *
 * 입력: user_docs/suneung_science/questions/{subject}-{variant}/{year}/q-{N}.png
 * 출력:
 *   - Vercel Blob: suneung/q/{subject}-{variant}/{year}/q-{N}.png
 *   - manifest: src/lib/data/suneung-question-manifest.ts
 *
 * 결측 정답 2건 자동 제외 (출제 오류).
 *
 * 시간: 1598 PNG × ~3초 = ~80 분.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { put } from '@vercel/blob';

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

const ROOT = resolve(process.cwd(), 'user_docs/suneung_science/questions');
const MANIFEST_PATH = resolve(process.cwd(), 'src/lib/data/suneung-question-manifest.ts');

interface Entry {
  key: string;
  subject: string;
  variant: 'I' | 'II';
  year: number;
  number: number;
  src: string;
}

interface Uploaded {
  subject: string;
  variant: 'I' | 'II';
  year: number;
  number: number;
  url: string;
}

const MISSING = new Set<string>(['physics_II_2017_9', 'biology_II_2022_20']);

function findAll(): Entry[] {
  const out: Entry[] = [];
  if (!existsSync(ROOT)) return out;
  for (const dirName of readdirSync(ROOT)) {
    const dir = join(ROOT, dirName);
    if (!statSync(dir).isDirectory()) continue;
    const m = dirName.match(/^(.+)-(I|II)$/);
    if (!m) continue;
    const subject = m[1];
    const variant = m[2] as 'I' | 'II';
    for (const yearStr of readdirSync(dir)) {
      const yearDir = join(dir, yearStr);
      if (!statSync(yearDir).isDirectory()) continue;
      const year = parseInt(yearStr, 10);
      if (Number.isNaN(year)) continue;
      for (const fname of readdirSync(yearDir)) {
        const qm = fname.match(/^q-(\d+)\.png$/);
        if (!qm) continue;
        const number = parseInt(qm[1], 10);
        const key = `${subject}_${variant}_${year}_${number}`;
        if (MISSING.has(key)) continue;
        out.push({ key, subject, variant, year, number, src: join(yearDir, fname) });
      }
    }
  }
  return out;
}

function loadExisting(): Uploaded[] {
  if (!existsSync(MANIFEST_PATH)) return [];
  const content = readFileSync(MANIFEST_PATH, 'utf-8');
  const m = content.match(/export const SUNEUNG_QUESTIONS_RAW: UploadedEntry\[\] = (\[[\s\S]*?\]);/);
  if (!m) return [];
  try {
    return JSON.parse(m[1]);
  } catch {
    return [];
  }
}

function buildManifestTs(uploaded: Uploaded[]): string {
  const sorted = [...uploaded].sort((a, b) => {
    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
    if (a.variant !== b.variant) return a.variant.localeCompare(b.variant);
    if (a.year !== b.year) return b.year - a.year;
    return a.number - b.number;
  });
  return `/**
 * 19차 (2026-05-07) — 수능 과학 문제 영역 PNG → Vercel Blob 매니페스트.
 *
 * 자동 생성: scripts/upload-suneung-questions.ts
 * 수동 편집 금지 — 재실행 시 덮어씀.
 *
 * 1598 PNG (4 과목 × Ⅰ/Ⅱ × 10년 × 20문제, 결측 2건 출제 오류 제외).
 */
import type { Subject } from '@/lib/legend/types';
import type { ExamVariant } from './science-exam-answers';

interface UploadedEntry {
  subject: string;
  variant: 'I' | 'II';
  year: number;
  number: number;
  url: string;
}

export const SUNEUNG_QUESTIONS_RAW: UploadedEntry[] = ${JSON.stringify(sorted, null, 2)};

/** 한 문제의 영역 PNG URL — 없으면 undefined (정답 결측 또는 미업로드). */
export function getSuneungQuestionImage(
  subject: Subject,
  variant: ExamVariant,
  year: number,
  number: number,
): string | undefined {
  const e = SUNEUNG_QUESTIONS_RAW.find(
    (x) =>
      x.subject === subject &&
      x.variant === variant &&
      x.year === year &&
      x.number === number,
  );
  return e?.url;
}
`;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[upload-q] BLOB_READ_WRITE_TOKEN 없음');
    process.exit(1);
  }
  const all = findAll();
  console.log(`[upload-q] 영역 PNG: ${all.length} (결측 ${MISSING.size}건 제외)`);

  // 20차 — UPLOAD_FORCE=true 시 기존 manifest 무시하고 모두 재업로드 (footer cutoff 갱신용).
  // allowOverwrite: true 라 같은 pathname 에 새 PNG 가 덮어써짐 (URL 변경 없음).
  const force = process.env.UPLOAD_FORCE === 'true';
  const existing = force ? [] : loadExisting();
  const existingKeys = new Set(
    existing.map((e) => `${e.subject}_${e.variant}_${e.year}_${e.number}`),
  );
  const todo = all.filter((e) => !existingKeys.has(e.key));
  console.log(`[upload-q] 신규: ${todo.length} / 기존: ${existing.length}${force ? ' (force=true 무시)' : ''}`);

  const uploaded: Uploaded[] = [...existing];
  let count = 0;
  const start = Date.now();
  const SAVE_EVERY = 50;

  for (const e of todo) {
    const pathname = `suneung/q/${e.subject}-${e.variant}/${e.year}/q-${e.number}.png`;
    const buf = readFileSync(e.src);
    try {
      const blob = await put(pathname, buf, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      uploaded.push({
        subject: e.subject,
        variant: e.variant,
        year: e.year,
        number: e.number,
        url: blob.url,
      });
      count++;
      if (count % SAVE_EVERY === 0 || count === todo.length) {
        const dt = ((Date.now() - start) / 1000).toFixed(0);
        console.log(`  [${count}/${todo.length}] ${pathname} (${dt}s)`);
        writeFileSync(MANIFEST_PATH, buildManifestTs(uploaded), 'utf-8');
      }
    } catch (err) {
      console.error(`  ✗ ${pathname}: ${(err as Error).message}`);
    }
  }
  writeFileSync(MANIFEST_PATH, buildManifestTs(uploaded), 'utf-8');
  console.log(
    `\n[upload-q] OK — 신규 ${count} / 누적 ${uploaded.length} / ${((Date.now() - start) / 1000).toFixed(1)}s`,
  );
}

main().catch((e) => {
  console.error('[upload-q] 실패:', e);
  process.exit(1);
});
