'use client';

/**
 * 헤밍웨이 영문법 코치 — 메인 페이지 (v2 텍스트북 컨셉, 2026-05-04).
 *
 * v2 컨셉 (사용자 결정): 정해진 커리큘럼 (75 레슨) 기반 텍스트북 학습.
 *   - 챕터 → 레슨 설명 스트리밍 → 대표 문장 외우기 → 실전 문제 5개 → 다음
 *   - 영어 단어 학습 (18,000 단어 에베레스트) 모델과 동일 구조
 *   - LLM 호출 X (정적 MDX 컨텐츠) — 비용 0
 *
 * 현재 상태:
 *   - 75 레슨 커리큘럼 확정 (docs/grammar-curriculum.md)
 *   - 샘플 1 레슨 작성 (3-4 tense-perfect-vs-past) — content/grammar/ 디렉토리
 *   - 메인 페이지 = 14 단원 / 75 레슨 목차 + "샘플 레슨 보기" CTA
 *   - 진도 추적 DB / 레슨 뷰어 / 외우기 UI / 5문제 테스트 → Step 3 별도 commit
 */
import { motion } from 'framer-motion';
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

export default function GrammarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-stone-950 to-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300/30 to-orange-500/30 ring-2 ring-amber-300/40 flex items-center justify-center text-3xl">
              ✒️
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                헤밍웨이 영문법
              </h1>
              <p className="text-xs text-white/50 mt-0.5">정확함 위에 단순함</p>
            </div>
          </motion.div>
          <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xl mx-auto">
            한국 영문법 표준 14 단원 / {TOTAL_LESSONS} 레슨. 챕터별로 텍스트북 설명을 읽고,
            <br />
            대표 문장 한 개를 외우고, 실전 문제 5개로 점검합니다.
          </p>
        </header>

        {/* 14 단원 목차 카드 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/70">전체 커리큘럼</h2>
            <span className="text-xs text-white/40">{TOTAL_LESSONS} 레슨 / 약 200 페이지</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNITS.map((u, i) => (
              <motion.div
                key={u.index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:border-amber-300/30 transition-colors"
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
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 샘플 레슨 CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-amber-400/30 bg-amber-400/5 backdrop-blur-md p-5 text-sm text-white/80 leading-relaxed"
        >
          <p className="font-semibold text-amber-200 mb-2">🚧 컨텐츠 작성 중</p>
          <p className="mb-3">
            현재 14 단원 / {TOTAL_LESSONS} 레슨 커리큘럼이 확정됐고, 샘플 1 레슨 (3-4
            현재완료 vs 단순과거) 의 quality 검토 단계입니다. 사용자 승인 후 나머지
            74 레슨이 progressive commit 으로 채워집니다.
          </p>
          <p className="text-xs text-white/60">
            진도 추적·레슨 뷰어·외우기 카드·5문제 테스트 UI 는 Step 3 에서 별도
            구현됩니다. 베타 사용자는{' '}
            <Link href="/legend/beta" className="text-amber-300 underline hover:text-amber-200">
              Legend Tutor 베타 신청
            </Link>{' '}
            과 동일 계정으로 자동 액세스됩니다.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
