"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PerStudent {
  user_id: string;
  total_attempts: number;
  total_correct: number;
  area_attempts: Record<string, number>;
  l6_recall_miss: number;
  l6_trigger_miss: number;
  l5_domain_miss: number;
  computation_failure: number;
}

interface Aggregate {
  students: number;
  total_attempts: number;
  total_correct: number;
  l6_recall_miss: number;
  l6_trigger_miss: number;
  l5_domain_miss: number;
  computation_failure: number;
}

interface ApiResponse {
  students: PerStudent[];
  aggregate: Aggregate;
}

export default function AcademyDashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/academy/students")
      .then((r) => r.json())
      .then((j: ApiResponse | { error: string }) => {
        if ("error" in j) setErr(j.error);
        else setData(j);
        setLoading(false);
      })
      .catch((e) => {
        setErr(String(e));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 bg-slate-950">
        불러오는 중...
      </div>
    );
  }
  if (err || !data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-white">
        <h1 className="text-2xl font-bold">접근 권한 없음 또는 오류</h1>
        <p className="mt-4 text-white/60 text-sm">{err}</p>
      </main>
    );
  }

  const { aggregate, students } = data;
  const accuracy =
    aggregate.total_attempts > 0
      ? Math.round((aggregate.total_correct / aggregate.total_attempts) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">학원 종합 대시보드</h1>
            <p className="text-sm text-white/60 mt-1">반 학생들의 약점 패턴 종합 뷰</p>
          </div>
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white">
            ← 대시보드
          </Link>
        </div>

        {/* 반 종합 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <SummaryCard label="학생 수" value={aggregate.students} />
          <SummaryCard label="총 풀이" value={aggregate.total_attempts} />
          <SummaryCard label="정답률" value={`${accuracy}%`} />
          <SummaryCard
            label="L6 Recall vs Trigger"
            value={`${aggregate.l6_recall_miss} / ${aggregate.l6_trigger_miss}`}
          />
        </div>

        {/* 학생 list */}
        <h2 className="text-xl font-bold mb-3">학생별 약점 ({students.length})</h2>
        <div className="space-y-2">
          {students.map((s, i) => {
            const acc =
              s.total_attempts > 0
                ? Math.round((s.total_correct / s.total_attempts) * 100)
                : 0;
            return (
              <motion.div
                key={s.user_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 rounded-lg bg-white/5 border border-white/10 text-sm"
              >
                <div className="font-mono text-xs text-white/60">
                  {s.user_id.slice(0, 8)}...
                </div>
                <div>풀이 {s.total_attempts}</div>
                <div>정답률 {acc}%</div>
                <div className="text-rose-300">L6R {s.l6_recall_miss}</div>
                <div className="text-amber-300">L6T {s.l6_trigger_miss}</div>
                <div className="text-violet-300">계산오류 {s.computation_failure}</div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-white/40">
          * 익명화 표시 (user_id 8자만). 향후 academy namespace 도입 시 학생 이름 매핑.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
