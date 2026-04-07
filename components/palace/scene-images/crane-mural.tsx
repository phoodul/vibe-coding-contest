"use client";

import { motion } from "framer-motion";

interface CraneMuralSceneProps {
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
}

function glowFilter(id: string) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feFlood floodColor="#FFD700" floodOpacity="0.6" result="color" />
      <feComposite in="color" in2="blur" operator="in" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

export function CraneMuralScene({
  activeHotspot,
  onHotspotClick,
}: CraneMuralSceneProps) {
  function hotspotProps(id: string) {
    const isActive = activeHotspot === id;
    return {
      onClick: () => onHotspotClick(id),
      style: {
        cursor: "pointer" as const,
        filter: isActive ? "url(#goldenGlow)" : undefined,
      },
      className: isActive ? "" : "hover:brightness-125",
    };
  }

  return (
    <svg
      viewBox="0 0 350 500"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        {glowFilter("goldenGlow")}

        {/* Background gradient — misty blue-gray Korean ink wash */}
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3a4a" />
          <stop offset="40%" stopColor="#3a4f5f" />
          <stop offset="100%" stopColor="#1e2d3a" />
        </linearGradient>

        {/* Frame border gradient */}
        <linearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>

        {/* Pine needle gradient */}
        <linearGradient id="pineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d5a3a" />
          <stop offset="100%" stopColor="#1a3a25" />
        </linearGradient>

        {/* Rock gradient */}
        <linearGradient id="rockGrad" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#5a5a5a" />
          <stop offset="50%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>

        {/* Subtle texture filter */}
        <filter id="inkTexture">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            result="noise"
          />
          <feColorMatrix
            type="saturate"
            values="0"
            in="noise"
            result="grayNoise"
          />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" />
        </filter>

        {/* Cloud blur */}
        <filter id="cloudBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* ========== DECORATIVE FRAME ========== */}
      <rect
        x="0"
        y="0"
        width="350"
        height="500"
        fill="url(#frameGrad)"
        rx="4"
      />
      <rect
        x="8"
        y="8"
        width="334"
        height="484"
        fill="url(#bgGrad)"
        rx="2"
      />
      {/* Inner frame line */}
      <rect
        x="14"
        y="14"
        width="322"
        height="472"
        fill="none"
        stroke="#C9A84C"
        strokeWidth="0.8"
        strokeOpacity="0.4"
        rx="1"
      />
      {/* Corner ornaments */}
      {[
        [18, 18],
        [328, 18],
        [18, 482],
        [328, 482],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="3" fill="none" stroke="#C9A84C" strokeWidth="0.6" strokeOpacity="0.5" />
          <circle cx={cx} cy={cy} r="1.2" fill="#C9A84C" fillOpacity="0.3" />
        </g>
      ))}

      {/* ========== CLOUDS (background) ========== */}
      <g filter="url(#cloudBlur)" opacity="0.15">
        <ellipse cx="80" cy="70" rx="55" ry="18" fill="#8aa8c0" />
        <ellipse cx="120" cy="65" rx="40" ry="14" fill="#9ab8d0" />
        <ellipse cx="260" cy="90" rx="50" ry="16" fill="#8aa8c0" />
        <ellipse cx="290" cy="85" rx="35" ry="12" fill="#9ab8d0" />
      </g>

      {/* Wispy cloud strokes — traditional style */}
      <g opacity="0.12" stroke="#b0c8d8" fill="none" strokeWidth="1" strokeLinecap="round">
        <path d="M 40 55 Q 70 45, 100 55 Q 120 62, 140 52" />
        <path d="M 200 75 Q 230 65, 260 75 Q 280 82, 310 70" />
        <path d="M 60 100 Q 90 92, 110 100" />
      </g>

      {/* ========== PINE BRANCH (top-right background) ========== */}
      <g opacity="0.6">
        {/* Main branch */}
        <path
          d="M 310 30 Q 280 60, 260 100 Q 250 120, 255 145"
          stroke="#4a3520"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 280 60 Q 300 70, 315 65"
          stroke="#4a3520"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Pine needles clusters */}
        {[
          [270, 80],
          [258, 110],
          [262, 135],
          [300, 55],
          [310, 45],
        ].map(([x, y], i) => (
          <g key={`pine-${i}`} transform={`translate(${x},${y})`}>
            {[-30, -15, 0, 15, 30].map((angle, j) => (
              <line
                key={j}
                x1="0"
                y1="0"
                x2={Math.cos((angle * Math.PI) / 180) * 14}
                y2={Math.sin((angle * Math.PI) / 180) * 14 - 5}
                stroke="url(#pineGrad)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </g>

      {/* ========== ROCK (base) ========== */}
      <g>
        <path
          d="M 100 410 Q 90 395, 110 380 Q 130 370, 150 375
             Q 170 365, 200 370 Q 230 368, 250 378
             Q 270 385, 260 400 Q 265 415, 240 420
             Q 200 430, 160 425 Q 120 422, 100 410 Z"
          fill="url(#rockGrad)"
          stroke="#4a4a4a"
          strokeWidth="0.5"
        />
        {/* Rock texture lines */}
        <path
          d="M 120 400 Q 150 393, 180 398"
          stroke="#555"
          strokeWidth="0.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 190 385 Q 210 380, 240 390"
          stroke="#555"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
        />
        {/* Moss accents */}
        <ellipse cx="130" cy="395" rx="8" ry="3" fill="#3a5a3a" opacity="0.3" />
        <ellipse cx="220" cy="388" rx="6" ry="2.5" fill="#3a5a3a" opacity="0.25" />
      </g>

      {/* ========== CRANE ========== */}
      <g>
        {/* === LEGS (hotspot) === */}
        <motion.g
          {...hotspotProps("crane_legs")}
          animate={{ y: [0, 0.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Left leg */}
          <line
            x1="165"
            y1="345"
            x2="155"
            y2="400"
            stroke="#2a2a2a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Left foot */}
          <path
            d="M 155 400 L 145 408 M 155 400 L 155 410 M 155 400 L 163 407"
            stroke="#2a2a2a"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right leg */}
          <line
            x1="185"
            y1="345"
            x2="195"
            y2="395"
            stroke="#2a2a2a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Right foot */}
          <path
            d="M 195 395 L 185 403 M 195 395 L 195 405 M 195 395 L 203 402"
            stroke="#2a2a2a"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Knee joints */}
          <circle cx="160" cy="372" r="2" fill="#3a3a3a" />
          <circle cx="190" cy="370" r="2" fill="#3a3a3a" />
        </motion.g>

        {/* === TAIL FEATHERS (hotspot) === */}
        <motion.g
          {...hotspotProps("crane_tail")}
          animate={{ rotate: [0, 1.5, -1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "220px 300px" }}
        >
          {/* Black tail plumes — drooping elegantly */}
          <path
            d="M 210 290 Q 240 300, 265 320 Q 280 335, 275 350"
            stroke="#1a1a1a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 215 285 Q 250 295, 275 310 Q 295 325, 290 345"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 218 295 Q 245 305, 260 325 Q 270 340, 265 360"
            stroke="#222"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Feather detail strokes */}
          <path
            d="M 250 310 Q 260 315, 268 325"
            stroke="#333"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M 240 305 Q 255 312, 262 320"
            stroke="#333"
            strokeWidth="0.8"
            fill="none"
            opacity="0.4"
          />
        </motion.g>

        {/* === BODY (hotspot) === */}
        <motion.g
          {...hotspotProps("crane_body")}
          animate={{ y: [0, -1.5, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Main body — elegant oval */}
          <ellipse
            cx="175"
            cy="300"
            rx="50"
            ry="55"
            fill="#f0ece4"
            stroke="#d8d0c0"
            strokeWidth="0.5"
          />
          {/* Body shading */}
          <ellipse cx="175" cy="310" rx="40" ry="40" fill="#e8e2d8" opacity="0.4" />
          {/* Chest highlight */}
          <ellipse cx="165" cy="280" rx="20" ry="25" fill="#f8f5f0" opacity="0.5" />
        </motion.g>

        {/* === LEFT WING (hotspot) === */}
        <motion.g
          {...hotspotProps("crane_wing_left")}
          animate={{ rotate: [0, -1.5, 0.5, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          style={{ transformOrigin: "145px 280px" }}
        >
          {/* Wing base — white */}
          <path
            d="M 145 270 Q 120 275, 95 290 Q 75 302, 70 310
               Q 80 305, 95 300 Q 110 295, 130 285 Z"
            fill="#f0ece4"
            stroke="#d0c8b8"
            strokeWidth="0.5"
          />
          {/* Wing middle feathers — gray transition */}
          <path
            d="M 130 285 Q 105 295, 80 310 Q 65 320, 58 330
               Q 70 322, 85 315 Q 105 305, 125 293 Z"
            fill="#b0aaa0"
            stroke="#a09888"
            strokeWidth="0.3"
          />
          {/* Black wing tips */}
          <path
            d="M 125 293 Q 95 310, 70 328 Q 52 340, 45 350
               Q 55 340, 72 330 Q 95 318, 118 300 Z"
            fill="#1a1a1a"
          />
          {/* Feather line details */}
          <path d="M 110 290 Q 95 298, 80 310" stroke="#888" strokeWidth="0.4" fill="none" opacity="0.5" />
          <path d="M 100 298 Q 85 308, 68 322" stroke="#555" strokeWidth="0.4" fill="none" opacity="0.4" />
        </motion.g>

        {/* === RIGHT WING (hotspot) === */}
        <motion.g
          {...hotspotProps("crane_wing_right")}
          animate={{ rotate: [0, 1.5, -0.5, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          style={{ transformOrigin: "205px 280px" }}
        >
          {/* Wing base — white */}
          <path
            d="M 205 270 Q 225 272, 245 280 Q 260 288, 268 295
               Q 255 290, 240 285 Q 220 278, 210 275 Z"
            fill="#f0ece4"
            stroke="#d0c8b8"
            strokeWidth="0.5"
          />
          {/* Wing middle feathers */}
          <path
            d="M 220 280 Q 245 288, 262 298 Q 275 306, 280 312
               Q 268 305, 252 298 Q 235 290, 222 285 Z"
            fill="#b0aaa0"
            stroke="#a09888"
            strokeWidth="0.3"
          />
          {/* Black wing tips */}
          <path
            d="M 235 292 Q 258 302, 275 314 Q 288 322, 292 330
               Q 282 322, 268 314 Q 250 304, 238 296 Z"
            fill="#1a1a1a"
          />
          {/* Feather detail */}
          <path d="M 245 290 Q 258 296, 270 306" stroke="#888" strokeWidth="0.4" fill="none" opacity="0.5" />
        </motion.g>

        {/* === NECK (connects body to head) === */}
        <path
          d="M 170 255 Q 165 230, 160 210 Q 155 190, 152 170
             Q 150 155, 152 140 Q 156 140, 158 155
             Q 160 170, 163 190 Q 167 210, 172 230 Q 176 248, 178 260"
          fill="#f0ece4"
          stroke="#d8d0c0"
          strokeWidth="0.5"
        />
        {/* Black neck stripe */}
        <path
          d="M 153 165 Q 152 150, 155 140 Q 145 140, 142 155
             Q 140 168, 143 180 Q 148 175, 153 165"
          fill="#1a1a1a"
        />

        {/* === HEAD GROUP — animated === */}
        <motion.g
          animate={{ rotate: [0, 2, -1, 0], y: [0, -1, 0.5, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "155px 140px" }}
        >
          {/* Head base */}
          <ellipse cx="155" cy="128" rx="14" ry="16" fill="#f0ece4" />
          {/* White cheek */}
          <ellipse cx="152" cy="132" rx="8" ry="9" fill="#f8f5f0" opacity="0.6" />

          {/* Black face mask — characteristic marking */}
          <path
            d="M 142 120 Q 148 115, 155 118 Q 160 115, 165 120
               Q 168 125, 165 130 Q 160 128, 155 130
               Q 148 128, 142 130 Q 138 125, 142 120"
            fill="#1a1a1a"
            opacity="0.85"
          />

          {/* === RED CROWN / CREST (hotspot) === */}
          <motion.g
            {...hotspotProps("crane_crest")}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "155px 112px" }}
          >
            <ellipse cx="155" cy="112" rx="8" ry="5" fill="#cc2222" />
            <ellipse cx="155" cy="112" rx="5" ry="3" fill="#ee3333" opacity="0.6" />
          </motion.g>

          {/* Eye */}
          <circle cx="148" cy="125" r="2" fill="#1a1a1a" />
          <circle cx="148" cy="124.5" r="0.7" fill="#fff" opacity="0.8" />

          {/* === BEAK (hotspot) === */}
          <motion.g
            {...hotspotProps("crane_beak")}
            animate={{ rotate: [0, 0.5, -0.3, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{ transformOrigin: "142px 130px" }}
          >
            {/* Upper beak */}
            <path
              d="M 142 128 L 110 125 Q 108 126, 110 127 L 142 131"
              fill="#5a6a50"
              stroke="#4a5a40"
              strokeWidth="0.3"
            />
            {/* Lower beak */}
            <path
              d="M 142 131 L 112 128 Q 110 127, 110 127"
              fill="#6a7a5a"
              stroke="#5a6a4a"
              strokeWidth="0.3"
            />
            {/* Beak highlight */}
            <line
              x1="115"
              y1="126.5"
              x2="138"
              y2="129"
              stroke="#7a8a6a"
              strokeWidth="0.4"
              opacity="0.5"
            />
          </motion.g>
        </motion.g>
      </g>

      {/* ========== SMALL BAMBOO ACCENTS (bottom-left) ========== */}
      <g opacity="0.35">
        <line x1="40" y1="430" x2="42" y2="350" stroke="#3a5a3a" strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="440" x2="54" y2="370" stroke="#3a5a3a" strokeWidth="1.5" strokeLinecap="round" />
        {/* Bamboo leaves */}
        <path d="M 42 365 Q 30 358, 25 350" stroke="#3a5a3a" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M 42 375 Q 55 368, 62 360" stroke="#3a5a3a" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M 54 385 Q 42 380, 38 374" stroke="#3a5a3a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>

      {/* ========== SEAL STAMP (traditional Korean) ========== */}
      <g transform="translate(290, 430)">
        <rect
          x="-12"
          y="-12"
          width="24"
          height="24"
          rx="2"
          fill="#c22"
          opacity="0.75"
        />
        {/* Stylized character strokes inside seal */}
        <line x1="-6" y1="-6" x2="6" y2="-6" stroke="#f8e8e8" strokeWidth="1.2" />
        <line x1="0" y1="-8" x2="0" y2="8" stroke="#f8e8e8" strokeWidth="1.2" />
        <line x1="-6" y1="2" x2="6" y2="2" stroke="#f8e8e8" strokeWidth="1" />
        <line x1="-5" y1="-4" x2="-5" y2="6" stroke="#f8e8e8" strokeWidth="0.8" />
        <line x1="5" y1="-4" x2="5" y2="6" stroke="#f8e8e8" strokeWidth="0.8" />
      </g>

      {/* ========== SUBTLE MOON (top-left) ========== */}
      <circle cx="60" cy="55" r="22" fill="#b0c8d8" opacity="0.08" />
      <circle cx="60" cy="55" r="20" fill="#c8dce8" opacity="0.05" />
    </svg>
  );
}
