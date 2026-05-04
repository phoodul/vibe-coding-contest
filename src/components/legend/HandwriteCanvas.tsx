"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  points: Point[];
  color: string;
}

export interface HandwriteSubmitMeta {
  width: number;
  height: number;
  strokeCount: number;
}

interface HandwriteCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  /** "도와줘" 버튼 클릭 시 호출. dataUrl 은 PNG. */
  onSubmit: (dataUrl: string, meta: HandwriteSubmitMeta) => void;
  helpLabel?: string;
  disabled?: boolean;
}

const PEN_COLOR = "#0f172a"; // slate-900
const BG_COLOR = "#ffffff";
const MIN_LINE = 1.2;
const MAX_LINE = 4.5;

function lineWidthFor(pressure: number): number {
  // pressure 0..1. 0 이면 마우스 등 무압력 → 평균값
  const p = pressure > 0 ? pressure : 0.5;
  return MIN_LINE + (MAX_LINE - MIN_LINE) * p;
}

export function HandwriteCanvas({
  width = 1024,
  height = 640,
  className,
  onSubmit,
  helpLabel = "도와줘",
  disabled = false,
}: HandwriteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const drawingRef = useRef<{ active: boolean; current: Stroke | null }>({
    active: false,
    current: null,
  });
  const [, force] = useState(0);

  // 캔버스 초기화 + 모든 stroke 다시 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = PEN_COLOR;

    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
  }, [strokes, width, height]);

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) {
      // 점 한 개 — 작은 원으로 표시
      const p = stroke.points[0];
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, lineWidthFor(p.pressure) / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.strokeStyle = stroke.color;
    for (let i = 1; i < stroke.points.length; i++) {
      const a = stroke.points[i - 1];
      const b = stroke.points[i];
      ctx.beginPath();
      ctx.lineWidth = lineWidthFor((a.pressure + b.pressure) / 2);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  function getCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      pressure: e.pressure,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e);
    const stroke: Stroke = { points: [point], color: PEN_COLOR };
    drawingRef.current = { active: true, current: stroke };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const state = drawingRef.current;
    if (!state.active || !state.current) return;
    const point = getCanvasPoint(e);
    state.current.points.push(point);
    // 즉시 화면 반영 — 마지막 segment 만 그림
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && state.current.points.length >= 2) {
      const a = state.current.points[state.current.points.length - 2];
      const b = state.current.points[state.current.points.length - 1];
      ctx.strokeStyle = state.current.color;
      ctx.lineWidth = lineWidthFor((a.pressure + b.pressure) / 2);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const state = drawingRef.current;
    if (!state.active || !state.current) return;
    canvasRef.current?.releasePointerCapture(e.pointerId);
    const finished = state.current;
    drawingRef.current = { active: false, current: null };
    if (finished.points.length === 0) return;
    setStrokes((prev) => [...prev, finished]);
  }

  function handleUndo() {
    setStrokes((prev) => prev.slice(0, -1));
    force((n) => n + 1);
  }

  function handleClear() {
    setStrokes([]);
    force((n) => n + 1);
  }

  function handleSubmit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSubmit(dataUrl, {
      width: canvas.width,
      height: canvas.height,
      strokeCount: strokes.length,
    });
  }

  const isEmpty = strokes.length === 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="rounded-xl border border-white/10 bg-white shadow-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="block w-full h-auto touch-none cursor-crosshair"
          style={{ aspectRatio: `${width} / ${height}` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={isEmpty || disabled}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 disabled:opacity-40"
        >
          ↶ 한 획 지우기
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isEmpty || disabled}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 disabled:opacity-40"
        >
          전체 지우기
        </button>
        <div className="ml-auto text-xs text-white/40">
          {strokes.length} 획
        </div>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty || disabled}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-lg disabled:opacity-40"
        >
          {helpLabel}
        </motion.button>
      </div>
    </div>
  );
}
