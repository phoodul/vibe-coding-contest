"use client";

import { motion } from "framer-motion";

interface IncenseSceneProps {
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
}

const HOTSPOTS = [
  { id: "incense_smoke", x: 115, y: 5, w: 70, h: 70, label: "향 연기" },
  { id: "incense_body", x: 110, y: 120, w: 80, h: 90, label: "향로 몸체" },
  { id: "candle_flame", x: 20, y: 45, w: 260, h: 40, label: "촛불" },
  { id: "candle_body", x: 15, y: 85, w: 65, h: 160, label: "촛대" },
  { id: "incense_base", x: 35, y: 275, w: 230, h: 50, label: "받침대" },
] as const;

export function IncenseScene({ activeHotspot, onHotspotClick }: IncenseSceneProps) {
  return (
    <svg viewBox="0 0 300 350" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Bronze gradient for incense burner */}
        <linearGradient id="incenseBronze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cd8032" />
          <stop offset="35%" stopColor="#b8721a" />
          <stop offset="70%" stopColor="#a0620e" />
          <stop offset="100%" stopColor="#7a4a08" />
        </linearGradient>

        {/* Gold accent */}
        <linearGradient id="incenseGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7dc6f" />
          <stop offset="100%" stopColor="#d4ac0d" />
        </linearGradient>

        {/* Candle body */}
        <linearGradient id="candleBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c0392b" />
          <stop offset="30%" stopColor="#e74c3c" />
          <stop offset="70%" stopColor="#c0392b" />
          <stop offset="100%" stopColor="#922B21" />
        </linearGradient>

        {/* Candlestick metal */}
        <linearGradient id="candlestickMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a7008" />
          <stop offset="40%" stopColor="#d4ac0d" />
          <stop offset="60%" stopColor="#d4ac0d" />
          <stop offset="100%" stopColor="#8a7008" />
        </linearGradient>

        {/* Flame gradient */}
        <radialGradient id="flameGlow" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#fff7cc" />
          <stop offset="40%" stopColor="#f9e547" />
          <stop offset="80%" stopColor="#f39c12" />
          <stop offset="100%" stopColor="#e74c3c" />
        </radialGradient>

        {/* Flame inner */}
        <radialGradient id="flameInner" cx="50%" cy="60%" r="40%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fff7cc" />
          <stop offset="100%" stopColor="#f9e547" />
        </radialGradient>

        {/* Smoke gradient */}
        <linearGradient id="smokeGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#aaa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ddd" stopOpacity="0" />
        </linearGradient>

        {/* Tray / base wood */}
        <linearGradient id="incenseTray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5D4037" />
          <stop offset="100%" stopColor="#3E2723" />
        </linearGradient>

        {/* Active glow filter */}
        <filter id="incenseActiveGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feFlood floodColor="#f1c40f" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Flame light glow */}
        <filter id="flameLightGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="#f39c12" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Bronze pattern */}
        <pattern id="bronzePattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.5" fill="none" stroke="#cd8032" strokeWidth="0.4" opacity="0.3" />
        </pattern>

        {/* Decorative band pattern */}
        <pattern id="incenseBandPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect x="1" y="1" width="6" height="6" fill="none" stroke="#f1c40f" strokeWidth="0.3" opacity="0.3" rx="1" />
        </pattern>
      </defs>

      {/* ═══ Floor shadow ═══ */}
      <ellipse cx="150" cy="330" rx="130" ry="14" fill="black" opacity="0.2" />

      {/* ═══ BASE TRAY ═══ */}
      <g filter={activeHotspot === "incense_base" ? "url(#incenseActiveGlow)" : undefined}>
        {/* Main tray */}
        <rect x="35" y="285" width="230" height="18" rx="3" fill="url(#incenseTray)" stroke="#8a7008" strokeWidth="1" />
        <rect x="38" y="287" width="224" height="14" rx="2" fill="url(#incenseBandPattern)" />
        {/* Gold trim */}
        <line x1="40" y1="286" x2="260" y2="286" stroke="#d4ac0d" strokeWidth="0.8" opacity="0.6" />
        <line x1="40" y1="302" x2="260" y2="302" stroke="#d4ac0d" strokeWidth="0.6" opacity="0.4" />
        {/* Tray feet */}
        <rect x="55" y="302" width="14" height="10" rx="2" fill="url(#incenseTray)" stroke="#7a4a08" strokeWidth="0.5" />
        <rect x="135" y="302" width="14" height="10" rx="2" fill="url(#incenseTray)" stroke="#7a4a08" strokeWidth="0.5" />
        <rect x="230" y="302" width="14" height="10" rx="2" fill="url(#incenseTray)" stroke="#7a4a08" strokeWidth="0.5" />
      </g>

      {/* ═══ LEFT CANDLESTICK ═══ */}
      <g filter={activeHotspot === "candle_body" ? "url(#incenseActiveGlow)" : undefined}>
        {/* Base plate */}
        <ellipse cx="55" cy="282" rx="28" ry="6" fill="url(#candlestickMetal)" stroke="#b8960b" strokeWidth="0.8" />
        <ellipse cx="55" cy="280" rx="24" ry="5" fill="url(#incenseBandPattern)" />
        {/* Lower stem */}
        <rect x="49" y="240" width="12" height="42" rx="2" fill="url(#candlestickMetal)" stroke="#b8960b" strokeWidth="0.5" />
        {/* Decorative bulge */}
        <ellipse cx="55" cy="238" rx="12" ry="6" fill="url(#candlestickMetal)" stroke="#d4ac0d" strokeWidth="0.5" />
        {/* Upper stem */}
        <rect x="50" y="150" width="10" height="90" rx="2" fill="url(#candlestickMetal)" stroke="#b8960b" strokeWidth="0.5" />
        {/* Candle holder cup */}
        <path d="M40 150 Q40 140, 55 138 Q70 140, 70 150 L65 155 L45 155 Z" fill="url(#candlestickMetal)" stroke="#d4ac0d" strokeWidth="0.8" />
        {/* Drip tray */}
        <ellipse cx="55" cy="155" rx="14" ry="3" fill="url(#candlestickMetal)" stroke="#b8960b" strokeWidth="0.5" />
        {/* Red candle */}
        <rect x="48" y="95" width="14" height="58" rx="3" fill="url(#candleBody)" stroke="#922B21" strokeWidth="0.5" />
        {/* Wax drips */}
        <path d="M48 110 Q46 115, 48 118" fill="none" stroke="#e74c3c" strokeWidth="1.5" opacity="0.5" />
        <path d="M62 105 Q64 112, 62 116" fill="none" stroke="#c0392b" strokeWidth="1.5" opacity="0.5" />
      </g>

      {/* ═══ RIGHT CANDLESTICK ═══ */}
      <g filter={activeHotspot === "candle_body" ? "url(#incenseActiveGlow)" : undefined}>
        {/* Base plate */}
        <ellipse cx="245" cy="282" rx="28" ry="6" fill="url(#candlestickMetal)" stroke="#b8960b" strokeWidth="0.8" />
        <ellipse cx="245" cy="280" rx="24" ry="5" fill="url(#incenseBandPattern)" />
        {/* Lower stem */}
        <rect x="239" y="240" width="12" height="42" rx="2" fill="url(#candlestickMetal)" stroke="#b8960b" strokeWidth="0.5" />
        {/* Decorative bulge */}
        <ellipse cx="245" cy="238" rx="12" ry="6" fill="url(#candlestickMetal)" stroke="#d4ac0d" strokeWidth="0.5" />
        {/* Upper stem */}
        <rect x="240" y="150" width="10" height="90" rx="2" fill="url(#candlestickMetal)" stroke="#b8960b" strokeWidth="0.5" />
        {/* Candle holder cup */}
        <path d="M230 150 Q230 140, 245 138 Q260 140, 260 150 L255 155 L235 155 Z" fill="url(#candlestickMetal)" stroke="#d4ac0d" strokeWidth="0.8" />
        {/* Drip tray */}
        <ellipse cx="245" cy="155" rx="14" ry="3" fill="url(#candlestickMetal)" stroke="#b8960b" strokeWidth="0.5" />
        {/* Red candle */}
        <rect x="238" y="95" width="14" height="58" rx="3" fill="url(#candleBody)" stroke="#922B21" strokeWidth="0.5" />
        {/* Wax drips */}
        <path d="M238 108 Q236 114, 238 117" fill="none" stroke="#e74c3c" strokeWidth="1.5" opacity="0.5" />
        <path d="M252 112 Q254 118, 252 121" fill="none" stroke="#c0392b" strokeWidth="1.5" opacity="0.5" />
      </g>

      {/* ═══ CANDLE FLAMES ═══ */}
      <g filter={activeHotspot === "candle_flame" ? "url(#incenseActiveGlow)" : "url(#flameLightGlow)"}>
        {/* Left flame */}
        <motion.g
          animate={{ scaleX: [1, 0.9, 1.05, 0.95, 1], scaleY: [1, 1.05, 0.95, 1.02, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "55px 85px" }}
        >
          <path d="M55 60 Q50 72, 47 82 Q46 90, 55 95 Q64 90, 63 82 Q60 72, 55 60Z" fill="url(#flameGlow)" />
          <path d="M55 68 Q52 76, 51 83 Q50 88, 55 91 Q60 88, 59 83 Q58 76, 55 68Z" fill="url(#flameInner)" />
        </motion.g>
        {/* Left flame ambient glow */}
        <circle cx="55" cy="80" r="18" fill="#f39c12" opacity="0.06" />

        {/* Right flame */}
        <motion.g
          animate={{ scaleX: [1, 1.05, 0.92, 1.03, 1], scaleY: [1, 0.95, 1.06, 0.97, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          style={{ transformOrigin: "245px 85px" }}
        >
          <path d="M245 60 Q240 72, 237 82 Q236 90, 245 95 Q254 90, 253 82 Q250 72, 245 60Z" fill="url(#flameGlow)" />
          <path d="M245 68 Q242 76, 241 83 Q240 88, 245 91 Q250 88, 249 83 Q248 76, 245 68Z" fill="url(#flameInner)" />
        </motion.g>
        {/* Right flame ambient glow */}
        <circle cx="245" cy="80" r="18" fill="#f39c12" opacity="0.06" />
      </g>

      {/* ═══ INCENSE BURNER ═══ */}
      <g filter={activeHotspot === "incense_body" ? "url(#incenseActiveGlow)" : undefined}>
        {/* Burner base */}
        <ellipse cx="150" cy="265" rx="40" ry="10" fill="url(#incenseBronze)" stroke="#7a4a08" strokeWidth="1" />
        {/* Pedestal */}
        <rect x="130" y="245" width="40" height="22" rx="2" fill="url(#incenseBronze)" stroke="#a0620e" strokeWidth="0.8" />
        <rect x="132" y="247" width="36" height="18" fill="url(#bronzePattern)" />
        {/* Decorative ring on pedestal */}
        <ellipse cx="150" cy="248" rx="22" ry="4" fill="none" stroke="#cd8032" strokeWidth="0.8" opacity="0.5" />

        {/* Main bowl */}
        <path d="M108 200 Q105 230, 115 245 L185 245 Q195 230, 192 200 Z" fill="url(#incenseBronze)" stroke="#cd8032" strokeWidth="1.2" />
        {/* Bowl inner */}
        <path d="M115 205 Q113 225, 120 240 L180 240 Q187 225, 185 205 Z" fill="url(#bronzePattern)" />
        {/* Decorative band */}
        <path d="M110 215 Q108 215, 192 215" fill="none" stroke="#f1c40f" strokeWidth="0.8" opacity="0.4" />
        <path d="M112 225 Q110 225, 190 225" fill="none" stroke="#f1c40f" strokeWidth="0.6" opacity="0.3" />

        {/* Bowl rim */}
        <ellipse cx="150" cy="198" rx="44" ry="10" fill="url(#incenseBronze)" stroke="#cd8032" strokeWidth="1" />
        <ellipse cx="150" cy="197" rx="38" ry="8" fill="#7a4a08" opacity="0.5" />

        {/* Handles */}
        <path d="M106 215 Q95 210, 96 220 Q97 230, 108 228" fill="none" stroke="url(#incenseBronze)" strokeWidth="4" strokeLinecap="round" />
        <path d="M194 215 Q205 210, 204 220 Q203 230, 192 228" fill="none" stroke="url(#incenseBronze)" strokeWidth="4" strokeLinecap="round" />

        {/* Lid */}
        <ellipse cx="150" cy="195" rx="36" ry="8" fill="url(#incenseBronze)" stroke="#cd8032" strokeWidth="0.8" />
        {/* Lid openwork holes */}
        <circle cx="138" cy="192" r="2.5" fill="#3E2723" opacity="0.6" />
        <circle cx="150" cy="190" r="2.5" fill="#3E2723" opacity="0.6" />
        <circle cx="162" cy="192" r="2.5" fill="#3E2723" opacity="0.6" />
        <circle cx="144" cy="196" r="2" fill="#3E2723" opacity="0.5" />
        <circle cx="156" cy="196" r="2" fill="#3E2723" opacity="0.5" />

        {/* Lid knob */}
        <ellipse cx="150" cy="186" rx="10" ry="5" fill="url(#incenseBronze)" stroke="#cd8032" strokeWidth="0.6" />
        <ellipse cx="150" cy="183" rx="5" ry="4" fill="url(#incenseGold)" stroke="#d4ac0d" strokeWidth="0.5" />
        {/* Knob top jewel */}
        <circle cx="150" cy="181" r="2.5" fill="#f9e547" opacity="0.7" />

        {/* Decorative engravings on body */}
        <path d="M125 210 Q130 205, 135 210 Q140 215, 145 210" fill="none" stroke="#f1c40f" strokeWidth="0.5" opacity="0.3" />
        <path d="M155 210 Q160 205, 165 210 Q170 215, 175 210" fill="none" stroke="#f1c40f" strokeWidth="0.5" opacity="0.3" />

        {/* Three legs under bowl */}
        <rect x="122" y="240" width="6" height="8" rx="1" fill="url(#incenseBronze)" stroke="#7a4a08" strokeWidth="0.5" />
        <rect x="147" y="240" width="6" height="8" rx="1" fill="url(#incenseBronze)" stroke="#7a4a08" strokeWidth="0.5" />
        <rect x="172" y="240" width="6" height="8" rx="1" fill="url(#incenseBronze)" stroke="#7a4a08" strokeWidth="0.5" />
      </g>

      {/* ═══ SMOKE ═══ */}
      <g filter={activeHotspot === "incense_smoke" ? "url(#incenseActiveGlow)" : undefined}>
        {/* Smoke wisps rising from lid holes - animated */}
        <motion.path
          d="M140 185 Q135 165, 142 145 Q148 125, 138 105 Q132 85, 140 65"
          fill="none"
          stroke="url(#smokeGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.3}
          animate={{ d: [
            "M140 185 Q135 165, 142 145 Q148 125, 138 105 Q132 85, 140 65",
            "M140 185 Q145 162, 138 142 Q132 122, 142 102 Q148 82, 136 60",
            "M140 185 Q133 168, 140 148 Q146 128, 136 108 Q130 88, 142 62",
            "M140 185 Q135 165, 142 145 Q148 125, 138 105 Q132 85, 140 65",
          ]}}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M150 183 Q155 160, 148 138 Q142 115, 152 92 Q158 70, 148 48"
          fill="none"
          stroke="url(#smokeGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.25}
          animate={{ d: [
            "M150 183 Q155 160, 148 138 Q142 115, 152 92 Q158 70, 148 48",
            "M150 183 Q145 158, 152 135 Q158 112, 148 90 Q140 68, 150 45",
            "M150 183 Q157 162, 150 140 Q144 118, 154 95 Q160 72, 146 50",
            "M150 183 Q155 160, 148 138 Q142 115, 152 92 Q158 70, 148 48",
          ]}}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.path
          d="M160 185 Q165 168, 158 150 Q152 132, 162 112 Q168 92, 158 72"
          fill="none"
          stroke="url(#smokeGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.2}
          animate={{ d: [
            "M160 185 Q165 168, 158 150 Q152 132, 162 112 Q168 92, 158 72",
            "M160 185 Q155 170, 162 148 Q168 128, 158 108 Q152 88, 162 68",
            "M160 185 Q167 165, 160 145 Q154 125, 164 105 Q170 85, 156 70",
            "M160 185 Q165 168, 158 150 Q152 132, 162 112 Q168 92, 158 72",
          ]}}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </g>

      {/* ═══ HOTSPOT OVERLAYS ═══ */}
      {HOTSPOTS.map((hs) => (
        <g key={hs.id} onClick={() => onHotspotClick(hs.id)} className="cursor-pointer">
          <rect
            x={hs.x}
            y={hs.y}
            width={hs.w}
            height={hs.h}
            rx={4}
            fill={activeHotspot === hs.id ? "rgba(241,196,15,0.15)" : "transparent"}
            stroke={activeHotspot === hs.id ? "#f1c40f" : "transparent"}
            strokeWidth={activeHotspot === hs.id ? 1.5 : 0}
            className="transition-all duration-200 hover:fill-[rgba(241,196,15,0.1)] hover:stroke-[#f1c40f] hover:stroke-1"
          />
        </g>
      ))}
    </svg>
  );
}
