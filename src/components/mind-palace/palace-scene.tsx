"use client";

import { motion } from "framer-motion";
import type { StructuredSection } from "@/lib/data/textbooks/structured/ethics-structured-index";

/**
 * Mind Palace 씬 — 서재 투시도 SVG
 *
 * structured text의 섹션 수에 따라 영역(zone) 배치
 * 각 영역 내 note 수에 따라 오브젝트 배치
 */

interface PalaceSceneProps {
  sections: StructuredSection[];
  activeNoteId: string | null;
  activeSectionId: string | null;
  onNoteClick: (noteId: string) => void;
}

// 영역별 색상
const ZONE_THEME = [
  { fill: "#2a1f1a", active: "#f59e0b", glow: "#f59e0b40", label: "#f59e0b" },
  { fill: "#1a2a1f", active: "#10b981", glow: "#10b98140", label: "#10b981" },
  { fill: "#1a1f2a", active: "#3b82f6", glow: "#3b82f640", label: "#3b82f6" },
  { fill: "#2a1a2a", active: "#a855f7", glow: "#a855f740", label: "#a855f7" },
];

// 오브젝트 이모지 풀 (중복 방지)
const OBJECT_ICONS = [
  ["📖", "⚖️", "🔨", "💰", "🏛️", "📜", "🪙"],
  ["📋", "🌍", "🔍", "📚", "🕐", "🖼️", "🤝"],
  ["🪟", "🌿", "📅", "🗳️", "🔔"],
  ["💻", "✏️", "☕", "🗂️", "📐"],
];

interface ZoneLayout {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// 4-zone 기본 레이아웃 (서재 투시도)
const ZONE_LAYOUTS: ZoneLayout[] = [
  { label: "", x: 10, y: 35, w: 120, h: 310 },   // 좌측 벽 (책장)
  { label: "", x: 140, y: 10, w: 340, h: 130 },   // 정면 벽 (칠판/액자)
  { label: "", x: 500, y: 35, w: 130, h: 200 },   // 우측 벽 (창문)
  { label: "", x: 200, y: 210, w: 280, h: 130 },   // 바닥 (책상)
];

function getObjectPositions(
  zone: ZoneLayout,
  count: number
): { x: number; y: number; w: number; h: number }[] {
  const positions: { x: number; y: number; w: number; h: number }[] = [];
  const pad = 6;

  if (zone.h > zone.w) {
    // 세로 배치 (좌/우 벽)
    const itemH = (zone.h - pad * (count + 1)) / count;
    for (let i = 0; i < count; i++) {
      positions.push({
        x: zone.x + pad,
        y: zone.y + pad + i * (itemH + pad),
        w: zone.w - pad * 2,
        h: itemH,
      });
    }
  } else if (count <= 4) {
    // 가로 배치
    const itemW = (zone.w - pad * (count + 1)) / count;
    for (let i = 0; i < count; i++) {
      positions.push({
        x: zone.x + pad + i * (itemW + pad),
        y: zone.y + pad,
        w: itemW,
        h: zone.h - pad * 2,
      });
    }
  } else {
    // 2행 배치 (5개 이상)
    const rows = 2;
    const perRow = Math.ceil(count / rows);
    const itemW = (zone.w - pad * (perRow + 1)) / perRow;
    const itemH = (zone.h - pad * (rows + 1)) / rows;
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      positions.push({
        x: zone.x + pad + col * (itemW + pad),
        y: zone.y + pad + row * (itemH + pad),
        w: itemW,
        h: itemH,
      });
    }
  }

  return positions;
}

