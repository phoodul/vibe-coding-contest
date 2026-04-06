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

  // 소품에 개념 배정
  const assignments = assignItemsToProps(placement.subPlacements.length, placement.zoneId);

  // 소품별로 그룹화 (같은 소품에 배치된 개념들)
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
      {/* 구역 시각 씬 */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/10"
        style={{ aspectRatio: "16/9", background: location.gradient }}
      >
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />

        {/* 장소/구역 라벨 */}
        <div className="absolute top-3 left-3 z-10">
          <p className="text-[10px] text-white/40 font-medium">{location.name}</p>
          <h3 className="text-sm font-bold text-white drop-shadow-lg">{zone?.name || placement.zoneName}</h3>
        </div>
        <span className="absolute top-3 right-3 text-4xl opacity-20 select-none">{location.emoji}</span>

        {/* 소품별 렌더링 */}
        {Array.from(propGroups.values()).map(({ prop, items }) => (
          <div key={prop.propId}>
            {/* 소품 이모지 (가구/구조물) */}
            <motion.div
              className="absolute flex flex-col items-center pointer-events-none"
              style={{ left: `${prop.propPosition.x}%`, top: `${prop.propPosition.y}%`, transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.35, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-3xl drop-shadow-lg">{prop.propEmoji}</span>
              <span className="text-[8px] text-white/40 mt-0.5">{prop.propName}</span>
            </motion.div>

            {/* 소품 위의 개념 마커들 */}
            {items.map(({ sub, assignment, index }) => {
              const isHighlighted = highlightId === sub.conceptId;
              const isSelected = selectedSub?.conceptId === sub.conceptId;

              return (
                <motion.button
                  key={sub.conceptId}
                  className="absolute flex flex-col items-center gap-0.5 group z-10"
                  style={{
                    left: `${assignment.absolutePosition.x}%`,
                    top: `${assignment.absolutePosition.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => handleClick(sub, index)}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.08, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* 마커 핀 */}
                  <motion.div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-colors ${
                      isHighlighted
                        ? "bg-[var(--accent-cyan)] text-white ring-2 ring-[var(--accent-cyan)]"
                        : isSelected
                        ? "bg-[var(--accent-violet)] text-white ring-2 ring-[var(--accent-violet)]"
                        : "bg-white/90 text-gray-800 group-hover:bg-white"
                    }`}
                    animate={isHighlighted ? { scale: [1, 1.2, 1] } : {}}
                    transition={isHighlighted ? { duration: 1, repeat: Infinity } : {}}
                  >
                    {index + 1}
                  </motion.div>

                  {/* 슬롯 라벨 (소품 위 위치) */}
                  <span className="text-[7px] text-white/50 bg-black/30 px-1 py-px rounded whitespace-nowrap">
                    {assignment.slotLabel}
                  </span>

                  {/* 개념 라벨 */}
                  {!hideLabels && (
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap max-w-20 truncate ${
                      isHighlighted || isSelected
                        ? "bg-[var(--accent-violet)]/80 text-white"
                        : "bg-black/50 text-white/90"
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

      {/* 소품-개념 매핑 요약 (접이식) */}
      <div className="text-xs text-[var(--muted-foreground)] flex flex-wrap gap-2">
        {Array.from(propGroups.values()).map(({ prop, items }) => (
          <span key={prop.propId} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
            <span>{prop.propEmoji}</span>
            <span>{prop.propName}:</span>
            <span className="text-white/70">{items.map(i => i.sub.conceptLabel).join(", ")}</span>
          </span>
        ))}
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[var(--accent-emerald)] text-xs">📍 {selectedSub.position}</span>
            </div>
            <h4 className="font-semibold text-[var(--accent-cyan)] mb-1">{selectedSub.conceptLabel}</h4>
            <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">{selectedSub.story}</p>
            {(() => {
              const thinkers = findThinkersInText(selectedSub.story);
              return thinkers.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
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
