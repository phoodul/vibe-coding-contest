"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { SUBJECTS, getUnitsBySubject, type CurriculumUnit } from "@/lib/data/curriculum";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import type { MindMap } from "@/types/mindmap";

export default function NewPalacePage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<CurriculumUnit | null>(null);
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const units = selectedSubject ? getUnitsBySubject(selectedSubject) : [];

  async function handleGenerate() {
    if (!selectedUnit) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/mindmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedUnit.subject,
          unitTitle: selectedUnit.unitTitle,
          standards: selectedUnit.standards,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate mindmap");

      const data = await res.json();
      setMindMap(data);
    } catch (error) {
      console.error("Mindmap generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleProceedToPalace() {
    if (!mindMap || !selectedUnit) return;
    // Store in sessionStorage for now, will use Supabase later
    sessionStorage.setItem("pendingMindMap", JSON.stringify(mindMap));
    sessionStorage.setItem("pendingUnit", JSON.stringify(selectedUnit));
    router.push("/palace/create");
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
        <AnimatedContainer>
          <h1 className="text-3xl font-bold mb-2">새 기억의 궁전 만들기</h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            과목과 단원을 선택하면 AI가 마인드맵을 생성합니다
          </p>
        </AnimatedContainer>

        {/* Step 1: Subject Selection */}
        <AnimatedContainer delay={0.1} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">1. 과목 선택</h2>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <StaggerItem key={subject.key}>
                <GlassCard
                  className={`p-4 cursor-pointer text-center ${
                    selectedSubject === subject.key
                      ? "ring-2 ring-[var(--accent-violet)] bg-[var(--accent-violet)]/10"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedSubject(subject.key);
                    setSelectedUnit(null);
                    setMindMap(null);
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-2xl mb-2 block">{subject.icon}</span>
                  <span className="font-medium">{subject.label}</span>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedContainer>

        {/* Step 2: Unit Selection */}
        {selectedSubject && (
          <AnimatedContainer delay={0} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">2. 단원 선택</h2>
            <StaggerContainer className="grid grid-cols-1 gap-3">
              {units.map((unit) => (
                <StaggerItem key={unit.unitTitle}>
                  <GlassCard
                    className={`p-4 cursor-pointer ${
                      selectedUnit?.unitTitle === unit.unitTitle
                        ? "ring-2 ring-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedUnit(unit);
                      setMindMap(null);
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="font-medium mb-1">{unit.unitTitle}</h3>
                    <ul className="text-sm text-[var(--muted-foreground)] space-y-0.5">
                      {unit.standards.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </GlassCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedContainer>
        )}

        {/* Step 3: Generate Mindmap */}
        {selectedUnit && !mindMap && (
          <AnimatedContainer delay={0} className="mb-8">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] hover:opacity-90 text-white font-semibold py-6 text-lg rounded-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  마인드맵 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI 마인드맵 생성
                </>
              )}
            </Button>
          </AnimatedContainer>
        )}

        {/* Step 4: Display Mindmap */}
        {mindMap && (
          <AnimatedContainer delay={0} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">3. 생성된 마인드맵</h2>
            <GlassCard className="p-6">
              {/* Center node */}
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white font-bold text-lg">
                  {mindMap.centerNode.label}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-2">
                  {mindMap.centerNode.description}
                </p>
              </div>

              {/* Child nodes (소단원) */}
              <div className="space-y-4">
                {mindMap.childNodes.map((node, i) => (
                  <GlassCard key={node.id} className="p-5" hover={false}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-full bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <h4 className="font-semibold">{node.label}</h4>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3 ml-9">
                      {node.description}
                    </p>
                    {node.subNodes && node.subNodes.length > 0 && (
                      <div className="ml-9 space-y-2">
                        {node.subNodes.map((sub) => (
                          <div key={sub.id} className="p-3 rounded-lg bg-white/5">
                            <span className="text-xs font-semibold text-[var(--accent-cyan)]">
                              {sub.label}
                            </span>
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                              {sub.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>

              {/* Proceed button */}
              <Button
                size="lg"
                onClick={handleProceedToPalace}
                className="w-full mt-6 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] hover:opacity-90 text-white font-semibold py-5 rounded-xl"
              >
                기억의 궁전에 배치하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </GlassCard>
          </AnimatedContainer>
        )}
      </main>
    </>
  );
}
