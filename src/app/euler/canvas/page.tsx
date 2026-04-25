"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { HandwriteCanvas, type HandwriteSubmitMeta } from "@/components/euler/HandwriteCanvas";
import { encodeCanvasToPayload } from "@/lib/euler/canvas-stroke-encoder";
import { createClient } from "@/lib/supabase/client";

type Stage = "draw" | "parsing" | "error";

export default function EulerCanvasPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("draw");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [betaChecked, setBetaChecked] = useState(false);

  // 베타 게이트: euler_beta_invites status='active' 없으면 /euler/beta 로 이동
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login?next=/euler/canvas");
        return;
      }
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
      setBetaChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(dataUrl: string, _meta: HandwriteSubmitMeta) {
    setStage("parsing");
    setErrorMsg(null);

    // dataURL 을 임시 canvas 로 다시 그려서 다운스케일 (encodeCanvasToPayload 활용)
    let payloadDataUrl = dataUrl;
    try {
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("이미지 로드 실패"));
      });
      const tmp = document.createElement("canvas");
      tmp.width = img.width;
      tmp.height = img.height;
      tmp.getContext("2d")!.drawImage(img, 0, 0);
      const encoded = encodeCanvasToPayload(tmp);
      payloadDataUrl = encoded.dataUrl;
    } catch {
      // 인코딩 실패 시 원본 사용
    }

    try {
      const resp = await fetch("/api/euler-tutor/parse-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: payloadDataUrl, handwritten: true }),
      });
      const data = (await resp.json()) as { text: string | null; fallback: boolean };
      const text = (data.text ?? "").trim();
      if (!text) {
        setStage("error");
        setErrorMsg("OCR 결과가 비어있어요. 더 또렷하게 다시 써볼까요?");
        return;
      }

      // sessionStorage 에 OCR 결과 저장 → /euler-tutor 에서 자동 픽업
      try {
        sessionStorage.setItem(
          "euler_canvas_seed",
          JSON.stringify({ text, source: "handwrite", ts: Date.now() })
        );
      } catch {}

      router.push("/euler-tutor?from=canvas");
    } catch {
      setStage("error");
      setErrorMsg("OCR 호출에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  if (!betaChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white flex items-center justify-center">
        <div className="text-sm text-white/60">베타 상태 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">필기 모드</h1>
            <p className="text-sm text-white/60 mt-1">
              풀고 싶은 문제를 손글씨로 적어보세요. "도와줘"를 누르면 오일러 튜터가 코칭을 시작해요.
            </p>
          </div>
          <Link
            href="/euler-tutor"
            className="text-sm text-white/60 hover:text-white"
          >
            ← 채팅으로 돌아가기
          </Link>
        </div>

        <HandwriteCanvas
          onSubmit={handleSubmit}
          disabled={stage === "parsing"}
          helpLabel={stage === "parsing" ? "분석 중..." : "도와줘"}
        />

        {stage === "parsing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-white/70"
          >
            ✨ 손글씨를 읽고 있어요...
          </motion.div>
        )}

        {stage === "error" && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-200"
          >
            {errorMsg}
            <button
              type="button"
              onClick={() => setStage("draw")}
              className="ml-3 underline hover:text-white"
            >
              다시 그리기
            </button>
          </motion.div>
        )}

        <p className="mt-6 text-xs text-white/40 text-center">
          데스크톱은 마우스, iPad/iPhone 은 Apple Pencil 또는 손가락으로 작성할 수 있어요.
        </p>
      </div>
    </div>
  );
}
