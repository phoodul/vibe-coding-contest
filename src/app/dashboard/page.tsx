"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/shared/glass-card";
import { CrisisButton } from "@/components/shared/crisis-button";
import { SUBJECTS } from "@/lib/ai/tutor-prompt";
import { UserMenu } from "@/components/profile/UserMenu";

interface Profile {
  display_name: string | null;
  role: "student" | "teacher";
}

interface MenuItem {
  title: string;
  desc: string;
  icon: string;
  href: string;
  span?: string;
}

// 학생 메뉴 — 2열 그리드
const studentItems: MenuItem[] = [
  { title: "소크라테스 AI 튜터", desc: "질문으로 이끄는 AI 학습", icon: "socrates", href: "/tutor" },
  { title: "Legend Tutor", desc: "5명의 거장 — 라마누잔·가우스·폰 노이만·오일러·라이프니츠", icon: "🏛️", href: "/legend" },
  { title: "마인드 맵", desc: "교과서 전체 구조를 한눈에 탐색", icon: "🧠", href: "/mind-map" },
  { title: "영어 단어 학습", desc: "18,000 단어 레벨별 에베레스트 등반", icon: "🏔️", href: "/vocabulary" },
  { title: "AI 영어 회화", desc: "내 수준에 맞는 음성 영어 대화", icon: "🎙️", href: "/conversation" },
  { title: "영문법 핵심 300문장", desc: "3레벨 반복 청취로 영문법 체득", icon: "🎧", href: "/grammar-listen" },
  { title: "헤밍웨이 영문법 코치", desc: "오류 패턴 진단 + 한 문장씩 교정 — 헤밍웨이 페르소나", icon: "✒️", href: "/grammar" },
  { title: "진로 시뮬레이터", desc: "5,000+ 직업에서 나만의 길 찾기", icon: "🧭", href: "/career" },
  { title: "내 길 내비", desc: "꿈이 있으면 길이 있다 — AI 진로 로드맵", icon: "🌟", href: "/pathfinder" },
  { title: "맞춤 도서 추천", desc: "진로 맞춤 도서 큐레이션", icon: "📚", href: "/books" },
  { title: "PAPS AI 코치", desc: "체력평가 분석 + 맞춤 운동 프로그램", icon: "💪", href: "/paps" },
  { title: "현장실습 일지", desc: "메모 → 제출용 실습 일지 자동 작성", icon: "📋", href: "/internship" },
  { title: "음악 감상문 코치", desc: "음악 용어 활용 감상문 작성 도우미", icon: "🎵", href: "/music-review" },
];

