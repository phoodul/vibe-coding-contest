"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ───────────────────── 데이터 ───────────────────── */

interface Hotline {
  name: string;
  org: string;
  number: string;
  hours: string;
  target: string;
  methods: string[];
  desc: string;
  url?: string;
}

const emergencyLines: Hotline[] = [
  { name: "응급의료", org: "", number: "119", hours: "24시간", target: "전 연령", methods: ["전화"], desc: "생명이 위급할 때 즉시 신고 — 구급대가 응급실로 이송합니다" },
  { name: "경찰", org: "", number: "112", hours: "24시간", target: "전 연령", methods: ["전화"], desc: "폭력·범죄 등 위급한 상황에서 신고하세요" },
];

const hotlines: Hotline[] = [
  { name: "자살예방상담전화", org: "보건복지부", number: "109", hours: "24시간", target: "전 연령", methods: ["전화", "카카오톡", "앱", "문자"], desc: "자살 위험 시 전문상담사가 감정 지지와 위기 개입을 합니다.", url: "https://www.129.go.kr" },
  { name: "정신건강위기상담전화", org: "보건복지부", number: "1577-0199", hours: "24시간", target: "전 연령", methods: ["전화"], desc: "중증 우울, 자해 충동, 급격한 위기 등 정신건강 문제에 전문상담원이 대응합니다.", url: "https://www.mentalhealth.go.kr" },
  { name: "청소년전화", org: "한국청소년상담복지개발원", number: "1388", hours: "24시간", target: "만 9~24세 / 보호자", methods: ["전화", "문자", "카카오톡", "웹", "챗봇"], desc: "학교·가정·자살충동 등 청소년 전용 상담. 인터넷 상담게시판, 심리검사도 제공합니다.", url: "https://www.cyber1388.kr" },
  { name: "생명의전화", org: "한국생명의전화", number: "1588-9191", hours: "24시간", target: "전 연령", methods: ["전화", "카카오톡 '채널 라임'"], desc: "자살 위기·외로움 상담.", url: "https://www.lifeline.or.kr" },
  { name: "학교폭력신고", org: "", number: "117", hours: "24시간", target: "전 연령", methods: ["전화"], desc: "학교폭력 신고·상담. 학교장·교육청 조치를 요청할 수 있습니다.", url: "https://www.117.go.kr" },
  { name: "다 들어줄 개", org: "교육부", number: "1661-5004", hours: "24시간", target: "만 9~24세", methods: ["카카오톡", "앱", "문자"], desc: "익명 SNS 상담 앱. 전문상담원이 연결됩니다.", url: "https://www.dadlg.kr" },
  { name: "여성긴급전화", org: "", number: "1366", hours: "24시간", target: "전 연령", methods: ["전화"], desc: "가정폭력·성폭력 위기 상담을 받을 수 있습니다.", url: "https://www.women1366.kr" },
];

interface SituationGuide {
  title: string;
  emoji: string;
  color: string; // tailwind ring/border color
  steps: string[];
  numbers: string[];
}

const situations: SituationGuide[] = [
  {
    title: "자살·자해 생각이 있어요",
    emoji: "💙",
    color: "blue",
    steps: [
      "믿을 수 있는 어른(부모·교사 등)에게 지금 기분을 솔직히 이야기하세요",
      "혼자 있다면 안전한 장소로 이동하세요",
      "칼·약물 등 위험한 도구가 주변에 있으면 멀리 치우세요",
      "109, 1577-0199, 1388 같은 상담전화로 도움을 구하세요",
      "위험하다면 119에 신고하거나 가까운 병원 응급실을 방문하세요",
    ],
    numbers: ["109", "1577-0199", "1388", "119"],
  },
  {
    title: "학교폭력을 당하고 있어요",
    emoji: "🛡️",
    color: "amber",
    steps: [
      "혼자가 아닙니다 — 주변에 반드시 도와줄 사람이 있습니다",
      "부모님, 담임 선생님, 학교폭력 담당 선생님에게 피해 사실을 알리세요",
      "스마트폰 캡처, 동영상, 메시지 등 증거를 확보하세요",
      "117에 신고하거나 교육지원청 학교폭력 전담 부서에 도움을 요청하세요",
      "폭력이 심각하면 112에 신고하세요",
    ],
    numbers: ["117", "112"],
  },
  {
    title: "우울하거나 힘들어요",
    emoji: "🌿",
    color: "emerald",
    steps: [
      "가족이나 친구 등 주변에 고민을 털어놓으세요",
      "1388 청소년 전화로 편하게 이야기하세요 (문자·카카오톡도 가능)",
      "학교 Wee센터에서 상담교사와 면담하세요",
      "지역 정신건강복지센터를 방문하세요",
      "심리 자가진단 앱(마음 콕, 디지털 마음정원)을 활용해 보세요",
    ],
    numbers: ["1388", "1577-0199"],
  },
];

