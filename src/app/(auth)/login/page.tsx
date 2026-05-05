"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/shared/glass-card";
import type { Provider } from "@supabase/supabase-js";

const socialProviders: { id: Provider; label: string; bg: string }[] = [
  { id: "google", label: "Google", bg: "bg-white text-gray-900" },
  { id: "kakao", label: "Kakao", bg: "bg-[#FEE500] text-[#191919]" },
  { id: "github", label: "GitHub", bg: "bg-[#24292f] text-white" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // OAuth 콜백 에러 표시
  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam) setError(decodeURIComponent(errParam));
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleSocialLogin(provider: Provider) {
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard hover={false}>
          <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>

          {/* 안내 — 같은 방식 로그인 권장 (OAuth 충돌 방지) */}
          <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3">
            <p className="text-xs text-amber-100/90 leading-relaxed">
              <span className="mr-1">💡</span>
              <span className="font-semibold text-amber-200">학습진도를 저장하려면 같은 방식으로 로그인하세요.</span>
              <br />
              <span className="text-amber-100/60">
                예: Google 로 가입했다면 Google 로만. 다른 방식으로 로그인하면 별도 계정이 만들어져 진도가 보이지 않을 수 있어요.
              </span>
            </p>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-2 mb-6">
            {socialProviders.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSocialLogin(p.id)}
                className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] ${p.bg}`}
              >
                {p.label}로 계속하기
              </button>
            ))}
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted">또는 이메일로 로그인</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-muted block mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="text-sm text-muted block mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-muted">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                회원가입
              </Link>
            </p>
            <p className="text-sm text-muted">
              <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">
                로그인 없이 체험하기 →
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
