"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { createClient } from "@/lib/supabase/client";
import {
  shortHash,
  STATUS_LABELS,
  STATUS_COLORS,
  type DocumentStatus,
} from "@/lib/data/document-hash";

interface Document {
  id: string;
  title: string;
  file_name: string;
  status: DocumentStatus;
  content_hash: string;
  doc_number: string | null;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_FILTERS: { label: string; value: DocumentStatus | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "승인 대기", value: "pending_approval" },
  { label: "수정 요청", value: "revision_requested" },
  { label: "승인됨", value: "approved" },
  { label: "발급 완료", value: "issued" },
];

export default function DocumentListPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DocumentStatus | "all">("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("documents")
        .select("id, title, file_name, status, content_hash, doc_number, batch_id, created_at, updated_at")
        .order("created_at", { ascending: false });

      setDocs((data as Document[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  const filtered =
    filter === "all" ? docs : docs.filter((d) => d.status === filter);

  const statusCounts = docs.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          ← 대시보드
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">📋 문서 관리</h1>
            <p className="text-muted">
              공문서 발급 현황을 관리합니다. 총 {docs.length}건
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/teacher/documents/upload"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105"
            >
              + 업로드
            </Link>
            <Link
              href="/teacher/documents/verify"
              className="px-5 py-2.5 rounded-xl glass text-sm hover:bg-card-hover transition-colors"
            >
              🔍 검증
            </Link>
          </div>
        </motion.div>

        {/* 상태 필터 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setFilter(sf.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === sf.value
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-white/5 text-muted border border-white/5 hover:border-white/10"
              }`}
            >
              {sf.label}
              {sf.value !== "all" && statusCounts[sf.value] ? (
                <span className="ml-1 opacity-70">({statusCounts[sf.value]})</span>
              ) : sf.value === "all" ? (
                <span className="ml-1 opacity-70">({docs.length})</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* 문서 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted">로딩 중...</div>
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard hover={false}>
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-muted text-sm">
                {filter === "all"
                  ? "업로드된 문서가 없습니다."
                  : `${STATUS_LABELS[filter as DocumentStatus]} 상태의 문서가 없습니다.`}
              </p>
              <Link
                href="/teacher/documents/upload"
                className="inline-block mt-4 px-5 py-2 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 transition-colors"
              >
                문서 업로드하기
              </Link>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc, i) => (
              <Link key={doc.id} href={`/teacher/documents/${doc.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <GlassCard className="flex items-center gap-4 cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {doc.title}
                        </h3>
                        {doc.batch_id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">
                            일괄
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted">
                        {doc.file_name} · {new Date(doc.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-medium ${STATUS_COLORS[doc.status]}`}
                      >
                        {STATUS_LABELS[doc.status]}
                      </span>
                      <p className="text-xs font-mono text-muted mt-0.5">
                        {doc.doc_number || `#${shortHash(doc.content_hash)}`}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
