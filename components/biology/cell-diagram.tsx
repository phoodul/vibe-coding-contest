"use client";

import { motion } from "framer-motion";

interface CellDiagramProps {
  className?: string;
  showLabels?: boolean;
}

export function CellDiagram({ className = "", showLabels = true }: CellDiagramProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg viewBox="0 0 600 500" className="w-full max-w-2xl mx-auto" style={{ minHeight: 300 }}>
        {/* Cell membrane (outer) */}
        <motion.ellipse
          cx={300} cy={250} rx={260} ry={200}
          fill="none" stroke="#26A69A" strokeWidth={4} strokeDasharray="8 4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        {/* Cytoplasm */}
        <ellipse cx={300} cy={250} rx={255} ry={196} fill="#E0F2F1" fillOpacity={0.15} />

        {/* Nucleus */}
        <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <ellipse cx={300} cy={240} rx={80} ry={70} fill="#7B1FA2" fillOpacity={0.15} stroke="#CE93D8" strokeWidth={3} />
          {/* Nuclear pores */}
          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return <circle key={angle} cx={300 + 80 * Math.cos(rad)} cy={240 + 70 * Math.sin(rad)} r={3} fill="#CE93D8" />;
          })}
          {/* DNA / Chromatin */}
          <path d="M275 225 Q285 235 280 245 Q275 255 285 260 Q295 265 290 250 Q285 240 295 235 Q305 230 310 245 Q315 258 305 260" fill="none" stroke="#E040FB" strokeWidth={1.5} />
          {/* Nucleolus */}
          <circle cx={310} cy={248} r={14} fill="#9C27B0" fillOpacity={0.3} stroke="#9C27B0" strokeWidth={1} />
          {showLabels && <text x={300} y={290} textAnchor="middle" fill="#CE93D8" fontSize={11} fontWeight={600}>핵 (Nucleus)</text>}
        </motion.g>

        {/* Mitochondria */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <ellipse cx={160} cy={180} rx={35} ry={18} fill="#FF5722" fillOpacity={0.2} stroke="#FF7043" strokeWidth={2} />
          {/* Cristae */}
          <path d="M135 180 Q145 170 150 180 Q155 190 160 180 Q165 170 170 180 Q175 190 180 180" fill="none" stroke="#FF7043" strokeWidth={1} strokeOpacity={0.6} />
          {showLabels && <text x={160} y={210} textAnchor="middle" fill="#FF7043" fontSize={9}>미토콘드리아</text>}
        </motion.g>

        {/* Mitochondria 2 */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <ellipse cx={430} cy={310} rx={30} ry={16} fill="#FF5722" fillOpacity={0.2} stroke="#FF7043" strokeWidth={2} transform="rotate(-30 430 310)" />
          <path d="M410 310 Q418 302 425 310 Q432 318 440 310 Q447 302 450 310" fill="none" stroke="#FF7043" strokeWidth={1} strokeOpacity={0.6} transform="rotate(-30 430 310)" />
        </motion.g>

        {/* ER (Rough) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <path d="M380 180 Q400 170 410 185 Q420 200 400 210 Q380 220 390 235 Q400 250 380 255" fill="none" stroke="#42A5F5" strokeWidth={2} />
          <path d="M388 180 Q408 170 418 185 Q428 200 408 210 Q388 220 398 235 Q408 250 388 255" fill="none" stroke="#42A5F5" strokeWidth={2} />
          {/* Ribosomes on rough ER */}
          {[182, 195, 208, 222, 238, 250].map((y, i) => (
            <circle key={i} cx={380 + (i % 2 ? 5 : -2)} cy={y} r={2.5} fill="#42A5F5" />
          ))}
          {showLabels && <text x={415} y={175} fill="#42A5F5" fontSize={9}>거친면 소포체 (RER)</text>}
        </motion.g>

        {/* Golgi apparatus */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          {[0, 10, 20, 30].map((offset) => (
            <path key={offset} d={`M130 ${290 + offset} Q160 ${280 + offset} 190 ${290 + offset}`} fill="none" stroke="#FFA726" strokeWidth={2.5} strokeLinecap="round" />
          ))}
          {/* Vesicles */}
          <circle cx={195} cy={295} r={5} fill="#FFA726" fillOpacity={0.3} stroke="#FFA726" strokeWidth={1} />
          <circle cx={200} cy={310} r={4} fill="#FFA726" fillOpacity={0.3} stroke="#FFA726" strokeWidth={1} />
          {showLabels && <text x={160} y={340} textAnchor="middle" fill="#FFA726" fontSize={9}>골지체 (Golgi)</text>}
        </motion.g>

        {/* Ribosomes (free) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {[[200, 150], [220, 340], [240, 160], [350, 350], [450, 200], [180, 360], [470, 250]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill="#66BB6A" />
          ))}
          {showLabels && <text x={220} y={365} fill="#66BB6A" fontSize={9}>리보솜</text>}
        </motion.g>

        {/* Lysosome */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          <circle cx={460} cy={170} r={16} fill="#EF5350" fillOpacity={0.15} stroke="#EF5350" strokeWidth={1.5} />
          <text x={460} y={174} textAnchor="middle" fill="#EF5350" fontSize={7}>효소</text>
          {showLabels && <text x={460} y={196} textAnchor="middle" fill="#EF5350" fontSize={9}>리소좀</text>}
        </motion.g>

        {/* Cell membrane label */}
        {showLabels && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <line x1={520} y1={120} x2={545} y2={90} stroke="#26A69A" strokeWidth={1} />
            <text x={548} y={88} fill="#26A69A" fontSize={9}>세포막</text>
            <text x={548} y={100} fill="#26A69A" fontSize={8} fillOpacity={0.7}>(인지질 이중층)</text>
          </motion.g>
        )}

        {/* Title */}
        <text x={300} y={475} textAnchor="middle" fill="white" fontSize={13} fontWeight={700}>동물 세포 구조</text>
      </svg>
    </div>
  );
}
