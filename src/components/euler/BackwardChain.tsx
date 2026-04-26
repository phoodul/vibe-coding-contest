"use client";

/**
 * BackwardChain — Phase G-02 chain 시각화 컴포넌트.
 *
 * 사용자 결정 (5차 세션):
 *   "chain 시각화는 난이도 5+ 만 (단순엔 억지)"
 *   "선생님은 이렇게 생각했어요" 형식
 *
 * 데이터 입수: useChat 의 `data` 배열에서 `kind === "recursive_chain"` payload 추출.
 * route.ts (G02-C) 가 streamData.append(...) 로 흘려보냄.
 */

import { motion } from "framer-motion";

export interface BackwardChainNode {
  depth: number;
  goal: string;
  tool: string | null;
  rationale: string;
  next_subgoal: string | null;
  reached_conditions: boolean;
}

export interface RecursiveChainPayload {
  kind: "recursive_chain";
  chain: BackwardChainNode[];
  termination: "reached_conditions" | "max_depth" | "dead_end" | "cycle";
  used_tools: string[];
  duration_ms: number;
}

interface Props {
  payload: RecursiveChainPayload;
  className?: string;
}

const TERMINATION_LABEL: Record<RecursiveChainPayload["termination"], string> = {
  reached_conditions: "✅ 마지막 단계가 주어진 조건과 매칭되어 풀이가 닫혔어요.",
  max_depth: "⏱ 깊이 한도에 도달했어요. 더 분해할 단계가 있을 수 있어요.",
  dead_end: "🔍 더 분해할 수 없는 지점이에요. 새로운 보조 도구가 필요해요.",
  cycle: "🔁 chain 이 이전 단계로 돌아오려 했어요. 다른 접근을 고민해요.",
};

export function BackwardChain({ payload, className }: Props) {
  if (!payload?.chain?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`my-3 rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent p-4 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🧭</span>
        <h3 className="text-sm font-bold text-violet-200">선생님은 이렇게 생각했어요</h3>
        <span className="ml-auto text-[10px] text-violet-300/70">
          depth {payload.chain.length} · {(payload.duration_ms / 1000).toFixed(1)}s
        </span>
      </div>

      <ol className="space-y-2.5">
        {payload.chain.map((n, i) => (
          <motion.li
            key={`${n.depth}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.07 }}
            className="relative pl-8"
          >
            {/* depth 번호 뱃지 */}
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-[10px] font-mono font-bold text-violet-200">
              {n.depth}
            </div>
            {/* 연결선 */}
            {i < payload.chain.length - 1 && (
              <div className="absolute left-[11px] top-6 w-px h-[calc(100%+0.4rem)] bg-violet-400/20" />
            )}

            <div className="text-xs text-violet-100/95 leading-relaxed">
              <span className="font-semibold">
                {n.depth === 0 ? "최종 목표" : "↳ 그래서 풀어야 할 것"}:
              </span>{" "}
              <span className="text-white/90">{n.goal}</span>
            </div>

            {n.tool && (
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] text-emerald-200">
                <span>🛠</span>
                <span className="font-medium">{n.tool}</span>
              </div>
            )}

            {n.rationale && (
              <p className="mt-1.5 text-[11px] text-white/65 leading-relaxed">
                {n.rationale}
              </p>
            )}

            {n.reached_conditions && (
              <div className="mt-1 text-[10px] text-emerald-300/90">
                ↳ 주어진 조건과 직접 매칭 ✓
              </div>
            )}
          </motion.li>
        ))}
      </ol>

      <p className="mt-3 pt-2.5 border-t border-violet-400/20 text-[10px] text-violet-200/70">
        {TERMINATION_LABEL[payload.termination]}
      </p>
    </motion.div>
  );
}

/**
 * useChat 의 `data` 배열에서 가장 최근 recursive_chain payload 를 추출.
 * payload 가 여러 번 append 된 경우 마지막 것 사용 (새 문제 시작 시 갱신).
 */
export function pickLatestChain(
  data: unknown[] | undefined
): RecursiveChainPayload | null {
  if (!data || data.length === 0) return null;
  for (let i = data.length - 1; i >= 0; i--) {
    const item = data[i] as RecursiveChainPayload | undefined;
    if (item && typeof item === "object" && "kind" in item && item.kind === "recursive_chain") {
      return item;
    }
  }
  return null;
}
