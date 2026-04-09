"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
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
  /** 학습 모드: 클릭으로 선택된 오브젝트 ID (전체 파트 텍스트 표시) */
  selectedObjId: string | null;
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
  reviewStates,
  onPartClick,
  onObjectClick,
}: PalaceSceneProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredObjId, setHoveredObjId] = useState<string | null>(null);

  // 현재 활성 파트 찾기 (나레이터 기반)
  const activePart = findPartByFlatIndex(config, activeFlatIndex);

  // 텍스트 박스 위치를 겹치지 않도록 계산
  const textPositions = useMemo(() => {
    return computeTextPositions(config, mode, activeFlatIndex, revealedUpTo, selectedObjId, reviewStates);
  }, [config, mode, activeFlatIndex, revealedUpTo, selectedObjId, reviewStates]);

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
          const isObjActive = activePart?.objId === obj.id || selectedObjId === obj.id;
          const isHovered = hoveredObjId === obj.id;
          const reviewState = reviewStates[obj.id];

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

              {/* ── keyword 라벨들 (작은 글씨) ── */}
              {obj.parts.map((part, pIdx) => {
                const isPartActive = activeFlatIndex === part.flatIndex;
                const partOffsetX = getPartOffsetX(obj.parts.length, pIdx);
                const partOffsetY = getPartOffsetY(obj.parts.length, pIdx);

                const isObjSelected = selectedObjId === obj.id;

                // 학습: 나레이터 활성 또는 오브젝트 클릭 시 텍스트 표시
                const showKeyword =
                  mode === "learn"
                    ? !isPartActive && !isObjSelected
                    : reviewState === "keyword";

                const showText =
                  mode === "learn"
                    ? isPartActive || isObjSelected
                    : reviewState === "text";

                const kx = obj.x + partOffsetX;
                const ky = obj.y + 70 + partOffsetY;

                // 텍스트 박스 위치 (겹침 방지 계산된 위치 사용)
                const pos = textPositions.get(part.id);
                const textX = pos ? pos.x : Math.max(0, Math.min(kx - TEXT_BOX_W / 2, SVG_W - TEXT_BOX_W));
                const textY = pos ? pos.y : Math.max(5, ky - 50);

                return (
                  <g
                    key={part.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPartClick(obj, part);
                    }}
                  >
                    {/* 작은 keyword (10px) */}
                    {showKeyword && (
                      <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <text
                          x={kx}
                          y={ky}
                          textAnchor="middle"
                          fill="#ffffffa0"
                          fontSize="10"
                          filter="url(#shadow-soft)"
                          className="select-none pointer-events-none"
                        >
                          {part.keyword}
                        </text>
                      </motion.g>
                    )}

                    {/* 강조 텍스트 (16px) — Scene 위 직접 표시, 겹침 방지 위치 */}
                    {showText && (
                      <foreignObject
                        x={textX}
                        y={textY}
                        width={TEXT_BOX_W}
                        height={TEXT_BOX_H}
                        className="pointer-events-none"
                        style={{ overflow: "visible", zIndex: 100 }}
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

              {/* 오브젝트 대표 keyword (학습 모드, 활성 아닐 때) */}
              {mode === "learn" && !isObjActive && activeFlatIndex < 0 && (
                <text
                  x={obj.x + 30}
                  y={obj.y - 8}
                  textAnchor="middle"
                  fill="#ffffff50"
                  fontSize="10"
                  fontWeight="bold"
                  className="select-none pointer-events-none"
                >
                  {obj.keyword}
                </text>
              )}

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

/**
 * 텍스트 박스 위치 계산 (겹침 방지)
 * 현재 표시되어야 하는 모든 텍스트 박스를 수집한 뒤,
 * 겹치는 박스들을 수직으로 분산 배치한다.
 */
function computeTextPositions(
  config: RoomSceneConfig,
  mode: PalaceMode,
  activeFlatIndex: number,
  revealedUpTo: number,
  selectedObjId: string | null,
  reviewStates: Record<string, ReviewClickState>,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const boxes: { id: string; x: number; y: number; objX: number; objY: number }[] = [];

  for (const obj of config.objects) {
    const activePart = findPartByFlatIndex(config, activeFlatIndex);
    const isObjActive = activePart?.objId === obj.id || selectedObjId === obj.id;
    const reviewState = reviewStates[obj.id];

    for (let pIdx = 0; pIdx < obj.parts.length; pIdx++) {
      const part = obj.parts[pIdx];
      const isPartActive = activeFlatIndex === part.flatIndex;
      const isObjSelected = selectedObjId === obj.id;

      const showText =
        mode === "learn"
          ? isPartActive || isObjSelected
          : reviewState === "text";

      if (!showText) continue;

      const partOffsetX = getPartOffsetX(obj.parts.length, pIdx);
      const partOffsetY = getPartOffsetY(obj.parts.length, pIdx);
      const kx = obj.x + partOffsetX;
      const ky = obj.y + 70 + partOffsetY;

      // 기본 위치: 오브젝트 옆에 배치 (오브젝트를 가리지 않도록)
      let baseX = obj.x + 70; // 오브젝트 오른쪽에 배치
      let baseY = ky - 30;

      // 오른쪽 공간이 부족하면 왼쪽에 배치
      if (baseX + TEXT_BOX_W > SVG_W - 10) {
        baseX = obj.x - TEXT_BOX_W - 10;
      }
      // 왼쪽도 부족하면 아래에 배치
      if (baseX < 10) {
        baseX = Math.max(10, kx - TEXT_BOX_W / 2);
      }

      // 경계 클램핑
      baseX = Math.max(5, Math.min(baseX, SVG_W - TEXT_BOX_W - 5));
      baseY = Math.max(5, Math.min(baseY, SVG_H - TEXT_BOX_H - 5));

      boxes.push({ id: part.id, x: baseX, y: baseY, objX: obj.x, objY: obj.y });
    }
  }

  // 겹침 해소: 같은 오브젝트의 박스들은 수직으로 분산
  const byObj = new Map<string, typeof boxes>();
  for (const box of boxes) {
    const key = `${box.objX}_${box.objY}`;
    if (!byObj.has(key)) byObj.set(key, []);
    byObj.get(key)!.push(box);
  }

  for (const [, group] of byObj) {
    if (group.length <= 1) {
      for (const b of group) positions.set(b.id, { x: b.x, y: b.y });
      continue;
    }

    // 수직으로 균등 배분
    const startY = Math.max(5, group[0].objY - 20);
    const spacing = Math.min(TEXT_BOX_H + 4, (SVG_H - startY - TEXT_BOX_H) / group.length);

    for (let i = 0; i < group.length; i++) {
      const y = Math.min(startY + i * spacing, SVG_H - TEXT_BOX_H - 5);
      positions.set(group[i].id, { x: group[i].x, y });
    }
  }

  // 교차 오브젝트 간 겹침 해소 (간단한 push-apart)
  const allPos = Array.from(positions.entries());
  for (let iter = 0; iter < 3; iter++) {
    for (let i = 0; i < allPos.length; i++) {
      for (let j = i + 1; j < allPos.length; j++) {
        const a = allPos[i][1];
        const b = allPos[j][1];
        // 수평, 수직 겹침 확인
        const overlapX = (a.x < b.x + TEXT_BOX_W) && (a.x + TEXT_BOX_W > b.x);
        const overlapY = (a.y < b.y + TEXT_BOX_H) && (a.y + TEXT_BOX_H > b.y);
        if (overlapX && overlapY) {
          // 수직으로 밀어내기
          const pushAmount = (TEXT_BOX_H + 4 - Math.abs(a.y - b.y)) / 2;
          if (a.y <= b.y) {
            a.y = Math.max(5, a.y - pushAmount);
            b.y = Math.min(SVG_H - TEXT_BOX_H - 5, b.y + pushAmount);
          } else {
            b.y = Math.max(5, b.y - pushAmount);
            a.y = Math.min(SVG_H - TEXT_BOX_H - 5, a.y + pushAmount);
          }
        }
      }
    }
  }

  // 업데이트된 위치 반영
  const result = new Map<string, { x: number; y: number }>();
  for (const [id, pos] of allPos) {
    result.set(id, pos);
  }
  return result;
}
