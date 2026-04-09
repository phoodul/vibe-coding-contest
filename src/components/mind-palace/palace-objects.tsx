"use client";

import { motion } from "framer-motion";
import type { ObjectType } from "@/lib/mind-palace/scene-config";

interface PalaceObjectSVGProps {
  type: ObjectType;
  x: number;
  y: number;
  scale?: number;
  active?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
}

/* ── Color tokens ── */
const C = {
  wood: "#8B6914",
  woodDark: "#6B4A20",
  paper: "#D4C5A0",
  paperDark: "#C4B590",
  gold: "#DAA520",
  goldDark: "#B8860B",
  blue: "#4682B4",
  blueBright: "#5B9BD5",
  green: "#2D6B4F",
  greenBright: "#4A8B6F",
  stroke: "rgba(255,255,255,0.19)",
  activeStroke: "#F59E0B",
  activeGlow: "#F59E0B",
};

/* ── Individual object renderers ── */

function Painting() {
  return (
    <g>
      {/* Outer frame */}
      <rect x="-32" y="-28" width="64" height="56" rx="3" fill={C.woodDark} stroke={C.wood} strokeWidth="2" />
      {/* Inner decorative border */}
      <rect x="-27" y="-23" width="54" height="46" rx="1" fill="none" stroke={C.gold} strokeWidth="1" />
      {/* Canvas */}
      <rect x="-24" y="-20" width="48" height="40" fill="#2a3040" />
      {/* Abstract landscape: sky + mountain + sun */}
      <rect x="-24" y="-20" width="48" height="24" fill="#1e3050" />
      <polygon points="-10,4 6,-14 22,4" fill="#3a4a60" />
      <polygon points="2,4 14,-8 26,4" fill="#2e3e55" />
      <circle cx="16" cy="-12" r="4" fill={C.gold} opacity="0.6" />
      <rect x="-24" y="4" width="48" height="16" fill="#2a4030" />
      {/* Hanging wire */}
      <path d="M-8,-28 L0,-34 L8,-28" fill="none" stroke={C.stroke} strokeWidth="1" />
    </g>
  );
}

function Book() {
  return (
    <g>
      {/* Book cover — angled perspective */}
      <path d="M-20,-22 L18,-22 L22,-18 L22,22 L-16,22 L-20,-22Z" fill="#6B3A2A" stroke={C.woodDark} strokeWidth="1.5" />
      {/* Spine */}
      <path d="M-20,-22 L-16,22 L-20,18Z" fill="#5A2A1A" stroke={C.woodDark} strokeWidth="1" />
      {/* Pages visible at edge */}
      <path d="M-16,22 L22,22 L22,19 L-16,19Z" fill={C.paper} stroke={C.paperDark} strokeWidth="0.5" />
      <path d="M-16,19 L22,19 L22,16 L-16,16Z" fill="#E0D5B5" stroke={C.paperDark} strokeWidth="0.3" />
      {/* Cover decoration: lines */}
      <line x1="-8" y1="-12" x2="14" y2="-12" stroke={C.gold} strokeWidth="1" />
      <line x1="-6" y1="-6" x2="10" y2="-6" stroke={C.gold} strokeWidth="0.7" opacity="0.6" />
      <line x1="-6" y1="0" x2="8" y2="0" stroke={C.gold} strokeWidth="0.5" opacity="0.4" />
    </g>
  );
}

