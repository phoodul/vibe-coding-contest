'use client';

/**
 * Phase G-06 G06-34 (Δ11) — 베타 리뷰 5 항목 폼.
 *
 * 베이스 문서: docs/project-decisions.md Δ11.
 *
 * 구성:
 *   1. 별점 (interactive 5-star, Framer Motion)
 *   2. 추천 튜터 (5 카드, TutorBadge 패턴)
 *   3. 구매 의향 Y/N (토글)
 *   4. 장점 textarea (30자+ 카운터)
 *   5. 단점 textarea (20자+ 카운터)
 *   6. (옵션) 자유 코멘트
 *   7. (옵션) 공개/비공개 토글 (default 공개)
 *
 * 제출 → POST /api/legend/beta/review.
 * 기존 리뷰 있으면 수정 모드 (existing prop 으로 채워짐).
 */
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PORTRAITS } from '@/lib/legend/portraits';
import type {
  BetaReview,
  RecommendedTutor,
  TutorName,
} from '@/lib/legend/types';

const TUTOR_OPTIONS: Array<{ value: RecommendedTutor; portraitKey: TutorName }> = [
  { value: 'ramanujan', portraitKey: 'ramanujan_intuit' },
  { value: 'gauss', portraitKey: 'gauss' },
  { value: 'von_neumann', portraitKey: 'von_neumann' },
  { value: 'euler', portraitKey: 'euler' },
  { value: 'leibniz', portraitKey: 'leibniz' },
];

interface FormState {
  pros: string;
  cons: string;
  purchaseIntent: boolean | null;
  recommendedTutor: RecommendedTutor | null;
  starRating: number;
  freeComment: string;
  isPublic: boolean;
}

function initFormState(existing: BetaReview | null): FormState {
  if (!existing) {
    return {
      pros: '',
      cons: '',
      purchaseIntent: null,
      recommendedTutor: null,
      starRating: 0,
      freeComment: '',
      isPublic: true,
    };
  }
  return {
    pros: existing.pros,
    cons: existing.cons,
    purchaseIntent: existing.purchase_intent,
    recommendedTutor: existing.recommended_tutor,
    starRating: existing.star_rating,
    freeComment: existing.free_comment ?? '',
    isPublic: existing.is_public,
  };
}

