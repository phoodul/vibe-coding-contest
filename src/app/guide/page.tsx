"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";

/* ─── 학생용 도구 12개 ─── */
const studentTools = [
  { icon: "socrates", title: "소크라테스 AI 튜터", desc: "교과 선택 후 AI와 대화하며 학습. 답을 주지 않고 질문으로 사고력을 키웁니다." },
  { icon: "euler", title: "오일러 튜터", desc: "수학 문제 사진을 업로드하면 AI가 풀이 과정을 단계별로 코칭. 기출문제 연습 모드도 지원." },
  { icon: "🧠", title: "마인드 맵", desc: "교과서 전체 구조를 인터랙티브 트리로 탐색하며 핵심 개념을 한눈에 파악합니다." },
  { icon: "🏔️", title: "영어 단어 학습", desc: "18,000 단어를 레벨별로 정복. 에베레스트 등반 테마로 단어 암기 동기를 부여합니다." },
  { icon: "🎙️", title: "AI 영어 회화", desc: "내 수준에 맞는 AI 원어민과 음성 대화. 실시간 발음·문법 피드백을 받습니다." },
  { icon: "🎧", title: "영문법 핵심 300문장", desc: "A1~C2 3레벨 핵심 문법 300문장을 반복 청취하며 체득합니다." },
  { icon: "✒️", title: "헤밍웨이 영문법 코치", desc: "헤밍웨이 페르소나가 학생 문장의 오류 패턴을 진단하고 한 문장씩 교정합니다." },
  { icon: "🧭", title: "진로 시뮬레이터", desc: "MBTI·적성·흥미 분석으로 5,000+ 직업에서 나만의 진로를 발견합니다." },
  { icon: "🌟", title: "내 길 내비", desc: "꿈이 있으면 길이 있다 — 어떤 꿈이든 AI가 진로 로드맵과 관련 학교를 안내합니다." },
  { icon: "📚", title: "맞춤 도서 추천", desc: "학년·희망 학과·진로에 맞는 도서를 국립중앙도서관 DB에서 큐레이션합니다." },
  { icon: "💪", title: "PAPS AI 코치", desc: "체력평가 결과를 입력하면 등급 분석과 취약 종목 맞춤 운동 프로그램을 제공합니다." },
  { icon: "📋", title: "현장실습 일지", desc: "오늘 한 일을 메모하면 제출용 실습 일지로 자동 정리. 특성화고 필수 도구." },
  { icon: "🎵", title: "음악 감상문 코치", desc: "곡 정보와 느낌만 입력하면 음악 용어를 활용한 감상문 초안과 표현 팁을 제공합니다." },
];

/* ─── 교사용 도구 4개 ─── */
const teacherTools = [
  { icon: "🚀", title: "원클릭 수업준비", desc: "주제 하나면 슬라이드·워크시트·모의 테스트·교육 영상을 한번에 생성합니다." },
  { icon: "📝", title: "학생부 기재 도우미", desc: "10개 영역 관리, 금지어 감지, AI 맞춤법 검사, 가명처리로 개인정보를 보호합니다." },
  { icon: "📄", title: "공문서 포맷터", desc: "HWP/HWPX 업로드 후 원클릭으로 K-에듀파인 공문서 양식에 맞게 교정합니다." },
  { icon: "✍️", title: "공문서 초안 작성기", desc: "주제만 입력하면 K-에듀파인 양식에 맞는 공문서 초안을 AI가 즉시 생성합니다." },
];

/* ─── 상세 가이드 ─── */
const detailedGuides = [
  {
    title: "오일러 튜터 사용법",
    icon: "euler",
    steps: [
      "문제 사진 업로드 — 카메라로 찍거나 갤러리에서 선택하면 AI가 문제를 인식합니다.",
      "AI 코칭 시작 — 풀이 과정을 한 번에 알려주지 않고, 단계별 힌트와 질문으로 사고를 이끕니다.",
      "기출문제 연습 — 수능·모의고사 기출 문제를 선택해 같은 방식으로 연습할 수 있습니다.",
    ],
  },
  {
    title: "소크라테스 튜터 사용법",
    icon: "socrates",
    steps: [
      "교과 선택 — 국어·수학·영어·사회·과학 등 교과서 단원을 선택합니다.",
      "AI 대화 시작 — 선택한 단원의 핵심 개념에 대해 AI가 질문을 던지며 대화를 이끕니다.",
      "웹 검색 연동 — 추가 자료가 필요하면 AI가 웹 검색 결과를 참고해 더 깊이 있는 답변을 제공합니다.",
    ],
  },
  {
    title: "학생부 기재 도우미 사용법",
    icon: "📝",
    steps: [
      "영역 선택 — 세부능력 및 특기사항, 행동특성, 진로희망 등 10개 영역 중 선택합니다.",
      "가명처리 — 학생 이름을 자동으로 가명(예: 김OO)으로 변환하여 개인정보를 보호합니다.",
      "맞춤법 검사 — AI가 맞춤법·금지어를 감지하고 2026 기재요령에 맞게 수정을 제안합니다.",
    ],
  },
];

/* ─── 아이콘 렌더 ─── */
function ToolIcon({ icon }: { icon: string }) {
  if (icon === "socrates" || icon === "euler") {
    return (
      <span className="text-2xl flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
        {icon === "socrates" ? "🏛️" : "📐"}
      </span>
    );
  }
  return (
    <span className="text-2xl flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
      {icon}
    </span>
  );
}

/* ─── 페이지 ─── */
export default function GuidePage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          &larr; 대시보드
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            📖 사용 가이드
          </h1>
          <p className="text-muted mb-10">
            EasyEdu AI의 16개 도구를 한눈에 살펴보고, 주요 기능의 사용법을 확인하세요.
          </p>
        </motion.div>

        {/* ── 학생용 도구 ── */}
        <section className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-semibold mb-4 flex items-center gap-2"
          >
            <span className="w-1.5 h-6 rounded-full bg-violet-500 inline-block" />
            학생용 도구 (12개)
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studentTools.map((tool, i) => (
              <GlassCard key={tool.title} delay={0.05 * i} className="flex items-start gap-3">
                <ToolIcon icon={tool.icon} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm">{tool.title}</h3>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{tool.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ── 교사용 도구 ── */}
        <section className="mb-14">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold mb-4 flex items-center gap-2"
          >
            <span className="w-1.5 h-6 rounded-full bg-cyan-500 inline-block" />
            교사용 도구 (4개)
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teacherTools.map((tool, i) => (
              <GlassCard key={tool.title} delay={0.05 * i} className="flex items-start gap-3">
                <ToolIcon icon={tool.icon} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm">{tool.title}</h3>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{tool.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ── 상세 가이드 ── */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-semibold mb-6 flex items-center gap-2"
          >
            <span className="w-1.5 h-6 rounded-full bg-amber-500 inline-block" />
            주요 기능 상세 가이드
          </motion.h2>
          <div className="space-y-4">
            {detailedGuides.map((guide, i) => (
              <GlassCard key={guide.title} delay={0.1 * i} hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <ToolIcon icon={guide.icon} />
                  <h3 className="font-semibold">{guide.title}</h3>
                </div>
                <ol className="space-y-3">
                  {guide.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                        {j + 1}
                      </span>
                      <p className="text-sm text-muted leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
