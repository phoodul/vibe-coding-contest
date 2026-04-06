"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { NarratorControls } from "@/components/shared/narrator-controls";
import { Button } from "@/components/ui/button";
import { ALL_LOCATIONS } from "@/lib/data/locations";
import { useNarrator } from "@/hooks/use-narrator";
import { MapPin, RotateCcw, Eye, CheckCircle2, Volume2, ChevronDown, ArrowRight, Footprints } from "lucide-react";
import type { HierarchicalPlacement, SubPlacement } from "@/types/palace";
import { loadPalace, incrementReview, type FullPalace } from "@/lib/db/palaces";
import { findThinkersInText } from "@/lib/data/thinkers";
import { PalaceScene } from "@/components/palace/palace-scene";
import { PalaceWalkthrough } from "@/components/palace/palace-walkthrough";
import { ThinkerAvatar } from "@/components/shared/thinker-avatar";

export default function PalaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [palace, setPalace] = useState<FullPalace | null>(null);
  const [mode, setMode] = useState<"view" | "walkthrough" | "review" | "narrator" | "complete">("view");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<{ zoneLabel: string; position: string; conceptLabel: string; story: string }[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    loadPalace(id).then((data) => {
      if (data) setPalace(data);
    });
  }, [id]);

  // Flatten all sub-placements for narrator
  const narratorItems = useMemo(() => {
    if (!palace?.hierarchicalPlacements) return [];
    return palace.hierarchicalPlacements.flatMap((p) =>
      p.subPlacements.map((sub) => ({
        id: sub.conceptId,
        label: `${p.zoneName} · ${sub.position} — ${sub.conceptLabel}`,
        text: sub.story,
      }))
    );
  }, [palace]);

  const narrator = useNarrator(narratorItems);

  // Flatten for review
  const allReviewItems = useMemo(() => {
    if (!palace?.hierarchicalPlacements) return [];
    return palace.hierarchicalPlacements.flatMap((p) =>
      p.subPlacements.map((sub) => ({
        zoneLabel: p.zoneName,
        position: sub.position,
        conceptLabel: sub.conceptLabel,
        story: sub.story,
      }))
    );
  }, [palace]);

  function startReview() {
    setReviewItems(allReviewItems);
    setCurrentReviewIndex(0);
    setIsRevealed(false);
    setMode("review");
  }

  function startNarrator() {
    setMode("narrator");
    narrator.play(0);
  }

  function nextReview() {
    if (currentReviewIndex < allReviewItems.length - 1) {
      setCurrentReviewIndex((prev) => prev + 1);
      setIsRevealed(false);
    } else {
      if (palace) {
        incrementReview(id).then((newCount) => {
          setPalace({ ...palace, reviewCount: newCount });
        });
      }
      setMode("complete");
    }
  }

  if (!palace) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 px-6 text-center">
          <p className="text-[var(--muted-foreground)]">궁전을 불러오는 중...</p>
        </main>
      </>
    );
  }

  const location = ALL_LOCATIONS.find((l) => l.key === palace.locationKey);

  // ===== COMPLETE MODE =====
  if (mode === "complete") {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 px-6 pb-12 max-w-2xl mx-auto">
          <AnimatedContainer>
            <GlassCard className="p-10 text-center relative overflow-hidden" hover={false}>
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ["var(--accent-violet)", "var(--accent-cyan)", "var(--accent-emerald)", "#f59e0b"][i % 4],
                      left: `${10 + (i * 7) % 80}%`,
                      top: `${20 + (i * 13) % 60}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      y: [0, -40 - (i * 10)],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold mb-2"
              >
                복습 완료!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-[var(--muted-foreground)] mb-2"
              >
                {allReviewItems.length}개 개념을 모두 복습했습니다
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm mb-6"
              >
                <span className="text-[var(--accent-emerald)] font-semibold">
                  총 {palace.reviewCount}회
                </span> 복습 달성
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex gap-3 justify-center"
              >
                <Button
                  onClick={() => { setMode("review"); setCurrentReviewIndex(0); setIsRevealed(false); }}
                  variant="outline"
                  className="border-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  한 번 더
                </Button>
                <Button
                  onClick={() => setMode("view")}
                  className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white"
                >
                  궁전으로 돌아가기
                </Button>
              </motion.div>
            </GlassCard>
          </AnimatedContainer>
        </main>
      </>
    );
  }

  // ===== NARRATOR MODE =====
  if (mode === "narrator") {
    const currentItem = narratorItems[narrator.currentIndex];
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 px-6 pb-12 max-w-3xl mx-auto">
          <AnimatedContainer>
            <GlassCard className="p-8 mb-6" hover={false}>
              <p className="text-xs text-[var(--accent-emerald)] mb-2 text-center">
                📍 {currentItem?.label.split("—")[0]?.trim()}
              </p>
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-2 rounded-xl bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] font-semibold">
                  {currentItem?.label.split("—")[1]?.trim()}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-center">
                {currentItem?.text}
              </p>
            </GlassCard>

            <NarratorControls
              isPlaying={narrator.isPlaying}
              isPaused={narrator.isPaused}
              currentIndex={narrator.currentIndex}
              totalItems={narrator.totalItems}
              voiceType={narrator.voiceType}
              voiceLabels={narrator.voiceLabels}
              currentLabel={currentItem?.label.split("—")[1]?.trim()}
              onPlay={() => narrator.play()}
              onPause={narrator.pause}
              onResume={narrator.resume}
              onStop={() => { narrator.stop(); setMode("view"); }}
              onNext={narrator.next}
              onPrev={narrator.prev}
              onVoiceChange={narrator.setVoiceType}
            />

            <Button
              variant="ghost"
              className="mt-4 w-full text-[var(--muted-foreground)]"
              onClick={() => { narrator.stop(); setMode("view"); }}
            >
              나레이터 종료
            </Button>
          </AnimatedContainer>
        </main>
      </>
    );
  }

  // ===== REVIEW MODE =====
  if (mode === "review" && allReviewItems.length > 0) {
    const current = allReviewItems[currentReviewIndex];
    const progress = ((currentReviewIndex + (isRevealed ? 1 : 0)) / allReviewItems.length) * 100;

    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 px-6 pb-12 max-w-2xl mx-auto">
          <AnimatedContainer>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-[var(--muted-foreground)] mb-2">
                <span>복습 진행</span>
                <span>{currentReviewIndex + 1} / {allReviewItems.length}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <GlassCard className="p-8 text-center" hover={false}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[var(--accent-cyan)]" />
                <span className="text-[var(--accent-cyan)] font-medium">{current.zoneLabel}</span>
              </div>
              <p className="text-xs text-[var(--accent-emerald)] mb-6">📍 {current.position}</p>
              <p className="text-[var(--muted-foreground)] mb-6">이 위치에 어떤 개념이 있었나요?</p>

              {isRevealed ? (
                <AnimatedContainer delay={0}>
                  <div className="px-4 py-3 rounded-xl bg-[var(--accent-violet)]/20 mb-4">
                    <h3 className="text-lg font-bold text-[var(--accent-violet)]">{current.conceptLabel}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-left mb-4">{current.story}</p>
                  {(() => {
                    const thinkers = findThinkersInText(current.story);
                    return thinkers.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {thinkers.map((t) => (
                          <ThinkerAvatar key={t.id} thinker={t} size="md" />
                        ))}
                      </div>
                    ) : null;
                  })()}
                  <Button
                    onClick={nextReview}
                    className="w-full bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] text-white font-semibold"
                  >
                    {currentReviewIndex < allReviewItems.length - 1 ? (
                      <>다음 위치 <ArrowRight className="w-4 h-4 ml-2" /></>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> 복습 완료!</>
                    )}
                  </Button>
                </AnimatedContainer>
              ) : (
                <Button
                  onClick={() => setIsRevealed(true)}
                  size="lg"
                  className="w-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white font-semibold py-5"
                >
                  <Eye className="w-5 h-5 mr-2" /> 정답 확인
                </Button>
              )}
            </GlassCard>

            <Button variant="ghost" className="mt-4 w-full text-[var(--muted-foreground)]" onClick={() => setMode("view")}>
              복습 중단
            </Button>
          </AnimatedContainer>
        </main>
      </>
    );
  }

  // ===== WALKTHROUGH MODE =====
  if (mode === "walkthrough" && location) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
          <PalaceWalkthrough
            location={location}
            placements={palace.hierarchicalPlacements}
            onClose={() => setMode("view")}
          />
        </main>
      </>
    );
  }

  // ===== VIEW MODE — 시각적 공간 뷰 =====
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
        <AnimatedContainer>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">{location?.emoji} {palace.unitTitle}</h1>
              <p className="text-[var(--muted-foreground)]">
                {location?.name} · {palace.nodeCount}개 개념 · 복습 {palace.reviewCount}회
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button onClick={() => setMode("walkthrough")} variant="outline" className="border-[var(--accent-emerald)]/30 text-[var(--accent-emerald)]">
                <Footprints className="w-4 h-4 mr-2" /> 궁전 걷기
              </Button>
              <Button onClick={startNarrator} variant="outline" className="border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]">
                <Volume2 className="w-4 h-4 mr-2" /> 나레이터
              </Button>
              <Button onClick={startReview} className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white">
                <RotateCcw className="w-4 h-4 mr-2" /> 복습
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* 시각적 궁전 — 구역별 공간 씬 */}
        <div className="space-y-6">
          {palace.hierarchicalPlacements?.map((placement, i) => (
            <AnimatedContainer key={placement.topicId} delay={i * 0.1}>
              <div className="mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <h3 className="font-semibold">{placement.topicLabel}</h3>
                <span className="text-xs text-[var(--muted-foreground)]">· {placement.zoneName}</span>
              </div>
              {location && (
                <PalaceScene location={location} placement={placement} />
              )}
            </AnimatedContainer>
          ))}
        </div>
      </main>
    </>
  );
}
