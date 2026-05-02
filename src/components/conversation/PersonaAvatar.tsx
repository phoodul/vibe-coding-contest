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

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const blinkAnim = { scaleY: [1, 1, 0.05, 1] };
const blinkTransition = (duration: number, delay = 0) => ({
  duration,
  times: [0, 0.94, 0.97, 1],
  repeat: Infinity,
  ease: "easeInOut" as const,
  delay,
});

interface MouthProps {
  cx: number;
  cy: number;
  width: number;
  mouthOpen: number;
  upperColor: string;
  lowerColor: string;
  innerColor: string;
}

function Mouth({ cx, cy, width, mouthOpen, upperColor, lowerColor, innerColor }: MouthProps) {
  const m = clamp01(mouthOpen);
  const halfW = width / 2;
  const openH = 1 + m * 6;
  const openOffset = m * 4;

  return (
    <g>
      {/* 입 안 */}
      <ellipse cx={cx} cy={cy} rx={halfW * 0.85} ry={openH} fill={innerColor} />
      {/* 윗입술 */}
      <path
        d={`M ${cx - halfW} ${cy - openOffset} Q ${cx} ${cy - openOffset - 2} ${cx + halfW} ${cy - openOffset} Q ${cx + halfW * 0.5} ${cy - openOffset + 1.5} ${cx} ${cy - openOffset + 1} Q ${cx - halfW * 0.5} ${cy - openOffset + 1.5} ${cx - halfW} ${cy - openOffset} Z`}
        fill={upperColor}
      />
      {/* 아랫입술 */}
      <path
        d={`M ${cx - halfW} ${cy + openOffset} Q ${cx} ${cy + openOffset + 3.5} ${cx + halfW} ${cy + openOffset} Q ${cx + halfW * 0.5} ${cy + openOffset - 0.8} ${cx} ${cy + openOffset - 0.6} Q ${cx - halfW * 0.5} ${cy + openOffset - 0.8} ${cx - halfW} ${cy + openOffset} Z`}
        fill={lowerColor}
      />
    </g>
  );
}

interface EyeProps {
  cx: number;
  cy: number;
  iris: string;
  pupil: string;
  size?: number;
}

