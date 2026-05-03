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
  "#f59e0b", // amber - 오일러
  "#fbbf24", // amber light - Legend Tutor (G06-32)
  "#6366f1", // indigo - 마인드 맵
  "#06b6d4", // cyan - 영어 단어
  "#f43f5e", // rose - 영어 회화
  "#22d3ee", // cyan-400 - 영문법 듣기
  "#eab308", // yellow - 진로
  "#facc15", // yellow-400 - 내 길 내비
  "#10b981", // emerald - 도서
  "#ef4444", // red - PAPS
  "#14b8a6", // teal - 현장실습
  "#a855f7", // purple - 음악 감상문
  "#a78bfa", // light violet - 공문서 포맷터
  "#38bdf8", // sky - 공문서 초안
  "#f97316", // orange - 생기부 세특
  "#8b5cf6", // teacher 1
  "#6366f1", // teacher 2
  "#a855f7", // teacher 3
  "#f97316", // teacher 4
];

// MiniDemo removed from landing — now shown on individual feature pages

function _MiniDemoUnused({ type }: { type: string }) {
  if (type === "tutor") return (
    <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5 overflow-hidden h-16">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.4 }} className="flex gap-1.5 items-start">
        <div className="w-4 h-4 rounded-full bg-violet-500/30 shrink-0 mt-0.5" />
        <div className="px-2 py-1 rounded-lg bg-white/5 text-[9px] text-muted">이것이 왜 중요할까요?</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.4 }} className="flex gap-1.5 items-start justify-end">
        <div className="px-2 py-1 rounded-lg bg-violet-500/10 text-[9px] text-violet-300">음... 효율성 때문인가요?</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.0, duration: 0.4 }} className="flex gap-1.5 items-start">
        <div className="w-4 h-4 rounded-full bg-violet-500/30 shrink-0 mt-0.5" />
        <div className="px-2 py-1 rounded-lg bg-white/5 text-[9px] text-muted">정확해요! 👏</div>
      </motion.div>
    </div>
  );
  if (type === "euler") return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-1.5 items-start">
        <div className="w-4 h-4 rounded-full bg-amber-500/30 shrink-0 mt-0.5" />
        <div className="px-2 py-1 rounded-lg bg-white/5 text-[9px] text-muted">
          <motion.span initial={{ width: 0 }} animate={{ width: "auto" }} transition={{ delay: 0.8, duration: 1.5 }} className="inline-block overflow-hidden whitespace-nowrap">
            x² + 3x - 4 = 0 → 인수분해하면?
          </motion.span>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-center mt-1">
        <span className="text-[9px] text-amber-400">(x+4)(x-1) = 0 ✓</span>
      </motion.div>
    </div>
  );
  if (type === "vocab") return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex items-center justify-center">
      <svg viewBox="0 0 120 50" className="w-24 h-12">
        <line x1="10" y1="45" x2="110" y2="5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 2" />
        <motion.line x1="10" y1="45" x2="110" y2="5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 0.3 }} transition={{ delay: 0.5, duration: 2 }} />
        <g>
          <motion.g initial={{ x: 10, y: 45 }} animate={{ x: 40, y: 35 }} transition={{ delay: 0.5, duration: 2 }}>
            <rect x="-2" y="-10" width="4" height="6" rx="1" fill="#f97316" />
            <circle cx="0" cy="-13" r="2.5" fill="#fcd34d" />
          </motion.g>
        </g>
        <text x="60" y="48" fill="rgba(255,255,255,0.3)" fontSize="6" textAnchor="middle">Camp 1 → Camp 2</text>
      </svg>
    </div>
  );
  if (type === "career") return <MiniDemoCareer />;
  if (type === "lesson") return <MiniDemoLesson />;
  if (type === "mindmap") return <MiniDemoMindMap />;
  if (type === "grammar") return <MiniDemoGrammar />;
  if (type === "pathfinder") return <MiniDemoPathfinder />;
  if (type === "books") return <MiniDemoBooks />;
  if (type === "paps") return <MiniDemoPaps />;
  if (type === "internship") return <MiniDemoInternship />;
  if (type === "music") return <MiniDemoMusic />;
  if (type === "formatter") return <MiniDemoFormatter />;
  if (type === "draft") return <MiniDemoDraft />;
  if (type === "record") return <MiniDemoRecord />;
  if (type === "conversation") return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col items-center justify-center gap-1">
      <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ delay: 0.5, duration: 0.5 }} className="flex gap-1">
        {[0,1,2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-rose-400" animate={{ y: [0, -4, 0] }} transition={{ delay: 0.8 + i * 0.15, duration: 0.4, repeat: Infinity, repeatDelay: 1 }} />
        ))}
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-[9px] text-rose-300">Hello! How are you today?</motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-[9px] text-muted">I&apos;m fine, thank you!</motion.p>
    </div>
  );
  return null;
}

