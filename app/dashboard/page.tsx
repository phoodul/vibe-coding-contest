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
import { useRole } from "@/hooks/use-role";

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
    description: "3과목 675페이지 교과서를 열람하고 기억의 궁전을 만드세요",
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
  const { role, displayName } = useRole();
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">대시보드</h1>
            {role && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                role === "teacher"
                  ? "bg-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
                  : "bg-[var(--accent-violet)]/20 text-[var(--accent-violet)]"
              }`}>
                {role === "teacher" ? "📝 교사" : "🎓 학생"}
              </span>
            )}
          </div>
          <p className="text-[var(--muted-foreground)] mb-6">
            {displayName ? `${displayName}님, ` : ""}학습하거나 교육 도구를 사용하세요
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

        {/* Subject Progress */}
        {palaces.length > 0 && (
          <AnimatedContainer delay={0.08} className="mb-8">
            <h3 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">과목별 학습 현황</h3>
            <div className="space-y-2">
              {[
                { key: "ethics", label: "⚖️ 생활과 윤리", color: "#8b5cf6" },
                { key: "biology", label: "🧬 생명과학Ⅰ", color: "#06b6d4" },
                { key: "korean", label: "📝 언어와 매체", color: "#10b981" },
                { key: "custom", label: "📄 PDF 업로드", color: "#f59e0b" },
              ].map((subject) => {
                const count = palaces.filter((p) => p.subject === subject.key).length;
                if (count === 0) return null;
                const concepts = palaces.filter((p) => p.subject === subject.key).reduce((s, p) => s + p.nodeCount, 0);
                return (
                  <div key={subject.key} className="flex items-center gap-3">
                    <span className="text-sm w-28 shrink-0">{subject.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, count * 20)}%`, background: subject.color }} />
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)] w-20 text-right">{count}궁전 · {concepts}개념</span>
                  </div>
                );
              }).filter(Boolean)}
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

        {/* Teacher Section — 교사 역할이거나 비로그인(데모)일 때 표시 */}
        {(role === "teacher" || role === null) && (
          <AnimatedContainer delay={0.2}>
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="w-5 h-5 text-[var(--accent-emerald)]" />
              <h2 className="text-xl font-semibold">교사 도구</h2>
              {role === null && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--muted-foreground)]">
                  데모 모드 · 실제 서비스에서는 교원 인증 필요
                </span>
              )}
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
        )}
      </main>
    </>
  );
}
