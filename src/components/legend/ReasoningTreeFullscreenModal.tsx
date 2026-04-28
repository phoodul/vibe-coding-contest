/**
 * Phase G-06 — ReasoningTreeView 풀스크린 모달 (Δ4).
 *
 * 베이스: docs/architecture-g06-legend.md §6 + §9.7.
 * ESC/배경 클릭 닫기 + body scroll lock + 풀스크린 React Flow.
 *
 * G06-19 신규.
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import type { ReasoningTree } from '@/lib/legend/types';

// dynamic import — 모달 진입 시점에만 React Flow 코어 lazy mount (모바일 INP 보호)
const ReasoningTreeView = dynamic(
  () => import('./ReasoningTreeView').then((m) => m.ReasoningTreeView),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-12 text-white/55">트리 로딩 중...</div>
    ),
  },
);

export interface ReasoningTreeFullscreenModalProps {
  tree: ReasoningTree;
  onClose: () => void;
  onNodeClick?: (stepIndex: number) => void;
}

export function ReasoningTreeFullscreenModal({
  tree,
  onClose,
  onNodeClick,
}: ReasoningTreeFullscreenModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 md:p-8"
        onClick={onClose}
      >
        <div className="relative h-full" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition text-sm text-white/90 border border-white/15"
          >
            ✕ 닫기
          </button>
          <div className="h-full">
            <ReasoningTreeView tree={tree} onNodeClick={onNodeClick} preview={false} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
