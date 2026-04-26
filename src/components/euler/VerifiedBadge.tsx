"use client";

import { motion } from "framer-motion";

interface VerifiedBadgeProps {
  verified: boolean;
  confidence: number;
  sources: ("sympy" | "wolfram")[];
  message?: string;
  /** 컴팩트 모드 — 인라인 텍스트 옆에 작게 */
  compact?: boolean;
}

/**
 * "두 엔진이 동일한 답을 도출 → 신뢰도 99%" 시각 배지.
 *
 * Phase F-06: 학생 신뢰의 핵심 차별화 UI.
 *   ChatGPT / Khanmigo / Photomath 모두 단일 엔진 — 우리만 다중 검증.
 *
 * verified=true & confidence>=0.95 → 진초록 배지
 * verified=false & confidence>=0.7  → 주황 (단독 엔진)
 * verified=false & confidence<0.5   → 빨강 (불일치)
 */
export function VerifiedBadge({
  verified,
  confidence,
  sources,
  message,
  compact = false,
}: VerifiedBadgeProps) {
  const isHighConfidence = verified && confidence >= 0.95;
  const isMidConfidence = !verified && confidence >= 0.6;
  const tone = isHighConfidence ? "ok" : isMidConfidence ? "warn" : "err";

  const palette = {
    ok: {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/40",
      text: "text-emerald-200",
      icon: "✓",
    },
    warn: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/40",
      text: "text-amber-200",
      icon: "⚐",
    },
    err: {
      bg: "bg-rose-500/15",
      border: "border-rose-500/40",
      text: "text-rose-200",
      icon: "⚠",
    },
  }[tone];

  const sourceLabel = sources
    .map((s) => (s === "sympy" ? "SymPy" : "Wolfram"))
    .join(" + ");

  if (compact) {
    return (
      <span
        title={message ?? ""}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border ${palette.bg} ${palette.border} ${palette.text}`}
      >
        {palette.icon} {sourceLabel} · {(confidence * 100).toFixed(0)}%
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-start gap-2 px-3 py-1.5 rounded-lg text-xs border ${palette.bg} ${palette.border} ${palette.text}`}
    >
      <span className="text-base leading-none mt-0.5">{palette.icon}</span>
      <div className="flex flex-col">
        <span className="font-bold">
          {sourceLabel} 검증 · 신뢰도 {(confidence * 100).toFixed(0)}%
        </span>
        {message && <span className="opacity-75 mt-0.5">{message}</span>}
      </div>
    </motion.div>
  );
}

interface PlotImageProps {
  /** /api/euler-tutor/sympy 응답에서 받은 base64 PNG (data: 접두사 없이 raw) */
  pngBase64: string;
  alt?: string;
  caption?: string;
}

/**
 * SymPy μSvc 의 plot_function/plot_region/plot_geometry 응답을 인라인 표시.
 */
export function PlotImage({ pngBase64, alt = "그래프", caption }: PlotImageProps) {
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-3 inline-block rounded-lg overflow-hidden border border-white/10 bg-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${pngBase64}`}
        alt={alt}
        className="block max-w-full h-auto"
      />
      {caption && (
        <figcaption className="px-2 py-1 text-[11px] text-white/60 bg-black/40">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}
