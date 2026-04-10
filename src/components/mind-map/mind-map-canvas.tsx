"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MindMapNode } from "@/lib/mind-map/build-tree";
import { getNodeColor } from "@/lib/mind-map/build-tree";
import { computeLayout, type LayoutNode } from "@/lib/mind-map/layout";

/* ── 상수 ── */
const MIN_SCALE = 0.15;
const MAX_SCALE = 2.5;
const ZOOM_FACTOR = 0.001;

interface MindMapCanvasProps {
  root: MindMapNode;
}

export function MindMapCanvas({ root }: MindMapCanvasProps) {
  // ── 상태 ──
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(["root"]) // 루트 확장 → 챕터 보임
  );
  const [detailNode, setDetailNode] = useState<MindMapNode | null>(null);

  // ── Pan / Zoom ──
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 0.85 });
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // ── 레이아웃 계산 ──
  const layoutNodes = useMemo(
    () => computeLayout(root, expandedIds),
    [root, expandedIds]
  );

  // ── 노드 클릭 ──
  const handleNodeClick = useCallback(
    (layoutNode: LayoutNode) => {
      const node = layoutNode.node;

      // leaf 노드 + detail → 팝오버 표시
      if (node.children.length === 0 && node.detail) {
        setDetailNode((prev) => (prev?.id === node.id ? null : node));
        return;
      }

      // 자식 없으면 무시
      if (node.children.length === 0) return;

      // expand / collapse 토글
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          // collapse: 이 노드와 모든 하위 노드 접기
          collapseRecursive(node, next);
        } else {
          next.add(node.id);
        }
        return next;
      });

      // 깊이 2+ → 센터링
      if (node.depth >= 2) {
        setCamera((prev) => ({
          ...prev,
          x: -layoutNode.x,
          y: -layoutNode.y,
        }));
      }

      // detail 팝오버 닫기
      setDetailNode(null);
    },
    []
  );

  // ── 재귀 접기 ──
  function collapseRecursive(node: MindMapNode, set: Set<string>) {
    set.delete(node.id);
    for (const child of node.children) {
      collapseRecursive(child, set);
    }
  }

  // ── 마우스 이벤트: Pan ──
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setCamera((prev) => ({
      ...prev,
      x: prev.x + dx / prev.scale,
      y: prev.y + dy / prev.scale,
    }));
  }, []);

  const onPointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // ── 휠: Zoom ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setCamera((prev) => {
        const delta = -e.deltaY * ZOOM_FACTOR;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta));
        return { ...prev, scale: newScale };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // ── 홈 리셋 ──
  const resetView = useCallback(() => {
    setExpandedIds(new Set(["root"]));
    setCamera({ x: 0, y: 0, scale: 0.85 });
    setDetailNode(null);
  }, []);

  // ── 연결선 데이터 ──
  const edges = useMemo(
    () => layoutNodes.filter((n) => n.parentId !== null),
    [layoutNodes]
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 줌/홈 컨트롤 */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setCamera((p) => ({ ...p, scale: Math.min(MAX_SCALE, p.scale + 0.15) }))}
          className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-lg font-bold transition-all"
        >
          +
        </button>
        <button
          onClick={() => setCamera((p) => ({ ...p, scale: Math.max(MIN_SCALE, p.scale - 0.15) }))}
          className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-lg font-bold transition-all"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-bold transition-all"
          title="홈으로"
        >
          ⌂
        </button>
      </div>

      {/* 캔버스 */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="w-full h-full relative"
          style={{
            transform: `scale(${camera.scale})`,
            transformOrigin: "50% 50%",
          }}
        >
          {/* 연결선 (SVG) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <g
              transform={`translate(${camera.x + (containerRef.current?.clientWidth ?? 0) / 2 / camera.scale}, ${camera.y + (containerRef.current?.clientHeight ?? 0) / 2 / camera.scale})`}
            >
              {edges.map((edge) => {
                const color = getNodeColor(edge.node.siblingIndex);
                return (
                  <line
                    key={`edge-${edge.id}`}
                    x1={edge.parentX}
                    y1={edge.parentY}
                    x2={edge.x}
                    y2={edge.y}
                    stroke={color.border}
                    strokeWidth={edge.node.depth <= 1 ? 2.5 : 1.5}
                    strokeOpacity={0.5}
                  />
                );
              })}
            </g>
          </svg>

          {/* 노드 */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(${camera.x}px, ${camera.y}px)`,
            }}
          >
            <AnimatePresence mode="popLayout">
              {layoutNodes.map((ln) => (
                <MindMapNodeCard
                  key={ln.id}
                  layoutNode={ln}
                  isExpanded={expandedIds.has(ln.id)}
                  hasChildren={ln.node.children.length > 0}
                  onClick={() => handleNodeClick(ln)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail 팝오버 */}
      <AnimatePresence>
        {detailNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[90%]"
          >
            <div className="bg-[#1a1a2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white font-bold text-base">
                  {detailNode.label}
                </h3>
                <button
                  onClick={() => setDetailNode(null)}
                  className="text-white/40 hover:text-white/80 text-sm transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {detailNode.detail}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 노드 카드 ── */

function MindMapNodeCard({
  layoutNode,
  isExpanded,
  hasChildren,
  onClick,
}: {
  layoutNode: LayoutNode;
  isExpanded: boolean;
  hasChildren: boolean;
  onClick: () => void;
}) {
  const { node, x, y } = layoutNode;
  const color = getNodeColor(node.siblingIndex);
  const isRoot = node.depth === 0;
  const isLeaf = !hasChildren;

  // 노드 크기: 깊이에 따라 축소
  const sizeClass = isRoot
    ? "min-w-[140px] max-w-[180px] px-5 py-3.5"
    : node.depth <= 1
      ? "min-w-[120px] max-w-[200px] px-4 py-2.5"
      : node.depth <= 2
        ? "min-w-[100px] max-w-[200px] px-3 py-2"
        : "min-w-[80px] max-w-[180px] px-2.5 py-1.5";

  const fontSize = isRoot
    ? "text-base font-bold"
    : node.depth <= 1
      ? "text-sm font-semibold"
      : node.depth <= 2
        ? "text-xs font-semibold"
        : "text-[11px] font-medium";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none ${sizeClass}`}
      style={{
        left: x,
        top: y,
        background: isRoot
          ? "rgba(15,15,35,0.9)"
          : color.glass,
        backdropFilter: "blur(16px) saturate(1.4)",
        border: `1.5px solid ${isRoot ? "rgba(255,255,255,0.2)" : color.border}`,
        borderRadius: isRoot ? 20 : node.depth <= 2 ? 14 : 10,
        boxShadow: isExpanded
          ? `0 0 20px ${color.bg}30, 0 4px 15px rgba(0,0,0,0.3)`
          : "0 2px 10px rgba(0,0,0,0.2)",
      }}
      whileHover={{
        scale: 1.08,
        boxShadow: `0 0 25px ${color.bg}40, 0 6px 20px rgba(0,0,0,0.3)`,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <p
        className={`text-center leading-tight ${fontSize}`}
        style={{ color: isRoot ? "#fff" : color.text }}
      >
        {node.label}
      </p>

      {/* 확장 인디케이터 */}
      {hasChildren && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 flex items-center justify-center rounded-full text-[8px]"
          style={{
            background: color.bg + "40",
            color: color.text,
          }}
        >
          {isExpanded ? "−" : "+"}
        </div>
      )}

      {/* leaf + detail 인디케이터 */}
      {isLeaf && node.detail && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ background: color.bg, opacity: 0.6 }}
          title="클릭하여 상세 내용 보기"
        />
      )}
    </motion.div>
  );
}
