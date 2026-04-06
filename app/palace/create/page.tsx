"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { LOCATIONS, type PalaceLocation } from "@/lib/data/locations";
import { Sparkles, Loader2, MapPin, ArrowRight, ChevronDown } from "lucide-react";
import type { MindMap } from "@/types/mindmap";
import type { HierarchicalPlacement } from "@/types/palace";
import type { CurriculumUnit } from "@/lib/data/curriculum";
import { savePalace } from "@/lib/db/palaces";

export default function PalaceCreatePage() {
  const router = useRouter();
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [unit, setUnit] = useState<CurriculumUnit | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<PalaceLocation | null>(null);
  const [hierarchicalPlacements, setHierarchicalPlacements] = useState<HierarchicalPlacement[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"location" | "generating" | "result">("location");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    const savedMap = sessionStorage.getItem("pendingMindMap");
    const savedUnit = sessionStorage.getItem("pendingUnit");
    if (savedMap && savedUnit) {
      setMindMap(JSON.parse(savedMap));
      setUnit(JSON.parse(savedUnit));
    }
  }, []);

  async function handleSelectAndGenerate(loc: PalaceLocation) {
    if (!mindMap) return;
    setSelectedLocation(loc);
    setStep("generating");
    setIsGenerating(true);

    try {
      // Send topics with their sub-nodes for hierarchical placement
      const topics = mindMap.childNodes.map((node) => ({
        id: node.id,
        label: node.label,
        description: node.description,
        subNodes: node.subNodes || [],
      }));

      const res = await fetch("/api/palace/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics,
          locationName: loc.name,
          zones: loc.zones.map((z) => ({
            id: z.id,
            name: z.name,
            description: z.description,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to generate placements");
      const data: HierarchicalPlacement[] = await res.json();
      setHierarchicalPlacements(data);
      setStep("result");
    } catch (error) {
      console.error("Palace generation failed:", error);
      setStep("location");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!mindMap || !selectedLocation || !unit) return;

    try {
      const id = await savePalace({
        locationKey: selectedLocation.key,
        unitTitle: unit.unitTitle,
        subject: unit.subject,
        mindMap,
        hierarchicalPlacements,
      });

      sessionStorage.removeItem("pendingMindMap");
      sessionStorage.removeItem("pendingUnit");

      router.push(`/palace/${id}`);
    } catch (error) {
      console.error("Failed to save palace:", error);
    }
  }

  if (!mindMap) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto text-center">
          <p className="text-[var(--muted-foreground)]">마인드맵 데이터를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/palace/new")} className="mt-4">
            새 마인드맵 만들기
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-5xl mx-auto">
        <AnimatedContainer>
          <h1 className="text-3xl font-bold mb-2">기억의 궁전 만들기</h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            {unit?.unitTitle} — {mindMap.childNodes.length}개 대주제, 각 하위 개념을 구역 내 구체적 위치에 배치합니다
          </p>
        </AnimatedContainer>

        {/* Step 1: Location Selection */}
        {step === "location" && (
          <AnimatedContainer delay={0.1}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--accent-violet)]" />
              장소를 선택하면 AI가 계층적 배치를 자동 생성합니다
            </h2>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {LOCATIONS.map((loc) => (
                <StaggerItem key={loc.key}>
                  <GlassCard
                    className="p-4 cursor-pointer text-center"
                    onClick={() => handleSelectAndGenerate(loc)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-3xl block mb-2">{loc.emoji}</span>
                    <h3 className="font-medium text-sm">{loc.name}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {loc.zones.length}개 구역
                    </p>
                  </GlassCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedContainer>
        )}

        {/* Step 2: Generating */}
        {step === "generating" && (
          <AnimatedContainer delay={0}>
            <GlassCard className="p-12 text-center" hover={false}>
              <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-[var(--accent-violet)]" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedLocation?.emoji} {selectedLocation?.name}에 배치 중...
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                AI가 각 하위 개념을 구역 내 구체적 위치에 배치하고 기억 스토리를 생성하고 있습니다
              </p>
            </GlassCard>
          </AnimatedContainer>
        )}

        {/* Step 3: Result — Hierarchical Placements */}
        {step === "result" && selectedLocation && (
          <AnimatedContainer delay={0}>
            <h2 className="text-lg font-semibold mb-4">
              {selectedLocation.emoji} {selectedLocation.name} — 계층적 배치 완료
            </h2>

            <StaggerContainer className="space-y-4 mb-6">
              {hierarchicalPlacements.map((placement) => (
                <StaggerItem key={placement.topicId}>
                  <GlassCard className="overflow-hidden" hover={false}>
                    {/* Topic header (zone level) */}
                    <button
                      onClick={() =>
                        setExpandedTopic(
                          expandedTopic === placement.topicId ? null : placement.topicId
                        )
                      }
                      className="w-full p-5 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-[var(--accent-cyan)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[var(--accent-cyan)]">
                            {placement.zoneName}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[var(--muted-foreground)]" />
                          <span className="font-semibold text-sm">{placement.topicLabel}</span>
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {placement.subPlacements.length}개 하위 개념 배치됨
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[var(--muted-foreground)] transition-transform ${
                          expandedTopic === placement.topicId ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Sub-placements (within zone) */}
                    {expandedTopic === placement.topicId && (
                      <div className="border-t border-white/5 px-5 py-4 space-y-3">
                        {placement.subPlacements.map((sub, i) => (
                          <div key={sub.conceptId} className="p-4 rounded-lg bg-white/5">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="w-5 h-5 rounded-full bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <div>
                                <span className="text-sm font-semibold">{sub.conceptLabel}</span>
                                <span className="text-xs text-[var(--accent-emerald)] ml-2">
                                  📍 {sub.position}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-[var(--foreground)]/80 leading-relaxed ml-7">
                              {sub.story}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLocation(null);
                  setHierarchicalPlacements([]);
                  setStep("location");
                }}
                className="border-white/10"
              >
                다른 장소 선택
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] text-white font-semibold"
              >
                궁전 저장하고 복습하기
              </Button>
            </div>
          </AnimatedContainer>
        )}
      </main>
    </>
  );
}
