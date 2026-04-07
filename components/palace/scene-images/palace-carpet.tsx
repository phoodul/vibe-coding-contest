"use client";

interface PalaceCarpetSceneProps {
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
}

export function PalaceCarpetScene({
  activeHotspot,
  onHotspotClick,
}: PalaceCarpetSceneProps) {
  const isActive = (id: string) => activeHotspot === id;

  return (
    <svg
      viewBox="0 0 700 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      role="img"
      aria-label="Royal Palace Carpet"
    >
      <defs>
        {/* ── Base Gradients ── */}
        <radialGradient id="carpet-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#8B1A2B" />
          <stop offset="60%" stopColor="#6B0F1E" />
          <stop offset="100%" stopColor="#4A0A15" />
        </radialGradient>

        <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4A843" />
          <stop offset="50%" stopColor="#F5D77A" />
          <stop offset="100%" stopColor="#C4963A" />
        </linearGradient>

        <linearGradient id="navy-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B2A4A" />
          <stop offset="100%" stopColor="#0F1A30" />
        </linearGradient>

        <linearGradient id="cream-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F5E6C8" />
          <stop offset="100%" stopColor="#E8D5AA" />
        </linearGradient>

        <radialGradient id="medallion-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5D77A" />
          <stop offset="30%" stopColor="#D4A843" />
          <stop offset="70%" stopColor="#8B1A2B" />
          <stop offset="100%" stopColor="#6B0F1E" />
        </radialGradient>

        <radialGradient id="inner-circle-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1B2A4A" />
          <stop offset="60%" stopColor="#0F1A30" />
          <stop offset="100%" stopColor="#1B2A4A" />
        </radialGradient>

        {/* ── Golden Glow Filter ── */}
        <filter id="golden-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feFlood floodColor="#F5D77A" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Shimmer Animation ── */}
        <linearGradient id="shimmer-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-1,0;1,0"
            dur="3s"
            repeatCount="indefinite"
          />
        </linearGradient>

        {/* ── Patterns ── */}
        {/* Geometric border pattern - top */}
        <pattern id="border-pattern-top" x="0" y="0" width="28" height="18" patternUnits="userSpaceOnUse">
          {/* Stepped pyramid motif */}
          <rect width="28" height="18" fill="#1B2A4A" />
          <rect x="4" y="4" width="20" height="10" fill="#6B0F1E" />
          <rect x="8" y="2" width="12" height="14" fill="none" stroke="#D4A843" strokeWidth="0.8" />
          <line x1="0" y1="9" x2="28" y2="9" stroke="#D4A843" strokeWidth="0.4" />
          <line x1="14" y1="0" x2="14" y2="18" stroke="#D4A843" strokeWidth="0.4" />
          <circle cx="14" cy="9" r="2.5" fill="none" stroke="#F5D77A" strokeWidth="0.6" />
          <rect x="11" y="6" width="6" height="6" fill="none" stroke="#C4963A" strokeWidth="0.4" rx="1" />
        </pattern>

        {/* Geometric border pattern - bottom */}
        <pattern id="border-pattern-bottom" x="0" y="0" width="24" height="18" patternUnits="userSpaceOnUse">
          {/* Interlocking key pattern */}
          <rect width="24" height="18" fill="#1B2A4A" />
          <path d="M0,4 L6,4 L6,8 L12,8 L12,4 L18,4 L18,8 L24,8" fill="none" stroke="#D4A843" strokeWidth="1" />
          <path d="M0,14 L6,14 L6,10 L12,10 L12,14 L18,14 L18,10 L24,10" fill="none" stroke="#D4A843" strokeWidth="1" />
          <circle cx="6" cy="9" r="1" fill="#F5D77A" />
          <circle cx="18" cy="9" r="1" fill="#F5D77A" />
        </pattern>

        {/* Side stripe pattern */}
        <pattern id="stripe-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#4A0A15" />
          <path d="M0,0 L20,20 M10,-10 L30,10 M-10,10 L10,30" stroke="#D4A843" strokeWidth="0.6" />
          <path d="M20,0 L0,20 M10,10 L-10,30 M30,-10 L10,10" stroke="#C4963A" strokeWidth="0.4" />
          <circle cx="10" cy="10" r="2" fill="none" stroke="#F5D77A" strokeWidth="0.5" />
        </pattern>

        {/* Fringe pattern */}
        <pattern id="fringe-pattern" x="0" y="0" width="8" height="10" patternUnits="userSpaceOnUse">
          <rect width="8" height="5" fill="#D4A843" />
          <rect y="5" width="8" height="5" fill="transparent" />
          <line x1="4" y1="5" x2="4" y2="10" stroke="#C4963A" strokeWidth="1.5" />
          <line x1="2" y1="5" x2="1" y2="9" stroke="#D4A843" strokeWidth="0.8" />
          <line x1="6" y1="5" x2="7" y2="9" stroke="#D4A843" strokeWidth="0.8" />
        </pattern>

        {/* Dragon / Phoenix medallion paths */}
        {/* Simplified phoenix silhouette as medallion center */}
        <clipPath id="medallion-clip">
          <circle cx="350" cy="200" r="90" />
        </clipPath>
      </defs>

      {/* ══════════════════════════════════════════
          LAYER 0: Carpet Base
          ══════════════════════════════════════════ */}
      <rect width="700" height="400" fill="url(#carpet-bg)" rx="4" />

      {/* ══════════════════════════════════════════
          LAYER 1: Outer Edge / Fringe  — "carpet_edge"
          ══════════════════════════════════════════ */}
      <g
        className="cursor-pointer"
        onClick={() => onHotspotClick("carpet_edge")}
        filter={isActive("carpet_edge") ? "url(#golden-glow)" : undefined}
        style={{ transition: "filter 0.3s ease" }}
      >
        <title>Outer edge fringe</title>
        {/* Top fringe */}
        <rect x="0" y="0" width="700" height="10" fill="url(#fringe-pattern)" opacity="0.8" />
        {/* Bottom fringe */}
        <rect x="0" y="390" width="700" height="10" fill="url(#fringe-pattern)" opacity="0.8" />
        {/* Left fringe */}
        <rect x="0" y="0" width="10" height="400" fill="url(#fringe-pattern)" opacity="0.8" />
        {/* Right fringe */}
        <rect x="690" y="0" width="10" height="400" fill="url(#fringe-pattern)" opacity="0.8" />
        {/* Outer gold border line */}
        <rect
          x="5" y="5" width="690" height="390" rx="3"
          fill="none" stroke="#D4A843" strokeWidth="2"
        />
        <rect
          x="10" y="10" width="680" height="380" rx="2"
          fill="none" stroke="#C4963A" strokeWidth="1"
        />
        {/* Hover overlay */}
        <rect x="0" y="0" width="700" height="10" fill="transparent" className="hover:brightness-125" />
        {isActive("carpet_edge") && (
          <rect x="0" y="0" width="700" height="400" fill="url(#shimmer-grad)" opacity="0.3" rx="4" />
        )}
      </g>

      {/* ══════════════════════════════════════════
          LAYER 2: Top Border  — "carpet_border_top"
          ══════════════════════════════════════════ */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_border_top")}
        filter={isActive("carpet_border_top") ? "url(#golden-glow)" : undefined}
      >
        <title>Top border stripe</title>
        <rect x="20" y="15" width="660" height="28" fill="url(#border-pattern-top)" rx="2" />
        <rect x="20" y="15" width="660" height="28" fill="none" stroke="#D4A843" strokeWidth="0.8" rx="2" />
        {/* Inner accent lines */}
        <line x1="25" y1="16" x2="675" y2="16" stroke="#F5D77A" strokeWidth="0.5" opacity="0.6" />
        <line x1="25" y1="42" x2="675" y2="42" stroke="#F5D77A" strokeWidth="0.5" opacity="0.6" />
        {isActive("carpet_border_top") && (
          <rect x="20" y="15" width="660" height="28" fill="url(#shimmer-grad)" opacity="0.4" rx="2" />
        )}
      </g>

      {/* ══════════════════════════════════════════
          LAYER 3: Bottom Border  — "carpet_border_bottom"
          ══════════════════════════════════════════ */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_border_bottom")}
        filter={isActive("carpet_border_bottom") ? "url(#golden-glow)" : undefined}
      >
        <title>Bottom border stripe</title>
        <rect x="20" y="357" width="660" height="28" fill="url(#border-pattern-bottom)" rx="2" />
        <rect x="20" y="357" width="660" height="28" fill="none" stroke="#D4A843" strokeWidth="0.8" rx="2" />
        <line x1="25" y1="358" x2="675" y2="358" stroke="#F5D77A" strokeWidth="0.5" opacity="0.6" />
        <line x1="25" y1="384" x2="675" y2="384" stroke="#F5D77A" strokeWidth="0.5" opacity="0.6" />
        {isActive("carpet_border_bottom") && (
          <rect x="20" y="357" width="660" height="28" fill="url(#shimmer-grad)" opacity="0.4" rx="2" />
        )}
      </g>

      {/* ══════════════════════════════════════════
          LAYER 4: Left Stripe Band  — "carpet_stripe_left"
          ══════════════════════════════════════════ */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_stripe_left")}
        filter={isActive("carpet_stripe_left") ? "url(#golden-glow)" : undefined}
      >
        <title>Left decorative stripe band</title>
        <rect x="15" y="48" width="30" height="304" fill="url(#stripe-pattern)" rx="2" />
        <rect x="15" y="48" width="30" height="304" fill="none" stroke="#D4A843" strokeWidth="0.8" rx="2" />
        {/* Vertical accent */}
        <line x1="30" y1="52" x2="30" y2="348" stroke="#F5D77A" strokeWidth="0.4" opacity="0.5" />
        {/* Small diamond accents along the stripe */}
        {[80, 130, 180, 230, 280, 330].map((y) => (
          <polygon
            key={`left-diamond-${y}`}
            points={`30,${y - 4} 34,${y} 30,${y + 4} 26,${y}`}
            fill="#F5D77A"
            opacity="0.6"
          />
        ))}
        {isActive("carpet_stripe_left") && (
          <rect x="15" y="48" width="30" height="304" fill="url(#shimmer-grad)" opacity="0.4" rx="2" />
        )}
      </g>

      {/* ══════════════════════════════════════════
          LAYER 5: Right Stripe Band  — "carpet_stripe_right"
          ══════════════════════════════════════════ */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_stripe_right")}
        filter={isActive("carpet_stripe_right") ? "url(#golden-glow)" : undefined}
      >
        <title>Right decorative stripe band</title>
        <rect x="655" y="48" width="30" height="304" fill="url(#stripe-pattern)" rx="2" />
        <rect x="655" y="48" width="30" height="304" fill="none" stroke="#D4A843" strokeWidth="0.8" rx="2" />
        <line x1="670" y1="52" x2="670" y2="348" stroke="#F5D77A" strokeWidth="0.4" opacity="0.5" />
        {[80, 130, 180, 230, 280, 330].map((y) => (
          <polygon
            key={`right-diamond-${y}`}
            points={`670,${y - 4} 674,${y} 670,${y + 4} 666,${y}`}
            fill="#F5D77A"
            opacity="0.6"
          />
        ))}
        {isActive("carpet_stripe_right") && (
          <rect x="655" y="48" width="30" height="304" fill="url(#shimmer-grad)" opacity="0.4" rx="2" />
        )}
      </g>

      {/* ══════════════════════════════════════════
          LAYER 6: Inner Field Decoration
          ══════════════════════════════════════════ */}
      {/* Subtle field pattern lines radiating from center */}
      <g opacity="0.15">
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={`field-line-${angle}`}
            x1="350" y1="200"
            x2={350 + 250 * Math.cos((angle * Math.PI) / 180)}
            y2={200 + 150 * Math.sin((angle * Math.PI) / 180)}
            stroke="#D4A843" strokeWidth="0.5"
          />
        ))}
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={`field-line2-${angle}`}
            x1="350" y1="200"
            x2={350 - 250 * Math.cos((angle * Math.PI) / 180)}
            y2={200 - 150 * Math.sin((angle * Math.PI) / 180)}
            stroke="#D4A843" strokeWidth="0.5"
          />
        ))}
      </g>
      {/* Subtle vine/scroll decorations in field area */}
      <g opacity="0.12" stroke="#D4A843" strokeWidth="0.8" fill="none">
        {/* Top-left vine */}
        <path d="M80,70 Q120,60 140,80 Q160,100 140,120" />
        <path d="M90,75 Q100,65 115,75" />
        {/* Top-right vine */}
        <path d="M620,70 Q580,60 560,80 Q540,100 560,120" />
        <path d="M610,75 Q600,65 585,75" />
        {/* Bottom-left vine */}
        <path d="M80,330 Q120,340 140,320 Q160,300 140,280" />
        <path d="M90,325 Q100,335 115,325" />
        {/* Bottom-right vine */}
        <path d="M620,330 Q580,340 560,320 Q540,300 560,280" />
        <path d="M610,325 Q600,335 585,325" />
      </g>

      {/* ══════════════════════════════════════════
          LAYER 7: Corner Decorations
          ══════════════════════════════════════════ */}
      {/* Corner 1 - Top Left */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_corner1")}
        filter={isActive("carpet_corner1") ? "url(#golden-glow)" : undefined}
      >
        <title>Top-left corner decoration</title>
        <rect x="50" y="48" width="60" height="50" fill="#4A0A15" rx="3" stroke="#D4A843" strokeWidth="0.8" />
        {/* Corner ornament - flower motif */}
        <circle cx="80" cy="73" r="16" fill="none" stroke="#D4A843" strokeWidth="1" />
        <circle cx="80" cy="73" r="10" fill="none" stroke="#F5D77A" strokeWidth="0.6" />
        <circle cx="80" cy="73" r="4" fill="#F5D77A" opacity="0.5" />
        {/* Petals */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={`c1-petal-${angle}`}
            cx={80 + 13 * Math.cos((angle * Math.PI) / 180)}
            cy={73 + 13 * Math.sin((angle * Math.PI) / 180)}
            rx="3" ry="1.5"
            fill="#D4A843" opacity="0.6"
            transform={`rotate(${angle}, ${80 + 13 * Math.cos((angle * Math.PI) / 180)}, ${73 + 13 * Math.sin((angle * Math.PI) / 180)})`}
          />
        ))}
        {isActive("carpet_corner1") && (
          <rect x="50" y="48" width="60" height="50" fill="url(#shimmer-grad)" opacity="0.4" rx="3" />
        )}
      </g>

      {/* Corner 2 - Top Right */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_corner2")}
        filter={isActive("carpet_corner2") ? "url(#golden-glow)" : undefined}
      >
        <title>Top-right corner decoration</title>
        <rect x="590" y="48" width="60" height="50" fill="#4A0A15" rx="3" stroke="#D4A843" strokeWidth="0.8" />
        <circle cx="620" cy="73" r="16" fill="none" stroke="#D4A843" strokeWidth="1" />
        <circle cx="620" cy="73" r="10" fill="none" stroke="#F5D77A" strokeWidth="0.6" />
        <circle cx="620" cy="73" r="4" fill="#F5D77A" opacity="0.5" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={`c2-petal-${angle}`}
            cx={620 + 13 * Math.cos((angle * Math.PI) / 180)}
            cy={73 + 13 * Math.sin((angle * Math.PI) / 180)}
            rx="3" ry="1.5"
            fill="#D4A843" opacity="0.6"
            transform={`rotate(${angle}, ${620 + 13 * Math.cos((angle * Math.PI) / 180)}, ${73 + 13 * Math.sin((angle * Math.PI) / 180)})`}
          />
        ))}
        {isActive("carpet_corner2") && (
          <rect x="590" y="48" width="60" height="50" fill="url(#shimmer-grad)" opacity="0.4" rx="3" />
        )}
      </g>

      {/* Corner 3 - Bottom Left */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_corner3")}
        filter={isActive("carpet_corner3") ? "url(#golden-glow)" : undefined}
      >
        <title>Bottom-left corner decoration</title>
        <rect x="50" y="302" width="60" height="50" fill="#4A0A15" rx="3" stroke="#D4A843" strokeWidth="0.8" />
        <circle cx="80" cy="327" r="16" fill="none" stroke="#D4A843" strokeWidth="1" />
        <circle cx="80" cy="327" r="10" fill="none" stroke="#F5D77A" strokeWidth="0.6" />
        <circle cx="80" cy="327" r="4" fill="#F5D77A" opacity="0.5" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={`c3-petal-${angle}`}
            cx={80 + 13 * Math.cos((angle * Math.PI) / 180)}
            cy={327 + 13 * Math.sin((angle * Math.PI) / 180)}
            rx="3" ry="1.5"
            fill="#D4A843" opacity="0.6"
            transform={`rotate(${angle}, ${80 + 13 * Math.cos((angle * Math.PI) / 180)}, ${327 + 13 * Math.sin((angle * Math.PI) / 180)})`}
          />
        ))}
        {isActive("carpet_corner3") && (
          <rect x="50" y="302" width="60" height="50" fill="url(#shimmer-grad)" opacity="0.4" rx="3" />
        )}
      </g>

      {/* Corner 4 - Bottom Right */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_corner4")}
        filter={isActive("carpet_corner4") ? "url(#golden-glow)" : undefined}
      >
        <title>Bottom-right corner decoration</title>
        <rect x="590" y="302" width="60" height="50" fill="#4A0A15" rx="3" stroke="#D4A843" strokeWidth="0.8" />
        <circle cx="620" cy="327" r="16" fill="none" stroke="#D4A843" strokeWidth="1" />
        <circle cx="620" cy="327" r="10" fill="none" stroke="#F5D77A" strokeWidth="0.6" />
        <circle cx="620" cy="327" r="4" fill="#F5D77A" opacity="0.5" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={`c4-petal-${angle}`}
            cx={620 + 13 * Math.cos((angle * Math.PI) / 180)}
            cy={327 + 13 * Math.sin((angle * Math.PI) / 180)}
            rx="3" ry="1.5"
            fill="#D4A843" opacity="0.6"
            transform={`rotate(${angle}, ${620 + 13 * Math.cos((angle * Math.PI) / 180)}, ${327 + 13 * Math.sin((angle * Math.PI) / 180)})`}
          />
        ))}
        {isActive("carpet_corner4") && (
          <rect x="590" y="302" width="60" height="50" fill="url(#shimmer-grad)" opacity="0.4" rx="3" />
        )}
      </g>

      {/* ══════════════════════════════════════════
          LAYER 8: Central Medallion  — "carpet_center"
          ══════════════════════════════════════════ */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-110"
        onClick={() => onHotspotClick("carpet_center")}
        filter={isActive("carpet_center") ? "url(#golden-glow)" : undefined}
      >
        <title>Central medallion</title>
        {/* Outermost medallion ring */}
        <circle cx="350" cy="200" r="95" fill="none" stroke="#D4A843" strokeWidth="2.5" />
        <circle cx="350" cy="200" r="92" fill="none" stroke="#C4963A" strokeWidth="0.8" />

        {/* Medallion background */}
        <circle cx="350" cy="200" r="90" fill="url(#medallion-grad)" />

        {/* Concentric ornamental rings */}
        <circle cx="350" cy="200" r="85" fill="none" stroke="#F5D77A" strokeWidth="0.8" opacity="0.7" />
        <circle cx="350" cy="200" r="78" fill="none" stroke="#D4A843" strokeWidth="1.2" />
        <circle cx="350" cy="200" r="75" fill="none" stroke="#F5D77A" strokeWidth="0.5" opacity="0.5" />

        {/* Decorative scallops around medallion edge */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const cx = 350 + 87 * Math.cos(angle);
          const cy = 200 + 87 * Math.sin(angle);
          return (
            <circle key={`scallop-${i}`} cx={cx} cy={cy} r="3" fill="#D4A843" opacity="0.4" />
          );
        })}

        {/* Phoenix / Dragon circular motif — stylized with paths */}
        <g opacity="0.9">
          {/* Outer lotus petals around the medallion center */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x = 350 + 65 * Math.cos(angle);
            const y = 200 + 65 * Math.sin(angle);
            return (
              <g key={`lotus-outer-${i}`} transform={`rotate(${i * 45}, ${x}, ${y})`}>
                <ellipse cx={x} cy={y} rx="12" ry="5" fill="#D4A843" opacity="0.35" />
                <ellipse cx={x} cy={y} rx="8" ry="3" fill="#F5D77A" opacity="0.25" />
              </g>
            );
          })}

          {/* Phoenix wings — curved symmetrical paths */}
          <g transform="translate(350, 200)">
            {/* Left wing */}
            <path
              d="M-5,-10 C-25,-35 -55,-30 -50,-5 C-48,5 -30,15 -10,8 Z"
              fill="#D4A843" opacity="0.6" stroke="#F5D77A" strokeWidth="0.5"
            />
            <path
              d="M-8,-5 C-20,-25 -40,-22 -38,-5 C-37,2 -25,10 -12,5 Z"
              fill="#F5D77A" opacity="0.3"
            />
            {/* Right wing */}
            <path
              d="M5,-10 C25,-35 55,-30 50,-5 C48,5 30,15 10,8 Z"
              fill="#D4A843" opacity="0.6" stroke="#F5D77A" strokeWidth="0.5"
            />
            <path
              d="M8,-5 C20,-25 40,-22 38,-5 C37,2 25,10 12,5 Z"
              fill="#F5D77A" opacity="0.3"
            />
            {/* Tail feathers */}
            <path
              d="M0,10 C-15,30 -10,50 0,45 C10,50 15,30 0,10"
              fill="#D4A843" opacity="0.5" stroke="#F5D77A" strokeWidth="0.5"
            />
            <path
              d="M0,15 C-8,28 -6,40 0,37 C6,40 8,28 0,15"
              fill="#8B1A2B" opacity="0.6"
            />
            {/* Head crest */}
            <path
              d="M0,-10 C-3,-20 -8,-28 0,-35 C8,-28 3,-20 0,-10"
              fill="#F5D77A" opacity="0.5"
            />
            <circle cx="0" cy="-15" r="3" fill="#D4A843" opacity="0.7" />
            {/* Eye */}
            <circle cx="0" cy="-16" r="1" fill="#1B2A4A" />
          </g>

          {/* Flame-like accents around phoenix */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const r1 = 50;
            const r2 = 56;
            const x1 = 350 + r1 * Math.cos(angle);
            const y1 = 200 + r1 * Math.sin(angle);
            const x2 = 350 + r2 * Math.cos(angle);
            const y2 = 200 + r2 * Math.sin(angle);
            return (
              <line
                key={`flame-${i}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#F5D77A" strokeWidth="1.5" opacity="0.4"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {isActive("carpet_center") && (
          <circle cx="350" cy="200" r="90" fill="url(#shimmer-grad)" opacity="0.35" />
        )}
      </g>

      {/* ══════════════════════════════════════════
          LAYER 9: Inner Circle  — "carpet_inner"
          ══════════════════════════════════════════ */}
      <g
        className="cursor-pointer transition-all duration-300 hover:brightness-125"
        onClick={() => onHotspotClick("carpet_inner")}
        filter={isActive("carpet_inner") ? "url(#golden-glow)" : undefined}
      >
        <title>Inner circle within medallion</title>
        {/* Inner navy circle */}
        <circle cx="350" cy="200" r="28" fill="url(#inner-circle-grad)" stroke="#D4A843" strokeWidth="1.2" />
        <circle cx="350" cy="200" r="25" fill="none" stroke="#F5D77A" strokeWidth="0.5" opacity="0.6" />

        {/* Taeguk-inspired yin-yang motif */}
        <path
          d="M350,172 A14,14 0 0 1 350,200 A14,14 0 0 0 350,228 A28,28 0 0 1 350,172"
          fill="#8B1A2B" opacity="0.7"
        />
        <path
          d="M350,172 A14,14 0 0 0 350,200 A14,14 0 0 1 350,228 A28,28 0 0 0 350,172"
          fill="#D4A843" opacity="0.5"
        />
        <circle cx="350" cy="186" r="4" fill="#D4A843" opacity="0.6" />
        <circle cx="350" cy="214" r="4" fill="#8B1A2B" opacity="0.7" />

        {/* Tiny star accents */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 350 + 22 * Math.cos(rad);
          const cy = 200 + 22 * Math.sin(rad);
          return (
            <circle key={`star-${angle}`} cx={cx} cy={cy} r="1.2" fill="#F5D77A" opacity="0.7" />
          );
        })}

        {isActive("carpet_inner") && (
          <circle cx="350" cy="200" r="28" fill="url(#shimmer-grad)" opacity="0.4" />
        )}
      </g>

      {/* ══════════════════════════════════════════
          LAYER 10: Connecting decorations between medallion and borders
          ══════════════════════════════════════════ */}
      <g opacity="0.2" stroke="#D4A843" strokeWidth="0.6" fill="none">
        {/* Horizontal connectors */}
        <path d="M255,200 Q230,190 200,200 Q230,210 255,200" />
        <path d="M445,200 Q470,190 500,200 Q470,210 445,200" />
        {/* Vertical connectors */}
        <path d="M350,105 Q340,85 350,70 Q360,85 350,105" />
        <path d="M350,295 Q340,315 350,330 Q360,315 350,295" />
        {/* Small lotus at each cardinal direction */}
        {[
          [200, 200],
          [500, 200],
          [350, 70],
          [350, 330],
        ].map(([x, y], i) => (
          <circle key={`connect-lotus-${i}`} cx={x} cy={y} r="5" stroke="#D4A843" strokeWidth="0.6" />
        ))}
      </g>

      {/* ══════════════════════════════════════════
          Texture overlay for carpet fabric look
          ══════════════════════════════════════════ */}
      <rect
        width="700" height="400" rx="4"
        fill="transparent"
        style={{
          filter: "url(#noise)" ,
        }}
        opacity="0.03"
      />
    </svg>
  );
}
