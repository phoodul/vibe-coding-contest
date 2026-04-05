"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { LOCATIONS, type PalaceLocation } from "@/lib/data/locations";
import { Sparkles, Loader2, MapPin, ArrowRight } from "lucide-react";
import type { MindMap, MindMapNode } from "@/types/mindmap";
import type { Placement } from "@/types/palace";
import type { CurriculumUnit } from "@/lib/data/curriculum";

export default function PalaceCreatePage() {
  const router = useRouter();
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [unit, setUnit] = useState<CurriculumUnit | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<PalaceLocation | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [stories, setStories] = useState<{ nodeId: string; zoneId: string; story: string }[]>([]);
  const [isGeneratingStories, setIsGeneratingStories] = useState(false);
  const [step, setStep] = useState<"location" | "placement" | "stories">("location");

  useEffect(() => {
    const savedMap = sessionStorage.getItem("pendingMindMap");
    const savedUnit = sessionStorage.getItem("pendingUnit");
    if (savedMap && savedUnit) {
      setMindMap(JSON.parse(savedMap));
      setUnit(JSON.parse(savedUnit));
    }
  }, []);

  async function handleSelectLocation(loc: PalaceLocation) {
    setSelectedLocation(loc);
    if (!mindMap) return;

    const nodes = mindMap.childNodes;
    const zones = loc.zones;

    // If more nodes than zones, expand with sub-locations (props)
    if (nodes.length > zones.length) {
      setStep("placement");
      try {
        const res = await fetch("/api/palace/expand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationName: loc.name,
            zones: loc.zones,
            nodeCount: nodes.length,
          }),
        });
        if (res.ok) {
          const { expandedZones } = await res.json();
          // Build expanded placement slots
          const allSlots: { id: string; name: string; parentZone: string }[] = [];
          for (const zone of zones) {
            allSlots.push({ id: zone.id, name: zone.name, parentZone: zone.name });
            const expanded = expandedZones?.find(
              (ez: { parentZoneId: string }) => ez.parentZoneId === zone.id
            );
            if (expanded) {
              for (const sub of expanded.subLocations) {
                allSlots.push({
                  id: `${zone.id}_${sub.id}`,
                  name: `${zone.name} → ${sub.name}`,
                  parentZone: zone.name,
                });
              }
            }
          }
          // Assign nodes to slots
          const autoPlacement: Placement[] = nodes.map((node, i) => ({
            nodeId: node.id,
            nodeLabel: node.label,
            zoneId: allSlots[i % allSlots.length].id,
            zoneName: allSlots[i % allSlots.length].name,
          }));
          setPlacements(autoPlacement);
          return;
        }
      } catch {
        // Fallback to simple round-robin if expansion fails
      }
    }

    // Simple assignment when zones >= nodes
    const autoPlacement: Placement[] = nodes.map((node, i) => ({
      nodeId: node.id,
      nodeLabel: node.label,
      zoneId: zones[i % zones.length].id,
      zoneName: zones[i % zones.length].name,
    }));
    setPlacements(autoPlacement);
    setStep("placement");
  }

  async function handleGenerateStories() {
    if (!selectedLocation || placements.length === 0) return;
    setIsGeneratingStories(true);

    try {
      const res = await fetch("/api/palace/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placements,
          locationName: selectedLocation.name,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate stories");
      const data = await res.json();
      setStories(data);
      setStep("stories");
    } catch (error) {
      console.error("Story generation failed:", error);
    } finally {
      setIsGeneratingStories(false);
    }
  }

  function handleSave() {
    if (!mindMap || !selectedLocation || !unit) return;

    const palace = {
      id: crypto.randomUUID(),
      locationKey: selectedLocation.key,
      unitTitle: unit.unitTitle,
      subject: unit.subject,
      nodeCount: mindMap.childNodes.length,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      mindMap,
      placements: placements.map((p) => {
        const story = stories.find((s) => s.nodeId === p.nodeId);
        return { ...p, memoryStory: story?.story || "" };
      }),
    };

    // Save to localStorage for now
    const existing = JSON.parse(localStorage.getItem("palaces") || "[]");
    existing.push(palace);
    localStorage.setItem("palaces", JSON.stringify(existing));

    // Save full palace data
    localStorage.setItem(`palace_${palace.id}`, JSON.stringify(palace));

    sessionStorage.removeItem("pendingMindMap");
    sessionStorage.removeItem("pendingUnit");

    router.push(`/palace/${palace.id}`);
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
            {unit?.unitTitle} — {mindMap.childNodes.length}개 개념을 장소에 배치합니다
          </p>
        </AnimatedContainer>

        {/* Step 1: Location Selection */}
        {step === "location" && (
          <AnimatedContainer delay={0.1}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--accent-violet)]" />
              장소를 선택하세요
            </h2>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {LOCATIONS.map((loc) => (
                <StaggerItem key={loc.key}>
                  <GlassCard
                    className="p-4 cursor-pointer text-center"
                    onClick={() => handleSelectLocation(loc)}
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

        {/* Step 2: Placement Preview */}
        {step === "placement" && selectedLocation && (
          <AnimatedContainer delay={0}>
            <h2 className="text-lg font-semibold mb-4">
              {selectedLocation.emoji} {selectedLocation.name} — 개념 배치
            </h2>

            <GlassCard className="p-6 mb-6" hover={false}>
              <div className="space-y-3">
                {placements.map((p, i) => (
                  <div
                    key={p.nodeId}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                  >
                    <span className="w-7 h-7 rounded-full bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{p.nodeLabel}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                      <span className="text-sm text-[var(--accent-cyan)]">{p.zoneName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLocation(null);
                  setPlacements([]);
                  setStep("location");
                }}
                className="border-white/10"
              >
                다른 장소 선택
              </Button>
              <Button
                onClick={handleGenerateStories}
                disabled={isGeneratingStories}
                className="flex-1 bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white font-semibold"
              >
                {isGeneratingStories ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    기억 연결 스토리 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    기억 연결 스토리 생성
                  </>
                )}
              </Button>
            </div>
          </AnimatedContainer>
        )}

        {/* Step 3: Stories */}
        {step === "stories" && selectedLocation && (
          <AnimatedContainer delay={0}>
            <h2 className="text-lg font-semibold mb-4">
              {selectedLocation.emoji} 기억 연결 스토리
            </h2>

            <StaggerContainer className="space-y-4 mb-6">
              {placements.map((p) => {
                const story = stories.find((s) => s.nodeId === p.nodeId);
                return (
                  <StaggerItem key={p.nodeId}>
                    <GlassCard className="p-5" hover={false}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] text-xs font-bold">
                          {p.nodeLabel}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] text-xs font-bold">
                          {p.zoneName}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {story?.story || "스토리를 불러오는 중..."}
                      </p>
                    </GlassCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            <Button
              size="lg"
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] text-white font-semibold py-5 rounded-xl"
            >
              궁전 저장하고 복습하기
            </Button>
          </AnimatedContainer>
        )}
      </main>
    </>
  );
}
