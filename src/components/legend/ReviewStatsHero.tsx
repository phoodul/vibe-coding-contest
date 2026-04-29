'use client';

/**
 * Phase G-06 G06-34 (Δ11) — 공개 리뷰 페이지 핵심 지표 카드.
 *
 * 표시:
 *   - 총 리뷰 수
 *   - 평균 별점 ⭐
 *   - 구매 의향 %
 *   - 추천 튜터 분포 (간단 막대)
 */
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PORTRAITS } from '@/lib/legend/portraits';
import type { BetaReviewStats, TutorName } from '@/lib/legend/types';

const TUTOR_KEY_MAP: Record<string, TutorName> = {
  ramanujan: 'ramanujan_intuit',
  gauss: 'gauss',
  von_neumann: 'von_neumann',
  euler: 'euler',
  leibniz: 'leibniz',
};

export function ReviewStatsHero({ stats }: { stats: BetaReviewStats }) {
  const totalDist = Object.values(stats.tutor_distribution).reduce(
    (a, b) => a + b,
    0,
  );

  if (stats.total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center"
      >
        <p className="text-white/50 text-sm">아직 공개된 후기가 없습니다.</p>
        <p className="text-white/30 text-xs mt-1">
          베타 사용자의 첫 후기를 기다리고 있어요.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 평균 별점 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-orange-400/5 backdrop-blur-md p-6 text-center"
      >
        <p className="text-xs text-amber-200/80 uppercase tracking-wider mb-2">
          평균 별점
        </p>
        <div className="text-4xl font-bold text-amber-300">
          ★ {Number(stats.avg_rating).toFixed(2)}
        </div>
        <p className="text-xs text-white/40 mt-2">총 {stats.total}개 후기</p>
      </motion.div>

      {/* 구매 의향 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 backdrop-blur-md p-6 text-center"
      >
        <p className="text-xs text-emerald-200/80 uppercase tracking-wider mb-2">
          구매 의향
        </p>
        <div className="text-4xl font-bold text-emerald-300">
          {Number(stats.purchase_intent_rate).toFixed(1)}%
        </div>
        <p className="text-xs text-white/40 mt-2">출시 시 구매 응답</p>
      </motion.div>

      {/* 추천 튜터 분포 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-400/10 to-fuchsia-400/5 backdrop-blur-md p-6"
      >
        <p className="text-xs text-violet-200/80 uppercase tracking-wider mb-3 text-center">
          추천 튜터 TOP
        </p>
        <div className="space-y-1.5">
          {Object.entries(stats.tutor_distribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([key, count]) => {
              const tutorKey = TUTOR_KEY_MAP[key] ?? 'ramanujan_intuit';
              const portrait = PORTRAITS[tutorKey];
              const ratio = totalDist > 0 ? (count / totalDist) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <Image
                    src={portrait.src}
                    alt={portrait.alt}
                    width={24}
                    height={24}
                    className="rounded-full object-cover ring-1 ring-white/20"
                  />
                  <span className="text-xs text-white/80 w-14 truncate">
                    {portrait.label_ko}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                    />
                  </div>
                  <span className="text-[10px] text-white/50 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
