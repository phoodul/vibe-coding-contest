"use client";

import { motion } from "framer-motion";
import type { FC } from "react";

type AIState = "idle" | "listening" | "thinking" | "speaking";

interface AvatarProps {
  state: AIState;
  mouthOpen: number;
}

interface PersonaAvatarProps {
  voiceId: string;
  state: AIState;
  mouthOpen: number;
}

const mouthRy = (m: number) => 1.5 + Math.min(1, Math.max(0, m)) * 7;

const blinkAnim = {
  scaleY: [1, 1, 0.1, 1],
};
const blinkTransition = {
  duration: 4,
  times: [0, 0.92, 0.96, 1],
  repeat: Infinity,
  ease: "easeInOut" as const,
};

function NovaAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="nova-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffeaa7" />
          <stop offset="100%" stopColor="#ffb8d1" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#nova-bg)" />
      {/* 긴 웨이브 머리 (뒤) */}
      <path
        d="M 38 115 Q 30 65 55 45 Q 100 20 145 45 Q 170 65 162 115 Q 165 155 145 175 L 132 178 Q 132 132 112 132 L 88 132 Q 68 132 68 178 L 55 175 Q 35 155 38 115 Z"
        fill="#8b5a3c"
      />
      {/* 얼굴 */}
      <ellipse cx="100" cy="108" rx="42" ry="48" fill="#ffe0d0" />
      {/* 앞머리 */}
      <path d="M 60 78 Q 75 58 100 65 Q 125 58 140 78 Q 130 72 100 75 Q 70 72 60 78 Z" fill="#8b5a3c" />
      {/* 볼 */}
      <ellipse cx="74" cy="118" rx="7" ry="4" fill="#ffb6c1" opacity="0.7" />
      <ellipse cx="126" cy="118" rx="7" ry="4" fill="#ffb6c1" opacity="0.7" />
      {/* 눈 (활짝 웃음) */}
      <motion.g animate={blinkAnim} transition={blinkTransition} style={{ transformOrigin: "100px 98px" }}>
        <path d="M 75 98 Q 82 92 89 98" stroke="#3a2a1e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 111 98 Q 118 92 125 98" stroke="#3a2a1e" strokeWidth="3" fill="none" strokeLinecap="round" />
      </motion.g>
      {/* 입 */}
      <ellipse cx="100" cy="135" rx="9" ry={mouthRy(mouthOpen)} fill="#7a3a3a" />
      <path d="M 91 135 Q 100 128 109 135" stroke="#7a3a3a" strokeWidth="2" fill="none" strokeLinecap="round" opacity={1 - mouthOpen} />
      {/* 별 */}
      <path
        d="M 145 50 L 148 58 L 156 58 L 150 64 L 152 72 L 145 67 L 138 72 L 140 64 L 134 58 L 142 58 Z"
        fill="#ffd700"
        stroke="#ff9500"
        strokeWidth="1"
      />
    </svg>
  );
}

function ShimmerAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="shimmer-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#cfd9ff" />
          <stop offset="100%" stopColor="#b9a4e8" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#shimmer-bg)" />
      {/* 단발 머리 */}
      <path
        d="M 50 100 Q 45 60 65 45 Q 100 28 135 45 Q 155 60 150 100 Q 152 130 145 145 L 138 145 Q 138 110 120 110 L 80 110 Q 62 110 62 145 L 55 145 Q 48 130 50 100 Z"
        fill="#1f1f24"
      />
      {/* 얼굴 */}
      <ellipse cx="100" cy="110" rx="40" ry="46" fill="#ffe0d0" />
      {/* 앞머리 (옆 가르마) */}
      <path d="M 62 78 Q 80 62 105 70 Q 130 62 138 78 Q 120 70 100 75 Q 80 78 62 78 Z" fill="#1f1f24" />
      {/* 차분한 눈 */}
      <motion.g animate={blinkAnim} transition={blinkTransition} style={{ transformOrigin: "100px 105px" }}>
        <ellipse cx="82" cy="105" rx="3" ry="3.5" fill="#1f1f24" />
        <ellipse cx="118" cy="105" rx="3" ry="3.5" fill="#1f1f24" />
        {/* 속눈썹 */}
        <path d="M 78 102 L 76 100" stroke="#1f1f24" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 122 102 L 124 100" stroke="#1f1f24" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
      {/* 입 */}
      <ellipse cx="100" cy="138" rx="7" ry={mouthRy(mouthOpen)} fill="#8a4a4a" />
      <path d="M 94 138 Q 100 134 106 138" stroke="#8a4a4a" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={1 - mouthOpen} />
    </svg>
  );
}

function OnyxAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="onyx-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#4a5d8e" />
          <stop offset="100%" stopColor="#1e2e4a" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#onyx-bg)" />
      {/* 짧은 머리 */}
      <path
        d="M 58 90 Q 55 55 78 42 Q 100 32 122 42 Q 145 55 142 90 L 138 95 Q 138 75 120 72 L 80 72 Q 62 75 62 95 Z"
        fill="#1a1a1a"
      />
      {/* 얼굴 */}
      <ellipse cx="100" cy="108" rx="40" ry="46" fill="#d4a373" />
      {/* 진중한 눈썹 */}
      <path d="M 75 92 Q 83 88 91 92" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 109 92 Q 117 88 125 92" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 눈 */}
      <motion.g animate={blinkAnim} transition={blinkTransition} style={{ transformOrigin: "100px 102px" }}>
        <ellipse cx="83" cy="102" rx="2.5" ry="3" fill="#1a1a1a" />
        <ellipse cx="117" cy="102" rx="2.5" ry="3" fill="#1a1a1a" />
      </motion.g>
      {/* 코 */}
      <path d="M 100 115 L 97 128 L 103 128 Z" fill="#a07550" opacity="0.4" />
      {/* 수염 (턱) */}
      <path d="M 78 142 Q 100 148 122 142 Q 122 152 100 156 Q 78 152 78 142 Z" fill="#1a1a1a" opacity="0.55" />
      {/* 입 */}
      <ellipse cx="100" cy="138" rx="8" ry={mouthRy(mouthOpen)} fill="#5c3030" />
      <path d="M 92 138 Q 100 142 108 138" stroke="#5c3030" strokeWidth="2" fill="none" strokeLinecap="round" opacity={1 - mouthOpen} />
    </svg>
  );
}

function EchoAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="echo-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#d4e4d4" />
          <stop offset="100%" stopColor="#9eb8a8" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#echo-bg)" />
      {/* 짧은 회색 머리 */}
      <path
        d="M 60 92 Q 58 60 80 48 Q 100 40 120 48 Q 142 60 140 92 L 136 95 Q 136 80 120 78 L 80 78 Q 64 80 64 95 Z"
        fill="#8a8a8a"
      />
      {/* 얼굴 */}
      <ellipse cx="100" cy="110" rx="40" ry="46" fill="#ffe0d0" />
      {/* 무표정 눈썹 */}
      <line x1="78" y1="95" x2="90" y2="95" stroke="#5a5a5a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="110" y1="95" x2="122" y2="95" stroke="#5a5a5a" strokeWidth="2.5" strokeLinecap="round" />
      {/* 눈 */}
      <motion.g animate={blinkAnim} transition={blinkTransition} style={{ transformOrigin: "100px 105px" }}>
        <ellipse cx="84" cy="105" rx="2.5" ry="3" fill="#3a3a3a" />
        <ellipse cx="116" cy="105" rx="2.5" ry="3" fill="#3a3a3a" />
      </motion.g>
      {/* 입 (담담한 작은 미소) */}
      <ellipse cx="100" cy="138" rx="7" ry={mouthRy(mouthOpen)} fill="#7a4a4a" />
      <path d="M 93 138 Q 100 140 107 138" stroke="#7a4a4a" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={1 - mouthOpen} />
    </svg>
  );
}

function CoralAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="coral-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffe88a" />
          <stop offset="100%" stopColor="#ff9a7a" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#coral-bg)" />
      {/* 양갈래 머리 (뒤) */}
      <path
        d="M 50 105 Q 45 65 65 50 Q 100 32 135 50 Q 155 65 150 105 L 145 130 Q 138 130 138 110 L 62 110 Q 62 130 55 130 Z"
        fill="#ff8fab"
      />
      {/* 얼굴 */}
      <ellipse cx="100" cy="110" rx="40" ry="46" fill="#ffe0d0" />
      {/* 앞머리 */}
      <path d="M 62 80 Q 78 60 100 70 Q 122 60 138 80 Q 122 72 100 76 Q 78 72 62 80 Z" fill="#ff8fab" />
      {/* 양갈래 묶음 (옆) */}
      <ellipse cx="40" cy="125" rx="10" ry="18" fill="#ff8fab" />
      <ellipse cx="160" cy="125" rx="10" ry="18" fill="#ff8fab" />
      {/* 묶음 끈 */}
      <ellipse cx="40" cy="108" rx="6" ry="3" fill="#fff" opacity="0.85" />
      <ellipse cx="160" cy="108" rx="6" ry="3" fill="#fff" opacity="0.85" />
      {/* 볼 */}
      <ellipse cx="74" cy="118" rx="8" ry="5" fill="#ff7a8a" opacity="0.7" />
      <ellipse cx="126" cy="118" rx="8" ry="5" fill="#ff7a8a" opacity="0.7" />
      {/* 윙크 (왼쪽 감김) + 활기찬 오른쪽 */}
      <motion.g animate={blinkAnim} transition={{ ...blinkTransition, duration: 5 }} style={{ transformOrigin: "118px 100px" }}>
        <path d="M 76 102 Q 84 96 92 102" stroke="#3a2a1e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="118" cy="102" rx="3" ry="4" fill="#3a2a1e" />
        <ellipse cx="119" cy="100" rx="1" ry="1.2" fill="#fff" />
      </motion.g>
      {/* 입 (활짝) */}
      <ellipse cx="100" cy="135" rx="10" ry={mouthRy(mouthOpen)} fill="#9a3a3a" />
      <path d="M 90 135 Q 100 126 110 135" stroke="#9a3a3a" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={1 - mouthOpen} />
    </svg>
  );
}

function SageAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="sage-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#e0d4b8" />
          <stop offset="100%" stopColor="#a4b896" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#sage-bg)" />
      {/* 머리 (회색 + 검은) */}
      <path
        d="M 56 95 Q 54 58 78 45 Q 100 36 122 45 Q 146 58 144 95 L 140 100 Q 140 80 120 76 L 80 76 Q 60 80 60 100 Z"
        fill="#5a5a5a"
      />
      <path d="M 56 78 Q 78 68 100 72 Q 122 68 144 78 Q 124 72 100 75 Q 76 72 56 78 Z" fill="#a8a8a8" />
      {/* 얼굴 */}
      <ellipse cx="100" cy="108" rx="40" ry="46" fill="#ffd5b8" />
      {/* 안경 (둥근) */}
      <circle cx="82" cy="105" r="11" stroke="#2a2a2a" strokeWidth="2" fill="#fff" fillOpacity="0.15" />
      <circle cx="118" cy="105" r="11" stroke="#2a2a2a" strokeWidth="2" fill="#fff" fillOpacity="0.15" />
      <line x1="93" y1="105" x2="107" y2="105" stroke="#2a2a2a" strokeWidth="2" />
      {/* 안경 안 눈 */}
      <motion.g animate={blinkAnim} transition={blinkTransition} style={{ transformOrigin: "100px 105px" }}>
        <ellipse cx="82" cy="105" rx="2.5" ry="3" fill="#1a1a1a" />
        <ellipse cx="118" cy="105" rx="2.5" ry="3" fill="#1a1a1a" />
      </motion.g>
      {/* 부드러운 미소 */}
      <ellipse cx="100" cy="135" rx="8" ry={mouthRy(mouthOpen)} fill="#7a3a3a" />
      <path d="M 91 135 Q 100 142 109 135" stroke="#7a3a3a" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity={1 - mouthOpen} />
    </svg>
  );
}

const AVATARS: Record<string, FC<AvatarProps>> = {
  nova: NovaAvatar,
  shimmer: ShimmerAvatar,
  onyx: OnyxAvatar,
  echo: EchoAvatar,
  coral: CoralAvatar,
  sage: SageAvatar,
};

export function PersonaAvatar({ voiceId, state, mouthOpen }: PersonaAvatarProps) {
  const Avatar = AVATARS[voiceId] ?? AVATARS.nova;

  return (
    <div className="relative w-40 h-40 sm:w-52 sm:h-52">
      {/* 외부 펄스 링 */}
      {(state === "listening" || state === "speaking") && (
        <motion.div
          className="absolute inset-[-10px] rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.05, 0.4] }}
          transition={{ duration: state === "listening" ? 1 : 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* 캐릭터 */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        animate={
          state === "thinking"
            ? { scale: [1, 0.97, 1] }
            : state === "listening"
              ? { scale: [1, 1.02, 1] }
              : state === "speaking"
                ? { scale: [1, 1.01, 0.99, 1] }
                : { scale: [1, 1.01, 1] }
        }
        transition={{ duration: state === "thinking" ? 1.4 : 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Avatar state={state} mouthOpen={mouthOpen} />
      </motion.div>

      {/* thinking 점들 */}
      {state === "thinking" && (
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
      )}

      {/* listening 마이크 인디케이터 */}
      {state === "listening" && (
        <motion.div
          className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-red-500 shadow-lg shadow-red-500/40 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
