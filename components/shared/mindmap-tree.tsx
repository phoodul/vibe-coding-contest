"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MindMap, MindMapNode } from "@/types/mindmap";

interface MindMapTreeProps {
  mindMap: MindMap;
  onNodeClick?: (node: MindMapNode, index: number) => void;
}

export function MindMapTree({ mindMap, onNodeClick }: MindMapTreeProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const nodes = mindMap.childNodes;
  const centerX = 400;
  const centerY = 350;
  const radius = 240;

  function getNodePosition(index: number, total: number) {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  }

  // Split label into two lines at the nearest space to midpoint
  function splitLabel(label: string): [string, string] {
    const mid = Math.ceil(label.length / 2);
    const spaceAfter = label.indexOf(" ", mid);
    const spaceBefore = label.lastIndexOf(" ", mid);
    let splitAt = mid;
    if (spaceBefore > 0 && spaceAfter > 0) {
      splitAt = (mid - spaceBefore <= spaceAfter - mid) ? spaceBefore : spaceAfter;
    } else if (spaceBefore > 0) {
      splitAt = spaceBefore;
    } else if (spaceAfter > 0) {
      splitAt = spaceAfter;
    }
    return [label.slice(0, splitAt).trim(), label.slice(splitAt).trim()];
  }

  // Color palette for nodes
  const colors = [
    "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
    "#ef4444", "#ec4899", "#6366f1", "#14b8a6",
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 800 700"
        className="w-full max-w-3xl mx-auto"
        style={{ minHeight: 420 }}
      >
        {/* Connection lines */}
        {nodes.map((node, i) => {
          const pos = getNodePosition(i, nodes.length);
          return (
            <motion.line
              key={`line-${node.id}`}
              x1={centerX}
              y1={centerY}
              x2={pos.x}
              y2={pos.y}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              strokeOpacity={0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            />
          );
        })}

        {/* Sub-node connections (if selected) */}
        {nodes.map((node, i) => {
          if (selectedNode !== node.id || !node.subNodes) return null;
          const parentPos = getNodePosition(i, nodes.length);
          const subRadius = 80;
          return node.subNodes.map((sub, si) => {
            const subAngle = ((si / node.subNodes!.length) * Math.PI * 0.8) - Math.PI * 0.4;
            const baseAngle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            const sx = parentPos.x + subRadius * Math.cos(baseAngle + subAngle);
            const sy = parentPos.y + subRadius * Math.sin(baseAngle + subAngle);
            return (
              <g key={`sub-${sub.id}`}>
                <motion.line
                  x1={parentPos.x}
                  y1={parentPos.y}
                  x2={sx}
                  y2={sy}
                  stroke={colors[i % colors.length]}
                  strokeWidth={1.5}
                  strokeOpacity={0.2}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: si * 0.05 }}
                />
                <motion.g
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: si * 0.05 }}
                >
                  <circle cx={sx} cy={sy} r={28} fill={colors[i % colors.length]} fillOpacity={0.15} stroke={colors[i % colors.length]} strokeWidth={1} />
                  <text x={sx} y={sy} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={9} fontWeight={500}>
                    {sub.label.length > 8 ? sub.label.slice(0, 8) + "…" : sub.label}
                  </text>
                </motion.g>
              </g>
            );
          });
        })}

        {/* Child nodes */}
        {nodes.map((node, i) => {
          const pos = getNodePosition(i, nodes.length);
          const isSelected = selectedNode === node.id;
          const color = colors[i % colors.length];
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200 }}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedNode(isSelected ? null : node.id);
                onNodeClick?.(node, i);
              }}
            >
              {/* Glow effect */}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r={42} fill={color} fillOpacity={0.1} />
              )}
              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 42 : 38}
                fill={`${color}20`}
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              {/* Node label - 2줄 지원 */}
              {(() => {
                const [line1, line2] = node.label.length <= 5
                  ? [node.label, ""]
                  : splitLabel(node.label);
                return line2 ? (
                  <>
                    <text x={pos.x} y={pos.y - 7} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={10} fontWeight={600}>
                      {line1.length > 10 ? line1.slice(0, 10) + "…" : line1}
                    </text>
                    <text x={pos.x} y={pos.y + 7} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={10} fontWeight={600}>
                      {line2.length > 10 ? line2.slice(0, 10) + "…" : line2}
                    </text>
                  </>
                ) : (
                  <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={11} fontWeight={600}>
                    {line1}
                  </text>
                );
              })()}
              {/* Sub count badge */}
              {node.subNodes && node.subNodes.length > 0 && (
                <>
                  <circle cx={pos.x} cy={pos.y + 22} r={9} fill={color} fillOpacity={0.6} />
                  <text x={pos.x} y={pos.y + 22} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={8} fontWeight={700}>
                    {node.subNodes.length}
                  </text>
                </>
              )}
            </motion.g>
          );
        })}

        {/* Center node */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {/* Center glow */}
          <circle cx={centerX} cy={centerY} r={60} fill="url(#centerGlow)" />
          {/* Center circle */}
          <circle cx={centerX} cy={centerY} r={52} fill="#1a1a2e" stroke="url(#centerGradient)" strokeWidth={3} />
          {/* Center label */}
          <text x={centerX} y={centerY - 8} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={13} fontWeight={700}>
            {mindMap.centerNode.label.length > 12
              ? mindMap.centerNode.label.slice(0, 12) + "…"
              : mindMap.centerNode.label}
          </text>
          <text x={centerX} y={centerY + 10} textAnchor="middle" dominantBaseline="central" fill="#71717a" fontSize={9}>
            {nodes.length}개 소단원
          </text>
        </motion.g>

        {/* Gradients */}
        <defs>
          <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
