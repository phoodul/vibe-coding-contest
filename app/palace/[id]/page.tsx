"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { NarratorControls } from "@/components/shared/narrator-controls";
import { Button } from "@/components/ui/button";
import { LOCATIONS } from "@/lib/data/locations";
import { useNarrator } from "@/hooks/use-narrator";
import { MapPin, ArrowRight, RotateCcw, Eye, CheckCircle2, Volume2 } from "lucide-react";
import type { MindMap } from "@/types/mindmap";
import type { Placement } from "@/types/palace";

interface FullPalace {
  id: string;
  locationKey: string;
  unitTitle: string;
  subject: string;
  nodeCount: number;
  reviewCount: number;
  createdAt: string;
  mindMap: MindMap;
  placements: (Placement & { memoryStory: string })[];
}

export default function PalaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [palace, setPalace] = useState<FullPalace | null>(null);
  const [mode, setMode] = useState<"view" | "review" | "narrator">("view");
  const [revealedNodes, setRevealedNodes] = useState<Set<string>>(new Set());
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`palace_${id}`);
    if (saved) setPalace(JSON.parse(saved));
  }, [id]);

  // Narrator items
  const narratorItems = useMemo(() => {
    if (!palace) return [];
    return palace.placements.map((p) => ({
      id: p.nodeId,
      label: `${p.zoneName} — ${p.nodeLabel}`,
      text: p.memoryStory,
    }));
  }, [palace]);

  const narrator = useNarrator(narratorItems);

  function startReview() {
    setMode("review");
    setRevealedNodes(new Set());
    setCurrentReviewIndex(0);
  }

  function startNarrator() {
    setMode("narrator");
    narrator.play(0);
  }

  function revealCurrent() {
    if (!palace) return;
    const nodeId = palace.placements[currentReviewIndex]?.nodeId;
    if (nodeId) setRevealedNodes((prev) => new Set(prev).add(nodeId));
  }

  function nextReviewItem() {
    if (!palace) return;
    if (currentReviewIndex < palace.placements.length - 1) {
      setCurrentReviewIndex((prev) => prev + 1);
    } else {
      const updated = { ...palace, reviewCount: palace.reviewCount + 1 };
      setPalace(updated);
      localStorage.setItem(`palace_${id}`, JSON.stringify(updated));
      const list = JSON.parse(localStorage.getItem("palaces") || "[]");
      const idx = list.findIndex((p: FullPalace) => p.id === id);
      if (idx >= 0) {
        list[idx].reviewCount = updated.reviewCount;
        localStorage.setItem("palaces", JSON.stringify(list));
      }
      setMode("view");
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

  const location = LOCATIONS.find((l) => l.key === palace.locationKey);

  // ===== NARRATOR MODE =====
  if (mode === "narrator") {
    const currentPlacement = palace.placements[narrator.currentIndex];
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 px-6 pb-12 max-w-3xl mx-auto">
          <AnimatedContainer>
            {/* Current zone display */}
            <GlassCard className="p-8 mb-6" hover={false}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[var(--accent-cyan)]" />
                <span className="text-xl font-bold text-[var(--accent-cyan)]">
                  {currentPlacement?.zoneName}
                </span>
              </div>

              <div className="text-center mb-4">
                <span className="inline-block px-4 py-2 rounded-xl bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] font-semibold">
                  {currentPlacement?.nodeLabel}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-center">
                {currentPlacement?.memoryStory}
              </p>
            </GlassCard>

            {/* Narrator Controls */}
            <NarratorControls
              isPlaying={narrator.isPlaying}
              isPaused={narrator.isPaused}
              currentIndex={narrator.currentIndex}
              totalItems={narrator.totalItems}
              voiceType={narrator.voiceType}
              voiceLabels={narrator.voiceLabels}
              currentLabel={currentPlacement?.nodeLabel}
              onPlay={() => narrator.play()}
              onPause={narrator.pause}
              onResume={narrator.resume}
              onStop={() => {
                narrator.stop();
                setMode("view");
              }}
              onNext={narrator.next}
              onPrev={narrator.prev}
              onVoiceChange={narrator.setVoiceType}
            />

            {/* Quick navigation - mind map nodes */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
                개념 바로가기
              </h3>
              <div className="flex flex-wrap gap-2">
                {palace.placements.map((p, i) => (
                  <button
                    key={p.nodeId}
                    onClick={() => narrator.goTo(i)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      narrator.currentIndex === i
                        ? "bg-[var(--accent-violet)] text-white"
                        : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
                    }`}
                  >
                    {p.nodeLabel}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-4 w-full text-[var(--muted-foreground)]"
              onClick={() => {
                narrator.stop();
                setMode("view");
              }}
            >
              나레이터 종료
            </Button>
          </AnimatedContainer>
        </main>
      </>
    );
  }

  // ===== REVIEW MODE =====
  if (mode === "review") {
    const currentPlacement = palace.placements[currentReviewIndex];
    const isRevealed = revealedNodes.has(currentPlacement.nodeId);
    const progress = ((currentReviewIndex + (isRevealed ? 1 : 0)) / palace.placements.length) * 100;

    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 px-6 pb-12 max-w-2xl mx-auto">
          <AnimatedContainer>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-[var(--muted-foreground)] mb-2">
                <span>복습 진행</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <GlassCard className="p-8 text-center" hover={false}>
              <div className="flex items-center justify-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-[var(--accent-cyan)]" />
                <span className="text-lg font-semibold text-[var(--accent-cyan)]">
                  {currentPlacement.zoneName}
                </span>
              </div>

              <p className="text-[var(--muted-foreground)] mb-6">
                이 장소에 어떤 개념이 있었나요?
              </p>

              {isRevealed ? (
                <AnimatedContainer delay={0}>
                  <div className="px-4 py-3 rounded-xl bg-[var(--accent-violet)]/20 mb-4">
                    <h3 className="text-xl font-bold text-[var(--accent-violet)]">
                      {currentPlacement.nodeLabel}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-left mb-6">
                    {currentPlacement.memoryStory}
                  </p>
                  <Button
                    onClick={nextReviewItem}
                    className="w-full bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] text-white font-semibold"
                  >
                    {currentReviewIndex < palace.placements.length - 1 ? (
                      <>
                        다음 장소
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        복습 완료!
                      </>
                    )}
                  </Button>
                </AnimatedContainer>
              ) : (
                <Button
                  onClick={revealCurrent}
                  size="lg"
                  className="w-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white font-semibold py-5"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  정답 확인
                </Button>
              )}
            </GlassCard>

            <Button
              variant="ghost"
              className="mt-4 w-full text-[var(--muted-foreground)]"
              onClick={() => setMode("view")}
            >
              복습 중단
            </Button>
          </AnimatedContainer>
        </main>
      </>
    );
  }

  // ===== VIEW MODE (Default) =====
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
        <AnimatedContainer>
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {location?.emoji} {palace.unitTitle}
              </h1>
              <p className="text-[var(--muted-foreground)]">
                {location?.name} · {palace.nodeCount}개 개념 · 복습 {palace.reviewCount}회
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={startNarrator}
                variant="outline"
                className="border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                나레이터
              </Button>
              <Button
                onClick={startReview}
                className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                복습
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Mind Map Overview */}
        <AnimatedContainer delay={0.1} className="mb-8">
          <GlassCard className="p-6" hover={false}>
            <div className="text-center mb-4">
              <div className="inline-block px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white font-bold">
                {palace.mindMap.centerNode.label}
              </div>
            </div>

            <StaggerContainer className="space-y-3">
              {palace.placements.map((p, i) => (
                <StaggerItem key={p.nodeId}>
                  <div
                    className="p-4 rounded-lg bg-white/5 cursor-pointer glass-hover"
                    onClick={() => {
                      setMode("narrator");
                      setTimeout(() => narrator.goTo(i), 100);
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm">{p.nodeLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                      <span className="text-sm text-[var(--accent-cyan)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {p.zoneName}
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-[var(--muted-foreground)] ml-auto" />
                    </div>
                    {p.memoryStory && (
                      <p className="text-xs text-[var(--muted-foreground)] ml-9 leading-relaxed line-clamp-2">
                        {p.memoryStory}
                      </p>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </GlassCard>
        </AnimatedContainer>
      </main>
    </>
  );
}
