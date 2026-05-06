/**
 * 19차 (2026-05-07) — 320 수능 PDF 페이지 PNG → Vercel Blob 업로드.
 *
 * 입력: user_docs/suneung_science/pages/{subject}-{variant}/{year}/page-{N}.png
 * 출력: blob URL (Vercel Blob CDN)
 *       + src/lib/data/suneung-pdf-manifest.ts (자동 생성)
 *
 * 사용:
 *   1. .env.local 에 BLOB_READ_WRITE_TOKEN 설정 (vercel env pull)
 *   2. npx tsx scripts/upload-suneung-blob.ts
 *
 * 시간: 320 PNG × ~1초 = ~5~10 분 (network).
 *
 * 재실행 안전: 이미 업로드된 PNG 는 manifest 가 있으면 skip.
 * 정답 결측 (출제 오류) 페이지는 업로드 X — 단, 페이지 단위 분할이라
 * 문제 번호 단위로 업로드 차단은 어려움 → 모두 업로드 + UI 에서 차단.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { put } from '@vercel/blob';

// .env.local 에서 BLOB_READ_WRITE_TOKEN 읽기
function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf-8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}
loadEnvLocal();

const PAGES_ROOT = resolve(process.cwd(), 'user_docs/suneung_science/pages');
const MANIFEST_PATH = resolve(process.cwd(), 'src/lib/data/suneung-pdf-manifest.ts');

interface PageEntry {
  subject: string;
  variant: 'I' | 'II';
  year: number;
  page: number;
  src: string; // 로컬 PNG 경로
}

interface UploadedEntry {
  subject: string;
  variant: 'I' | 'II';
  year: number;
  page: number;
  url: string;
}

function findAllPages(): PageEntry[] {
  const out: PageEntry[] = [];
  if (!existsSync(PAGES_ROOT)) return out;
  for (const dirName of readdirSync(PAGES_ROOT)) {
    const dir = join(PAGES_ROOT, dirName);
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
        const pm = fname.match(/^page-(\d+)\.png$/);
        if (!pm) continue;
        const page = parseInt(pm[1], 10);
        out.push({
          subject,
          variant,
          year,
          page,
          src: join(yearDir, fname),
        });
      }
    }
  }
  return out;
}

function loadExistingManifest(): UploadedEntry[] {
  if (!existsSync(MANIFEST_PATH)) return [];
  const content = readFileSync(MANIFEST_PATH, 'utf-8');
  const m = content.match(/export const SUNEUNG_PAGES_RAW: UploadedEntry\[\] = (\[[\s\S]*?\]);/);
  if (!m) return [];
  try {
    return JSON.parse(m[1]);
  } catch {
    return [];
  }
}

function buildManifestTs(uploaded: UploadedEntry[]): string {
  // sort: subject·variant·year(desc)·page
  uploaded = [...uploaded].sort((a, b) => {
    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
    if (a.variant !== b.variant) return a.variant.localeCompare(b.variant);
    if (a.year !== b.year) return b.year - a.year;
    return a.page - b.page;
  });

  const json = JSON.stringify(uploaded, null, 2);

  return `/**
 * 19차 (2026-05-07) — 수능 과학 PDF 페이지 → Vercel Blob 매니페스트.
 *
 * 자동 생성: scripts/upload-suneung-blob.ts
 * 수동 편집 금지 — 재실행 시 덮어씀.
 *
 * 320 PNG (4 과목 × Ⅰ/Ⅱ × 10년 × 평균 4 페이지).
 */
import type { Subject } from '@/lib/legend/types';
import type { ExamVariant } from './science-exam-answers';

interface UploadedEntry {
  subject: string;
  variant: 'I' | 'II';
  year: number;
  page: number;
  url: string;
}

export const SUNEUNG_PAGES_RAW: UploadedEntry[] = ${json};

/** 한 시험지의 모든 페이지 URL 배열 (page 순). */
export function getSuneungPages(
  subject: Subject,
  variant: ExamVariant,
  year: number,
): string[] {
  return SUNEUNG_PAGES_RAW.filter(
    (e) => e.subject === subject && e.variant === variant && e.year === year,
  )
    .sort((a, b) => a.page - b.page)
    .map((e) => e.url);
}

/**
 * 한 시험지에서 특정 문제 번호가 있을 가능성이 높은 페이지 URL 1개.
 * 가정: 5문제/페이지 (1~5→page-1, 6~10→page-2, 11~15→page-3, 16~20→page-4).
 * 정확도 ~80%+. 잘못된 페이지면 학생이 직접 캡쳐 추가.
 */
export function getSuneungPagesForNumber(
  subject: Subject,
  variant: ExamVariant,
  year: number,
  number: number,
): string[] {
  const allPages = getSuneungPages(subject, variant, year);
  if (allPages.length === 0) return [];
  const pageIndex = Math.min(
    Math.max(0, Math.ceil(number / 5) - 1),
    allPages.length - 1,
  );
  const url = allPages[pageIndex];
  return url ? [url] : [];
}
`;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[upload] BLOB_READ_WRITE_TOKEN 없음. .env.local 확인.');
    process.exit(1);
  }

  const all = findAllPages();
  console.log(`[upload] 발견 PNG: ${all.length}`);

  const existing = loadExistingManifest();
  const existingKeys = new Set(
    existing.map((e) => `${e.subject}-${e.variant}-${e.year}-${e.page}`),
  );
  console.log(`[upload] 기존 manifest: ${existing.length}`);

  const todo = all.filter(
    (e) => !existingKeys.has(`${e.subject}-${e.variant}-${e.year}-${e.page}`),
  );
  console.log(`[upload] 업로드 대상 (신규): ${todo.length}`);

  const uploaded: UploadedEntry[] = [...existing];
  let count = 0;
  const start = Date.now();

  for (const e of todo) {
    const pathname = `suneung/${e.subject}-${e.variant}/${e.year}/page-${e.page}.png`;
    const buf = readFileSync(e.src);
    try {
      const blob = await put(pathname, buf, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: false, // pathname 그대로 (재실행 시 같은 URL)
        allowOverwrite: true,
      });
      uploaded.push({
        subject: e.subject,
        variant: e.variant,
        year: e.year,
        page: e.page,
        url: blob.url,
      });
      count++;
      if (count % 20 === 0 || count === todo.length) {
        const dt = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`  [${count}/${todo.length}] ${pathname} (${dt}s 누적)`);
        // 중간 저장 — 크래시 시 재실행 안전
        writeFileSync(MANIFEST_PATH, buildManifestTs(uploaded), 'utf-8');
      }
    } catch (err) {
      console.error(`  ✗ ${pathname}: ${(err as Error).message}`);
    }
  }

  // 최종 manifest
  writeFileSync(MANIFEST_PATH, buildManifestTs(uploaded), 'utf-8');
  const totalSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n[upload] OK — 신규 ${count} / 누적 ${uploaded.length} / ${totalSec}s`);
  console.log(`[upload] manifest: ${MANIFEST_PATH}`);
}

main().catch((e) => {
  console.error('[upload] 실패:', e);
  process.exit(1);
});