function Eye({ cx, cy, iris, pupil, size = 1 }: EyeProps) {
  const w = 5.5 * size;
  const h = 3.6 * size;
  const irisR = 2.6 * size;
  const pupilR = 1.2 * size;
  return (
    <g>
      {/* 흰자 */}
      <ellipse cx={cx} cy={cy} rx={w} ry={h} fill="#f8f0e8" />
      {/* 홍채 */}
      <circle cx={cx} cy={cy + 0.2} r={irisR} fill={iris} />
      {/* 동공 */}
      <circle cx={cx} cy={cy + 0.2} r={pupilR} fill={pupil} />
      {/* 하이라이트 */}
      <circle cx={cx + 0.8} cy={cy - 0.6} r={0.7 * size} fill="#fff" opacity="0.85" />
      {/* 윗 눈꺼풀 라인 */}
      <path
        d={`M ${cx - w} ${cy - h * 0.6} Q ${cx} ${cy - h * 1.05} ${cx + w} ${cy - h * 0.6}`}
        stroke="#3a2a1e"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

// === 캐릭터 6종 ===

// 1. nova — 20대 후반 백인 여성, 따뜻한 갈색 긴 웨이브, 친근
function NovaAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="nova-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#fce4d6" />
          <stop offset="100%" stopColor="#d9a89a" />
        </radialGradient>
        <linearGradient id="nova-skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fde0c8" />
          <stop offset="100%" stopColor="#e8b89a" />
        </linearGradient>
        <linearGradient id="nova-hair" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#7a4a2a" />
          <stop offset="100%" stopColor="#5a3418" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="110" r="100" fill="url(#nova-bg)" />
      {/* 목 + 어깨 */}
      <path d="M 80 175 L 80 200 Q 100 215 120 200 L 120 175 Z" fill="url(#nova-skin)" />
      <path d="M 78 178 Q 100 188 122 178 L 122 175 L 78 175 Z" fill="#000" opacity="0.12" />
      {/* 머리카락 (뒤) */}
      <path
        d="M 42 130 Q 36 75 60 52 Q 100 28 140 52 Q 164 75 158 130 Q 162 165 150 188 Q 146 175 138 170 Q 138 145 120 142 L 80 142 Q 62 145 62 170 Q 54 175 50 188 Q 38 165 42 130 Z"
        fill="url(#nova-hair)"
      />
      {/* 얼굴 윤곽 (그림자) */}
      <ellipse cx="100" cy="115" rx="38" ry="46" fill="#000" opacity="0.08" />
      {/* 얼굴 */}
      <path
        d="M 64 110 Q 64 75 100 72 Q 136 75 136 110 Q 136 145 124 160 Q 112 172 100 173 Q 88 172 76 160 Q 64 145 64 110 Z"
        fill="url(#nova-skin)"
      />
      {/* 앞머리 (옆 가르마) */}
      <path
        d="M 64 88 Q 78 70 100 78 Q 122 70 136 88 Q 130 78 110 80 Q 100 76 90 80 Q 70 78 64 88 Z"
        fill="url(#nova-hair)"
      />
      <path
        d="M 64 88 Q 70 75 84 76 Q 78 86 70 95 Q 64 92 64 88 Z"
        fill="url(#nova-hair)"
      />
      {/* 귀 */}
      <ellipse cx="62" cy="115" rx="3.5" ry="6" fill="url(#nova-skin)" />
      <ellipse cx="138" cy="115" rx="3.5" ry="6" fill="url(#nova-skin)" />
      {/* 눈썹 */}
      <path d="M 76 99 Q 84 96 92 100" stroke="#5a3418" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 108 100 Q 116 96 124 99" stroke="#5a3418" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* 눈 */}
      <motion.g animate={blinkAnim} transition={blinkTransition(4.2)} style={{ transformOrigin: "100px 110px" }}>
        <Eye cx={84} cy={110} iris="#6a4a2a" pupil="#1a0e08" />
        <Eye cx={116} cy={110} iris="#6a4a2a" pupil="#1a0e08" />
      </motion.g>
      {/* 코 (그림자만) */}
      <path d="M 98 122 Q 96 132 99 138 Q 101 138 101 138 Q 104 132 102 122" stroke="#c89a7a" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="100" cy="139" rx="2.5" ry="1.2" fill="#c89a7a" opacity="0.4" />
      {/* 볼 (사실적, 아주 sublty) */}
      <ellipse cx="76" cy="135" rx="6" ry="3" fill="#e8a090" opacity="0.35" />
      <ellipse cx="124" cy="135" rx="6" ry="3" fill="#e8a090" opacity="0.35" />
      {/* 입 */}
      <Mouth cx={100} cy={152} width={16} mouthOpen={mouthOpen} upperColor="#b85a5a" lowerColor="#d07878" innerColor="#5a2828" />
    </svg>
  );
}

