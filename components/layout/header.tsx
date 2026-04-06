"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, LogIn, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 glass-hover px-3 py-1.5 rounded-lg">
          <Brain className="w-6 h-6 text-[var(--accent-violet)]" />
          <span className="font-bold text-lg tracking-tight">MindPalace</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            대시보드
          </Link>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-[var(--muted-foreground)] hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-1" />
              로그아웃
            </Button>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--muted-foreground)] hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-1" />
                로그인
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
