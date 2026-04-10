"use client";

import { useMemo } from "react";
import Link from "next/link";
import { buildMindMapTree } from "@/lib/mind-map/build-tree";
import { MindMapCanvas } from "@/components/mind-map/mind-map-canvas";

export default function MindMapPage() {
  const tree = useMemo(() => buildMindMapTree(), []);

  return (
    <div className="h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f1628] to-[#0a0a1a] text-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="border-b border-white/10 px-4 py-2.5 bg-[#0a0a1a]/90 backdrop-blur-xl z-30 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <span className="text-white/30 text-xs">
              {tree.label} · 교과서 전체 구조
            </span>
          </div>
          <div className="text-white/30 text-xs">
            스크롤로 확대/축소 · 드래그로 이동 · 클릭으로 확장
          </div>
        </div>
      </header>

      {/* 캔버스 */}
      <main className="flex-1 overflow-hidden">
        <MindMapCanvas root={tree} />
      </main>
    </div>
  );
}
