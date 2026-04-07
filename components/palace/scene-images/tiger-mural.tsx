"use client";

import { motion } from "framer-motion";

interface TigerMuralSceneProps {
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
}

const HOTSPOTS: {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}[] = [
  { id: "tiger_forehead", x: 168, y: 105, width: 52, height: 36, rx: 10 },
  { id: "tiger_eye", x: 162, y: 140, width: 60, height: 28, rx: 8 },
  { id: "tiger_mouth", x: 172, y: 175, width: 54, height: 40, rx: 10 },
  { id: "tiger_back", x: 110, y: 195, width: 70, height: 55, rx: 14 },
  { id: "tiger_belly", x: 140, y: 260, width: 65, height: 60, rx: 14 },
  { id: "tiger_front_leg", x: 175, y: 330, width: 45, height: 80, rx: 10 },
  { id: "tiger_hind_leg", x: 95, y: 340, width: 50, height: 75, rx: 10 },
  { id: "tiger_tail", x: 50, y: 150, width: 55, height: 100, rx: 16 },
];

export function TigerMuralScene({
  activeHotspot,
  onHotspotClick,
}: TigerMuralSceneProps) {
  return (
    <svg
      viewBox="0 0 350 500"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      role="img"
      aria-label="호랑이 벽화 - Korean Folk Art Tiger Mural"
    >
      <defs>
        {/* Background parchment gradient */}
        <linearGradient id="tm-parchment" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5e6c8" />
          <stop offset="50%" stopColor="#ede0c0" />
          <stop offset="100%" stopColor="#ddd0a8" />
        </linearGradient>

        {/* Tiger body orange gradient */}
        <linearGradient id="tm-tiger-body" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#e8a832" />
          <stop offset="40%" stopColor="#d4882a" />
          <stop offset="100%" stopColor="#c07020" />
        </linearGradient>

        {/* Tiger belly lighter gradient */}
        <linearGradient id="tm-tiger-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d090" />
          <stop offset="100%" stopColor="#e8c070" />
        </linearGradient>

        {/* Pine tree gradient */}
        <linearGradient id="tm-pine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d5a27" />
          <stop offset="100%" stopColor="#1a3a18" />
        </linearGradient>

        {/* Pine trunk */}
        <linearGradient id="tm-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a3a1a" />
          <stop offset="50%" stopColor="#7a5030" />
          <stop offset="100%" stopColor="#4a2a10" />
        </linearGradient>

        {/* Golden glow filter for active hotspot */}
        <filter id="tm-golden-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feFlood floodColor="#fbbf24" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle paper texture */}
        <filter id="tm-paper-texture">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            result="noise"
          />
          <feDiffuseLighting
            in="noise"
            lightingColor="#f5e6c8"
            surfaceScale="1.5"
            result="lit"
          >
            <feDistantLight azimuth="45" elevation="55" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="0.8" k2="0.3" k3="0" k4="0" />
        </filter>

        {/* Border pattern */}
        <pattern id="tm-border-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#8b4513" />
          <rect x="2" y="2" width="16" height="16" fill="#a0522d" rx="1" />
          <rect x="5" y="5" width="10" height="10" fill="#8b4513" rx="1" />
        </pattern>
      </defs>

      {/* ===== BACKGROUND ===== */}
      <rect width="350" height="500" fill="url(#tm-parchment)" rx="8" />

      {/* Paper texture overlay */}
      <rect
        width="350"
        height="500"
        fill="url(#tm-parchment)"
        filter="url(#tm-paper-texture)"
        opacity="0.3"
        rx="8"
      />

      {/* ===== DECORATIVE BORDER FRAME ===== */}
      {/* Outer border */}
      <rect
        x="8"
        y="8"
        width="334"
        height="484"
        fill="none"
        stroke="#6b3410"
        strokeWidth="4"
        rx="4"
      />
      {/* Inner border */}
      <rect
        x="16"
        y="16"
        width="318"
        height="468"
        fill="none"
        stroke="#8b5a2b"
        strokeWidth="1.5"
        rx="3"
      />
      {/* Corner ornaments */}
      {[
        [20, 20],
        [318, 20],
        [20, 472],
        [318, 472],
      ].map(([cx, cy], i) => (
        <g key={`corner-${i}`}>
          <circle cx={cx} cy={cy} r="6" fill="#8b4513" opacity="0.6" />
          <circle cx={cx} cy={cy} r="3" fill="#c0873a" opacity="0.8" />
        </g>
      ))}

      {/* ===== PINE TREE (background) ===== */}
      {/* Trunk */}
      <path
        d="M 60 80 Q 55 200 70 420 Q 72 430 65 440"
        fill="none"
        stroke="url(#tm-trunk)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Bark texture lines */}
      {[120, 180, 240, 300, 360].map((y, i) => (
        <path
          key={`bark-${i}`}
          d={`M ${58 + i % 2 * 2} ${y} Q ${65 + i % 3} ${y + 8} ${60 + i % 2 * 4} ${y + 15}`}
          fill="none"
          stroke="#3a2010"
          strokeWidth="1"
          opacity="0.5"
        />
      ))}

      {/* Pine needle clusters */}
      {[
        { cx: 45, cy: 70, scale: 1 },
        { cx: 70, cy: 55, scale: 0.8 },
        { cx: 35, cy: 100, scale: 0.9 },
        { cx: 55, cy: 130, scale: 0.7 },
        { cx: 40, cy: 170, scale: 0.6 },
        { cx: 75, cy: 90, scale: 0.5 },
      ].map((cluster, i) => (
        <g key={`pine-${i}`} transform={`translate(${cluster.cx}, ${cluster.cy}) scale(${cluster.scale})`}>
          {/* Each needle cluster is a fan of lines */}
          {[-40, -25, -10, 5, 20, 35].map((angle, j) => (
            <line
              key={j}
              x1="0"
              y1="0"
              x2={Math.cos((angle * Math.PI) / 180) * 22}
              y2={Math.sin((angle * Math.PI) / 180) * 22 - 10}
              stroke="url(#tm-pine)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}

      {/* ===== TIGER BODY ===== */}
      <g>
        {/* === TAIL (behind body) === */}
        <motion.g
          animate={{ rotate: [0, 6, -4, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "90px", originY: "230px" }}
        >
          <path
            d="M 95 230 Q 55 200 50 165 Q 48 140 60 120 Q 68 108 80 112"
            fill="none"
            stroke="url(#tm-tiger-body)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Tail stripes */}
          {[
            "M 88 218 Q 72 210 68 198",
            "M 72 195 Q 58 185 57 175",
            "M 58 170 Q 52 158 55 148",
            "M 56 142 Q 56 130 63 122",
          ].map((d, i) => (
            <path
              key={`tail-stripe-${i}`}
              d={d}
              fill="none"
              stroke="#2a1a0a"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
          ))}
          {/* Tail tip tuft */}
          <ellipse cx="75" cy="110" rx="10" ry="8" fill="#2a1a0a" opacity="0.8" />
        </motion.g>

        {/* === HIND LEGS === */}
        {/* Left hind leg (far) */}
        <path
          d="M 105 340 Q 100 370 95 395 Q 92 410 100 420 L 118 420 Q 122 412 115 395 Q 118 370 115 340"
          fill="url(#tm-tiger-body)"
          stroke="#8a5a20"
          strokeWidth="1"
        />
        {/* Hind leg stripes */}
        <path d="M 100 355 L 115 350" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 98 375 L 116 370" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        {/* Paw */}
        <ellipse cx="108" cy="420" rx="12" ry="5" fill="#e8a832" stroke="#8a5a20" strokeWidth="0.8" />
        {/* Claws */}
        {[96, 103, 110, 117].map((x, i) => (
          <path
            key={`hclaw-${i}`}
            d={`M ${x} 424 Q ${x + 1} 429 ${x - 1} 432`}
            fill="none"
            stroke="#4a3520"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* Right hind leg (near) */}
        <path
          d="M 120 345 Q 118 375 115 400 Q 112 415 120 425 L 140 425 Q 144 417 135 400 Q 136 372 132 345"
          fill="url(#tm-tiger-body)"
          stroke="#8a5a20"
          strokeWidth="1"
        />
        <path d="M 118 360 L 134 355" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 116 380 L 136 375" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 114 400 L 137 396" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <ellipse cx="129" cy="425" rx="13" ry="5" fill="#e8a832" stroke="#8a5a20" strokeWidth="0.8" />
        {[116, 123, 130, 137].map((x, i) => (
          <path
            key={`hclaw2-${i}`}
            d={`M ${x} 429 Q ${x + 1} 434 ${x - 1} 437`}
            fill="none"
            stroke="#4a3520"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* === MAIN BODY === */}
        <path
          d="M 100 200 Q 90 230 95 270 Q 100 310 110 340 Q 140 360 180 345
             Q 210 330 215 290 Q 218 250 210 220 Q 200 195 170 190 Q 135 188 100 200 Z"
          fill="url(#tm-tiger-body)"
          stroke="#8a5a20"
          strokeWidth="1.2"
        />

        {/* Belly area (lighter) */}
        <path
          d="M 130 260 Q 125 285 135 310 Q 150 330 170 325 Q 185 315 185 290
             Q 185 265 175 250 Q 160 245 130 260 Z"
          fill="url(#tm-tiger-belly)"
          opacity="0.7"
        />

        {/* Body stripes */}
        {[
          "M 110 210 Q 140 205 165 210",
          "M 105 230 Q 135 222 170 228",
          "M 102 250 Q 130 242 168 248",
          "M 105 270 Q 130 265 165 268",
          "M 110 290 Q 138 285 168 290",
          "M 118 310 Q 145 305 175 312",
          "M 128 328 Q 155 324 180 330",
        ].map((d, i) => (
          <path
            key={`body-stripe-${i}`}
            d={d}
            fill="none"
            stroke="#2a1a0a"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity={0.55 + (i % 3) * 0.1}
          />
        ))}

        {/* === FRONT LEGS === */}
        {/* Left front leg (far) */}
        <path
          d="M 180 330 Q 178 360 180 390 Q 182 408 190 415 L 208 415 Q 212 408 205 390 Q 202 360 198 330"
          fill="url(#tm-tiger-body)"
          stroke="#8a5a20"
          strokeWidth="1"
        />
        <path d="M 180 345 L 200 342" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 179 365 L 203 360" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 180 385 L 205 381" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <ellipse cx="198" cy="415" rx="12" ry="5" fill="#e8a832" stroke="#8a5a20" strokeWidth="0.8" />
        {[186, 193, 200, 207].map((x, i) => (
          <path
            key={`fclaw-${i}`}
            d={`M ${x} 419 Q ${x + 1} 424 ${x - 1} 427`}
            fill="none"
            stroke="#4a3520"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* Right front leg (near) */}
        <path
          d="M 195 335 Q 195 365 198 395 Q 200 412 210 420 L 228 420 Q 232 412 222 395 Q 218 365 212 335"
          fill="url(#tm-tiger-body)"
          stroke="#8a5a20"
          strokeWidth="1"
        />
        <path d="M 196 350 L 214 347" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 197 370 L 220 366" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 198 390 L 222 387" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 199 405 L 224 402" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <ellipse cx="218" cy="420" rx="12" ry="5" fill="#e8a832" stroke="#8a5a20" strokeWidth="0.8" />
        {[206, 213, 220, 227].map((x, i) => (
          <path
            key={`fclaw2-${i}`}
            d={`M ${x} 424 Q ${x + 1} 429 ${x - 1} 432`}
            fill="none"
            stroke="#4a3520"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* === HEAD === */}
        {/* Head base shape */}
        <path
          d="M 155 120 Q 140 115 135 130 Q 130 150 140 170 Q 150 190 175 195
             Q 200 198 220 185 Q 235 172 235 155 Q 235 135 225 120
             Q 215 110 200 108 Q 175 106 155 120 Z"
          fill="url(#tm-tiger-body)"
          stroke="#8a5a20"
          strokeWidth="1.2"
        />

        {/* Cheek fur / lighter face area */}
        <path
          d="M 160 140 Q 155 155 165 172 Q 175 185 195 185 Q 215 180 222 165
             Q 226 152 220 138 Q 210 130 190 128 Q 170 130 160 140 Z"
          fill="#f0c860"
          opacity="0.5"
        />

        {/* Forehead stripes (왕 pattern - King character) */}
        <path d="M 170 115 L 170 130" stroke="#2a1a0a" strokeWidth="3" strokeLinecap="round" />
        <path d="M 185 112 L 185 128" stroke="#2a1a0a" strokeWidth="3" strokeLinecap="round" />
        <path d="M 200 114 L 200 130" stroke="#2a1a0a" strokeWidth="3" strokeLinecap="round" />
        <path d="M 165 118 L 205 118" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 167 126 L 203 126" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Face side stripes */}
        <path d="M 140 140 Q 150 138 158 142" stroke="#2a1a0a" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M 138 155 Q 148 152 158 155" stroke="#2a1a0a" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M 222 138 Q 230 140 235 145" stroke="#2a1a0a" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M 224 155 Q 232 155 236 160" stroke="#2a1a0a" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* === EARS === */}
        {/* Left ear */}
        <path
          d="M 155 118 Q 148 98 155 85 Q 162 78 168 92 Q 170 105 163 118"
          fill="url(#tm-tiger-body)"
          stroke="#8a5a20"
          strokeWidth="1"
        />
        <path
          d="M 157 112 Q 153 100 157 92 Q 161 87 164 96 Q 165 105 161 112"
          fill="#e8a0a0"
          opacity="0.5"
        />

        {/* Right ear */}
        <path
          d="M 205 115 Q 208 95 218 85 Q 225 80 224 95 Q 222 108 212 118"
          fill="url(#tm-tiger-body)"
          stroke="#8a5a20"
          strokeWidth="1"
        />
        <path
          d="M 208 112 Q 212 98 218 92 Q 222 88 221 100 Q 219 108 213 114"
          fill="#e8a0a0"
          opacity="0.5"
        />

        {/* === EYES (민화 style - round, expressive, humorous) === */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.42, 0.45, 0.48, 1],
            ease: "easeInOut",
          }}
          style={{ originX: "190px", originY: "148px" }}
        >
          {/* Left eye white */}
          <ellipse cx="172" cy="148" rx="12" ry="11" fill="#fffef0" stroke="#2a1a0a" strokeWidth="1.8" />
          {/* Left pupil */}
          <circle cx="175" cy="148" r="5.5" fill="#1a0a00" />
          {/* Left eye shine */}
          <circle cx="177" cy="145" r="2" fill="#fff" opacity="0.9" />

          {/* Right eye white */}
          <ellipse cx="205" cy="146" rx="12" ry="11" fill="#fffef0" stroke="#2a1a0a" strokeWidth="1.8" />
          {/* Right pupil */}
          <circle cx="208" cy="146" r="5.5" fill="#1a0a00" />
          {/* Right eye shine */}
          <circle cx="210" cy="143" r="2" fill="#fff" opacity="0.9" />
        </motion.g>

        {/* Nose */}
        <path
          d="M 185 164 Q 180 160 183 155 Q 188 152 193 155 Q 196 160 190 164 Z"
          fill="#3a1a0a"
        />

        {/* === MOUTH (open, showing teeth - characteristic folk art expression) === */}
        <path
          d="M 170 175 Q 165 178 163 185 Q 162 195 170 200 Q 180 205 195 205
             Q 210 205 218 198 Q 224 190 222 182 Q 220 176 215 174"
          fill="#c43030"
          stroke="#8a1818"
          strokeWidth="1"
        />
        {/* Tongue */}
        <ellipse cx="192" cy="198" rx="12" ry="6" fill="#e05050" opacity="0.8" />
        {/* Upper teeth */}
        {[170, 180, 190, 200, 210].map((x, i) => (
          <path
            key={`tooth-upper-${i}`}
            d={`M ${x} 175 L ${x + 2} 183 L ${x + 5} 175`}
            fill="#f5f0e0"
            stroke="#d0c8a0"
            strokeWidth="0.5"
          />
        ))}
        {/* Lower teeth (fewer) */}
        {[178, 192, 206].map((x, i) => (
          <path
            key={`tooth-lower-${i}`}
            d={`M ${x} 205 L ${x + 2} 197 L ${x + 5} 205`}
            fill="#f5f0e0"
            stroke="#d0c8a0"
            strokeWidth="0.5"
          />
        ))}
        {/* Fangs */}
        <path d="M 167 175 L 164 190 L 172 178" fill="#f5f0e0" stroke="#d0c8a0" strokeWidth="0.5" />
        <path d="M 218 174 L 222 190 L 214 177" fill="#f5f0e0" stroke="#d0c8a0" strokeWidth="0.5" />

        {/* Whiskers */}
        {[
          "M 155 162 L 120 155",
          "M 153 168 L 115 168",
          "M 155 174 L 122 180",
          "M 225 160 L 260 152",
          "M 227 166 L 265 165",
          "M 225 172 L 258 178",
        ].map((d, i) => (
          <path
            key={`whisker-${i}`}
            d={d}
            fill="none"
            stroke="#2a1a0a"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
          />
        ))}
      </g>

      {/* ===== GROUND / ROCKS ===== */}
      <path
        d="M 25 430 Q 60 425 100 432 Q 150 438 200 430 Q 250 425 300 435 Q 325 438 340 430"
        fill="none"
        stroke="#8a7a5a"
        strokeWidth="2"
        opacity="0.4"
      />
      {/* Small rocks */}
      <ellipse cx="80" cy="440" rx="15" ry="8" fill="#a89878" opacity="0.3" />
      <ellipse cx="250" cy="438" rx="20" ry="10" fill="#a89878" opacity="0.25" />
      <ellipse cx="170" cy="445" rx="12" ry="6" fill="#a89878" opacity="0.2" />

      {/* ===== DECORATIVE ELEMENTS ===== */}
      {/* Small clouds (traditional Korean cloud motif) */}
      {[
        { x: 250, y: 60 },
        { x: 280, y: 100 },
        { x: 270, y: 140 },
      ].map((cloud, i) => (
        <g key={`cloud-${i}`} opacity={0.3 - i * 0.05}>
          <circle cx={cloud.x} cy={cloud.y} r="8" fill="#8a7050" />
          <circle cx={cloud.x + 10} cy={cloud.y - 3} r="6" fill="#8a7050" />
          <circle cx={cloud.x + 8} cy={cloud.y + 4} r="5" fill="#8a7050" />
        </g>
      ))}

      {/* Seal stamp (traditional red seal - 낙관) */}
      <g transform="translate(280, 420)">
        <rect x="0" y="0" width="36" height="36" fill="#c43030" rx="2" opacity="0.85" />
        {/* Simplified seal characters */}
        <path d="M 8 8 L 8 28 M 8 18 L 18 18 M 18 8 L 18 28" stroke="#f5e6c8" strokeWidth="2" fill="none" />
        <path d="M 22 8 L 22 28 M 22 8 L 30 8 M 22 18 L 28 18 M 22 28 L 30 28" stroke="#f5e6c8" strokeWidth="2" fill="none" />
      </g>

      {/* ===== HOTSPOT INTERACTION REGIONS ===== */}
      {HOTSPOTS.map((hs) => {
        const isActive = activeHotspot === hs.id;
        return (
          <motion.rect
            key={hs.id}
            x={hs.x}
            y={hs.y}
            width={hs.width}
            height={hs.height}
            rx={hs.rx ?? 8}
            fill={isActive ? "rgba(251, 191, 36, 0.25)" : "transparent"}
            stroke={isActive ? "#fbbf24" : "transparent"}
            strokeWidth={isActive ? 2 : 0}
            filter={isActive ? "url(#tm-golden-glow)" : undefined}
            className="cursor-pointer"
            onClick={() => onHotspotClick(hs.id)}
            whileHover={{
              fill: "rgba(251, 191, 36, 0.15)",
              stroke: "#fbbf24",
              strokeWidth: 1.5,
            }}
            transition={{ duration: 0.2 }}
            role="button"
            aria-label={hs.id.replace(/_/g, " ")}
          />
        );
      })}
    </svg>
  );
}
