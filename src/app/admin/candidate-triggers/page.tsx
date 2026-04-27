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

export default function CandidateTriggersPage() {
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/candidate-triggers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setItems(data.candidates ?? []);
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
