"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ETHICS_STRUCTURED_CH3 } from "@/lib/data/textbooks/structured/ethics-structured-ch3";
import { flattenStructuredSections } from "@/lib/mind-palace/flatten-nodes";
import { useStructuredNarrator } from "@/hooks/use-structured-narrator";
import { PalaceScene } from "@/components/mind-palace/palace-scene";
import { TextTreePanel } from "@/components/mind-palace/text-tree-panel";

const SECTION_DATA = ETHICS_STRUCTURED_CH3;

export default function MindPalacePage() {
  const flatItems = useMemo(
    () => flattenStructuredSections(SECTION_DATA),
    []
  );

  const narrator = useStructuredNarrator(flatItems);

  // 현재 활성 noteId / sectionId (클릭 또는 나레이터 기반)
  const [manualNoteId, setManualNoteId] = useState<string | null>(null);

  const activeNoteId = narrator.currentItem?.noteId ?? manualNoteId;
  const activeSectionId = narrator.currentItem?.sectionId ?? null;

  const handleNoteClick = useCallback(
    (noteId: string) => {
      setManualNoteId(noteId);
      // 나레이터가 진행 중이면 해당 note의 첫 아이템으로 이동
      if (narrator.isPlaying) {
        const idx = flatItems.findIndex((item) => item.noteId === noteId);
        if (idx >= 0) narrator.play(idx);
      }
    },
    [flatItems, narrator]
  );

  const handleItemClick = useCallback(
    (globalIndex: number) => {
      narrator.play(globalIndex);
    },
    [narrator]
  );

  const totalItems = flatItems.length;
  const progress =
    narrator.currentIndex >= 0
      ? Math.round(((narrator.currentIndex + 1) / totalItems) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f1628] to-[#0a0a1a] text-white">
      {/* ── 헤더 ── */}
      <header className="border-b border-white/10 px-4 py-3 sticky top-0 z-20 bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span className="text-amber-400">🏛️</span>
              기억의 궁전
              <span className="text-white/30 font-normal text-sm ml-2">
                제3장 사회와 윤리
              </span>
            </h1>
            <p className="text-xs text-white/40 mt-0.5">
              {totalItems}개 항목 · {SECTION_DATA.length}개 영역
              {narrator.currentIndex >= 0 && (
                <span className="ml-2 text-amber-400">
                  진행률 {progress}%
                </span>
              )}
            </p>
          </div>

          {/* 나레이터 컨트롤 */}
          <NarratorControls
            narrator={narrator}
            totalItems={totalItems}
          />
        </div>

        {/* 프로그레스 바 */}
        {narrator.currentIndex >= 0 && (
          <div className="max-w-[1600px] mx-auto mt-2">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </header>

      {/* ── 메인 레이아웃 ── */}
      <div className="max-w-[1600px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* 좌: 텍스트 트리 (메인 콘텐츠) */}
        <main className="max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin pr-2">
          <TextTreePanel
            sections={SECTION_DATA}
            flatItems={flatItems}
            currentIndex={narrator.currentIndex}
            revealedUpTo={narrator.revealedUpTo}
            onItemClick={handleItemClick}
          />
        </main>

        {/* 우: 씬 + 현재 항목 디테일 */}
        <aside className="space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
          {/* 씬 SVG */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <PalaceScene
              sections={SECTION_DATA}
              activeNoteId={activeNoteId}
              activeSectionId={activeSectionId}
              onNoteClick={handleNoteClick}
            />
          </div>

          {/* 현재 항목 디테일 카드 */}
          <AnimatePresence mode="wait">
            {narrator.currentItem ? (
              <motion.div
                key={narrator.currentItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-white/40">
                    {narrator.currentItem.sectionTitle}
                  </span>
                  <span className="text-white/20">›</span>
                  <span className="text-xs text-white/50">
                    {narrator.currentItem.noteLabel}
                  </span>
                </div>
                <p className="text-base text-white leading-relaxed font-medium">
                  {narrator.currentItem.text}
                </p>
                <p className="text-[10px] text-white/30">
                  {narrator.currentIndex + 1} / {totalItems}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center"
              >
                <p className="text-3xl mb-3">🏛️</p>
                <p className="text-white/40 text-sm">
                  서재의 물건을 클릭하거나
                </p>
                <p className="text-white/40 text-sm">
                  나레이션을 시작하세요
                </p>
                <p className="text-white/25 text-xs mt-3">
                  텍스트를 클릭하면 해당 항목부터 읽기 시작합니다
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

/** 나레이터 컨트롤 버튼 그룹 */
function NarratorControls({
  narrator,
  totalItems,
}: {
  narrator: ReturnType<typeof useStructuredNarrator>;
  totalItems: number;
}) {
  if (narrator.isPlaying || narrator.currentIndex >= 0) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={narrator.prev}
          disabled={narrator.currentIndex <= 0}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm transition-colors"
        >
          ⏮
        </button>
        <button
          onClick={narrator.isPlaying ? narrator.pause : narrator.resume}
          className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium transition-colors min-w-[80px]"
        >
          {narrator.isLoading
            ? "로딩..."
            : narrator.isPlaying
            ? "⏸ 일시정지"
            : "▶ 계속"}
        </button>
        <button
          onClick={narrator.next}
          disabled={narrator.currentIndex >= totalItems - 1}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm transition-colors"
        >
          ⏭
        </button>
        <button
          onClick={narrator.stop}
          className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm transition-colors"
        >
          ⏹
        </button>
        <span className="text-xs text-white/30 ml-1.5 tabular-nums">
          {narrator.currentIndex + 1}/{totalItems}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => narrator.play(0)}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-white/10 text-sm font-medium transition-all"
    >
      🎙️ 나레이션 시작
    </button>
  );
}