function Scroll() {
  return (
    <g>
      {/* Main body */}
      <rect x="-26" y="-14" width="52" height="28" rx="2" fill={C.paper} stroke={C.paperDark} strokeWidth="1" />
      {/* Top roll */}
      <ellipse cx="0" cy="-14" rx="28" ry="5" fill={C.paperDark} stroke={C.woodDark} strokeWidth="1" />
      <ellipse cx="0" cy="-14" rx="28" ry="5" fill="none" stroke={C.paper} strokeWidth="0.5" opacity="0.3" />
      {/* Bottom curl */}
      <path d="M-26,14 Q-26,20 -20,20 Q-14,20 -14,14" fill={C.paper} stroke={C.paperDark} strokeWidth="1" />
      <path d="M26,14 Q26,20 20,20 Q14,20 14,14" fill={C.paper} stroke={C.paperDark} strokeWidth="1" />
      {/* Rod ends */}
      <circle cx="-28" cy="-14" r="3" fill={C.woodDark} stroke={C.wood} strokeWidth="0.8" />
      <circle cx="28" cy="-14" r="3" fill={C.woodDark} stroke={C.wood} strokeWidth="0.8" />
      {/* Text lines */}
      <line x1="-18" y1="-4" x2="18" y2="-4" stroke={C.woodDark} strokeWidth="0.7" opacity="0.4" />
      <line x1="-16" y1="2" x2="14" y2="2" stroke={C.woodDark} strokeWidth="0.7" opacity="0.3" />
      <line x1="-14" y1="8" x2="10" y2="8" stroke={C.woodDark} strokeWidth="0.7" opacity="0.2" />
    </g>
  );
}

function Globe() {
  return (
    <g>
      {/* Stand */}
      <path d="M-8,24 L8,24 L4,18 L-4,18Z" fill={C.woodDark} stroke={C.wood} strokeWidth="1" />
      <rect x="-1" y="14" width="2" height="6" fill={C.wood} />
      {/* Outer ring (meridian) */}
      <ellipse cx="0" cy="0" rx="22" ry="22" fill="none" stroke={C.goldDark} strokeWidth="1.5" />
      {/* Globe sphere */}
      <circle cx="0" cy="0" r="20" fill="#1a3a5a" stroke={C.blue} strokeWidth="1" />
      {/* Continent shapes */}
      <path d="M-6,-14 Q-2,-16 2,-12 Q6,-14 4,-8 Q8,-4 4,0 Q2,2 -2,0 Q-6,-2 -8,-6 Q-10,-10 -6,-14Z" fill={C.green} opacity="0.7" />
      <path d="M6,4 Q10,2 12,6 Q14,10 10,12 Q6,10 6,4Z" fill={C.green} opacity="0.6" />
      <path d="M-14,2 Q-12,-2 -10,2 Q-12,6 -14,2Z" fill={C.greenBright} opacity="0.5" />
      {/* Latitude lines */}
      <ellipse cx="0" cy="-8" rx="18" ry="4" fill="none" stroke={C.blueBright} strokeWidth="0.4" opacity="0.4" />
      <ellipse cx="0" cy="0" rx="20" ry="3" fill="none" stroke={C.blueBright} strokeWidth="0.4" opacity="0.5" />
      <ellipse cx="0" cy="8" rx="18" ry="4" fill="none" stroke={C.blueBright} strokeWidth="0.4" opacity="0.4" />
      {/* Vertical meridian */}
      <ellipse cx="0" cy="0" rx="8" ry="20" fill="none" stroke={C.blueBright} strokeWidth="0.4" opacity="0.4" />
      {/* Highlight */}
      <circle cx="-8" cy="-8" r="6" fill="white" opacity="0.08" />
    </g>
  );
}