// 2. shimmer — 30대 초 라티나 여성, 차분한 검은 미디엄 머리
function ShimmerAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="shimmer-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#dbe2f0" />
          <stop offset="100%" stopColor="#9aa5c7" />
        </radialGradient>
        <linearGradient id="shimmer-skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#e6c2a0" />
          <stop offset="100%" stopColor="#c89870" />
        </linearGradient>
        <linearGradient id="shimmer-hair" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#2a1e18" />
          <stop offset="100%" stopColor="#0e0805" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="110" r="100" fill="url(#shimmer-bg)" />
      <path d="M 82 175 L 82 200 Q 100 215 118 200 L 118 175 Z" fill="url(#shimmer-skin)" />
      <path d="M 80 178 Q 100 188 120 178 L 120 175 L 80 175 Z" fill="#000" opacity="0.15" />
      {/* 머리 (어깨길이 단정) */}
      <path
        d="M 48 128 Q 44 72 70 50 Q 100 32 130 50 Q 156 72 152 128 Q 154 158 144 178 L 132 175 Q 132 142 116 140 L 84 140 Q 68 142 68 175 L 56 178 Q 46 158 48 128 Z"
        fill="url(#shimmer-hair)"
      />
      <ellipse cx="100" cy="115" rx="37" ry="46" fill="#000" opacity="0.08" />
      <path
        d="M 64 112 Q 64 76 100 73 Q 136 76 136 112 Q 136 146 124 161 Q 112 173 100 174 Q 88 173 76 161 Q 64 146 64 112 Z"
        fill="url(#shimmer-skin)"
      />
      {/* 앞머리 (옆 가르마) */}
      <path d="M 66 86 Q 76 70 100 76 Q 124 70 134 86 Q 110 78 100 80 Q 90 78 66 86 Z" fill="url(#shimmer-hair)" />
      <path d="M 66 86 Q 68 100 76 110 Q 70 100 66 92 Z" fill="url(#shimmer-hair)" />
      <ellipse cx="62" cy="115" rx="3.5" ry="6" fill="url(#shimmer-skin)" />
      <ellipse cx="138" cy="115" rx="3.5" ry="6" fill="url(#shimmer-skin)" />
      <path d="M 76 100 Q 84 97 92 100" stroke="#1a0e08" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 108 100 Q 116 97 124 100" stroke="#1a0e08" strokeWidth="2" fill="none" strokeLinecap="round" />
      <motion.g animate={blinkAnim} transition={blinkTransition(4.5, 0.3)} style={{ transformOrigin: "100px 111px" }}>
        <Eye cx={84} cy={111} iris="#3a241a" pupil="#0a0604" />
        <Eye cx={116} cy={111} iris="#3a241a" pupil="#0a0604" />
        {/* 속눈썹 */}
        <path d="M 78 107 L 76 105" stroke="#1a0e08" strokeWidth="1" strokeLinecap="round" />
        <path d="M 122 107 L 124 105" stroke="#1a0e08" strokeWidth="1" strokeLinecap="round" />
      </motion.g>
      <path d="M 98 124 Q 96 134 100 140 Q 104 134 102 124" stroke="#a87858" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.55" />
      <ellipse cx="100" cy="141" rx="2.5" ry="1.2" fill="#a87858" opacity="0.4" />
      <ellipse cx="76" cy="138" rx="6" ry="3" fill="#c87060" opacity="0.3" />
      <ellipse cx="124" cy="138" rx="6" ry="3" fill="#c87060" opacity="0.3" />
      <Mouth cx={100} cy={154} width={14} mouthOpen={mouthOpen} upperColor="#9a4848" lowerColor="#b86060" innerColor="#4a1e1e" />
    </svg>
  );
}

// 3. onyx — 40대 흑인 남성, 짧은 흑발 + 짧은 수염, 진중
function OnyxAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="onyx-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#5a6a8e" />
          <stop offset="100%" stopColor="#1e2a44" />
        </radialGradient>
        <linearGradient id="onyx-skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#7a4e30" />
          <stop offset="100%" stopColor="#5a3418" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="110" r="100" fill="url(#onyx-bg)" />
      <path d="M 78 175 L 78 200 Q 100 215 122 200 L 122 175 Z" fill="url(#onyx-skin)" />
      <path d="M 76 178 Q 100 190 124 178 L 124 175 L 76 175 Z" fill="#000" opacity="0.25" />
      {/* 짧은 머리 (정수리에 자연스럽게) */}
      <path
        d="M 60 102 Q 56 68 80 52 Q 100 44 120 52 Q 144 68 140 102 L 138 108 Q 138 80 116 78 L 84 78 Q 62 80 62 108 Z"
        fill="#0a0604"
      />
      {/* 머리 결 디테일 */}
      <path d="M 70 75 Q 80 70 90 75" stroke="#1a0e08" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 110 75 Q 120 70 130 75" stroke="#1a0e08" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="100" cy="118" rx="38" ry="48" fill="#000" opacity="0.12" />
      <path
        d="M 62 112 Q 62 78 100 75 Q 138 78 138 112 Q 138 148 126 164 Q 112 176 100 177 Q 88 176 74 164 Q 62 148 62 112 Z"
        fill="url(#onyx-skin)"
      />
      {/* 머리 가장자리 (이마 라인) */}
      <path
        d="M 62 90 Q 70 78 84 78 L 116 78 Q 130 78 138 90 Q 130 84 100 84 Q 70 84 62 90 Z"
        fill="#0a0604"
      />
      <ellipse cx="60" cy="115" rx="3.5" ry="6.5" fill="url(#onyx-skin)" />
      <ellipse cx="140" cy="115" rx="3.5" ry="6.5" fill="url(#onyx-skin)" />
      {/* 진중한 눈썹 */}
      <path d="M 75 100 Q 84 96 92 100" stroke="#0a0604" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 108 100 Q 116 96 125 100" stroke="#0a0604" strokeWidth="3" fill="none" strokeLinecap="round" />
      <motion.g animate={blinkAnim} transition={blinkTransition(5)} style={{ transformOrigin: "100px 112px" }}>
        <Eye cx={84} cy={112} iris="#3a2418" pupil="#0a0604" />
        <Eye cx={116} cy={112} iris="#3a2418" pupil="#0a0604" />
      </motion.g>
      {/* 코 */}
      <path d="M 97 124 Q 95 138 99 144 L 101 144 Q 105 138 103 124" stroke="#3a1f10" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="100" cy="145" rx="3" ry="1.4" fill="#3a1f10" opacity="0.5" />
      {/* 짧은 수염 (턱 + 콧수염) */}
      <path
        d="M 76 152 Q 100 162 124 152 Q 124 168 100 172 Q 76 168 76 152 Z"
        fill="#0a0604"
        opacity="0.7"
      />
      <path d="M 86 152 Q 100 156 114 152" stroke="#0a0604" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65" />
      {/* 입 */}
      <Mouth cx={100} cy={158} width={16} mouthOpen={mouthOpen} upperColor="#5a2820" lowerColor="#7a3a30" innerColor="#2a1010" />
    </svg>
  );
}

