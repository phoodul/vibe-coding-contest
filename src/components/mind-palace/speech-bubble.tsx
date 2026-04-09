"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import type {
  NoteNode,
  StructuredNote,
} from "@/lib/data/textbooks/structured/ethics-structured-index";

interface SpeechBubbleProps {
  note: StructuredNote;
  anchorX: number;
  anchorY: number;
  sceneWidth: number;
  sceneHeight: number;
  onClose: () => void;
}

// ── 상수 ──
const BUBBLE_W = 340;
const BUBBLE_MAX_H = 360;
const BUBBLE_OFFSET = 24; // anchor로부터의 최소 간격
const BUBBLE_PAD = 20;

/**
 * SpeechBubble — Mind Palace 씬 위에 절대 위치로 렌더되는 말풍선 오버레이
 *
 * - 클릭한 오브젝트 위치를 기준으로 좌/우 자동 배치
 * - 애니메이션 dash 연결선
 * - 노드 트리 재귀 렌더링
 */
export function SpeechBubble({
  note,
  anchorX,
  anchorY,
  sceneWidth,
  sceneHeight,
  onClose,
}: SpeechBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  // ── 버블 위치 계산 ──
  const { bubbleX, bubbleY, lineEndX, lineEndY } = useMemo(() => {
    const onLeftHalf = anchorX < sceneWidth / 2;

    // X: 오브젝트 좌측이면 오른쪽에, 오른쪽이면 왼쪽에 배치
    let bx = onLeftHalf
      ? anchorX + BUBBLE_OFFSET
      : anchorX - BUBBLE_W - BUBBLE_OFFSET;

    // 화면 밖으로 나가지 않도록 클램프
    bx = Math.max(8, Math.min(bx, sceneWidth - BUBBLE_W - 8));

    // Y: anchor 중심 기준, 화면 밖 방지
    let by = anchorY - 60;
    by = Math.max(8, Math.min(by, sceneHeight - BUBBLE_MAX_H - 8));

    // 연결선 끝점 (버블 가장자리)
    const lx = onLeftHalf ? bx : bx + BUBBLE_W;
    const ly = Math.min(Math.max(anchorY, by + 20), by + BUBBLE_MAX_H - 20);

    return { bubbleX: bx, bubbleY: by, lineEndX: lx, lineEndY: ly };
  }, [anchorX, anchorY, sceneWidth, sceneHeight]);

  // ── 외부 클릭으로 닫기 ──
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        bubbleRef.current &&
        !bubbleRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    },
    [onClose],
  );

  // ── ESC 키로 닫기 ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* 전체 오버레이 (외부 클릭 감지) */}
      <motion.div
        className="absolute inset-0"
        style={{ zIndex: 9999 }}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* ── 연결선 (SVG) ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          <motion.line
            x1={anchorX}
            y1={anchorY}
            x2={lineEndX}
            y2={lineEndY}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          {/* anchor 쪽 작은 원 */}
          <motion.circle
            cx={anchorX}
            cy={anchorY}
            r={4}
            fill="rgba(255,255,255,0.5)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          />
        </svg>

        {/* ── 말풍선 본체 ── */}
        <motion.div
          ref={bubbleRef}
          className="absolute rounded-2xl border border-white/20 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-2xl shadow-black/40"
          style={{
            left: bubbleX,
            top: bubbleY,
            width: BUBBLE_W,
            maxHeight: BUBBLE_MAX_H,
            zIndex: 10000,
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between px-5 pt-4 pb-2">
            <h3 className="text-white font-semibold text-[15px] leading-snug pr-4">
              {note.label}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors text-xs"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {/* 콘텐츠 (스크롤) */}
          <div
            className="px-5 pb-4 overflow-y-auto custom-scrollbar"
            style={{ maxHeight: BUBBLE_MAX_H - 56, fontSize: 16 }}
          >
            <div className="space-y-1">
              {note.nodes.map((node, idx) => (
                <NodeRenderer key={idx} node={node} depth={0} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ── 재귀 노드 렌더러 ──

function NodeRenderer({ node, depth }: { node: NoteNode; depth: number }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      className={depth > 0 ? "ml-3 border-l border-white/10 pl-3" : ""}
      style={{ marginTop: depth === 0 ? 6 : 3 }}
    >
      <p
        className={`leading-relaxed text-white/90 ${
          hasChildren ? "font-semibold" : "font-normal"
        } ${depth === 0 ? "text-[16px]" : "text-[15px]"}`}
      >
        {node.text}
      </p>
      {hasChildren &&
        node.children!.map((child, idx) => (
          <NodeRenderer key={idx} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}