// 교사 메뉴 — 2열 그리드
const teacherItems: MenuItem[] = [
  { title: "원클릭 수업준비", desc: "주제 입력 → 슬라이드·워크시트·테스트·영상 한번에", icon: "🚀", href: "/teacher/lesson-prep" },
  { title: "공문서 포맷터", desc: "HWPX 업로드 → 원클릭 양식 교정", icon: "📄", href: "/teacher/formatter" },
  { title: "공문서 초안 작성기", desc: "주제 입력 → AI 공문서 초안 자동 생성", icon: "✍️", href: "/teacher/generator" },
  { title: "학생부 기재 도우미", desc: "10개 영역 · 금지어 감지 · 가명처리 · 맞춤법 검사", icon: "📝", href: "/teacher/record" },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? null);
        const { data } = await supabase
          .from("profiles")
          .select("display_name, role")
          .eq("id", user.id)
          .single();

        const p = data as Profile | null;
        setProfile(p);
        if (p?.role === "teacher") setActiveTab("teacher");
      }
      // 비로그인도 허용 — 게스트 모드
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">로딩 중...</div>
      </div>
    );
  }

  const isLoggedIn = !!profile;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <CrisisButton />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex items-start justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">
              {isLoggedIn
                ? `안녕하세요, ${profile?.display_name || "사용자"}님`
                : "EasyEdu AI"}{" "}
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-block"
              >
                👋
              </motion.span>
            </h1>
            <p className="text-muted">
              {isLoggedIn
                ? `${activeTab === "teacher" ? "교사" : "학생"} 대시보드`
                : "로그인 없이 체험할 수 있습니다"}
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <UserMenu email={userEmail} displayName={profile?.display_name ?? null} />
          </div>
        </motion.div>

        {/* 역할 전환 탭 */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("student")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "student"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "glass text-muted hover:text-foreground border border-white/10"
            }`}
          >
            학생 도구
          </button>
          <button
            onClick={() => setActiveTab("teacher")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "teacher"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "glass text-muted hover:text-foreground border border-white/10"
            }`}
          >
            교사 도구
          </button>
        </div>

        <div className="space-y-10">
          {/* 학습 진행도 — 학생 탭에서만 */}
          {activeTab === "student" && <TutorProgress />}

          {/* 학생 기능 */}
          {activeTab === "student" && (
          <motion.div variants={sectionVariants} initial="hidden" animate="show">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-medium text-muted uppercase tracking-wider">학습 도구</h2>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {studentItems.map((item) => (
                <motion.div key={item.href} variants={cardVariants}>
                  <Link href={item.href}>
                    <GlassCard delay={0} className="h-full cursor-pointer group card-sheen">
                      <motion.span
                        className="text-4xl mb-3 block"
                        whileHover={{ scale: 1.2, y: -4, rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
                      >
                        {item.icon === "euler" ? (
                          <Image src="/euler-portrait.jpg" alt="Euler" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-amber-500/30" />
                        ) : item.icon === "socrates" ? (
                          <Image src="/socrates-portrait.jpg" alt="Socrates" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-violet-500/30" />
                        ) : item.icon}
                      </motion.span>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted">{item.desc}</p>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
          )}

          {/* 교사 기능 */}
          {activeTab === "teacher" && (
            <motion.div variants={sectionVariants} initial="hidden" animate="show">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-medium text-muted uppercase tracking-wider">교사 도구</h2>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teacherItems.map((item) => (
                  <motion.div key={item.href} variants={cardVariants}>
                    <Link href={item.href}>
                      <GlassCard delay={0} className="h-full cursor-pointer group card-sheen">
                        <motion.span
                          className="text-4xl mb-3 block"
                          whileHover={{ scale: 1.2, y: -4, rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
                        >
                          {item.icon === "euler" ? (
                            <Image src="/euler-portrait.jpg" alt="Euler" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-amber-500/30" />
                          ) : item.icon}
                        </motion.span>
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted">{item.desc}</p>
                      </GlassCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer — 비-로그인일 때만 로그인 CTA */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-end gap-4"
          >
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              로그인하여 교사 기능 이용하기 &rarr;
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TutorProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("easyedu-tutor-progress");
      if (saved) setCompleted(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, []);

  // 교과별 진행도 계산
  const subjectProgress = SUBJECTS.filter((s) => s.topics.length > 0).map((subject) => {
    const allConcepts = subject.topics.flatMap((t) => t.concepts);
    const done = allConcepts.filter((c) => completed.has(c)).length;
    return { name: subject.name, icon: subject.icon, total: allConcepts.length, done, topics: subject.topics.length };
  });

  const totalConcepts = subjectProgress.reduce((a, s) => a + s.total, 0);
  const totalDone = subjectProgress.reduce((a, s) => a + s.done, 0);

  if (totalDone === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">학습 진행도</h2>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-muted">{totalDone} / {totalConcepts} 개념</span>
      </div>
      <div className="glass-gradient p-5 space-y-4">
        {/* 전체 프로그레스 바 */}
        <div>
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>전체 진행률</span>
            <span>{totalConcepts > 0 ? Math.round((totalDone / totalConcepts) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalConcepts > 0 ? (totalDone / totalConcepts) * 100 : 0}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        {/* 교과별 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjectProgress.filter((s) => s.done > 0).map((s) => (
            <Link key={s.name} href="/tutor" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{s.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full"
                      style={{ width: `${(s.done / s.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted shrink-0">{s.done}/{s.total}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