function Scale() {
  return (
    <g>
      {/* Base */}
      <rect x="-12" y="20" width="24" height="6" rx="2" fill={C.woodDark} stroke={C.wood} strokeWidth="1" />
      {/* Pillar */}
      <rect x="-2" y="-10" width="4" height="30" fill={C.gold} stroke={C.goldDark} strokeWidth="1" />
      {/* Beam — slight tilt for realism */}
      <line x1="-28" y1="-8" x2="28" y2="-12" stroke={C.gold} strokeWidth="2" />
      {/* Fulcrum triangle */}
      <polygon points="-4,-10 4,-10 0,-16" fill={C.goldDark} stroke={C.gold} strokeWidth="1" />
      {/* Left pan */}
      <path d="M-28,-8 L-24,-8 L-22,0 L-34,0Z" fill="none" stroke={C.gold} strokeWidth="1" />
      <ellipse cx="-28" cy="0" rx="12" ry="3" fill={C.goldDark} stroke={C.gold} strokeWidth="0.8" />
      {/* Right pan */}
      <path d="M28,-12 L32,-12 L34,-4 L22,-4Z" fill="none" stroke={C.gold} strokeWidth="1" />
      <ellipse cx="28" cy="-4" rx="12" ry="3" fill={C.goldDark} stroke={C.gold} strokeWidth="0.8" />
      {/* Chain lines */}
      <line x1="-28" y1="-8" x2="-34" y2="0" stroke={C.gold} strokeWidth="0.6" strokeDasharray="2,1" />
      <line x1="-28" y1="-8" x2="-22" y2="0" stroke={C.gold} strokeWidth="0.6" strokeDasharray="2,1" />
      <line x1="28" y1="-12" x2="22" y2="-4" stroke={C.gold} strokeWidth="0.6" strokeDasharray="2,1" />
      <line x1="28" y1="-12" x2="34" y2="-4" stroke={C.gold} strokeWidth="0.6" strokeDasharray="2,1" />
    </g>
  );
}

function Portrait() {
  return (
    <g>
      {/* Oval frame */}
      <ellipse cx="0" cy="0" rx="28" ry="26" fill={C.woodDark} stroke={C.gold} strokeWidth="2" />
      <ellipse cx="0" cy="0" rx="24" ry="22" fill="#1a1a2a" stroke={C.goldDark} strokeWidth="1" />
      {/* Silhouette head */}
      <ellipse cx="0" cy="-6" rx="10" ry="12" fill="#2a2a3a" />
      {/* Silhouette shoulders */}
      <path d="M-16,16 Q-16,6 -8,4 Q-4,2 0,2 Q4,2 8,4 Q16,6 16,16Z" fill="#2a2a3a" />
      {/* Highlight on frame */}
      <ellipse cx="-14" cy="-14" rx="6" ry="4" fill="white" opacity="0.06" transform="rotate(-30)" />
      {/* Hanging hook */}
      <circle cx="0" cy="-26" r="2" fill={C.gold} />
    </g>
  );
}

function Notebook() {
  return (
    <g>
      {/* Cover */}
      <rect x="-22" y="-26" width="44" height="52" rx="2" fill="#3a5a80" stroke={C.blue} strokeWidth="1.5" />
      {/* Pages (slightly offset) */}
      <rect x="-18" y="-24" width="40" height="48" rx="1" fill={C.paper} stroke={C.paperDark} strokeWidth="0.5" />
      {/* Spiral binding */}
      {[-20, -14, -8, -2, 4, 10, 16].map((cy) => (
        <g key={cy}>
          <circle cx="-22" cy={cy} r="2.5" fill="none" stroke="#8a8a9a" strokeWidth="1" />
          <line x1="-24" y1={cy} x2="-20" y2={cy} stroke="#8a8a9a" strokeWidth="1" />
        </g>
      ))}
      {/* Ruled lines */}
      {[-16, -10, -4, 2, 8, 14].map((ly) => (
        <line key={ly} x1="-14" y1={ly} x2="16" y2={ly} stroke={C.blue} strokeWidth="0.3" opacity="0.4" />
      ))}
      {/* Red margin line */}
      <line x1="-10" y1="-24" x2="-10" y2="24" stroke="#c04040" strokeWidth="0.5" opacity="0.5" />
    </g>
  );
}

function Shield() {
  return (
    <g>
      {/* Shield shape */}
      <path
        d="M0,-28 L24,-18 L26,-4 Q26,14 0,28 Q-26,14 -26,-4 L-24,-18Z"
        fill="#3a2a50"
        stroke={C.gold}
        strokeWidth="2"
      />
      {/* Inner field */}
      <path
        d="M0,-22 L18,-14 L20,-4 Q20,10 0,22 Q-20,10 -20,-4 L-18,-14Z"
        fill="#2a1a40"
        stroke={C.goldDark}
        strokeWidth="1"
      />
      {/* Cross/chevron emblem */}
      <line x1="0" y1="-16" x2="0" y2="16" stroke={C.gold} strokeWidth="1.5" opacity="0.6" />
      <line x1="-14" y1="-2" x2="14" y2="-2" stroke={C.gold} strokeWidth="1.5" opacity="0.6" />
      {/* Corner decorations */}
      <circle cx="0" cy="-10" r="2" fill={C.gold} opacity="0.5" />
      <circle cx="0" cy="10" r="2" fill={C.gold} opacity="0.5" />
    </g>
  );
}

