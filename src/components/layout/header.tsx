"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="EasyEdu" width={48} height={48} className="w-12 h-12" />
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
