"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PalaceObjectSVG } from "./palace-objects";
import type { RoomSceneConfig, SceneObject, ObjectPart } from "@/lib/mind-palace/scene-config";

/**
 * Mind Palace Scene Renderer
 *
 * 기본 상태: 모든 오브젝트 + 작은 keyword(9px) = 학습 지도
 * 나레이터/클릭 시: keyword 사라짐 → structured_text 16px + 오브젝트 글로우
 * 모든 텍스트 표시는 Scene 위에서만 (하단 패널 없음)
 */

export type PalaceMode = "learn" | "review";
export type ReviewClickState = "scene" | "keyword" | "text";

interface PalaceSceneProps {
  config: RoomSceneConfig;
  mode: PalaceMode;
  /** 현재 나레이터가 읽고 있는 flatIndex (-1 = 없음) */
  activeFlatIndex: number;
  /** 나레이터가 지금까지 reveal한 최대 flatIndex (-1 = 없음) */
  revealedUpTo?: number;
  /** 학습 모드: 클릭으로 선택된 오브젝트 ID */
  selectedObjId: string | null;
  /** 현재 텍스트가 표시 중인 파트 ID (한 번에 1개만) */
  selectedPartId: string | null;
  /** 복습 모드 3-click 상태 */
  reviewStates: Record<string, ReviewClickState>;
  /** 클릭 시 콜백 */
  onPartClick: (obj: SceneObject, part: ObjectPart) => void;
  /** 오브젝트 클릭 */
  onObjectClick: (obj: SceneObject) => void;
}

const SVG_W = 1200;
const SVG_H = 700;
const TEXT_BOX_W = 260;
const TEXT_BOX_H = 90;

