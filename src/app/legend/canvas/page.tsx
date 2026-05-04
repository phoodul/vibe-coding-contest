"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

/**
 * /legend/canvas — PWA 진입점.
 *
 * PWA standalone 진입점 (manifest.json 의 start_url 호환성) +
 * 베타 게이트 검증 후 /legend?openHandwrite=1 로 redirect.
 */
export default function LegendCanvasRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?next=/legend/canvas");
        return;
      }
      const { data } = await supabase
        .from("legend_beta_invites")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        router.replace("/legend/beta?next=/legend/canvas");
        return;
      }
      router.replace("/legend?openHandwrite=1");
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-12 h-12 mx-auto mb-4 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-sm text-white/70">필기 모드 준비 중...</p>
      </motion.div>
    </div>
  );
}
