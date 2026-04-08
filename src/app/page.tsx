"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";

const features = [
  {
    title: "소크라테스 AI 튜터",
    description:
      "답을 주지 않고 질문으로 이끄는 대화형 학습. 스스로 깨닫는 진짜 공부.",
    icon: "🎓",
    href: "/tutor",
    span: "sm:col-span-2",
  },
  {
    title: "AI 영어 회화",
    description:
      "내 레벨에 맞는 AI 원어민과 음성 대화. 실시간 피드백으로 회화 실력 UP.",
    icon: "🎙️",
    href: "/conversation",
    span: "",
  },
  {
    title: "영어 단어 학습",
    description:
      "18,000 단어를 레벨별로 정복. 에베레스트 정상을 향해 한 걸음씩.",
    icon: "🏔️",
    href: "/vocabulary",
    span: "",
  },
  {
    title: "진로 시뮬레이터",
    description: "MBTI, 적성, 흥미 분석 → 5,000+ 직업에서 나만의 진로 발견.",
    icon: "🧭",
    href: "/career",
    span: "",
  },
  {
    title: "맞춤 도서 추천",
    description:
      "학년, 희망 학과, 진로에 맞는 도서를 AI가 선별하여 추천.",
    icon: "📚",
    href: "/books",
    span: "",
  },
  {
    title: "공문서 포맷터",
    description:
      "단축키 한 번으로 K-에듀파인 공문서 양식 자동 교정. 교사의 시간을 돌려드립니다.",
    icon: "📄",
    href: "/teacher/formatter",
    span: "sm:col-span-2",
  },
  {
    title: "공문서 생성기",
    description:
      "전달할 내용만 입력하면 AI가 두문-본문-결문 구조로 공문서를 자동 작성.",
    icon: "📝",
    href: "/teacher/generator",
    span: "",
  },
];

const stats = [
  { value: "18,000+", label: "영어 단어" },
  { value: "5,000+", label: "직업 데이터" },
  { value: "5", label: "교과목 AI 튜터" },
  { value: "100%", label: "무료" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.08]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ─── Hero with Kinetic Typography ─── */}
        <motion.section
          ref={heroRef}
          style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
          className="min-h-screen flex flex-col items-center justify-center text-center pt-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AI 기반 차세대 교육 플랫폼
            </span>
          </motion.div>

          {/* Kinetic Title */}
          <motion.h1
            style={{ scale: titleScale }}
            className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 leading-[1.1] tracking-tight"
          >
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-shimmer block"
            >
              AI가 이끄는
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block"
            >
              차세대 교육
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            학생에게는 소크라테스식 AI 튜터링과 진로 탐색을,
            <br className="hidden sm:block" />
            교사에게는 공문서 업무 자동화를 제공합니다.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="btn-glow px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:scale-105 active:scale-[0.97]"
            >
              무료로 시작하기
            </Link>
            <Link
              href="#features"
              className="px-8 py-3.5 rounded-xl glass text-foreground font-medium hover:bg-card-hover transition-all active:scale-[0.97]"
            >
              기능 살펴보기
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1"
            >
              <div className="w-1 h-2 rounded-full bg-white/40" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ─── Stats Counter ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-16 sm:py-24"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-shimmer">
                  {stat.value}
                </p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── Features — Bento Grid ─── */}
        <motion.section
          id="features"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="pb-16 sm:pb-24"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              모든 교육을{" "}
              <span className="text-shimmer">하나의 플랫폼</span>에서
            </h2>
            <p className="text-muted max-w-lg mx-auto">
              학생과 교사 모두를 위한 AI 기반 교육 도구
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className={f.span}>
                <Link href={f.href}>
                  <GlassCard
                    delay={0}
                    className="h-full cursor-pointer group card-sheen"
                  >
                    <span className="text-4xl mb-4 block transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                      {f.icon}
                    </span>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                      {f.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {f.description}
                    </p>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── How it Works — Cinematic Scroll Reveal ─── */}
        <motion.section className="py-16 sm:py-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl font-bold text-center mb-16"
          >
            <span className="text-shimmer">3단계</span>로 시작하세요
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "회원가입",
                desc: "학생 또는 교사로 간편 가입. 게스트 체험도 가능합니다.",
              },
              {
                step: "02",
                title: "기능 선택",
                desc: "학습, 진로, 영어, 공문서 — 필요한 기능을 선택하세요.",
              },
              {
                step: "03",
                title: "AI와 함께",
                desc: "맞춤형 AI가 즉시 학습을 도와드립니다.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="glass-gradient p-6 card-sheen h-full">
                  <span className="text-5xl font-bold text-primary/20 block mb-3">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── CTA Footer ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="py-16 sm:py-24 text-center"
        >
          <div className="glass-gradient p-10 sm:p-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-muted max-w-md mx-auto mb-8">
              AI와 함께하는 새로운 교육 경험. 무료로 모든 기능을 체험할 수
              있습니다.
            </p>
            <Link
              href="/dashboard"
              className="btn-glow inline-block px-10 py-4 rounded-xl bg-primary text-primary-foreground font-medium text-lg transition-all hover:scale-105 active:scale-[0.97]"
            >
              대시보드로 이동
            </Link>
          </div>
        </motion.section>

        {/* Spacer */}
        <div className="h-12" />
      </main>
    </>
  );
}
