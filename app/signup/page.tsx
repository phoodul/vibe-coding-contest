"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <AnimatedContainer>
        <GlassCard className="p-8 w-full max-w-md" hover={false}>
          <div className="text-center mb-8">
            <Brain className="w-10 h-10 mx-auto mb-3 text-[var(--accent-violet)]" />
            <h1 className="text-2xl font-bold">MindPalace 회원가입</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              기억의 궁전을 시작하세요
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="홍길동"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="mt-1.5 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="6자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1.5 bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label>역할 선택</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    role === "student"
                      ? "bg-[var(--accent-violet)]/20 ring-2 ring-[var(--accent-violet)] text-white"
                      : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
                  }`}
                >
                  🎓 학생
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    role === "teacher"
                      ? "bg-[var(--accent-emerald)]/20 ring-2 ring-[var(--accent-emerald)] text-white"
                      : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
                  }`}
                >
                  📝 교사
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              회원가입
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-[var(--accent-violet)] hover:underline">
              로그인
            </Link>
          </p>
        </GlassCard>
      </AnimatedContainer>
    </main>
  );
}
