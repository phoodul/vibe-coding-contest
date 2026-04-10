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
import { getNodeColor, getChildColor, findNode, getAncestors } from "@/lib/mind-map/build-tree";

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

  const isMobile = size.w < 640;

  // 포커스 노드 색상: 자식일 때 보았던 색상과 동일하게 유지
  const focusedColor = parent
    ? getChildColor(focused.siblingIndex, parent.siblingIndex)
    : getNodeColor(focused.siblingIndex);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col overflow-hidden">
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

      {/* ── 모바일: 세로 트리 (박스 + 연결선) ── */}
      {isMobile ? (
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* 부모 (뒤로가기) */}
          {parent && (
            <button
              onClick={() => goTo(parent.id)}
              className="mb-3 rounded-xl px-4 py-2 border border-white/15 bg-[#1a1a3a]/90 active:scale-[0.98] transition-transform"
            >
              <p className="text-white/60 text-sm font-medium">← {parent.label}</p>
            </button>
          )}

          {/* 현재 노드 박스 */}
          <div
            className="rounded-2xl px-5 py-4 shadow-2xl border-2"
            style={{
              background:
                focused.id === "root"
                  ? "rgba(15,22,40,0.95)"
                  : focusedColor.solid,
              borderColor:
                focused.id === "root"
                  ? "rgba(255,255,255,0.25)"
                  : focusedColor.border,
            }}
          >
            <p className="font-bold text-lg text-white">{focused.label}</p>
            {children.length > 0 && (
              <p className="text-white/40 text-xs mt-1">{children.length}개 항목</p>
            )}
            {children.length === 0 && !focused.detail && (
              <p className="text-white/30 text-xs mt-1">마지막 노드</p>
            )}
          </div>

          {/* 자식 없고 detail 있으면 표시 */}
          {children.length === 0 && focused.detail && (
            <div className="mt-3 bg-[#12122a]/80 border border-white/10 rounded-xl p-4">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {focused.detail}
              </p>
            </div>
          )}

          {/* 자식 노드: 세로 트리 + 박스 */}
          {children.length > 0 && (
            <div className="relative mt-1 ml-5">
              {/* 세로 줄기: 첫 자식 중앙 ~ 마지막 자식 중앙 */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/20" />

              {children.map((child, i) => {
                const color = getChildColor(child.siblingIndex, focused.siblingIndex);
                const hasKids = child.children.length > 0;
                const hasDetail = !!child.detail;
                const isActive = detailNode?.id === child.id;

                return (
                  <div key={child.id} className="relative flex items-stretch" style={{ marginTop: i === 0 ? 0 : 6 }}>
                    {/* 가로 가지: 세로줄에서 박스까지 */}
                    <div className="shrink-0 flex items-center" style={{ width: 20 }}>
                      <div className="w-full h-px" style={{ background: color.bg }} />
                    </div>

                    {/* 박스 */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => {
                          if (hasKids) {
                            handleChildClick(child, 0);
                          } else if (hasDetail) {
                            setDetailNode((prev) => prev?.id === child.id ? null : child);
                          }
                        }}
                        className="w-full text-left rounded-xl px-4 py-2.5 shadow-lg transition-all active:scale-[0.98]"
                        style={{
                          background: color.solid,
                          border: `1.5px solid ${color.border}`,
                        }}
                      >
                        <p className="text-[14px] font-semibold" style={{ color: color.text }}>
                          {child.label}
                        </p>
                        {hasKids && (
                          <p className="text-[11px] mt-0.5 opacity-60" style={{ color: color.text }}>
                            {child.children.length}개 항목 →
                          </p>
                        )}
                        {!hasKids && hasDetail && (
                          <p className="text-[11px] mt-0.5 opacity-50" style={{ color: color.text }}>
                            상세보기
                          </p>
                        )}
                      </button>

                      {/* 선택된 detail */}
                      <AnimatePresence>
                        {isActive && hasDetail && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 bg-[#12122a]/95 border border-white/15 rounded-xl p-4">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                                  {child.detail}
                                </p>
                                <button
                                  onClick={() => setDetailNode(null)}
                                  className="text-white/30 hover:text-white/60 text-sm shrink-0"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── 데스크톱: 기존 방사형 캔버스 ── */
        <div className="flex-1 relative">
          {/* SVG 연결선 */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
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
            {childPositions.map(({ node, x, y }) => {
              const color = getChildColor(node.siblingIndex, focused.siblingIndex);
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

          {/* 부모 노드 */}
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

          {/* 중앙 노드 */}
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
                className="rounded-2xl px-8 py-4 shadow-2xl border-2"
                style={{
                  background:
                    focused.id === "root"
                      ? "rgba(15,22,40,0.95)"
                      : focusedColor.solid,
                  borderColor:
                    focused.id === "root"
                      ? "rgba(255,255,255,0.25)"
                      : focusedColor.border,
                  boxShadow: `0 0 40px ${focused.id === "root" ? "rgba(99,102,241,0.15)" : focusedColor.bg + "25"}`,
                  maxWidth: `min(${Math.round(size.w * 0.45)}px, 280px)`,
                }}
              >
                <p className="text-center font-bold text-xl text-white">
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

          {/* 자식 노드 (부채꼴) */}
          <AnimatePresence>
            {childPositions.map(({ node, x, y, angle }, i) => (
              <ChildNode
                key={node.id}
                node={node}
                parentSiblingIndex={focused.siblingIndex}
                x={x}
                y={y}
                delay={i * 0.04}
                onClick={() => handleChildClick(node, angle)}
              />
            ))}
          </AnimatePresence>

          {/* Detail 팝오버 */}
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
      )}
    </div>
  );
}

/* ── 자식 노드 카드 ── */

function ChildNode({
  node,
  parentSiblingIndex,
  x,
  y,
  delay,
  onClick,
}: {
  node: MindMapNode;
  parentSiblingIndex: number;
  x: number;
  y: number;
  delay: number;
  onClick: () => void;
}) {
  const color = getChildColor(node.siblingIndex, parentSiblingIndex);
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
