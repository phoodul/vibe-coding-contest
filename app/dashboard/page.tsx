"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Brain, GraduationCap, BookOpen, FileText, PenTool, Trophy, Layers, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";
import {
  AnimatedContainer,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/animated-container";
import { loadPalaces, type SavedPalace } from "@/lib/db/palaces";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 600;
    const start = performance.now();
    const from = ref.current;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (value - from) * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = value;
    }

    requestAnimationFrame(tick);
  }, [value]);

  return <>{display}</>;
}

const studentFeatures = [
  {
    href: "/textbook",
    icon: BookOpen,
    title: "교과서 열람",
    description: "생활과 윤리 교과서 전체 내용을 확인하고 기억의 궁전을 만드세요",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    href: "/palace/new",
    icon: Brain,
    title: "기억의 궁전 만들기",
    description: "과목과 단원을 선택하면 AI가 마인드맵을 생성합니다",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    href: "/palace",
    icon: GraduationCap,
    title: "내 궁전 목록",
    description: "저장한 기억의 궁전을 복습하세요",
    gradient: "from-cyan-500 to-blue-600",
  },
];

const teacherFeatures = [
  {
    href: "/teacher/feedback",
    icon: PenTool,
    title: "수행평가 피드백",
    description: "AI가 루브릭 기반 피드백 초안을 생성합니다",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    href: "/teacher/record",
    icon: FileText,
    title: "생활기록부 초안",
    description: "학생 활동 데이터를 생기부 문장으로 변환합니다",
    gradient: "from-amber-500 to-orange-600",
  },
];

export default function DashboardPage() {
  const [palaces, setPalaces] = useState<SavedPalace[]>([]);

  useEffect(() => {
    loadPalaces().then(setPalaces);
  }, []);

  const totalConcepts = palaces.reduce((sum, p) => sum + p.nodeCount, 0);
  const totalReviews = palaces.reduce((sum, p) => sum + p.reviewCount, 0);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 px-6 pb-12 max-w-5xl mx-auto">
        <AnimatedContainer>
          <h1 className="text-3xl font-bold mb-2">대시보드</h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            학습하거나 교육 도구를 사용하세요
          </p>
        </AnimatedContainer>

        {/* Stats */}
        {palaces.length > 0 && (
          <AnimatedContainer delay={0.05} className="mb-8">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Trophy, label: "궁전", value: palaces.length, color: "var(--accent-violet)" },
                { icon: Layers, label: "개념", value: totalConcepts, color: "var(--accent-cyan)" },
                { icon: RotateCcw, label: "복습", value: totalReviews, color: "var(--accent-emerald)" },
              ].map((stat) => (
                <GlassCard key={stat.label} className="p-4 text-center" hover={false}>
                  <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
                  <p className="text-2xl font-bold"><AnimatedNumber value={stat.value} /></p>
                  <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </AnimatedContainer>
        )}

        {/* Student Section */}
        <AnimatedContainer delay={0.1} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-[var(--accent-violet)]" />
            <h2 className="text-xl font-semibold">학습</h2>
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentFeatures.map((feature) => (
              <StaggerItem key={feature.href}>
                <Link href={feature.href}>
                  <GlassCard className="p-6 h-full cursor-pointer">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {feature.description}
                    </p>
                  </GlassCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedContainer>

        {/* Teacher Section */}
        <AnimatedContainer delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="w-5 h-5 text-[var(--accent-emerald)]" />
            <h2 className="text-xl font-semibold">교사 도구</h2>
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherFeatures.map((feature) => (
              <StaggerItem key={feature.href}>
                <Link href={feature.href}>
                  <GlassCard className="p-6 h-full cursor-pointer">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {feature.description}
                    </p>
                  </GlassCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedContainer>
      </main>
    </>
  );
}