// 4. echo — 30대 백인 남성, 회색 짧은 머리, 차분
function EchoAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="echo-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#d4dcd0" />
          <stop offset="100%" stopColor="#8a9c8e" />
        </radialGradient>
        <linearGradient id="echo-skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f0d4b8" />
          <stop offset="100%" stopColor="#d4a884" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="110" r="100" fill="url(#echo-bg)" />
      <path d="M 80 175 L 80 200 Q 100 215 120 200 L 120 175 Z" fill="url(#echo-skin)" />
      <path d="M 78 178 Q 100 190 122 178 L 122 175 L 78 175 Z" fill="#000" opacity="0.15" />
      {/* 짧은 회색 머리 */}
      <path
        d="M 62 100 Q 58 68 80 54 Q 100 46 120 54 Q 142 68 138 100 L 136 108 Q 136 82 118 80 L 82 80 Q 64 82 64 108 Z"
        fill="#5a5a5a"
      />
      <path
        d="M 62 100 Q 70 86 100 84 Q 130 86 138 100 Q 120 92 100 92 Q 80 92 62 100 Z"
        fill="#888888"
      />
      <ellipse cx="100" cy="116" rx="38" ry="46" fill="#000" opacity="0.08" />
      <path
        d="M 64 112 Q 64 78 100 75 Q 136 78 136 112 Q 136 146 124 161 Q 112 173 100 174 Q 88 173 76 161 Q 64 146 64 112 Z"
        fill="url(#echo-skin)"
      />
      <path
        d="M 64 92 Q 72 80 84 80 L 116 80 Q 128 80 136 92 Q 128 86 100 86 Q 72 86 64 92 Z"
        fill="#5a5a5a"
      />
      <ellipse cx="62" cy="115" rx="3.5" ry="6.5" fill="url(#echo-skin)" />
      <ellipse cx="138" cy="115" rx="3.5" ry="6.5" fill="url(#echo-skin)" />
      <path d="M 76 100 Q 84 98 92 100" stroke="#3a3a3a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 108 100 Q 116 98 124 100" stroke="#3a3a3a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <motion.g animate={blinkAnim} transition={blinkTransition(4.8, 0.5)} style={{ transformOrigin: "100px 111px" }}>
        <Eye cx={84} cy={111} iris="#4a6878" pupil="#1a2028" />
        <Eye cx={116} cy={111} iris="#4a6878" pupil="#1a2028" />
      </motion.g>
      <path d="M 97 124 Q 95 136 99 142 L 101 142 Q 105 136 103 124" stroke="#a87a58" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.55" />
      <ellipse cx="100" cy="143" rx="2.8" ry="1.3" fill="#a87a58" opacity="0.4" />
      <Mouth cx={100} cy={156} width={14} mouthOpen={mouthOpen} upperColor="#a05a4a" lowerColor="#c07868" innerColor="#4a2018" />
    </svg>
  );
}

