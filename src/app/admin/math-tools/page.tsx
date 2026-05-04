"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/legend/access-tier";

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

type Counts = { tools: number; triggers: number };

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
  const [counts, setCounts] = useState<Counts | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user || !isAdminEmail(user.email)) {
        setAuthChecked(true);
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
      setAuthChecked(true);
      await refresh();
      await refreshCounts();
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

  async function refreshCounts() {
    try {
      const r = await fetch("/api/admin/math-tools");
      if (!r.ok) return;
      setCounts((await r.json()) as Counts);
    } catch (e) {
      console.error(e);
    }
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
          <h1 className="text-2xl font-bold">math_tools 관리</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                showAddForm
                  ? "bg-violet-500/20 border-violet-400/50 text-violet-100"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {showAddForm ? "✕ 폼 닫기" : "➕ 도구 직접 추가"}
            </button>
            <button
              onClick={() => {
                refresh();
                refreshCounts();
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
            >
              새로고침
            </button>
          </div>
        </div>

        {counts && (
          <div className="mb-4 text-xs text-white/50 flex gap-4">
            <span>등록 도구 <span className="text-white font-mono">{counts.tools}</span></span>
            <span>·</span>
            <span>trigger <span className="text-white font-mono">{counts.triggers}</span></span>
          </div>
        )}

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <AddToolForm
                onSuccess={() => {
                  setShowAddForm(false);
                  refreshCounts();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="text-lg font-bold mb-2">검수 큐</h2>
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

// ────────────────────────────────────────────────────────────────────
// 도구 직접 추가 폼 (운영자가 수백개 도구를 점진 추가하기 위함)
// POST /api/admin/math-tools — math_tools insert + 임베딩 자동 생성 + math_tool_triggers insert

type FormTrigger = {
  direction: "forward" | "backward" | "both";
  condition: string;
  derived_fact: string;
  goal_pattern: string;
  premises: string;
  why: string;
};

const EMPTY_TRIGGER: FormTrigger = {
  direction: "forward",
  condition: "",
  derived_fact: "",
  goal_pattern: "",
  premises: "",
  why: "",
};

function AddToolForm({ onSuccess }: { onSuccess: () => void }) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [layer, setLayer] = useState(5);
  const [formula, setFormula] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [triggers, setTriggers] = useState<FormTrigger[]>([{ ...EMPTY_TRIGGER }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function updateTrigger(idx: number, patch: Partial<FormTrigger>) {
    setTriggers((cur) => cur.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }

  function addTrigger() {
    setTriggers((cur) => [...cur, { ...EMPTY_TRIGGER }]);
  }

  function removeTrigger(idx: number) {
    setTriggers((cur) => (cur.length === 1 ? cur : cur.filter((_, i) => i !== idx)));
  }

  function reset() {
    setId("");
    setName("");
    setLayer(5);
    setFormula("");
    setPrerequisites("");
    setTriggers([{ ...EMPTY_TRIGGER }]);
    setMessage(null);
  }

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        id: id.trim().toUpperCase(),
        name: name.trim(),
        knowledge_layer: layer,
        formula_latex: formula.trim(),
        prerequisites: prerequisites
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        triggers: triggers.map((t) => ({
          direction: t.direction,
          condition: t.condition.trim() || undefined,
          derived_fact: t.derived_fact.trim() || undefined,
          goal_pattern: t.goal_pattern.trim() || undefined,
          premises: t.premises
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          why: t.why.trim(),
        })),
      };
      const res = await fetch("/api/admin/math-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; tool_id?: string; triggers_inserted?: number; error?: string };
      if (!res.ok) {
        setMessage({ type: "err", text: json.error ?? `HTTP ${res.status}` });
      } else {
        setMessage({
          type: "ok",
          text: `✓ 추가 완료 — ${json.tool_id} (trigger ${json.triggers_inserted}개, 임베딩 생성)`,
        });
        reset();
        onSuccess();
      }
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl bg-white/5 border border-violet-500/30 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">새 도구 추가</h3>
        <span className="text-xs text-white/40">
          POST /api/admin/math-tools — 임베딩 자동 생성 (≈ 0.0001원/도구)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="text-xs text-white/50">id (대문자_숫자)</label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="예: M1_TRIG_NEW"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm font-mono"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs text-white/50">name (한글)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 새로운 정리"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs text-white/50">layer (1~6)</label>
          <input
            type="number"
            min={1}
            max={6}
            value={layer}
            onChange={(e) => setLayer(parseInt(e.target.value, 10) || 5)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="text-xs text-white/50">formula (LaTeX)</label>
          <input
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="예: (\\sin x)' = \\cos x"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm font-mono"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="text-xs text-white/50">prerequisites (쉼표 구분)</label>
          <input
            value={prerequisites}
            onChange={(e) => setPrerequisites(e.target.value)}
            placeholder="예: 미분의 정의, 연쇄법칙"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white/80">Triggers</h4>
          <button
            onClick={addTrigger}
            type="button"
            className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10"
          >
            + trigger 추가
          </button>
        </div>
        {triggers.map((t, i) => (
          <div key={i} className="rounded-lg bg-black/20 border border-white/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={t.direction}
                  onChange={(e) =>
                    updateTrigger(i, { direction: e.target.value as FormTrigger["direction"] })
                  }
                  className="px-2 py-1 rounded bg-black/40 border border-white/10 text-xs"
                >
                  <option value="forward">forward</option>
                  <option value="backward">backward</option>
                  <option value="both">both</option>
                </select>
                <span className="text-xs text-white/40">#{i + 1}</span>
              </div>
              <button
                onClick={() => removeTrigger(i)}
                type="button"
                disabled={triggers.length === 1}
                className="text-xs text-rose-300 hover:underline disabled:opacity-30"
              >
                삭제
              </button>
            </div>

            {(t.direction === "forward" || t.direction === "both") && (
              <>
                <input
                  value={t.condition}
                  onChange={(e) => updateTrigger(i, { condition: e.target.value })}
                  placeholder="condition (forward 필수): 어떤 상황·가설에서 이 도구를 떠올리는가"
                  className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-xs"
                />
                <input
                  value={t.derived_fact}
                  onChange={(e) => updateTrigger(i, { derived_fact: e.target.value })}
                  placeholder="derived_fact: 적용 결과 얻는 사실"
                  className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-xs"
                />
              </>
            )}
            {(t.direction === "backward" || t.direction === "both") && (
              <>
                <input
                  value={t.goal_pattern}
                  onChange={(e) => updateTrigger(i, { goal_pattern: e.target.value })}
                  placeholder="goal_pattern (backward 필수): 어떤 결론·목표를 위해 이 도구를 호출하는가"
                  className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-xs"
                />
                <input
                  value={t.premises}
                  onChange={(e) => updateTrigger(i, { premises: e.target.value })}
                  placeholder="premises (쉼표 구분): 사용을 위해 필요한 전제"
                  className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-xs"
                />
              </>
            )}
            <input
              value={t.why}
              onChange={(e) => updateTrigger(i, { why: e.target.value })}
              placeholder="why (필수): 왜 이 도구가 정확히 들어맞는가 — 코칭 발화의 근거"
              className="w-full px-3 py-2 rounded bg-black/30 border border-violet-400/30 text-xs"
            />
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`text-sm rounded-lg px-3 py-2 ${
            message.type === "ok"
              ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30"
              : "bg-rose-500/10 text-rose-200 border border-rose-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          onClick={reset}
          type="button"
          disabled={submitting}
          className="px-4 py-2 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40"
        >
          초기화
        </button>
        <button
          onClick={submit}
          type="button"
          disabled={submitting || !id.trim() || !name.trim() || !formula.trim()}
          className="px-4 py-2 rounded-lg text-sm bg-violet-500/20 border border-violet-400/40 text-violet-100 hover:bg-violet-500/30 disabled:opacity-40"
        >
          {submitting ? "추가 중..." : "도구 추가 + 임베딩"}
        </button>
      </div>
    </div>
  );
}
