"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";

/* ─── Accent colors per feature card ─── */
const featureAccents = [
  "#8b5cf6", // violet - 소크라테스
  "#6366f1", // indigo - 기억의 궁전
  "#06b6d4", // cyan - 영어 단어
  "#f43f5e", // rose - 영어 회화
  "#f59e0b", // amber - 진로
  "#10b981", // emerald - 도서
  "#a78bfa", // light violet - 공문서
  "#38bdf8", // sky - 공문번호
];

const features = [
  {
    title: "소크라테스 AI 튜터",
    description: "답을 주지 않고 질문으로 이끄는 대화형 학습. 스스로 깨닫는 진짜 공부.",
    icon: "🎓",
    href: "/tutor",
    span: "",
  },
  {
    title: "기억의 궁전",
    description: "카툰 공간 기억법으로 교과서 핵심 내용을 장소에 배치하고 나레이터가 읽어줍니다.",
    icon: "🏛️",
    href: "/mind-palace",
    span: "",
  },
  {
    title: "영어 단어 학습",
    description: "18,000 단어를 레벨별로 정복. 에베레스트 정상을 향해 한 걸음씩.",
    icon: "🏔️",
    href: "/vocabulary",
    span: "",
  },
  {
    title: "AI 영어 회화",
    description: "내 레벨에 맞는 AI 원어민과 음성 대화. 실시간 피드백으로 회화 실력 UP.",
    icon: "🎙️",
    href: "/conversation",
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
    description: "학년, 희망 학과, 진로에 맞는 도서를 AI가 선별하여 추천.",
    icon: "📚",
    href: "/books",
    span: "",
  },
  {
    title: "공문서 포맷터",
    description: "HWPX 업로드 → K-에듀파인 공문서 양식 원클릭 교정. 교사의 시간을 돌려드립니다.",
    icon: "📄",
    href: "/teacher/formatter",
    span: "",
  },
  {
    title: "공문번호 자동생성기",
    description: "업로드 → 승인 → 번호 발급 → 해시 기반 위변조 검증까지 원스톱 처리.",
    icon: "🔢",
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

/* ─── Inline SVG logos for "Powered by" section ─── */
function ClaudeLogo() {
  return (
    <svg width="120" height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Claude AI">
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M10 14c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
      <text x="30" y="18" fill="currentColor" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">Claude AI</text>
    </svg>
  );
}

function NextjsLogo() {
  return (
    <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Next.js">
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M11 9v10l8-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="19" y1="9" x2="19" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <text x="30" y="18" fill="currentColor" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">Next.js</text>
    </svg>
  );
}

function SupabaseLogo() {
  return (
    <svg width="115" height="28" viewBox="0 0 115 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Supabase">
      <path d="M15 4l-9 12h8l-1 8 9-12h-8l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <text x="30" y="18" fill="currentColor" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">Supabase</text>
    </svg>
  );
}

function VercelLogo() {
  return (
    <svg width="95" height="28" viewBox="0 0 95 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Vercel">
      <path d="M14 5l10 18H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <text x="30" y="18" fill="currentColor" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">Vercel</text>
    </svg>
  );
}

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
          className="relative min-h-screen flex flex-col items-center justify-center text-center pt-16 overflow-hidden"
        >
          {/* Dot grid background pattern */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Animated gradient orb - large centered glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 40%, rgba(6,182,212,0.08) 70%, transparent 100%)",
                filter: "blur(80px)",
              }}
            />
          </div>

          {/* Secondary orbiting orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 60, -40, 0],
                y: [0, -40, 30, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 100%)",
                filter: "blur(60px)",
              }}
            />
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AI 기반 차세대 교육 플랫폼
            </span>
          </motion.div>

          {/* Kinetic Title */}
          <motion.h1
            style={{ scale: titleScale }}
            className="relative text-4xl sm:text-6xl md:text-8xl font-bold mb-6 leading-[1.1] tracking-tight"
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
            className="relative text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
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
            className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
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

          {/* Floating mockup element - glass UI preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-16 sm:mt-20 w-full max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass-gradient p-1 rounded-2xl"
            >
              <div className="rounded-xl bg-[rgba(10,10,15,0.8)] p-4 sm:p-6">
                {/* Mock top bar */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#f43f5e]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]/60" />
                  <div className="ml-3 h-5 w-48 rounded-md bg-white/5" />
                </div>
                {/* Mock content grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="col-span-2 h-20 sm:h-28 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/5" />
                  <div className="h-20 sm:h-28 rounded-lg bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-white/5" />
                  <div className="h-16 sm:h-20 rounded-lg bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/5" />
                  <div className="col-span-2 h-16 sm:h-20 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/5" />
                </div>
              </div>
            </motion.div>
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
          className="py-20 sm:py-32"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
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
                <p className="text-3xl sm:text-5xl font-bold text-shimmer">
                  {stat.value}
                </p>
                <p className="text-sm sm:text-base text-muted mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── Powered By — Trust Indicators ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="pb-20 sm:pb-28"
        >
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted/60 mb-8">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-white/30">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="transition-colors hover:text-white/50"
            >
              <ClaudeLogo />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="transition-colors hover:text-white/50"
            >
              <NextjsLogo />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="transition-colors hover:text-white/50"
            >
              <SupabaseLogo />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="transition-colors hover:text-white/50"
            >
              <VercelLogo />
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Features — Bento Grid ─── */}
        <motion.section
          id="features"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="pb-20 sm:pb-32"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-5">
              모든 교육을{" "}
              <span className="text-shimmer">하나의 플랫폼</span>에서
            </h2>
            <p className="text-muted text-base sm:text-lg max-w-lg mx-auto">
              학생과 교사 모두를 위한 AI 기반 교육 도구
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} className={f.span}>
                <Link href={f.href}>
                  <GlassCard
                    delay={0}
                    className="h-full cursor-pointer group card-sheen relative overflow-hidden"
                  >
                    {/* Top accent gradient line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${featureAccents[i]}, transparent)`,
                      }}
                    />
                    {/* Icon with glow */}
                    <span className="relative text-5xl mb-5 block transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                      <span
                        className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-xl"
                        style={{ background: featureAccents[i] }}
                      />
                      <span className="relative">{f.icon}</span>
                    </span>
                    <h3
                      className="text-xl font-semibold mb-2 transition-colors duration-300"
                      style={{
                        // Use CSS variable for group-hover color change
                      }}
                    >
                      <span className="group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" style={{ backgroundImage: `linear-gradient(135deg, ${featureAccents[i]}, ${featureAccents[(i + 1) % featureAccents.length]})` }}>
                        {f.title}
                      </span>
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
        <motion.section className="py-20 sm:py-32">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-5xl font-bold text-center mb-20"
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
                <div className="glass-gradient p-8 card-sheen h-full">
                  <span className="text-6xl font-bold text-primary/20 block mb-4">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
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
          className="py-20 sm:py-32 text-center"
        >
          <div className="glass-gradient p-12 sm:p-20 relative overflow-hidden">
            {/* Subtle background glow inside CTA */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <h2 className="relative text-2xl sm:text-5xl font-bold mb-5">
              지금 바로 시작하세요
            </h2>
            <p className="relative text-muted text-base sm:text-lg max-w-md mx-auto mb-10">
              AI와 함께하는 새로운 교육 경험. 무료로 모든 기능을 체험할 수
              있습니다.
            </p>
            <Link
              href="/dashboard"
              className="btn-glow relative inline-block px-10 py-4 rounded-xl bg-primary text-primary-foreground font-medium text-lg transition-all hover:scale-105 active:scale-[0.97]"
            >
              대시보드로 이동
            </Link>
          </div>
        </motion.section>

        {/* Spacer */}
        <div className="h-16" />
      </main>
    </>
  );
}
