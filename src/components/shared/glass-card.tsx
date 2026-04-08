"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hover
          ? { y: -6, scale: 1.01, transition: { duration: 0.25, ease: "easeOut" } }
          : undefined
      }
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={cn(
        "glass-gradient p-6 transition-colors duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
