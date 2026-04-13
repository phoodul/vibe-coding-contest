"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeatureIntroProps {
  storageKey: string; // 한 번만 보여주기 위한 localStorage key
  children: React.ReactNode; // 애니메이션 컨텐츠
}

/**
 * 기능 페이지 진입 시 5초간 보여주는 Animated Mockup 오버레이.
 * 첫 방문 시에만 표시되고, 클릭하면 즉시 닫힘.
 */
export function FeatureIntro({ storageKey, children }: FeatureIntroProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const key = `intro-seen-${storageKey}`;
    if (!sessionStorage.getItem(key)) {
      setShow(true);
      sessionStorage.setItem(key, "1");
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-gradient rounded-2xl p-8 max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
            <p className="text-[10px] text-muted/50 mt-4">아무 곳이나 클릭하면 닫힙니다</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
