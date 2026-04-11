"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function EasyEduLogo() {
  return (
    <svg
      width="32"
      height="28"
      viewBox="0 0 32 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* 침대/쿠션 — 비스듬한 받침 */}
      <path
        d="M2 22c0 0 2-8 8-12"
        stroke="url(#logo-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 22h28"
        stroke="url(#logo-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 사람 — 비스듬히 기대어 누운 자세 */}
      <circle cx="12" cy="9" r="2.5" stroke="url(#logo-grad)" strokeWidth="1.5" fill="none" />
      {/* 몸통 — 비스듬히 누운 */}
      <path
        d="M14 11.5l4 4.5h4"
        stroke="url(#logo-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* 다리 */}
      <path
        d="M22 16l5 6"
        stroke="url(#logo-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 태블릿 들고 있는 손 */}
      <rect
        x="16"
        y="7"
        width="5"
        height="7"
        rx="0.8"
        stroke="url(#logo-grad)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* 태블릿 화면 빛 */}
      <rect x="17" y="8" width="3" height="5" rx="0.3" fill="url(#logo-grad)" opacity="0.25" />
      {/* 팔 */}
      <path
        d="M14 11.5l4-3"
        stroke="url(#logo-grad)"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <EasyEduLogo />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            EasyEdu AI
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="btn-glow text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.97]"
          >
            시작하기
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
