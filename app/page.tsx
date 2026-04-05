"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  MapPin,
  RotateCcw,
  PenTool,
  FileText,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/animated-container";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Sparkles,
    title: "AI 마인드맵 생성",
    description: "교과서 단원을 선택하면 AI가 핵심 개념의 마인드맵을 자동 생성합니다",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: MapPin,
    title: "기억의 궁전 배치",
    description: "경복궁, 한옥마을 등 실제 장소에 개념을 배치하고 기억 스토리를 만듭니다",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: RotateCcw,
    title: "인터랙티브 복습",
    description: "장소를 걸어다니며 배치된 개념을 떠올리는 능동적 복습 시스템",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: PenTool,
    title: "수행평가 피드백",
    description: "교사가 루브릭을 입력하면 AI가 소크라틱 방식의 피드백을 생성합니다",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: FileText,
    title: "생기부 초안 작성",
    description: "학생 활동 데이터를 입력하면 생활기록부 서술형 문장을 AI가 작성합니다",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: GraduationCap,
    title: "교육과정 기반",
    description: "2022 개정 교육과정 성취기준에 맞춘 정확한 학습 내용을 제공합니다",
    gradient: "from-indigo-500 to-violet-600",
  },
];

const steps = [
  { num: "01", title: "단원 선택", desc: "과목과 단원을 고르세요" },
  { num: "02", title: "마인드맵 생성", desc: "AI가 핵심 개념을 추출합니다" },
  { num: "03", title: "궁전 배치", desc: "장소에 개념을 배치하고 기억하세요" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-[var(--muted-foreground)] mb-8"
          >
            <Brain className="w-4 h-4 text-[var(--accent-violet)]" />
            AI 기억의 궁전 학습 플랫폼
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
          >
            교과서를{" "}
            <span className="bg-gradient-to-r from-[var(--accent-violet)] via-[var(--accent-cyan)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
              마인드맵
            </span>
            으로 펼치고
            <br />
            기억의 궁전에{" "}
            <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
              저장하라
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto"
          >
            2,500년 역사의 가장 강력한 기억법을 AI가 디지털로 구현합니다.
            학생은 기억의 궁전으로 학습하고, 교사는 AI로 평가합니다.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white font-semibold text-lg glass-hover"
            >
              시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass glass-hover font-semibold text-lg"
            >
              더 알아보기
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center mb-16"
          >
            3단계로 시작하세요
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <GlassCard className="p-6 text-center h-full" hover={false}>
                  <span className="text-4xl font-bold bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] bg-clip-text text-transparent">
                    {step.num}
                  </span>
                  <h3 className="text-lg font-semibold mt-3 mb-1">{step.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{step.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center mb-4"
          >
            핵심 기능
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-[var(--muted-foreground)] mb-16"
          >
            학생과 교사 모두를 위한 AI 교육 도구
          </motion.p>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <GlassCard className="p-6 h-full">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-12" hover={false}>
              <Brain className="w-12 h-12 mx-auto mb-6 text-[var(--accent-violet)]" />
              <h2 className="text-3xl font-bold mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-[var(--muted-foreground)] mb-8">
                AI와 함께 기억의 궁전을 만들고, 더 효과적으로 학습하세요
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white font-semibold text-lg glass-hover"
              >
                무료로 시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[var(--accent-violet)]" />
            MindPalace
          </div>
          <span>바이브코딩 2026</span>
        </div>
      </footer>
    </main>
  );
}