// 5. coral — 10대 후반/20대 초 다양한 인종 mixed, 활기찬, 미디엄 머리
function CoralAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="coral-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#ffd4b8" />
          <stop offset="100%" stopColor="#e89878" />
        </radialGradient>
        <linearGradient id="coral-skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f4d0b0" />
          <stop offset="100%" stopColor="#d8a888" />
        </linearGradient>
        <linearGradient id="coral-hair" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#3a2418" />
          <stop offset="100%" stopColor="#1e0e08" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="110" r="100" fill="url(#coral-bg)" />
      <path d="M 82 175 L 82 200 Q 100 215 118 200 L 118 175 Z" fill="url(#coral-skin)" />
      <path d="M 80 178 Q 100 188 120 178 L 120 175 L 80 175 Z" fill="#000" opacity="0.13" />
      {/* 어깨 길이 자연스러운 머리 */}
      <path
        d="M 46 128 Q 42 72 68 50 Q 100 30 132 50 Q 158 72 154 128 Q 156 162 146 184 L 134 180 Q 134 142 118 140 L 82 140 Q 66 142 66 180 L 54 184 Q 44 162 46 128 Z"
        fill="url(#coral-hair)"
      />
      <ellipse cx="100" cy="115" rx="37" ry="46" fill="#000" opacity="0.08" />
      <path
        d="M 64 112 Q 64 76 100 73 Q 136 76 136 112 Q 136 146 124 161 Q 112 173 100 174 Q 88 173 76 161 Q 64 146 64 112 Z"
        fill="url(#coral-skin)"
      />
      {/* 자연스러운 앞머리 */}
      <path
        d="M 64 90 Q 78 72 100 78 Q 122 72 136 90 Q 122 80 100 82 Q 78 80 64 90 Z"
        fill="url(#coral-hair)"
      />
      <ellipse cx="62" cy="115" rx="3.5" ry="6" fill="url(#coral-skin)" />
      <ellipse cx="138" cy="115" rx="3.5" ry="6" fill="url(#coral-skin)" />
      <path d="M 76 100 Q 84 97 92 100" stroke="#1e0e08" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 108 100 Q 116 97 124 100" stroke="#1e0e08" strokeWidth="2" fill="none" strokeLinecap="round" />
      <motion.g animate={blinkAnim} transition={blinkTransition(3.8)} style={{ transformOrigin: "100px 111px" }}>
        <Eye cx={84} cy={111} iris="#5a3a28" pupil="#0a0604" />
        <Eye cx={116} cy={111} iris="#5a3a28" pupil="#0a0604" />
        <path d="M 78 107 L 76 105" stroke="#1e0e08" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M 90 107 L 92 105" stroke="#1e0e08" strokeWidth="1" strokeLinecap="round" />
        <path d="M 122 107 L 124 105" stroke="#1e0e08" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M 110 107 L 108 105" stroke="#1e0e08" strokeWidth="1" strokeLinecap="round" />
      </motion.g>
      <path d="M 98 124 Q 96 134 99 140 Q 101 140 101 140 Q 104 134 102 124" stroke="#b07858" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.55" />
      <ellipse cx="100" cy="141" rx="2.4" ry="1.2" fill="#b07858" opacity="0.4" />
      <ellipse cx="76" cy="138" rx="7" ry="3.5" fill="#e87858" opacity="0.4" />
      <ellipse cx="124" cy="138" rx="7" ry="3.5" fill="#e87858" opacity="0.4" />
      {/* 활기찬 미소 */}
      <Mouth cx={100} cy={154} width={16} mouthOpen={mouthOpen} upperColor="#b04848" lowerColor="#d06868" innerColor="#5a1e1e" />
    </svg>
  );
}