const schoolSupport = [
  { title: "Wee 클래스 (학교 내)", desc: "학교 전문상담교사에게 직접 면담 요청. 평일 근무시간에 이용 가능합니다." },
  { title: "Wee 센터 (교육지원청)", desc: "학교 Wee 클래스에서 해결이 어려운 경우, 교육지원청 Wee 센터로 연계됩니다." },
  { title: "Wee 중앙지원센터", desc: "한국청소년정책연구원 운영. 대표번호 044-415-2157로 문의 가능합니다." },
  { title: "위기 대응 절차", desc: "자해 발견 시 교사가 초기 대응(차분히 대하고 응급처치) → 보호자 통보 → 전문기관 연계. 학생정신건강지원센터에서 교사용 자해·자살 대응 매뉴얼을 제공합니다." },
  { title: "신고 의무", desc: "교원은 아동학대·가정폭력·학교폭력·성범죄의 신고의무자입니다. 피해를 알게 되면 117 또는 112에 신고해야 합니다." },
];

const medicalSupport = [
  { title: "생명사랑위기대응센터", desc: "전국 75개 병원에 설치. 응급실 이송 후 집중치료와 재발 방지 프로그램을 제공합니다.", url: "https://www.spckorea.or.kr" },
  { title: "응급 지원비", desc: "교육청에서 응급 입원·진료비를 일부 보조하는 제도를 운영합니다.", url: "https://www.moe.go.kr" },
  { title: "정신건강복지센터 찾기", desc: "가까운 지역 정신건강복지센터에서 상담, 약물·심리치료를 받을 수 있습니다.", url: "https://www.mentalhealth.go.kr/portal/health/centerIntro.do" },
];

const digitalResources = [
  { title: "다 들어줄 개", desc: "교육부 지원 모바일 상담 앱. 카카오톡·문자로 24시간 익명 상담.", tag: "앱/카카오", url: "https://www.dadlg.kr" },
  { title: "마음 콕", desc: "보건복지부 심리검진 앱. 우울·불안·자기파괴 위험도를 자가 측정.", tag: "앱", url: "https://www.mentalhealth.go.kr/portal/selfCheck/selfCheckList.do" },
  { title: "마음검진 사이트", desc: "정신건강복지센터 운영 온라인 심리검진. 스마트폰 설문으로 간편하게 체크.", tag: "웹", url: "https://www.mentalhealth.go.kr" },
  { title: "사이버상담 (1388)", desc: "1:1 온라인 비공개 상담. 상담사가 정해진 시간 내 답변합니다.", tag: "웹", url: "https://www.cyber1388.kr" },
  { title: "카카오톡 채널 라임", desc: "생명의전화 카카오톡 채널을 통해 익명 상담이 가능합니다.", tag: "카카오", url: "https://pf.kakao.com/_xkAlxgC" },
];

interface RegionInfo {
  region: string;
  details: string[];
}

