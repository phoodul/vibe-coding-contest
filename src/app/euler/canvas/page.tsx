"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

/**
 * /euler/canvas — PWA 진입점.
 *
 * 사용자 통찰: 채팅과 필기는 별도 라우트가 아니라 "한 세션 안의 입력 방식"이어야 함.
 * 이전 (Phase A-11) 의 분리된 캔버스 페이지를 채팅 안의 모달로 통합.
 *
 * 본 라우트는 다음 두 가지 역할만 유지:
 *   1) PWA standalone 진입점 (manifest.json 의 start_url 호환성)
 *   2) 베타 게이트 검증 후 /euler-tutor?openHandwrite=1 로 redirect
 */
export default function EulerCanvasRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?next=/euler/canvas");
        return;
      }
      // 베타 게이트
      const { data } = await supabase
        .from("euler_beta_invites")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        router.replace("/euler/beta?next=/euler/canvas");
        return;
      }
      // 채팅 페이지로 진입 + 필기 모달 자동 오픈
      router.replace("/euler-tutor?openHandwrite=1");
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
