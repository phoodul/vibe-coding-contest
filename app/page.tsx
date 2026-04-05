import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="glass p-12 max-w-2xl w-full text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-[var(--accent-violet)] via-[var(--accent-cyan)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
          MindPalace
        </h1>
        <p className="text-xl text-[var(--muted)]">
          교과서를 마인드맵으로 펼치고, 기억의 궁전에 저장하라
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-[var(--accent-violet)] text-white font-medium glass-hover"
          >
            시작하기
          </Link>
          <Link
            href="#features"
            className="px-6 py-3 rounded-xl glass glass-hover font-medium"
          >
            더 알아보기
          </Link>
        </div>
      </div>
    </main>
  );
}