const regions: RegionInfo[] = [
  { region: "서울", details: [
    "서울학생통합콜센터 — 24시간 운영 (2026년 3월 개시)",
    "마음치유학교 — 위기 학생 전문 치료센터 설립 추진",
    "스쿨라인 1577-7018 — 교사 전용 상담 (월~금 09:00~18:00)",
    "2029년까지 전 학교 전문상담교사 배치 계획",
  ]},
  { region: "부산", details: [
    "부산교육청 산하 자살예방센터·정신건강센터",
    "부산멘탈프렌즈·버디 프로그램 등 지역 캠페인",
    "부산시정신건강센터 — 정신건강 강좌 + 위기 개입 서비스",
  ]},
  { region: "대구", details: [
    "대구자살예방센터 — 1577-0199·109 상담",
    "대구청년마음건강센터 — 청년 위기 상담 지원",
  ]},
  { region: "인천", details: [
    "인천정신건강복지센터 — 1577-0199·109 안내",
    "구·군 청소년상담센터 운영",
    "마음아카데미 — 교육 프로그램 제공",
  ]},
  { region: "광주·대전·울산 등", details: [
    "각 시도 정신건강복지센터 — 1577-0199·109 (대부분 24시간)",
    "지역맞춤형 상담·지원 프로그램 운영",
    "거주지 교육청 홈페이지에서 가까운 위기 상담처를 찾을 수 있습니다",
  ]},
];

const flowSteps = [
  { label: "위험하다고 느끼나요?", type: "question" as const },
  { label: "예, 긴급", type: "branch-a" as const, items: ["119(응급) 또는 112(경찰) 신고", "응급치료·경찰 조치", "안정화 후 지속 케어"] },
  { label: "아니오, 비응급", type: "branch-b" as const, items: ["상담전화 (109 · 1577-0199 · 1388)", "학교 상담 (상담교사/Wee) + 부모 상담", "지역 정신건강센터·의료기관 방문", "지속 케어"] },
];

/* ───────────────────── 컴포넌트 ───────────────────── */

function MethodBadge({ label }: { label: string }) {
  return (
    <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted">
      {label}
    </span>
  );
}

function PhoneLink({ number, className }: { number: string; className?: string }) {
  return (
    <a
      href={`tel:${number.replace(/-/g, "")}`}
      className={`font-mono font-bold hover:underline transition-colors ${className || "text-foreground"}`}
    >
      {number}
    </a>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </motion.section>
  );
}

