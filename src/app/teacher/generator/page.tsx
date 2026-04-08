"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";

const steps = [
  {
    step: "01",
    title: "문서 업로드",
    desc: "공문서 파일을 업로드합니다. HWP, DOCX, PDF 등 모든 형식을 지원합니다. 업로드 시 SHA-256 해시가 자동 생성되며, 공유 대상과 승인자를 지정할 수 있습니다.",
    icon: "📎",
    href: "/teacher/documents/upload",
    action: "업로드하기",
  },
  {
    step: "02",
    title: "검토 및 승인",
    desc: "승인 권한자(교장, 부장)가 문서를 검토한 후 승인 버튼을 누릅니다. 수정이 필요하면 수정 요청과 사유를 보냅니다.",
    icon: "✅",
    href: "/teacher/documents",
    action: "문서 목록 보기",
  },
  {
    step: "03",
    title: "공문번호 발급",
    desc: "승인된 문서에 고유한 공문서 발급 번호가 자동으로 부여됩니다. 번호는 원자적(atomic)으로 생성되어 중복이 불가능합니다.",
    icon: "🔢",
    href: "/teacher/documents",
    action: "발급 현황 확인",
  },
  {
    step: "04",
    title: "위변조 검증",
    desc: "나중에 문서 파일을 업로드하면 원본 해시와 비교하여 변경 여부를 즉시 확인합니다. 버전 이력으로 변경 시점도 추적 가능합니다.",
    icon: "🔍",
    href: "/teacher/documents/verify",
    action: "검증하기",
  },
];

export default function GeneratorPage() {
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
          <h1 className="text-3xl font-bold mb-2">
            &#128290; 공문번호 자동생성기
          </h1>
          <p className="text-muted mb-10">
            문서 업로드 &rarr; 승인 &rarr; 번호 발급 &rarr; 위변조 검증까지
            원스톱으로 처리합니다.
          </p>
        </motion.div>

        {/* 워크플로우 */}
        <div className="space-y-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              <GlassCard hover={false} className="card-sheen">
                <div className="flex items-start gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl">{s.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary font-medium">
                        STEP {s.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-muted leading-relaxed mb-3">
                      {s.desc}
                    </p>
                    <Link
                      href={s.href}
                      className="inline-block px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      {s.action} &rarr;
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* 빠른 액션 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <Link
            href="/teacher/documents/upload"
            className="btn-glow px-6 py-4 rounded-xl bg-primary text-primary-foreground font-medium text-center hover:scale-105 transition-all active:scale-[0.97]"
          >
            &#128195; 새 문서 업로드
          </Link>
          <Link
            href="/teacher/documents"
            className="px-6 py-4 rounded-xl glass text-center font-medium hover:bg-white/10 transition-all"
          >
            &#128203; 문서 관리
          </Link>
          <Link
            href="/teacher/documents/verify"
            className="px-6 py-4 rounded-xl glass text-center font-medium hover:bg-white/10 transition-all"
          >
            &#128269; 위변조 검증
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
