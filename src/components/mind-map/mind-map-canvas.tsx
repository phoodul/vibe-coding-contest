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
  // 방향 히스토리: 각 depth에서 부모가 어느 각도에 있는지 (incoming angle)
  const [angleHistory, setAngleHistory] = useState<number[]>([]);

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

  // 현재 incoming angle (부모 방향)
  const incomingAngle =
    angleHistory.length > 0 ? angleHistory[angleHistory.length - 1] : null;
  // outward angle (자식이 펼쳐질 중심 방향) = incoming 반대편
  const outwardAngle =
    incomingAngle !== null ? incomingAngle + Math.PI : null;

  // 부모 위치: incoming 방향으로 배치
  const parentDist = Math.min(size.w, size.h) * 0.28;
  const parentPos = parent
    ? {
        x: incomingAngle !== null ? cx + parentDist * Math.cos(incomingAngle) : cx,
        y: incomingAngle !== null ? cy + parentDist * Math.sin(incomingAngle) : cy - size.h * 0.32,
      }
    : null;

  // depth별 최대 팬 각도 (rad): 360° → 60° → 45° → 40° → 30° → 30°
  const FAN_BY_DEPTH = [
    2 * Math.PI,
    Math.PI / 3,
    Math.PI / 4,
    (2 * Math.PI) / 9,
    Math.PI / 6,
    Math.PI / 6,
  ];

  const childPositions = useMemo(() => {
    const n = children.length;
    if (n === 0) return [];

    const isRoot = outwardAngle === null;
    const depth = angleHistory.length; // 0=root, 1=first drill, ...
    const childMaxW = size.w >= 640 ? 180 : 140;
    const childBoxH = 48; // 자식 노드 예상 높이

    // 팬 각도: depth별 축소
    const fanAngle = FAN_BY_DEPTH[Math.min(depth, FAN_BY_DEPTH.length - 1)];
    const step = n <= 1 ? 0 : isRoot ? fanAngle / n : fanAngle / (n - 1);

    // ── 반지름 계산: 겹침 방지 최우선 ──
    let r: number;

    if (isRoot) {
      // Root: 기존 둘레 기반 계산
      const estimatedWidths = children.map((c) => c.label.length * 10 + 50);
      const total = estimatedWidths.reduce((a, b) => a + b, 0) + n * 24;
      const maxR = Math.min(size.w * 0.42, size.h * 0.38);
      r = Math.max(Math.min(180, size.w * 0.32), Math.min(maxR, total / fanAngle));
    } else {
      // 1) 중앙↔자식 겹침 방지
      const centerMaxW = Math.min(size.w * 0.45, 280);
      const centerHalf = Math.min(focused.label.length * 14 + 64, centerMaxW) / 2;
      const gap = Math.max(4, 16 - depth * 3);
      const minRCenter = centerHalf + childMaxW / 2 + gap;

      // 2) 자식↔자식 겹침 방지 (인접 노드 chord distance > 노드 높이 + gap)
      const minRArc = n > 1 && step > 0
        ? (childBoxH + gap) / (2 * Math.sin(step / 2))
        : 0;

      r = Math.max(minRCenter, minRArc, 100);
    }

    // ── 각도 배치 ──
    const centerAngle = isRoot ? -Math.PI / 2 : outwardAngle!;
    const startAngle = centerAngle - fanAngle / 2;

    const slots = Array.from({ length: n }, (_, i) => {
      const angle = n === 1 ? centerAngle : startAngle + step * i;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        angle,
      };
    });

    // 읽기 순서 정렬
    const readingOrder = slots
      .map((s, idx) => {
        const rad = Math.atan2(cy - s.y, s.x - cx);
        const deg = ((rad * 180) / Math.PI + 360) % 360;
        let zone: number;
        let sortKey: number;
        if (deg >= 45 && deg < 135) {
          zone = 0; sortKey = s.x;
        } else if (deg >= 135 && deg < 225) {
          zone = 1; sortKey = s.y;
        } else if (deg >= 225 && deg < 315) {
          zone = 3; sortKey = s.x;
        } else {
          zone = 2; sortKey = s.y;
        }
        return { idx, zone, sortKey };
      })
      .sort((a, b) => a.zone - b.zone || a.sortKey - b.sortKey)
      .map((p) => p.idx);

    return children.map((child, i) => ({
      node: child,
      ...slots[readingOrder[i]],
    }));
  }, [children, cx, cy, size, outwardAngle, focused, angleHistory]);

  // 자식 클릭: 하위로 drill-in (클릭한 자식의 각도 저장)
  const handleChildClick = useCallback(
    (node: MindMapNode, angle: number) => {
      if (node.children.length === 0) {
        if (node.detail) {
          setDetailNode((prev) => (prev?.id === node.id ? null : node));
        }
        return;
      }
      setFocusedId(node.id);
      // 부모(현재 중앙)는 클릭 방향의 반대편에 위치
      setAngleHistory((prev) => [...prev, angle + Math.PI]);
      setDetailNode(null);
    },
    [],
  );

  // 브레드크럼 / 부모 클릭: 상위로 이동 (히스토리 트림)
  const goTo = useCallback(
    (id: string) => {
      if (id === "root") {
        setAngleHistory([]);
      } else {
        const targetIdx = ancestors.findIndex((a) => a.id === id);
        if (targetIdx >= 0) {
          setAngleHistory((prev) => prev.slice(0, targetIdx));
        }
      }
      setFocusedId(id);
      setDetailNode(null);
    },
    [ancestors],
  );

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
          {parent && parentPos && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              x1={parentPos.x}
              y1={parentPos.y}
              x2={cx}
              y2={cy}
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
                y1={cy}
                x2={x}
                y2={y}
                stroke={color.bg}
                strokeWidth={2}
              />
            );
          })}
        </svg>

        {/* ── 부모 노드 (incoming 방향) ── */}
        <AnimatePresence mode="wait">
          {parent && parentPos && (
            <motion.div
              key={`parent-${parent.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
              style={{ left: parentPos.x, top: parentPos.y }}
              onClick={() => goTo(parent.id)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl px-4 py-2 border border-white/15 bg-[#1a1a3a]/90"
              >
                <p className="text-white/60 text-sm font-medium whitespace-nowrap text-center">
                  ← {parent.label}
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
              className="rounded-2xl px-5 py-3 sm:px-8 sm:py-4 shadow-2xl border-2"
              style={{
                background:
                  focused.id === "root"
                    ? "rgba(15,22,40,0.95)"
                    : getNodeColor(focused.siblingIndex).solid,
                borderColor:
                  focused.id === "root"
                    ? "rgba(255,255,255,0.25)"
                    : getNodeColor(focused.siblingIndex).border,
                boxShadow: `0 0 40px ${focused.id === "root" ? "rgba(99,102,241,0.15)" : getNodeColor(focused.siblingIndex).bg + "25"}`,
                maxWidth: `min(${Math.round(size.w * 0.45)}px, 280px)`,
              }}
            >
              <p
                className="text-center font-bold text-lg sm:text-xl text-white"
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

        {/* ── 자식 노드 (부채꼴 배치) ── */}
        <AnimatePresence>
          {childPositions.map(({ node, x, y, angle }, i) => (
            <ChildNode
              key={node.id}
              node={node}
              x={x}
              y={y}
              delay={i * 0.04}
              onClick={() => handleChildClick(node, angle)}
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
        className="rounded-xl px-3 py-2 sm:px-5 sm:py-2.5 shadow-lg max-w-[140px] sm:max-w-[180px]"
        style={{
          background: color.solid,
          border: `1.5px solid ${color.border}`,
        }}
      >
        <p
          className="text-[13px] sm:text-[15px] font-semibold text-center"
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
