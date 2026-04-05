"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 glass-hover px-3 py-1.5 rounded-lg">
          <Brain className="w-6 h-6 text-[var(--accent-violet)]" />
          <span className="font-bold text-lg tracking-tight">MindPalace</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            대시보드
          </Link>
        </nav>
      </div>
    </header>
  );
}
