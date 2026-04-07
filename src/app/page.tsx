"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/shared/glass-card";

const features = [
  {
    title: "소크라테스 AI 튜터",
    description: "답을 주지 않고 질문으로 이끄는 대화형 학습. 스스로 깨닫는 진짜 공부.",
    icon: "🎓",
    href: "/tutor",
    span: "col-span-2",
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
    description: "단축키 한 번으로 K-에듀파인 공문서 양식 자동 교정. 교사의 시간을 돌려드립니다.",
    icon: "📄",
    href: "/teacher/formatter",
    span: "col-span-2",
  },
  {
    title: "공문서 생성기",
    description: "전달할 내용만 입력하면 AI가 두문-본문-결문 구조로 공문서를 자동 작성.",
    icon: "📝",
    href: "/teacher/generator",
    span: "",
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI가 이끄는
            </span>
            <br />
            차세대 교육
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10">
            학생에게는 소크라테스식 AI 튜터링과 진로 탐색을,
            <br />
            교사에게는 공문서 업무 자동화를 제공합니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105"
            >
              무료로 시작하기
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 rounded-xl glass text-foreground font-medium hover:bg-card-hover transition-all"
            >
              기능 살펴보기
            </Link>
          </div>
        </motion.section>

        {/* Features — Bento Grid */}
        <motion.section
          id="features"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} className={f.span}>
              <Link href={f.href}>
                <GlassCard delay={0} className="h-full cursor-pointer group">
                  <span className="text-4xl mb-4 block">{f.icon}</span>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f.description}
                  </p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold mb-12">3단계로 시작하세요</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "회원가입", desc: "학생 또는 교사로 가입" },
              { step: "02", title: "기능 선택", desc: "학습, 진로, 공문서 중 선택" },
              { step: "03", title: "AI와 함께", desc: "맞춤형 AI가 즉시 도움" },
            ].map((item, i) => (
              <GlassCard key={item.step} delay={i * 0.1} hover={false}>
                <span className="text-4xl font-bold text-primary/30 block mb-2">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-muted text-sm">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </motion.section>
      </main>
    </>
  );
}
