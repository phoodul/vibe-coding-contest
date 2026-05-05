/**
 * /grammar/[slug] — 헤밍웨이 영문법 레슨 뷰어 (Server Component).
 *
 * content/grammar/<slug>.md 를 읽어 frontmatter 파싱 + 본문 렌더.
 * 누구나 열람 가능 (auth 가드 없음). 향후 유료 전환 시 게이트 도입 예정.
 */
import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LessonView } from '@/components/grammar/LessonView';
import { parseLessonMdx } from '@/lib/grammar/parse-lesson';

interface LessonFrontmatter {
  slug: string;
  unit?: string;
  unit_index?: number;
  unit_title?: string;
  lesson_index?: number;
  lesson_title?: string;
  grade?: string;
  estimated_minutes?: number;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'grammar');

function parseFrontmatter(raw: string): { fm: LessonFrontmatter; body: string } | null {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return null;
  const fmText = fmMatch[1];
  const body = fmMatch[2];
  const raw_fm: Record<string, string | number> = {};
  for (const line of fmText.split('\n')) {
    const m = line.match(/^([\w_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const value = m[2].trim();
    if (key === 'unit_index' || key === 'lesson_index' || key === 'estimated_minutes') {
      raw_fm[key] = parseInt(value, 10);
    } else {
      raw_fm[key] = value;
    }
  }
  return { fm: raw_fm as unknown as LessonFrontmatter, body };
}

function readLesson(slug: string): { fm: LessonFrontmatter; body: string } | null {
  // 슬러그 검증 — 영문/숫자/하이픈만
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { fm: { slug }, body: raw };
  // frontmatter slug 가 있으면 그것을 우선 (수능 매핑은 frontmatter slug 기준).
  // 없으면 파일명 slug 사용.
  return { fm: { ...parsed.fm, slug: parsed.fm.slug || slug }, body: parsed.body };
}

interface AdjacentLesson {
  slug: string;
  title: string;
  unitIndex: number;
  lessonIndex: number;
}

/** content/grammar 디렉터리 스캔 → 단원·레슨 인덱스 정렬 → 현재 슬러그 기준 prev/next 반환. */
function getAdjacentLessons(currentSlug: string): {
  prev: AdjacentLesson | null;
  next: AdjacentLesson | null;
} {
  if (!fs.existsSync(CONTENT_DIR)) return { prev: null, next: null };
  const all: AdjacentLesson[] = [];
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const parsed = parseFrontmatter(raw);
    if (!parsed) continue;
    const { fm } = parsed;
    all.push({
      slug,
      title: fm.lesson_title ?? slug,
      unitIndex: fm.unit_index ?? 0,
      lessonIndex: fm.lesson_index ?? 0,
    });
  }
  all.sort((a, b) => a.unitIndex - b.unitIndex || a.lessonIndex - b.lessonIndex);
  const idx = all.findIndex((l) => l.slug === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace(/\.md$/, '') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = readLesson(slug);
  if (!lesson) return { title: '레슨 없음 | 헤밍웨이 영문법' };
  const title = lesson.fm.lesson_title ?? slug;
  return { title: `${title} | 헤밍웨이 영문법` };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = readLesson(slug);
  if (!lesson) notFound();

  const { fm, body } = lesson;
  const parsed = parseLessonMdx(body);
  const { prev, next } = getAdjacentLessons(slug);
  const unitLabel =
    fm.unit_index && fm.unit_title
      ? `단원 ${String(fm.unit_index).padStart(2, '0')} · ${fm.unit_title}`
      : fm.unit_title ?? '';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-stone-950 to-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* 상단 nav */}
        <nav className="mb-6 flex items-center gap-3 text-xs text-white/50">
          <Link href="/grammar" className="hover:text-white/80 transition-colors">
            ← 헤밍웨이 영문법
          </Link>
          {unitLabel && (
            <>
              <span className="text-white/20">·</span>
              <span>{unitLabel}</span>
            </>
          )}
        </nav>

        {/* 헤더 */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[11px] text-amber-300/80 mb-2">
            {fm.lesson_index && (
              <span className="font-mono">
                {String(fm.unit_index ?? 0).padStart(2, '0')}-
                {String(fm.lesson_index).padStart(2, '0')}
              </span>
            )}
            {fm.grade && <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5">{fm.grade}</span>}
            {fm.estimated_minutes && (
              <span className="text-white/40">약 {fm.estimated_minutes}분</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
            {fm.lesson_title ?? slug}
          </h1>
        </header>

        {/* 설명 + 문제 풀이 탭 — slug 는 frontmatter 의 slug 사용 (수능 매핑 키) */}
        <LessonView body={parsed.body} quiz={parsed.quiz} nextNote={parsed.nextNote} slug={fm.slug ?? slug} />

        {/* 하단 — 이전 / 목차 / 다음 레슨 */}
        <nav className="mt-12 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
          {prev ? (
            <Link
              href={`/grammar/${prev.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-3 hover:border-amber-300/40 hover:bg-amber-400/5 transition-colors group"
            >
              <div className="text-[10px] text-white/40 mb-0.5">← 이전 레슨</div>
              <div className="text-xs text-white/70 group-hover:text-amber-100 truncate">
                <span className="font-mono mr-1">
                  {String(prev.unitIndex).padStart(2, '0')}-
                  {String(prev.lessonIndex).padStart(2, '0')}
                </span>
                {prev.title}
              </div>
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/grammar"
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
          >
            📚 전체 커리큘럼
          </Link>

          {next ? (
            <Link
              href={`/grammar/${next.slug}`}
              className="rounded-xl border border-amber-300/30 bg-amber-400/5 p-3 hover:border-amber-300/60 hover:bg-amber-400/10 transition-colors group text-right"
            >
              <div className="text-[10px] text-amber-300/70 mb-0.5">다음 레슨 →</div>
              <div className="text-xs text-amber-100/90 group-hover:text-amber-50 truncate">
                <span className="font-mono mr-1">
                  {String(next.unitIndex).padStart(2, '0')}-
                  {String(next.lessonIndex).padStart(2, '0')}
                </span>
                {next.title}
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/40 text-right">
              🎉 마지막 레슨
            </div>
          )}
        </nav>
      </div>
    </main>
  );
}
