"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface UpsellModalProps {
  open: boolean;
  used: number;
  limit: number;
  onClose: () => void;
}

export function UpsellModal({ open, used, limit, onClose }: UpsellModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-violet-900 border border-violet-400/30 shadow-2xl"
          >
            <div className="text-4xl mb-3 text-center">📚</div>
            <h2 className="text-xl font-bold text-center text-white">
              오늘 무료 풀이 한도에 도달했어요
            </h2>
            <p className="mt-2 text-sm text-center text-white/70">
              오늘 {used}/{limit} 문제를 풀어봤어요.
              <br />
              내일 다시 만나거나, 무제한 구독으로 끝까지 학습해보세요.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/euler/billing"
                className="px-4 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-center text-sm font-semibold transition-colors"
              >
                12,000원으로 무제한
              </Link>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 text-sm transition-colors"
              >
                내일 다시
              </button>
            </div>

            <p className="mt-4 text-[10px] text-center text-white/40">
              구독은 첫 7일 무료 체험. 언제든 취소 가능.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