function Blackboard() {
  return (
    <g>
      {/* Outer frame */}
      <rect x="-36" y="-24" width="72" height="48" rx="2" fill={C.woodDark} stroke={C.wood} strokeWidth="2" />
      {/* Dark board surface */}
      <rect x="-32" y="-20" width="64" height="40" rx="1" fill="#1a3028" />
      {/* Chalk tray */}
      <rect x="-30" y="18" width="60" height="4" rx="1" fill={C.woodDark} />
      {/* Chalk piece */}
      <rect x="18" y="16" width="8" height="3" rx="1" fill="#e8e0d0" opacity="0.8" />
      {/* Chalk writing — e=mc² vibe */}
      <text x="-16" y="-4" fill="#c8d8c0" fontSize="8" fontFamily="serif" opacity="0.6">E = mc²</text>
      {/* Chalk dust marks */}
      <line x1="-20" y1="6" x2="10" y2="6" stroke="#c8d8c0" strokeWidth="0.5" opacity="0.3" />
      <line x1="-14" y1="10" x2="6" y2="10" stroke="#c8d8c0" strokeWidth="0.5" opacity="0.2" />
    </g>
  );
}

function Sign() {
  return (
    <g>
      {/* Diamond warning sign */}
      <polygon
        points="0,-28 28,0 0,28 -28,0"
        fill="#8B4513"
        stroke={C.gold}
        strokeWidth="2"
      />
      {/* Inner diamond */}
      <polygon
        points="0,-20 20,0 0,20 -20,0"
        fill="#6B3310"
        stroke={C.goldDark}
        strokeWidth="1"
      />
      {/* Exclamation mark */}
      <rect x="-2" y="-12" width="4" height="14" rx="1" fill={C.gold} opacity="0.8" />
      <circle cx="0" cy="10" r="2.5" fill={C.gold} opacity="0.8" />
      {/* Post */}
      <rect x="-2" y="28" width="4" height="10" fill={C.woodDark} stroke={C.wood} strokeWidth="0.8" />
    </g>
  );
}

function Poster() {
  return (
    <g>
      {/* Paper body */}
      <rect x="-24" y="-28" width="48" height="56" rx="1" fill={C.paper} stroke={C.paperDark} strokeWidth="1" />
      {/* Curled corner (bottom-right) */}
      <path d="M24,16 L24,28 L12,28Z" fill={C.paperDark} />
      <path d="M24,16 Q18,20 12,28" fill="none" stroke={C.woodDark} strokeWidth="0.5" opacity="0.4" />
      {/* Shadow under curl */}
      <path d="M14,26 L24,16 L24,28Z" fill="rgba(0,0,0,0.1)" />
      {/* Pushpin */}
      <circle cx="0" cy="-24" r="3" fill="#c04040" stroke="#a03030" strokeWidth="0.8" />
      <circle cx="0" cy="-24" r="1" fill="white" opacity="0.3" />
      {/* Content lines */}
      <rect x="-16" y="-16" width="32" height="6" rx="1" fill={C.woodDark} opacity="0.15" />
      <line x1="-16" y1="-4" x2="16" y2="-4" stroke={C.woodDark} strokeWidth="0.6" opacity="0.3" />
      <line x1="-16" y1="2" x2="12" y2="2" stroke={C.woodDark} strokeWidth="0.6" opacity="0.25" />
      <line x1="-16" y1="8" x2="14" y2="8" stroke={C.woodDark} strokeWidth="0.6" opacity="0.2" />
    </g>
  );
}