function MiniDemoCareer() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col items-center justify-center gap-1">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="flex gap-2">
        {["ENFP", "예술", "창의"].map((tag, i) => (
          <motion.span key={tag} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.3 }}
            className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/15 text-amber-300 border border-amber-500/20">{tag}</motion.span>
        ))}
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="text-[9px] text-muted">→ UX 디자이너, 콘텐츠 크리에이터...</motion.p>
    </div>
  );
}

function MiniDemoLesson() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col gap-1 justify-center">
      {["📋 수업 슬라이드", "📝 학습 활동지", "✅ 형성평가"].map((item, i) => (
        <motion.div key={item} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.5 }}
          className="flex items-center gap-1.5">
          <motion.div className="w-1 h-1 rounded-full bg-sky-400" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.5 }} />
          <span className="text-[9px] text-muted">{item}</span>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.5 }} className="text-[8px] text-green-400 ml-auto">생성됨</motion.span>
        </motion.div>
      ))}
    </div>
  );
}

function MiniDemoMindMap() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex items-center justify-center">
      <svg viewBox="0 0 120 50" className="w-28 h-12">
        <motion.circle cx="60" cy="25" r="8" fill="#6366f1" opacity="0.3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
        <motion.text x="60" y="27" fontSize="5" fill="white" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>핵심</motion.text>
        {[[25,12],[95,12],[25,38],[95,38]].map(([x,y],i) => (
          <g key={i}>
            <motion.line x1="60" y1="25" x2={x} y2={y} stroke="#6366f1" strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8+i*0.2, duration: 0.4 }} />
            <motion.circle cx={x} cy={y} r="4" fill="#6366f1" opacity="0.2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1+i*0.2 }} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function MiniDemoGrammar() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col items-center justify-center gap-1.5">
      <motion.div className="flex gap-1 items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <span className="text-[9px] text-cyan-300">🔊</span>
        {[0,1,2,3,4].map(i => (
          <motion.div key={i} className="w-0.5 bg-cyan-400 rounded-full" style={{ height: 4+Math.random()*8 }}
            animate={{ height: [4, 4+Math.random()*10, 4] }} transition={{ delay: 0.6+i*0.1, duration: 0.5, repeat: Infinity, repeatDelay: 0.8 }} />
        ))}
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-[9px] text-muted italic">&quot;She has been studying...&quot;</motion.p>
    </div>
  );
}

function MiniDemoPathfinder() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col items-center justify-center gap-1">
      <motion.div className="flex gap-1 items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        {["꿈","→","학교","→","직업"].map((s,i) => (
          <motion.span key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5+i*0.4 }}
            className={`text-[9px] ${i%2===0 ? "px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20" : "text-muted/50"}`}>{s}</motion.span>
        ))}
      </motion.div>
    </div>
  );
}

function MiniDemoBooks() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col gap-1 justify-center">
      {["📖 데미안 — 헤르만 헤세", "📗 코스모스 — 칼 세이건", "📘 사피엔스 — 유발 하라리"].map((b,i) => (
        <motion.p key={b} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5+i*0.4 }}
          className="text-[9px] text-muted">{b}</motion.p>
      ))}
    </div>
  );
}

function MiniDemoPaps() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex items-center justify-center gap-3">
      {[{l:"유연성",v:75,c:"#22c55e"},{l:"근력",v:45,c:"#ef4444"},{l:"심폐",v:88,c:"#22c55e"}].map((s,i) => (
        <motion.div key={s.l} className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5+i*0.3 }}>
          <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: s.c }} initial={{ width: 0 }} animate={{ width: `${s.v}%` }} transition={{ delay: 0.8+i*0.3, duration: 0.8 }} />
          </div>
          <p className="text-[7px] text-muted mt-0.5">{s.l}</p>
        </motion.div>
      ))}
    </div>
  );
}

function MiniDemoInternship() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col gap-1 justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-1.5">
        <span className="text-[9px]">📝</span>
        <motion.span initial={{ width: 0 }} animate={{ width: "auto" }} transition={{ delay: 0.8, duration: 1.5 }} className="text-[9px] text-muted inline-block overflow-hidden whitespace-nowrap">오늘 배운 내용: 고객 응대 매뉴얼...</motion.span>
      </motion.div>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-[8px] text-green-400">✓ AI 일지 자동 작성</motion.span>
    </div>
  );
}

