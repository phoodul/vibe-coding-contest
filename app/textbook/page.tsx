"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { ETHICS_TEXTBOOK, getEthicsStats } from "@/lib/data/textbooks/ethics";
import { Brain, BookOpen, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import type { TextbookChapter, TextbookSection, TextbookContent } from "@/lib/data/textbooks/ethics-index";

export default function TextbookPage() {
  const router = useRouter();
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const stats = getEthicsStats();

  function handleCreatePalace(section: TextbookSection, chapter: TextbookChapter) {
    // Store section data for palace creation
    const mindMap = {
      centerNode: {
        id: "center",
        label: section.title,
        description: section.summary,
      },
      childNodes: section.contents.map((c) => ({
        id: c.id,
        label: c.label,
        description: c.detail.substring(0, 100) + "...",
        subNodes: [{
          id: `${c.id}_detail`,
          label: c.label,
          detail: c.detail,
        }],
      })),
    };

    const unit = {
      subject: "ethics",
      unitTitle: `${chapter.title} — ${section.title}`,
      standards: section.contents.map((c) => c.label),
    };

    sessionStorage.setItem("pendingMindMap", JSON.stringify(mindMap));
    sessionStorage.setItem("pendingUnit", JSON.stringify(unit));
    router.push("/palace/create");
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
        <AnimatedContainer>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-[var(--accent-violet)]" />
            <h1 className="text-3xl font-bold">{ETHICS_TEXTBOOK.title}</h1>
          </div>
          <p className="text-[var(--muted-foreground)] mb-2">
            {ETHICS_TEXTBOOK.subject} — 교과서 수준 시험 대비 콘텐츠
          </p>
          <div className="flex gap-4 text-xs text-[var(--muted-foreground)] mb-8">
            <span>{stats.chapters}개 단원</span>
            <span>·</span>
            <span>{stats.sections}개 중단원</span>
            <span>·</span>
            <span>{stats.contents}개 핵심 개념</span>
            <span>·</span>
            <span>약 {stats.estimatedPages}페이지</span>
          </div>
        </AnimatedContainer>

        {/* Chapters */}
        <StaggerContainer className="space-y-3">
          {ETHICS_TEXTBOOK.chapters.map((chapter) => (
            <StaggerItem key={chapter.id}>
              <GlassCard className="overflow-hidden" hover={false}>
                {/* Chapter header */}
                <button
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === chapter.id ? null : chapter.id
                    )
                  }
                  className="w-full p-5 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-cyan)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {chapter.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold">{chapter.title}</h2>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                      {chapter.overview}
                    </p>
                  </div>
                  {expandedChapter === chapter.id ? (
                    <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                  )}
                </button>

                {/* Sections */}
                {expandedChapter === chapter.id && (
                  <div className="border-t border-white/5">
                    {chapter.sections.map((section) => (
                      <div key={section.id}>
                        <button
                          onClick={() =>
                            setExpandedSection(
                              expandedSection === section.id ? null : section.id
                            )
                          }
                          className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors border-b border-white/5"
                        >
                          {expandedSection === section.id ? (
                            <ChevronDown className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium">{section.title}</h3>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {section.contents.length}개 개념
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreatePalace(section, chapter);
                            }}
                            className="text-xs text-[var(--accent-violet)] hover:text-white shrink-0"
                          >
                            <Brain className="w-3.5 h-3.5 mr-1" />
                            궁전 만들기
                          </Button>
                        </button>

                        {/* Contents */}
                        {expandedSection === section.id && (
                          <div className="px-5 py-3 space-y-3 bg-white/[0.02]">
                            {section.contents.map((content) => (
                              <div
                                key={content.id}
                                className="p-4 rounded-lg bg-white/5"
                              >
                                <h4 className="text-sm font-semibold text-[var(--accent-cyan)] mb-2">
                                  {content.label}
                                </h4>
                                <p className="text-xs text-[var(--foreground)]/80 leading-relaxed whitespace-pre-line">
                                  {content.detail}
                                </p>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              onClick={() => handleCreatePalace(section, chapter)}
                              className="w-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white text-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1" />
                              이 단원으로 기억의 궁전 만들기
                            </Button>
                          </div>
                        )}
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