function Nameplate() {
  return (
    <g>
      {/* Wedge/desk nameplate — trapezoidal side view */}
      <path
        d="M-30,8 L-24,-16 L24,-16 L30,8Z"
        fill={C.woodDark}
        stroke={C.wood}
        strokeWidth="1.5"
      />
      {/* Front face */}
      <path
        d="M-30,8 L30,8 L30,14 L-30,14Z"
        fill="#5A3A20"
        stroke={C.wood}
        strokeWidth="1"
      />
      {/* Metal plate */}
      <rect x="-20" y="-12" width="40" height="16" rx="1" fill={C.goldDark} stroke={C.gold} strokeWidth="0.8" />
      {/* Engraved name line */}
      <line x1="-14" y1="-6" x2="14" y2="-6" stroke={C.gold} strokeWidth="1" opacity="0.6" />
      <line x1="-10" y1="0" x2="10" y2="0" stroke={C.gold} strokeWidth="0.7" opacity="0.4" />
    </g>
  );
}

function Phone() {
  return (
    <g>
      {/* Phone body */}
      <rect x="-14" y="-26" width="28" height="52" rx="4" fill="#2a2a30" stroke="#4a4a50" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="-11" y="-20" width="22" height="36" rx="2" fill="#1a2a40" />
      {/* Screen content glow */}
      <rect x="-9" y="-18" width="18" height="8" rx="1" fill={C.blue} opacity="0.2" />
      <rect x="-9" y="-8" width="12" height="4" rx="1" fill={C.blueBright} opacity="0.15" />
      <rect x="-9" y="-2" width="14" height="4" rx="1" fill={C.blue} opacity="0.1" />
      {/* Status bar dots */}
      <circle cx="-6" cy="-16" r="0.8" fill="#6a8aaa" opacity="0.6" />
      <circle cx="-3" cy="-16" r="0.8" fill="#6a8aaa" opacity="0.6" />
      <circle cx="0" cy="-16" r="0.8" fill="#6a8aaa" opacity="0.6" />
      {/* Home indicator */}
      <rect x="-6" y="12" width="12" height="2" rx="1" fill="#4a4a50" opacity="0.5" />
      {/* Camera notch */}
      <circle cx="0" cy="-23" r="1.5" fill="#1a1a20" />
      {/* Side button */}
      <rect x="14" y="-10" width="1.5" height="8" rx="0.5" fill="#3a3a40" />
    </g>
  );
}

function Lawbook() {
  return (
    <g>
      {/* Thick book body */}
      <path d="M-22,-26 L16,-26 L20,-22 L20,26 L-18,26 L-22,-26Z" fill="#4a1a1a" stroke="#6a2a2a" strokeWidth="1.5" />
      {/* Spine */}
      <path d="M-22,-26 L-18,26 L-22,22Z" fill="#3a1010" stroke="#5a2020" strokeWidth="1" />
      {/* Pages */}
      <path d="M-18,26 L20,26 L20,23 L-18,23Z" fill={C.paper} stroke={C.paperDark} strokeWidth="0.4" />
      <path d="M-18,23 L20,23 L20,20 L-18,20Z" fill="#E0D5B5" strokeWidth="0.3" />
      {/* Scales of justice emblem on cover */}
      <line x1="0" y1="-16" x2="0" y2="-2" stroke={C.gold} strokeWidth="1" />
      <line x1="-10" y1="-6" x2="10" y2="-6" stroke={C.gold} strokeWidth="1" />
      {/* Fulcrum */}
      <polygon points="-2,-16 2,-16 0,-19" fill={C.gold} />
      {/* Left pan */}
      <path d="M-10,-6 L-12,-2 L-8,-2Z" fill={C.goldDark} />
      <ellipse cx="-10" cy="-2" rx="4" ry="1.2" fill={C.goldDark} stroke={C.gold} strokeWidth="0.4" />
      {/* Right pan */}
      <path d="M10,-6 L8,-2 L12,-2Z" fill={C.goldDark} />
      <ellipse cx="10" cy="-2" rx="4" ry="1.2" fill={C.goldDark} stroke={C.gold} strokeWidth="0.4" />
      {/* Title line */}
      <line x1="-8" y1="6" x2="12" y2="6" stroke={C.gold} strokeWidth="0.8" opacity="0.5" />
      <line x1="-6" y1="12" x2="8" y2="12" stroke={C.gold} strokeWidth="0.5" opacity="0.3" />
    </g>
  );
}

