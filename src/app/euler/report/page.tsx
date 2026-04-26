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

interface ChainTerminationDist {
  reached_conditions: number;
  max_depth: number;
  dead_end: number;
  cycle: number;
}

interface ChainStats {
  executed_count: number;
  avg_depth: number;
  distribution: ChainTerminationDist;
  success_rate: number;
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
  first_solve_at: string | null;
  total_solves_ever: number;
  chain?: ChainStats;
}

const REPORT_MIN_DAYS = 7;
const REPORT_MIN_PROBLEMS = 10;

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (24 * 3600 * 1000));
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
        // 주 1회 리포트: 최근 7일 데이터 기반
        const [w, p] = await Promise.all([
          fetch("/api/euler-tutor/report/weakness?window=7").then((r) => r.json()),
          fetch("/api/euler-tutor/report/progress?days=7").then((r) => r.json()),
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

  // 리포트 자격 검사 — 첫 풀이 후 7일 경과 + 누적 10문제 풀이
  const daysElapsed = daysSince(progress?.first_solve_at ?? null);
  const totalEver = progress?.total_solves_ever ?? 0;
  const eligibleDays = daysElapsed >= REPORT_MIN_DAYS;
  const eligibleProblems = totalEver >= REPORT_MIN_PROBLEMS;
  const eligible = eligibleDays && eligibleProblems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">이번 주 오일러 리포트</h1>
            <p className="text-sm text-white/60 mt-1">
              최근 7일간의 풀이를 분석한 약점 진단입니다. 매주 갱신돼요.
            </p>
          </div>
          <Link href="/euler-tutor" className="text-sm text-white/60 hover:text-white">
            ← 채팅
          </Link>
        </div>

        {/* 자격 미달 안내 */}
        {!eligible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-400/30"
          >
            <h2 className="text-lg font-bold mb-2">📚 리포트 준비 중</h2>
            <p className="text-sm text-white/70 mb-4">
              정확한 약점 진단을 위해 <strong>최소 {REPORT_MIN_PROBLEMS}문제 풀이</strong> + <strong>{REPORT_MIN_DAYS}일</strong> 학습 데이터가 필요해요.
              꾸준히 풀어주시면 일주일 후부터 매주 새 리포트가 생성됩니다.
            </p>
            <div className="space-y-3">
              <Progress
                label="문제 풀이"
                current={Math.min(totalEver, REPORT_MIN_PROBLEMS)}
                target={REPORT_MIN_PROBLEMS}
                done={eligibleProblems}
                hint={`${totalEver} / ${REPORT_MIN_PROBLEMS}문제`}
              />
              <Progress
                label="학습 기간"
                current={Math.min(daysElapsed, REPORT_MIN_DAYS)}
                target={REPORT_MIN_DAYS}
                done={eligibleDays}
                hint={
                  progress?.first_solve_at
                    ? `${daysElapsed} / ${REPORT_MIN_DAYS}일 (시작: ${progress.first_solve_at.slice(0, 10)})`
                    : "아직 풀이 기록이 없어요"
                }
              />
            </div>
            <Link
              href="/euler-tutor"
              className="mt-5 inline-block px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold transition-colors"
            >
              지금 풀이 시작하기 →
            </Link>
          </motion.div>
        )}

        {/* 요약 카드 — 자격 충족 시만 */}
        {eligible && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <SummaryCard label="풀이 수" value={progress?.total_attempts ?? 0} />
          <SummaryCard label="정답률" value={`${accuracy}%`} />
          <SummaryCard label="사용한 도구" value={progress?.distinct_tools_used ?? 0} />
        </div>
        )}

        {/* 자격 충족 시만 표시 */}
        {eligible && (
        <>
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

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Layer 별 통과율</h2>
          {progress && progress.layer_series.length > 0 ? (
            <LayerStuckChart points={progress.layer_series} />
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-white/50">
              Layer 통계가 아직 누적되지 않았어요.
            </div>
          )}
        </section>

        {/* Phase G-03: Recursive Chain 종료 분포 — 난이도 5+ 문제만 누적 */}
        {progress?.chain && progress.chain.executed_count > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-1">사고 분해 패턴 (난이도 5+)</h2>
            <p className="text-xs text-white/50 mb-3">
              어려운 문제 {progress.chain.executed_count}건에 대해 AI 가 역행 분해 chain 을
              시도했어요. 평균 {progress.chain.avg_depth.toFixed(1)} depth.
              조건 도달률 {Math.round(progress.chain.success_rate * 100)}%.
            </p>
            <ChainTerminationChart chain={progress.chain} />
          </section>
        )}
        </>
        )}
      </div>
    </div>
  );
}

function Progress({
  label,
  current,
  target,
  done,
  hint,
}: {
  label: string;
  current: number;
  target: number;
  done: boolean;
  hint: string;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
        <span className="font-medium">
          {done ? "✓ " : ""}
          {label}
        </span>
        <span className="tabular-nums">{hint}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full ${done ? "bg-emerald-400/70" : "bg-violet-400/60"}`}
        />
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

function ChainTerminationChart({ chain }: { chain: ChainStats }) {
  const total = chain.executed_count;
  const items: { key: keyof ChainTerminationDist; label: string; color: string; hint: string }[] = [
    {
      key: "reached_conditions",
      label: "조건 도달 ✓",
      color: "bg-emerald-500/60",
      hint: "분해가 주어진 조건과 매칭 — 완전한 풀이 경로 확보",
    },
    {
      key: "max_depth",
      label: "최대 깊이 도달",
      color: "bg-amber-500/60",
      hint: "5 depth 동안 조건에 닿지 못함 — 더 잘게 분해 필요",
    },
    {
      key: "dead_end",
      label: "막다른 길",
      color: "bg-rose-500/60",
      hint: "다음 subgoal 을 분해하지 못함 — 새로운 도구·관점 필요",
    },
    {
      key: "cycle",
      label: "순환",
      color: "bg-violet-500/60",
      hint: "이전 subgoal 로 회귀 — 다른 방향의 접근 필요",
    },
  ];
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
      {items.map((it, i) => {
        const v = chain.distribution[it.key];
        const pct = total > 0 ? (v / total) * 100 : 0;
        return (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg bg-white/5 border border-white/10 p-3"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{it.label}</span>
              <span className="text-xs text-white/60 tabular-nums">
                {v}건 ({pct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`h-full ${it.color}`}
              />
            </div>
            <p className="text-[10px] text-white/40 mt-1.5">{it.hint}</p>
          </motion.div>
        );
      })}
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
