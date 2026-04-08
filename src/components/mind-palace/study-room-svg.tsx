"use client";

import { motion } from "framer-motion";

/**
 * 카툰 서재 SVG — 18개 클릭 가능한 객체 (= 18개 교과서 항목)
 *
 * 공간 배치:
 *   서쪽 벽(책장 5칸)  = 직업과 청렴의 윤리 (5항목)
 *   북쪽 벽(칠판 영역)  = 사회 정의와 윤리 (7항목)
 *   동쪽 벽(창문 영역)  = 국가와 시민의 윤리 (3항목)
 *   중앙(책상 영역)     = 정의론 종합 비교 (3항목)
 */

interface StudyRoomSVGProps {
  activeObjectId: string | null;
  onObjectClick: (objectId: string) => void;
  playingObjectId?: string | null;
}

// 영역별 색상 테마
const ZONE_COLORS: Record<string, { fill: string; active: string; stroke: string }> = {
  west: { fill: "#3b2d1e", active: "#f59e0b", stroke: "#a16207" },
  north: { fill: "#1e3a2d", active: "#10b981", stroke: "#047857" },
  east: { fill: "#1e2d3b", active: "#3b82f6", stroke: "#1d4ed8" },
  center: { fill: "#2d1e3b", active: "#a855f7", stroke: "#7c3aed" },
};

interface ObjectDef {
  id: string;
  zone: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  emoji: string;
}

const OBJECTS: ObjectDef[] = [
  // ── 서쪽 벽: 책장 5칸 ──
  { id: "shelf-1", zone: "west", label: "직업의 의미", x: 20, y: 60, w: 90, h: 52, emoji: "📖" },
  { id: "shelf-2", zone: "west", label: "전문직 윤리", x: 20, y: 118, w: 90, h: 52, emoji: "⚖️" },
  { id: "shelf-3", zone: "west", label: "노동의 의미", x: 20, y: 176, w: 90, h: 52, emoji: "🔨" },
  { id: "shelf-4", zone: "west", label: "시장경제 윤리", x: 20, y: 234, w: 90, h: 52, emoji: "💰" },
  { id: "shelf-5", zone: "west", label: "청렴과 부패", x: 20, y: 292, w: 90, h: 52, emoji: "🏛️" },

  // ── 북쪽 벽: 칠판 + 주변 ──
  { id: "board-main", zone: "north", label: "정의의 유형", x: 200, y: 30, w: 200, h: 90, emoji: "📋" },
  { id: "board-left", zone: "north", label: "교정적 정의", x: 140, y: 30, w: 54, h: 90, emoji: "🔍" },
  { id: "board-right", zone: "north", label: "우대 정책", x: 406, y: 30, w: 54, h: 90, emoji: "🤝" },
  { id: "globe", zone: "north", label: "롤스의 정의론", x: 150, y: 140, w: 60, h: 70, emoji: "🌍" },
  { id: "clock", zone: "north", label: "노직", x: 440, y: 40, w: 50, h: 50, emoji: "🕐" },
  { id: "frame", zone: "north", label: "왈처", x: 470, y: 110, w: 50, h: 60, emoji: "🖼️" },
  { id: "bookstack", zone: "north", label: "마르크스", x: 230, y: 140, w: 55, h: 50, emoji: "📚" },

  // ── 동쪽 벽: 창문 영역 ──
  { id: "window", zone: "east", label: "국가와 시민", x: 530, y: 40, w: 100, h: 120, emoji: "🪟" },
  { id: "plant", zone: "east", label: "시민 불복종", x: 540, y: 180, w: 50, h: 70, emoji: "🌿" },
  { id: "calendar", zone: "east", label: "민주주의·인권", x: 600, y: 180, w: 40, h: 55, emoji: "📅" },

  // ── 중앙: 책상 영역 ──
  { id: "laptop", zone: "center", label: "4대 정의론", x: 260, y: 240, w: 80, h: 55, emoji: "💻" },
  { id: "penholder", zone: "center", label: "시험 적용", x: 350, y: 250, w: 35, h: 45, emoji: "✏️" },
  { id: "mug", zone: "center", label: "동서양 비교", x: 395, y: 255, w: 35, h: 40, emoji: "☕" },
];