function SituationCard({ s, index }: { s: SituationGuide; index: number }) {
  const [open, setOpen] = useState(false);

  const borderMap: Record<string, string> = {
    blue: "border-blue-500/30 hover:border-blue-500/50",
    amber: "border-amber-500/30 hover:border-amber-500/50",
    emerald: "border-emerald-500/30 hover:border-emerald-500/50",
  };
  const bgMap: Record<string, string> = {
    blue: "bg-blue-500/5",
    amber: "bg-amber-500/5",
    emerald: "bg-emerald-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${borderMap[s.color]} ${bgMap[s.color]} backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{s.emoji}</span>
            <span className="font-semibold">{s.title}</span>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted text-lg"
          >
            ▾
          </motion.span>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className={`mt-2 p-5 rounded-2xl border ${borderMap[s.color]} ${bgMap[s.color]} backdrop-blur-sm space-y-4`}>
              <ol className="space-y-2">
                {s.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-muted">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {s.numbers.map((n) => (
                  <a
                    key={n}
                    href={`tel:${n.replace(/-/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    📞 <span className="font-mono font-bold">{n}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-muted text-sm">
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────── 페이지 ───────────────────── */

export default function CrisisPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* 헤더 */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-6"
          >
            ← 홈으로
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">혼자가 아닙니다</h1>
            <p className="text-muted leading-relaxed">
              힘든 일이 있을 때, 도움을 요청하는 것은 용기 있는 행동입니다.<br className="hidden sm:block" />
              아래 자원들은 모두 <strong className="text-foreground">무료</strong>이며, <strong className="text-foreground">익명·비밀이 보장</strong>됩니다.
            </p>
          </motion.div>
        </div>

        {/* 긴급 전화 */}
        <Section title="🚨 지금 위험한 상황이라면">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyLines.map((line) => (
              <div
                key={line.number}
                className="flex items-center gap-4 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5"
              >
                <span className="text-3xl font-mono font-black text-rose-400">{line.number}</span>
                <div>
                  <div className="font-semibold text-sm">{line.name}</div>
                  <div className="text-xs text-muted">{line.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 상황별 행동 가이드 */}
        <Section title="지금 어떤 상황인가요?">
          <p className="text-sm text-muted -mt-2 mb-2">해당하는 카드를 눌러 단계별 행동 가이드를 확인하세요.</p>
          <div className="space-y-3">
            {situations.map((s, i) => (
              <SituationCard key={s.title} s={s} index={i} />
            ))}
          </div>
        </Section>

        {/* 24시간 상담 디렉토리 */}
        <Section title="24시간 상담 자원">
          <div className="space-y-3">
            {hotlines.map((h) => (
              <div
                key={h.number}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-lg font-mono font-bold text-muted/70">{h.number}</span>
                  <div className="flex-1">
                    {h.url ? (
                      <a href={h.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-primary hover:underline">
                        {h.name} →
                      </a>
                    ) : (
                      <span className="font-semibold text-sm">{h.name}</span>
                    )}
                    {h.org && <span className="text-xs text-muted ml-2">{h.org}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>{h.hours}</span>
                    <span className="text-white/10">|</span>
                    <span>{h.target}</span>
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed">{h.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {h.methods.map((m) => (
                    <MethodBadge key={m} label={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 학교 내 지원 체계 */}
        <Section title="학교 내 지원 체계">
          <div className="space-y-2">
            {schoolSupport.map((item) => (
              <div key={item.title} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="font-semibold text-sm mb-1">{item.title}</div>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 의료·응급 지원 */}
        <Section title="의료·응급 지원">
          <div className="space-y-2">
            {medicalSupport.map((item) => (
              <div key={item.title} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{item.title}</span>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                      🔗 바로가기
                    </a>
                  )}
                </div>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 온라인·디지털 자원 */}
        <Section title="온라인·디지털 자원">
          <div className="space-y-2">
            {digitalResources.map((item) => (
              <div key={item.title} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col sm:flex-row sm:items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{item.title}</span>
                    <MethodBadge label={item.tag} />
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                      바로 연결하기 →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 지역별 자원 */}
        <Section title="지역별 자원">
          <div className="space-y-2">
            {regions.map((r) => (
              <Accordion key={r.region} title={r.region}>
                <ul className="space-y-1.5">
                  {r.details.map((d, i) => (
                    <li key={i} className="text-sm text-muted leading-relaxed flex gap-2">
                      <span className="text-white/20 shrink-0">·</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </Accordion>
            ))}
          </div>
        </Section>

        {/* 위기대응 흐름도 */}
        <Section title="위기대응 흐름도">
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
            {/* 질문 */}
            <div className="text-center">
              <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 font-semibold text-sm">
                {flowSteps[0].label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 긴급 분기 */}
              <div className="space-y-2">
                <div className="text-center text-xs font-bold text-rose-400 uppercase tracking-wider">예, 긴급</div>
                <div className="space-y-2">
                  {flowSteps[1].items!.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="text-rose-500/40 text-xs">→</span>}
                      <span className="flex-1 text-sm px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 비응급 분기 */}
              <div className="space-y-2">
                <div className="text-center text-xs font-bold text-emerald-400 uppercase tracking-wider">아니오, 비응급</div>
                <div className="space-y-2">
                  {flowSteps[2].items!.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="text-emerald-500/40 text-xs">→</span>}
                      <span className="flex-1 text-sm px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 비밀보장 안내 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-sm text-muted leading-relaxed space-y-2"
        >
          <div className="font-semibold text-foreground">🔒 비밀보장 안내</div>
          <p>
            109 등 상담전화는 별도 동의 없이 개인정보를 수집하지 않으며, 내담자의 신원과 상담 내용을 비밀로 합니다.
            글·채팅 상담도 비공개로 처리됩니다.
          </p>
          <p>
            다만, 내담자나 타인의 생명에 즉각적 위협이 있을 경우 관련 법에 따라 응급조치나 신고가 이루어질 수 있습니다.
          </p>
        </motion.div>

        {/* 출처 */}
        <p className="text-xs text-muted/60 leading-relaxed">
          출처: 교육부·보건복지부 등 공공기관 웹사이트, 지역 교육청·정신건강복지센터 안내문,
          한국청소년상담복지개발원, 한국생명의전화 자료 (2026년 현재 기준)
        </p>
      </div>
    </div>
  );
}
