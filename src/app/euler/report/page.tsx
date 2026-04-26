"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Level = "low" | "medium" | "high";

interface DiagnosisItem {
  key: string;
  label: string;
  raw_count: number;
  share: number;
  weight: number;
  level: Level;
}

interface WeaknessReport {
  total_attempts: number;
  total_correct: number;
  recent_window_days: number;
  items: DiagnosisItem[];
  recommendation_text: string | null;
}

interface DailyStat {
  day: string;
  attempts: number;
  correct: number;
}

interface LayerSeriesPoint {
  layer: number;
  area: string;
  attempts: number;
  successes: number;
  pass_rate: number;
}

interface ProgressReport {
  window_days: number;
  total_attempts: number;
  total_correct: number;
  daily: DailyStat[];
  layer_series: LayerSeriesPoint[];
  area_distribution: { area: string; count: number }[];
  distinct_tools_used: number;
  top_tools: { name: string; count: number }[];
}

const LEVEL_COLOR: Record<Level, string> = {
  low: "bg-emerald-500/10 border-emerald-400/30 text-emerald-200",
  medium: "bg-amber-500/10 border-amber-400/30 text-amber-200",
  high: "bg-rose-500/10 border-rose-400/40 text-rose-200",
};

const LEVEL_LABEL: Record<Level, string> = {
  low: "양호",
  medium: "주의",
  high: "집중 필요",
};

export default function EulerReportPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [weakness, setWeakness] = useState<WeaknessReport | null>(null);
  const [progress, setProgress] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setAuthChecked(true);
          setAuthorized(false);
        }
        return;
      }
      if (cancelled) return;
      setAuthChecked(true);
      setAuthorized(true);

      try {
        const [w, p] = await Promise.all([
          fetch("/api/euler-tutor/report/weakness?window=30").then((r) => r.json()),
          fetch("/api/euler-tutor/report/progress?days=30").then((r) => r.json()),
        ]);
        if (cancelled) return;
        setWeakness(w);
        setProgress(p);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 text-sm bg-slate-950">
        리포트 불러오는 중...
      </div>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-white">
        <h1 className="text-2xl font-bold">로그인이 필요해요</h1>
        <Link href="/login?next=/euler/report" className="text-violet-400 underline mt-4 inline-block">
          로그인하러 가기
        </Link>
      </main>
    );
  }

  const accuracy =
    progress && progress.total_attempts > 0
      ? Math.round((progress.total_correct / progress.total_attempts) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">오일러 리포트</h1>
            <p className="text-sm text-white/60 mt-1">
              최근 30일의 풀이 데이터를 분석한 약점 진단과 진척도입니다.
            </p>
          </div>
          <Link href="/euler-tutor" className="text-sm text-white/60 hover:text-white">
            ← 채팅
          </Link>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <SummaryCard label="풀이 수" value={progress?.total_attempts ?? 0} />
          <SummaryCard label="정답률" value={`${accuracy}%`} />
          <SummaryCard label="사용한 도구" value={progress?.distinct_tools_used ?? 0} />
        </div>

        {/* WeaknessReport */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">막힘 패턴</h2>
          {weakness && weakness.items.some((i) => i.raw_count > 0) ? (
            <>
              <WeaknessChart items={weakness.items} />
              {weakness.recommendation_text && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-400/30 text-sm text-white/90 whitespace-pre-line"
                >
                  {weakness.recommendation_text}
                </motion.div>
              )}
            </>
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-white/50">
              아직 분석할 풀이가 부족해요. 몇 문제 더 풀어주세요!
            </div>
          )}
        </section>

        {/* ProgressDashboard */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">일자별 정답률</h2>
          {progress && progress.daily.length > 0 ? (
            <DailyChart daily={progress.daily} />
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-white/50">
              아직 데이터가 없어요.
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Layer 별 통과율</h2>
          {progress && progress.layer_series.length > 0 ? (
            <LayerStuckChart points={progress.layer_series} />
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-white/50">
              Layer 통계가 아직 누적되지 않았어요.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </motion.div>
  );
}

function WeaknessChart({ items }: { items: DiagnosisItem[] }) {
  const max = Math.max(...items.map((i) => i.raw_count), 1);
  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const widthPct = (it.raw_count / max) * 100;
        const isL6Recall = it.key === "L6_recall";
        const isL6Trigger = it.key === "L6_trigger";
        const barColor =
          it.level === "high"
            ? "bg-rose-500/60"
            : it.level === "medium"
              ? "bg-amber-500/60"
              : "bg-emerald-500/40";
        return (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-lg bg-white/5 border border-white/10 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border ${LEVEL_COLOR[it.level]}`}
                >
                  {LEVEL_LABEL[it.level]}
                </span>
                <span className="text-sm font-medium">
                  {it.label}
                  {(isL6Recall || isL6Trigger) && (
                    <span className="ml-2 text-[10px] text-violet-300">
                      {isL6Recall ? "도구 자체 학습 필요" : "trigger 패턴 학습 필요"}
                    </span>
                  )}
                </span>
              </div>
              <span className="text-xs text-white/60 tabular-nums">
                {it.raw_count}회 ({(it.share * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
                className={`h-full ${barColor}`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function DailyChart({ daily }: { daily: DailyStat[] }) {
  const max = Math.max(...daily.map((d) => d.attempts), 1);
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-end gap-1 h-32">
        {daily.map((d, i) => {
          const h = (d.attempts / max) * 100;
          const accuracy = d.attempts > 0 ? d.correct / d.attempts : 0;
          return (
            <motion.div
              key={d.day}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.02, duration: 0.4 }}
              className="flex-1 min-w-[4px] rounded-t"
              style={{
                background: `linear-gradient(to top, rgba(99,102,241,${0.3 + accuracy * 0.6}), rgba(139,92,246,${0.3 + accuracy * 0.6}))`,
              }}
              title={`${d.day}: ${d.correct}/${d.attempts} (${Math.round(accuracy * 100)}%)`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-white/40">
        <span>{daily[0]?.day}</span>
        <span>{daily[daily.length - 1]?.day}</span>
      </div>
    </div>
  );
}

function LayerStuckChart({ points }: { points: LayerSeriesPoint[] }) {
  // Layer 별 attempts/successes 합산 (area 무관)
  const byLayer = new Map<number, { attempts: number; successes: number }>();
  for (const p of points) {
    const cur = byLayer.get(p.layer) ?? { attempts: 0, successes: 0 };
    cur.attempts += p.attempts;
    cur.successes += p.successes;
    byLayer.set(p.layer, cur);
  }
  const layers = Array.from(byLayer.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([layer, v]) => ({
      layer,
      attempts: v.attempts,
      successes: v.successes,
      pass_rate: v.attempts > 0 ? v.successes / v.attempts : 0,
    }));

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
      {layers.map((l, i) => (
        <motion.div
          key={l.layer}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3"
        >
          <span className="text-xs font-mono text-white/60 w-8">L{l.layer}</span>
          <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${l.pass_rate * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            />
          </div>
          <span className="text-xs text-white/60 tabular-nums w-24 text-right">
            {l.successes}/{l.attempts} ({Math.round(l.pass_rate * 100)}%)
          </span>
        </motion.div>
      ))}
    </div>
  );
}
