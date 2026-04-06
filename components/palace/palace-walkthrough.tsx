"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PalaceScene } from "./palace-scene";
import type { HierarchicalPlacement } from "@/types/palace";
import type { PalaceLocation } from "@/lib/data/locations";

interface PalaceWalkthroughProps {
  location: PalaceLocation;
  placements: HierarchicalPlacement[];
  onClose: () => void;
}

export function PalaceWalkthrough({ location, placements, onClose }: PalaceWalkthroughProps) {
  const [currentZone, setCurrentZone] = useState(0);
  const total = placements.length;

  function next() {
    if (currentZone < total - 1) setCurrentZone((p) => p + 1);
  }

  function prev() {
    if (currentZone > 0) setCurrentZone((p) => p - 1);
  }

  const placement = placements[currentZone];
  const progress = ((currentZone + 1) / total) * 100;

  return (
    <div>
      {/* 진행률 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-[var(--muted-foreground)] mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {location.name} 탐험
          </span>
          <span>{currentZone + 1} / {total} 구역</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 구역 씬 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={placement.topicId}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {/* 대주제 라벨 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] text-sm font-semibold">
              {placement.topicLabel}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {placement.subPlacements.length}개 개념 배치됨
            </span>
          </div>

          <PalaceScene location={location} placement={placement} />
        </motion.div>
      </AnimatePresence>

      {/* 네비게이션 */}
      <div className="flex items-center gap-3 mt-4">
        <Button
          variant="outline"
          onClick={prev}
          disabled={currentZone === 0}
          className="border-white/10"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          이전 구역
        </Button>

        <div className="flex-1" />

        {currentZone < total - 1 ? (
          <Button
            onClick={next}
            className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white"
          >
            다음 구역
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] text-white"
          >
            탐험 완료
          </Button>
        )}
      </div>
    </div>
  );
}
