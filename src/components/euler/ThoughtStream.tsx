"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type ThoughtStage =
  | "idle"
  | "manager" // 문제 분류·변수 추출 (Phase B)
  | "retriever" // 도구 검색 (Phase B)
  | "critic" // Critic 검증/진단 (Phase A~)
  | "reasoner" // BFS 추론 (Phase C)
  | "coaching" // 코칭 응답 생성
  | "done";

interface StageMeta {
  id: ThoughtStage;
  label: string;
  hint: string;
}

const STAGES: StageMeta[] = [
  { id: "manager", label: "분류", hint: "문제 분류·변수 추출" },
  { id: "retriever", label: "도구 검색", hint: "관련 정리·공식 찾기" },
  { id: "critic", label: "검증", hint: "풀이 정합성 점검" },
  { id: "reasoner", label: "추론", hint: "순행·역행 BFS" },
  { id: "coaching", label: "코칭", hint: "단계 안내 생성" },
];

export interface RetrievedToolPreview {
  tool_name: string;
  tool_layer: number;
  why_text: string;
}

interface ThoughtStreamProps {
  current: ThoughtStage;
  /** Phase A 에서는 manager/retriever/reasoner 를 숨겨도 좋다. */
  hide?: ThoughtStage[];
  className?: string;
  /** Retriever 가 가져온 도구 미리보기. 비어있으면 카드 미표시. */
  retrievedTools?: RetrievedToolPreview[];
}

const ORDER: ThoughtStage[] = ["manager", "retriever", "critic", "reasoner", "coaching"];

export function ThoughtStream({
  current,
  hide = [],
  className,
  retrievedTools,
}: ThoughtStreamProps) {
  if (current === "idle" || current === "done") return null;

  const visible = STAGES.filter((s) => !hide.includes(s.id));
  const currentIndex = ORDER.indexOf(current);
  const showTools = retrievedTools && retrievedTools.length > 0;

  return (
    <div className={cn("py-3", className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <AnimatePresence mode="popLayout">
          {visible.map((stage, i) => {
            const stageIndex = ORDER.indexOf(stage.id);
            const status: "done" | "active" | "pending" =
              stageIndex < currentIndex
                ? "done"
                : stageIndex === currentIndex
                  ? "active"
                  : "pending";

            return (
              <motion.div
                key={stage.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex items-center gap-2"
              >
                <div
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                    status === "done" &&
                      "bg-emerald-500/10 border-emerald-400/40 text-emerald-200",
                    status === "active" &&
                      "bg-violet-500/15 border-violet-400/50 text-violet-200",
                    status === "pending" &&
                      "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  {status === "active" && (
                    <motion.span
                      className="inline-block mr-1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                    >
                      ◐
                    </motion.span>
                  )}
                  {status === "done" && <span className="mr-1">✓</span>}
                  {stage.label}
                </div>
                {i < visible.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-4 transition-colors",
                      stageIndex < currentIndex ? "bg-emerald-400/40" : "bg-white/10"
                    )}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showTools && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
        >
          {retrievedTools!.slice(0, 6).map((t, i) => (
            <motion.div
              key={`${t.tool_name}-${i}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="shrink-0 max-w-[260px] px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  L{t.tool_layer}
                </span>
                <span className="text-xs font-semibold text-emerald-100 truncate">
                  {t.tool_name}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-white/60 line-clamp-2">{t.why_text}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/**
 * useChat 의 `data` 스트림에서 마지막 stage 값을 추출하는 헬퍼.
 * orchestrator 가 `{ stage: ThoughtStage }` 형태로 data 를 흘려보낸다고 가정.
 */
export function pickLatestStage(data: unknown[] | undefined): ThoughtStage {
  if (!data || data.length === 0) return "idle";
  for (let i = data.length - 1; i >= 0; i--) {
    const item = data[i] as { stage?: ThoughtStage } | undefined;
    if (item && typeof item === "object" && "stage" in item && item.stage) {
      return item.stage;
    }
  }
  return "idle";
}
