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
// 19차 (2026-05-06) — KaTeX mhchem extension. \ce{} 화학식·반응식·이온·동위원소 지원.
// 4 maestro (특히 Chemistry / Biology / Physics) 모두 활용. side-effect import (KaTeX 글로벌에 매크로 등록).
import 'katex/contrib/mhchem';

const KATEX_REHYPE_OPTIONS = {
  throwOnError: false,
  errorColor: '#888888',
  strict: 'ignore' as const,
};

/**
 * `\(...\)`, `\[...\]` → `$...$`, `$$...$$` 정규화.
 *
 * 배경: remarkMath 는 `$..$`, `$$..$$` 만 인식한다. LLM (Claude/GPT/Gemini) 은
 * 자주 `\(x^2\)` / `\[\sum...\]` KaTeX 표준을 출력하고, Mathpix OCR 도 종종
 * `\(..\)` 로 인라인 수식을 감싼다. 이 형태가 그대로 들어오면 markdown 단계에서
 * 인식되지 못해 raw `\( x^2 \)` 텍스트가 채팅창에 노출된다.
 *
 * 우선순위 (display 가 inline 보다 먼저 매칭):
 *   1. `\[...\]` → `$$...$$`
 *   2. `\(...\)` → `$...$`
 *
 * 줄바꿈 보존: display 는 multiline 허용, inline 은 단일행만.
 */
/**
 * 19차 (2026-05-07) — multimodal 메시지 (이미지 + 텍스트 array) 가 들어올 때
 * `.replace is not a function` 에러 회피. content 가 array 면 text 부분만 합침.
 */
function coerceToString(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!content) return '';
  if (Array.isArray(content)) {
    // AI SDK multimodal: [{type:'text', text:...}, {type:'image', image:...}, ...]
    return content
      .map((p: unknown) => {
        if (typeof p === 'string') return p;
        if (p && typeof p === 'object' && 'type' in p) {
          const part = p as { type: string; text?: string };
          if (part.type === 'text' && typeof part.text === 'string') return part.text;
        }
        return '';
      })
      .join('\n');
  }
  return String(content);
}

export function normalizeMathDelimiters(content: string): string {
  const str = coerceToString(content);
  if (!str) return str;
  return str
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, inner) => `$$${inner}$$`)
    .replace(/\\\(([^\n]+?)\\\)/g, (_, inner) => `$${inner}$`);
}

/**
 * 2026-05-31 — 구분자 없는 raw LaTeX 명령 방어.
 *
 * 배경: 모델이 대화가 길어지면 표기 규칙을 이탈해 `$` 없이 `\frac{1}{2}`,
 * `\sqrt{x}`, `\le` 같은 명령을 평문에 그대로 출력 → 채팅창에 raw backslash 노출.
 * `\(..\)` 정규화로는 잡히지 않는다 (변환할 구분자가 애초에 없음).
 *
 * 전략: `$..$` / `$$..$$` **바깥(non-math)** 세그먼트에서만 backslash 명령 atom
 * (`\frac{}{}`, `\sqrt{}`, `\sum_{}^{}`, `\pi`, `\le` ...) 을 찾아 `$..$` 로 감싼다.
 * 한국어 산문에는 `\command` 가 등장하지 않으므로 false-positive 위험은 사실상 0.
 *
 * 한계: leaked 라텍스를 atom 단위로 감싸므로 다항식 spacing 이 약간 비최적일 수
 * 있으나, raw backslash 노출보다는 항상 우월하다. `normalizeMathDelimiters` 이후
 * (= 완성된 `\(..\)` 가 이미 `$..$` 로 바뀐 뒤) 호출해야 이중 래핑이 없다.
 */
const LATEX_ATOM =
  /\\[a-zA-Z]+\*?(?:\{[^{}]*\}|\[[^\[\]]*\])*(?:[_^](?:\{[^{}]*\}|[A-Za-z0-9]))*/g;
// `$$..$$` (display) 를 `$..$` (inline) 보다 먼저 매칭해야 통째로 보존된다.
const MATH_SEGMENT = /\$\$[\s\S]*?\$\$|\$[^$\n]*?\$/g;

export function wrapOrphanLatex(content: string): string {
  const str = coerceToString(content);
  if (!str || str.indexOf('\\') < 0) return str;

  // 기존 math 세그먼트는 건드리지 않고, 그 사이의 평문만 변환한다.
  let out = '';
  let last = 0;
  MATH_SEGMENT.lastIndex = 0;
  let m: RegExpExecArray | null;
  const wrapPlain = (plain: string) =>
    plain.replace(LATEX_ATOM, (atom) => `$${atom}$`);

  while ((m = MATH_SEGMENT.exec(str)) !== null) {
    out += wrapPlain(str.slice(last, m.index));
    out += m[0]; // math 세그먼트 원본 보존
    last = m.index + m[0].length;
  }
  out += wrapPlain(str.slice(last));
  return out;
}

/**
 * 스트리밍 도중 incomplete `$...$` (홀수 $) 감지 시 마지막 $ escape.
 * 다음 chunk 도착 시 자동 정상 LaTeX 복귀.
 */
export function safeStreamMarkdown(content: string): string {
  let str = coerceToString(content);
  if (!str) return str;

  // 2026-05-31 — 미완성 `\(` / `\[` 깜빡임 방어.
  // normalizeMathDelimiters 이후 남아있는 `\(` / `\[` 는 닫는 짝이 아직 도착하지
  // 않은 incomplete open 이다. 그 지점부터 끝까지 숨겨 raw 구분자 노출을 막는다.
  // 다음 chunk 에서 짝이 도착하면 normalize 가 `$..$` 로 바꿔 정상 복원된다.
  const openIdx = Math.max(str.lastIndexOf('\\('), str.lastIndexOf('\\['));
  if (openIdx >= 0) str = str.slice(0, openIdx);

  const stripped = str.replace(/\$\$/g, '').replace(/\\\$/g, '');
  const dollarCount = (stripped.match(/\$/g) ?? []).length;
  if (dollarCount % 2 === 0) return str;
  const lastIdx = str.lastIndexOf('$');
  if (lastIdx < 0) return str;
  return str.slice(0, lastIdx) + '\\$' + str.slice(lastIdx + 1);
}

export interface StreamingMarkdownProps {
  /** 19차: multimodal array 도 받음. coerceToString 으로 안전 처리. */
  content: string | unknown;
  /** 스트리밍 중 (true) 면 useDeferredValue + safe 처리. 종료 시 (false) 즉시 풀 렌더. */
  streaming?: boolean;
}

export function StreamingMarkdown({
  content,
  streaming = false,
}: StreamingMarkdownProps): ReactElement {
  // 스트리밍 중에는 한 프레임 지연시켜 React 가 idle 시간에 처리하게 함.
  // 종료 후에는 useDeferredValue 가 즉시 동기화 → 즉시 렌더.
  const safeStr = coerceToString(content);
  const deferred = useDeferredValue(safeStr);
  const safeContent = useMemo(() => {
    const base = streaming ? deferred : safeStr;
    const wrapped = wrapOrphanLatex(normalizeMathDelimiters(base));
    return streaming ? safeStreamMarkdown(wrapped) : wrapped;
  }, [deferred, safeStr, streaming]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[[rehypeKatex, KATEX_REHYPE_OPTIONS]]}
    >
      {safeContent}
    </ReactMarkdown>
  );
}
