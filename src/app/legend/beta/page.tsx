"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Stage = "checking" | "form" | "redeeming" | "active" | "error";

export default function LegendBetaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/legend/canvas";

  const [stage, setStage] = useState<Stage>("checking");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 이미 베타 멤버면 자동 통과
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          router.replace(`/login?next=${encodeURIComponent(`/legend/beta?next=${next}`)}`);
        }
        return;
      }
      const { data } = await supabase
        .from("euler_beta_invites")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setStage("active");
        router.replace(next);
      } else {
        setStage("form");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, next]);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStage("redeeming");
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.rpc("redeem_euler_beta", { p_code: code.trim() });

    if (error) {
      setStage("error");
      const msg = error.message || "";
      if (msg.includes("invalid_code")) {
        setErrorMsg("초대 코드가 올바르지 않아요. 다시 확인해주세요.");
      } else if (msg.includes("beta_full")) {
        setErrorMsg("베타 정원(50명) 이 마감되었습니다. 곧 정식 출시 예정이에요!");
      } else if (msg.includes("unauthenticated")) {
        setErrorMsg("로그인이 필요해요.");
      } else {
        setErrorMsg("처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
        console.error("[redeem_euler_beta] unhandled error:", error);
      }
      return;
    }

    setStage("active");
    router.replace(next);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-md mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">레전드 튜터 클로즈드 베타</h1>
          <p className="text-sm text-white/60">
            정식 출시 전, 50명에게 먼저 공개합니다.
            <br />
            초대 코드를 입력해주세요.
          </p>
        </div>

        {stage === "checking" && (
          <div className="text-center text-white/60 text-sm">베타 상태 확인 중...</div>
        )}

        {(stage === "form" || stage === "redeeming" || stage === "error") && (
          <motion.form
            onSubmit={handleRedeem}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="초대 코드 (예: EULER____)"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 transition-colors"
              autoFocus
              disabled={stage === "redeeming"}
            />
            {errorMsg && (
              <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                {errorMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={!code.trim() || stage === "redeeming"}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold disabled:opacity-40 transition-all"
            >
              {stage === "redeeming" ? "확인 중..." : "베타 입장"}
            </button>
          </motion.form>
        )}

        {stage === "active" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-emerald-300"
          >
            ✓ 베타 활성화 완료. 잠시만요...
          </motion.div>
        )}

        <div className="mt-6 text-center text-xs text-white/50">
          코드가 없으신가요?{" "}
          <Link
            href="/legend/beta/apply"
            className="underline text-violet-300 hover:text-violet-200"
          >
            베타 신청서 작성
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-white/40">
          <Link href="/dashboard" className="hover:text-white/60">
            ← 대시보드로
          </Link>
        </div>
      </div>
    </div>
  );
}
