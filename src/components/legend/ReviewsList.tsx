'use client';

/**
 * Phase G-06 G06-34 (Δ11) — 공개 리뷰 카드 목록.
 */
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PORTRAITS } from '@/lib/legend/portraits';
import type { BetaReview, TutorName } from '@/lib/legend/types';

const TUTOR_KEY_MAP: Record<string, TutorName> = {
  ramanujan: 'ramanujan_intuit',
  gauss: 'gauss',
  von_neumann: 'von_neumann',
  euler: 'euler',
  leibniz: 'leibniz',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-amber-300 text-sm tracking-wider">
      {'★'.repeat(rating)}
      <span className="text-white/15">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ReviewsList({ reviews }: { reviews: BetaReview[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-12 text-center">
        <p className="text-white/40 text-sm">표시할 후기가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reviews.map((r, idx) => {
        const tutorKey = TUTOR_KEY_MAP[r.recommended_tutor] ?? 'ramanujan_intuit';
        const portrait = PORTRAITS[tutorKey];
        return (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.4) }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:border-amber-300/30 transition-colors"
          >
            {/* 헤더: 별점 + 추천 튜터 + 구매 의향 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  width={32}
                  height={32}
                  className="rounded-full object-cover ring-1 ring-amber-400/30"
                />
                <div className="leading-tight">
                  <div className="text-xs font-medium text-white">
                    {portrait.label_ko} 추천
                  </div>
                  <StarRow rating={r.star_rating} />
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  r.purchase_intent
                    ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/30'
                    : 'bg-rose-400/10 text-rose-200/80 border border-rose-400/20'
                }`}
              >
                {r.purchase_intent ? '구매 의향 ◯' : '구매 의향 ✕'}
              </span>
            </div>

            {/* 장점 */}
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-emerald-300/70 mb-1">
                좋았던 점
              </p>
              <p className="text-sm text-white/85 leading-relaxed line-clamp-4">
                {r.pros}
              </p>
            </div>

            {/* 단점 */}
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-rose-300/70 mb-1">
                아쉬운 점
              </p>
              <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
                {r.cons}
              </p>
            </div>

            {/* 자유 코멘트 */}
            {r.free_comment && (
              <div className="mb-3 pt-3 border-t border-white/5">
                <p className="text-xs italic text-white/60 leading-relaxed">
                  &ldquo;{r.free_comment}&rdquo;
                </p>
              </div>
            )}

            {/* 푸터: 날짜 */}
            <div className="text-[10px] text-white/30 text-right">
              {formatDate(r.submitted_at)}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
