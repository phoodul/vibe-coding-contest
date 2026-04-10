"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildMindMapTree, type SubjectKey } from "@/lib/mind-map/build-tree";
import { MindMapCanvas } from "@/components/mind-map/mind-map-canvas";

const SUBJECTS: { key: SubjectKey; label: string; icon: string }[] = [
  { key: "ethics", label: "생활과 윤리", icon: "⚖️" },
  { key: "biology", label: "생명과학Ⅰ", icon: "🧬" },
  { key: "korean", label: "언어와 매체", icon: "📖" },
  { key: "life", label: "생윤", icon: "📑" },
];

export default function MindMapPage() {
  const [subject, setSubject] = useState<SubjectKey>("ethics");
  const tree = useMemo(() => buildMindMapTree(subject), [subject]);

  return (
    <div className="h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f1628] to-[#0a0a1a] text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="border-b border-white/10 px-4 py-2.5 bg-[#0a0a1a]/90 backdrop-blur-xl z-30 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center gap-2 sm:gap-4 justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard"
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              ← 대시보드
            </Link>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span className="text-amber-400">🧠</span>
              마인드 맵
            </h1>
          </div>
          {/* 교과목 탭 — 모바일에서 별도 줄 */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 order-last sm:order-none w-full sm:w-auto">
            {SUBJECTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSubject(s.key)}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  subject === s.key
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          <div className="text-white/30 text-xs hidden sm:block">
            클릭으로 확장 · 상단 경로로 이동
          </div>
        </div>
      </header>

      {/* 캔버스 */}
      <main className="flex-1 overflow-hidden">
        <MindMapCanvas key={subject} root={tree} />
      </main>
    </div>
  );
}