export function BetaReviewForm({ existing }: { existing: BetaReview | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initFormState(existing));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(existing !== null);

  const isEditing = existing !== null;

  const prosOk = form.pros.trim().length >= 30;
  const consOk = form.cons.trim().length >= 20;
  const tutorOk = form.recommendedTutor !== null;
  const intentOk = form.purchaseIntent !== null;
  const ratingOk = form.starRating >= 1 && form.starRating <= 5;
  const canSubmit = prosOk && consOk && tutorOk && intentOk && ratingOk && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/legend/beta/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pros: form.pros.trim(),
          cons: form.cons.trim(),
          purchase_intent: form.purchaseIntent,
          recommended_tutor: form.recommendedTutor,
          star_rating: form.starRating,
          free_comment: form.freeComment.trim() || null,
          is_public: form.isPublic,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
          error?: string;
        };
        setError(body.message ?? body.error ?? '제출에 실패했습니다.');
        return;
      }

      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '네트워크 오류');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted && !isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-400/40 bg-emerald-400/5 backdrop-blur-md p-8 text-center"
      >
        <div className="text-5xl mb-3">✅</div>
        <h2 className="text-xl font-bold text-emerald-200 mb-2">감사합니다!</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          소중한 후기가 저장되었습니다.
          <br />
          출시 시점에 다른 베타 사용자들의 후기와 함께 공개됩니다.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 rounded-full border border-white/20 text-sm text-white/80 hover:bg-white/5 transition-colors"
          >
            수정하기
          </button>
          <Link
            href="/legend/reviews"
            className="px-4 py-2 rounded-full border border-amber-400/40 bg-amber-400/10 text-sm text-amber-200 hover:bg-amber-400/20 transition-colors"
          >
            공개 리뷰 보러가기 →
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. 별점 */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          1. 별점 <span className="text-rose-300">*</span>
        </h2>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button
              key={n}
              type="button"
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setForm((f) => ({ ...f, starRating: n }))}
              className="text-4xl transition-colors"
              aria-label={`별점 ${n}점`}
              data-testid={`star-${n}`}
            >
              <span
                className={
                  n <= form.starRating ? 'text-amber-300' : 'text-white/20'
                }
              >
                ★
              </span>
            </motion.button>
          ))}
          <span className="ml-3 text-sm text-white/60">
            {form.starRating > 0 ? `${form.starRating} / 5` : '별점을 선택하세요'}
          </span>
        </div>
      </section>

      {/* 2. 추천 튜터 */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          2. 가장 추천하는 튜터 <span className="text-rose-300">*</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {TUTOR_OPTIONS.map(({ value, portraitKey }) => {
            const p = PORTRAITS[portraitKey];
            const active = form.recommendedTutor === value;
            return (
              <motion.button
                key={value}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  setForm((f) => ({ ...f, recommendedTutor: value }))
                }
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                  active
                    ? 'border-amber-300/60 bg-amber-400/10 ring-2 ring-amber-300/30'
                    : 'border-white/10 bg-white/5 hover:border-amber-300/40'
                }`}
                data-testid={`tutor-${value}`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={48}
                  height={48}
                  className="rounded-full object-cover ring-2 ring-white/10"
                />
                <span className="text-xs font-medium text-white">{p.label_ko}</span>
                <span className="text-[9px] text-white/50 leading-tight text-center">
                  {p.tier_label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 3. 구매 의향 */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          3. 출시되면 구매하시겠습니까? <span className="text-rose-300">*</span>
        </h2>
        <div className="flex gap-3">
          {[
            { val: true, label: '예 — 구매하겠습니다', emoji: '👍' },
            { val: false, label: '아니오 — 망설여집니다', emoji: '🤔' },
          ].map(({ val, label, emoji }) => {
            const active = form.purchaseIntent === val;
            return (
              <motion.button
                key={String(val)}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setForm((f) => ({ ...f, purchaseIntent: val }))}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  active
                    ? val
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200 ring-2 ring-emerald-300/30'
                      : 'border-rose-400/60 bg-rose-400/10 text-rose-200 ring-2 ring-rose-300/30'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                }`}
                data-testid={`intent-${val}`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-medium">{label}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 4. 장점 */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">
            4. 장점 <span className="text-rose-300">*</span>
          </h2>
          <span
            className={`text-xs ${
              prosOk ? 'text-emerald-300' : 'text-white/40'
            }`}
          >
            {form.pros.trim().length} / 30자 이상
          </span>
        </div>
        <textarea
          value={form.pros}
          onChange={(e) => setForm((f) => ({ ...f, pros: e.target.value }))}
          rows={4}
          placeholder="가장 좋았던 점을 솔직하게 적어주세요. (예: 사고 흐름 진단이 정확해서 풀이 정리가 명확하다.)"
          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
          data-testid="pros-textarea"
        />
      </section>

      {/* 5. 단점 */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">
            5. 단점 <span className="text-rose-300">*</span>
          </h2>
          <span
            className={`text-xs ${
              consOk ? 'text-emerald-300' : 'text-white/40'
            }`}
          >
            {form.cons.trim().length} / 20자 이상
          </span>
        </div>
        <textarea
          value={form.cons}
          onChange={(e) => setForm((f) => ({ ...f, cons: e.target.value }))}
          rows={3}
          placeholder="아쉬웠던 점이나 개선이 필요한 부분을 적어주세요."
          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
          data-testid="cons-textarea"
        />
      </section>

      {/* 6. 자유 코멘트 (옵션) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-base font-semibold text-white mb-3">
          6. 자유 코멘트 <span className="text-white/40 text-xs">(선택)</span>
        </h2>
        <textarea
          value={form.freeComment}
          onChange={(e) =>
            setForm((f) => ({ ...f, freeComment: e.target.value }))
          }
          rows={3}
          placeholder="추가로 전하고 싶은 이야기가 있으면 자유롭게 적어주세요."
          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
        />
      </section>

      {/* 7. 공개/비공개 */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) =>
              setForm((f) => ({ ...f, isPublic: e.target.checked }))
            }
            className="mt-1 w-4 h-4 accent-amber-400"
            data-testid="is-public"
          />
          <div>
            <div className="text-sm font-medium text-white">
              공개 후기로 활용 동의
            </div>
            <p className="text-xs text-white/50 mt-1">
              체크 시 출시 시점에 /legend/reviews 페이지에 인용될 수 있습니다.
              비공개 시 통계만 반영되며 본문은 노출되지 않습니다.
            </p>
          </div>
        </label>
      </section>

      {/* 에러 */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-200"
        >
          {error}
        </motion.div>
      )}

      {/* 제출 */}
      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/legend"
          className="px-5 py-3 rounded-full border border-white/20 text-sm text-white/70 hover:bg-white/5 transition-colors"
        >
          취소
        </Link>
        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileHover={canSubmit ? { y: -2 } : undefined}
          whileTap={canSubmit ? { scale: 0.97 } : undefined}
          className={`px-6 py-3 rounded-full font-semibold text-sm transition-colors ${
            canSubmit
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
          }`}
          data-testid="submit-review"
        >
          {submitting
            ? '제출 중...'
            : isEditing
              ? '후기 수정 저장'
              : '후기 제출하기'}
        </motion.button>
      </div>
    </form>
  );
}
