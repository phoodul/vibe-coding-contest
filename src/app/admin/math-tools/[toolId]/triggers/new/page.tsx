"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Direction = "forward" | "backward" | "both";
type Source = "developer" | "정석" | "해법서";

export default function NewTriggerPage() {
  const router = useRouter();
  const params = useParams<{ toolId: string }>();
  const toolId = params?.toolId;

  const [direction, setDirection] = useState<Direction>("forward");
  const [condition, setCondition] = useState("");
  const [derivedFact, setDerivedFact] = useState("");
  const [goalPattern, setGoalPattern] = useState("");
  const [premises, setPremises] = useState("");
  const [why, setWhy] = useState("");
  const [source, setSource] = useState<Source>("developer");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toolName, setToolName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    if (!toolId) return;
    fetch(`/api/admin/math-tools?id=${encodeURIComponent(toolId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        const found = d?.tools?.find?.((t: { id: string; name: string }) => t.id === toolId);
        if (found) setToolName(found.name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [toolId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/math-tools/${encodeURIComponent(toolId ?? "")}/triggers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            direction,
            condition: condition.trim() || undefined,
            derived_fact: derivedFact.trim() || undefined,
            goal_pattern: goalPattern.trim() || undefined,
            premises: premises
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            why,
            source,
            note: note.trim() || undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `HTTP ${res.status}`);
      } else {
        setResult(`✓ trigger ${data.trigger_id} 추가 (출처: ${data.source})`);
        // reset
        setCondition("");
        setDerivedFact("");
        setGoalPattern("");
        setPremises("");
        setWhy("");
        setNote("");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Trigger 추가 — <span className="text-blue-600">{toolName || toolId}</span>
        </h1>
        <Link
          href="/admin/math-tools"
          className="text-sm text-gray-500 hover:underline"
        >
          ← 검수 큐로
        </Link>
      </div>

      <p className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-900">
        💡 책에 나온 표현을 그대로 옮기지 마세요. 자신의 말로 재구성하고, 출처는 source 필드에만 표기하세요.
        Tool 의 본질은 <strong>발동 조건(when)</strong>입니다 — 정리 이름이 아니라 “어떤 조건이 보이면 떠올리는가”를 적으세요.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">방향</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            className="mt-1 w-full rounded border p-2"
          >
            <option value="forward">forward (조건 → 도구 발동)</option>
            <option value="backward">backward (목표 → 도구 발동)</option>
            <option value="both">both (양방향)</option>
          </select>
        </div>

        {(direction === "forward" || direction === "both") && (
          <div>
            <label className="block text-sm font-medium">condition_pattern (forward)</label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="예: 닫힌구간 연속 + 미분가능"
              className="mt-1 w-full rounded border p-2"
            />
            <input
              type="text"
              value={derivedFact}
              onChange={(e) => setDerivedFact(e.target.value)}
              placeholder="(선택) derived_fact: 평균변화율 = f'(c) 인 c 존재"
              className="mt-1 w-full rounded border p-2"
            />
          </div>
        )}

        {(direction === "backward" || direction === "both") && (
          <div>
            <label className="block text-sm font-medium">goal_pattern (backward)</label>
            <input
              type="text"
              value={goalPattern}
              onChange={(e) => setGoalPattern(e.target.value)}
              placeholder="예: f'(c) = k 인 c 존재 증명"
              className="mt-1 w-full rounded border p-2"
            />
            <textarea
              value={premises}
              onChange={(e) => setPremises(e.target.value)}
              placeholder="premises (선택, 줄바꿈으로 여러 개)"
              className="mt-1 w-full rounded border p-2"
              rows={2}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">why (학생에게 보일 직관 한 문장)</label>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="예: 닫힌구간 연속+미분가능 조건이 보이면 평균변화율 일치하는 c 가 존재한다는 직관"
            className="mt-1 w-full rounded border p-2"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">source (출처)</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
            className="mt-1 w-full rounded border p-2"
          >
            <option value="developer">developer (직접 정의)</option>
            <option value="정석">정석 (참조)</option>
            <option value="해법서">해법서 (참조)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">비고 (선택)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "추가 중..." : "Trigger 추가"}
        </button>

        {result && <p className="text-sm text-green-700">{result}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </div>
  );
}
