"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Search, ChevronDown, ChevronRight, Volume2, ArrowRight } from "lucide-react";
import type { VillageLocation, VillageZone, EnglishWord } from "@/lib/data/english/types";
import { LEVEL_LABELS } from "@/lib/data/english/types";

export default function EnglishVillagePage() {
  const [locations, setLocations] = useState<VillageLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  // 동적 로드
  useEffect(() => {
    Promise.all([
      import("@/lib/data/english/village-home-school").then((m) => [m.HOME_LOCATION, m.SCHOOL_LOCATION]),
      import("@/lib/data/english/village-services").then((m) => [m.HOSPITAL_LOCATION, m.RESTAURANT_LOCATION, m.SHOPPING_MALL_LOCATION]),
      import("@/lib/data/english/village-world").then((m) => [m.TRANSPORTATION_LOCATION, m.CITY_LOCATION, m.NATURE_LOCATION]),
      import("@/lib/data/english/village-daily-entertainment").then((m) => [m.DAILY_LIFE_LOCATION, m.ENTERTAINMENT_LOCATION]),
      import("@/lib/data/english/village-academic").then((m) => [m.MEDIA_SOCIETY_LOCATION, m.SCIENCE_TECH_LOCATION, m.ACADEMIC_LOCATION]),
    ]).then((results) => {
      setLocations(results.flat());
      setIsLoading(false);
    });
  }, []);

  // 통계
  const totalWords = useMemo(() => {
    return locations.reduce((sum, loc) => sum + loc.zones.reduce((zs, z) => zs + z.words.length, 0), 0);
  }, [locations]);

  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    locations.forEach((loc) => loc.zones.forEach((z) => z.words.forEach((w) => {
      counts[w.level] = (counts[w.level] || 0) + 1;
    })));
    return counts;
  }, [locations]);

  // 현재 장소/구역
  const currentLocation = locations.find((l) => l.id === selectedLocation);
  const currentZone = currentLocation?.zones.find((z) => z.id === selectedZone);

  // 필터링된 단어
  const filteredWords = useMemo(() => {
    if (!currentZone) return [];
    let words = currentZone.words;
    if (selectedLevel) words = words.filter((w) => w.level === selectedLevel);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      words = words.filter((w) => w.word.toLowerCase().includes(q) || w.meaning.includes(q));
    }
    return words;
  }, [currentZone, selectedLevel, searchQuery]);

  // TTS
  function speak(word: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-5xl mx-auto">
        <AnimatedContainer>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-[var(--accent-cyan)]" />
            <h1 className="text-3xl font-bold">English Village</h1>
          </div>
          <p className="text-[var(--muted-foreground)] mb-6">
            가상의 영어 마을을 걸으며 단어를 익히세요 · {isLoading ? "로딩 중..." : `${totalWords.toLocaleString()}단어 · 7단계`}
          </p>
        </AnimatedContainer>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : !selectedLocation ? (
          /* === 장소 선택 === */
          <>
            {/* 난이도 분포 */}
            <AnimatedContainer delay={0.05} className="mb-6">
              <div className="flex flex-wrap gap-2">
                {Object.entries(LEVEL_LABELS).map(([lv, info]) => (
                  <span key={lv} className="text-xs px-2.5 py-1 rounded-full border border-white/10" style={{ color: info.color }}>
                    {info.label}: {levelCounts[Number(lv)] || 0}단어
                  </span>
                ))}
              </div>
            </AnimatedContainer>

            {/* 장소 카드 */}
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => {
                const wordCount = loc.zones.reduce((s, z) => s + z.words.length, 0);
                return (
                  <StaggerItem key={loc.id}>
                    <GlassCard
                      className="p-0 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedLocation(loc.id)}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="h-20 flex items-center justify-center opacity-60" style={{ background: loc.gradient }}>
                        <span className="text-4xl drop-shadow-lg">{loc.emoji}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{loc.emoji} {loc.name}</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">{loc.nameKo}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {loc.zones.length}개 구역 · {wordCount}단어
                        </p>
                      </div>
                    </GlassCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </>
        ) : !selectedZone ? (
          /* === 구역 선택 === */
          <AnimatedContainer>
            <Button variant="ghost" onClick={() => setSelectedLocation(null)} className="mb-4 text-[var(--muted-foreground)]">
              ← 장소 목록으로
            </Button>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{currentLocation?.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold">{currentLocation?.name}</h2>
                <p className="text-[var(--muted-foreground)]">{currentLocation?.nameKo} — {currentLocation?.description}</p>
              </div>
            </div>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentLocation?.zones.map((zone) => (
                <StaggerItem key={zone.id}>
                  <GlassCard
                    className="p-5 cursor-pointer"
                    onClick={() => { setSelectedZone(zone.id); setSelectedLevel(null); setSearchQuery(""); }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{zone.emoji}</span>
                      <h3 className="font-semibold">{zone.name}</h3>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">{zone.nameKo} · {zone.words.length}단어</p>
                  </GlassCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedContainer>
        ) : (
          /* === 단어 목록 === */
          <AnimatedContainer>
            <Button variant="ghost" onClick={() => { setSelectedZone(null); setExpandedWord(null); }} className="mb-4 text-[var(--muted-foreground)]">
              ← {currentLocation?.name}
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{currentZone?.emoji}</span>
              <div>
                <h2 className="text-xl font-bold">{currentZone?.name}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">{currentZone?.nameKo}</p>
              </div>
            </div>

            {/* 필터 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="단어 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setSelectedLevel(null)}
                  className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${!selectedLevel ? "bg-white/20 text-white" : "bg-white/5 text-[var(--muted-foreground)]"}`}
                >
                  전체
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setSelectedLevel(selectedLevel === lv ? null : lv)}
                    className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${selectedLevel === lv ? "text-white" : "text-[var(--muted-foreground)]"}`}
                    style={selectedLevel === lv ? { background: LEVEL_LABELS[lv].color + "40" } : { background: "rgba(255,255,255,0.05)" }}
                  >
                    Lv.{lv}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-[var(--muted-foreground)] mb-3">{filteredWords.length}단어</p>

            {/* 단어 카드 목록 */}
            <div className="space-y-2">
              {filteredWords.map((word) => {
                const isExpanded = expandedWord === word.word;
                const levelInfo = LEVEL_LABELS[word.level];
                return (
                  <GlassCard
                    key={word.word}
                    className="p-0 overflow-hidden cursor-pointer"
                    hover={false}
                    onClick={() => setExpandedWord(isExpanded ? null : word.word)}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* 난이도 바 */}
                      <div className="w-1 h-8 rounded-full" style={{ background: levelInfo.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{word.word}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">{word.pronunciation}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]">{word.pos}</span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">{word.meaning}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(word.word); }}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-[var(--accent-cyan)]" />
                      </button>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" /> : <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />}
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 border-t border-white/5 pt-2">
                        <p className="text-sm italic text-[var(--accent-cyan)]">&ldquo;{word.example}&rdquo;</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{word.exampleKo}</p>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </AnimatedContainer>
        )}
      </main>
    </>
  );
}
