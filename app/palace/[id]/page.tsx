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
import { MapPin, RotateCcw, Eye, CheckCircle2, Volume2, ChevronDown, ArrowRight } from "lucide-react";
import type { HierarchicalPlacement, SubPlacement } from "@/types/palace";
import { loadPalace, incrementReview, type FullPalace } from "@/lib/db/palaces";
import { findThinkersInText } from "@/lib/data/thinkers";
import { ThinkerAvatar } from "@/components/shared/thinker-avatar";

export default function PalaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [palace, setPalace] = useState<FullPalace | null>(null);
  const [mode, setMode] = useState<"view" | "review" | "narrator">("view");
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

  // ===== VIEW MODE =====
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
        <AnimatedContainer>
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">{location?.emoji} {palace.unitTitle}</h1>
              <p className="text-[var(--muted-foreground)]">
                {location?.name} · {palace.nodeCount}개 개념 · 복습 {palace.reviewCount}회
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={startNarrator} variant="outline" className="border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]">
                <Volume2 className="w-4 h-4 mr-2" /> 나레이터
              </Button>
              <Button onClick={startReview} className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white">
                <RotateCcw className="w-4 h-4 mr-2" /> 복습
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Hierarchical Palace View */}
        <StaggerContainer className="space-y-4">
          {palace.hierarchicalPlacements?.map((placement) => (
            <StaggerItem key={placement.topicId}>
              <GlassCard className="overflow-hidden" hover={false}>
                <button
                  onClick={() => setExpandedTopic(expandedTopic === placement.topicId ? null : placement.topicId)}
                  className="w-full p-5 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-[var(--accent-cyan)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[var(--accent-cyan)] font-medium">{placement.zoneName}</span>
                    <h3 className="font-semibold">{placement.topicLabel}</h3>
                    <span className="text-xs text-[var(--muted-foreground)]">{placement.subPlacements.length}개 개념</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[var(--muted-foreground)] transition-transform ${expandedTopic === placement.topicId ? "rotate-180" : ""}`} />
                </button>

                {expandedTopic === placement.topicId && (
                  <div className="border-t border-white/5 px-5 py-4 space-y-3">
                    {placement.subPlacements.map((sub, i) => (
                      <div
                        key={sub.conceptId}
                        className="p-4 rounded-lg bg-white/5 cursor-pointer glass-hover"
                        onClick={() => {
                          // Find narrator index for this sub-placement
                          let idx = 0;
                          for (const p of palace.hierarchicalPlacements) {
                            for (const s of p.subPlacements) {
                              if (s.conceptId === sub.conceptId) {
                                setMode("narrator");
                                setTimeout(() => narrator.goTo(idx), 100);
                                return;
                              }
                              idx++;
                            }
                          }
                        }}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-sm font-semibold">{sub.conceptLabel}</span>
                            <span className="text-xs text-[var(--accent-emerald)] ml-2">📍 {sub.position}</span>
                          </div>
                          <Volume2 className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0 mt-1" />
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] ml-7 leading-relaxed line-clamp-2">
                          {sub.story}
                        </p>
                        {(() => {
                          const thinkers = findThinkersInText(sub.story);
                          return thinkers.length > 0 ? (
                            <div className="ml-7 mt-2 flex flex-wrap gap-1.5">
                              {thinkers.map((t) => (
                                <ThinkerAvatar key={t.id} thinker={t} />
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </main>
    </>
  );
}