// 6. sage — 50대 후반 백인 교수, 둥근 안경, 부분 회색 머리, 따뜻
function SageAvatar({ mouthOpen }: AvatarProps) {
  return (
    <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="sage-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#dcdcc8" />
          <stop offset="100%" stopColor="#94a08a" />
        </radialGradient>
        <linearGradient id="sage-skin" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f0d4b8" />
          <stop offset="100%" stopColor="#d4a884" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="110" r="100" fill="url(#sage-bg)" />
      <path d="M 80 175 L 80 200 Q 100 215 120 200 L 120 175 Z" fill="url(#sage-skin)" />
      <path d="M 78 178 Q 100 190 122 178 L 122 175 L 78 175 Z" fill="#000" opacity="0.15" />
      {/* 머리 (회색 + 짙은 회색 베이스) */}
      <path
        d="M 60 102 Q 58 64 82 50 Q 100 42 118 50 Q 142 64 140 102 L 138 110 Q 138 80 116 78 L 84 78 Q 62 80 62 110 Z"
        fill="#5a5a58"
      />
      <path
        d="M 60 90 Q 70 76 100 74 Q 130 76 140 90 Q 120 84 100 84 Q 80 84 60 90 Z"
        fill="#a8a8a4"
      />
      {/* 측면 회색 (관자놀이) */}
      <path d="M 60 100 Q 58 110 62 118 Q 64 110 64 100 Z" fill="#c8c8c4" opacity="0.6" />
      <path d="M 140 100 Q 142 110 138 118 Q 136 110 136 100 Z" fill="#c8c8c4" opacity="0.6" />
      <ellipse cx="100" cy="116" rx="38" ry="46" fill="#000" opacity="0.08" />
      <path
        d="M 64 112 Q 64 78 100 75 Q 136 78 136 112 Q 136 148 124 162 Q 112 174 100 175 Q 88 174 76 162 Q 64 148 64 112 Z"
        fill="url(#sage-skin)"
      />
      {/* 이마 주름 (sublty — 나이) */}
      <path d="M 78 92 Q 100 89 122 92" stroke="#c89878" strokeWidth="0.8" fill="none" opacity="0.4" />
      <ellipse cx="62" cy="115" rx="3.5" ry="6.5" fill="url(#sage-skin)" />
      <ellipse cx="138" cy="115" rx="3.5" ry="6.5" fill="url(#sage-skin)" />
      <path d="M 74 98 Q 84 95 94 99" stroke="#5a5a58" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 106 99 Q 116 95 126 98" stroke="#5a5a58" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* 안경 (둥근 금속테) */}
      <circle cx="84" cy="113" r="13" stroke="#3a3a3a" strokeWidth="1.8" fill="#fff" fillOpacity="0.1" />
      <circle cx="116" cy="113" r="13" stroke="#3a3a3a" strokeWidth="1.8" fill="#fff" fillOpacity="0.1" />
      <line x1="97" y1="113" x2="103" y2="113" stroke="#3a3a3a" strokeWidth="1.8" />
      <line x1="71" y1="113" x2="64" y2="115" stroke="#3a3a3a" strokeWidth="1.5" />
      <line x1="129" y1="113" x2="136" y2="115" stroke="#3a3a3a" strokeWidth="1.5" />
      {/* 안경 안 눈 */}
      <motion.g animate={blinkAnim} transition={blinkTransition(5.2, 0.2)} style={{ transformOrigin: "100px 113px" }}>
        <Eye cx={84} cy={113} iris="#4a6878" pupil="#1a2028" size={0.85} />
        <Eye cx={116} cy={113} iris="#4a6878" pupil="#1a2028" size={0.85} />
      </motion.g>
      <path d="M 97 130 Q 95 142 99 148 L 101 148 Q 105 142 103 130" stroke="#a87a58" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.55" />
      <ellipse cx="100" cy="149" rx="2.6" ry="1.3" fill="#a87a58" opacity="0.4" />
      {/* 따뜻한 미소 */}
      <Mouth cx={100} cy={160} width={14} mouthOpen={mouthOpen} upperColor="#a05a4a" lowerColor="#c07868" innerColor="#4a2018" />
      {/* 미소 라인 (입꼬리 약간 위) */}
      <path d="M 86 162 Q 90 158 94 158" stroke="#c89878" strokeWidth="0.8" fill="none" opacity="0.45" />
      <path d="M 114 162 Q 110 158 106 158" stroke="#c89878" strokeWidth="0.8" fill="none" opacity="0.45" />
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
    <div className="relative w-44 h-44 sm:w-56 sm:h-56">
      {/* 외부 펄스 링 */}
      {(state === "listening" || state === "speaking") && (
        <motion.div
          className="absolute inset-[-12px] rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.05, 0.45] }}
          transition={{ duration: state === "listening" ? 1 : 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden shadow-2xl"
        animate={
          state === "thinking"
            ? { scale: [1, 0.98, 1] }
            : state === "listening"
              ? { scale: [1, 1.015, 1] }
              : state === "speaking"
                ? { scale: [1, 1.008, 0.995, 1] }
                : { scale: [1, 1.005, 1] }
        }
        transition={{ duration: state === "thinking" ? 1.4 : 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Avatar state={state} mouthOpen={mouthOpen} />
      </motion.div>

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
