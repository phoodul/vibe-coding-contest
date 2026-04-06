"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <GlassCard className="p-8 max-w-md text-center" hover={false}>
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-[var(--destructive)]" />
        <h2 className="text-xl font-bold mb-2">문제가 발생했습니다</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          {error.message || "페이지를 불러오는 중 오류가 발생했습니다."}
        </p>
        <Button onClick={reset} className="bg-[var(--accent-violet)] text-white">
          다시 시도
        </Button>
      </GlassCard>
    </div>
  );
}
