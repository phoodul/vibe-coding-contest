"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HandwriteCanvas, type HandwriteSubmitMeta } from "./HandwriteCanvas";
import { encodeCanvasToPayload } from "@/lib/euler/canvas-stroke-encoder";

interface HandwriteModalProps {
  open: boolean;
  onClose: () => void;
  /** OCR 성공 시 추출된 텍스트(LaTeX) — 호출자가 채팅 세션에 append 처리 */
  onResult: (text: string) => void;
}

export function HandwriteModal({ open, onClose, onResult }: HandwriteModalProps) {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(dataUrl: string, _meta: HandwriteSubmitMeta) {
    setParsing(true);
    setError(null);

    // 800KB 자동 다운스케일
    let payloadDataUrl = dataUrl;
    try {
      const img = new window.Image();
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
        setError("필기 인식에 실패했어요. 다시 적거나 텍스트로 입력해주세요.");
        return;
      }
      onResult(text);
      onClose();
    } catch {
      setError("처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setParsing(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-white">필기로 입력</h2>
                <p className="text-[11px] text-white/50 mt-0.5">
                  풀이 단계나 문제를 손글씨로 적고 &quot;도와줘&quot; — 같은 대화에 그대로 추가됩니다.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white text-xl leading-none px-2"
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <HandwriteCanvas
              width={1024}
              height={520}
              onSubmit={handleSubmit}
              disabled={parsing}
              helpLabel={parsing ? "인식 중..." : "도와줘"}
            />
            {error && (
              <p className="mt-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded p-2">
                {error}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
