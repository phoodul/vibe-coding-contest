"use client";

import { motion } from "framer-motion";

interface DragonCeilingSceneProps {
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
}

export function DragonCeilingScene({
  activeHotspot,
  onHotspotClick,
}: DragonCeilingSceneProps) {
  const isActive = (id: string) => activeHotspot === id;

  return (
    <svg
      viewBox="0 0 700 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ background: "#0a0e2a" }}
    >
      <defs>
        {/* Golden glow filter for active hotspots */}
        <filter id="dc-golden-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feFlood floodColor="#FFD700" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle eye glow */}
        <filter id="dc-eye-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="#FF4500" floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Pearl radial glow */}
        <radialGradient id="dc-pearl-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0.3" />
        </radialGradient>

        {/* Dragon body gradient */}
        <linearGradient id="dc-dragon-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E8B57" />
          <stop offset="30%" stopColor="#DAA520" />
          <stop offset="60%" stopColor="#228B22" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Dragon belly gradient */}
        <linearGradient id="dc-dragon-belly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>

        {/* Background ceiling gradient */}
        <radialGradient id="dc-ceiling-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1f4a" />
          <stop offset="100%" stopColor="#080c24" />
        </radialGradient>

        {/* Cloud gradients for 5 colors */}
        <radialGradient id="dc-cloud-blue" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2C5F8A" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="dc-cloud-red" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#D94A4A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8A2C2C" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="dc-cloud-yellow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#D9C84A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8A7A2C" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="dc-cloud-white" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E8E8F0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A0A0B0" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="dc-cloud-dark" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4A4A6A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2A2A3A" stopOpacity="0.3" />
        </radialGradient>

        {/* Phoenix gradient */}
        <linearGradient id="dc-phoenix-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6347" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF4500" />
        </linearGradient>
      </defs>

      {/* ========== BACKGROUND ========== */}
      <rect width="700" height="300" fill="url(#dc-ceiling-bg)" />

      {/* Coffered ceiling frame pattern (격자 문양) */}
      <g opacity="0.15" stroke="#DAA520" strokeWidth="0.8" fill="none">
        {/* Outer frame */}
        <rect x="10" y="8" width="680" height="284" rx="3" />
        <rect x="20" y="16" width="660" height="268" rx="2" />
        {/* Inner grid lines — vertical */}
        {[140, 280, 420, 560].map((x) => (
          <line key={`v${x}`} x1={x} y1="16" x2={x} y2="284" />
        ))}
        {/* Inner grid lines — horizontal */}
        {[100, 200].map((y) => (
          <line key={`h${y}`} x1="20" y1={y} x2="680" y2={y} />
        ))}
      </g>

      {/* Decorative corner ornaments */}
      {[
        [30, 24],
        [660, 24],
        [30, 268],
        [660, 268],
      ].map(([cx, cy], i) => (
        <g key={`corner-${i}`} opacity="0.2">
          <circle cx={cx} cy={cy} r="8" stroke="#DAA520" strokeWidth="0.6" fill="none" />
          <circle cx={cx} cy={cy} r="4" stroke="#DAA520" strokeWidth="0.4" fill="none" />
          <circle cx={cx} cy={cy} r="1.5" fill="#DAA520" />
        </g>
      ))}

      {/* Subtle star/dot pattern across ceiling */}
      <g opacity="0.08">
        {Array.from({ length: 40 }, (_, i) => {
          const x = 30 + (i % 10) * 65;
          const y = 30 + Math.floor(i / 10) * 65;
          return <circle key={`star-${i}`} cx={x} cy={y} r="1" fill="#FFD700" />;
        })}
      </g>

      {/* ========== LEFT CLOUD CLUSTER (오색 구름) ========== */}
      <motion.g
        animate={{ x: [0, 6, 0, -4, 0], y: [0, -3, 1, -2, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ cursor: "pointer" }}
        filter={isActive("cloud_left") ? "url(#dc-golden-glow)" : undefined}
        onClick={() => onHotspotClick("cloud_left")}
        className="hover:brightness-125 transition-all"
      >
        {/* Blue cloud */}
        <ellipse cx="95" cy="70" rx="40" ry="18" fill="url(#dc-cloud-blue)" />
        <ellipse cx="110" cy="62" rx="25" ry="12" fill="url(#dc-cloud-blue)" />
        {/* Red cloud */}
        <ellipse cx="70" cy="100" rx="30" ry="14" fill="url(#dc-cloud-red)" />
        <ellipse cx="55" cy="92" rx="18" ry="10" fill="url(#dc-cloud-red)" />
        {/* Yellow cloud */}
        <ellipse cx="120" cy="95" rx="28" ry="13" fill="url(#dc-cloud-yellow)" />
        {/* White wisps */}
        <ellipse cx="85" cy="55" rx="22" ry="8" fill="url(#dc-cloud-white)" />
        {/* Dark cloud */}
        <ellipse cx="60" cy="115" rx="25" ry="10" fill="url(#dc-cloud-dark)" />
        {/* Swirl details */}
        <path
          d="M75 70 Q85 60 100 65 Q110 55 120 62"
          stroke="#FFD700"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M55 95 Q65 85 80 90 Q90 82 100 88"
          stroke="#FFD700"
          strokeWidth="0.4"
          fill="none"
          opacity="0.25"
        />
      </motion.g>

      {/* ========== RIGHT CLOUD CLUSTER (오색 구름) ========== */}
      <motion.g
        animate={{ x: [0, -5, 0, 4, 0], y: [0, 2, -3, 1, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ cursor: "pointer" }}
        filter={isActive("cloud_right") ? "url(#dc-golden-glow)" : undefined}
        onClick={() => onHotspotClick("cloud_right")}
        className="hover:brightness-125 transition-all"
      >
        {/* White cloud */}
        <ellipse cx="600" cy="65" rx="38" ry="16" fill="url(#dc-cloud-white)" />
        <ellipse cx="585" cy="58" rx="22" ry="10" fill="url(#dc-cloud-white)" />
        {/* Yellow cloud */}
        <ellipse cx="630" cy="90" rx="32" ry="14" fill="url(#dc-cloud-yellow)" />
        {/* Blue cloud */}
        <ellipse cx="590" cy="100" rx="28" ry="12" fill="url(#dc-cloud-blue)" />
        {/* Red cloud */}
        <ellipse cx="625" cy="110" rx="22" ry="10" fill="url(#dc-cloud-red)" />
        {/* Dark cloud */}
        <ellipse cx="645" cy="75" rx="20" ry="9" fill="url(#dc-cloud-dark)" />
        {/* Swirl details */}
        <path
          d="M585 65 Q600 55 615 60 Q625 50 640 58"
          stroke="#FFD700"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
        />
      </motion.g>

      {/* ========== DRAGON TAIL ========== */}
      <g
        style={{ cursor: "pointer" }}
        filter={isActive("dragon_tail") ? "url(#dc-golden-glow)" : undefined}
        onClick={() => onHotspotClick("dragon_tail")}
        className="hover:brightness-125 transition-all"
      >
        {/* Tail — flowing curve from right side */}
        <path
          d="M560 220 Q580 200 570 170 Q555 140 580 120 Q600 105 590 85
             Q585 72 595 60 L600 55 Q598 50 592 52 L588 58
             Q580 70 585 82 Q595 100 575 118 Q550 138 560 168
             Q570 195 545 218 Z"
          fill="url(#dc-dragon-body)"
          stroke="#B8860B"
          strokeWidth="1"
        />
        {/* Tail fin/tuft */}
        <path
          d="M595 60 Q610 45 615 35 Q608 40 600 38 Q605 48 598 55"
          fill="#DAA520"
          stroke="#B8860B"
          strokeWidth="0.5"
        />
        <path
          d="M592 52 Q585 38 578 32 Q583 40 580 48 Q585 50 588 55"
          fill="#228B22"
          stroke="#2E8B57"
          strokeWidth="0.5"
        />
        {/* Tail scales */}
        {[
          [570, 170],
          [575, 145],
          [585, 120],
          [590, 95],
          [587, 75],
        ].map(([cx, cy], i) => (
          <path
            key={`tail-scale-${i}`}
            d={`M${cx - 4} ${cy} Q${cx} ${cy - 5} ${cx + 4} ${cy}`}
            stroke="#FFD700"
            strokeWidth="0.5"
            fill="none"
            opacity="0.5"
          />
        ))}
      </g>

      {/* ========== DRAGON BODY (mid section) ========== */}
      <g
        style={{ cursor: "pointer" }}
        filter={isActive("dragon_body") ? "url(#dc-golden-glow)" : undefined}
        onClick={() => onHotspotClick("dragon_body")}
        className="hover:brightness-125 transition-all"
      >
        {/* Main serpentine body — central S-curve */}
        <path
          d="M240 170 Q260 140 300 145 Q340 150 360 130 Q380 110 420 115
             Q460 120 480 140 Q500 160 530 155 Q550 150 560 170
             Q570 185 555 200 Q535 215 510 200 Q490 185 460 190
             Q430 195 410 180 Q390 165 360 170 Q330 175 310 190
             Q290 205 265 195 Q245 185 240 170 Z"
          fill="url(#dc-dragon-body)"
          stroke="#B8860B"
          strokeWidth="1.2"
        />
        {/* Belly line */}
        <path
          d="M260 180 Q290 195 320 185 Q350 175 380 170 Q410 175 440 185
             Q470 190 500 180 Q530 170 545 180"
          stroke="#FFD700"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        {/* Scales pattern along body */}
        {[
          [280, 160],
          [310, 155],
          [340, 148],
          [370, 140],
          [400, 135],
          [430, 138],
          [460, 145],
          [490, 155],
          [520, 162],
        ].map(([cx, cy], i) => (
          <g key={`scale-${i}`} opacity="0.5">
            <path
              d={`M${cx - 6} ${cy + 2} Q${cx} ${cy - 6} ${cx + 6} ${cy + 2}`}
              stroke="#FFD700"
              strokeWidth="0.6"
              fill="none"
            />
          </g>
        ))}
        {/* Dorsal spines */}
        {[
          [290, 152],
          [330, 145],
          [370, 128],
          [410, 120],
          [450, 128],
          [490, 145],
          [530, 155],
        ].map(([cx, cy], i) => (
          <path
            key={`spine-${i}`}
            d={`M${cx - 3} ${cy} L${cx} ${cy - 10} L${cx + 3} ${cy}`}
            fill="#228B22"
            stroke="#2E8B57"
            strokeWidth="0.4"
            opacity="0.7"
          />
        ))}
      </g>

      {/* ========== DRAGON CLAW + PEARL (여의주) ========== */}
      <g
        style={{ cursor: "pointer" }}
        filter={isActive("dragon_claw") ? "url(#dc-golden-glow)" : undefined}
        onClick={() => onHotspotClick("dragon_claw")}
        className="hover:brightness-125 transition-all"
      >
        {/* Front left arm */}
        <path
          d="M280 175 Q270 190 260 210 Q255 225 265 235"
          stroke="url(#dc-dragon-body)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Claw fingers gripping pearl */}
        <path
          d="M265 235 L255 250 M265 235 L268 252 M265 235 L275 248 M265 235 L252 242"
          stroke="#DAA520"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Claw tips */}
        {[
          [255, 250],
          [268, 252],
          [275, 248],
          [252, 242],
        ].map(([x, y], i) => (
          <circle key={`claw-${i}`} cx={x} cy={y} r="1.5" fill="#FFFFFF" opacity="0.8" />
        ))}

        {/* Pearl / 여의주 */}
        <motion.circle
          cx="265"
          cy="258"
          r="14"
          fill="url(#dc-pearl-grad)"
          animate={{
            filter: [
              "drop-shadow(0 0 4px #FFD700)",
              "drop-shadow(0 0 10px #FFD700)",
              "drop-shadow(0 0 4px #FFD700)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Pearl inner detail */}
        <circle cx="265" cy="258" r="8" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.4" />
        <circle cx="261" cy="254" r="3" fill="#FFFFFF" opacity="0.5" />
        {/* Pearl flame wisps */}
        <path
          d="M250 258 Q245 250 248 240"
          stroke="#FF6347"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M280 258 Q285 248 282 238"
          stroke="#FF6347"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
      </g>

      {/* ========== DRAGON HEAD ========== */}
      <g
        style={{ cursor: "pointer" }}
        filter={isActive("dragon_head") ? "url(#dc-golden-glow)" : undefined}
        onClick={() => onHotspotClick("dragon_head")}
        className="hover:brightness-125 transition-all"
      >
        {/* Neck connecting to body */}
        <path
          d="M240 170 Q220 160 200 150 Q180 142 170 135"
          stroke="url(#dc-dragon-body)"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
        />

        {/* Head shape — large, facing left/forward */}
        <path
          d="M170 135 Q150 125 130 118 Q110 112 95 120 Q80 128 75 140
             Q72 150 78 160 Q85 170 100 172 Q115 174 130 168
             Q145 162 160 155 Q170 150 175 142 Z"
          fill="#2E8B57"
          stroke="#B8860B"
          strokeWidth="1.2"
        />

        {/* Head top / crown */}
        <path
          d="M170 135 Q160 120 145 115 Q130 112 120 118 Q105 115 95 120"
          fill="#228B22"
          stroke="#B8860B"
          strokeWidth="0.8"
        />

        {/* Jaw / lower */}
        <path
          d="M95 120 Q80 130 78 142 Q76 152 80 160 Q85 168 100 172
             Q110 168 105 155 Q100 145 95 140 Z"
          fill="#1B6B3A"
          stroke="#B8860B"
          strokeWidth="0.8"
        />

        {/* Snout detail */}
        <path
          d="M95 120 Q85 125 80 135"
          stroke="#DAA520"
          strokeWidth="0.6"
          fill="none"
        />

        {/* Horns */}
        <path
          d="M145 115 Q150 95 155 80 Q152 85 148 90 Q146 100 143 112"
          fill="#B8860B"
          stroke="#DAA520"
          strokeWidth="0.6"
        />
        <path
          d="M125 113 Q128 92 125 75 Q124 82 122 90 Q121 100 123 112"
          fill="#B8860B"
          stroke="#DAA520"
          strokeWidth="0.6"
        />

        {/* Fierce eyes */}
        <motion.g
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Left eye */}
          <ellipse cx="118" cy="130" rx="6" ry="4" fill="#1a0a00" />
          <ellipse cx="118" cy="130" rx="4" ry="3" fill="#FF4500" filter="url(#dc-eye-glow)" />
          <ellipse cx="117" cy="129" rx="1.5" ry="2" fill="#FFD700" />
          <circle cx="116" cy="128" r="0.8" fill="#FFFFFF" />

          {/* Right eye */}
          <ellipse cx="138" cy="126" rx="5.5" ry="3.5" fill="#1a0a00" />
          <ellipse cx="138" cy="126" rx="3.5" ry="2.5" fill="#FF4500" filter="url(#dc-eye-glow)" />
          <ellipse cx="137" cy="125" rx="1.5" ry="1.8" fill="#FFD700" />
          <circle cx="136" cy="124" r="0.8" fill="#FFFFFF" />
        </motion.g>

        {/* Brow ridges */}
        <path d="M110 125 Q118 120 126 124" stroke="#B8860B" strokeWidth="1" fill="none" />
        <path d="M130 121 Q138 118 146 122" stroke="#B8860B" strokeWidth="1" fill="none" />

        {/* Nostrils */}
        <circle cx="90" cy="133" r="2" fill="#0a0a0a" opacity="0.8" />
        <circle cx="96" cy="131" r="1.8" fill="#0a0a0a" opacity="0.8" />
        {/* Nostril smoke wisps */}
        <motion.g
          animate={{ opacity: [0, 0.3, 0], y: [0, -5, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
        >
          <path d="M88 130 Q85 124 87 118" stroke="#AAAACC" strokeWidth="0.8" fill="none" />
          <path d="M94 128 Q92 122 94 116" stroke="#AAAACC" strokeWidth="0.6" fill="none" />
        </motion.g>

        {/* Whiskers (수염) — long flowing */}
        <path
          d="M85 145 Q60 150 40 158 Q25 164 15 175"
          stroke="#DAA520"
          strokeWidth="1.2"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M88 150 Q65 158 45 168 Q30 178 25 190"
          stroke="#DAA520"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M90 155 Q70 165 55 180 Q45 190 42 205"
          stroke="#B8860B"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />
        {/* Upper whiskers */}
        <path
          d="M92 125 Q70 115 50 110 Q35 108 20 112"
          stroke="#DAA520"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M95 120 Q75 108 55 100 Q40 95 25 98"
          stroke="#B8860B"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />

        {/* Mane / flowing hair */}
        <path
          d="M160 140 Q165 155 160 170 Q155 180 150 185"
          stroke="#DAA520"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M155 138 Q162 150 158 165 Q154 175 148 182"
          stroke="#FFD700"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M165 142 Q170 158 168 175 Q165 185 160 192"
          stroke="#B8860B"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />

        {/* Teeth */}
        <path
          d="M88 140 L85 147 L92 142"
          fill="#FFFFFF"
          opacity="0.8"
        />
        <path
          d="M95 138 L93 146 L99 140"
          fill="#FFFFFF"
          opacity="0.8"
        />
        <path
          d="M82 142 L78 148 L85 144"
          fill="#FFFFFF"
          opacity="0.7"
        />

        {/* Head scales */}
        {[
          [130, 135],
          [140, 132],
          [150, 134],
          [115, 140],
          [125, 142],
        ].map(([cx, cy], i) => (
          <path
            key={`hscale-${i}`}
            d={`M${cx - 3} ${cy} Q${cx} ${cy - 3} ${cx + 3} ${cy}`}
            stroke="#FFD700"
            strokeWidth="0.4"
            fill="none"
            opacity="0.4"
          />
        ))}
      </g>

      {/* ========== PHOENIX (봉황) — bottom-right corner ========== */}
      <g
        style={{ cursor: "pointer" }}
        filter={isActive("phoenix") ? "url(#dc-golden-glow)" : undefined}
        onClick={() => onHotspotClick("phoenix")}
        className="hover:brightness-125 transition-all"
      >
        {/* Phoenix body */}
        <path
          d="M620 240 Q630 225 640 230 Q650 220 645 210
             Q640 200 630 205 Q625 195 618 200
             Q612 192 610 200 Q605 195 600 202
             Q595 200 598 210 Q592 215 600 220
             Q595 225 602 225 Q600 232 608 232 Q610 240 620 240 Z"
          fill="url(#dc-phoenix-grad)"
          stroke="#FFD700"
          strokeWidth="0.8"
          opacity="0.7"
        />
        {/* Phoenix head crest */}
        <path
          d="M645 210 Q650 200 655 195 Q652 198 648 196 Q650 202 645 208"
          fill="#FF6347"
          stroke="#FFD700"
          strokeWidth="0.4"
          opacity="0.7"
        />
        <path
          d="M645 210 Q648 198 645 190 Q644 196 642 194 Q644 200 643 208"
          fill="#FF4500"
          stroke="#FFD700"
          strokeWidth="0.3"
          opacity="0.6"
        />
        {/* Phoenix eye */}
        <circle cx="642" cy="213" r="1.5" fill="#FFD700" />
        <circle cx="642" cy="213" r="0.6" fill="#000" />
        {/* Phoenix beak */}
        <path d="M648 215 L654 213 L648 217 Z" fill="#FFD700" opacity="0.8" />
        {/* Phoenix tail feathers — flowing */}
        <path
          d="M600 225 Q580 235 565 250 Q555 260 550 270"
          stroke="#FF6347"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M602 228 Q585 240 572 255 Q565 265 562 275"
          stroke="#FFD700"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M605 230 Q590 242 580 258 Q575 268 574 278"
          stroke="#FF4500"
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />
        {/* Phoenix wing detail */}
        <path
          d="M618 220 Q608 215 600 218 Q595 210 590 215"
          stroke="#FFD700"
          strokeWidth="0.6"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M622 225 Q612 222 605 225"
          stroke="#FFD700"
          strokeWidth="0.4"
          fill="none"
          opacity="0.4"
        />
      </g>

      {/* ========== ADDITIONAL SMALL CLOUDS (atmosphere) ========== */}
      <motion.g
        opacity="0.2"
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="350" cy="35" rx="30" ry="8" fill="#4A90D9" />
        <ellipse cx="380" cy="38" rx="20" ry="6" fill="#D9C84A" />
      </motion.g>
      <motion.g
        opacity="0.15"
        animate={{ x: [0, -6, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="320" cy="265" rx="25" ry="7" fill="#D94A4A" />
        <ellipse cx="350" cy="268" rx="18" ry="5" fill="#E8E8F0" />
      </motion.g>

      {/* ========== DECORATIVE GOLD BORDER ACCENTS ========== */}
      <g opacity="0.12" stroke="#DAA520" strokeWidth="1" fill="none">
        {/* Top border pattern */}
        <path d="M30 12 Q50 6 70 12 Q90 18 110 12 Q130 6 150 12 Q170 18 190 12 Q210 6 230 12 Q250 18 270 12 Q290 6 310 12 Q330 18 350 12 Q370 6 390 12 Q410 18 430 12 Q450 6 470 12 Q490 18 510 12 Q530 6 550 12 Q570 18 590 12 Q610 6 630 12 Q650 18 670 12" />
        {/* Bottom border pattern */}
        <path d="M30 288 Q50 282 70 288 Q90 294 110 288 Q130 282 150 288 Q170 294 190 288 Q210 282 230 288 Q250 294 270 288 Q290 282 310 288 Q330 294 350 288 Q370 282 390 288 Q410 294 430 288 Q450 282 470 288 Q490 294 510 288 Q530 282 550 288 Q570 294 590 288 Q610 282 630 288 Q650 294 670 288" />
      </g>

      {/* ========== DRAGON WHISKER FLAME EFFECTS ========== */}
      <motion.g
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M15 175 Q10 168 12 160"
          stroke="#FF6347"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M25 190 Q18 182 20 172"
          stroke="#FF4500"
          strokeWidth="0.8"
          fill="none"
        />
      </motion.g>
    </svg>
  );
}
