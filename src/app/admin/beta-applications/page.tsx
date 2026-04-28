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
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">베타 신청 검토</h1>
        <Link href="/admin/contributors" className="text-sm text-gray-500 hover:underline">
          contributors →
        </Link>
      </div>

      <p className="mb-4 rounded bg-blue-50 p-3 text-sm text-blue-900">
        admin 만 접근 가능. 신청자의 동기·피드백 동의·메타를 검토 후 승인/거부합니다.
        승인 시 <code className="bg-blue-100 px-1 rounded">euler_beta_invites</code> 가 자동 발급됩니다.
      </p>

      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded border px-3 py-1 text-sm ${
              filter === f ? "bg-blue-600 text-white border-blue-600" : ""
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

      {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && apps.length === 0 && (
        <p className="text-sm text-gray-500">해당 상태의 신청이 없습니다.</p>
      )}

      <div className="space-y-4">
        {apps.map((a) => (
          <div
            key={a.id}
            className={`rounded-lg border p-4 ${
              a.status === "pending"
                ? "bg-amber-50 border-amber-200"
                : a.status === "approved"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-rose-50 border-rose-200"
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">
                  {a.user_email ?? a.user_id.slice(0, 8) + "..."}
                </div>
                <div className="text-xs text-gray-500">
                  신청일: {new Date(a.applied_at).toLocaleString("ko-KR")}
                </div>
              </div>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  a.status === "pending"
                    ? "bg-amber-200 text-amber-900"
                    : a.status === "approved"
                      ? "bg-emerald-200 text-emerald-900"
                      : "bg-rose-200 text-rose-900"
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
              <div className="text-xs text-gray-500 mb-1">동기</div>
              <p className="text-sm whitespace-pre-wrap bg-white rounded p-3 border">
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
                  className="w-full rounded border p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => review(a.id, "approve")}
                    disabled={busy[a.id]}
                    className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
                  >
                    {busy[a.id] ? "처리 중..." : "승인"}
                  </button>
                  <button
                    onClick={() => review(a.id, "reject")}
                    disabled={busy[a.id]}
                    className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
                  >
                    {busy[a.id] ? "처리 중..." : "거부"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-600">
                {a.reviewed_at && (
                  <div>처리일: {new Date(a.reviewed_at).toLocaleString("ko-KR")}</div>
                )}
                {a.review_comment && (
                  <div className="mt-1">코멘트: {a.review_comment}</div>
                )}
                {a.invite_code && (
                  <div className="mt-1 font-mono">발급 코드: {a.invite_code}</div>
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
    <div className="rounded bg-white border p-2">
      <div className="text-gray-500">{label}</div>
      <div
        className={`font-semibold ${
          ok === true ? "text-emerald-700" : ok === false ? "text-rose-700" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