function MiniDemoMusic() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col items-center justify-center gap-1">
      <motion.div className="flex gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        {[0,1,2,3,4,5,6,7].map(i => (
          <motion.div key={i} className="w-1 bg-purple-400 rounded-full" animate={{ height: [3, 6+Math.random()*8, 3] }}
            transition={{ delay: 0.5+i*0.1, duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }} style={{ height: 3 }} />
        ))}
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-[9px] text-muted">베토벤 — 월광 소나타</motion.p>
    </div>
  );
}

function MiniDemoFormatter() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col gap-1 justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-1">
        <span className="text-[9px]">📄</span><span className="text-[9px] text-muted">공문서.hwp</span>
      </motion.div>
      {[{t:"글꼴 규격",ok:true},{t:"여백 설정",ok:false},{t:"쪽번호",ok:true}].map((r,i) => (
        <motion.div key={r.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8+i*0.3 }}
          className="flex items-center gap-1">
          <span className={`text-[8px] ${r.ok?"text-green-400":"text-red-400"}`}>{r.ok?"✓":"✗"}</span>
          <span className="text-[8px] text-muted">{r.t}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MiniDemoRecord() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col gap-1 justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-1">
        {["과학","탐구","실험"].map((k,i) => (
          <motion.span key={k} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6+i*0.2 }}
            className="px-1 py-0.5 rounded text-[7px] bg-orange-500/10 text-orange-300 border border-orange-500/20">{k}</motion.span>
        ))}
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-[8px] text-muted">→ AI 세특 초안 자동 생성</motion.p>
    </div>
  );
}

function MiniDemoDraft() {
  return (
    <div className="mt-2 pt-2 border-t border-white/5 overflow-hidden h-16 flex flex-col gap-1 justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-1">
        <span className="text-[9px]">✏️</span>
        <motion.span initial={{ width: 0 }} animate={{ width: "auto" }} transition={{ delay: 0.8, duration: 1.2 }} className="text-[9px] text-muted inline-block overflow-hidden whitespace-nowrap">주제 입력 → 공문서 초안...</motion.span>
      </motion.div>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="text-[8px] text-sky-400">✓ 6-하 체계 자동 적용</motion.span>
    </div>
  );
}

const demoTypes: Record<string, string> = {
  "소크라테스 AI 튜터": "tutor",
  "오일러 튜터": "euler",
  "마인드 맵": "mindmap",
  "영어 단어 학습": "vocab",
  "AI 영어 회화": "conversation",
  "영문법 핵심 300문장": "grammar",
  "헤밍웨이 영문법 코치": "grammar",
  "진로 시뮬레이터": "career",
  "내 길 내비": "pathfinder",
  "맞춤 도서 추천": "books",
  "PAPS AI 코치": "paps",
  "현장실습 일지 도우미": "internship",
  "음악 감상문 도우미": "music",
  "수업 자료 생성기": "lesson",
  "공문서 포맷터": "formatter",
  "공문서 초안 작성기": "draft",
  "생기부 세특 도우미": "record",
};

