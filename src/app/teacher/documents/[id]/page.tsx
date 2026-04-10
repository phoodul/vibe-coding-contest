"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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

interface DocumentRecord {
  id: string;
  uploader_id: string;
  approver_id: string | null;
  title: string;
  file_name: string;
  file_path: string;
  status: DocumentStatus;
  content_hash: string;
  doc_number: string | null;
  format_check_skipped: boolean;
  format_issues: unknown[] | null;
  created_at: string;
  updated_at: string;
}

interface Version {
  id: string;
  version_number: number;
  content_hash: string;
  action: string;
  actor_id: string;
  notes: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  upload: "업로드",
  edit: "수정",
  format_check: "양식 검토",
  approve: "승인",
  issue: "번호 발급",
  revision_request: "수정 요청",
};

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;

  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadDocument = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserId(user.id);

    const { data: docData } = await supabase
      .from("documents")
      .select("*")
      .eq("id", docId)
      .single();

    const { data: versionData } = await supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", docId)
      .order("version_number", { ascending: false });

    setDoc(docData as DocumentRecord | null);
    setVersions((versionData as Version[]) ?? []);
    setLoading(false);
  }, [docId, router]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // --- 파일 다운로드 ---
  async function handleDownload() {
    if (!doc) return;
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("documents")
      .download(doc.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // --- 수정된 파일 재업로드 ---
  async function handleReupload(e: React.ChangeEvent<HTMLInputElement>, andApprove = false) {
    if (!doc || !e.target.files?.[0] || !userId) return;
    setActionLoading(true);

    const file = e.target.files[0];
    const newHash = await hashFile(file);
    const supabase = createClient();

    const newPath = `${userId}/${Date.now()}_${file.name}`;
    await supabase.storage.from("documents").upload(newPath, file);

    let nextVersion = (versions[0]?.version_number ?? 0) + 1;

    // 수정 버전 기록
    await supabase
      .from("documents")
      .update({
        file_name: file.name,
        file_path: newPath,
        content_hash: newHash,
        status: andApprove ? "approved" : "pending_approval",
        ...(andApprove ? { approver_id: userId } : {}),
      })
      .eq("id", doc.id);

    await supabase.from("document_versions").insert({
      document_id: doc.id,
      version_number: nextVersion,
      content_hash: newHash,
      file_path: newPath,
      action: "edit",
      actor_id: userId,
      notes: andApprove ? "승인자 직접 수정" : "파일 수정 재업로드",
    });

    // 수정 후 즉시 승인하는 경우 승인 이력도 추가
    if (andApprove) {
      nextVersion += 1;
      await supabase.from("document_versions").insert({
        document_id: doc.id,
        version_number: nextVersion,
        content_hash: newHash,
        action: "approve",
        actor_id: userId,
        notes: "수정 후 승인",
      });
    }

    setActionLoading(false);
    loadDocument();
  }

  // --- 승인 ---
  async function handleApprove() {
    if (!doc || !userId) return;
    setActionLoading(true);

    const supabase = createClient();
    const nextVersion = (versions[0]?.version_number ?? 0) + 1;

    await supabase
      .from("documents")
      .update({
        status: "approved",
        approver_id: userId,
      })
      .eq("id", doc.id);

    await supabase.from("document_versions").insert({
      document_id: doc.id,
      version_number: nextVersion,
      content_hash: doc.content_hash,
      action: "approve",
      actor_id: userId,
    });

    setActionLoading(false);
    loadDocument();
  }

  // --- 수정 요청 ---
  async function handleRevisionRequest() {
    if (!doc || !userId || !revisionNote.trim()) return;
    setActionLoading(true);

    const supabase = createClient();
    const nextVersion = (versions[0]?.version_number ?? 0) + 1;

    await supabase
      .from("documents")
      .update({ status: "revision_requested" })
      .eq("id", doc.id);

    await supabase.from("document_versions").insert({
      document_id: doc.id,
      version_number: nextVersion,
      content_hash: doc.content_hash,
      action: "revision_request",
      actor_id: userId,
      notes: revisionNote,
    });

    setRevisionNote("");
    setShowRevisionInput(false);
    setActionLoading(false);
    loadDocument();
  }

  // --- 번호 발급 ---
  async function handleIssue() {
    if (!doc || !userId) return;
    setActionLoading(true);

    const supabase = createClient();

    // RPC로 atomic 번호 생성
    const { data: docNumber } = await supabase.rpc("generate_doc_number", {
      p_org_prefix: "EduFlow",
    });

    const nextVersion = (versions[0]?.version_number ?? 0) + 1;

    await supabase
      .from("documents")
      .update({
        status: "issued",
        doc_number: docNumber,
      })
      .eq("id", doc.id);

    await supabase.from("document_versions").insert({
      document_id: doc.id,
      version_number: nextVersion,
      content_hash: doc.content_hash,
      action: "issue",
      actor_id: userId,
      notes: `발급번호: ${docNumber}`,
    });

    setActionLoading(false);
    loadDocument();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">로딩 중...</div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">문서를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const canApprove = doc.status === "pending_approval";
  const canIssue = doc.status === "approved";
  const canEdit = doc.status === "revision_requested" || doc.status === "pending_approval";

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/teacher/documents"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          ← 문서 관리
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">{doc.title}</h1>
              <p className="text-sm text-muted">{doc.file_name}</p>
            </div>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-lg ${STATUS_COLORS[doc.status]} bg-white/5`}
            >
              {STATUS_LABELS[doc.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 좌: 문서 정보 + 액션 */}
            <div className="lg:col-span-2 space-y-4">
              {/* 문서 정보 카드 */}
              <GlassCard hover={false}>
                <h3 className="text-sm font-semibold mb-4">문서 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted block text-xs mb-1">해시 코드</span>
                    <span className="font-mono text-primary text-xs break-all">
                      {doc.content_hash}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-xs mb-1">축약 해시</span>
                    <span className="font-mono text-primary">
                      #{shortHash(doc.content_hash)}
                    </span>
                  </div>
                  {doc.doc_number && (
                    <div className="col-span-2">
                      <span className="text-muted block text-xs mb-1">
                        발급 번호
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {doc.doc_number}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted block text-xs mb-1">업로드일</span>
                    <span>{new Date(doc.created_at).toLocaleString("ko-KR")}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-xs mb-1">최종 수정</span>
                    <span>{new Date(doc.updated_at).toLocaleString("ko-KR")}</span>
                  </div>
                </div>
              </GlassCard>

              {/* 액션 버튼 */}
              <GlassCard hover={false}>
                <h3 className="text-sm font-semibold mb-4">작업</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
                  >
                    📥 다운로드
                  </button>

                  {canEdit && (
                    <>
                      <label className="px-4 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors cursor-pointer">
                        &#128206; 수정 파일 업로드
                        <input
                          type="file"
                          onChange={(e) => handleReupload(e, false)}
                          className="hidden"
                        />
                      </label>
                      <label className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer">
                        &#128206;&#9989; 수정 후 즉시 승인
                        <input
                          type="file"
                          onChange={(e) => handleReupload(e, true)}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}

                  {canApprove && (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="px-5 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      >
                        ✅ 승인
                      </button>
                      <button
                        onClick={() => setShowRevisionInput(!showRevisionInput)}
                        disabled={actionLoading}
                        className="px-5 py-2 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                      >
                        ↩ 수정 요청
                      </button>
                    </>
                  )}

                  {canIssue && (
                    <button
                      onClick={handleIssue}
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50"
                    >
                      🔢 번호 발급
                    </button>
                  )}
                </div>

                {/* 수정 요청 사유 입력 */}
                {showRevisionInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4"
                  >
                    <textarea
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      rows={3}
                      placeholder="수정 요청 사유를 입력하세요..."
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm resize-none focus:outline-none focus:border-orange-400 transition-colors"
                    />
                    <button
                      onClick={handleRevisionRequest}
                      disabled={!revisionNote.trim() || actionLoading}
                      className="mt-2 px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 text-sm hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                    >
                      수정 요청 전송
                    </button>
                  </motion.div>
                )}

                {actionLoading && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                    <span className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full" />
                    처리 중...
                  </div>
                )}
              </GlassCard>
            </div>

            {/* 우: 버전 이력 (위변조 추적) */}
            <div>
              <GlassCard hover={false} className="h-fit">
                <h3 className="text-sm font-semibold mb-4">📜 변경 이력</h3>
                {versions.length === 0 ? (
                  <p className="text-xs text-muted">이력이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {versions.map((v, i) => {
                      const delay = i * 0.05;
                      const prevHash = versions[i + 1]?.content_hash;
                      const hashChanged = prevHash && prevHash !== v.content_hash;

                      return (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay }}
                          className="relative pl-5 pb-3 border-l border-white/10 last:pb-0"
                        >
                          <div
                            className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full ${
                              hashChanged
                                ? "bg-orange-400"
                                : v.action === "issue"
                                ? "bg-primary"
                                : "bg-white/20"
                            }`}
                          />
                          <p className="text-xs font-medium">
                            {ACTION_LABELS[v.action] || v.action}
                            <span className="text-muted ml-2">v{v.version_number}</span>
                          </p>
                          <p className="text-[11px] font-mono text-muted mt-0.5">
                            #{shortHash(v.content_hash)}
                            {hashChanged && (
                              <span className="text-orange-400 ml-1">
                                (해시 변경)
                              </span>
                            )}
                          </p>
                          {v.notes && (
                            <p className="text-[11px] text-muted mt-1 bg-white/3 p-1.5 rounded">
                              {v.notes}
                            </p>
                          )}
                          <p className="text-[10px] text-muted mt-1">
                            {new Date(v.created_at).toLocaleString("ko-KR")}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
