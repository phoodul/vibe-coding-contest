/**
 * 헤밍웨이 영문법 코치 — 메인 페이지 (Server Component).
 *
 * v2 컨셉: 14 단원 / 75 레슨 텍스트북 학습. 누구나 열람 가능 (베타 신청 X).
 * 향후 유료 전환 시점에 게이트 도입 결정.
 *
 * 현재 가용 레슨은 content/grammar/<slug>.md 파일 존재 여부로 검출.
 */
import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';

interface UnitMeta {
  index: number;
  title: string;
  lessons: number;
  grade: string;
  icon: string;
}

const UNITS: UnitMeta[] = [
  { index: 1, title: '품사 기초', lessons: 8, grade: '중1~중2', icon: '🧱' },
  { index: 2, title: '문장 5형식', lessons: 5, grade: '중2', icon: '🏗️' },
  { index: 3, title: '시제', lessons: 10, grade: '중2~고1', icon: '⏱️' },
  { index: 4, title: '조동사', lessons: 6, grade: '중3~고1', icon: '🪶' },
  { index: 5, title: '부정사', lessons: 5, grade: '고1', icon: '🌱' },
  { index: 6, title: '동명사', lessons: 4, grade: '고1', icon: '🌾' },
  { index: 7, title: '분사', lessons: 5, grade: '고1~고2', icon: '🍃' },
  { index: 8, title: '관계사', lessons: 6, grade: '고1~고2', icon: '🔗' },
  { index: 9, title: '가정법', lessons: 6, grade: '고2~고3', icon: '🌀' },
  { index: 10, title: '수동태', lessons: 5, grade: '고1~고2', icon: '🔄' },
  { index: 11, title: '비교', lessons: 4, grade: '중3~고1', icon: '⚖️' },
  { index: 12, title: '일치·화법', lessons: 4, grade: '고1~고2', icon: '🎯' },
  { index: 13, title: '도치·강조·부정·생략', lessons: 4, grade: '고2~고3', icon: '🏛️' },
  { index: 14, title: '명사·관사·수일치 보강', lessons: 3, grade: '보충', icon: '📌' },
];

const TOTAL_LESSONS = UNITS.reduce((s, u) => s + u.lessons, 0);

interface AvailableLesson {
  slug: string;
  title: string;
  unitIndex: number;
  lessonIndex: number;
  grade?: string;
  estimatedMinutes?: number;
}

function getAvailableLessons(): AvailableLesson[] {
  const dir = path.join(process.cwd(), 'content', 'grammar');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const lessons: AvailableLesson[] = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      lessons.push({ slug, title: slug, unitIndex: 0, lessonIndex: 0 });
      continue;
    }
    const fm: Record<string, string> = {};
    for (const line of fmMatch[1].split('\n')) {
      const m = line.match(/^([\w_]+):\s*(.*)$/);
      if (m) fm[m[1]] = m[2].trim();
    }
    lessons.push({
      slug,
      title: fm.lesson_title ?? slug,
      unitIndex: fm.unit_index ? parseInt(fm.unit_index, 10) : 0,
      lessonIndex: fm.lesson_index ? parseInt(fm.lesson_index, 10) : 0,
      grade: fm.grade,
      estimatedMinutes: fm.estimated_minutes ? parseInt(fm.estimated_minutes, 10) : undefined,
    });
  }
  return lessons.sort(
    (a, b) => a.unitIndex - b.unitIndex || a.lessonIndex - b.lessonIndex,
  );
}

export const metadata = {
  title: '헤밍웨이 영문법 코치 | EasyEdu AI',
  description:
    '한국 영문법 표준 14 단원 / 75 레슨 텍스트북. 누구나 무료로 열람 가능. 정확함 위에 단순함.',
};

export const dynamic = 'force-static';

