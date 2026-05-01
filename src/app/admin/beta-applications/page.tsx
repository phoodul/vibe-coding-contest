"use client";

/**
 * Phase G-06 G06-27 — 관리자 베타 신청 검토 페이지.
 *
 * 신청 목록 (status filter) + 1-click 승인/거부 + 코멘트 textarea.
 * 승인 시 invite_code 자동 발급 (RPC 내부에서 euler_beta_invites insert).
 */

import { useEffect, useState } from "react";
import Link from "next/link";

interface Application {
  id: string;
  user_id: string;
  user_email: string | null;
  motivation: string;
  feedback_consent: boolean;
  grade: string | null;
  area: string | null;
  practice_freq: string | null;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  reviewed_at: string | null;
  review_comment: string | null;
  invite_code: string | null;
}

type StatusFilter = "pending" | "approved" | "rejected" | "all";

export default function BetaApplicationsAdminPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/beta-applications?status=${filter}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setApps(data.applications ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function review(appId: string, action: "approve" | "reject") {
    setBusy((b) => ({ ...b, [appId]: true }));
    try {
      const res = await fetch(`/api/admin/beta-applications/${appId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: comment[appId] ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`실패: ${data.message ?? data.error}`);
        return;
      }
      // 목록 갱신
      await load();
      // 코멘트 초기화
      setComment((c) => {
        const next = { ...c };
        delete next[appId];
        return next;
      });
    } catch (e) {
      alert(`실패: ${(e as Error).message}`);
    } finally {
      setBusy((b) => ({ ...b, [appId]: false }));
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-6 text-white">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">베타 신청 검토</h1>
        <Link href="/admin/contributors" className="text-sm text-white/50 hover:text-white hover:underline">
          contributors →
        </Link>
      </div>

      <p className="mb-4 rounded border border-blue-400/30 bg-blue-500/10 p-3 text-sm text-blue-100">
        admin 만 접근 가능. 신청자의 동기·피드백 동의·메타를 검토 후 승인/거부합니다.
        승인 시 <code className="bg-blue-400/20 px-1 rounded text-blue-100">euler_beta_invites</code> 가 자동 발급됩니다.
      </p>

      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded border px-3 py-1 text-sm transition-colors ${
              filter === f
                ? "bg-blue-500 text-white border-blue-500"
                : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            {f === "pending"
              ? "대기"
              : f === "approved"
                ? "승인"
                : f === "rejected"
                  ? "반려"
                  : "전체"}
          </button>
        ))}
      </div>

      {error && <p className="mb-2 text-sm text-red-300">{error}</p>}
      {loading && <p className="text-white/60">Loading...</p>}

      {!loading && apps.length === 0 && (
        <p className="text-sm text-white/50">해당 상태의 신청이 없습니다.</p>
      )}

      <div className="space-y-4">
        {apps.map((a) => (
          <div
            key={a.id}
            className={`rounded-lg border p-4 ${
              a.status === "pending"
                ? "bg-amber-400/10 border-amber-400/30"
                : a.status === "approved"
                  ? "bg-emerald-400/10 border-emerald-400/30"
                  : "bg-rose-400/10 border-rose-400/30"
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="space-y-1">
                {/* 사용자 식별: 이메일 + UUID 모두 명확 노출 */}
                <div className="text-sm font-semibold text-white">
                  📧 {a.user_email ?? "(이메일 없음)"}
                </div>
                <div className="font-mono text-[11px] text-white/55">
                  ID: {a.user_id}
                </div>
                <div className="text-xs text-white/55">
                  신청일: {new Date(a.applied_at).toLocaleString("ko-KR")}
                </div>
                {/* Δ28 — 승인된 사용자만 만료일·남은 일수 표시 */}
                {a.status === "approved" && a.reviewed_at && (
                  <ExpiryBadge reviewedAt={a.reviewed_at} />
                )}
              </div>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  a.status === "pending"
                    ? "bg-amber-400/30 text-amber-100"
                    : a.status === "approved"
                      ? "bg-emerald-400/30 text-emerald-100"
                      : "bg-rose-400/30 text-rose-100"
                }`}
              >
                {a.status === "pending"
                  ? "대기"
                  : a.status === "approved"
                    ? "승인"
                    : "반려"}
              </span>
            </div>

            <div className="mb-3">
              <div className="text-xs text-white/55 mb-1">동기</div>
              <p className="text-sm whitespace-pre-wrap rounded border border-white/10 bg-white/5 p-3 text-white/90">
                {a.motivation}
              </p>
            </div>

            <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <Meta
                label="피드백 동의"
                value={a.feedback_consent ? "✓ 동의" : "✗ 미동의"}
                ok={a.feedback_consent}
              />
              <Meta label="학년" value={a.grade ?? "-"} />
              <Meta label="과목" value={a.area ?? "-"} />
              <Meta label="빈도" value={a.practice_freq ?? "-"} />
            </div>

            {a.status === "pending" ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={comment[a.id] ?? ""}
                  onChange={(e) =>
                    setComment((c) => ({ ...c, [a.id]: e.target.value }))
                  }
                  placeholder="코멘트 (선택, 거부 시 사유 등)"
                  rows={2}
                  className="w-full rounded border border-white/15 bg-slate-900/60 p-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-blue-400/50 transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => review(a.id, "approve")}
                    disabled={busy[a.id]}
                    className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                  >
                    {busy[a.id] ? "처리 중..." : "승인"}
                  </button>
                  <button
                    onClick={() => review(a.id, "reject")}
                    disabled={busy[a.id]}
                    className="rounded bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-40 transition-colors"
                  >
                    {busy[a.id] ? "처리 중..." : "거부"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-white/65">
                {a.reviewed_at && (
                  <div>처리일: {new Date(a.reviewed_at).toLocaleString("ko-KR")}</div>
                )}
                {a.review_comment && (
                  <div className="mt-1">코멘트: {a.review_comment}</div>
                )}
                {a.invite_code && (
                  <div className="mt-1 font-mono text-amber-200">발급 코드: {a.invite_code}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Meta({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded border border-white/10 bg-white/5 p-2">
      <div className="text-white/50">{label}</div>
      <div
        className={`font-semibold ${
          ok === true ? "text-emerald-300" : ok === false ? "text-rose-300" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/** Δ28 — 승인일 기준 30일 만료 표시. */
function ExpiryBadge({ reviewedAt }: { reviewedAt: string }) {
  const reviewedTime = new Date(reviewedAt).getTime();
  const expiresTime = reviewedTime + 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const daysLeft = Math.ceil((expiresTime - now) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft <= 0;
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        isExpired
          ? "border-rose-400/40 bg-rose-400/10 text-rose-200"
          : daysLeft <= 7
            ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
            : "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
      }`}
    >
      {isExpired
        ? `⚠ 만료됨 (${new Date(expiresTime).toLocaleDateString("ko-KR")})`
        : `⏳ ${daysLeft}일 남음 (${new Date(expiresTime).toLocaleDateString("ko-KR")} 만료)`}
    </div>
  );
}
