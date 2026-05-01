"use client";

/**
 * Phase G-06 G06-27 — 베타 신청 폼 페이지.
 *
 * 필수: motivation (50자+), feedback_consent (체크박스).
 * 선택: grade / area / practice_freq.
 *
 * 이미 신청한 사용자는 status (pending/approved/rejected) 표시.
 * approved 시 `/legend/beta?next=/legend/canvas` 로 안내 (기존 redeem 페이지 활용).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Stage = "checking" | "form" | "submitting" | "submitted" | "error";

interface Application {
  id: string;
  status: "pending" | "approved" | "rejected";
  motivation: string;
  feedback_consent: boolean;
  grade: string | null;
  area: string | null;
  practice_freq: string | null;
  applied_at: string;
  reviewed_at: string | null;
  review_comment: string | null;
  invite_code: string | null;
}

const GRADES = [
  { value: "middle1", label: "중학교 1학년" },
  { value: "middle2", label: "중학교 2학년" },
  { value: "middle3", label: "중학교 3학년" },
  { value: "high1", label: "고등학교 1학년" },
  { value: "high2", label: "고등학교 2학년" },
  { value: "high3", label: "고등학교 3학년" },
  { value: "n_su", label: "N수생" },
  { value: "other", label: "기타" },
];

const AREAS = [
  { value: "calculus", label: "미적분" },
  { value: "geometry", label: "기하" },
  { value: "probability", label: "확률과 통계" },
  { value: "common", label: "공통 (수학)" },
  { value: "math1", label: "수학 1" },
  { value: "math2", label: "수학 2" },
  { value: "middle", label: "중학 수학" },
];

const FREQS = [
  { value: "daily", label: "매일" },
  { value: "weekly", label: "주 2~3회" },
  { value: "occasional", label: "가끔" },
];

export default function BetaApplyPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("checking");
  const [existing, setExisting] = useState<Application | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 폼 상태
  const [motivation, setMotivation] = useState("");
  const [consent, setConsent] = useState(false);
  const [grade, setGrade] = useState("");
  const [area, setArea] = useState("");
  const [freq, setFreq] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          router.replace(`/login?next=${encodeURIComponent("/legend/beta/apply")}`);
        }
        return;
      }

      const res = await fetch("/api/legend/beta/apply", { method: "GET" });
      const data = await res.json();
      if (cancelled) return;
      if (data?.application) {
        setExisting(data.application);
      }
      setStage("form");
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = motivation.trim();
    if (trimmed.length < 50) {
      setErrorMsg("동기를 50자 이상 작성해주세요. (현재 " + trimmed.length + "자)");
      return;
    }
    if (!consent) {
      setErrorMsg("피드백 제공 동의는 필수입니다.");
      return;
    }

    setStage("submitting");
    try {
      const res = await fetch("/api/legend/beta/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivation: trimmed,
          feedback_consent: true,
          grade: grade || null,
          area: area || null,
          practice_freq: freq || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStage("error");
        setErrorMsg(data?.message ?? data?.error ?? "신청 처리 중 오류가 발생했습니다.");
        return;
      }
      setStage("submitted");
      setExisting({
        id: data.id,
        status: "pending",
        motivation: trimmed,
        feedback_consent: true,
        grade: grade || null,
        area: area || null,
        practice_freq: freq || null,
        applied_at: new Date().toISOString(),
        reviewed_at: null,
        review_comment: null,
        invite_code: null,
      });
    } catch (e) {
      setStage("error");
      setErrorMsg((e as Error).message);
    }
  }

  // 이미 승인된 사용자
  if (existing?.status === "approved") {
    return (
      <Shell>
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">신청 승인 완료</h2>
          <p className="text-sm text-white/60 mb-6">
            Legend Tutor 베타 사용자로 승인되었습니다.
          </p>
          <Link
            href="/legend/beta?next=/legend/canvas"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold transition-all hover:scale-105"
          >
            베타 입장하기
          </Link>
        </div>
      </Shell>
    );
  }

  if (existing?.status === "pending") {
    return (
      <Shell>
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold mb-2">신청 검토 중</h2>
          <p className="text-sm text-white/60">
            관리자 승인 대기 중입니다. 1~2일 내 결과를 안내드립니다.
          </p>
          <p className="mt-4 text-xs text-white/40">
            신청일:{" "}
            {new Date(existing.applied_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </Shell>
    );
  }

  if (existing?.status === "rejected") {
    return (
      <Shell>
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">신청이 반려되었습니다</h2>
          {existing.review_comment && (
            <p className="text-sm text-white/60 mb-4 bg-white/5 rounded-lg p-3">
              관리자 코멘트: {existing.review_comment}
            </p>
          )}
          <p className="text-xs text-white/40">
            추후 베타 확장 시 재안내 드리겠습니다.
          </p>
        </div>
      </Shell>
    );
  }

  if (stage === "submitted") {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">📨</div>
          <h2 className="text-xl font-bold mb-2">신청 접수 완료</h2>
          <p className="text-sm text-white/60">
            관리자 승인 대기 중입니다. 1~2일 내 결과를 안내드립니다.
          </p>
        </motion.div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
        🎓 Legend Tutor 베타 신청
      </h1>
      <p className="text-sm text-white/60 text-center mb-8">
        50명의 베타 사용자에게 5명의 수학 거장 튜터를 먼저 공개합니다.
        <br />
        신청서를 검토 후 승인해드립니다.
      </p>

      {stage === "checking" ? (
        <div className="text-center text-white/60 text-sm">상태 확인 중...</div>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* motivation */}
          <div>
            <label className="block text-sm font-medium mb-2">
              신청 동기 <span className="text-rose-400">*</span>{" "}
              <span className="text-xs text-white/40">
                (50자 이상, 현재 {motivation.trim().length}자)
              </span>
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="어떻게 활용하실 계획인지, 어떤 점이 기대되는지 자유롭게 작성해주세요. (50자 이상 필수)"
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 transition-colors text-sm"
              disabled={stage === "submitting"}
            />
          </div>

          {/* grade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              label="학년 (선택)"
              value={grade}
              onChange={setGrade}
              options={GRADES}
              disabled={stage === "submitting"}
            />
            <Select
              label="주 과목 (선택)"
              value={area}
              onChange={setArea}
              options={AREAS}
              disabled={stage === "submitting"}
            />
            <Select
              label="풀이 빈도 (선택)"
              value={freq}
              onChange={setFreq}
              options={FREQS}
              disabled={stage === "submitting"}
            />
          </div>

          {/* feedback_consent */}
          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-amber-500/5 border border-amber-500/30">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={stage === "submitting"}
              className="mt-1 h-5 w-5 accent-amber-400"
            />
            <div className="text-sm">
              <span className="font-semibold text-amber-200">
                피드백 제공 동의 <span className="text-rose-400">*</span>
              </span>
              <p className="mt-1 text-xs text-white/60">
                베타 기간 중 사용 후기 인터뷰 (5~10분, 1주 후) 및 만족도 설문에 참여하는 것에
                동의합니다. 미동의 시 신청이 불가합니다.
              </p>
            </div>
          </label>

          {errorMsg && (
            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={stage === "submitting"}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold disabled:opacity-40 transition-all hover:scale-[1.01]"
          >
            {stage === "submitting" ? "제출 중..." : "베타 신청서 제출"}
          </button>

          <p className="text-xs text-white/40 text-center">
            기존에 EULER2026 코드를 받으신 분은{" "}
            <Link href="/legend/beta?next=/legend/canvas" className="underline hover:text-white/60">
              여기로
            </Link>
            .
          </p>
        </motion.form>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-xs text-white/40 hover:text-white/60"
          >
            ← 대시보드
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2 text-white/60">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-400"
      >
        <option value="">선택 안 함</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
