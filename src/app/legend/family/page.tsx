"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface FamilyChild {
  user_id: string;
  email: string | null;
  lock_reveal: boolean;
}

interface FamilyRow {
  user_id: string;
  lock_reveal: boolean;
}

export default function LegendFamilyPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [children, setChildren] = useState<FamilyChild[]>([]);
  const [linking, setLinking] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setAuthChecked(true);
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
      setAuthChecked(true);
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("euler_family_settings")
      .select("user_id, lock_reveal")
      .eq("parent_user_id", user.id);
    setChildren(((data ?? []) as FamilyRow[]).map((r) => ({ ...r, email: null })));
  }

  async function linkChild() {
    if (!linkInput.trim()) return;
    setLinking(true);
    setStatusMsg(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("link_family", { p_child_user_id: linkInput.trim() });
    setLinking(false);
    if (error) {
      setStatusMsg(`연결 실패: ${error.message}`);
      return;
    }
    setStatusMsg("연결되었습니다.");
    setLinkInput("");
    await refresh();
  }

  async function toggleLock(child: FamilyChild) {
    const supabase = createClient();
    const { error } = await supabase.rpc("set_family_lock_reveal", {
      p_child_user_id: child.user_id,
      p_lock: !child.lock_reveal,
    });
    if (error) {
      setStatusMsg(`토글 실패: ${error.message}`);
      return;
    }
    await refresh();
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 text-sm bg-slate-950">
        확인 중...
      </div>
    );
  }
  if (!authorized) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-white">
        <h1 className="text-2xl font-bold">로그인이 필요해요</h1>
        <Link href="/login?next=/legend/family" className="text-violet-400 underline mt-4 inline-block">
          로그인하러 가기
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">가족 잠금 설정</h1>
            <p className="text-sm text-white/60 mt-1">
              자녀가 답을 직접 보지 못하도록 잠글 수 있어요.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white">
            ← 대시보드
          </Link>
        </div>

        <section className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-sm font-semibold mb-2">자녀 계정 연결</h2>
          <p className="text-xs text-white/50 mb-3">
            자녀의 user_id 를 입력하세요. (자녀가 가입 후 본인 user_id 를 부모에게 공유)
          </p>
          <div className="flex gap-2">
            <input
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="자녀 user_id (UUID)"
              className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm font-mono"
              disabled={linking}
            />
            <button
              onClick={linkChild}
              disabled={linking || !linkInput.trim()}
              className="px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-semibold disabled:opacity-40"
            >
              {linking ? "연결 중..." : "연결"}
            </button>
          </div>
          {statusMsg && <p className="text-xs text-amber-300 mt-2">{statusMsg}</p>}
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3">연결된 자녀 ({children.length})</h2>
          {children.length === 0 ? (
            <p className="text-white/40 text-sm">아직 연결된 자녀가 없어요.</p>
          ) : (
            <div className="space-y-2">
              {children.map((c) => (
                <motion.div
                  key={c.user_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="font-mono text-xs text-white/60">
                    {c.user_id.slice(0, 8)}...{c.user_id.slice(-6)}
                  </div>
                  <button
                    onClick={() => toggleLock(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      c.lock_reveal
                        ? "bg-rose-500/15 border-rose-400/40 text-rose-200"
                        : "bg-white/5 border-white/10 text-white/60"
                    }`}
                  >
                    {c.lock_reveal ? "🔒 답 공개 잠김" : "🔓 답 공개 허용"}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
