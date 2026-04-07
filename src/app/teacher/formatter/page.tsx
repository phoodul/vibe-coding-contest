"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { analyzeDocument, applyAllFixes, type FormatIssue } from "@/lib/data/document-rules";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";

const SAMPLE_TEXT = `1.교육과정 운영 계획서 제출 안내

관련: 교육지원과-1234(2026.4.8)

1.2026학년도 교육과정 운영 계획서를 아래와 같이 제출하여 주시기 바랍니다.
가.제출 기한: 2026.4.15
나.제출 방법: K-에듀파인 업무관리 시스템
다.제출 시간: 17:00까지
라.제출 금액: 50000원

붙임 1. 교육과정 운영 계획서 양식 1부
끝`;

export default function FormatterPage() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [currentIssueIdx, setCurrentIssueIdx] = useState(0);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());

  const issues = useMemo(() => analyzeDocument(text), [text]);
  const currentIssue = issues[currentIssueIdx];

  function applyOne(issueIdx: number) {
    const issue = issues[issueIdx];
    if (!issue) return;
    const lines = text.split("\n");
    lines[issue.line - 1] = issue.corrected;
    setText(lines.join("\n"));
    setAppliedFixes((prev) => new Set([...prev, issueIdx]));
    if (currentIssueIdx < issues.length - 1) {
      setCurrentIssueIdx(currentIssueIdx + 1);
    }
  }

  function applyAll() {
    setText(applyAllFixes(text));
    setAppliedFixes(new Set(issues.map((_, i) => i)));
  }

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors mb-8 block">
          ← 대시보드
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">📄 공문서 포맷터</h1>
          <p className="text-muted mb-8">
            K-에듀파인 공문서 양식에 맞지 않는 부분을 자동으로 찾아 교정합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 에디터 */}
          <GlassCard hover={false} className="h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">원본 문서</span>
              <span className="text-xs text-muted">
                {issues.length}개 교정 사항
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setAppliedFixes(new Set());
                setCurrentIssueIdx(0);
              }}
              className="flex-1 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors"
              placeholder="공문서 내용을 입력하거나 붙여넣으세요..."
            />
          </GlassCard>

          {/* 교정 결과 */}
          <GlassCard hover={false} className="h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">교정 결과</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentIssueIdx(Math.max(0, currentIssueIdx - 1))}
                  disabled={currentIssueIdx === 0}
                  className="px-2 py-1 rounded text-xs glass disabled:opacity-30"
                >
                  ← 이전
                </button>
                <button
                  onClick={() => setCurrentIssueIdx(Math.min(issues.length - 1, currentIssueIdx + 1))}
                  disabled={currentIssueIdx >= issues.length - 1}
                  className="px-2 py-1 rounded text-xs glass disabled:opacity-30"
                >
                  다음 →
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {issues.length === 0 ? (
                <div className="flex items-center justify-center h-full text-success text-sm">
                  ✅ 모든 양식이 올바릅니다!
                </div>
              ) : (
                issues.map((issue, i) => (
                  <motion.div
                    key={`${issue.line}-${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`p-3 rounded-lg border text-sm ${
                      i === currentIssueIdx
                        ? "border-primary bg-primary/10"
                        : appliedFixes.has(i)
                        ? "border-success/30 bg-success/5 opacity-60"
                        : "border-white/5 bg-white/3"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">
                        줄 {issue.line} · {issue.rule}
                      </span>
                      {!appliedFixes.has(i) && (
                        <button
                          onClick={() => applyOne(i)}
                          className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        >
                          적용
                        </button>
                      )}
                      {appliedFixes.has(i) && (
                        <span className="text-xs text-success">✓ 적용됨</span>
                      )}
                    </div>
                    <div className="font-mono text-xs space-y-1">
                      <div className="text-destructive/80 line-through">
                        {issue.original.trim()}
                      </div>
                      <div className="text-success">
                        {issue.corrected.trim()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {issues.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={applyAll}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                >
                  ⌘ 모두 적용 ({issues.length}개)
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
