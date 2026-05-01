/**
 * Phase G-06 Δ25 — 인라인 LaTeX 렌더 유틸 컴포넌트.
 *
 * 텍스트 안의 `$...$` 인라인 수식을 KaTeX 로 렌더. 나머지는 plain 텍스트.
 * 학생 입력 단축 표기 (f'(1), e^{2-f(x)}) 가 step.summary 등에 raw 로 노출되는
 * 문제 fix — 학생이 풀이 결과에서 자연스러운 수식으로 보도록.
 *
 * 비용: 클라이언트 cpu 만 사용 (서버 영향 X). 짧은 문자열이므로 미미.
 *
 * 사용 위치:
 *   - StepDecompositionView (step.summary, why_text)
 *   - SolutionSummarySection (5 필드)
 *   - PerProblemReportCard student_struggle (4 sub-card)
 */
'use client';

import katex from 'katex';
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';

interface Props {
  children?: string | null;
  /** display block (전 너비). 기본 false (inline) */
  display?: boolean;
  /** 추가 className (wrapper span) */
  className?: string;
}

/**
 * `$...$` 또는 `\(...\)` 패턴을 KaTeX 로 렌더, 나머지는 plain text.
 * 매칭 실패 또는 KaTeX throw 시 원본 텍스트로 fallback.
 */
export function MathText({ children, display = false, className }: Props) {
  const text = (children ?? '').toString();

  const segments = useMemo(() => {
    if (!text) return [] as Array<{ kind: 'text' | 'math'; content: string }>;
    // `$...$` 또는 `\(...\)` (단일 escaped backslash) 매칭
    // greedy 하지 않게 — `$x^2$ + $y^2$` 두 개 분리
    const re = /\$([^$\n]+?)\$|\\\(([^)]+?)\\\)/g;
    const out: Array<{ kind: 'text' | 'math'; content: string }> = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) {
        out.push({ kind: 'text', content: text.slice(last, m.index) });
      }
      out.push({ kind: 'math', content: m[1] ?? m[2] ?? '' });
      last = m.index + m[0].length;
    }
    if (last < text.length) {
      out.push({ kind: 'text', content: text.slice(last) });
    }
    return out;
  }, [text]);

  if (!text) return null;
  if (segments.length === 0) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === 'text') {
          // eslint-disable-next-line react/no-array-index-key
          return <span key={i}>{seg.content}</span>;
        }
        let html = '';
        try {
          html = katex.renderToString(seg.content, {
            throwOnError: false,
            errorColor: '#888',
            strict: 'ignore',
            displayMode: display,
          });
        } catch {
          html = seg.content; // 렌더 실패 시 원본 텍스트
        }
        return (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </span>
  );
}
