"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HierarchicalPlacement, SubPlacement } from "@/types/palace";
import type { PalaceLocation } from "@/lib/data/locations";
import { assignItemsToProps, type PropAssignment } from "@/lib/data/zone-props";
import { findThinkersInText } from "@/lib/data/thinkers";
import { ThinkerAvatar } from "@/components/shared/thinker-avatar";

interface PalaceSceneProps {
  location: PalaceLocation;
  placement: HierarchicalPlacement;
  hideLabels?: boolean;
  highlightId?: string;
  onMarkerClick?: (sub: SubPlacement, index: number) => void;
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

  const assignments = assignItemsToProps(placement.subPlacements.length, placement.zoneId);

  // 소품별 그룹화
  const propGroups = new Map<string, { prop: PropAssignment; items: { sub: SubPlacement; assignment: PropAssignment; index: number }[] }>();
  placement.subPlacements.forEach((sub, i) => {
    const assignment = assignments[i];
    if (!propGroups.has(assignment.propId)) {
      propGroups.set(assignment.propId, { prop: assignment, items: [] });
    }
    propGroups.get(assignment.propId)!.items.push({ sub, assignment, index: i });
  });

  function handleClick(sub: SubPlacement, index: number) {
    setSelectedSub(selectedSub?.conceptId === sub.conceptId ? null : sub);
    onMarkerClick?.(sub, index);
  }

  return (
    <div className="space-y-3">
      {/* === 공간 씬 === */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={{ aspectRatio: "16/9", background: location.gradient }}
      >
        {/* 깊이감을 주는 레이어 */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)",
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        {/* 장소 라벨 */}
        <div className="absolute top-3 left-3 z-20">
          <p className="text-[9px] text-white/40 font-medium tracking-wider uppercase">{location.name}</p>
          <h3 className="text-base font-bold text-white drop-shadow-lg">{zone?.name || placement.zoneName}</h3>
          <p className="text-[9px] text-white/30 mt-0.5 max-w-48">{zone?.description}</p>
        </div>
        <span className="absolute top-3 right-3 text-5xl opacity-15 select-none drop-shadow-2xl z-10">{location.emoji}</span>

        {/* === 소품 + 개념 마커 렌더링 === */}
        {Array.from(propGroups.values()).map(({ prop, items }, groupIdx) => (
          <div key={prop.propId}>
            {/* 소품 시각화 — 반투명 영역 + 이모지 */}
            <motion.div
              className="absolute pointer-events-none z-10"
              style={{
                left: `${prop.propPosition.x}%`,
                top: `${prop.propPosition.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: groupIdx * 0.15, duration: 0.4 }}
            >
              {/* 소품 배경 영역 */}
              <div className="relative flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-2xl drop-shadow-lg">{prop.propEmoji}</span>
                </div>
                <span className="text-[8px] text-white/50 mt-1 font-medium bg-black/30 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {prop.propName}
                </span>
              </div>
            </motion.div>

            {/* 개념 마커들 — 소품 슬롯 위치에 배치 */}
            {items.map(({ sub, assignment, index }) => {
              const isHighlighted = highlightId === sub.conceptId;
              const isSelected = selectedSub?.conceptId === sub.conceptId;

              return (
                <motion.button
                  key={sub.conceptId}
                  className="absolute flex flex-col items-center gap-0.5 group z-20"
                  style={{
                    left: `${assignment.absolutePosition.x}%`,
                    top: `${assignment.absolutePosition.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => handleClick(sub, index)}
                  initial={{ opacity: 0, scale: 0, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.06, type: "spring", stiffness: 400, damping: 15 }}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* 연결선 (소품→마커) */}
                  <svg className="absolute w-1 h-4 -top-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-30">
                    <line x1="2" y1="0" x2="2" y2="16" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>

                  {/* 마커 */}
                  <motion.div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xl transition-all ${
                      isHighlighted
                        ? "bg-[var(--accent-cyan)] text-white ring-2 ring-[var(--accent-cyan)] ring-offset-1 ring-offset-black/50"
                        : isSelected
                        ? "bg-[var(--accent-violet)] text-white ring-2 ring-[var(--accent-violet)] ring-offset-1 ring-offset-black/50"
                        : "bg-white text-gray-800 group-hover:bg-[var(--accent-violet)] group-hover:text-white"
                    }`}
                    animate={isHighlighted ? { boxShadow: ["0 0 0 0 rgba(6,182,212,0.4)", "0 0 0 12px rgba(6,182,212,0)", "0 0 0 0 rgba(6,182,212,0.4)"] } : {}}
                    transition={isHighlighted ? { duration: 1.5, repeat: Infinity } : {}}
                  >
                    {index + 1}
                  </motion.div>

                  {/* 슬롯 위치 */}
                  <span className="text-[7px] text-white/40 whitespace-nowrap">
                    {assignment.slotLabel}
                  </span>

                  {/* 개념 라벨 */}
                  {!hideLabels && (
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap max-w-24 truncate backdrop-blur-sm transition-colors ${
                      isHighlighted || isSelected
                        ? "bg-[var(--accent-violet)]/90 text-white"
                        : "bg-black/60 text-white/90 group-hover:bg-[var(--accent-violet)]/70"
                    }`}>
                      {sub.conceptLabel}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* === 소품-개념 매핑 범례 === */}
      <div className="flex flex-wrap gap-1.5">
        {Array.from(propGroups.values()).map(({ prop, items }) => (
          <button
            key={prop.propId}
            onClick={() => items[0] && handleClick(items[0].sub, items[0].index)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border border-white/5"
          >
            <span className="text-sm">{prop.propEmoji}</span>
            <span className="text-white/50">{prop.propName}:</span>
            <span className="text-white/80 font-medium truncate max-w-32">
              {items.map((i) => i.sub.conceptLabel).join(" · ")}
            </span>
          </button>
        ))}
      </div>

      {/* === 선택된 개념 상세 === */}
      <AnimatePresence mode="wait">
        {selectedSub && (
          <motion.div
            key={selectedSub.conceptId}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-xl glass border border-[var(--accent-violet)]/20 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {propGroups.get(
                  assignments[placement.subPlacements.indexOf(selectedSub)]?.propId
                )?.prop.propEmoji || "📍"}
              </span>
              <span className="text-xs text-[var(--accent-emerald)]">
                {selectedSub.position}
              </span>
            </div>
            <h4 className="font-bold text-[var(--accent-cyan)] text-lg mb-2">{selectedSub.conceptLabel}</h4>
            <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">{selectedSub.story}</p>
            {(() => {
              const thinkers = findThinkersInText(selectedSub.story);
              return thinkers.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {thinkers.map((t) => (
                    <ThinkerAvatar key={t.id} thinker={t} />
                  ))}
                </div>
              ) : null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
