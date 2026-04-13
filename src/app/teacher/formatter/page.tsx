"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

import {
  analyzeDocument,
  applyAllFixes,
  countByCategory,
  CATEGORY_LABELS,
  type FormatIssue,
} from "@/lib/data/document-rules";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";

// ── 이슈 고유 키 생성 (인덱스 대신 줄번호+규칙 조합) ──
function issueKey(issue: FormatIssue): string {
  return `${issue.line}:${issue.rule}`;
}

// ── 마크다운 테이블을 HTML로 변환 ──
function markdownTableToHtml(lines: string[]): string {
  const rows = lines
    .filter((l) => !l.match(/^\s*\|[-:\s|]+\|\s*$/)) // 구분선 제거
    .map((l) =>
      l
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((c) => c.trim())
    );
  if (rows.length === 0) return "";
  const [header, ...body] = rows;
  return `<table class="doc-table"><thead><tr>${header.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

// ── 텍스트를 리치 HTML로 변환 (표 + 구조 하이라이트) ──
function textToRichHtml(
  text: string,
  issueLines: Set<number>
): string {
  const lines = text.split("\n");
  const htmlParts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    // 마크다운 테이블 감지 (| 로 시작하는 연속 줄)
    if (lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      htmlParts.push(markdownTableToHtml(tableLines));
      continue;
    }

    const lineNum = i + 1;
    const line = lines[i];
    const hasIssue = issueLines.has(lineNum);
    const escaped = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 구조 요소 시각 구분
    let className = "doc-line";
    if (/^수신[:\s]/.test(line)) className += " doc-recipient";
    else if (/^참조[:\s]/.test(line)) className += " doc-cc";
    else if (/^제목[:\s]/.test(line)) className += " doc-title";
    else if (/^관련[:\s]/.test(line)) className += " doc-ref";
    else if (/^붙임/.test(line)) className += " doc-attach";
    else if (/^\s*끝\.?\s*$/.test(line)) className += " doc-end";
    if (hasIssue) className += " doc-issue";

    htmlParts.push(
      `<div class="${className}"><span class="doc-linenum">${lineNum}</span>${escaped || "&nbsp;"}</div>`
    );
    i++;
  }

  return htmlParts.join("");
}

export default function FormatterPage() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [currentIssueIdx, setCurrentIssueIdx] = useState(0);
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초안 작성기에서 전달된 텍스트 수신
  useEffect(() => {
    const stored = localStorage.getItem("formatter_text");
    if (stored) {
      setText(stored);
      setFileName("초안 작성기에서 전달됨");
      localStorage.removeItem("formatter_text");
    }
  }, []);

  const issues = useMemo(() => analyzeDocument(text), [text]);
  const categoryCounts = useMemo(() => countByCategory(issues), [issues]);
  const issueLineSet = useMemo(
    () => new Set(issues.map((i) => i.line)),
    [issues]
  );

  // ── 파일 처리 ──
  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setAppliedKeys(new Set());
    setCurrentIssueIdx(0);
    setEditMode(false);

    const ext = file.name.toLowerCase();

    // HWP / HWPX → 서버 파싱 (kordoc)
    if (ext.endsWith(".hwp") || ext.endsWith(".hwpx")) {
      setParsing(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/teacher/parse-document", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          setText(`[오류] ${data.error || "파일 파싱 실패"}`);
        } else {
          setText(data.markdown || "");
        }
      } catch {
        // 서버 파싱 실패 시 클라이언트 폴백 (HWPX만)
        if (ext.endsWith(".hwpx")) {
          try {
            const buf = await file.arrayBuffer();
            setText(await extractHwpxText(buf));
          } catch {
            setText(
              "[.hwpx 파일 텍스트 추출에 실패했습니다. 한글에서 Ctrl+A → Ctrl+C로 복사 후 붙여넣기를 시도해주세요.]"
            );
          }
        } else {
          setText(
            "[.hwp 파일은 서버 파싱이 필요합니다. 네트워크 연결을 확인해주세요.]"
          );
        }
      } finally {
        setParsing(false);
      }
      return;
    }

    // TXT
    if (ext.endsWith(".txt")) {
      setText(await file.text());
      return;
    }

    // DOCX
    if (ext.endsWith(".docx")) {
      try {
        const buf = await file.arrayBuffer();
        setText(await extractDocxText(buf));
      } catch {
        setText(
          "[.docx 파일 텍스트 추출에 실패했습니다. .txt 파일로 변환 후 다시 시도해주세요.]"
        );
      }
      return;
    }

    setText(
      `[${file.name}]\n\n이 파일 형식은 직접 텍스트 추출이 어렵습니다.\n` +
        "한글(HWP)에서 Ctrl+A → Ctrl+C로 전체 복사 후 붙여넣기해 주세요."
    );
  }, []);

  // ── 드래그 앤 드롭 ──
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ── 개별 적용 (키 기반) ──
  function applyOne(issueIdx: number) {
    const issue = issues[issueIdx];
    if (!issue) return;
    const lines = text.split("\n");
    lines[issue.line - 1] = issue.corrected;
    setText(lines.join("\n"));
    setAppliedKeys((prev) => new Set([...prev, issueKey(issue)]));
    if (currentIssueIdx < issues.length - 1) {
      setCurrentIssueIdx(currentIssueIdx + 1);
    }
  }

  // ── 전체 적용 ──
  function applyAll() {
    setText(applyAllFixes(text));
    setAppliedKeys(new Set(issues.map((i) => issueKey(i))));
  }

  // ── 다운로드 ──
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

  const isEmpty = !text.trim();

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      {/* 문서 미리보기 스타일 */}
      <style jsx global>{`
        .doc-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
          font-size: 0.8rem;
        }
        .doc-table th,
        .doc-table td {
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.4rem 0.6rem;
          text-align: left;
        }
        .doc-table th {
          background: rgba(255, 255, 255, 0.06);
          text-align: center;
          font-weight: 600;
        }
        .doc-table td:not(:first-child) {
          font-variant-numeric: tabular-nums;
        }
        .doc-line {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          padding: 1px 0.5rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.82rem;
          line-height: 1.7;
          border-left: 2px solid transparent;
          transition: background 0.15s, border-color 0.15s;
        }
        .doc-linenum {
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.7rem;
          min-width: 1.5rem;
          text-align: right;
          user-select: none;
          flex-shrink: 0;
        }
        .doc-issue {
          background: rgba(234, 179, 8, 0.08);
          border-left-color: rgba(234, 179, 8, 0.5);
        }
        .doc-recipient,
        .doc-cc {
          color: rgb(147, 197, 253);
        }
        .doc-title {
          color: rgb(253, 224, 71);
          font-weight: 600;
        }
        .doc-ref {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.78rem;
        }
        .doc-attach {
          color: rgb(134, 239, 172);
        }
        .doc-end {
          color: rgb(134, 239, 172);
          font-weight: 600;
        }
      `}</style>

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
          <h1 className="text-3xl font-bold mb-2">📄 공문서 포맷터</h1>
          <p className="text-muted mb-8">
            HWP/HWPX 파일을 업로드하면 K-에듀파인 양식 규격에 맞지 않는 부분을
            찾아 원클릭 교정합니다.
          </p>
        </motion.div>

        {/* ── 파일 업로드 영역 ── */}
        {isEmpty && !parsing && (
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
              <div className="text-5xl mb-4">📃</div>
              <p className="font-medium mb-2">
                공문서 파일을 드래그 앤 드롭하세요
              </p>
              <p className="text-sm text-muted mb-4">
                .hwp, .hwpx, .txt, .docx 파일 지원
              </p>
              <button className="px-6 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors">
                파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,.hwp,.hwpx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="hidden"
              />
            </div>

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

        {/* ── 파싱 로딩 ── */}
        {parsing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-gradient p-12 text-center"
          >
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted">
              {fileName} 파일을 분석하고 있습니다...
            </p>
          </motion.div>
        )}

        {/* ── 분석 결과 ── */}
        {!isEmpty && !parsing && (
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
                    📄 {fileName}
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
                    ? "✅ 문제 없음"
                    : `⚠️ ${issues.length}개 교정 필요`}
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
                    setAppliedKeys(new Set());
                    setCurrentIssueIdx(0);
                    setEditMode(false);
                  }}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  새 파일
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ── 좌측: 문서 미리보기 / 편집 ── */}
                <GlassCard hover={false} className="h-[600px] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      {editMode ? "편집 모드" : "문서 미리보기"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                          editMode
                            ? "bg-primary/20 text-primary"
                            : "glass hover:bg-white/10"
                        }`}
                      >
                        {editMode ? "미리보기" : "직접 편집"}
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        다른 파일
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.docx,.hwp,.hwpx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {editMode ? (
                    <textarea
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        setAppliedKeys(new Set());
                        setCurrentIssueIdx(0);
                      }}
                      className="flex-1 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors"
                    />
                  ) : (
                    <div
                      className="flex-1 overflow-y-auto rounded-lg bg-white/[0.02] border border-white/10 py-2"
                      dangerouslySetInnerHTML={{
                        __html: textToRichHtml(text, issueLineSet),
                      }}
                    />
                  )}
                </GlassCard>

                {/* ── 우측: 교정 결과 ── */}
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
                        <span className="text-4xl">✅</span>
                        <p className="text-success text-sm font-medium">
                          모든 양식이 올바릅니다!
                        </p>
                      </div>
                    ) : (
                      issues.map((issue, i) => {
                        const key = issueKey(issue);
                        const isApplied = appliedKeys.has(key);
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                            className={`p-3 rounded-lg border text-sm ${
                              i === currentIssueIdx
                                ? "border-primary bg-primary/10"
                                : isApplied
                                  ? "border-success/30 bg-success/5 opacity-60"
                                  : "border-white/5 bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted">
                                줄 {issue.line} &middot;{" "}
                                {CATEGORY_LABELS[issue.category] ||
                                  issue.category}{" "}
                                &middot; {issue.rule}
                              </span>
                              {!isApplied && (
                                <button
                                  onClick={() => applyOne(i)}
                                  className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                                >
                                  적용
                                </button>
                              )}
                              {isApplied && (
                                <span className="text-xs text-success">
                                  ✓ 적용됨
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
                        );
                      })
                    )}
                  </div>

                  {/* 하단 액션 */}
                  {issues.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                      <button
                        onClick={applyAll}
                        className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        ⚡ 모두 적용 ({issues.length}개)
                      </button>
                      <button
                        onClick={downloadFixed}
                        className="flex-1 py-2 rounded-lg glass text-sm font-medium hover:bg-white/10 transition-all"
                      >
                        💾 교정본 다운로드
                      </button>
                    </div>
                  )}

                  {issues.length === 0 && text.trim() && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <button
                        onClick={downloadFixed}
                        className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        💾 다운로드
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

// ── HWPX 텍스트 추출 (클라이언트 폴백) ──
async function extractHwpxText(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const lines: string[] = [];
  const sectionFiles = Object.keys(zip.files)
    .filter((name) => /^Contents\/section\d+\.xml$/i.test(name))
    .sort();
  if (sectionFiles.length === 0) throw new Error("No section files");
  for (const path of sectionFiles) {
    const xml = await zip.files[path].async("string");
    parseHwpxBody(xml, lines);
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractHpText(fragment: string): string {
  const matches = fragment.match(/<hp:t[^>]*>([^<]*)<\/hp:t>/g);
  if (!matches) return "";
  return matches.map((m) => m.replace(/<[^>]+>/g, "")).join("");
}

function parseHwpxBody(xml: string, lines: string[]) {
  const tables: string[] = [];
  const TABLE_MARKER = "\x00TABLE_";
  const xmlWithMarkers = xml.replace(
    /<hp:tbl\b[^>]*>[\s\S]*?<\/hp:tbl>/g,
    (match) => {
      const idx = tables.length;
      tables.push(match);
      return `${TABLE_MARKER}${idx}\x00`;
    }
  );
  const paragraphs = xmlWithMarkers.split(/<\/hp:p>/);
  for (const para of paragraphs) {
    const markerMatch = para.match(
      new RegExp(
        `${TABLE_MARKER.replace("\x00", "\\x00")}(\\d+)\\x00`
      )
    );
    if (markerMatch) {
      const before = para.slice(0, para.indexOf("\x00TABLE_"));
      const beforeText = extractHpText(before);
      if (beforeText.trim()) lines.push(beforeText);
      const tableXml = tables[Number(markerMatch[1])];
      parseHwpxTable(tableXml, lines);
      continue;
    }
    const text = extractHpText(para);
    if (text) {
      lines.push(text);
    } else if (/<hp:p[\s>]/.test(para)) {
      lines.push("");
    }
  }
}

function parseHwpxTable(tableXml: string, lines: string[]) {
  const rows = tableXml.match(/<hp:tr\b[^>]*>[\s\S]*?<\/hp:tr>/g);
  if (!rows) return;
  lines.push("");
  // 마크다운 테이블 형식으로 출력
  const allCells: string[][] = [];
  for (const row of rows) {
    const cells = row.match(/<hp:tc\b[^>]*>[\s\S]*?<\/hp:tc>/g);
    if (!cells) continue;
    allCells.push(
      cells.map((cell) => {
        const cellParas = cell.split(/<\/hp:p>/);
        return cellParas
          .map((p) => extractHpText(p))
          .filter((t) => t)
          .join(" ");
      })
    );
  }
  if (allCells.length > 0) {
    // 마크다운 테이블로 변환
    const colCount = Math.max(...allCells.map((r) => r.length));
    for (let ri = 0; ri < allCells.length; ri++) {
      const padded = Array.from({ length: colCount }, (_, ci) => allCells[ri][ci] || "");
      lines.push("| " + padded.join(" | ") + " |");
      if (ri === 0) {
        lines.push("| " + padded.map(() => "---").join(" | ") + " |");
      }
    }
  }
  lines.push("");
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const docFile = zip.files["word/document.xml"];
  if (!docFile) throw new Error("No document.xml");
  const xml = await docFile.async("string");
  const lines: string[] = [];
  const paragraphs = xml.split(/<\/w:p>/);
  for (const para of paragraphs) {
    const textMatches = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches && textMatches.length > 0) {
      lines.push(textMatches.map((m) => m.replace(/<[^>]+>/g, "")).join(""));
    } else if (/<w:p[\s>]/.test(para)) {
      lines.push("");
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
