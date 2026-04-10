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
  "#eab308", // yellow - 내 길 내비
  "#10b981", // emerald - 도서
  "#ef4444", // red - PAPS
  "#14b8a6", // teal - 현장실습
  "#a855f7", // purple - 음악 감상문
  "#a78bfa", // light violet - 공문서 포맷터
  "#38bdf8", // sky - 공문서 초안
  "#f97316", // orange - 생기부 세특
];

const studentFeatures = [
  {
    title: "소크라테스 AI 튜터",
    description: "답을 주지 않고 질문으로 이끄는 대화형 학습. 스스로 깨닫는 진짜 공부.",
    icon: "🎓",
    href: "/tutor",
  },
  {
    title: "기억의 궁전",
    description: "카툰 공간 기억법으로 교과서 핵심 내용을 장소에 배치하고 나레이터가 읽어줍니다.",
    icon: "🏛️",
    href: "/mind-palace",
  },
  {
    title: "영어 단어 학습",
    description: "18,000 단어를 레벨별로 정복. 에베레스트 정상을 향해 한 걸음씩.",
    icon: "🏔️",
    href: "/vocabulary",
  },
  {
    title: "AI 영어 회화",
    description: "내 레벨에 맞는 AI 원어민과 음성 대화. 실시간 피드백으로 회화 실력 UP.",
    icon: "🎙️",
    href: "/conversation",
  },
  {
    title: "진로 시뮬레이터",
    description: "MBTI, 적성, 흥미 분석 → 5,000+ 직업에서 나만의 진로 발견.",
    icon: "🧭",
    href: "/career",
  },
  {
    title: "내 길 내비",
    description: "꿈이 있으면 길이 있다. 미용, 조리, 체육, 음악 등 어떤 꿈이든 AI가 로드맵과 학교를 안내.",
    icon: "🌟",
    href: "/pathfinder",
  },
  {
    title: "맞춤 도서 추천",
    description: "학년, 희망 학과, 진로에 맞는 도서를 AI가 선별하여 추천.",
    icon: "📚",
    href: "/books",
  },
  {
    title: "PAPS AI 코치",
    description: "체력평가 결과 입력 → 등급 분석, 취약 종목 개선 운동 프로그램 제공.",
    icon: "💪",
    href: "/paps",
  },
  {
    title: "현장실습 일지 도우미",
    description: "오늘 한 일을 메모하면 제출용 실습 일지로 자동 정리. 특성화고·마이스터고 필수.",
    icon: "📋",
    href: "/internship",
  },
  {
    title: "음악 감상문 코치",
    description: "곡 정보와 느낌만 입력하면 음악 용어를 활용한 감상문 초안과 표현 팁 제공.",
    icon: "🎵",
    href: "/music-review",
  },
];

const teacherFeatures = [
  {
    title: "공문서 포맷터",
    description: "HWP/HWPX 업로드 → K-에듀파인 공문서 양식 원클릭 교정. 교사의 시간을 돌려드립니다.",
    icon: "📄",
    href: "/teacher/formatter",
  },
  {
    title: "공문서 초안 작성기",
    description: "주제만 입력하면 K-에듀파인 양식에 맞는 공문서 초안을 AI가 즉시 생성합니다.",
    icon: "✍️",
    href: "/teacher/generator",
  },
  {
    title: "생기부 세특 도우미",
    description: "NEIS 바이트 실시간 계산, 금지어 자동 감지, 학생별 유사도 분석. AI가 못하는 것을 해결합니다.",
    icon: "📝",
    href: "/teacher/record",
  },
];

const stats = [
  { value: "18,000+", label: "영어 단어" },
  { value: "5,000+", label: "직업 데이터" },
  { value: "13", label: "AI 기반 도구" },
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
              학생과 교사를 위한 AI 교육 플랫폼
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
              교육에 편안함을,
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
              배움에 즐거움을
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
            교사에게는 공문서 자동화와 생기부 작성 도우미를 제공합니다.
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

          {/* 학생용 */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <span className="text-xs uppercase tracking-[0.15em] text-muted/60 shrink-0">학생용</span>
            <div className="flex-1 h-px bg-white/5" />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {studentFeatures.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Link href={f.href}>
                  <GlassCard
                    delay={0}
                    className="h-full cursor-pointer group card-sheen relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${featureAccents[i]}, transparent)`,
                      }}
                    />
                    <span className="relative text-5xl mb-5 block transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                      <span
                        className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-xl"
                        style={{ background: featureAccents[i] }}
                      />
                      <span className="relative">{f.icon}</span>
                    </span>
                    <h3 className="text-xl font-semibold mb-2 transition-colors duration-300">
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

          {/* 교사용 */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <span className="text-xs uppercase tracking-[0.15em] text-muted/60 shrink-0">교사용</span>
            <div className="flex-1 h-px bg-white/5" />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {teacherFeatures.map((f, i) => {
              const ai = i + studentFeatures.length;
              return (
                <motion.div key={f.title} variants={fadeUp}>
                  <Link href={f.href}>
                    <GlassCard
                      delay={0}
                      className="h-full cursor-pointer group card-sheen relative overflow-hidden"
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${featureAccents[ai]}, transparent)`,
                        }}
                      />
                      <span className="relative text-5xl mb-5 block transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                        <span
                          className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-xl"
                          style={{ background: featureAccents[ai] }}
                        />
                        <span className="relative">{f.icon}</span>
                      </span>
                      <h3 className="text-xl font-semibold mb-2 transition-colors duration-300">
                        <span className="group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" style={{ backgroundImage: `linear-gradient(135deg, ${featureAccents[ai]}, ${featureAccents[(ai + 1) % featureAccents.length]})` }}>
                          {f.title}
                        </span>
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {f.description}
                      </p>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── CTA Footer — Split Student / Teacher ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="py-20 sm:py-32"
        >
          <h2 className="text-2xl sm:text-5xl font-bold text-center mb-12">
            지금 바로 시작하세요
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 학생 CTA */}
            <div className="glass-gradient p-8 sm:p-12 relative overflow-hidden text-center">
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)" }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
                  filter: "blur(60px)",
                }}
              />
              <span className="relative text-5xl block mb-5">🎓</span>
              <h3 className="relative text-xl sm:text-2xl font-bold mb-3">학생이신가요?</h3>
              <p className="relative text-muted text-sm sm:text-base mb-8 max-w-sm mx-auto">
                소크라테스 AI 튜터, 기억의 궁전, 영어 회화까지 — 공부가 즐거워집니다.
              </p>
              <Link
                href="/signup"
                className="btn-glow relative inline-block px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:scale-105 active:scale-[0.97]"
              >
                무료로 시작하기
              </Link>
            </div>

            {/* 교사 CTA */}
            <div className="glass-gradient p-8 sm:p-12 relative overflow-hidden text-center">
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #f97316, transparent)" }}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
                  filter: "blur(60px)",
                }}
              />
              <span className="relative text-5xl block mb-5">📝</span>
              <h3 className="relative text-xl sm:text-2xl font-bold mb-3">교사이신가요?</h3>
              <p className="relative text-muted text-sm sm:text-base mb-8 max-w-sm mx-auto">
                공문서 자동 교정, 세특 바이트 계산, 금지어 감지 — 업무 시간을 돌려드립니다.
              </p>
              <Link
                href="/signup"
                className="btn-glow relative inline-block px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:scale-105 active:scale-[0.97]"
              >
                교사로 시작하기
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Spacer */}
        <div className="h-16" />
      </main>
    </>
  );
}
