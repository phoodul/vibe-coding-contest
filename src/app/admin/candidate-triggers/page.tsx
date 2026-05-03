"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Candidate {
  id: string;
  tool_id: string;
  direction: "forward" | "backward" | "both";
  condition_pattern: string | null;
  goal_pattern: string | null;
  why: string;
  occurrence_count: number;
  similarity_to_existing: number | null;
  status: "mining" | "pending_review" | "approved" | "rejected";
  created_at: string;
}

interface AccumulationStats {
  total: number;
  days_back: number;
  outcome_distribution: Record<string, number>;
  daily_total: Array<{ day: string; count: number }>;
  unique_users: number;
}

interface AccumulationLogRow {
  id: string;
  outcome: string;
  matched_id: string | null;
  cue_a: string | null;
  tool_b: string | null;
  similarity: number | null;
  detail: string | null;
  created_at: string;
}

const OUTCOME_LABEL: Record<string, string> = {
  matched_existing_trigger: "기존 매칭",
  bumped_candidate: "후보 빈도+",
  promoted_candidate: "후보 승격 ✨",
  new_candidate_trigger: "신규 후보",
  new_candidate_tool: "신규 도구 후보",
  skipped: "스킵 (빈 입력)",
  failed: "실패",
};

const OUTCOME_COLOR: Record<string, string> = {
  matched_existing_trigger: "bg-emerald-100 text-emerald-700",
  bumped_candidate: "bg-blue-100 text-blue-700",
  promoted_candidate: "bg-amber-100 text-amber-700",
  new_candidate_trigger: "bg-purple-100 text-purple-700",
  new_candidate_tool: "bg-indigo-100 text-indigo-700",
  skipped: "bg-gray-100 text-gray-600",
  failed: "bg-rose-100 text-rose-700",
};

export default function CandidateTriggersPage() {
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AccumulationStats | null>(null);
  const [recent, setRecent] = useState<AccumulationLogRow[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [candRes, accRes] = await Promise.all([
        fetch("/api/admin/candidate-triggers"),
        fetch("/api/admin/trigger-accumulation?days=7"),
      ]);

      const candData = await candRes.json();
      if (!candRes.ok) throw new Error(candData.error ?? `HTTP ${candRes.status}`);
      setItems(candData.candidates ?? []);

      const accData = await accRes.json();
      if (accRes.ok) {
        setStats(accData.stats ?? null);
        setRecent(accData.recent ?? []);
      }

      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    try {
      const res = await fetch(`/api/admin/candidate-triggers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`실패: ${data.error}`);
        return;
      }
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      alert(`실패: ${(e as Error).message}`);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">자체 학습 trigger 검수 큐</h1>
        <Link href="/admin/math-tools" className="text-sm text-gray-500 hover:underline">
          ← math-tools 로
        </Link>
      </div>

      <p className="mb-4 rounded bg-blue-50 p-3 text-sm text-blue-900">
        시스템이 운영 중 풀이 로그에서 발굴한 trigger 후보. occurrence_count 가 임계값 (기본 5) 도달 시 status=pending_review 로 승격.
        approve 시 source=&apos;auto_mined&apos; 로 math_tool_triggers 에 머지됩니다.
      </p>

      {/* P0-02: 최근 7일 누적 활동 (observability) */}
      {stats && (
        <section className="mb-6 rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            최근 7일 누적 활동 (P0-02 observability)
          </h2>
          <div className="mb-3 grid grid-cols-3 gap-3 text-xs">
            <div className="rounded bg-gray-50 p-3">
              <div className="text-gray-500">총 호출</div>
              <div className="text-2xl font-semibold">{stats.total}</div>
            </div>
            <div className="rounded bg-gray-50 p-3">
              <div className="text-gray-500">고유 사용자</div>
              <div className="text-2xl font-semibold">{stats.unique_users}</div>
            </div>
            <div className="rounded bg-gray-50 p-3">
              <div className="text-gray-500">활성 일수</div>
              <div className="text-2xl font-semibold">
                {stats.daily_total.length}
              </div>
            </div>
          </div>

          {/* outcome 분포 */}
          {Object.keys(stats.outcome_distribution).length > 0 && (
            <div className="mb-3">
              <div className="mb-1 text-xs text-gray-500">Outcome 분포</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.outcome_distribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([outcome, cnt]) => (
                    <span
                      key={outcome}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${OUTCOME_COLOR[outcome] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {OUTCOME_LABEL[outcome] ?? outcome}: {cnt}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* 최근 20건 raw log */}
          {recent.length > 0 && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                최근 20건 raw log
              </summary>
              <table className="mt-2 w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-1 text-left">시각</th>
                    <th className="border p-1 text-left">Outcome</th>
                    <th className="border p-1 text-left">cue_a</th>
                    <th className="border p-1 text-left">tool_b</th>
                    <th className="border p-1 text-center">cosine</th>
                    <th className="border p-1 text-left">detail</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td className="border p-1 font-mono">
                        {new Date(r.created_at).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="border p-1">
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] ${OUTCOME_COLOR[r.outcome] ?? "bg-gray-100"}`}
                        >
                          {OUTCOME_LABEL[r.outcome] ?? r.outcome}
                        </span>
                      </td>
                      <td className="border p-1 text-gray-700">
                        {r.cue_a?.slice(0, 40) ?? "-"}
                        {r.cue_a && r.cue_a.length > 40 ? "…" : ""}
                      </td>
                      <td className="border p-1 text-gray-700">
                        {r.tool_b?.slice(0, 30) ?? "-"}
                      </td>
                      <td className="border p-1 text-center font-mono">
                        {r.similarity != null ? r.similarity.toFixed(3) : "-"}
                      </td>
                      <td className="border p-1 text-gray-500">
                        {r.detail ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </section>
      )}

      {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
      {loading && <p>Loading...</p>}

      <table className="w-full border text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="border p-2 text-left">Tool</th>
            <th className="border p-2 text-left">방향</th>
            <th className="border p-2 text-left">condition / goal</th>
            <th className="border p-2 text-left">why</th>
            <th className="border p-2 text-center">발견 횟수</th>
            <th className="border p-2 text-center">유사도</th>
            <th className="border p-2 text-center">상태</th>
            <th className="border p-2 text-center">조치</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td className="border p-2 font-mono text-xs">{c.tool_id}</td>
              <td className="border p-2">{c.direction}</td>
              <td className="border p-2">
                {c.direction === "forward"
                  ? c.condition_pattern
                  : c.direction === "backward"
                    ? c.goal_pattern
                    : `${c.condition_pattern ?? ""} / ${c.goal_pattern ?? ""}`}
              </td>
              <td className="border p-2">{c.why}</td>
              <td className="border p-2 text-center">{c.occurrence_count}</td>
              <td className="border p-2 text-center">
                {c.similarity_to_existing != null
                  ? c.similarity_to_existing.toFixed(2)
                  : "-"}
              </td>
              <td className="border p-2 text-center">{c.status}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => act(c.id, "approve")}
                  className="mr-1 rounded bg-green-600 px-2 py-1 text-xs text-white"
                >
                  승인
                </button>
                <button
                  onClick={() => act(c.id, "reject")}
                  className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                >
                  거절
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