export function PalaceScene({
  config,
  mode,
  activeFlatIndex,
  revealedUpTo = -1,
  selectedObjId,
  selectedPartId,
  reviewStates,
  onPartClick,
  onObjectClick,
}: PalaceSceneProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredObjId, setHoveredObjId] = useState<string | null>(null);

  // 현재 활성 파트 찾기 (나레이터 기반)
  const activePart = findPartByFlatIndex(config, activeFlatIndex);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 1200 700"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="mp-wall-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a1f3d" />
            <stop offset="100%" stopColor="#1a1428" />
          </linearGradient>
          <linearGradient id="mp-floor-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d2b1a" />
            <stop offset="100%" stopColor="#2a1d12" />
          </linearGradient>
          <filter id="glow-active">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow-soft">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* ── 배경: 강의실 ── */}
        <rect x="0" y="0" width="1200" height="380" fill="url(#mp-wall-bg)" pointerEvents="none" />
        <rect x="0" y="380" width="1200" height="320" fill="url(#mp-floor-bg)" pointerEvents="none" />
        <line x1="0" y1="380" x2="1200" y2="380" stroke="#4a3728" strokeWidth="3" pointerEvents="none" />

        {/* 벽면 디테일 (pointer-events: none으로 오브젝트 클릭 차단 방지) */}
        <g pointerEvents="none">
          <rect x="20" y="20" width="250" height="340" rx="4" fill="#2c1810" stroke="#5a3a2040" strokeWidth="2" />
          <text x="145" y="15" textAnchor="middle" fill="#5a3a2050" fontSize="8">WEST WALL</text>
          <rect x="300" y="20" width="580" height="200" rx="4" fill="#1a403060" stroke="#2d6b4f40" strokeWidth="2" />
          <text x="590" y="15" textAnchor="middle" fill="#2d6b4f50" fontSize="8">NORTH WALL — BLACKBOARD</text>
          <rect x="920" y="20" width="260" height="340" rx="4" fill="#1a2d3d60" stroke="#3a5a7a40" strokeWidth="2" />
          <text x="1050" y="15" textAnchor="middle" fill="#3a5a7a50" fontSize="8">EAST WALL</text>
          <rect x="350" y="400" width="500" height="200" rx="5" fill="#4a302040" stroke="#6b4a3040" strokeWidth="2" />
          <text x="600" y="395" textAnchor="middle" fill="#6b4a3050" fontSize="8">DESK AREA</text>
          <rect x="300" y="620" width="600" height="60" rx="4" fill="#3a2a1a40" stroke="#5a3a2030" strokeWidth="1" />
          <text x="600" y="670" textAnchor="middle" fill="#5a3a2040" fontSize="8">SOUTH — ENTRANCE</text>
        </g>

        {/* ── 오브젝트 렌더링 ── */}
        {config.objects.map((obj) => {
          const isObjActive =
            activePart?.objId === obj.id ||
            selectedObjId === obj.id ||
            (selectedPartId != null && obj.parts.some((p) => p.id === selectedPartId));
          const isHovered = hoveredObjId === obj.id;
          const reviewState = reviewStates[obj.id];
          const showMarkers =
            mode === "learn" || reviewState === "keyword" || reviewState === "text";

          return (
            <g
              key={obj.id}
              onMouseEnter={() => setHoveredObjId(obj.id)}
              onMouseLeave={() => setHoveredObjId(null)}
              onClick={() => onObjectClick(obj)}
              className="cursor-pointer"
            >
              {/* 오브젝트 SVG */}
              <PalaceObjectSVG
                type={obj.type}
                x={obj.x}
                y={obj.y}
                scale={obj.scale}
                active={isObjActive}
                dimmed={activeFlatIndex >= 0 && !isObjActive}
              />

              {/* ── 파트 마커 (노드) + 텍스트 ── */}
              {obj.parts.map((part, pIdx) => {
                const partOffsetX = getPartOffsetX(obj.parts.length, pIdx);
                const partOffsetY = getPartOffsetY(obj.parts.length, pIdx);
                const kx = obj.x + partOffsetX;
                const ky = obj.y + 70 + partOffsetY;

                const isThisPartSelected = selectedPartId === part.id;
                const isNarratorActive = activeFlatIndex === part.flatIndex;
                const showText = isThisPartSelected || isNarratorActive;

                // 텍스트 박스 위치 (1개만 표시되므로 간단한 경계 클램핑)
                let textX = obj.x + 70;
                let textY = ky - 30;
                if (textX + TEXT_BOX_W > SVG_W - 10) textX = obj.x - TEXT_BOX_W - 10;
                if (textX < 10) textX = Math.max(10, kx - TEXT_BOX_W / 2);
                textX = Math.max(5, Math.min(textX, SVG_W - TEXT_BOX_W - 5));
                textY = Math.max(5, Math.min(textY, SVG_H - TEXT_BOX_H - 5));

                return (
                  <g
                    key={part.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPartClick(obj, part);
                    }}
                    className="cursor-pointer"
                  >
                    {/* 마커 dot — 항상 표시 (각 노드의 시각적 존재) */}
                    {showMarkers && (
                      <motion.g
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: pIdx * 0.03 }}
                      >
                        <circle
                          cx={kx}
                          cy={ky}
                          r={showText ? 6 : 4}
                          fill={
                            showText
                              ? "rgba(245,158,11,0.6)"
                              : isThisPartSelected
                                ? "rgba(245,158,11,0.4)"
                                : "rgba(245,158,11,0.15)"
                          }
                          stroke={showText ? "#F59E0B" : "rgba(245,158,11,0.35)"}
                          strokeWidth={showText ? 1.5 : 0.8}
                        />
                        <text
                          x={kx}
                          y={ky - 8}
                          textAnchor="middle"
                          fill={showText ? "#F59E0B" : "#ffffff70"}
                          fontSize={showText ? "10" : "8"}
                          fontWeight={showText ? "bold" : "normal"}
                          filter="url(#shadow-soft)"
                          className="select-none pointer-events-none"
                        >
                          {part.keyword}
                        </text>
                      </motion.g>
                    )}

                    {/* 텍스트 박스 — 선택된 1개 파트만 표시 (겹침 불가) */}
                    {showText && (
                      <foreignObject
                        x={textX}
                        y={textY}
                        width={TEXT_BOX_W}
                        height={TEXT_BOX_H}
                        className="pointer-events-none"
                        style={{ overflow: "visible" }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.25 }}
                          // @ts-expect-error xmlns required for foreignObject
                          xmlns="http://www.w3.org/1999/xhtml"
                          className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-amber-400/30 rounded-xl px-3 py-2 shadow-lg shadow-amber-500/10"
                        >
                          <p className="text-white text-[14px] leading-snug font-medium">
                            {part.text}
                          </p>
                        </motion.div>
                      </foreignObject>
                    )}

                    {/* 연결선: 오브젝트 → 텍스트 */}
                    {showText && (
                      <motion.line
                        x1={obj.x + 30}
                        y1={obj.y + 50}
                        x2={textX + TEXT_BOX_W / 2}
                        y2={textY + TEXT_BOX_H}
                        stroke="#f59e0b80"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </g>
                );
              })}

              {/* hover 이름 표시 */}
              {isHovered && !isObjActive && (
                <text
                  x={obj.x + 30}
                  y={obj.y - 12}
                  textAnchor="middle"
                  fill="#ffffffaa"
                  fontSize="11"
                  fontWeight="bold"
                  className="select-none pointer-events-none"
                >
                  {obj.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** 파트가 여러 개일 때 수평 오프셋 계산 */
function getPartOffsetX(totalParts: number, partIndex: number): number {
  if (totalParts <= 1) return 30;
  // 2행 배치: 행당 열 수 계산
  const cols = Math.ceil(totalParts / 2);
  const row = partIndex < cols ? 0 : 1;
  const colIdx = row === 0 ? partIndex : partIndex - cols;
  const colsInRow = row === 0 ? cols : totalParts - cols;
  const spread = Math.min(colsInRow * 55, 200);
  const step = colsInRow <= 1 ? 0 : spread / (colsInRow - 1);
  return 30 - spread / 2 + step * colIdx;
}

/** 파트가 많을 때 수직 오프셋 (2줄 배치) */
function getPartOffsetY(totalParts: number, partIndex: number): number {
  if (totalParts <= 2) return 0;
  const cols = Math.ceil(totalParts / 2);
  return partIndex >= cols ? 16 : 0;
}

/** flatIndex로 활성 파트 찾기 */
function findPartByFlatIndex(
  config: RoomSceneConfig,
  flatIndex: number
): { objId: string; part: ObjectPart } | null {
  if (flatIndex < 0) return null;
  for (const obj of config.objects) {
    for (const part of obj.parts) {
      if (part.flatIndex === flatIndex) {
        return { objId: obj.id, part };
      }
    }
  }
  return null;
}

