'use client';

/**
 * Phase G-06 G06-34 (Δ11) — 베타 리뷰 폼.
 *
 * 베이스 문서: docs/project-decisions.md Δ11.
 * 15차 세션 (2026-05-03) 단순화 (옵션 A-2):
 *   필수 = 별점 (1~5)
 *   선택 = 코멘트 (메인) + 추가 항목 펼치기 (튜터 추천 / 구매 의향 / 장점 / 단점)
 *
 * 제출 → POST /api/legend/beta/review.
 * 기존 리뷰 있으면 수정 모드 (existing prop).
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
  starRating: number;
  freeComment: string;
  pros: string;
  cons: string;
  purchaseIntent: boolean | null;
  recommendedTutor: RecommendedTutor | null;
  isPublic: boolean;
}

function initFormState(existing: BetaReview | null): FormState {
  if (!existing) {
    return {
      starRating: 0,
      freeComment: '',
      pros: '',
      cons: '',
      purchaseIntent: null,
      recommendedTutor: null,
      isPublic: true,
    };
  }
  return {
    starRating: existing.star_rating,
    freeComment: existing.free_comment ?? '',
    pros: existing.pros ?? '',
    cons: existing.cons ?? '',
    purchaseIntent: existing.purchase_intent,
    recommendedTutor: existing.recommended_tutor,
    isPublic: existing.is_public,
  };
}

export function BetaReviewForm({ existing }: { existing: BetaReview | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initFormState(existing));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(existing !== null);
  const [extraOpen, setExtraOpen] = useState(() => {
    return Boolean(
      existing &&
        (existing.pros ||
          existing.cons ||
          existing.purchase_intent !== null ||
          existing.recommended_tutor),
    );
  });

  const isEditing = existing !== null;

  const ratingOk = form.starRating >= 1 && form.starRating <= 5;
  const prosLen = form.pros.trim().length;
  const consLen = form.cons.trim().length;
  const prosWarn = prosLen > 0 && prosLen < 30;
  const consWarn = consLen > 0 && consLen < 20;
  const canSubmit = ratingOk && !prosWarn && !consWarn && !submitting;

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
          star_rating: form.starRating,
          free_comment: form.freeComment.trim() || null,
          pros: form.pros.trim() || null,
          cons: form.cons.trim() || null,
          purchase_intent: form.purchaseIntent,
          recommended_tutor: form.recommendedTutor,
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
      {/* 1. 별점 (필수) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          별점 <span className="text-rose-300">*</span>
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

      {/* 2. 코멘트 (선택, 메인 노출) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h2 className="text-base font-semibold text-white mb-3">
          코멘트 <span className="text-white/40 text-xs">(선택)</span>
        </h2>
        <textarea
          value={form.freeComment}
          onChange={(e) =>
            setForm((f) => ({ ...f, freeComment: e.target.value }))
          }
          rows={4}
          placeholder="자유롭게 의견을 남겨주세요. 짧게 한 줄도 좋습니다."
          className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
          data-testid="comment-textarea"
        />
      </section>

      {/* 3. 추가 항목 (펼치기, 선택) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        <button
          type="button"
          onClick={() => setExtraOpen((o) => !o)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          data-testid="extra-toggle"
        >
          <div className="text-left">
            <div className="text-base font-semibold text-white">
              추가 정보 <span className="text-white/40 text-xs ml-1">(선택)</span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              튜터 추천·구매 의향·장단점 — 출시 마케팅과 가격 결정에 도움이
              됩니다.
            </p>
          </div>
          <span className="text-2xl text-white/40">{extraOpen ? '−' : '+'}</span>
        </button>

        {extraOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-6 pb-6 space-y-6 border-t border-white/10"
          >
            {/* 추천 튜터 */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3 mt-4">
                가장 추천하는 튜터
              </h3>
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
                        setForm((f) => ({
                          ...f,
                          recommendedTutor: active ? null : value,
                        }))
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
                      <span className="text-xs font-medium text-white">
                        {p.label_ko}
                      </span>
                      <span className="text-[9px] text-white/50 leading-tight text-center">
                        {p.tier_label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 구매 의향 */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-3">
                출시되면 구매하시겠습니까?
              </h3>
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
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          purchaseIntent: active ? null : val,
                        }))
                      }
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
            </div>

            {/* 장점 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">장점</h3>
                <span
                  className={`text-xs ${
                    prosWarn
                      ? 'text-rose-300'
                      : prosLen >= 30
                        ? 'text-emerald-300'
                        : 'text-white/40'
                  }`}
                >
                  {prosLen} {prosLen > 0 ? '/ 30자 이상' : ''}
                </span>
              </div>
              <textarea
                value={form.pros}
                onChange={(e) => setForm((f) => ({ ...f, pros: e.target.value }))}
                rows={3}
                placeholder="(선택) 적으시려면 30자 이상 — 가장 좋았던 점을 솔직하게."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
                data-testid="pros-textarea"
              />
            </div>

            {/* 단점 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">단점</h3>
                <span
                  className={`text-xs ${
                    consWarn
                      ? 'text-rose-300'
                      : consLen >= 20
                        ? 'text-emerald-300'
                        : 'text-white/40'
                  }`}
                >
                  {consLen} {consLen > 0 ? '/ 20자 이상' : ''}
                </span>
              </div>
              <textarea
                value={form.cons}
                onChange={(e) => setForm((f) => ({ ...f, cons: e.target.value }))}
                rows={2}
                placeholder="(선택) 적으시려면 20자 이상 — 아쉬웠던 점이나 개선이 필요한 부분."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
                data-testid="cons-textarea"
              />
            </div>
          </motion.div>
        )}
      </section>

      {/* 4. 공개/비공개 */}
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
