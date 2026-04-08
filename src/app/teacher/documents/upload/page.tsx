"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { createClient } from "@/lib/supabase/client";
import {
  hashFile,
  shortHash,
  isAllowedFile,
  formatFileSize,
  ALLOWED_EXTENSIONS,
} from "@/lib/data/document-hash";
import { analyzeDocument, type FormatIssue } from "@/lib/data/document-rules";

interface UploadedFile {
  file: File;
  hash: string;
  status: "hashing" | "ready" | "uploading" | "done" | "error";
  formatIssues?: FormatIssue[];
  textContent?: string;
  errorMsg?: string;
}

type Step = "upload" | "format_check" | "submit";

export default function DocumentUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [batchTitle, setBatchTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isBatch = files.length > 1;

  // --- 파일 추가 + 해시 계산 ---
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => isAllowedFile(f.name));
    if (arr.length === 0) return;

    const entries: UploadedFile[] = arr.map((f) => ({
      file: f,
      hash: "",
      status: "hashing" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);

    // 해시 계산 (병렬)
    const hashed = await Promise.all(
      arr.map(async (f) => {
        const h = await hashFile(f);
        // .txt 파일은 텍스트 추출하여 양식 검토 가능
        let textContent: string | undefined;
        if (f.name.toLowerCase().endsWith(".txt")) {
          textContent = await f.text();
        }
        return { fileName: f.name, hash: h, textContent };
      })
    );

    setFiles((prev) =>
      prev.map((entry) => {
        const match = hashed.find((h) => h.fileName === entry.file.name);
        if (match && entry.status === "hashing") {
          return {
            ...entry,
            hash: match.hash,
            textContent: match.textContent,
            status: "ready" as const,
          };
        }
        return entry;
      })
    );
  }, []);

  // --- 드래그앤드롭 ---
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  // --- 파일 제거 ---
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // --- 양식 검토 ---
  function runFormatCheck() {
    setFiles((prev) =>
      prev.map((entry) => {
        if (entry.textContent) {
          const issues = analyzeDocument(entry.textContent);
          return { ...entry, formatIssues: issues };
        }
        return entry;
      })
    );
    setStep("format_check");
  }

  // --- Supabase 업로드 + DB 저장 ---
  async function handleSubmit() {
    if (files.length === 0) return;
    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 배치 생성 (2개 이상일 때)
      let batchId: string | null = null;
      if (isBatch) {
        const { data: batch } = await supabase
          .from("document_batches")
          .insert({
            uploader_id: user.id,
            title: batchTitle || `일괄 업로드 (${files.length}건)`,
            total_count: files.length,
          })
          .select("id")
          .single();
        batchId = batch?.id ?? null;
      }

      // 파일별 업로드
      for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading" as const } : f
          )
        );

        const filePath = `${user.id}/${Date.now()}_${entry.file.name}`;

        // Storage 업로드
        const { error: storageError } = await supabase.storage
          .from("documents")
          .upload(filePath, entry.file);

        if (storageError) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: "error" as const, errorMsg: storageError.message }
                : f
            )
          );
          continue;
        }

        // DB 레코드 생성
        const { data: doc } = await supabase
          .from("documents")
          .insert({
            uploader_id: user.id,
            batch_id: batchId,
            title: entry.file.name.replace(/\.[^.]+$/, ""),
            file_name: entry.file.name,
            file_path: filePath,
            content_hash: entry.hash,
            status: "pending_approval",
            format_check_skipped: !entry.textContent,
            format_issues: entry.formatIssues ?? null,
          })
          .select("id")
          .single();

        // 버전 이력 기록
        if (doc) {
          await supabase.from("document_versions").insert({
            document_id: doc.id,
            version_number: 1,
            content_hash: entry.hash,
            file_path: filePath,
            action: "upload",
            actor_id: user.id,
          });
        }

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "done" as const } : f
          )
        );
      }

      // 완료 → 목록 페이지로
      setTimeout(() => router.push("/teacher/documents"), 1000);
    } catch {
      setSubmitting(false);
    }
  }

  const allReady = files.length > 0 && files.every((f) => f.status === "ready");
  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/teacher/documents"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          ← 문서 관리
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">📤 문서 업로드</h1>
          <p className="text-muted mb-8">
            공문서를 업로드하면 SHA-256 해시가 자동 생성됩니다. 여러 파일을 한번에 올릴 수 있습니다.
          </p>
        </motion.div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-8">
          {(["upload", "format_check", "submit"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-white/10" />}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : ["upload", "format_check", "submit"].indexOf(step) > i
                    ? "bg-success/20 text-success"
                    : "bg-white/5 text-muted"
                }`}
              >
                {["upload", "format_check", "submit"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs ${
                  step === s ? "text-foreground" : "text-muted"
                }`}
              >
                {["파일 선택", "양식 검토", "제출"][i]}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: 파일 업로드 */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* 드래그앤드롭 영역 */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-white/10 hover:border-white/20 hover:bg-white/3"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                  className="hidden"
                />
                <div className="text-4xl mb-3">
                  {isDragging ? "📥" : "📁"}
                </div>
                <p className="text-foreground font-medium mb-1">
                  {isDragging
                    ? "여기에 놓으세요"
                    : "파일을 드래그하거나 클릭하여 선택"}
                </p>
                <p className="text-xs text-muted">
                  {ALLOWED_EXTENSIONS.join(", ")} · 여러 파일 동시 선택 가능
                </p>
              </div>

              {/* 배치 제목 (2개 이상) */}
              {isBatch && (
                <GlassCard hover={false}>
                  <label className="text-sm font-medium mb-2 block">
                    일괄 발급 제목 (선택)
                  </label>
                  <input
                    value={batchTitle}
                    onChange={(e) => setBatchTitle(e.target.value)}
                    placeholder="예: 2026학년도 졸업장"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </GlassCard>
              )}

              {/* 파일 목록 */}
              {files.length > 0 && (
                <GlassCard hover={false}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      선택된 파일 ({files.length}개)
                    </span>
                    {files.some((f) => f.status === "hashing") && (
                      <span className="text-xs text-muted flex items-center gap-2">
                        <span className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full" />
                        해시 계산 중...
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {files.map((entry, i) => (
                      <motion.div
                        key={`${entry.file.name}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5"
                      >
                        <span className="text-lg">
                          {entry.file.name.endsWith(".hwp") || entry.file.name.endsWith(".hwpx")
                            ? "📘"
                            : entry.file.name.endsWith(".docx") || entry.file.name.endsWith(".doc")
                            ? "📄"
                            : entry.file.name.endsWith(".pdf")
                            ? "📕"
                            : "📝"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{entry.file.name}</p>
                          <p className="text-xs text-muted">
                            {formatFileSize(entry.file.size)}
                            {entry.hash && (
                              <>
                                {" · "}
                                <span className="font-mono text-primary">
                                  #{shortHash(entry.hash)}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="text-xs text-muted hover:text-destructive transition-colors px-2"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* 다음 버튼 */}
              {allReady && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={runFormatCheck}
                    className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105"
                  >
                    양식 검토 →
                  </button>
                  <button
                    onClick={() => setStep("submit")}
                    className="px-8 py-3 rounded-xl glass text-sm hover:bg-card-hover transition-colors"
                  >
                    검토 건너뛰기
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: 양식 검토 */}
          {step === "format_check" && (
            <motion.div
              key="format_check"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {files.map((entry, i) => (
                <GlassCard key={i} hover={false}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{entry.file.name}</span>
                    <span className="text-xs font-mono text-primary">
                      #{shortHash(entry.hash)}
                    </span>
                  </div>

                  {entry.textContent && entry.formatIssues ? (
                    entry.formatIssues.length === 0 ? (
                      <div className="text-sm text-success flex items-center gap-2">
                        ✅ 공문서 양식이 올바릅니다
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-yellow-400">
                          ⚠ {entry.formatIssues.length}개 양식 위반 발견
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {entry.formatIssues.map((issue, j) => (
                            <div
                              key={j}
                              className="text-xs font-mono p-2 rounded bg-white/3"
                            >
                              <span className="text-muted">줄 {issue.line}</span>{" "}
                              <span className="text-destructive/80 line-through">
                                {issue.original.trim().slice(0, 50)}
                              </span>
                              {" → "}
                              <span className="text-success">
                                {issue.corrected.trim().slice(0, 50)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted">
                          * 로컬에서 수정 후 다시 업로드하거나, 그대로 제출할 수 있습니다.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-xs text-muted">
                      바이너리 파일 — 텍스트 양식 검토 불가 (건너뛰기 됨)
                    </div>
                  )}
                </GlassCard>
              ))}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep("upload")}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  ← 파일 수정
                </button>
                <button
                  onClick={() => setStep("submit")}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105"
                >
                  승인 요청 →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: 제출 확인 */}
          {step === "submit" && (
            <motion.div
              key="submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <GlassCard hover={false}>
                <h3 className="text-lg font-semibold mb-4">제출 확인</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">파일 수</span>
                    <span>{files.length}개</span>
                  </div>
                  {isBatch && batchTitle && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">배치 제목</span>
                      <span>{batchTitle}</span>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-3 space-y-2">
                    {files.map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="truncate max-w-[60%]">{entry.file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary">
                            #{shortHash(entry.hash)}
                          </span>
                          {entry.status === "uploading" && (
                            <span className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full" />
                          )}
                          {entry.status === "done" && (
                            <span className="text-success">✓</span>
                          )}
                          {entry.status === "error" && (
                            <span className="text-destructive" title={entry.errorMsg}>✕</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {allDone ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-4xl mb-2"
                  >
                    ✅
                  </motion.div>
                  <p className="text-sm text-success">
                    업로드 완료! 문서 목록으로 이동합니다...
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setStep("format_check")}
                    disabled={submitting}
                    className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors disabled:opacity-50"
                  >
                    ← 뒤로
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        업로드 중...
                      </span>
                    ) : (
                      "승인 요청 제출"
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
