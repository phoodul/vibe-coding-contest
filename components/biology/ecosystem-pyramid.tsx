"use client";

import { motion } from "framer-motion";

interface EcosystemPyramidProps {
  className?: string;
}

export function EcosystemPyramid({ className = "" }: EcosystemPyramidProps) {
  const levels = [
    { label: "3차 소비자", example: "매, 독수리", energy: "10 kcal", color: "#E53935", width: 100, emoji: "🦅" },
    { label: "2차 소비자", example: "뱀, 개구리", energy: "100 kcal", color: "#FB8C00", width: 180, emoji: "🐍" },
    { label: "1차 소비자", example: "메뚜기, 토끼", energy: "1,000 kcal", color: "#FDD835", width: 260, emoji: "🐰" },
    { label: "생산자", example: "풀, 나무", energy: "10,000 kcal", color: "#43A047", width: 340, emoji: "🌿" },
  ];

  const baseY = 280;
  const levelHeight = 55;
  const centerX = 250;

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg viewBox="0 0 500 380" className="w-full max-w-lg mx-auto" style={{ minHeight: 260 }}>
        {/* Pyramid levels */}
        {levels.map((level, i) => {
          const y = baseY - (levels.length - i) * levelHeight;
          const halfW = level.width / 2;

          return (
            <motion.g
              key={level.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (levels.length - i) * 0.15, duration: 0.4 }}
            >
              {/* Level trapezoid */}
              <path
                d={`M${centerX - halfW} ${y + levelHeight} L${centerX - halfW + 20} ${y} L${centerX + halfW - 20} ${y} L${centerX + halfW} ${y + levelHeight} Z`}
                fill={level.color}
                fillOpacity={0.15}
                stroke={level.color}
                strokeWidth={1.5}
              />

              {/* Emoji */}
              <text x={centerX - halfW + 30} y={y + levelHeight / 2 + 5} fontSize={18}>
                {level.emoji}
              </text>

              {/* Label */}
              <text x={centerX} y={y + levelHeight / 2} textAnchor="middle" fill="white" fontSize={11} fontWeight={600}>
                {level.label}
              </text>
              <text x={centerX} y={y + levelHeight / 2 + 14} textAnchor="middle" fill="white" fontSize={8} fillOpacity={0.6}>
                {level.example}
              </text>

              {/* Energy label (right side) */}
              <text x={centerX + halfW + 10} y={y + levelHeight / 2 + 5} fill={level.color} fontSize={9} fontWeight={500}>
                {level.energy}
              </text>
            </motion.g>
          );
        })}

        {/* Energy flow arrow (right) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <text x={410} y={110} fill="#FFC107" fontSize={8} fontWeight={600}>에너지</text>
          <text x={420} y={122} fill="#FFC107" fontSize={7} fillOpacity={0.7}>약 10%</text>
          <text x={420} y={134} fill="#FFC107" fontSize={7} fillOpacity={0.7}>전달</text>
          <line x1={430} y1={260} x2={430} y2={150} stroke="#FFC107" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#pyrArrow)" />
          <defs>
            <marker id="pyrArrow" markerWidth={8} markerHeight={6} refX={4} refY={3} orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#FFC107" />
            </marker>
          </defs>
        </motion.g>

        {/* Decomposer (side) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <circle cx={60} cy={220} r={22} fill="#8D6E63" fillOpacity={0.15} stroke="#A1887F" strokeWidth={1.5} />
          <text x={60} y={218} textAnchor="middle" fontSize={14}>🍄</text>
          <text x={60} y={232} textAnchor="middle" fill="#A1887F" fontSize={7}>분해자</text>
          {/* Arrows from each level to decomposer */}
          {[160, 215, 270].map((y, i) => (
            <line key={i} x1={centerX - levels[i + 1].width / 2} y1={y} x2={82} y2={220} stroke="#A1887F" strokeWidth={0.8} strokeDasharray="3 3" strokeOpacity={0.4} />
          ))}
        </motion.g>

        {/* Sun (energy source) */}
        <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: "spring" }}>
          <circle cx={60} cy={320} r={18} fill="#FFC107" fillOpacity={0.2} stroke="#FFC107" strokeWidth={1.5} />
          <text x={60} y={324} textAnchor="middle" fontSize={16}>☀️</text>
          <text x={60} y={348} textAnchor="middle" fill="#FFC107" fontSize={8}>태양 에너지</text>
          <line x1={78} y1={310} x2={centerX - 170} y2={290} stroke="#FFC107" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.5} />
        </motion.g>

        {/* Title */}
        <text x={250} y={25} textAnchor="middle" fill="white" fontSize={13} fontWeight={700}>생태 피라미드 (에너지)</text>
      </svg>
    </div>
  );
}
