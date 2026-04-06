"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { Plus, Brain, RotateCcw, Clock, AlertCircle } from "lucide-react";
import { LOCATIONS } from "@/lib/data/locations";
import { getReviewUrgency, formatTimeUntilReview } from "@/lib/data/spaced-repetition";
import { loadPalaces, type SavedPalace } from "@/lib/db/palaces";

const urgencyStyles = {
  overdue: { bg: "bg-red-500/20", text: "text-red-400", label: "복습 필요!" },
  due: { bg: "bg-amber-500/20", text: "text-amber-400", label: "복습 시간" },
  upcoming: { bg: "bg-blue-500/10", text: "text-blue-400", label: "" },
  done: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "복습 완료" },
};

export default function PalaceListPage() {
  const [palaces, setPalaces] = useState<SavedPalace[]>([]);

  useEffect(() => {
    loadPalaces().then(setPalaces);
  }, []);

  // Sort: overdue/due first
  const sortedPalaces = [...palaces].sort((a, b) => {
    const urgencyOrder = { overdue: 0, due: 1, upcoming: 2, done: 3 };
    const uA = urgencyOrder[getReviewUrgency(a.createdAt, a.reviewCount)];
    const uB = urgencyOrder[getReviewUrgency(b.createdAt, b.reviewCount)];
    return uA - uB;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-4xl mx-auto">
        <AnimatedContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">내 기억의 궁전</h1>
              <p className="text-[var(--muted-foreground)]">
                저장한 기억의 궁전을 복습하세요
              </p>
            </div>
            <Link href="/palace/new">
              <Button className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white">
                <Plus className="w-4 h-4 mr-2" />
                새로 만들기
              </Button>
            </Link>
          </div>
        </AnimatedContainer>

        {palaces.length === 0 ? (
          <AnimatedContainer delay={0.1}>
            <GlassCard className="p-12 text-center" hover={false}>
              <Brain className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-semibold mb-2">
                아직 만든 궁전이 없어요
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">
                교과서 단원을 선택하고 기억의 궁전을 만들어보세요
              </p>
              <Link href="/palace/new">
                <Button className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  첫 궁전 만들기
                </Button>
              </Link>
            </GlassCard>
          </AnimatedContainer>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPalaces.map((palace) => {
              const location = LOCATIONS.find((l) => l.key === palace.locationKey);
              const urgency = getReviewUrgency(palace.createdAt, palace.reviewCount);
              const timeUntil = formatTimeUntilReview(palace.createdAt, palace.reviewCount);
              const style = urgencyStyles[urgency];

              return (
                <StaggerItem key={palace.id}>
                  <Link href={`/palace/${palace.id}`}>
                    <GlassCard className="p-5 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{location?.emoji || "🏛️"}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {palace.unitTitle}
                          </h3>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {location?.name} · {palace.nodeCount}개 개념
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                              <RotateCcw className="w-3 h-3" />
                              복습 {palace.reviewCount}회
                            </span>
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                              {urgency === "overdue" || urgency === "due" ? (
                                <AlertCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {style.label || timeUntil}
                            </span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </main>
    </>
  );
}
