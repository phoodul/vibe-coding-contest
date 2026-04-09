"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ETHICS_STRUCTURED_CH3 } from "@/lib/data/textbooks/structured/ethics-structured-ch3";
import { ETHICS_BUILDING } from "@/lib/mind-palace/building-config";
import { flattenStructuredSections } from "@/lib/mind-palace/flatten-nodes";
import { useStructuredNarrator } from "@/hooks/use-structured-narrator";
import { ROOM_301_CONFIG } from "@/lib/mind-palace/room-301-config";
import {
  PalaceScene,
  type PalaceMode,
  type ReviewClickState,
} from "@/components/mind-palace/palace-scene";
import { SidebarTree } from "@/components/mind-palace/sidebar-tree";
import type { SceneObject, ObjectPart } from "@/lib/mind-palace/scene-config";

const SECTION_DATA = ETHICS_STRUCTURED_CH3;

// TTS 음성 옵션
const VOICE_OPTIONS = [
  { id: "nova", label: "여성 1", group: "여성" },
  { id: "shimmer", label: "여성 2", group: "여성" },
  { id: "fable", label: "여성 3", group: "여성" },
  { id: "onyx", label: "남성 1", group: "남성" },
  { id: "echo", label: "남성 2", group: "남성" },
  { id: "alloy", label: "남성 3", group: "남성" },
];

