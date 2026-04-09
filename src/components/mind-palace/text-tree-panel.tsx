"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type {
  NoteNode,
  StructuredSection,
} from "@/lib/data/textbooks/structured/ethics-structured-index";
import type { FlatNarratorItem } from "@/lib/mind-palace/flatten-nodes";

/**
 * 구조화 텍스트 트리 패널
 *
 * - 나레이터 진행에 따라 텍스트가 progressive reveal됨
 * - 현재 읽고 있는 항목은 font-size 16px + 하이라이트
 * - 이미 읽은 항목은 보이지만 dimmed
 * - 아직 안 읽은 항목은 숨김 (또는 매우 흐림)
 */

interface TextTreePanelProps {
  sections: StructuredSection[];
  flatItems: FlatNarratorItem[];
  currentIndex: number; // 나레이터 현재 위치 (-1 = 미시작)
  revealedUpTo: number; // 여기까지 reveal됨
  onItemClick?: (globalIndex: number) => void;
}

// 섹션별 색상
const SECTION_COLORS: Record<string, { border: string; bg: string; text: string; accent: string }> = {
  ch3_s1: { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-400", accent: "bg-amber-400" },
  ch3_s2: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", accent: "bg-emerald-400" },
  ch3_s3: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", accent: "bg-blue-400" },
  ch3_s4: { border: "border-purple-500/30", bg: "bg-purple-500/5", text: "text-purple-400", accent: "bg-purple-400" },
};

function getColors(sectionId: string) {
  return SECTION_COLORS[sectionId] ?? SECTION_COLORS.ch3_s1;
}

export function TextTreePanel({
  sections,
  flatItems,
  currentIndex,
  revealedUpTo,
  onItemClick,
}: TextTreePanelProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  // 현재 항목으로 자동 스크롤
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  // flatItems에서 globalIndex 찾기용 카운터
  let globalCounter = 0;

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const colors = getColors(section.id);
        return (
          <div
            key={section.id}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}
          >
            {/* 섹션 헤더 */}
            <h3 className={`font-bold text-base mb-1 ${colors.text}`}>
              {section.title}
            </h3>
            <p className="text-xs text-white/40 mb-4">{section.summary}</p>

            {/* 노트별 */}
            <div className="space-y-4">
              {section.notes.map((note) => (
                <div key={note.id} className="space-y-1">
                  {/* 노트 라벨 */}
                  <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2 mb-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${colors.accent}`}
                    />
                    {note.label}
                  </h4>

                  {/* 노드 트리 */}
                  <div className="pl-3 border-l border-white/10">
                    {note.nodes.map((node, nodeIdx) => {
                      const rendered = renderNode(
                        node,
                        0,
                        globalCounter,
                        currentIndex,
                        revealedUpTo,
                        colors,
                        activeRef,
                        onItemClick
                      );
                      globalCounter = rendered.nextCounter;
                      return (
                        <div key={nodeIdx}>{rendered.element}</div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface RenderResult {
  element: React.ReactNode;
  nextCounter: number;
}

function renderNode(
  node: NoteNode,
  depth: number,
  counter: number,
  currentIndex: number,
  revealedUpTo: number,
  colors: { accent: string },
  activeRef: React.RefObject<HTMLDivElement | null>,
  onItemClick?: (globalIndex: number) => void
): RenderResult {
  const myIndex = counter;
  counter++;

  const isCurrent = myIndex === currentIndex;
  const isRevealed = myIndex <= revealedUpTo;
  const isNotStarted = currentIndex === -1; // 나레이터 미시작 → 전체 보임

  // 노드 children 렌더
  const childElements: React.ReactNode[] = [];
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const result = renderNode(
        node.children[i],
        depth + 1,
        counter,
        currentIndex,
        revealedUpTo,
        colors,
        activeRef,
        onItemClick
      );
      childElements.push(
        <div key={i}>{result.element}</div>
      );
      counter = result.nextCounter;
    }
  }

  const visible = isNotStarted || isRevealed || isCurrent;

  const element = (
    <div
      ref={isCurrent ? activeRef : undefined}
      className={`transition-all duration-300 ${
        depth > 0 ? "pl-4 border-l border-white/5" : ""
      }`}
      style={{ marginTop: depth === 0 ? 6 : 2 }}
    >
      {/* 텍스트 노드 */}
      <div
        onClick={() => onItemClick?.(myIndex)}
        className={`
          rounded-lg px-3 py-1.5 cursor-pointer transition-all duration-300
          ${
            isCurrent
              ? "bg-white/15 border border-white/30 shadow-lg shadow-white/5"
              : isRevealed
              ? "bg-white/[0.03] hover:bg-white/[0.06]"
              : isNotStarted
              ? "hover:bg-white/[0.04]"
              : "opacity-0 pointer-events-none h-0 py-0 overflow-hidden"
          }
        `}
      >
        {visible && (
          <motion.p
            initial={isCurrent ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`
              leading-relaxed
              ${
                isCurrent
                  ? "text-white font-semibold"
                  : isRevealed
                  ? "text-white/70"
                  : "text-white/50"
              }
              ${node.children ? "font-medium" : ""}
            `}
            style={{
              fontSize: isCurrent ? 16 : depth === 0 ? 14 : 13,
            }}
          >
            {isCurrent && (
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse align-middle" />
            )}
            {node.text}
          </motion.p>
        )}
      </div>

      {/* Children */}
      {childElements.length > 0 && <div>{childElements}</div>}
    </div>
  );

  return { element, nextCounter: counter };
}
