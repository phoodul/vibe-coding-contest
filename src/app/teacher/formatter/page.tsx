"use client";

import { useState, useMemo, useCallback, useRef } from "react";
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

    const ext = file.name.toLowerCase();

    if (ext.endsWith(".txt")) {
      const content = await file.text();
      setText(content);
    } else if (ext.endsWith(".hwpx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const content = await extractHwpxText(arrayBuffer);
        setText(content);
      } catch {
        setText("[.hwpx 파일 텍스트 추출에 실패했습니다. 한글에서 Ctrl+A → Ctrl+C로 복사 후 붙여넣기를 시도해주세요.]");
      }
    } else if (ext.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const content = await extractDocxText(arrayBuffer);
        setText(content);
      } catch {
        setText("[.docx 파일 텍스트 추출에 실패했습니다. .txt 파일로 변환 후 다시 시도해주세요.]");
      }
    } else {
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
                .hwpx, .txt, .docx 파일 지원 &middot; HWP는 텍스트 복사/붙여넣기
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

// ── HWPX 텍스트 추출 (ZIP → Contents/section*.xml) ──
// 표(table): <hp:tbl> → <hp:tr> → <hp:tc> → 탭 구분 텍스트로 변환
// 본문: <hp:p> → <hp:run> → <hp:t> 태그 추출
async function extractHwpxText(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const lines: string[] = [];

  const sectionFiles = Object.keys(zip.files)
    .filter((name) => /^Contents\/section\d+\.xml$/i.test(name))
    .sort();

  if (sectionFiles.length === 0) {
    throw new Error("No section files found in HWPX");
  }

  for (const path of sectionFiles) {
    const xml = await zip.files[path].async("string");
    parseHwpxBody(xml, lines);
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** hp:t 태그에서 텍스트 추출 (단일 단락/셀 내부) */
function extractHpText(fragment: string): string {
  const matches = fragment.match(/<hp:t[^>]*>([^<]*)<\/hp:t>/g);
  if (!matches) return "";
  return matches.map((m) => m.replace(/<[^>]+>/g, "")).join("");
}

/** HWPX XML 본문을 파싱하여 lines 배열에 추가 */
function parseHwpxBody(xml: string, lines: string[]) {
  // 표와 본문 단락을 순서대로 처리하기 위해 top-level 요소를 순회
  // 전략: 표(<hp:tbl>)를 먼저 마커로 치환 → 본문 단락 처리 → 마커 위치에서 표 삽입

  // 1. 모든 표를 추출하여 저장
  const tables: string[] = [];
  const TABLE_MARKER = "\x00TABLE_";
  const xmlWithMarkers = xml.replace(/<hp:tbl\b[^>]*>[\s\S]*?<\/hp:tbl>/g, (match) => {
    const idx = tables.length;
    tables.push(match);
    return `${TABLE_MARKER}${idx}\x00`;
  });

  // 2. 표가 제거된 XML에서 단락 처리
  const paragraphs = xmlWithMarkers.split(/<\/hp:p>/);
  for (const para of paragraphs) {
    // 표 마커 확인
    const markerMatch = para.match(new RegExp(`${TABLE_MARKER.replace("\x00", "\\x00")}(\\d+)\\x00`));
    if (markerMatch) {
      // 표 마커 앞의 텍스트 처리
      const before = para.slice(0, para.indexOf("\x00TABLE_"));
      const beforeText = extractHpText(before);
      if (beforeText.trim()) lines.push(beforeText);

      // 표 렌더링
      const tableXml = tables[Number(markerMatch[1])];
      parseHwpxTable(tableXml, lines);
      continue;
    }

    // 일반 단락
    const text = extractHpText(para);
    if (text) {
      lines.push(text);
    } else if (/<hp:p[\s>]/.test(para)) {
      lines.push("");
    }
  }
}

/** HWPX 표를 탭 구분 텍스트로 변환 */
function parseHwpxTable(tableXml: string, lines: string[]) {
  // 행 추출
  const rows = tableXml.match(/<hp:tr\b[^>]*>[\s\S]*?<\/hp:tr>/g);
  if (!rows) return;

  lines.push(""); // 표 앞 빈 줄

  for (const row of rows) {
    // 셀 추출
    const cells = row.match(/<hp:tc\b[^>]*>[\s\S]*?<\/hp:tc>/g);
    if (!cells) continue;

    const cellTexts = cells.map((cell) => {
      // 셀 내부 단락들의 텍스트를 합침
      const cellParas = cell.split(/<\/hp:p>/);
      return cellParas
        .map((p) => extractHpText(p))
        .filter((t) => t)
        .join(" ");
    });

    lines.push(cellTexts.join("\t"));
  }

  lines.push(""); // 표 뒤 빈 줄
}

// ── DOCX 텍스트 추출 (ZIP → word/document.xml → <w:t> 태그) ──
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const docFile = zip.files["word/document.xml"];
  if (!docFile) {
    throw new Error("No document.xml found in docx");
  }

  const xml = await docFile.async("string");
  const lines: string[] = [];
  const paragraphs = xml.split(/<\/w:p>/);

  for (const para of paragraphs) {
    const textMatches = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches && textMatches.length > 0) {
      const lineText = textMatches
        .map((m) => m.replace(/<[^>]+>/g, ""))
        .join("");
      lines.push(lineText);
    } else if (/<w:p[\s>]/.test(para)) {
      lines.push("");
    }
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
