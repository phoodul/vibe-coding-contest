"use client";

import { motion } from "framer-motion";

interface NeuronDiagramProps {
  className?: string;
}

export function NeuronDiagram({ className = "" }: NeuronDiagramProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg viewBox="0 0 700 300" className="w-full max-w-2xl mx-auto" style={{ minHeight: 200 }}>
        {/* Cell body (soma) */}
        <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <ellipse cx={180} cy={150} rx={55} ry={50} fill="#7E57C2" fillOpacity={0.2} stroke="#B39DDB" strokeWidth={2.5} />
          {/* Nucleus */}
          <circle cx={180} cy={150} r={18} fill="#9575CD" fillOpacity={0.3} stroke="#9575CD" strokeWidth={1.5} />
          <text x={180} y={154} textAnchor="middle" fill="#CE93D8" fontSize={8} fontWeight={600}>핵</text>
          <text x={180} y={215} textAnchor="middle" fill="#B39DDB" fontSize={10} fontWeight={600}>신경세포체</text>
        </motion.g>

        {/* Dendrites (left side) */}
        <motion.g initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          {[
            "M125 130 Q90 100 60 80 Q40 68 25 65",
            "M125 140 Q85 130 55 120 Q35 114 15 115",
            "M125 150 Q80 150 50 150 Q30 150 10 148",
            "M125 160 Q85 170 55 180 Q35 186 15 185",
            "M125 170 Q90 200 60 220 Q40 232 25 235",
          ].map((d, i) => (
            <motion.path
              key={i} d={d} fill="none" stroke="#66BB6A" strokeWidth={2} strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
            />
          ))}
          {/* Branch tips */}
          {[[25, 65], [15, 115], [10, 148], [15, 185], [25, 235]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill="#66BB6A" />
          ))}
          <text x={45} y={55} fill="#66BB6A" fontSize={9} fontWeight={600}>가지돌기</text>
          <text x={45} y={66} fill="#66BB6A" fontSize={7} fillOpacity={0.7}>(Dendrite)</text>
        </motion.g>

        {/* Axon hillock */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <path d="M235 150 L270 150" stroke="#FFB74D" strokeWidth={4} strokeLinecap="round" />
          <text x={252} y={140} textAnchor="middle" fill="#FFB74D" fontSize={7}>축삭</text>
          <text x={252} y={130} textAnchor="middle" fill="#FFB74D" fontSize={7}>언덕</text>
        </motion.g>

        {/* Axon with myelin sheath */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          {/* Axon core */}
          <line x1={270} y1={150} x2={580} y2={150} stroke="#FFB74D" strokeWidth={3} />

          {/* Myelin sheaths */}
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 290 + i * 55;
            return (
              <motion.g key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.1 }}>
                <rect x={x} y={132} width={40} height={36} rx={18} fill="#42A5F5" fillOpacity={0.15} stroke="#64B5F6" strokeWidth={1.5} />
              </motion.g>
            );
          })}

          {/* Nodes of Ranvier */}
          {[0, 1, 2, 3].map((i) => {
            const x = 330 + i * 55;
            return <circle key={i} cx={x} cy={150} r={2.5} fill="#FF7043" />;
          })}

          <text x={420} y={125} textAnchor="middle" fill="#64B5F6" fontSize={9} fontWeight={600}>말이집(수초)</text>
          <text x={340} y={178} textAnchor="middle" fill="#FF7043" fontSize={7}>랑비에 마디</text>
        </motion.g>

        {/* Axon terminal */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          {[
            [580, 150, 620, 125],
            [580, 150, 630, 150],
            [580, 150, 620, 175],
          ].map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EF5350" strokeWidth={2} />
              <circle cx={x2} cy={y2} r={6} fill="#EF5350" fillOpacity={0.2} stroke="#EF5350" strokeWidth={1.5} />
              {/* Vesicles inside terminal */}
              <circle cx={x2 as number - 2} cy={y2 as number - 2} r={1.5} fill="#EF5350" fillOpacity={0.5} />
              <circle cx={x2 as number + 2} cy={y2 as number + 1} r={1.5} fill="#EF5350" fillOpacity={0.5} />
            </g>
          ))}
          <text x={650} y={130} fill="#EF5350" fontSize={9} fontWeight={600}>축삭</text>
          <text x={650} y={142} fill="#EF5350" fontSize={9} fontWeight={600}>말단</text>
          <text x={650} y={170} fill="#EF5350" fontSize={7} fillOpacity={0.7}>시냅스</text>
          <text x={650} y={180} fill="#EF5350" fontSize={7} fillOpacity={0.7}>소포</text>
        </motion.g>

        {/* Signal direction arrow */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          <defs>
            <marker id="arrowhead" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#FFC107" />
            </marker>
          </defs>
          <line x1={100} y1={270} x2={600} y2={270} stroke="#FFC107" strokeWidth={1.5} markerEnd="url(#arrowhead)" strokeDasharray="6 3" />
          <text x={350} y={290} textAnchor="middle" fill="#FFC107" fontSize={9}>흥분 전달 방향</text>
        </motion.g>

        {/* Title */}
        <text x={350} y={25} textAnchor="middle" fill="white" fontSize={13} fontWeight={700}>뉴런(신경세포)의 구조</text>
      </svg>
    </div>
  );
}