function Stone() {
  return (
    <g>
      {/* Irregular stone tablet */}
      <path
        d="M-20,-26 Q-8,-30 8,-26 Q22,-22 24,-10 Q26,4 22,16 Q16,26 2,28 Q-12,28 -22,18 Q-28,8 -26,-6 Q-26,-18 -20,-26Z"
        fill="#5a5a60"
        stroke="#7a7a80"
        strokeWidth="1.5"
      />
      {/* Inner surface (slightly lighter) */}
      <path
        d="M-16,-20 Q-4,-24 6,-20 Q16,-16 18,-6 Q20,4 16,12 Q10,20 0,22 Q-10,22 -16,14 Q-22,6 -20,-2 Q-20,-14 -16,-20Z"
        fill="#4a4a50"
        opacity="0.6"
      />
      {/* Inscription lines */}
      <line x1="-10" y1="-12" x2="10" y2="-12" stroke="#8a8a90" strokeWidth="0.8" opacity="0.5" />
      <line x1="-8" y1="-6" x2="8" y2="-6" stroke="#8a8a90" strokeWidth="0.8" opacity="0.4" />
      <line x1="-10" y1="0" x2="10" y2="0" stroke="#8a8a90" strokeWidth="0.8" opacity="0.4" />
      <line x1="-6" y1="6" x2="6" y2="6" stroke="#8a8a90" strokeWidth="0.8" opacity="0.3" />
      {/* Cracks/texture */}
      <path d="M-12,10 Q-8,14 -2,12" fill="none" stroke="#6a6a70" strokeWidth="0.5" opacity="0.4" />
      <path d="M8,-18 Q12,-14 10,-10" fill="none" stroke="#6a6a70" strokeWidth="0.5" opacity="0.4" />
      {/* Moss accent */}
      <circle cx="-14" cy="8" r="2" fill={C.green} opacity="0.2" />
    </g>
  );
}

function Certificate() {
  return (
    <g>
      {/* Paper body */}
      <rect x="-28" y="-24" width="56" height="48" rx="2" fill={C.paper} stroke={C.paperDark} strokeWidth="1" />
      {/* Decorative border */}
      <rect x="-24" y="-20" width="48" height="40" rx="1" fill="none" stroke={C.gold} strokeWidth="0.8" strokeDasharray="3 2" />
      {/* Header line */}
      <line x1="-16" y1="-12" x2="16" y2="-12" stroke={C.woodDark} strokeWidth="1" opacity="0.4" />
      {/* Body lines */}
      <line x1="-14" y1="-4" x2="14" y2="-4" stroke={C.woodDark} strokeWidth="0.6" opacity="0.3" />
      <line x1="-14" y1="2" x2="10" y2="2" stroke={C.woodDark} strokeWidth="0.6" opacity="0.25" />
      <line x1="-14" y1="8" x2="12" y2="8" stroke={C.woodDark} strokeWidth="0.6" opacity="0.2" />
      {/* Seal */}
      <circle cx="8" cy="16" r="5" fill={C.goldDark} stroke={C.gold} strokeWidth="0.8" />
      <circle cx="8" cy="16" r="2" fill={C.gold} opacity="0.5" />
      {/* Ribbon */}
      <path d="M4,20 L8,28 L12,20" fill="#c04040" stroke="#a03030" strokeWidth="0.6" />
    </g>
  );
}

