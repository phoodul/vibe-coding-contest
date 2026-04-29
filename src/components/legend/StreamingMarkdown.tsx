/**
 * Phase G-06 G06-33d — 스트리밍 마크다운 렌더 (typewriter throttle).
 *
 * 베이스: docs/project-decisions.md Δ10.
 *
 * 목적:
 *   - useChat 의 chunk 가 매우 빠르게 도착할 때 React 가 매 chunk 마다
 *     ReactMarkdown + KaTeX 재렌더 → 깜빡임 + INP 저하.
 *   - useDeferredValue 로 한 프레임 지연시켜 React 가 idle 시간에 처리.
 *   - safeStreamMarkdown 으로 incomplete `$...$` 짝수화 (KaTeX 빨간 박스 회피).
 *
 * 부수 효과:
 *   - 사용자 입력에는 RAF idle 시간 우선 (input INP ↓)
 *   - 마지막 줄에 단어 단위 fade-in 시각적 부드러움 (Framer Motion 미사용 — 비용 ↓)
 */
'use client';

import { useDeferredValue, useMemo, type ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const KATEX_REHYPE_OPTIONS = {
  throwOnError: false,
  errorColor: '#888888',
  strict: 'ignore' as const,
};

/**
 * 스트리밍 도중 incomplete `$...$` (홀수 $) 감지 시 마지막 $ escape.
 * 다음 chunk 도착 시 자동 정상 LaTeX 복귀.
 */
export function safeStreamMarkdown(content: string): string {
  if (!content) return content;
  const stripped = content.replace(/\$\$/g, '').replace(/\\\$/g, '');
  const dollarCount = (stripped.match(/\$/g) ?? []).length;
  if (dollarCount % 2 === 0) return content;
  const lastIdx = content.lastIndexOf('$');
  if (lastIdx < 0) return content;
  return content.slice(0, lastIdx) + '\\$' + content.slice(lastIdx + 1);
}

export interface StreamingMarkdownProps {
  content: string;
  /** 스트리밍 중 (true) 면 useDeferredValue + safe 처리. 종료 시 (false) 즉시 풀 렌더. */
  streaming?: boolean;
}

export function StreamingMarkdown({
  content,
  streaming = false,
}: StreamingMarkdownProps): ReactElement {
  // 스트리밍 중에는 한 프레임 지연시켜 React 가 idle 시간에 처리하게 함.
  // 종료 후에는 useDeferredValue 가 즉시 동기화 → 즉시 렌더.
  const deferred = useDeferredValue(content);
  const safeContent = useMemo(
    () => (streaming ? safeStreamMarkdown(deferred) : content),
    [deferred, content, streaming],
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[[rehypeKatex, KATEX_REHYPE_OPTIONS]]}
    >
      {safeContent}
    </ReactMarkdown>
  );
}