export default function MindPalacePage() {
  // ── 데이터 ──
  const flatItems = useMemo(() => flattenStructuredSections(SECTION_DATA), []);

  // ── 모드 ──
  const [mode, setMode] = useState<PalaceMode>("learn");

  // ── 사이드바 ──
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullscreenScene, setFullscreenScene] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>("301");

  // ── 나레이터 ──
  const [voice, setVoiceState] = useState("nova");
  const narrator = useStructuredNarrator(flatItems);

  const setVoice = useCallback(
    (v: string) => {
      setVoiceState(v);
      narrator.setVoice(v);
    },
    [narrator]
  );

  // ── 학습 모드: 클릭으로 선택된 오브젝트 ──
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);

  // ── 복습 모드: reviewStates (오브젝트 ID별 3-click 상태) ──
  const [reviewStates, setReviewStates] = useState<
    Record<string, ReviewClickState>
  >({});

  // walkPath index for arrow key navigation
  const [walkIdx, setWalkIdx] = useState(0);
  const walkPath = ROOM_301_CONFIG.walkPath;

  // ── 복습 모드 3-click cycle ──
  const cycleReviewState = useCallback((objId: string) => {
    setReviewStates((prev) => {
      const current = prev[objId] || "scene";
      const next: ReviewClickState =
        current === "scene"
          ? "keyword"
          : current === "keyword"
          ? "text"
          : "scene";
      return { ...prev, [objId]: next };
    });
  }, []);

  // ── 키보드 이벤트 (복습 모드 방향키) ──
  useEffect(() => {
    if (mode !== "review") return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setWalkIdx((prev) => {
          const next = Math.min(prev + 1, walkPath.length - 1);
          cycleReviewState(walkPath[next]);
          return next;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setWalkIdx((prev) => {
          const next = Math.max(prev - 1, 0);
          cycleReviewState(walkPath[next]);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, walkPath, cycleReviewState]);

  // ── Part 클릭 ──
  const handlePartClick = useCallback(
    (obj: SceneObject, _part: ObjectPart) => {
      if (mode === "learn") {
        // 파트 클릭 = 해당 오브젝트 전체 텍스트 토글
        setSelectedObjId((prev) => (prev === obj.id ? null : obj.id));
      }
    },
    [mode]
  );

  // ── Object 클릭 ──
  const handleObjectClick = useCallback(
    (obj: SceneObject) => {
      if (mode === "review") {
        cycleReviewState(obj.id);
        return;
      }
      // 학습 모드: toggle — 클릭하면 전체 파트 텍스트 표시/숨김
      setSelectedObjId((prev) => (prev === obj.id ? null : obj.id));
    },
    [mode, cycleReviewState]
  );

  // ── Sidebar 네비게이션 ──
  const handleRoomSelect = useCallback(
    (roomId: string, _sectionId: string) => {
      setActiveRoomId(roomId);
    },
    []
  );

  const handleNoteSelect = useCallback(
    (noteId: string) => {
      if (mode === "learn") {
        const idx = flatItems.findIndex((item) => item.noteId === noteId);
        if (idx >= 0) narrator.play(idx);
      }
    },
    [flatItems, narrator, mode]
  );

  // ── 모드 전환 ──
  const toggleMode = useCallback(() => {
    setMode((m) => (m === "learn" ? "review" : "learn"));
    setReviewStates({});
    setSelectedObjId(null);
    setWalkIdx(0);
    narrator.stop();
  }, [narrator]);

  // 나레이터의 현재 noteId
  const narratorNoteId = narrator.currentItem?.noteId ?? null;

  const totalItems = flatItems.length;
  const progress =
    narrator.currentIndex >= 0
      ? Math.round(((narrator.currentIndex + 1) / totalItems) * 100)
      : 0;

  return (
    <div className="h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f1628] to-[#0a0a1a] text-white flex flex-col overflow-hidden">
      {/* ── 헤더 ── */}
      <header className="border-b border-white/10 px-4 py-2.5 bg-[#0a0a1a]/90 backdrop-blur-xl z-30 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          {/* 좌: 타이틀 + 모드 전환 */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span className="text-amber-400">🏛️</span>
              기억의 궁전
            </h1>

            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => mode !== "learn" && toggleMode()}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  mode === "learn"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-white/5 text-white/50 hover:text-white/70"
                }`}
              >
                학습하기
              </button>
              <button
                onClick={() => mode !== "review" && toggleMode()}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  mode === "review"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-white/5 text-white/50 hover:text-white/70"
                }`}
              >
                복습하기
              </button>
            </div>

            <span className="text-white/30 text-xs">
              {ROOM_301_CONFIG.title} · {ROOM_301_CONFIG.objects.length}개 오브젝트
            </span>

            <button
              onClick={() => {
                setFullscreenScene((f) => !f);
                setSidebarCollapsed(true);
              }}
              className={`px-3 py-1.5 text-sm font-bold rounded-lg border transition-all ${
                fullscreenScene
                  ? "bg-amber-500/30 text-amber-200 border-amber-400/40 shadow-lg shadow-amber-500/10"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/10"
              }`}
              title={fullscreenScene ? "사이드바 복원" : "전체보기 (사이드바 숨김)"}
            >
              {fullscreenScene ? "◧ 사이드바 복원" : "⛶ 전체보기"}
            </button>
          </div>

          {/* 우: 나레이터 컨트롤 */}
          <div className="flex items-center gap-3">
            {mode === "learn" && (
              <>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 outline-none"
                >
                  {VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#1a1a2e]">
                      🎙️ {v.label} ({v.group})
                    </option>
                  ))}
                </select>

                <NarratorControls narrator={narrator} totalItems={totalItems} />
              </>
            )}

            {mode === "review" && (
              <span className="text-xs text-purple-300/70">
                ← → 방향키로 이동 · 클릭으로 암기 확인
              </span>
            )}
          </div>
        </div>

        {/* 프로그레스 바 */}
        {narrator.currentIndex >= 0 && mode === "learn" && (
          <div className="max-w-[1800px] mx-auto mt-1.5">
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
      <div className="flex-1 flex overflow-hidden">
        {/* 좌: Sidebar (전체보기 시 접힘, 토글 가능) */}
        {(!fullscreenScene || !sidebarCollapsed) && (
          <SidebarTree
            building={ETHICS_BUILDING}
            sections={SECTION_DATA}
            activeRoomId={activeRoomId}
            activeNoteId={narratorNoteId}
            onRoomSelect={handleRoomSelect}
            onNoteSelect={handleNoteSelect}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
          />
        )}

        {/* 우: Scene (메인) — 텍스트 표시는 Scene 위에서만 */}
        <main className="flex-1 relative overflow-hidden p-4">
          <div className="w-full h-full rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden relative">
            <PalaceScene
              config={ROOM_301_CONFIG}
              mode={mode}
              activeFlatIndex={narrator.currentIndex}
              revealedUpTo={narrator.revealedUpTo}
              selectedObjId={selectedObjId}
              reviewStates={reviewStates}
              onPartClick={handlePartClick}
              onObjectClick={handleObjectClick}
            />
          </div>
        </main>
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
      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-white/10 text-sm font-medium transition-all"
    >
      🎙️ 나레이션 시작
    </button>
  );
}