function Chart() {
  return (
    <g>
      {/* Background panel */}
      <rect x="-28" y="-24" width="56" height="48" rx="3" fill="#1a2a3a" stroke={C.blue} strokeWidth="1" />
      {/* Grid lines */}
      <line x1="-20" y1="16" x2="20" y2="16" stroke={C.blueBright} strokeWidth="0.4" opacity="0.3" />
      <line x1="-20" y1="4" x2="20" y2="4" stroke={C.blueBright} strokeWidth="0.4" opacity="0.3" />
      <line x1="-20" y1="-8" x2="20" y2="-8" stroke={C.blueBright} strokeWidth="0.4" opacity="0.3" />
      {/* Bars */}
      <rect x="-18" y="4" width="8" height="12" rx="1" fill={C.blue} opacity="0.7" />
      <rect x="-6" y="-8" width="8" height="24" rx="1" fill={C.blueBright} opacity="0.7" />
      <rect x="6" y="-14" width="8" height="30" rx="1" fill="#7ab3e0" opacity="0.7" />
      {/* Trend line */}
      <polyline points="-14,8 -2,-4 10,-12 18,-16" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
      {/* Axis */}
      <line x1="-20" y1="16" x2="-20" y2="-18" stroke={C.blueBright} strokeWidth="0.8" />
      <line x1="-20" y1="16" x2="22" y2="16" stroke={C.blueBright} strokeWidth="0.8" />
    </g>
  );
}

function Flag() {
  return (
    <g>
      {/* Pole */}
      <rect x="-2" y="-28" width="4" height="56" rx="1" fill={C.woodDark} stroke={C.wood} strokeWidth="1" />
      {/* Flag body */}
      <path d="M2,-26 Q20,-22 16,-14 Q12,-6 28,-2 L28,-2 L2,-2Z" fill="#c04040" stroke="#a03030" strokeWidth="1" />
      {/* Flag highlight */}
      <path d="M4,-24 Q14,-20 12,-14 Q10,-8 18,-6" fill="none" stroke="#e06060" strokeWidth="0.8" opacity="0.5" />
      {/* Pole top */}
      <circle cx="0" cy="-28" r="3" fill={C.gold} stroke={C.goldDark} strokeWidth="0.8" />
      {/* Base */}
      <ellipse cx="0" cy="28" rx="10" ry="4" fill={C.woodDark} stroke={C.wood} strokeWidth="0.8" />
    </g>
  );
}

/* ── Renderer map ── */
const RENDERERS: Partial<Record<ObjectType, () => React.JSX.Element>> = {
  painting: Painting,
  book: Book,
  scroll: Scroll,
  globe: Globe,
  scale: Scale,
  portrait: Portrait,
  notebook: Notebook,
  shield: Shield,
  blackboard: Blackboard,
  sign: Sign,
  poster: Poster,
  nameplate: Nameplate,
  phone: Phone,
  lawbook: Lawbook,
  stone: Stone,
  certificate: Certificate,
  chart: Chart,
  flag: Flag,
};

/* ── Main exported component ── */
export function PalaceObjectSVG({
  type,
  x,
  y,
  scale: s = 1,
  active,
  dimmed,
  onClick,
}: PalaceObjectSVGProps) {
  const Renderer = RENDERERS[type];
  if (!Renderer) return null;

  const opacity = dimmed ? 0.2 : active ? 1 : 0.7;
  const strokeColor = active ? C.activeStroke : C.stroke;

  return (
    <motion.g
      transform={`translate(${x},${y}) scale(${s})`}
      className={onClick ? "cursor-pointer" : undefined}
      onClick={onClick}
      style={{ opacity }}
      initial={false}
      animate={{
        opacity,
        filter: active ? `drop-shadow(0 0 8px ${C.activeGlow})` : "none",
      }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.08 } : undefined}
    >
      {/* Invisible hit area for easier clicking */}
      <rect x="-36" y="-30" width="72" height="60" fill="transparent" />
      {/* Object-level stroke override for active state */}
      <g stroke={strokeColor} strokeWidth={active ? 0.5 : 0}>
        <Renderer />
      </g>
    </motion.g>
  );
}
