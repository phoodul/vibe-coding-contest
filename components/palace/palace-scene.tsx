"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HierarchicalPlacement, SubPlacement } from "@/types/palace";
import type { PalaceLocation } from "@/lib/data/locations";

interface PalaceSceneProps {
  location: PalaceLocation;
  placement: HierarchicalPlacement;
  /** 마커 라벨 숨김 (복습 모드) */
  hideLabels?: boolean;
  /** 현재 하이라이트된 개념 ID (나레이터 모드) */
  highlightId?: string;
  /** 마커 클릭 시 */
  onMarkerClick?: (sub: SubPlacement, index: number) => void;
}

/** 구역 내에서 개념들을 시각적으로 배치할 좌표 생성 */
function getMarkerPositions(count: number): { x: number; y: number }[] {
  // 구역 내 고정 위치들 (가구/구조물 위치를 시뮬레이션)
  const presets = [
    { x: 20, y: 30 }, { x: 75, y: 25 }, { x: 50, y: 55 },
    { x: 15, y: 70 }, { x: 80, y: 65 }, { x: 45, y: 85 },
    { x: 30, y: 15 }, { x: 65, y: 45 }, { x: 85, y: 85 },
    { x: 10, y: 50 }, { x: 55, y: 20 }, { x: 70, y: 80 },
  ];
  return presets.slice(0, count);
}

export function PalaceScene({
  location,
  placement,
  hideLabels = false,
  highlightId,
  onMarkerClick,
}: PalaceSceneProps) {
  const [selectedSub, setSelectedSub] = useState<SubPlacement | null>(null);
  const zone = location.zones.find((z) => z.id === placement.zoneId);
  const positions = getMarkerPositions(placement.subPlacements.length);

  function handleClick(sub: SubPlacement, index: number) {
    setSelectedSub(selectedSub?.conceptId === sub.conceptId ? null : sub);
    onMarkerClick?.(sub, index);
  }

  return (
    <div className="space-y-3">
      {/* 구역 시각 씬 */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/10"
        style={{ aspectRatio: "16/9", background: location.gradient }}
      >
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* 구역 이모지 (배경 장식) */}
        <span className="absolute top-4 right-4 text-5xl opacity-30 select-none">
          {location.emoji}
        </span>

        {/* 구역 이름 */}
        <div className="absolute top-4 left-4">
          <p className="text-xs text-white/50 font-medium">{location.name}</p>
          <h3 className="text-lg font-bold text-white drop-shadow-lg">{zone?.name || placement.zoneName}</h3>
        </div>

        {/* 개념 마커들 */}
        {placement.subPlacements.map((sub, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const isHighlighted = highlightId === sub.conceptId;
          const isSelected = selectedSub?.conceptId === sub.conceptId;

          return (
            <motion.button
              key={sub.conceptId}
              className="absolute flex flex-col items-center gap-0.5 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
              onClick={() => handleClick(sub, i)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 마커 핀 */}
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                  isHighlighted
                    ? "bg-[var(--accent-cyan)] text-white ring-2 ring-[var(--accent-cyan)] ring-offset-2 ring-offset-transparent"
                    : isSelected
                    ? "bg-[var(--accent-violet)] text-white ring-2 ring-[var(--accent-violet)]"
                    : "bg-white/90 text-gray-800 group-hover:bg-white"
                }`}
                animate={isHighlighted ? { scale: [1, 1.2, 1] } : {}}
                transition={isHighlighted ? { duration: 1, repeat: Infinity } : {}}
              >
                {i + 1}
              </motion.div>

              {/* 위치 설명 (작은 텍스트) */}
              <span className="text-[8px] text-white/60 bg-black/40 px-1.5 py-0.5 rounded-full whitespace-nowrap max-w-20 truncate">
                📍 {sub.position}
              </span>

              {/* 개념 라벨 */}
              {!hideLabels && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap max-w-24 truncate ${
                  isHighlighted
                    ? "bg-[var(--accent-cyan)]/80 text-white"
                    : "bg-black/50 text-white/90"
                }`}>
                  {sub.conceptLabel}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* 선택된 개념 상세 패널 */}
      <AnimatePresence mode="wait">
        {selectedSub && (
          <motion.div
            key={selectedSub.conceptId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="p-4 rounded-xl glass border border-white/10"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-[var(--accent-emerald)] text-xs">📍 {selectedSub.position}</span>
            </div>
            <h4 className="font-semibold text-[var(--accent-cyan)] mb-1">{selectedSub.conceptLabel}</h4>
            <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">{selectedSub.story}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