export default function GrammarPage() {
  const available = getAvailableLessons();
  const availableByUnit = new Map<number, AvailableLesson[]>();
  for (const l of available) {
    const arr = availableByUnit.get(l.unitIndex) ?? [];
    arr.push(l);
    availableByUnit.set(l.unitIndex, arr);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-stone-950 to-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300/30 to-orange-500/30 ring-2 ring-amber-300/40 flex items-center justify-center text-3xl">
              ✒️
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                헤밍웨이 영문법
              </h1>
              <p className="text-xs text-white/50 mt-0.5">정확함 위에 단순함</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xl mx-auto">
            한국 영문법 표준 14 단원 / {TOTAL_LESSONS} 레슨. 챕터별로 텍스트북 설명을 읽고,
            <br />
            대표 문장 한 개를 외우고, 실전 문제 5개로 점검합니다.
          </p>
          <p className="mt-3 text-[11px] text-amber-300/70">
            현재 무료로 누구나 열람 가능 · 작성된 {available.length} / {TOTAL_LESSONS} 레슨
          </p>
        </header>

        {/* 가용 레슨 빠른 진입 (있을 때만) */}
        {available.length > 0 && (
          <section className="mb-10 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
            <h2 className="text-sm font-semibold text-amber-200 mb-3">📖 지금 읽을 수 있는 레슨</h2>
            <div className="space-y-2">
              {available.map((l) => (
                <Link
                  key={l.slug}
                  href={`/grammar/${l.slug}`}
                  className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:border-amber-300/50 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-amber-300/80">
                      {String(l.unitIndex).padStart(2, '0')}-
                      {String(l.lessonIndex).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-white flex-1">{l.title}</span>
                    {l.estimatedMinutes && (
                      <span className="text-[11px] text-white/50">약 {l.estimatedMinutes}분</span>
                    )}
                    <span className="text-amber-300/60 text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 14 단원 목차 카드 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/70">전체 커리큘럼</h2>
            <span className="text-xs text-white/40">{TOTAL_LESSONS} 레슨 / 약 200 페이지</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNITS.map((u) => {
              const unitAvailable = availableByUnit.get(u.index) ?? [];
              const isReady = unitAvailable.length > 0;
              return (
                <div
                  key={u.index}
                  className={`rounded-xl border p-4 transition-colors ${
                    isReady
                      ? 'border-amber-300/30 bg-amber-400/5 hover:border-amber-300/50'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{u.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-amber-300/70 font-mono">
                          {String(u.index).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-semibold text-white">{u.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-white/50">
                        <span>{u.lessons} 레슨</span>
                        <span>·</span>
                        <span>{u.grade}</span>
                        <span>·</span>
                        <span className={isReady ? 'text-amber-300' : 'text-white/30'}>
                          {isReady ? `${unitAvailable.length} 공개` : '준비 중'}
                        </span>
                      </div>
                      {isReady && (
                        <ul className="mt-2 space-y-0.5">
                          {unitAvailable.map((l) => (
                            <li key={l.slug}>
                              <Link
                                href={`/grammar/${l.slug}`}
                                className="text-[11px] text-amber-200/80 hover:text-amber-100 hover:underline"
                              >
                                {l.lessonIndex}. {l.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 안내 — 향후 유료 전환 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 text-sm text-white/70 leading-relaxed">
          <p className="font-semibold text-white mb-2">📝 진행 안내</p>
          <ul className="text-xs text-white/60 space-y-1.5 list-disc pl-4">
            <li>현재 작성된 레슨은 위 "지금 읽을 수 있는 레슨" 에서 모두 무료로 열람할 수 있어요.</li>
            <li>나머지 레슨은 같은 형식으로 점진적으로 추가됩니다 (단원 → 레슨 800~1500자 + 대표 문장 + 5문제).</li>
            <li>향후 진도 추적·외우기 카드·5문제 인터랙티브 테스트 UI 가 추가될 예정이며, 그 시점에 무료 열람 범위와 유료 전환 정책을 결정합니다.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
