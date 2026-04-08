"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudyRoomSVG } from "@/components/mind-palace/study-room-svg";
import {
  ETHICS_CH3_PALACE,
  getAllItems,
  findItemByObjectId,
  type PalaceItem,
  type PalaceSection,
} from "@/lib/data/mind-palace/ethics-ch3-palace";
import { usePalaceNarrator } from "@/hooks/use-palace-narrator";

const ZONE_COLORS: Record<string, string> = {
  west: "text-amber-400",
  north: "text-emerald-400",
  east: "text-blue-400",
  center: "text-purple-400",
};

const ZONE_BG: Record<string, string> = {
  west: "bg-amber-500/10 border-amber-500/30",
  north: "bg-emerald-500/10 border-emerald-500/30",
  east: "bg-blue-500/10 border-blue-500/30",
  center: "bg-purple-500/10 border-purple-500/30",
};

const ZONE_ACTIVE_BG: Record<string, string> = {
  west: "bg-amber-500/20 border-amber-400",
  north: "bg-emerald-500/20 border-emerald-400",
  east: "bg-blue-500/20 border-blue-400",
  center: "bg-purple-500/20 border-purple-400",
};

export default function MindPalacePage() {
  const allItems = getAllItems();
  const [activeItem, setActiveItem] = useState<PalaceItem | null>(null);
  const narrator = usePalaceNarrator(allItems);

  const handleObjectClick = useCallback(
    (objectId: string) => {
      const item = findItemByObjectId(objectId);
      if (item) {
        setActiveItem(item);
      }
    },
    []
  );

  const handleTreeClick = useCallback(
    (item: PalaceItem) => {
      setActiveItem(item);
    },
    []
  );

  const handleNarratorStart = useCallback(
    (startIndex?: number) => {
      narrator.play(startIndex ?? 0);
    },
    [narrator]
  );

  // 나레이터 현재 항목과 동기화
  const currentObjectId =
    narrator.currentItem?.objectId ?? activeItem?.objectId ?? null;
  const displayItem = narrator.currentItem ?? activeItem;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f1628] to-[#0a0a1a] text-white">
      {/* ── 헤더 ── */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-amber-400">🏛️</span> 기억의 궁전
            </h1>
            <p className="text-sm text-white/50 mt-1">
              {ETHICS_CH3_PALACE.chapter} {ETHICS_CH3_PALACE.title} —{" "}
              {allItems.length}개 항목 · 4개 영역
            </p>
          </div>

          {/* 나레이터 컨트롤 */}
          <div className="flex items-center gap-2">
            {narrator.isPlaying || narrator.currentIndex >= 0 ? (
              <>
                <button
                  onClick={narrator.prev}
                  disabled={narrator.currentIndex <= 0}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm transition-colors"
                >
                  ⏮
                </button>
                <button
                  onClick={narrator.isPlaying ? narrator.pause : narrator.resume}
                  className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium transition-colors"
                >
                  {narrator.isLoading
                    ? "로딩..."
                    : narrator.isPlaying
                    ? "⏸ 일시정지"
                    : "▶ 계속"}
                </button>
                <button
                  onClick={narrator.next}
                  disabled={narrator.currentIndex >= allItems.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm transition-colors"
                >
                  ⏭
                </button>
                <button
                  onClick={narrator.stop}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm transition-colors"
                >
                  ⏹ 정지
                </button>
                <span className="text-xs text-white/40 ml-2">
                  {narrator.currentIndex + 1}/{allItems.length}
                </span>
              </>
            ) : (
              <button
                onClick={() => handleNarratorStart(0)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-white/10 text-sm font-medium transition-all"
              >
                🎙️ 선생님 나레이션 시작
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 메인 레이아웃 ── */}
      <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[260px_1fr_340px] gap-6">
        {/* 좌: 계층 목차 */}
        <aside className="space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-2">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">
            목차
          </h2>
          {ETHICS_CH3_PALACE.sections.map((section) => (
            <SectionTree
              key={section.id}
              section={section}
              activeItemId={displayItem?.id ?? null}
              playingItemId={narrator.currentItem?.id ?? null}
              onItemClick={handleTreeClick}
            />
          ))}
        </aside>

        {/* 중: SVG 서재 */}
        <main className="glass-gradient p-4 flex items-center justify-center">
          <StudyRoomSVG
            activeObjectId={currentObjectId}
            onObjectClick={handleObjectClick}
            playingObjectId={narrator.currentItem?.objectId ?? null}
          />
        </main>

        {/* 우: 콘텐츠 패널 */}
        <aside className="max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {displayItem ? (
              <motion.div
                key={displayItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-gradient p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{displayItem.label}</h3>
                  <button
                    onClick={() => {
                      const idx = allItems.findIndex(
                        (i) => i.id === displayItem.id
                      );
                      if (idx >= 0) handleNarratorStart(idx);
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs transition-colors"
                  >
                    🎙️ 이 항목부터 듣기
                  </button>
                </div>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {displayItem.detail}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-gradient p-8 text-center"
              >
                <p className="text-4xl mb-4">🏛️</p>
                <p className="text-white/50 text-sm">
                  서재의 물건을 클릭하거나
                  <br />
                  목차에서 항목을 선택하세요
                </p>
                <p className="text-white/30 text-xs mt-3">
                  또는 나레이션을 시작하면
                  <br />
                  선생님이 순서대로 설명해줍니다
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

/** 소단원 트리 컴포넌트 */
function SectionTree({
  section,
  activeItemId,
  playingItemId,
  onItemClick,
}: {
  section: PalaceSection;
  activeItemId: string | null;
  playingItemId: string | null;
  onItemClick: (item: PalaceItem) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`rounded-xl border p-3 ${ZONE_BG[section.zone]}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center gap-2"
      >
        <span
          className={`text-xs ${expanded ? "rotate-90" : ""} transition-transform`}
        >
          ▶
        </span>
        <span className={`text-sm font-semibold ${ZONE_COLORS[section.zone]}`}>
          {section.title}
        </span>
        <span className="text-[10px] text-white/30 ml-auto">
          {section.zoneLabel}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-1 overflow-hidden"
          >
            {section.items.map((item) => {
              const isActive = activeItemId === item.id;
              const isPlaying = playingItemId === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onItemClick(item)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${
                      isPlaying
                        ? ZONE_ACTIVE_BG[section.zone] +
                          " border font-semibold text-white"
                        : isActive
                        ? "bg-white/10 border border-white/20 text-white"
                        : "hover:bg-white/5 text-white/60 border border-transparent"
                    }`}
                  >
                    {isPlaying && (
                      <span className="inline-block mr-1 animate-pulse">
                        🔊
                      </span>
                    )}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
