"use client";

import { motion } from "framer-motion";

interface ThroneSceneProps {
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
}

const HOTSPOTS = [
  { id: "throne_crown", x: 105, y: 10, w: 90, h: 70, label: "보개 (천개)" },
  { id: "throne_seat", x: 100, y: 195, w: 100, h: 55, label: "좌석 (방석)" },
  { id: "throne_arm_left", x: 55, y: 180, w: 45, h: 60, label: "좌측 팔걸이" },
  { id: "throne_arm_right", x: 200, y: 180, w: 45, h: 60, label: "우측 팔걸이" },
  { id: "throne_base", x: 75, y: 310, w: 150, h: 60, label: "기단 (족대)" },
] as const;

export function ThroneScene({ activeHotspot, onHotspotClick }: ThroneSceneProps) {
  return (
    <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Gold gradient for main frame */}
        <linearGradient id="throneGoldMain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7dc6f" />
          <stop offset="30%" stopColor="#f1c40f" />
          <stop offset="70%" stopColor="#d4ac0d" />
          <stop offset="100%" stopColor="#b8960b" />
        </linearGradient>

        {/* Dark gold for side panels */}
        <linearGradient id="throneGoldDark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a7008" />
          <stop offset="50%" stopColor="#b8960b" />
          <stop offset="100%" stopColor="#8a7008" />
        </linearGradient>

        {/* Red silk for cushion */}
        <linearGradient id="throneRedSilk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0392b" />
          <stop offset="40%" stopColor="#a93226" />
          <stop offset="100%" stopColor="#7b241c" />
        </linearGradient>

        {/* Wood grain for legs */}
        <linearGradient id="throneWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5D4037" />
          <stop offset="50%" stopColor="#4E342E" />
          <stop offset="100%" stopColor="#3E2723" />
        </linearGradient>

        {/* Crown top gradient */}
        <radialGradient id="throneCrownGlow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fef9e7" />
          <stop offset="40%" stopColor="#f9e547" />
          <stop offset="100%" stopColor="#d4ac0d" />
        </radialGradient>

        {/* Canopy fabric */}
        <linearGradient id="throneCanopy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#922B21" />
          <stop offset="100%" stopColor="#7B241C" />
        </linearGradient>

        {/* Active glow filter */}
        <filter id="throneActiveGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feFlood floodColor="#f1c40f" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle shadow */}
        <filter id="throneShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
        </filter>

        {/* Pattern for carved decoration */}
        <pattern id="throneCarvePattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="2.5" fill="none" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.4" />
          <line x1="0" y1="8" x2="5" y2="8" stroke="#f7dc6f" strokeWidth="0.3" opacity="0.3" />
          <line x1="11" y1="8" x2="16" y2="8" stroke="#f7dc6f" strokeWidth="0.3" opacity="0.3" />
          <line x1="8" y1="0" x2="8" y2="5" stroke="#f7dc6f" strokeWidth="0.3" opacity="0.3" />
          <line x1="8" y1="11" x2="8" y2="16" stroke="#f7dc6f" strokeWidth="0.3" opacity="0.3" />
        </pattern>

        {/* Decorative border pattern */}
        <pattern id="throneBorderPattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect x="2" y="2" width="8" height="8" fill="none" stroke="#f1c40f" strokeWidth="0.4" opacity="0.3" rx="1" />
          <circle cx="6" cy="6" r="1.5" fill="#f1c40f" opacity="0.15" />
        </pattern>
      </defs>

      {/* ═══ Floor shadow ═══ */}
      <ellipse cx="150" cy="385" rx="110" ry="12" fill="black" opacity="0.25" />

      {/* ═══ BASE / FOOTSTOOL ═══ */}
      <g filter={activeHotspot === "throne_base" ? "url(#throneActiveGlow)" : undefined}>
        {/* Bottom platform */}
        <rect x="60" y="345" width="180" height="20" rx="3" fill="url(#throneWood)" stroke="#8a7008" strokeWidth="1.5" />
        <rect x="62" y="347" width="176" height="16" rx="2" fill="url(#throneBorderPattern)" />
        {/* Gold trim line */}
        <line x1="65" y1="346" x2="235" y2="346" stroke="#f1c40f" strokeWidth="1" opacity="0.6" />
        <line x1="65" y1="364" x2="235" y2="364" stroke="#f1c40f" strokeWidth="0.8" opacity="0.4" />

        {/* Middle step */}
        <rect x="75" y="325" width="150" height="22" rx="2" fill="url(#throneWood)" stroke="#b8960b" strokeWidth="1" />
        <rect x="77" y="327" width="146" height="18" rx="1" fill="url(#throneBorderPattern)" />
        <line x1="80" y1="326" x2="220" y2="326" stroke="#f1c40f" strokeWidth="0.8" opacity="0.5" />

        {/* Top step */}
        <rect x="85" y="307" width="130" height="20" rx="2" fill="url(#throneWood)" stroke="#b8960b" strokeWidth="1" />
        <rect x="87" y="309" width="126" height="16" rx="1" fill="url(#throneBorderPattern)" />
        {/* Corner gold caps */}
        <circle cx="90" cy="317" r="3" fill="#f1c40f" opacity="0.4" />
        <circle cx="210" cy="317" r="3" fill="#f1c40f" opacity="0.4" />
      </g>

      {/* ═══ THRONE LEGS ═══ */}
      {/* Left front leg */}
      <rect x="98" y="260" width="12" height="50" rx="2" fill="url(#throneWood)" stroke="#b8960b" strokeWidth="0.8" />
      <rect x="100" y="262" width="8" height="46" fill="url(#throneCarvePattern)" />
      {/* Right front leg */}
      <rect x="190" y="260" width="12" height="50" rx="2" fill="url(#throneWood)" stroke="#b8960b" strokeWidth="0.8" />
      <rect x="192" y="262" width="8" height="46" fill="url(#throneCarvePattern)" />
      {/* Left back leg */}
      <rect x="103" y="260" width="8" height="48" rx="1" fill="#3E2723" opacity="0.5" />
      {/* Right back leg */}
      <rect x="189" y="260" width="8" height="48" rx="1" fill="#3E2723" opacity="0.5" />

      {/* ═══ SEAT FRAME ═══ */}
      <rect x="90" y="245" width="120" height="18" rx="3" fill="url(#throneGoldDark)" stroke="#f1c40f" strokeWidth="1" />
      {/* Carved border on seat frame */}
      <rect x="95" y="248" width="110" height="12" rx="2" fill="url(#throneCarvePattern)" />

      {/* ═══ SEAT CUSHION ═══ */}
      <g filter={activeHotspot === "throne_seat" ? "url(#throneActiveGlow)" : undefined}>
        <rect x="95" y="222" width="110" height="28" rx="5" fill="url(#throneRedSilk)" stroke="#c0392b" strokeWidth="1" />
        {/* Silk sheen */}
        <rect x="100" y="225" width="100" height="6" rx="3" fill="white" opacity="0.1" />
        {/* Cushion tufting */}
        <circle cx="122" cy="236" r="1.5" fill="#7b241c" opacity="0.5" />
        <circle cx="150" cy="236" r="1.5" fill="#7b241c" opacity="0.5" />
        <circle cx="178" cy="236" r="1.5" fill="#7b241c" opacity="0.5" />
        {/* Gold trim on cushion */}
        <rect x="95" y="247" width="110" height="3" rx="1" fill="#d4ac0d" opacity="0.6" />
      </g>

      {/* ═══ ARMRESTS ═══ */}
      {/* Left armrest */}
      <g filter={activeHotspot === "throne_arm_left" ? "url(#throneActiveGlow)" : undefined}>
        <rect x="68" y="195" width="30" height="60" rx="4" fill="url(#throneGoldMain)" stroke="#d4ac0d" strokeWidth="1.5" />
        <rect x="70" y="197" width="26" height="56" rx="3" fill="url(#throneCarvePattern)" />
        {/* Armrest top cap */}
        <rect x="65" y="190" width="36" height="10" rx="4" fill="url(#throneGoldMain)" stroke="#f1c40f" strokeWidth="1" />
        {/* Dragon head ornament */}
        <circle cx="83" cy="193" r="5" fill="#f9e547" opacity="0.6" />
        <circle cx="83" cy="193" r="2.5" fill="#d4ac0d" />
        {/* Carved decoration on arm */}
        <line x1="74" y1="210" x2="92" y2="210" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.4" />
        <line x1="74" y1="222" x2="92" y2="222" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.4" />
        <line x1="74" y1="234" x2="92" y2="234" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.4" />
      </g>

      {/* Right armrest */}
      <g filter={activeHotspot === "throne_arm_right" ? "url(#throneActiveGlow)" : undefined}>
        <rect x="202" y="195" width="30" height="60" rx="4" fill="url(#throneGoldMain)" stroke="#d4ac0d" strokeWidth="1.5" />
        <rect x="204" y="197" width="26" height="56" rx="3" fill="url(#throneCarvePattern)" />
        {/* Armrest top cap */}
        <rect x="199" y="190" width="36" height="10" rx="4" fill="url(#throneGoldMain)" stroke="#f1c40f" strokeWidth="1" />
        {/* Dragon head ornament */}
        <circle cx="217" cy="193" r="5" fill="#f9e547" opacity="0.6" />
        <circle cx="217" cy="193" r="2.5" fill="#d4ac0d" />
        {/* Carved decoration on arm */}
        <line x1="208" y1="210" x2="226" y2="210" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.4" />
        <line x1="208" y1="222" x2="226" y2="222" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.4" />
        <line x1="208" y1="234" x2="226" y2="234" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.4" />
      </g>

      {/* ═══ BACK PANEL ═══ */}
      <rect x="92" y="88" width="116" height="140" rx="4" fill="url(#throneGoldDark)" stroke="#f1c40f" strokeWidth="1.5" />
      {/* Inner carved panel */}
      <rect x="98" y="94" width="104" height="128" rx="3" fill="url(#throneCarvePattern)" />
      {/* Central phoenix medallion */}
      <circle cx="150" cy="140" r="28" fill="none" stroke="#f1c40f" strokeWidth="1" opacity="0.5" />
      <circle cx="150" cy="140" r="20" fill="none" stroke="#f7dc6f" strokeWidth="0.8" opacity="0.4" />
      <circle cx="150" cy="140" r="12" fill="#d4ac0d" opacity="0.25" />
      {/* Phoenix body (simplified) */}
      <path d="M150 128 C145 132, 140 138, 143 145 C146 148, 150 148, 150 148 C150 148, 154 148, 157 145 C160 138, 155 132, 150 128Z" fill="#f1c40f" opacity="0.4" />
      {/* Wings */}
      <path d="M143 140 C138 135, 130 134, 128 138 C130 140, 136 142, 143 140Z" fill="#f9e547" opacity="0.3" />
      <path d="M157 140 C162 135, 170 134, 172 138 C170 140, 164 142, 157 140Z" fill="#f9e547" opacity="0.3" />

      {/* Vertical decorative lines on back */}
      <line x1="110" y1="96" x2="110" y2="220" stroke="#f1c40f" strokeWidth="0.5" opacity="0.2" />
      <line x1="130" y1="96" x2="130" y2="220" stroke="#f1c40f" strokeWidth="0.5" opacity="0.15" />
      <line x1="170" y1="96" x2="170" y2="220" stroke="#f1c40f" strokeWidth="0.5" opacity="0.15" />
      <line x1="190" y1="96" x2="190" y2="220" stroke="#f1c40f" strokeWidth="0.5" opacity="0.2" />

      {/* Horizontal carved lines */}
      <line x1="100" y1="110" x2="200" y2="110" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.25" />
      <line x1="100" y1="170" x2="200" y2="170" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.25" />
      <line x1="100" y1="200" x2="200" y2="200" stroke="#f7dc6f" strokeWidth="0.5" opacity="0.25" />

      {/* ═══ CROWN / TOP PIECE ═══ */}
      <g filter={activeHotspot === "throne_crown" ? "url(#throneActiveGlow)" : "url(#throneShadow)"}>
        {/* Dome shape */}
        <path
          d="M85 90 Q85 55, 150 30 Q215 55, 215 90 L85 90Z"
          fill="url(#throneCrownGlow)"
          stroke="#f1c40f"
          strokeWidth="1.5"
        />
        {/* Inner dome carving */}
        <path
          d="M100 88 Q100 62, 150 42 Q200 62, 200 88"
          fill="none"
          stroke="#d4ac0d"
          strokeWidth="0.8"
          opacity="0.5"
        />
        {/* Crown top finial */}
        <circle cx="150" cy="28" r="6" fill="#f9e547" stroke="#d4ac0d" strokeWidth="1" />
        <circle cx="150" cy="28" r="3" fill="#fef9e7" opacity="0.7" />

        {/* Small decorative ridges on dome */}
        <line x1="120" y1="72" x2="120" y2="88" stroke="#f1c40f" strokeWidth="0.6" opacity="0.3" />
        <line x1="135" y1="58" x2="135" y2="88" stroke="#f1c40f" strokeWidth="0.6" opacity="0.3" />
        <line x1="150" y1="50" x2="150" y2="88" stroke="#f1c40f" strokeWidth="0.6" opacity="0.3" />
        <line x1="165" y1="58" x2="165" y2="88" stroke="#f1c40f" strokeWidth="0.6" opacity="0.3" />
        <line x1="180" y1="72" x2="180" y2="88" stroke="#f1c40f" strokeWidth="0.6" opacity="0.3" />

        {/* Canopy drape (red fabric under dome) */}
        <path
          d="M85 88 Q110 96, 150 98 Q190 96, 215 88 L215 92 Q190 100, 150 102 Q110 100, 85 92Z"
          fill="url(#throneCanopy)"
          stroke="#922B21"
          strokeWidth="0.5"
          opacity="0.8"
        />

        {/* Shimmer animation on crown */}
        <motion.rect
          x="85"
          y="30"
          width="130"
          height="62"
          rx="4"
          fill="url(#throneCrownGlow)"
          opacity={0}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      {/* ═══ SIDE WING PANELS ═══ */}
      {/* Left wing */}
      <path d="M68 90 L92 90 L92 190 L68 195 Z" fill="url(#throneGoldDark)" stroke="#d4ac0d" strokeWidth="0.8" />
      <rect x="72" y="95" width="16" height="90" fill="url(#throneCarvePattern)" />
      {/* Right wing */}
      <path d="M208 90 L232 90 L232 195 L208 190 Z" fill="url(#throneGoldDark)" stroke="#d4ac0d" strokeWidth="0.8" />
      <rect x="212" y="95" width="16" height="90" fill="url(#throneCarvePattern)" />

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
