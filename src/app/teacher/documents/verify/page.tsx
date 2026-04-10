"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { createClient } from "@/lib/supabase/client";
import {
  hashFile,
  shortHash,
  formatFileSize,
  STATUS_LABELS,
  STATUS_COLORS,
  type DocumentStatus,
} from "@/lib/data/document-hash";

interface VerifyResult {
  status: "match" | "mismatch" | "not_found";
  fileHash: string;
  document?: {
    id: string;
    title: string;
    doc_number: string | null;
    status: DocumentStatus;
    content_hash: string;
    created_at: string;
  };
  versions?: {
    version_number: number;
    content_hash: string;
    action: string;
    notes: string | null;
    created_at: string;
  }[];
}

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [manualHash, setManualHash] = useState("");

  async function handleVerify() {
    if (!file && !manualHash.trim()) return;
    setVerifying(true);

    let fileHash: string;
    if (file) {
      fileHash = await hashFile(file);
    } else {
      fileHash = manualHash.trim().toLowerCase();
    }

    const supabase = createClient();

    // 현재 해시로 문서 검색
    const { data: docs } = await supabase
      .from("documents")
      .select("id, title, doc_number, status, content_hash, created_at")
      .eq("content_hash", fileHash)
      .limit(1);

    if (docs && docs.length > 0) {
      const doc = docs[0];
      const { data: versions } = await supabase
        .from("document_versions")
        .select("version_number, content_hash, action, notes, created_at")
        .eq("document_id", doc.id)
        .order("version_number", { ascending: false });

      setResult({
        status: "match",
        fileHash,
        document: doc as VerifyResult["document"],
        versions: (versions as VerifyResult["versions"]) ?? [],
      });
    } else {
      // 버전 이력에서 과거 해시 검색 (위변조 감지)
      const { data: pastVersions } = await supabase
        .from("document_versions")
        .select("document_id, version_number, content_hash, action, notes, created_at")
        .eq("content_hash", fileHash)
        .limit(1);

      if (pastVersions && pastVersions.length > 0) {
        const pv = pastVersions[0];
        const { data: docData } = await supabase
          .from("documents")
          .select("id, title, doc_number, status, content_hash, created_at")
          .eq("id", pv.document_id)
          .single();

        const { data: allVersions } = await supabase
          .from("document_versions")
          .select("version_number, content_hash, action, notes, created_at")
          .eq("document_id", pv.document_id)
          .order("version_number", { ascending: false });

        setResult({
          status: "mismatch",
          fileHash,
          document: docData as VerifyResult["document"],
          versions: (allVersions as VerifyResult["versions"]) ?? [],
        });
      } else {
        setResult({ status: "not_found", fileHash });
      }
    }

    setVerifying(false);
  }

  function reset() {
    setFile(null);
    setManualHash("");
    setResult(null);
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/teacher/documents"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          ← 문서 관리
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">🔍 위변조 검증</h1>
          <p className="text-muted mb-8">
            문서를 업로드하면 SHA-256 해시를 비교하여 원본 여부를 확인합니다.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* 파일 업로드 */}
              <GlassCard hover={false}>
                <h3 className="text-sm font-semibold mb-3">방법 1: 파일 업로드</h3>
                <label
                  className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    file
                      ? "border-primary bg-primary/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                        setManualHash("");
                      }
                    }}
                    className="hidden"
                  />
                  {file ? (
                    <div>
                      <span className="text-2xl block mb-2">📄</span>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl block mb-2">📁</span>
                      <p className="text-sm text-muted">검증할 문서를 선택하세요</p>
                    </div>
                  )}
                </label>
              </GlassCard>

              {/* 해시 직접 입력 */}
              <GlassCard hover={false}>
                <h3 className="text-sm font-semibold mb-3">방법 2: 해시 코드 입력</h3>
                <input
                  value={manualHash}
                  onChange={(e) => {
                    setManualHash(e.target.value);
                    if (e.target.value) setFile(null);
                  }}
                  placeholder="SHA-256 해시 코드를 입력하세요..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </GlassCard>

              <div className="flex justify-center">
                <button
                  onClick={handleVerify}
                  disabled={(!file && !manualHash.trim()) || verifying}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {verifying ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      검증 중...
                    </span>
                  ) : (
                    "검증 시작"
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* 검증 결과 */}
              <GlassCard hover={false}>
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-5xl mb-3"
                  >
                    {result.status === "match"
                      ? "✅"
                      : result.status === "mismatch"
                      ? "⚠️"
                      : "❌"}
                  </motion.div>
                  <h2 className="text-xl font-bold mb-2">
                    {result.status === "match"
                      ? "원본 확인됨"
                      : result.status === "mismatch"
                      ? "내용 변경 감지"
                      : "등록되지 않은 문서"}
                  </h2>
                  <p className="text-sm text-muted">
                    {result.status === "match"
                      ? "이 문서는 원본과 해시가 일치합니다."
                      : result.status === "mismatch"
                      ? "이 해시는 과거 버전에 존재합니다. 현재 문서와 내용이 다릅니다."
                      : "시스템에 등록된 문서 중 일치하는 해시가 없습니다."}
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-xs text-muted block mb-1">검증 해시</span>
                  <span className="text-xs font-mono text-primary break-all">
                    {result.fileHash}
                  </span>
                </div>
              </GlassCard>

              {/* 문서 정보 */}
              {result.document && (
                <GlassCard hover={false}>
                  <h3 className="text-sm font-semibold mb-3">문서 정보</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted text-xs block">제목</span>
                      <span>{result.document.title}</span>
                    </div>
                    <div>
                      <span className="text-muted text-xs block">상태</span>
                      <span className={STATUS_COLORS[result.document.status]}>
                        {STATUS_LABELS[result.document.status]}
                      </span>
                    </div>
                    {result.document.doc_number && (
                      <div>
                        <span className="text-muted text-xs block">발급 번호</span>
                        <span className="font-bold text-primary">
                          {result.document.doc_number}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted text-xs block">현재 해시</span>
                      <span className="font-mono text-xs">
                        #{shortHash(result.document.content_hash)}
                        {result.status === "mismatch" && (
                          <span className="text-orange-400 ml-1">(불일치)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 버전 이력 */}
              {result.versions && result.versions.length > 0 && (
                <GlassCard hover={false}>
                  <h3 className="text-sm font-semibold mb-3">변경 이력</h3>
                  <div className="space-y-2">
                    {result.versions.map((v, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2 rounded text-xs ${
                          v.content_hash === result.fileHash
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-white/3"
                        }`}
                      >
                        <div>
                          <span className="font-medium">v{v.version_number}</span>
                          <span className="text-muted ml-2">
                            {v.action}
                          </span>
                          {v.notes && (
                            <span className="text-muted ml-2">— {v.notes}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted">
                            #{shortHash(v.content_hash)}
                          </span>
                          {v.content_hash === result.fileHash && (
                            <span className="text-primary">← 일치</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              <div className="flex justify-center">
                <button
                  onClick={reset}
                  className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                >
                  다시 검증하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