const studentFeatures = [
  {
    title: "소크라테스 AI 튜터",
    description: "답을 주지 않고 질문으로 이끄는 대화형 학습. 스스로 깨닫는 진짜 공부.",
    icon: "socrates",
    href: "/tutor",
  },
  {
    title: "오일러 튜터",
    description: "계산은 AI가 할게요. 수학 문제의 논리적 사고과정을 따뜻한 멘토와 함께 훈련합니다.",
    icon: "euler",
    href: "/euler-tutor",
  },
  {
    title: "Legend Tutor",
    description: "라마누잔·가우스·폰 노이만·오일러·라이프니츠 — 5 명의 수학 거장 AI. 체험 무료, 베타 신청 시 거장 4명 + R1 리포트 + 추론 트리.",
    icon: "🏛️",
    href: "/legend",
  },
  {
    title: "베타 후기",
    description: "5 명의 거장 튜터를 직접 사용한 베타 사용자들의 솔직한 별점·구매 의향·추천 튜터 후기 모음.",
    icon: "⭐",
    href: "/legend/reviews",
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
    title: "헤밍웨이 영문법 코치",
    description: "헤밍웨이 페르소나가 학생의 영어 문장 오류 패턴을 진단하고 한 문장씩 교정합니다. 시제·관계대명사·가정법 등 6 anchor 영문법 trigger 라이브러리 기반.",
    icon: "✒️",
    href: "/grammar",
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
    title: "학생부 기재 도우미",
    description: "2026 기재요령 기반 10개 영역 관리, 금지어 감지, AI 맞춤법 검사, 가명처리로 개인정보 보호.",
    icon: "📝",
    href: "/teacher/record",
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
];

const impactStats = [
  { num: 20, suffix: "%↑", label: "학습 성취도 향상" },
  { num: 5, suffix: "시간+", label: "교사 주당 업무 절감" },
  { num: 40, suffix: "만원", label: "월 사교육비 절감" },
];

const impactSources = [
  "학습 성취도: Bloom(1984) 2 Sigma 연구 — 1:1 튜터링 시 상위 98% 도달. MIT RAISE(2025) 소크라틱 AI 튜터 연구 보수적 적용",
  "업무 절감: OECD TALIS 2024 — 한국 교사 행정업무 주 6시간(OECD 1위) + 수업준비 6.8시간 중 AI 보조분",
  "사교육비: 통계청 2025 — 참여학생 월평균 60.4만원 중 AI 튜터링으로 대체 가능한 1~2과목분",
];

const stats = [
  { num: 18000, suffix: "+", label: "영어 단어" },
  { num: 5000, suffix: "+", label: "직업 데이터" },
  { num: 16, suffix: "개", label: "AI 기반 도구" },
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
            학생과 교사 모두를 위한 AI 교육 플랫폼 — 16개 도구를 무료로 사용하세요.
            <br />
            <span className="text-xs text-muted/60">로그인하면 학습 진행도 저장 · 세션 이어하기 · 독서기록 동기화가 가능합니다.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="relative flex justify-center"
          >
            <Link
              href="/dashboard"
              className="btn-glow px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:scale-105 active:scale-[0.97]"
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
                        ) : f.icon === "socrates" ? (
                          <Image src="/socrates-portrait.jpg" alt="Socrates" width={32} height={32} className="relative w-8 h-8 rounded-full object-cover border border-violet-500/30" />
                        ) : (
                          <span className="relative">{f.icon}</span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="min-w-0 flex-1">
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
                AI 튜터, 마인드 맵, 진로 탐색까지<br />
                공부가 즐거워집니다.
              </p>
              <Link
                href="/dashboard"
                className="btn-glow relative inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:scale-105 active:scale-[0.97]"
              >
                바로 체험하기
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
                원클릭 수업준비, 공문서 교정, 세특 도우미<br />
                업무 시간을 돌려드립니다.
              </p>
              <Link
                href="/dashboard"
                className="btn-glow relative inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:scale-105 active:scale-[0.97]"
              >
                바로 체험하기
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ─── 예상 절감 효과 ─── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="py-16 sm:py-24"
        >
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-3">
            EasyEdu AI와 함께라면
          </h2>
          <p className="text-center text-sm text-muted mb-10">연구 데이터 기반 예상 절감 효과</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {impactStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-gradient p-6 sm:p-8 text-center relative overflow-hidden"
              >
                <p className="text-3xl sm:text-5xl font-bold text-shimmer mb-2">
                  <CountUp target={stat.num} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass-gradient p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs text-muted/60 font-medium mb-2 uppercase tracking-wider">근거</p>
            <ul className="space-y-1">
              {impactSources.map((src, i) => (
                <li key={i} className="text-[10px] sm:text-xs text-muted/50 leading-relaxed">
                  • {src}
                </li>
              ))}
            </ul>
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

        {/* ─── 위기 상담 안내 ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pb-12"
        >
          <Link href="/crisis">
            <div className="glass-gradient p-5 sm:p-6 relative overflow-hidden text-center group cursor-pointer hover:border-rose-500/20 transition-all">
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #f43f5e, transparent)" }}
              />
              <p className="text-lg sm:text-xl mb-1">
                <span className="text-rose-400">🚨</span> 혼자 힘들어하고 있나요?
              </p>
              <p className="text-sm text-muted mb-3">
                자해·자살·학교폭력으로 고민하고 있다면, 24시간 도움을 받을 수 있어요.
              </p>
              <span className="inline-block px-4 py-2 rounded-lg bg-rose-500/15 text-rose-300 text-sm font-medium group-hover:bg-rose-500/25 transition-colors">
                위기 상담 안내 보기 →
              </span>
            </div>
          </Link>
        </motion.section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-white/5 py-8 mt-8">
          <div className="text-center text-xs text-muted/50 space-y-1">
            <p>&copy; 2026 EasyEdu AI — 바이브코딩 2026</p>
            <p className="text-[9px] text-muted/30">
              Euler portrait: Jakob Emanuel Handmann (1753), Public Domain | Socrates bust photo: Eric Gaba (Sting), CC BY-SA 2.5, via Wikimedia Commons
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
