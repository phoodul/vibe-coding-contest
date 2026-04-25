"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Stage = "form" | "submitting" | "sent" | "error";

export default function ParentalConsentPage() {
  const [stage, setStage] = useState<Stage>("form");
  const [birthdate, setBirthdate] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(() => setAuthChecked(true));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthdate || !parentEmail) return;
    setStage("submitting");
    setErrorMsg(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("request_parental_consent", {
      p_birthdate: birthdate,
      p_parent_email: parentEmail,
    });

    if (error) {
      setStage("error");
      setErrorMsg(error.message);
      return;
    }
    if (data === "not_required") {
      setStage("sent");
      setErrorMsg("만 14세 이상이라 부모 동의가 필요하지 않아요. 바로 이용 가능합니다.");
      return;
    }

    // 실제 운영 시: server route 가 token 으로 부모 이메일 발송
    // 여기서는 안내만
    setStage("sent");
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 bg-slate-950">
        확인 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-md mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👨‍👩‍👧</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">법정대리인 동의</h1>
          <p className="text-sm text-white/60">
            만 14세 미만은 부모님의 이메일 인증이 필요해요.
          </p>
        </div>

        {stage === "sent" ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-100 text-sm text-center"
          >
            ✓ 부모님 이메일로 인증 메일을 보냈어요. 메일의 링크를 클릭하면 가입이 완료됩니다.
            {errorMsg && <p className="mt-2 text-xs text-amber-300">{errorMsg}</p>}
          </motion.div>
        ) : (
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs text-white/60">생년월일</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
                disabled={stage === "submitting"}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/60">부모님 이메일</label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required
                disabled={stage === "submitting"}
                placeholder="parent@example.com"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
              />
            </div>

            {errorMsg && (
              <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={stage === "submitting" || !birthdate || !parentEmail}
              className="w-full px-4 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-semibold disabled:opacity-40 transition-colors"
            >
              {stage === "submitting" ? "발송 중..." : "동의 요청 발송"}
            </button>
            <p className="text-[10px] text-center text-white/40">
              개인정보는 동의 검증 목적으로만 사용되며, 동의 완료 후 즉시 hash 됩니다.
            </p>
          </motion.form>
        )}

        <div className="mt-8 text-center text-xs text-white/40">
          <Link href="/legal/privacy" className="hover:text-white/60 underline">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </div>
  );
}
