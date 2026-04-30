"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CrisisButton() {
  return (
    <Link href="/crisis">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full glass border border-rose-500/30 bg-rose-500/10 shadow-lg shadow-rose-500/10 cursor-pointer group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
        </span>
        <span className="text-sm font-medium text-rose-300 group-hover:text-rose-200 transition-colors">
          혼자가 아닙니다
        </span>
      </motion.div>
    </Link>
  );
}