export function PalaceScene({
  sections,
  activeNoteId,
  activeSectionId,
  onNoteClick,
}: PalaceSceneProps) {
  return (
    <svg viewBox="0 0 650 370" className="w-full h-full" style={{ maxHeight: "55vh" }}>
      <defs>
        <linearGradient id="mp-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1f3d" />
          <stop offset="100%" stopColor="#1a1428" />
        </linearGradient>
        <linearGradient id="mp-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2b1a" />
          <stop offset="100%" stopColor="#2a1d12" />
        </linearGradient>
        <filter id="mp-glow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 벽 */}
      <rect x="0" y="0" width="650" height="200" fill="url(#mp-wall)" />
      {/* 바닥 */}
      <rect x="0" y="200" width="650" height="170" fill="url(#mp-floor)" />
      <line x1="0" y1="200" x2="650" y2="200" stroke="#4a3728" strokeWidth="2" />

      {/* 좌측 책장 프레임 */}
      <rect x="6" y="28" width="128" height="322" rx="4" fill="#2c1810" stroke="#5a3a20" strokeWidth="2" />
      {/* 정면 벽 프레임 (칠판) */}
      <rect x="134" y="4" width="348" height="138" rx="3" fill="#1a4030" stroke="#2d6b4f" strokeWidth="2.5" />
      {/* 우측 창문 프레임 */}
      <rect x="494" y="28" width="140" height="210" rx="3" fill="#1a2d3d" stroke="#3a5a7a" strokeWidth="2" />
      <line x1="564" y1="28" x2="564" y2="238" stroke="#3a5a7a" strokeWidth="1" />
      <line x1="494" y1="133" x2="634" y2="133" stroke="#3a5a7a" strokeWidth="1" />
      {/* 책상 */}
      <rect x="194" y="205" width="290" height="138" rx="4" fill="#4a3020" stroke="#6b4a30" strokeWidth="2" />
      <rect x="210" y="343" width="8" height="26" fill="#5a3a20" />
      <rect x="468" y="343" width="8" height="26" fill="#5a3a20" />

      {/* 영역 및 오브젝트 렌더링 */}
      {sections.map((section, sIdx) => {
        const zoneIdx = Math.min(sIdx, ZONE_LAYOUTS.length - 1);
        const zone = ZONE_LAYOUTS[zoneIdx];
        const theme = ZONE_THEME[zoneIdx];
        const icons = OBJECT_ICONS[zoneIdx] ?? OBJECT_ICONS[0];
        const positions = getObjectPositions(zone, section.notes.length);
        const isSectionActive = activeSectionId === section.id;

        return (
          <g key={section.id}>
            {/* 영역 라벨 */}
            <text
              x={zone.x + zone.w / 2}
              y={zone.y - 4}
              textAnchor="middle"
              fill={theme.label}
              fontSize="9"
              fontWeight="bold"
              opacity="0.7"
            >
              {section.title}
            </text>

            {/* 영역 활성 글로우 */}
            {isSectionActive && (
              <motion.rect
                x={zone.x - 2}
                y={zone.y - 2}
                width={zone.w + 4}
                height={zone.h + 4}
                rx={6}
                fill="none"
                stroke={theme.active}
                strokeWidth={1.5}
                opacity={0.3}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* 오브젝트 */}
            {section.notes.map((note, nIdx) => {
              const pos = positions[nIdx];
              if (!pos) return null;
              const isActive = activeNoteId === note.id;
              const icon = icons[nIdx % icons.length];

              return (
                <g
                  key={note.id}
                  onClick={() => onNoteClick(note.id)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={note.label}
                >
                  {/* 활성 글로우 */}
                  {isActive && (
                    <motion.rect
                      x={pos.x - 3}
                      y={pos.y - 3}
                      width={pos.w + 6}
                      height={pos.h + 6}
                      rx={6}
                      fill="none"
                      stroke={theme.active}
                      strokeWidth={2.5}
                      filter="url(#mp-glow)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}

                  {/* 오브젝트 배경 */}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.w}
                    height={pos.h}
                    rx={4}
                    fill={isActive ? theme.active + "30" : theme.fill + "80"}
                    stroke={isActive ? theme.active : theme.fill}
                    strokeWidth={isActive ? 1.5 : 0.8}
                    className="transition-all duration-200"
                  />

                  {/* 이모지 */}
                  <text
                    x={pos.x + pos.w / 2}
                    y={pos.y + pos.h / 2 - 5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={Math.min(pos.w, pos.h) * 0.3}
                    className="select-none pointer-events-none"
                  >
                    {icon}
                  </text>

                  {/* 라벨 */}
                  <text
                    x={pos.x + pos.w / 2}
                    y={pos.y + pos.h - 6}
                    textAnchor="middle"
                    fill={isActive ? "#fff" : "#999"}
                    fontSize={Math.min(8, pos.w / note.label.length * 1.3)}
                    fontWeight={isActive ? "bold" : "normal"}
                    className="select-none pointer-events-none"
                  >
                    {note.label.length > 10
                      ? note.label.slice(0, 9) + "…"
                      : note.label}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
