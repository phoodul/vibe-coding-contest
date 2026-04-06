"use client";

import { motion } from "framer-motion";

interface DnaDiagramProps {
  className?: string;
}

export function DnaDiagram({ className = "" }: DnaDiagramProps) {
  // Generate double helix points
  const steps = 20;
  const height = 400;
  const centerX = 200;
  const amplitude = 60;

  const basePairs: { x1: number; y1: number; x2: number; y2: number; label: string; color: string }[] = [];

  for (let i = 0; i < steps; i++) {
    const y = 40 + (i / steps) * (height - 80);
    const phase = (i / steps) * Math.PI * 3;
    const x1 = centerX + amplitude * Math.sin(phase);
    const x2 = centerX - amplitude * Math.sin(phase);
    const pairs = ["A-T", "G-C", "T-A", "C-G"];
    const colors = ["#EF5350", "#42A5F5", "#EF5350", "#42A5F5"];
    basePairs.push({
      x1, y1: y, x2, y2: y,
      label: pairs[i % 4],
      color: colors[i % 4],
    });
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg viewBox="0 0 400 440" className="w-full max-w-md mx-auto" style={{ minHeight: 280 }}>
        {/* Base pair rungs */}
        {basePairs.map((bp, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * i }}
          >
            <line x1={bp.x1} y1={bp.y1} x2={bp.x2} y2={bp.y2} stroke={bp.color} strokeWidth={2} strokeOpacity={0.4} />
            {/* Base pair label */}
            {i % 3 === 0 && (
              <text x={centerX} y={bp.y1 - 3} textAnchor="middle" fill={bp.color} fontSize={7} fontWeight={500}>
                {bp.label}
              </text>
            )}
          </motion.g>
        ))}

        {/* Strand 1 (sugar-phosphate backbone) */}
        <motion.path
          d={basePairs.map((bp, i) => `${i === 0 ? "M" : "L"}${bp.x1},${bp.y1}`).join(" ")}
          fill="none" stroke="#8E24AA" strokeWidth={3} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />

        {/* Strand 2 (sugar-phosphate backbone) */}
        <motion.path
          d={basePairs.map((bp, i) => `${i === 0 ? "M" : "L"}${bp.x2},${bp.y2}`).join(" ")}
          fill="none" stroke="#00ACC1" strokeWidth={3} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        />

        {/* Nucleotide dots on strands */}
        {basePairs.map((bp, i) => (
          <motion.g key={`dots-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.03 }}>
            <circle cx={bp.x1} cy={bp.y1} r={4} fill="#8E24AA" />
            <circle cx={bp.x2} cy={bp.y2} r={4} fill="#00ACC1" />
          </motion.g>
        ))}

        {/* Labels */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          {/* 5' 3' direction */}
          <text x={basePairs[0].x1 + 15} y={basePairs[0].y1 - 5} fill="#8E24AA" fontSize={10} fontWeight={700}>5&apos;</text>
          <text x={basePairs[basePairs.length - 1].x1 + 15} y={basePairs[basePairs.length - 1].y1 + 12} fill="#8E24AA" fontSize={10} fontWeight={700}>3&apos;</text>
          <text x={basePairs[0].x2 - 22} y={basePairs[0].y2 - 5} fill="#00ACC1" fontSize={10} fontWeight={700}>3&apos;</text>
          <text x={basePairs[basePairs.length - 1].x2 - 22} y={basePairs[basePairs.length - 1].y2 + 12} fill="#00ACC1" fontSize={10} fontWeight={700}>5&apos;</text>

          {/* Legend */}
          <rect x={300} y={60} width={8} height={8} fill="#8E24AA" rx={2} />
          <text x={312} y={68} fill="#8E24AA" fontSize={8}>당-인산 골격</text>
          <rect x={300} y={80} width={8} height={8} fill="#EF5350" rx={2} />
          <text x={312} y={88} fill="white" fontSize={8} fillOpacity={0.7}>A-T 염기쌍</text>
          <rect x={300} y={100} width={8} height={8} fill="#42A5F5" rx={2} />
          <text x={312} y={108} fill="white" fontSize={8} fillOpacity={0.7}>G-C 염기쌍</text>
        </motion.g>

        {/* Title */}
        <text x={200} y={430} textAnchor="middle" fill="white" fontSize={13} fontWeight={700}>DNA 이중 나선 구조</text>
      </svg>
    </div>
  );
}
