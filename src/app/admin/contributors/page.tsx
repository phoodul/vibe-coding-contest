"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  id: string;
  display_name: string | null;
  can_contribute_triggers: boolean;
  created_at: string;
}

export default function ContributorsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "contributors">("all");

  async function load() {
    setLoading(true);
    try {
      const url =
        filter === "contributors"
          ? "/api/admin/contributors?only=contributors"
          : "/api/admin/contributors";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setProfiles(data.profiles ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function toggle(id: string, current: boolean) {
    try {
      const res = await fetch("/api/admin/contributors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id, can_contribute: !current }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`실패: ${data.error}`);
        return;
      }
      setProfiles((ps) =>
        ps.map((p) => (p.id === id ? { ...p, can_contribute_triggers: !current } : p))
      );
    } catch (e) {
      alert(`실패: ${(e as Error).message}`);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contributor 권한 관리</h1>
        <Link href="/admin/math-tools" className="text-sm text-gray-500 hover:underline">
          ← math-tools 로
        </Link>
      </div>

      <p className="mb-4 rounded bg-blue-50 p-3 text-sm text-blue-900">
        admin 만 접근 가능. 베타 사용자에게 trigger 추가 권한을 부여하세요. 신뢰가 검증된 수학 전공자/교사/강사만 권장합니다.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded border px-3 py-1 ${filter === "all" ? "bg-blue-600 text-white" : ""}`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter("contributors")}
          className={`rounded border px-3 py-1 ${filter === "contributors" ? "bg-blue-600 text-white" : ""}`}
        >
          Contributor 만
        </button>
      </div>

      {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
      {loading && <p>Loading...</p>}

      <table className="w-full border text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="border p-2 text-left">User ID</th>
            <th className="border p-2 text-left">이름</th>
            <th className="border p-2 text-left">가입일</th>
            <th className="border p-2 text-center">Contributor</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} className={p.can_contribute_triggers ? "bg-green-50" : ""}>
              <td className="border p-2 font-mono text-xs">{p.id.slice(0, 8)}…</td>
              <td className="border p-2">{p.display_name ?? "-"}</td>
              <td className="border p-2">{new Date(p.created_at).toLocaleDateString()}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => toggle(p.id, p.can_contribute_triggers)}
                  className={`rounded px-3 py-1 text-xs ${
                    p.can_contribute_triggers
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {p.can_contribute_triggers ? "권한 회수" : "권한 부여"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
