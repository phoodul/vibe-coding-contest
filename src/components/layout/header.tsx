"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function EasyEduLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Brain outline */}
      <path
        d="M14 3C9.5 3 6 6.5 6 10.5c0 2.5 1.2 4.7 3 6.1V20a1 1 0 001 1h8a1 1 0 001-1v-3.4c1.8-1.4 3-3.6 3-6.1C22 6.5 18.5 3 14 3z"
        stroke="url(#logo-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Neural circuit lines */}
      <path
        d="M11 21h6M11.5 23h5"
        stroke="url(#logo-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Brain folds / circuit nodes */}
      <circle cx="11" cy="10" r="1.2" fill="url(#logo-grad)" />
      <circle cx="17" cy="10" r="1.2" fill="url(#logo-grad)" />
      <circle cx="14" cy="13" r="1.2" fill="url(#logo-grad)" />
      {/* Connection lines */}
      <path
        d="M11 10l3 3m3-3l-3 3"
        stroke="url(#logo-grad)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
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
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <EasyEduLogo />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            EasyEdu AI
          </span>
        </Link>
        <nav className="flex items-center gap-6">
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
