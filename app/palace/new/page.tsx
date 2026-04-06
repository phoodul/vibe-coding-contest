"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { MindMapTree } from "@/components/shared/mindmap-tree";
import { Button } from "@/components/ui/button";
import { SUBJECTS, getUnitsBySubject, type CurriculumUnit } from "@/lib/data/curriculum";
import { Sparkles, ArrowRight, Loader2, ChevronRight, Upload, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { MindMap, MindMapNode } from "@/types/mindmap";

export default function NewPalacePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"curriculum" | "pdf">("curriculum");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<CurriculumUnit | null>(null);
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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
      toast.error("마인드맵 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePdfGenerate() {
    if (!pdfFile) return;
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const res = await fetch("/api/mindmap/from-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to generate mindmap from PDF");

      const data = await res.json();
      setMindMap(data);
      // Create synthetic unit for palace flow
      setSelectedUnit({
        subject: "custom",
        unitTitle: data.centerNode.label,
        standards: data.childNodes.map((n: MindMapNode) => n.label),
      });
    } catch (error) {
      console.error("PDF mindmap generation failed:", error);
      toast.error("PDF 분석에 실패했습니다. 다시 시도해주세요.");
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
          <p className="text-[var(--muted-foreground)] mb-6">
            교과서 단원을 선택하거나 PDF를 업로드하세요
          </p>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={mode === "curriculum" ? "default" : "outline"}
              onClick={() => { setMode("curriculum"); setMindMap(null); setPdfFile(null); }}
              className={mode === "curriculum"
                ? "bg-[var(--accent-violet)] text-white"
                : "border-white/10 text-[var(--muted-foreground)]"
              }
            >
              <BookOpen className="w-4 h-4 mr-2" />
              교과서 선택
            </Button>
            <Button
              variant={mode === "pdf" ? "default" : "outline"}
              onClick={() => { setMode("pdf"); setMindMap(null); setSelectedSubject(null); setSelectedUnit(null); }}
              className={mode === "pdf"
                ? "bg-[var(--accent-emerald)] text-white"
                : "border-white/10 text-[var(--muted-foreground)]"
              }
            >
              <Upload className="w-4 h-4 mr-2" />
              PDF 업로드
            </Button>
          </div>
        </AnimatedContainer>

        {/* === PDF Upload Mode === */}
        {mode === "pdf" && !mindMap && (
          <AnimatedContainer delay={0.1} className="mb-8">
            <GlassCard className="p-8" hover={false}>
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center gap-4 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-emerald)]/15 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[var(--accent-emerald)]" />
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-1">
                    {pdfFile ? pdfFile.name : "PDF 파일을 선택하세요"}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    교과서, 학습 자료, 노트 등 어떤 PDF든 가능합니다
                  </p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </label>

              {pdfFile && (
                <Button
                  size="lg"
                  onClick={handlePdfGenerate}
                  disabled={isGenerating}
                  className="w-full mt-6 bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] hover:opacity-90 text-white font-semibold py-6 text-lg rounded-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      PDF 분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      AI로 마인드맵 생성
                    </>
                  )}
                </Button>
              )}
            </GlassCard>
          </AnimatedContainer>
        )}

        {/* === Curriculum Mode === */}
        {/* Step 1: Subject Selection */}
        {mode === "curriculum" && (
          <>
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
          </>
        )}

        {/* Step 4: Display Mindmap */}
        {mindMap && (
          <AnimatedContainer delay={0} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">3. 생성된 마인드맵</h2>

            {/* SVG 시각화 */}
            <GlassCard className="p-6 mb-4">
              <p className="text-sm text-[var(--muted-foreground)] text-center mb-3">
                노드를 클릭하면 상세 내용을 볼 수 있습니다
              </p>
              <MindMapTree
                mindMap={mindMap}
                onNodeClick={(node) => setSelectedNode(
                  selectedNode?.id === node.id ? null : node
                )}
              />
            </GlassCard>

            {/* 선택된 노드 상세 패널 */}
            <AnimatePresence mode="wait">
              {selectedNode && (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                >
                  <GlassCard className="p-5 ring-1 ring-[var(--accent-violet)]/30">
                    <h3 className="font-semibold text-lg mb-1">{selectedNode.label}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mb-4">
                      {selectedNode.description}
                    </p>
                    {selectedNode.subNodes && selectedNode.subNodes.length > 0 && (
                      <div className="space-y-2">
                        {selectedNode.subNodes.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-start gap-2 p-3 rounded-lg bg-white/5"
                          >
                            <ChevronRight className="w-4 h-4 mt-0.5 text-[var(--accent-cyan)] shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-[var(--accent-cyan)]">
                                {sub.label}
                              </span>
                              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                {sub.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proceed button */}
            <Button
              size="lg"
              onClick={handleProceedToPalace}
              className="w-full bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)] hover:opacity-90 text-white font-semibold py-5 rounded-xl"
            >
              기억의 궁전에 배치하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </AnimatedContainer>
        )}
      </main>
    </>
  );
}
