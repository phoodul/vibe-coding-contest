"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mb-2 mt-3 text-[var(--accent-cyan)]">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mb-1 mt-2">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-3 text-[var(--foreground)]/90">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-[var(--accent-violet)]">{children}</strong>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 text-sm">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 text-sm">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-[var(--foreground)]/80">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[var(--accent-violet)] pl-4 my-3 italic text-sm text-[var(--muted-foreground)]">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
