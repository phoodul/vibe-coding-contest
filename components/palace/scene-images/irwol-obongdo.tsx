"use client";

import { motion } from "framer-motion";

interface IrwolObongdoSceneProps {
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
}

function HotspotOverlay({
  id,
  x,
  y,
  width,
  height,
  active,
  onClick,
}: {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <g
      data-hotspot-id={id}
      onClick={() => onClick(id)}
      style={{ cursor: "pointer" }}
    >
      {/* Invisible click area */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="transparent"
        stroke="none"
      />
      {/* Golden glow when active */}
      {active && (
        <motion.rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          fill="rgba(255, 215, 0, 0.15)"
          stroke="rgba(255, 215, 0, 0.8)"
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {/* Hover brightness overlay */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(255,255,255,0)"
        className="transition-all duration-200 hover:fill-[rgba(255,255,255,0.08)]"
      />
    </g>
  );
}

export function IrwolObongdoScene({
  activeHotspot,
  onHotspotClick,
}: IrwolObongdoSceneProps) {
  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ background: "linear-gradient(180deg, #1a0a2e 0%, #0d1b3e 100%)" }}
    >
      <defs>
        {/* ====== Gradients ====== */}
        {/* Sky gradient */}
        <linearGradient id="irwol-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1445" />
          <stop offset="40%" stopColor="#1a2a6c" />
          <stop offset="70%" stopColor="#2d4a22" />
          <stop offset="100%" stopColor="#1a3a1a" />
        </linearGradient>

        {/* Sun gradient */}
        <radialGradient id="irwol-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff5c0" />
          <stop offset="30%" stopColor="#ff6b35" />
          <stop offset="60%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#8b0000" />
        </radialGradient>

        {/* Sun glow */}
        <radialGradient id="irwol-sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(255,107,53,0.6)" />
          <stop offset="50%" stopColor="rgba(220,38,38,0.2)" />
          <stop offset="100%" stopColor="rgba(220,38,38,0)" />
        </radialGradient>

        {/* Moon gradient */}
        <radialGradient id="irwol-moon" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#f0f0ff" />
          <stop offset="40%" stopColor="#d4d4f0" />
          <stop offset="80%" stopColor="#b0b0d8" />
          <stop offset="100%" stopColor="#8888bb" />
        </radialGradient>

        {/* Moon glow */}
        <radialGradient id="irwol-moon-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(200,200,255,0.4)" />
          <stop offset="60%" stopColor="rgba(150,150,220,0.1)" />
          <stop offset="100%" stopColor="rgba(150,150,220,0)" />
        </radialGradient>

        {/* Mountain gradients */}
        <linearGradient id="irwol-mt1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8f0" />
          <stop offset="20%" stopColor="#4a7c59" />
          <stop offset="60%" stopColor="#2d5a3f" />
          <stop offset="100%" stopColor="#1a3a2a" />
        </linearGradient>
        <linearGradient id="irwol-mt2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f0f5" />
          <stop offset="15%" stopColor="#3d7a5c" />
          <stop offset="50%" stopColor="#2a5540" />
          <stop offset="100%" stopColor="#1c3c2c" />
        </linearGradient>
        <linearGradient id="irwol-mt3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="18%" stopColor="#5a8a69" />
          <stop offset="55%" stopColor="#3a6a4f" />
          <stop offset="100%" stopColor="#1a4030" />
        </linearGradient>
        <linearGradient id="irwol-mt4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0ea" />
          <stop offset="20%" stopColor="#4a7a55" />
          <stop offset="55%" stopColor="#2d5a3a" />
          <stop offset="100%" stopColor="#1a3a28" />
        </linearGradient>
        <linearGradient id="irwol-mt5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eeeef5" />
          <stop offset="22%" stopColor="#3d7050" />
          <stop offset="60%" stopColor="#285540" />
          <stop offset="100%" stopColor="#183828" />
        </linearGradient>

        {/* Water gradient */}
        <linearGradient id="irwol-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a5276" />
          <stop offset="40%" stopColor="#154360" />
          <stop offset="100%" stopColor="#0e2f44" />
        </linearGradient>

        {/* Pine tree gradient */}
        <linearGradient id="irwol-pine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d5a3f" />
          <stop offset="100%" stopColor="#1a3a28" />
        </linearGradient>

        {/* Frame gradient */}
        <linearGradient id="irwol-frame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b1a1a" />
          <stop offset="25%" stopColor="#c41e3a" />
          <stop offset="50%" stopColor="#daa520" />
          <stop offset="75%" stopColor="#c41e3a" />
          <stop offset="100%" stopColor="#8b1a1a" />
        </linearGradient>

        <linearGradient id="irwol-frame-inner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#daa520" />
          <stop offset="50%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#daa520" />
        </linearGradient>

        {/* Pine trunk */}
        <linearGradient id="irwol-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3d2b1f" />
          <stop offset="50%" stopColor="#5c3a21" />
          <stop offset="100%" stopColor="#3d2b1f" />
        </linearGradient>

        {/* Filters */}
        <filter id="irwol-glow-sun" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="irwol-glow-moon" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="irwol-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
        </filter>

        {/* Wave pattern */}
        <pattern id="irwol-wave-pattern" x="0" y="0" width="60" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M0 10 Q15 0, 30 10 Q45 20, 60 10"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* ====== Background sky ====== */}
      <rect x="15" y="15" width="570" height="370" rx="4" fill="url(#irwol-sky)" />

      {/* ====== Sun (left side) ====== */}
      <g>
        {/* Sun glow aura */}
        <motion.circle
          cx="130"
          cy="90"
          r="60"
          fill="url(#irwol-sun-glow)"
          animate={{ r: [55, 65, 55], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Sun rays */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = 130 + Math.cos(angle) * 32;
          const y1 = 90 + Math.sin(angle) * 32;
          const x2 = 130 + Math.cos(angle) * 50;
          const y2 = 90 + Math.sin(angle) * 50;
          return (
            <motion.line
              key={`ray-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ff6b35"
              strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
              strokeLinecap="round"
              opacity={0.7}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          );
        })}
        {/* Sun body */}
        <circle
          cx="130"
          cy="90"
          r="28"
          fill="url(#irwol-sun)"
          filter="url(#irwol-glow-sun)"
        />
        {/* Sun inner detail - three-legged crow (삼족오) hint */}
        <circle cx="130" cy="90" r="14" fill="rgba(255,200,50,0.3)" />
        <circle cx="130" cy="90" r="6" fill="rgba(255,220,100,0.5)" />
      </g>

      {/* ====== Moon (right side) ====== */}
      <g>
        {/* Moon glow */}
        <motion.circle
          cx="470"
          cy="90"
          r="50"
          fill="url(#irwol-moon-glow)"
          animate={{ r: [45, 52, 45], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Moon body - crescent */}
        <circle
          cx="470"
          cy="90"
          r="26"
          fill="url(#irwol-moon)"
          filter="url(#irwol-glow-moon)"
        />
        {/* Crescent shadow to create crescent shape */}
        <circle cx="480" cy="84" r="20" fill="#0c1445" opacity="0.7" />
        {/* Moon surface details */}
        <circle cx="462" cy="85" r="3" fill="rgba(150,150,200,0.3)" />
        <circle cx="468" cy="98" r="2" fill="rgba(150,150,200,0.2)" />
        <circle cx="458" cy="95" r="1.5" fill="rgba(150,150,200,0.25)" />
      </g>

      {/* ====== Five Mountain Peaks ====== */}
      {/* Peak 1 - far left */}
      <polygon
        points="60,260 120,140 180,260"
        fill="url(#irwol-mt1)"
        filter="url(#irwol-shadow)"
      />
      {/* Snow cap */}
      <polygon points="108,155 120,140 132,155 120,160" fill="rgba(230,230,245,0.8)" />

      {/* Peak 2 - left */}
      <polygon
        points="140,260 210,120 280,260"
        fill="url(#irwol-mt2)"
        filter="url(#irwol-shadow)"
      />
      <polygon points="196,137 210,120 224,137 210,145" fill="rgba(235,235,248,0.85)" />

      {/* Peak 3 - center (tallest) */}
      <polygon
        points="230,260 300,95 370,260"
        fill="url(#irwol-mt3)"
        filter="url(#irwol-shadow)"
      />
      <polygon points="283,115 300,95 317,115 300,125" fill="rgba(240,240,255,0.9)" />
      {/* Ridge detail */}
      <line x1="300" y1="95" x2="300" y2="260" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* Peak 4 - right */}
      <polygon
        points="320,260 390,125 460,260"
        fill="url(#irwol-mt4)"
        filter="url(#irwol-shadow)"
      />
      <polygon points="377,142 390,125 403,142 390,150" fill="rgba(235,235,248,0.85)" />

      {/* Peak 5 - far right */}
      <polygon
        points="420,260 480,145 540,260"
        fill="url(#irwol-mt5)"
        filter="url(#irwol-shadow)"
      />
      <polygon points="468,160 480,145 492,160 480,167" fill="rgba(230,230,245,0.8)" />

      {/* Mountain mist layer */}
      <rect x="15" y="230" width="570" height="40" fill="rgba(200,220,240,0.06)" />

      {/* ====== Pine Trees (left) ====== */}
      <g>
        {/* Trunk */}
        <path
          d="M85,340 Q80,300 75,270 Q78,260 85,255 Q92,260 95,270 Q90,300 85,340"
          fill="url(#irwol-trunk)"
          stroke="#2a1a0f"
          strokeWidth="0.5"
        />
        {/* Curved trunk extension */}
        <path
          d="M85,255 Q70,240 60,230"
          fill="none"
          stroke="#4a3020"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M85,270 Q100,250 115,245"
          fill="none"
          stroke="#4a3020"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Foliage clusters - traditional 소나무 style */}
        <ellipse cx="55" cy="225" rx="28" ry="16" fill="#1a4a2a" />
        <ellipse cx="55" cy="225" rx="24" ry="13" fill="#2d6a3f" />
        <ellipse cx="55" cy="222" rx="18" ry="9" fill="#3a7a4a" />

        <ellipse cx="120" cy="240" rx="24" ry="14" fill="#1a4a2a" />
        <ellipse cx="120" cy="240" rx="20" ry="11" fill="#2d6a3f" />
        <ellipse cx="120" cy="237" rx="15" ry="8" fill="#3a7a4a" />

        <ellipse cx="80" cy="248" rx="22" ry="12" fill="#1a4a2a" />
        <ellipse cx="80" cy="248" rx="18" ry="9" fill="#2d6a3f" />
        <ellipse cx="80" cy="245" rx="13" ry="7" fill="#3a7a4a" />

        {/* Additional small branch cluster */}
        <ellipse cx="68" cy="258" rx="16" ry="10" fill="#1a4a2a" />
        <ellipse cx="68" cy="256" rx="12" ry="7" fill="#2d6a3f" />
      </g>

      {/* ====== Pine Trees (right) ====== */}
      <g>
        {/* Trunk */}
        <path
          d="M515,340 Q520,300 525,270 Q522,260 515,255 Q508,260 505,270 Q510,300 515,340"
          fill="url(#irwol-trunk)"
          stroke="#2a1a0f"
          strokeWidth="0.5"
        />
        {/* Curved trunk extension */}
        <path
          d="M515,255 Q530,240 540,230"
          fill="none"
          stroke="#4a3020"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M515,270 Q500,250 485,245"
          fill="none"
          stroke="#4a3020"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Foliage clusters */}
        <ellipse cx="545" cy="225" rx="28" ry="16" fill="#1a4a2a" />
        <ellipse cx="545" cy="225" rx="24" ry="13" fill="#2d6a3f" />
        <ellipse cx="545" cy="222" rx="18" ry="9" fill="#3a7a4a" />

        <ellipse cx="480" cy="240" rx="24" ry="14" fill="#1a4a2a" />
        <ellipse cx="480" cy="240" rx="20" ry="11" fill="#2d6a3f" />
        <ellipse cx="480" cy="237" rx="15" ry="8" fill="#3a7a4a" />

        <ellipse cx="520" cy="248" rx="22" ry="12" fill="#1a4a2a" />
        <ellipse cx="520" cy="248" rx="18" ry="9" fill="#2d6a3f" />
        <ellipse cx="520" cy="245" rx="13" ry="7" fill="#3a7a4a" />

        <ellipse cx="532" cy="258" rx="16" ry="10" fill="#1a4a2a" />
        <ellipse cx="532" cy="256" rx="12" ry="7" fill="#2d6a3f" />
      </g>

      {/* ====== Water / Waves ====== */}
      <g>
        {/* Water base */}
        <rect x="15" y="295" width="570" height="90" fill="url(#irwol-water)" />

        {/* Animated wave rows */}
        {[0, 1, 2, 3, 4].map((row) => (
          <motion.g
            key={`wave-row-${row}`}
            animate={{ x: [0, row % 2 === 0 ? 15 : -15, 0] }}
            transition={{
              duration: 4 + row * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {Array.from({ length: 10 }).map((_, col) => {
              const baseX = col * 60 + (row % 2 === 0 ? 0 : 30);
              const baseY = 300 + row * 18;
              return (
                <g key={`wave-${row}-${col}`}>
                  {/* Wave curve */}
                  <path
                    d={`M${baseX},${baseY} Q${baseX + 15},${baseY - 8} ${baseX + 30},${baseY} Q${baseX + 45},${baseY + 8} ${baseX + 60},${baseY}`}
                    fill="none"
                    stroke="rgba(100,180,220,0.3)"
                    strokeWidth="1.5"
                  />
                  {/* Foam dots */}
                  <circle
                    cx={baseX + 15}
                    cy={baseY - 4}
                    r="1.5"
                    fill="rgba(255,255,255,0.2)"
                  />
                  <circle
                    cx={baseX + 30}
                    cy={baseY + 1}
                    r="1"
                    fill="rgba(255,255,255,0.15)"
                  />
                </g>
              );
            })}
          </motion.g>
        ))}

        {/* Traditional Korean wave foam - larger curls */}
        <motion.g
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Left foam curl */}
          <path
            d="M60,320 Q50,310 60,305 Q70,300 80,308 Q75,315 65,318 Z"
            fill="rgba(255,255,255,0.12)"
          />
          {/* Center foam curl */}
          <path
            d="M280,325 Q270,315 280,310 Q290,305 300,313 Q295,320 285,323 Z"
            fill="rgba(255,255,255,0.1)"
          />
          {/* Right foam curl */}
          <path
            d="M500,318 Q490,308 500,303 Q510,298 520,306 Q515,313 505,316 Z"
            fill="rgba(255,255,255,0.12)"
          />
        </motion.g>

        {/* Wave pattern overlay */}
        <rect x="15" y="295" width="570" height="90" fill="url(#irwol-wave-pattern)" opacity="0.5" />

        {/* Water reflection shimmer */}
        <motion.rect
          x="15"
          y="295"
          width="570"
          height="90"
          fill="rgba(100,200,255,0.03)"
          animate={{ opacity: [0.02, 0.06, 0.02] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      {/* ====== Ornate Frame ====== */}
      {/* Outer frame */}
      <rect
        x="2"
        y="2"
        width="596"
        height="396"
        rx="6"
        fill="none"
        stroke="url(#irwol-frame)"
        strokeWidth="12"
      />
      {/* Inner gold border */}
      <rect
        x="12"
        y="12"
        width="576"
        height="376"
        rx="3"
        fill="none"
        stroke="url(#irwol-frame-inner)"
        strokeWidth="2"
      />
      {/* Outer gold accent */}
      <rect
        x="0"
        y="0"
        width="600"
        height="400"
        rx="8"
        fill="none"
        stroke="#8b6914"
        strokeWidth="1.5"
      />

      {/* Corner ornaments */}
      {[
        { cx: 16, cy: 16 },
        { cx: 584, cy: 16 },
        { cx: 16, cy: 384 },
        { cx: 584, cy: 384 },
      ].map((corner, i) => (
        <g key={`corner-${i}`}>
          <circle cx={corner.cx} cy={corner.cy} r="5" fill="#daa520" />
          <circle cx={corner.cx} cy={corner.cy} r="3" fill="#ffd700" />
          <circle cx={corner.cx} cy={corner.cy} r="1.5" fill="#fff5c0" />
        </g>
      ))}

      {/* Frame decorative dots along top and bottom */}
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={`frame-dot-${i}`}>
          <circle cx={67 * (i + 1)} cy="7" r="2" fill="#daa520" opacity="0.6" />
          <circle cx={67 * (i + 1)} cy="393" r="2" fill="#daa520" opacity="0.6" />
        </g>
      ))}

      {/* ====== Hotspot Overlays ====== */}
      {/* Sun */}
      <HotspotOverlay
        id="sun"
        x={90}
        y={50}
        width={80}
        height={80}
        active={activeHotspot === "sun"}
        onClick={onHotspotClick}
      />
      {/* Moon */}
      <HotspotOverlay
        id="moon"
        x={430}
        y={50}
        width={80}
        height={80}
        active={activeHotspot === "moon"}
        onClick={onHotspotClick}
      />
      {/* Peak 1 */}
      <HotspotOverlay
        id="peak1"
        x={70}
        y={140}
        width={100}
        height={120}
        active={activeHotspot === "peak1"}
        onClick={onHotspotClick}
      />
      {/* Peak 2 */}
      <HotspotOverlay
        id="peak2"
        x={160}
        y={120}
        width={100}
        height={140}
        active={activeHotspot === "peak2"}
        onClick={onHotspotClick}
      />
      {/* Peak 3 */}
      <HotspotOverlay
        id="peak3"
        x={250}
        y={95}
        width={100}
        height={165}
        active={activeHotspot === "peak3"}
        onClick={onHotspotClick}
      />
      {/* Peak 4 */}
      <HotspotOverlay
        id="peak4"
        x={340}
        y={125}
        width={100}
        height={135}
        active={activeHotspot === "peak4"}
        onClick={onHotspotClick}
      />
      {/* Peak 5 */}
      <HotspotOverlay
        id="peak5"
        x={430}
        y={145}
        width={100}
        height={115}
        active={activeHotspot === "peak5"}
        onClick={onHotspotClick}
      />
      {/* Pine left */}
      <HotspotOverlay
        id="pine_left"
        x={30}
        y={215}
        width={120}
        height={130}
        active={activeHotspot === "pine_left"}
        onClick={onHotspotClick}
      />
      {/* Pine right */}
      <HotspotOverlay
        id="pine_right"
        x={450}
        y={215}
        width={120}
        height={130}
        active={activeHotspot === "pine_right"}
        onClick={onHotspotClick}
      />
      {/* Waves */}
      <HotspotOverlay
        id="waves"
        x={15}
        y={295}
        width={570}
        height={88}
        active={activeHotspot === "waves"}
        onClick={onHotspotClick}
      />
    </svg>
  );
}
