"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MindMapNode } from "@/lib/mind-map/build-tree";
import { getNodeColor, findNode, getAncestors } from "@/lib/mind-map/build-tree";

interface MindMapCanvasProps {
  root: MindMapNode;
}

export function MindMapCanvas({ root }: MindMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedId, setFocusedId] = useState("root");
  const [detailNode, setDetailNode] = useState<MindMapNode | null>(null);
  const [size, setSize] = useState({ w: 1000, h: 700 });

  // 컨테이너 크기 추적
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize({ w: width, h: height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const focused = useMemo(
    () => findNode(root, focusedId) ?? root,
    [root, focusedId],
  );
  const ancestors = useMemo(
    () => getAncestors(root, focusedId),
    [root, focusedId],
  );
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : null;
  const children = focused.children;

  const cx = size.w / 2;
  const cy = size.h / 2;

  // 부모 위치
  const parentY = cy - size.h * 0.32;

  // 자식 위치: 하단 반원 배치
  const childPositions = useMemo(() => {
    const n = children.length;
    if (n === 0) return [];

    const maxR = Math.min(size.w * 0.42, size.h * 0.32);
    const r = Math.max(160, Math.min(maxR, n * 55));

    // 하단 반원: 20° ~ 160° (직각좌표에서 아래쪽)
    const startAngle = Math.PI * 0.12;
    const endAngle = Math.PI * 0.88;
    const step = n <= 1 ? 0 : (endAngle - startAngle) / (n - 1);

    return children.map((child, i) => {
      const angle = n === 1 ? Math.PI / 2 : startAngle + i * step;
      return {
        node: child,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
  }, [children, cx, cy, size]);

  // 자식 클릭: 하위로 drill-in
  const handleChildClick = useCallback((node: MindMapNode) => {
    if (node.children.length === 0) {
      if (node.detail) {
        setDetailNode((prev) => (prev?.id === node.id ? null : node));
      }
      return;
    }
    setFocusedId(node.id);
    setDetailNode(null);
  }, []);

  // 브레드크럼 / 부모 클릭: 상위로 이동
  const goTo = useCallback((id: string) => {
    setFocusedId(id);
    setDetailNode(null);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* ── 브레드크럼 ── */}
      <nav className="px-5 py-2.5 flex items-center gap-1.5 flex-shrink-0 overflow-x-auto border-b border-white/5 bg-[#0a0a1a]/50">
        {ancestors.slice(0, -1).map((a) => (
          <Fragment key={a.id}>
            <button
              onClick={() => goTo(a.id)}
              className="text-white/40 hover:text-white/70 transition-colors whitespace-nowrap text-sm"
            >
              {a.label}
            </button>
            <span className="text-white/20 text-sm">›</span>
          </Fragment>
        ))}
        {parent && (
          <>
            <button
              onClick={() => goTo(parent.id)}
              className="text-white/50 hover:text-white/80 transition-colors whitespace-nowrap text-sm font-medium"
            >
              {parent.label}
            </button>
            <span className="text-white/20 text-sm">›</span>
          </>
        )}
        <span className="text-white font-bold whitespace-nowrap text-sm">
          {focused.label}
        </span>
      </nav>

      {/* ── 캔버스 ── */}
      <div ref={containerRef} className="flex-1 relative">
        {/* SVG 연결선 */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: "visible" }}
        >
          {/* 부모 → 중앙 연결선 */}
          {parent && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              x1={cx}
              y1={parentY + 20}
              x2={cx}
              y2={cy - 30}
              stroke="#ffffff"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          )}
          {/* 중앙 → 자식 연결선 */}
          {childPositions.map(({ node, x, y }) => {
            const color = getNodeColor(node.siblingIndex);
            return (
              <motion.line
                key={`edge-${node.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                x1={cx}
                y1={cy + 20}
                x2={x}
                y2={y}
                stroke={color.bg}
                strokeWidth={2}
              />
            );
          })}
        </svg>

        {/* ── 부모 노드 (위) ── */}
        <AnimatePresence mode="wait">
          {parent && (
            <motion.div
              key={`parent-${parent.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute -translate-x-1/2 z-10 cursor-pointer"
              style={{ left: cx, top: parentY }}
              onClick={() => goTo(parent.id)}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl px-4 py-2 border border-white/15 bg-white/5 backdrop-blur-xl"
              >
                <p className="text-white/60 text-sm font-medium whitespace-nowrap text-center">
                  ↑ {parent.label}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 중앙 노드 (포커스) ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`focus-${focused.id}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.3 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: cx, top: cy }}
          >
            <div
              className="rounded-2xl px-8 py-4 shadow-2xl backdrop-blur-2xl border-2"
              style={{
                background:
                  focused.id === "root"
                    ? "rgba(15,22,40,0.95)"
                    : getNodeColor(focused.siblingIndex).glass,
                borderColor:
                  focused.id === "root"
                    ? "rgba(255,255,255,0.25)"
                    : getNodeColor(focused.siblingIndex).border,
                boxShadow: `0 0 40px ${focused.id === "root" ? "rgba(99,102,241,0.15)" : getNodeColor(focused.siblingIndex).bg + "25"}`,
              }}
            >
              <p
                className="text-center font-bold text-xl whitespace-nowrap"
                style={{
                  color:
                    focused.id === "root"
                      ? "#fff"
                      : getNodeColor(focused.siblingIndex).text,
                }}
              >
                {focused.label}
              </p>
              {children.length > 0 && (
                <p className="text-center text-white/40 text-xs mt-1">
                  {children.length}개 항목
                </p>
              )}
              {children.length === 0 && !focused.detail && (
                <p className="text-center text-white/40 text-xs mt-1">
                  마지막 노드
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── 자식 노드 (하단 반원) ── */}
        <AnimatePresence>
          {childPositions.map(({ node, x, y }, i) => (
            <ChildNode
              key={node.id}
              node={node}
              x={x}
              y={y}
              delay={i * 0.04}
              onClick={() => handleChildClick(node)}
            />
          ))}
        </AnimatePresence>

        {/* ── Detail 팝오버 ── */}
        <AnimatePresence>
          {detailNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[92%]"
            >
              <div className="bg-[#12122a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-white font-bold text-base">
                    {detailNode.label}
                  </h3>
                  <button
                    onClick={() => setDetailNode(null)}
                    className="text-white/40 hover:text-white/80 text-lg leading-none transition-colors flex-shrink-0"
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

        {/* 자식 없으면 detail 표시 */}
        {children.length === 0 && focused.detail && !detailNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 -translate-x-1/2 z-10 max-w-xl w-[85%]"
            style={{ top: cy + 60 }}
          >
            <div className="bg-[#12122a]/80 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {focused.detail}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── 자식 노드 카드 ── */

function ChildNode({
  node,
  x,
  y,
  delay,
  onClick,
}: {
  node: MindMapNode;
  x: number;
  y: number;
  delay: number;
  onClick: () => void;
}) {
  const color = getNodeColor(node.siblingIndex);
  const hasChildren = node.children.length > 0;
  const hasDetail = !!node.detail;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ type: "spring", stiffness: 250, damping: 22, delay }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
      style={{ left: x, top: y }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <motion.div
        whileHover={{
          scale: 1.08,
          boxShadow: `0 0 24px ${color.bg}50`,
        }}
        whileTap={{ scale: 0.95 }}
        className="rounded-xl px-5 py-2.5 shadow-lg backdrop-blur-xl"
        style={{
          background: color.glass,
          border: `1.5px solid ${color.border}`,
        }}
      >
        <p
          className="text-[15px] font-semibold whitespace-nowrap text-center"
          style={{ color: color.text }}
        >
          {node.label}
        </p>
        {hasChildren && (
          <p
            className="text-[10px] text-center mt-0.5 opacity-60"
            style={{ color: color.text }}
          >
            {node.children.length}개 →
          </p>
        )}
        {!hasChildren && hasDetail && (
          <p
            className="text-[10px] text-center mt-0.5 opacity-50"
            style={{ color: color.text }}
          >
            상세보기
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
