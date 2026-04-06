"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Thinker } from "@/lib/data/thinkers";

interface ThinkerAvatarProps {
  thinker: Thinker;
  size?: "sm" | "md";
}

export function ThinkerAvatar({ thinker, size = "sm" }: ThinkerAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-violet)]/15 border border-[var(--accent-violet)]/20 hover:bg-[var(--accent-violet)]/25 transition-colors ${
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>{thinker.emoji}</span>
        <span className="font-medium">{thinker.name}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-0 mb-2 w-64 p-4 rounded-xl glass border border-white/10 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{thinker.emoji}</span>
              <div>
                <h4 className="font-bold text-sm">{thinker.name}</h4>
                <p className="text-[10px] text-[var(--muted-foreground)]">
                  {thinker.nameEn} · {thinker.era}
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--accent-cyan)] mb-2">{thinker.tagline} · {thinker.school}</p>
            <blockquote className="text-xs italic text-[var(--muted-foreground)] border-l-2 border-[var(--accent-violet)]/40 pl-2">
              &ldquo;{thinker.keyQuote}&rdquo;
            </blockquote>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
