"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";

/* ─── Accent colors per feature card ─── */
const featureAccents = [
  "#8b5cf6", // violet - 소크라테스
  "#6366f1", // indigo - 마인드 맵
  "#06b6d4", // cyan - 영어 단어
  "#f43f5e", // rose - 영어 회화
  "#22d3ee", // cyan-400 - 영문법 듣기
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
    title: "오일러 튜터",
    description: "계산은 AI가 할게요. 수학 문제의 논리적 사고과정을 따뜻한 멘토와 함께 훈련합니다.",
    icon: "euler",
    href: "/euler-tutor",
  },
  {
    title: "마인드 맵",
    description: "교과서 전체 구조를 인터랙티브 마인드 맵으로 탐색하며 핵심 내용을 한눈에 파악합니다.",
    icon: "🧠",
    href: "/mind-map",
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
    title: "영문법 핵심 300문장",
    description: "A1~C2 3레벨 핵심 문법 300문장을 반복 청취하며 체득. 이동 중 학습에 최적화.",
    icon: "🎧",
    href: "/grammar-listen",
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
    title: "원클릭 수업준비",
    description: "주제 하나면 슬라이드, 워크시트, 모의 테스트, 교육 영상까지 한번에 생성됩니다.",
    icon: "🚀",
    href: "/teacher/lesson-prep",
  },
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
  { num: 18000, suffix: "+", label: "영어 단어" },
  { num: 5000, suffix: "+", label: "직업 데이터" },
  { num: 15, suffix: "개", label: "AI 기반 도구" },
  { num: 100, suffix: "%", label: "무료" },
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

/* ─── Count-up number component ─── */
function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 50, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) mv.set(target);
  }, [inView, mv, target]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString());
    });
    return unsub;
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

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

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ─── Compact Hero ─── */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity }}
          className="relative pt-24 sm:pt-32 pb-10 sm:pb-14 text-center overflow-hidden"
        >
          {/* Subtle gradient orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div
              className="w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full opacity-40"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)",
                filter: "blur(80px)",
              }}
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-[1.15] tracking-tight"
          >
            <span className="text-shimmer">교육에 편안함을,</span>{" "}
            <span>배움에 즐거움을</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative text-sm sm:text-base text-muted max-w-xl mx-auto mb-6"
          >
            학생과 교사 모두를 위한 AI 교육 플랫폼 — 13개 도구를 무료로 사용하세요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="relative flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/signup"
              className="btn-glow px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:scale-105 active:scale-[0.97]"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-xl glass text-foreground text-sm font-medium hover:bg-card-hover transition-all active:scale-[0.97]"
            >
              바로 체험하기
            </Link>
          </motion.div>
        </motion.section>

        {/* ─── Features — Immediate Access ─── */}
        <motion.section
          id="features"
          variants={stagger}
          initial="hidden"
          animate="show"
          className="pb-16 sm:pb-24"
        >
          {/* 학생용 */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <span className="text-xs uppercase tracking-[0.15em] text-muted/60 shrink-0">학생 도구</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-muted/40">{studentFeatures.length}개</span>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
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
                    <div className="flex items-start gap-3">
                      <span className="relative text-3xl shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <span
                          className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-lg"
                          style={{ background: featureAccents[i] }}
                        />
                        {f.icon === "euler" ? (
                          <Image src="/euler-portrait.jpg" alt="Euler" width={32} height={32} className="relative w-8 h-8 rounded-full object-cover border border-amber-500/30" />
                        ) : (
                          <span className="relative">{f.icon}</span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold mb-0.5 transition-colors duration-300">
                          <span className="group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" style={{ backgroundImage: `linear-gradient(135deg, ${featureAccents[i]}, ${featureAccents[(i + 1) % featureAccents.length]})` }}>
                            {f.title}
                          </span>
                        </h3>
                        <p className="text-muted text-xs leading-relaxed">
                          {f.description}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 교사용 */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
            <span className="text-xs uppercase tracking-[0.15em] text-muted/60 shrink-0">교사 도구</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-muted/40">{teacherFeatures.length}개</span>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <div className="flex items-start gap-3">
                        <span className="relative text-3xl shrink-0 transition-transform duration-300 group-hover:scale-110">
                          <span
                            className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-lg"
                            style={{ background: featureAccents[ai] }}
                          />
                          <span className="relative">{f.icon}</span>
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold mb-0.5 transition-colors duration-300">
                            <span className="group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300" style={{ backgroundImage: `linear-gradient(135deg, ${featureAccents[ai]}, ${featureAccents[(ai + 1) % featureAccents.length]})` }}>
                              {f.title}
                            </span>
                          </h3>
                          <p className="text-muted text-xs leading-relaxed">
                            {f.description}
                          </p>
                        </div>
                      </div>
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
          className="py-16 sm:py-24"
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8">
            지금 바로 시작하세요
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 학생 CTA */}
            <div className="glass-gradient p-6 sm:p-8 relative overflow-hidden text-center">
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)" }}
              />
              <span className="relative text-4xl block mb-3">🎓</span>
              <h3 className="relative text-lg font-bold mb-2">학생이신가요?</h3>
              <p className="relative text-muted text-xs sm:text-sm mb-5 max-w-xs mx-auto">
                AI 튜터, 마인드 맵, 진로 탐색까지 — 공부가 즐거워집니다.
              </p>
              <Link
                href="/signup"
                className="btn-glow relative inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:scale-105 active:scale-[0.97]"
              >
                무료로 시작하기
              </Link>
            </div>

            {/* 교사 CTA */}
            <div className="glass-gradient p-6 sm:p-8 relative overflow-hidden text-center">
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #f97316, transparent)" }}
              />
              <span className="relative text-4xl block mb-3">📝</span>
              <h3 className="relative text-lg font-bold mb-2">교사이신가요?</h3>
              <p className="relative text-muted text-xs sm:text-sm mb-5 max-w-xs mx-auto">
                공문서 자동 교정, 세특 도우미 — 업무 시간을 돌려드립니다.
              </p>
              <Link
                href="/signup"
                className="btn-glow relative inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:scale-105 active:scale-[0.97]"
              >
                교사로 시작하기
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ─── Stats + Trust — Bottom ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="pb-16 sm:pb-24"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-4xl font-bold text-shimmer">
                  <CountUp target={stat.num} suffix={stat.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-muted mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted/60 mb-6">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-white/30">
            <motion.div whileHover={{ scale: 1.05 }} className="transition-colors hover:text-white/50">
              <ClaudeLogo />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="transition-colors hover:text-white/50">
              <NextjsLogo />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="transition-colors hover:text-white/50">
              <SupabaseLogo />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="transition-colors hover:text-white/50">
              <VercelLogo />
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-white/5 py-8 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted/50">
            <p>&copy; 2026 EasyEdu AI — 바이브코딩 2026</p>
            <div className="flex items-center gap-4">
              <Link
                href="/crisis"
                className="hover:text-rose-400 transition-colors"
              >
                위기 상담 안내
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-foreground transition-colors"
              >
                대시보드
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
