"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/shared/glass-card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <GlassCard hover={false} className="max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">문제가 발생했습니다</h2>
        <p className="text-sm text-muted mb-6">
          {error.message || "알 수 없는 오류가 발생했습니다."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
        >
          다시 시도
        </button>
      </GlassCard>
    </div>
  );
}
