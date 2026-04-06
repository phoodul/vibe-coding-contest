"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MindMap, MindMapNode, MindMapSubNode } from "@/types/mindmap";

interface MindMapTreeProps {
  mindMap: MindMap;
  onNodeClick?: (node: MindMapNode, index: number) => void;
}

const COLORS = [
  "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#6366f1", "#14b8a6",
];

export function MindMapTree({ mindMap, onNodeClick }: MindMapTreeProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const nodes = mindMap.childNodes;

  const centerX = 600;
  const centerY = 500;
  const mainRadius = 320;
  const subRadius = 150;
  const detailRadius = 80;

  function getRadialPos(cx: number, cy: number, r: number, index: number, total: number, offset = -Math.PI / 2) {
    const angle = (index / total) * Math.PI * 2 + offset;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // 선택된 노드로 viewBox를 이동
  const viewBox = useMemo(() => {
    if (selectedNodeId) {
      const idx = nodes.findIndex((n) => n.id === selectedNodeId);
      if (idx >= 0) {
        const pos = getRadialPos(centerX, centerY, mainRadius, idx, nodes.length);
        // 선택 노드를 중심으로 확대
        const vx = pos.x - 350;
        const vy = pos.y - 300;
        return `${vx} ${vy} 700 600`;
      }
    }
    return `0 0 1200 1000`;
  }, [selectedNodeId, nodes.length]);

  function handleNodeClick(node: MindMapNode, index: number) {
    setSelectedNodeId(selectedNodeId === node.id ? null : node.id);
    setSelectedSubId(null);
    onNodeClick?.(node, index);
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <motion.svg
        viewBox={viewBox}
        className="w-full"
        style={{ minHeight: selectedNodeId ? 500 : 450 }}
        animate={{ viewBox }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="mmCenterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <radialGradient id="mmCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          {COLORS.map((c, i) => (
            <radialGradient key={i} id={`mmGlow${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity="0.15" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* === 1단계: 중심→자식 연결선 === */}
        {nodes.map((node, i) => {
          const pos = getRadialPos(centerX, centerY, mainRadius, i, nodes.length);
          const color = COLORS[i % COLORS.length];
          return (
            <motion.line
              key={`line-${node.id}`}
              x1={centerX} y1={centerY} x2={pos.x} y2={pos.y}
              stroke={color} strokeWidth={2} strokeOpacity={selectedNodeId && selectedNodeId !== node.id ? 0.1 : 0.4}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            />
          );
        })}

        {/* === 2단계: 자식→서브 연결선 + 서브노드 === */}
        {nodes.map((node, i) => {
          if (!node.subNodes || node.subNodes.length === 0) return null;
          const parentPos = getRadialPos(centerX, centerY, mainRadius, i, nodes.length);
          const color = COLORS[i % COLORS.length];
          const isExpanded = selectedNodeId === node.id;

          return node.subNodes.map((sub, si) => {
            const subPos = getRadialPos(parentPos.x, parentPos.y, subRadius, si, node.subNodes!.length,
              (i / nodes.length) * Math.PI * 2 - Math.PI / 2 - Math.PI * 0.3 + (si / node.subNodes!.length) * Math.PI * 0.6
            );
            const isSubSelected = selectedSubId === sub.id;

            return (
              <g key={`sub-${sub.id}`}>
                {/* 연결선 */}
                <motion.line
                  x1={parentPos.x} y1={parentPos.y} x2={subPos.x} y2={subPos.y}
                  stroke={color} strokeWidth={1.5} strokeOpacity={0.25}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                  transition={{ delay: si * 0.04 }}
                />

                {/* 서브노드 */}
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? 1 : 0 }}
                  transition={{ delay: si * 0.05, type: "spring", stiffness: 300 }}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); setSelectedSubId(isSubSelected ? null : sub.id); }}
                >
                  {isSubSelected && (
                    <circle cx={subPos.x} cy={subPos.y} r={50} fill={color} fillOpacity={0.08} />
                  )}
                  <circle
                    cx={subPos.x} cy={subPos.y}
                    r={isSubSelected ? 40 : 32}
                    fill={`${color}15`} stroke={color}
                    strokeWidth={isSubSelected ? 2 : 1}
                  />
                  {/* 서브노드 라벨 — 전체 텍스트 표시 */}
                  <foreignObject
                    x={subPos.x - 35} y={subPos.y - 14}
                    width={70} height={28}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "100%", height: "100%",
                      fontSize: isSubSelected ? "9px" : "8px",
                      fontWeight: 600, color: "white", textAlign: "center",
                      lineHeight: "1.2", overflow: "hidden",
                    }}>
                      {sub.label}
                    </div>
                  </foreignObject>
                </motion.g>

                {/* === 3단계: 서브노드 상세 텍스트 === */}
                {isSubSelected && isExpanded && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <foreignObject
                      x={subPos.x - 120} y={subPos.y + 45}
                      width={240} height={100}
                    >
                      <div style={{
                        background: "rgba(0,0,0,0.7)", borderRadius: "12px",
                        border: `1px solid ${color}40`, padding: "10px 12px",
                        fontSize: "10px", color: "rgba(255,255,255,0.85)",
                        lineHeight: "1.5", backdropFilter: "blur(8px)",
                      }}>
                        <div style={{ fontWeight: 700, color, fontSize: "11px", marginBottom: "4px" }}>
                          {sub.label}
                        </div>
                        <div>{sub.detail}</div>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>
            );
          });
        })}

        {/* === 1단계: 자식 노드 === */}
        {nodes.map((node, i) => {
          const pos = getRadialPos(centerX, centerY, mainRadius, i, nodes.length);
          const isSelected = selectedNodeId === node.id;
          const dimmed = selectedNodeId && !isSelected;
          const color = COLORS[i % COLORS.length];
          const nodeR = isSelected ? 52 : 44;

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: dimmed ? 0.3 : 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 200 }}
              style={{ cursor: "pointer" }}
              onClick={() => handleNodeClick(node, i)}
            >
              {/* 글로우 */}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r={nodeR + 15} fill={`url(#mmGlow${i % COLORS.length})`} />
              )}
              {/* 노드 원 */}
              <circle cx={pos.x} cy={pos.y} r={nodeR} fill={`${color}20`} stroke={color} strokeWidth={isSelected ? 3 : 1.5} />

              {/* 노드 라벨 — foreignObject로 전체 텍스트 */}
              <foreignObject x={pos.x - nodeR + 4} y={pos.y - nodeR / 2} width={(nodeR - 4) * 2} height={nodeR}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "100%", height: "100%",
                  fontSize: isSelected ? "12px" : "11px",
                  fontWeight: 700, color: "white", textAlign: "center",
                  lineHeight: "1.3",
                }}>
                  {node.label}
                </div>
              </foreignObject>

              {/* 하위 개수 배지 */}
              {node.subNodes && node.subNodes.length > 0 && !isSelected && (
                <>
                  <circle cx={pos.x} cy={pos.y + nodeR - 8} r={10} fill={color} fillOpacity={0.7} />
                  <text x={pos.x} y={pos.y + nodeR - 8} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={9} fontWeight={700}>
                    {node.subNodes.length}
                  </text>
                </>
              )}

              {/* 설명 텍스트 (선택 시) */}
              {isSelected && (
                <foreignObject x={pos.x - 80} y={pos.y + nodeR + 5} width={160} height={30}>
                  <div style={{
                    fontSize: "9px", color: "rgba(255,255,255,0.5)",
                    textAlign: "center", lineHeight: "1.3",
                  }}>
                    {node.description}
                  </div>
                </foreignObject>
              )}
            </motion.g>
          );
        })}

        {/* === 중심 노드 === */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: selectedNodeId ? 0.5 : 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          style={{ cursor: selectedNodeId ? "pointer" : "default" }}
          onClick={() => { setSelectedNodeId(null); setSelectedSubId(null); }}
        >
          <circle cx={centerX} cy={centerY} r={75} fill="url(#mmCenterGlow)" />
          <circle cx={centerX} cy={centerY} r={60} fill="#1a1a2e" stroke="url(#mmCenterGrad)" strokeWidth={3} />
          <foreignObject x={centerX - 50} y={centerY - 20} width={100} height={40}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", height: "100%",
              fontSize: "14px", fontWeight: 800, color: "white", textAlign: "center",
              lineHeight: "1.2",
            }}>
              {mindMap.centerNode.label}
            </div>
          </foreignObject>
          <text x={centerX} y={centerY + 22} textAnchor="middle" fill="#71717a" fontSize={9}>
            {nodes.length}개 소단원
          </text>
        </motion.g>
      </motion.svg>

      {/* 안내 텍스트 */}
      <div className="text-center py-2 text-xs text-[var(--muted-foreground)]">
        {selectedNodeId
          ? "노드를 클릭하면 세부 내용을 볼 수 있습니다 · 중심을 클릭하면 전체 보기"
          : "소단원을 클릭하면 확대됩니다"
        }
      </div>
    </div>
  );
}