export function StudyRoomSVG({
  activeObjectId,
  onObjectClick,
  playingObjectId,
}: StudyRoomSVGProps) {
  return (
    <svg
      viewBox="0 0 660 380"
      className="w-full h-full"
      style={{ maxHeight: "65vh" }}
    >
      {/* ── 배경: 방 벽/바닥 ── */}
      <defs>
        <linearGradient id="wall-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1f3d" />
          <stop offset="100%" stopColor="#1a1428" />
        </linearGradient>
        <linearGradient id="floor-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2b1a" />
          <stop offset="100%" stopColor="#2a1d12" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 벽 */}
      <rect x="0" y="0" width="660" height="220" fill="url(#wall-grad)" />
      {/* 바닥 */}
      <rect x="0" y="220" width="660" height="160" fill="url(#floor-grad)" />
      {/* 바닥 경계선 */}
      <line x1="0" y1="220" x2="660" y2="220" stroke="#4a3728" strokeWidth="2" />

      {/* ── 서쪽 벽: 책장 프레임 ── */}
      <rect x="14" y="45" width="102" height="310" rx="4" fill="#2c1810" stroke="#5a3a20" strokeWidth="2" />
      {/* 선반 구분선 */}
      {[110, 168, 226, 284].map((y) => (
        <line key={y} x1="16" y1={y} x2="114" y2={y} stroke="#5a3a20" strokeWidth="1.5" />
      ))}

      {/* ── 북쪽 벽: 칠판 프레임 ── */}
      <rect x="130" y="20" width="340" height="110" rx="3" fill="#1a4030" stroke="#2d6b4f" strokeWidth="3" />
      {/* 칠판 분필 받침 */}
      <rect x="130" y="130" width="340" height="8" rx="2" fill="#5a3a20" />

      {/* ── 중앙: 책상 ── */}
      <rect x="220" y="225" width="230" height="80" rx="4" fill="#4a3020" stroke="#6b4a30" strokeWidth="2" />
      {/* 책상 다리 */}
      <rect x="235" y="305" width="8" height="50" fill="#5a3a20" />
      <rect x="428" y="305" width="8" height="50" fill="#5a3a20" />

      {/* ── 동쪽: 창문 프레임 ── */}
      <rect x="524" y="32" width="112" height="135" rx="3" fill="#1a2d3d" stroke="#3a5a7a" strokeWidth="2" />
      {/* 창 십자 */}
      <line x1="580" y1="32" x2="580" y2="167" stroke="#3a5a7a" strokeWidth="1.5" />
      <line x1="524" y1="100" x2="636" y2="100" stroke="#3a5a7a" strokeWidth="1.5" />

      {/* ── 객체 렌더링 (18개) ── */}
      {OBJECTS.map((obj) => {
        const isActive = activeObjectId === obj.id;
        const isPlaying = playingObjectId === obj.id;
        const colors = ZONE_COLORS[obj.zone];

        return (
          <g
            key={obj.id}
            onClick={() => onObjectClick(obj.id)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={obj.label}
          >
            {/* 하이라이트 글로우 */}
            {(isActive || isPlaying) && (
              <motion.rect
                x={obj.x - 4}
                y={obj.y - 4}
                width={obj.w + 8}
                height={obj.h + 8}
                rx={6}
                fill="none"
                stroke={colors.active}
                strokeWidth={isPlaying ? 3 : 2}
                filter="url(#glow)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* 객체 배경 */}
            <rect
              x={obj.x}
              y={obj.y}
              width={obj.w}
              height={obj.h}
              rx={4}
              fill={isActive || isPlaying ? colors.active + "30" : colors.fill + "60"}
              stroke={isActive || isPlaying ? colors.active : colors.fill}
              strokeWidth={1}
              className="transition-all duration-200"
            />

            {/* 이모지 */}
            <text
              x={obj.x + obj.w / 2}
              y={obj.y + obj.h / 2 - 6}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.min(obj.w, obj.h) * 0.35}
              className="select-none pointer-events-none"
            >
              {obj.emoji}
            </text>

            {/* 라벨 */}
            <text
              x={obj.x + obj.w / 2}
              y={obj.y + obj.h - 8}
              textAnchor="middle"
              fill={isActive || isPlaying ? "#fff" : "#aaa"}
              fontSize="8"
              fontWeight={isActive ? "bold" : "normal"}
              className="select-none pointer-events-none"
            >
              {obj.label}
            </text>
          </g>
        );
      })}

      {/* ── 영역 라벨 ── */}
      <text x="66" y="42" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" opacity="0.7">
        직업과 청렴
      </text>
      <text x="300" y="16" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold" opacity="0.7">
        사회 정의와 윤리
      </text>
      <text x="580" y="28" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold" opacity="0.7">
        국가와 시민
      </text>
      <text x="335" y="220" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold" opacity="0.7">
        정의론 종합 비교
      </text>
    </svg>
  );
}

export { OBJECTS };
export type { ObjectDef };
