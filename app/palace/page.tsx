"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { Plus, Brain, RotateCcw } from "lucide-react";
import { LOCATIONS } from "@/lib/data/locations";

interface SavedPalace {
  id: string;
  locationKey: string;
  unitTitle: string;
  subject: string;
  nodeCount: number;
  reviewCount: number;
  createdAt: string;
}

export default function PalaceListPage() {
  const [palaces, setPalaces] = useState<SavedPalace[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("palaces");
    if (saved) {
      setPalaces(JSON.parse(saved));
    }
  }, []);

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
            {palaces.map((palace) => {
              const location = LOCATIONS.find((l) => l.key === palace.locationKey);
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
                          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--muted-foreground)]">
                            <RotateCcw className="w-3 h-3" />
                            복습 {palace.reviewCount}회
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
