/**
 * 약점 분석 — euler_solve_logs + user_skill_stats + user_layer_stats 를 조합하여
 * 7종 진단 카테고리별 점수 산출.
 *
 * project-decisions.md: 단순 정답률이 아닌 "어디서·왜 막히는가" 진단.
 */

import { createClient } from "@/lib/supabase/server";

export const DIAGNOSIS_KEYS = [
  "L12_computation",
  "L5_domain_id",
  "L6_recall",
  "L6_trigger",
  "L7_forward",
  "L7_backward",
  "L8_parse",
] as const;
export type DiagnosisKey = (typeof DIAGNOSIS_KEYS)[number];

export interface DiagnosisItem {
  key: DiagnosisKey;
  label: string;
  raw_count: number;
  share: number; // 0..1 (전체 stuck/failure 대비 비율)
  weight: number; // 가중 점수 (raw_count × share)
  level: "low" | "medium" | "high";
}

export interface WeaknessReport {
  total_attempts: number;
  total_correct: number;
  recent_window_days: number;
  items: DiagnosisItem[];
  /** Sonnet 이 생성한 자연어 추천 멘트 (1~2문단) */
  recommendation_text: string | null;
}

interface LayerRow {
  layer: number;
  area: string;
  attempts: number;
  successes: number;
  stuck_count: number;
  failure_count: number;
  l6_recall_miss: number;
  l6_trigger_miss: number;
  l5_domain_miss: number;
}

interface SolveLogRow {
  area: string | null;
  is_correct: boolean | null;
  stuck_layer: number | null;
  stuck_reason: string | null;
}

const LABELS: Record<DiagnosisKey, string> = {
  L12_computation: "L1~2 계산 미숙",
  L5_domain_id: "L5 영역 인식 실패",
  L6_recall: "L6 Recall — 도구 자체를 떠올리지 못함",
  L6_trigger: "L6 Trigger — 도구는 알지만 적용 시점 매칭 실패",
  L7_forward: "L7 Forward dead-end — 순행 BFS 폭 부족",
  L7_backward: "L7 Backward dead-end — 역추적 부족",
  L8_parse: "L8 Parse 실패 — 자연어→식 변환",
};

function classifyLevel(share: number, raw: number): "low" | "medium" | "high" {
  if (raw === 0) return "low";
  if (share >= 0.3 || raw >= 8) return "high";
  if (share >= 0.15 || raw >= 3) return "medium";
  return "low";
}

export async function aggregateWeakness(opts?: {
  windowDays?: number;
}): Promise<WeaknessReport | null> {
  const windowDays = opts?.windowDays ?? 30;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const sinceIso = new Date(Date.now() - windowDays * 24 * 3600 * 1000).toISOString();

  const [{ data: layerRows }, { data: logRows }] = await Promise.all([
    supabase
      .from("user_layer_stats")
      .select(
        "layer, area, attempts, successes, stuck_count, failure_count, l6_recall_miss, l6_trigger_miss, l5_domain_miss"
      )
      .eq("user_id", user.id),
    supabase
      .from("euler_solve_logs")
      .select("area, is_correct, stuck_layer, stuck_reason")
      .eq("user_id", user.id)
      .gte("created_at", sinceIso),
  ]);

  const layers = (layerRows ?? []) as LayerRow[];
  const logs = (logRows ?? []) as SolveLogRow[];

  const totalAttempts = logs.length;
  const totalCorrect = logs.filter((l) => l.is_correct === true).length;

  // 카운트 집계
  const counts: Record<DiagnosisKey, number> = {
    L12_computation: 0,
    L5_domain_id: 0,
    L6_recall: 0,
    L6_trigger: 0,
    L7_forward: 0,
    L7_backward: 0,
    L8_parse: 0,
  };

  // layer_stats 기준
  for (const r of layers) {
    if (r.layer >= 1 && r.layer <= 4) counts.L12_computation += r.failure_count;
    if (r.layer === 5) counts.L5_domain_id += r.l5_domain_miss;
    if (r.layer === 6) {
      counts.L6_recall += r.l6_recall_miss;
      counts.L6_trigger += r.l6_trigger_miss;
    }
    // L7 stuck 은 reason 으로만 구분 가능 → solve_logs 사용
    if (r.layer === 8) counts.L8_parse += r.stuck_count;
  }

  // solve_logs 의 stuck_reason 으로 L7 forward/backward 분리
  for (const log of logs) {
    if (log.stuck_reason === "forward_dead_end") counts.L7_forward += 1;
    else if (log.stuck_reason === "backward_dead_end") counts.L7_backward += 1;
    // 그 외 stuck_reason 은 위 layer_stats 와 중복 카운트 회피
  }

  const totalSignal = Object.values(counts).reduce((a, b) => a + b, 0);

  const items: DiagnosisItem[] = DIAGNOSIS_KEYS.map((k) => {
    const raw = counts[k];
    const share = totalSignal > 0 ? raw / totalSignal : 0;
    return {
      key: k,
      label: LABELS[k],
      raw_count: raw,
      share,
      weight: raw * share,
      level: classifyLevel(share, raw),
    };
  });

  // 추천 멘트 생성
  let recommendation_text: string | null = null;
  if (totalSignal > 0) {
    try {
      const top = items
        .filter((i) => i.raw_count > 0)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3);
      if (top.length) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (apiKey) {
          const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-5-20250929",
              max_tokens: 600,
              system: `당신은 학생에게 친절하게 약점 분석 결과를 전달하는 수학 코치입니다.
1~2문단 (4~6문장). 따뜻한 존댓말. 비판 금지.
- 가장 두드러진 1~2개 약점에 집중
- 무엇을 다음 1주일간 연습하면 좋을지 구체적 1~2 행동 제안
- LaTeX 사용 금지 (자연어만)`,
              messages: [
                {
                  role: "user",
                  content: `최근 ${windowDays}일 약점 진단:\n${top
                    .map((i) => `- ${i.label}: ${i.raw_count}회 (${(i.share * 100).toFixed(0)}%)`)
                    .join("\n")}\n\n학생에게 전달할 1~2문단 추천 멘트를 한국어로 작성하세요.`,
                },
              ],
            }),
          });
          if (resp.ok) {
            const data = (await resp.json()) as { content?: { text?: string }[] };
            recommendation_text = data.content?.[0]?.text ?? null;
          }
        }
      }
    } catch (e) {
      console.warn("[weakness-aggregator] recommendation failed:", e);
    }
  }

  return {
    total_attempts: totalAttempts,
    total_correct: totalCorrect,
    recent_window_days: windowDays,
    items,
    recommendation_text,
  };
}
