"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/shared/glass-card";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, role },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName,
        role,
      });
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard hover={false}>
          <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm text-muted block mb-1">이름</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="text-sm text-muted block mb-1">역할</label>
              <div className="grid grid-cols-2 gap-3">
                {(["student", "teacher"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 rounded-lg border text-sm font-medium transition-all ${
                      role === r
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-muted hover:border-white/20"
                    }`}
                  >
                    {r === "student" ? "🎓 학생" : "👩‍🏫 교사"}
                  </button>
                ))}
              </div>
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="6자 이상"
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
              {loading ? "가입 중..." : "가입하기"}
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
