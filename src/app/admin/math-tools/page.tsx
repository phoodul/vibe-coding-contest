"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Candidate = {
  id: string;
  proposed_name: string;
  proposed_formula_latex: string | null;
  proposed_layer: number | null;
  proposed_why: string | null;
  proposed_trigger: string | null;
  occurrence_count: number;
  source_problem_keys: string[];
  status: "pending" | "approved" | "rejected" | "merged";
  created_at: string;
};

const ADMIN_EMAILS = ["phoodul@gmail.com"];

function suggestId(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w가-힣\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40)
    .toUpperCase() || "TOOL";
}

export default function AdminMathToolsPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
        setAuthChecked(true);
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
      setAuthChecked(true);
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("candidate_tools")
      .select("*")
      .eq("status", "pending")
      .order("occurrence_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error(error);
      return;
    }
    setCandidates((data ?? []) as Candidate[]);
  }

  async function approve(c: Candidate, toolId: string, formula: string, layer: number) {
    setBusy(c.id);
    const supabase = createClient();
    const { error } = await supabase.rpc("approve_candidate_tool", {
      p_id: c.id,
      p_tool_id: toolId,
      p_layer: layer,
      p_formula_latex: formula,
    });
    setBusy(null);
    if (error) {
      alert(`승인 실패: ${error.message}`);
      return;
    }
    await refresh();
  }

  async function reject(c: Candidate) {
    if (!confirm(`"${c.proposed_name}" 거절하시겠어요?`)) return;
    setBusy(c.id);
    const supabase = createClient();
    const { error } = await supabase.rpc("reject_candidate_tool", { p_id: c.id });
    setBusy(null);
    if (error) {
      alert(`거절 실패: ${error.message}`);
      return;
    }
    await refresh();
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 text-sm">
        권한 확인 중...
      </div>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">접근 권한 없음</h1>
        <p className="mt-4 text-white/60">관리자만 볼 수 있는 페이지입니다.</p>
        <Link href="/dashboard" className="text-violet-400 hover:underline mt-6 inline-block">
          ← 대시보드로
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">도구 검수 큐</h1>
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
          >
            새로고침
          </button>
        </div>

        <p className="text-sm text-white/50 mb-6">
          pending {candidates.length}건. 빈도 높은 후보 먼저 표시됩니다.
        </p>

        {candidates.length === 0 ? (
          <div className="text-center text-white/40 py-16">검수할 후보가 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                busy={busy === c.id}
                onApprove={approve}
                onReject={reject}
                suggestId={suggestId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  busy,
  onApprove,
  onReject,
  suggestId,
}: {
  candidate: Candidate;
  busy: boolean;
  onApprove: (c: Candidate, id: string, formula: string, layer: number) => void;
  onReject: (c: Candidate) => void;
  suggestId: (name: string) => string;
}) {
  const [toolId, setToolId] = useState(suggestId(candidate.proposed_name));
  const [formula, setFormula] = useState(candidate.proposed_formula_latex ?? "");
  const [layer, setLayer] = useState(candidate.proposed_layer ?? 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white/5 border border-white/10 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg">{candidate.proposed_name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              ×{candidate.occurrence_count}
            </span>
            <span className="text-xs text-white/40">
              {new Date(candidate.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
          {candidate.proposed_why && (
            <p className="text-sm text-white/70 mb-1">
              <span className="text-white/40">왜: </span>
              {candidate.proposed_why}
            </p>
          )}
          {candidate.proposed_trigger && (
            <p className="text-sm text-white/70 mb-1">
              <span className="text-white/40">언제: </span>
              {candidate.proposed_trigger}
            </p>
          )}
          {candidate.source_problem_keys.length > 0 && (
            <p className="text-xs text-white/40 mt-2">
              출처: {candidate.source_problem_keys.slice(0, 3).join(", ")}
              {candidate.source_problem_keys.length > 3 && ` 외 ${candidate.source_problem_keys.length - 3}건`}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
        <div>
          <label className="text-xs text-white/50">tool_id</label>
          <input
            value={toolId}
            onChange={(e) => setToolId(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-white/50">layer (1~6)</label>
          <input
            type="number"
            min={1}
            max={6}
            value={layer}
            onChange={(e) => setLayer(parseInt(e.target.value, 10))}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="text-xs text-white/50">formula (LaTeX)</label>
          <input
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm font-mono"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3 justify-end">
        <button
          onClick={() => onReject(candidate)}
          disabled={busy}
          className="px-4 py-2 rounded-lg text-sm bg-rose-500/10 border border-rose-500/30 text-rose-200 hover:bg-rose-500/20 disabled:opacity-40"
        >
          거절
        </button>
        <button
          onClick={() => onApprove(candidate, toolId, formula, layer)}
          disabled={busy || !toolId.trim()}
          className="px-4 py-2 rounded-lg text-sm bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-40"
        >
          승인 (math_tools 머지)
        </button>
      </div>
    </motion.div>
  );
}
