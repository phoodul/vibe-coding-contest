"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HandwriteCanvas, type HandwriteSubmitMeta } from "./HandwriteCanvas";
import { encodeCanvasToPayload } from "@/lib/euler/canvas-stroke-encoder";

interface InlineHandwritePanelProps {
  open: boolean;
  onClose: () => void;
  /** OCR 텍스트가 확정된 후 호출 — 채팅 세션에 append 됨 */
  onConfirm: (text: string) => void;
}

type Stage = "draw" | "parsing" | "review" | "error";

export function InlineHandwritePanel({ open, onClose, onConfirm }: InlineHandwritePanelProps) {
  const [stage, setStage] = useState<Stage>("draw");
  const [ocrText, setOcrText] = useState("");
  const [parser, setParser] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function reset() {
    setStage("draw");
    setOcrText("");
    setParser("");
    setErrorMsg(null);
  }

  async function handleSubmit(dataUrl: string, _meta: HandwriteSubmitMeta) {
    setStage("parsing");
    setErrorMsg(null);

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
      const data = (await resp.json()) as { text: string | null; fallback: boolean; parser?: string };
      const text = (data.text ?? "").trim();
      if (!text) {
        setStage("error");
        setErrorMsg("필기 인식에 실패했어요. 다시 적거나 텍스트로 입력해주세요.");
        return;
      }
      setOcrText(text);
      setParser(data.parser ?? "");
      setStage("review");
    } catch {
      setStage("error");
      setErrorMsg("처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  function handleConfirm() {
    const text = ocrText.trim();
    if (!text) return;
    onConfirm(text);
    reset();
    onClose();
  }

  function handleCancel() {
    reset();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden mb-3"
        >
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-300">✏️ 필기로 입력</span>
              <button
                onClick={handleCancel}
                className="text-xs text-white/50 hover:text-white/80"
                aria-label="필기 닫기"
              >
                닫기 ×
              </button>
            </div>

            {/* Stage: 그리기 */}
            {stage === "draw" && (
              <>
                <p className="text-[11px] text-white/50 mb-2">
                  손글씨로 적고 &quot;도와줘&quot; — AI 가 한글 + 수식을 함께 인식합니다.
                </p>
                <HandwriteCanvas
                  width={1024}
                  height={420}
                  onSubmit={handleSubmit}
                  helpLabel="도와줘"
                />
              </>
            )}

            {/* Stage: 인식 중 */}
            {stage === "parsing" && (
              <div className="py-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full mx-auto mb-3"
                />
                <p className="text-xs text-white/70">필기를 인식하고 있어요...</p>
                <p className="text-[10px] text-white/40 mt-1">한글 + 수식은 약 3~5초 걸려요</p>
              </div>
            )}

            {/* Stage: 결과 검토 + 수정 */}
            {stage === "review" && (
              <div>
                <p className="text-[11px] text-white/60 mb-2">
                  인식 결과를 확인/수정한 후 전송하세요. 잘못된 부분은 직접 고칠 수 있어요.
                  {parser && (
                    <span className="ml-2 text-[10px] text-emerald-400/80">[{parser}]</span>
                  )}
                </p>
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 transition-colors font-mono"
                />
                <div className="mt-2 flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setStage("draw")}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/70 hover:text-white border border-white/10"
                  >
                    다시 그리기
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!ocrText.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-40 transition-colors"
                  >
                    채팅에 보내기 →
                  </button>
                </div>
              </div>
            )}

            {/* Stage: 에러 */}
            {stage === "error" && (
              <div className="py-6 text-center">
                <p className="text-sm text-rose-300 mb-3">{errorMsg}</p>
                <button
                  onClick={() => setStage("draw")}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
