"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  analyzeDocument,
  applyAllFixes,
  countByCategory,
  CATEGORY_LABELS,
  type FormatIssue,
} from "@/lib/data/document-rules";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";

export default function FormatterPage() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [currentIssueIdx, setCurrentIssueIdx] = useState(0);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const issues = useMemo(() => analyzeDocument(text), [text]);
  const categoryCounts = useMemo(() => countByCategory(issues), [issues]);

  // 파일 읽기
  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setAppliedFixes(new Set());
    setCurrentIssueIdx(0);

    if (file.name.endsWith(".txt")) {
      const content = await file.text();
      setText(content);
    } else if (file.name.endsWith(".docx")) {
      // docx에서 텍스트 추출 (간이 방식 — zip 내 document.xml 파싱)
      try {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractDocxText(arrayBuffer);
        setText(text);
      } catch {
        setText("[.docx 파일 텍스트 추출에 실패했습니다. .txt 파일로 변환 후 다시 시도해주세요.]");
      }
    } else {
      // hwp, pdf 등은 텍스트 추출 제한
      setText(
        `[${file.name}]\n\n이 파일 형식은 직접 텍스트 추출이 어렵습니다.\n\n` +
          "아래 방법으로 텍스트를 붙여넣어 주세요:\n" +
          "1. 한글(HWP)에서 Ctrl+A → Ctrl+C로 전체 복사\n" +
          "2. 아래 편집 영역에 Ctrl+V로 붙여넣기\n" +
          "3. 교정 결과를 확인 후 다운로드"
      );
    }
  }, []);

  // 드래그 앤 드롭
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // 개별 적용
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

  // 전체 적용
  function applyAll() {
    setText(applyAllFixes(text));
    setAppliedFixes(new Set(issues.map((_, i) => i)));
  }

  // 다운로드
  function downloadFixed() {
    const fixed = applyAllFixes(text);
    const blob = new Blob([fixed], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const baseName = fileName
      ? fileName.replace(/\.[^.]+$/, "") + "_교정완료.txt"
      : "공문서_교정완료.txt";
    a.href = url;
    a.download = baseName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 업로드 전 빈 화면
  const isEmpty = !text.trim();

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          &larr; 대시보드
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            &#128196; 공문서 포맷터
          </h1>
          <p className="text-muted mb-8">
            공문서 파일을 업로드하면 K-에듀파인 양식 규격에 맞지 않는 부분을
            찾아 원클릭 교정합니다.
          </p>
        </motion.div>

        {/* 파일 업로드 영역 */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`glass-gradient p-12 text-center cursor-pointer transition-all ${
                dragOver
                  ? "!border-primary !bg-primary/10 scale-[1.01]"
                  : "hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-5xl mb-4">&#128195;</div>
              <p className="font-medium mb-2">
                공문서 파일을 드래그 앤 드롭하세요
              </p>
              <p className="text-sm text-muted mb-4">
                .txt, .docx 파일 지원 &middot; HWP는 텍스트 복사/붙여넣기
              </p>
              <button className="px-6 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors">
                파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,.hwp,.hwpx,.doc,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="hidden"
              />
            </div>

            {/* 또는 직접 입력 */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-muted">
                또는 텍스트 직접 입력
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setFileName("");
              }}
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors"
              placeholder="공문서 내용을 여기에 붙여넣으세요..."
            />
          </motion.div>
        )}

        {/* 분석 결과 */}
        {!isEmpty && (
          <AnimatePresence mode="wait">
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* 요약 바 */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {fileName && (
                  <span className="text-sm font-medium glass px-3 py-1 rounded-lg">
                    &#128196; {fileName}
                  </span>
                )}
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-lg ${
                    issues.length === 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {issues.length === 0
                    ? "&#9989; 문제 없음"
                    : `&#9888;&#65039; ${issues.length}개 교정 필요`}
                </span>
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted"
                  >
                    {CATEGORY_LABELS[cat] || cat} {count}
                  </span>
                ))}
                <div className="flex-1" />
                <button
                  onClick={() => {
                    setText("");
                    setFileName("");
                    setAppliedFixes(new Set());
                    setCurrentIssueIdx(0);
                  }}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  새 파일
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 에디터 */}
                <GlassCard hover={false} className="h-[600px] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">원본 문서</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      다른 파일 업로드
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.docx,.hwp,.hwpx,.doc,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                      className="hidden"
                    />
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setAppliedFixes(new Set());
                      setCurrentIssueIdx(0);
                    }}
                    className="flex-1 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors"
                  />
                </GlassCard>

                {/* 교정 결과 */}
                <GlassCard hover={false} className="h-[600px] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">교정 결과</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentIssueIdx(Math.max(0, currentIssueIdx - 1))
                        }
                        disabled={currentIssueIdx === 0}
                        className="px-2 py-1 rounded text-xs glass disabled:opacity-30"
                      >
                        &larr;
                      </button>
                      <button
                        onClick={() =>
                          setCurrentIssueIdx(
                            Math.min(issues.length - 1, currentIssueIdx + 1)
                          )
                        }
                        disabled={currentIssueIdx >= issues.length - 1}
                        className="px-2 py-1 rounded text-xs glass disabled:opacity-30"
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3">
                    {issues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <span className="text-4xl">&#9989;</span>
                        <p className="text-success text-sm font-medium">
                          모든 양식이 올바릅니다!
                        </p>
                      </div>
                    ) : (
                      issues.map((issue, i) => (
                        <motion.div
                          key={`${issue.line}-${i}`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          className={`p-3 rounded-lg border text-sm ${
                            i === currentIssueIdx
                              ? "border-primary bg-primary/10"
                              : appliedFixes.has(i)
                                ? "border-success/30 bg-success/5 opacity-60"
                                : "border-white/5 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted">
                              줄 {issue.line} &middot;{" "}
                              {CATEGORY_LABELS[issue.category] || issue.category}{" "}
                              &middot; {issue.rule}
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
                              <span className="text-xs text-success">
                                &#10003; 적용됨
                              </span>
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

                  {/* 하단 액션 */}
                  {issues.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                      <button
                        onClick={applyAll}
                        className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        &#9889; 모두 적용 ({issues.length}개)
                      </button>
                      <button
                        onClick={downloadFixed}
                        className="flex-1 py-2 rounded-lg glass text-sm font-medium hover:bg-white/10 transition-all"
                      >
                        &#128190; 교정본 다운로드
                      </button>
                    </div>
                  )}

                  {issues.length === 0 && text.trim() && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <button
                        onClick={downloadFixed}
                        className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        &#128190; 다운로드
                      </button>
                    </div>
                  )}
                </GlassCard>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── DOCX 텍스트 추출 (zip → document.xml → strip tags) ──
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  // docx는 ZIP 파일. JSZip 없이 최소한의 파싱 시도
  // ZIP 구조에서 word/document.xml 을 찾아 텍스트 추출
  const uint8 = new Uint8Array(buffer);
  const text = new TextDecoder("utf-8", { fatal: false }).decode(uint8);

  // XML에서 <w:t> 태그 내용 추출
  const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (!matches || matches.length === 0) {
    throw new Error("No text content found in docx");
  }

  return matches
    .map((m) => m.replace(/<[^>]+>/g, ""))
    .join("")
    .replace(/\r\n/g, "\n");
}
