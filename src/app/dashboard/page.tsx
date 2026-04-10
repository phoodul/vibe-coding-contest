"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/shared/glass-card";

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
  { title: "소크라테스 AI 튜터", desc: "질문으로 이끄는 AI 학습", icon: "🎓", href: "/tutor" },
  { title: "마인드 맵", desc: "교과서 전체 구조를 한눈에 탐색", icon: "🧠", href: "/mind-map" },
  { title: "영어 단어 학습", desc: "18,000 단어 레벨별 에베레스트 등반", icon: "🏔️", href: "/vocabulary" },
  { title: "AI 영어 회화", desc: "내 수준에 맞는 음성 영어 대화", icon: "🎙️", href: "/conversation" },
  { title: "영문법 핵심 300문장", desc: "3레벨 반복 청취로 영문법 체득", icon: "🎧", href: "/grammar-listen" },
  { title: "진로 시뮬레이터", desc: "5,000+ 직업에서 나만의 길 찾기", icon: "🧭", href: "/career" },
  { title: "내 길 내비", desc: "꿈이 있으면 길이 있다 — AI 진로 로드맵", icon: "🌟", href: "/pathfinder" },
  { title: "맞춤 도서 추천", desc: "진로 맞춤 도서 큐레이션", icon: "📚", href: "/books" },
  { title: "PAPS AI 코치", desc: "체력평가 분석 + 맞춤 운동 프로그램", icon: "💪", href: "/paps" },
  { title: "현장실습 일지", desc: "메모 → 제출용 실습 일지 자동 작성", icon: "📋", href: "/internship" },
  { title: "음악 감상문 코치", desc: "음악 용어 활용 감상문 작성 도우미", icon: "🎵", href: "/music-review" },
];

// 교사 메뉴 — 2열 그리드
const teacherItems: MenuItem[] = [
  { title: "공문서 포맷터", desc: "HWPX 업로드 → 원클릭 양식 교정", icon: "📄", href: "/teacher/formatter" },
  { title: "공문서 초안 작성기", desc: "주제 입력 → AI 공문서 초안 자동 생성", icon: "✍️", href: "/teacher/generator" },
  { title: "생기부 세특 도우미", desc: "NEIS 바이트 계산 · 금지어 감지 · 유사도 분석", icon: "📝", href: "/teacher/record" },
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, role")
          .eq("id", user.id)
          .single();

        setProfile(data as Profile | null);
      }
      // 비로그인도 허용 — 게스트 모드
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">로딩 중...</div>
      </div>
    );
  }

  const isLoggedIn = !!profile;
  const isTeacher = profile?.role === "teacher";

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold mb-2">
            {isLoggedIn
              ? `안녕하세요, ${profile?.display_name || "사용자"}님`
              : "EduFlow AI"}{" "}
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
              ? `${isTeacher ? "교사" : "학생"} 대시보드`
              : "로그인 없이 체험할 수 있습니다"}
          </p>
        </motion.div>

        <div className="space-y-10">
          {/* 학생 기능 — 2열 그리드 */}
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
                        {item.icon}
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

          {/* 교사 기능 — 로그인+교사 역할만 표시 */}
          {isTeacher && (
            <motion.div variants={sectionVariants} initial="hidden" animate="show">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-medium text-muted uppercase tracking-wider">교사 도구</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  NEIS 승인 필요
                </span>
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
                          {item.icon}
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex justify-end gap-4"
        >
          {isLoggedIn ? (
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              로그인하여 교사 기능 이용하기 &rarr;
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
