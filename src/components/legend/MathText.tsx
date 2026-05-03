/**
 * Phase G-06 Δ25 — 인라인 LaTeX 렌더 유틸 컴포넌트.
 *
 * 텍스트 안의 `$...$`, `\(...\)`, `$$...$$`, `\[...\]` 수식을 KaTeX 로 렌더.
 * 나머지는 plain 텍스트. 학생 입력 단축 표기 (f'(1), e^{2-f(x)}) 가 step.summary
 * 등에 raw 로 노출되는 문제 fix.
 *
 * P0-03 (2026-05-04) 보강:
 *   - display math 패턴 추가 (`$$...$$`, `\[...\]`)
 *   - parseMathSegments 헬퍼 export — node 환경 vitest 회귀 테스트 가능
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

export interface MathSegment {
  kind: 'text' | 'math';
  content: string;
  /** math 일 때만 true. `$$...$$` 또는 `\[...\]` 매칭 결과. */
  displayMode?: boolean;
}

/**
 * 텍스트를 text/math segment 배열로 파싱.
 * 우선순위 (display math 가 inline 보다 먼저 매칭되어야 `$$x$$` 가 `$x$` 두 개로 잘못 잡히지 않음):
 *   1. `$$...$$` (display)
 *   2. `\[...\]` (display)
 *   3. `\(...\)` (inline)
 *   4. `$...$` (inline)
 *
 * 매칭 실패 시 전체를 단일 text segment 로 반환 (fallback 안전).
 */
export function parseMathSegments(text: string): MathSegment[] {
  if (!text) return [];

  // 우선순위 통합 정규식 — alternation 으로 한 번에. 각 그룹별로 분기 처리.
  // 주의: `$$` 가 `$` 보다 먼저 매칭되도록 alternation 순서 유지.
  // greedy 하지 않게 — `$$x^2$$ + $$y^2$$` 두 개 분리.
  // \(..\) 와 $..$ 은 inline 이라 줄바꿈 제외만, lazy 매칭으로 가장 짧은 페어 우선.
  const re = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([^\n]+?)\\\)|\$([^$\n]+?)\$/g;

  const out: MathSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ kind: 'text', content: text.slice(last, m.index) });
    }
    // m[1] = $$..$$ , m[2] = \[..\] , m[3] = \(..\) , m[4] = $..$
    const isDisplay = m[1] !== undefined || m[2] !== undefined;
    const content = m[1] ?? m[2] ?? m[3] ?? m[4] ?? '';
    out.push({ kind: 'math', content, displayMode: isDisplay });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push({ kind: 'text', content: text.slice(last) });
  }
  return out;
}

/**
 * `$...$`, `\(...\)`, `$$...$$`, `\[...\]` 패턴을 KaTeX 로 렌더, 나머지는 plain text.
 * 매칭 실패 또는 KaTeX throw 시 원본 텍스트로 fallback.
 */
export function MathText({ children, display = false, className }: Props) {
  const text = (children ?? '').toString();

  const segments = useMemo(() => parseMathSegments(text), [text]);

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
            // segment 별 displayMode 우선, prop 의 display 는 fallback
            displayMode: seg.displayMode ?? display,
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
