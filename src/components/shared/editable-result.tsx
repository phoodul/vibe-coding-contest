"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface EditableResultProps {
  content: string;
  filename?: string; // 다운로드 시 파일명 (확장자 제외)
}

/**
 * AI 결과를 마크다운으로 보여주고, 편집 모드 전환 + 다운로드 가능
 */
export function EditableResult({ content, filename = "결과" }: EditableResultProps) {
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState(content);
  const [copied, setCopied] = useState(false);

  // content가 바뀌면 반영 (새 결과 생성 시)
  if (content !== text && !editMode) {
    setText(content);
  }

  function download() {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* 도구 버튼 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            editMode
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-white/5 text-muted hover:text-foreground border border-white/10"
          }`}
        >
          {editMode ? "미리보기" : "편집"}
        </button>
        <button
          onClick={copy}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-muted hover:text-foreground border border-white/10 transition-colors"
        >
          {copied ? "복사됨!" : "복사"}
        </button>
        <button
          onClick={download}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-muted hover:text-foreground border border-white/10 transition-colors"
        >
          다운로드
        </button>
      </div>

      {/* 콘텐츠 */}
      {editMode ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[300px] px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm font-mono leading-relaxed focus:outline-none focus:border-primary/50 transition-colors resize-y"
        />
      ) : (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
