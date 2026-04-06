import Link from "next/link";
import { Brain } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="glass p-12 max-w-md">
        <Brain className="w-16 h-16 mx-auto mb-6 text-[var(--muted-foreground)]" />
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] mb-8">
          이 장소는 기억의 궁전에 없습니다
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-violet)] text-white font-medium glass-hover"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    </main>
  );
}
