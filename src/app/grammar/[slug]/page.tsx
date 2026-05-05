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

function readLesson(slug: string): { fm: LessonFrontmatter; body: string } | null {
  // 슬러그 검증 — 영문/숫자/하이픈만
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');

  // frontmatter (---) 단순 파싱
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { fm: { slug }, body: raw };
  const fmText = fmMatch[1];
  const body = fmMatch[2];

  const raw_fm: Record<string, string | number> = { slug };
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

        {/* 설명 + 문제 풀이 탭 */}
        <LessonView body={parsed.body} quiz={parsed.quiz} nextNote={parsed.nextNote} />

        {/* 하단 — 목차 복귀 */}
        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/50">
          <Link href="/grammar" className="hover:text-white/80 transition-colors">
            ← 전체 커리큘럼
          </Link>
          <span className="text-white/30">다음 레슨은 곧 추가됩니다</span>
        </div>
      </div>
    </main>
  );
}
