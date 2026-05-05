/**
 * 2026-05-06 — StreamingMarkdown 의 LaTeX 정규화 회귀 테스트.
 *
 * 배경: 베타 사용자가 스크린샷을 올렸을 때 AI 응답의 `\(x^2\)` / `\[\sum\]` 가
 * 채팅창에 raw 텍스트로 노출되는 결함 보고. remarkMath 가 이 형식을 인식하지
 * 못하므로 사전 정규화 단계에서 `$..$` / `$$..$$` 로 변환한다.
 */
import { describe, it, expect } from 'vitest';
import {
  normalizeMathDelimiters,
  safeStreamMarkdown,
} from '../StreamingMarkdown';

describe('normalizeMathDelimiters', () => {
  it('빈 입력은 그대로 반환', () => {
    expect(normalizeMathDelimiters('')).toBe('');
  });

  it('수식 없는 텍스트는 변경 없음', () => {
    expect(normalizeMathDelimiters('안녕하세요')).toBe('안녕하세요');
  });

  it('inline `\\(..\\)` → `$..$`', () => {
    expect(normalizeMathDelimiters('값은 \\(x^2\\) 이다')).toBe('값은 $x^2$ 이다');
  });

  it('display `\\[..\\]` → `$$..$$`', () => {
    expect(normalizeMathDelimiters('식은 \\[\\sum_{i=1}^{n} i\\] 입니다')).toBe(
      '식은 $$\\sum_{i=1}^{n} i$$ 입니다',
    );
  });

  it('display 가 multiline 도 보존', () => {
    const input = '결과:\n\\[\nf(x) = x^2\n\\]\n';
    const out = normalizeMathDelimiters(input);
    expect(out).toContain('$$\nf(x) = x^2\n$$');
  });

  it('inline + display 혼합', () => {
    const input = '\\(a\\) 와 \\[b+c\\] 가 있다';
    expect(normalizeMathDelimiters(input)).toBe('$a$ 와 $$b+c$$ 가 있다');
  });

  it('이미 `$..$` 인 표기는 보존', () => {
    expect(normalizeMathDelimiters('값 $x^2$ 와 $$y^2$$')).toBe(
      '값 $x^2$ 와 $$y^2$$',
    );
  });

  it('연속된 두 inline `\\(..\\)`', () => {
    expect(normalizeMathDelimiters('\\(x\\) + \\(y\\) = \\(z\\)')).toBe(
      '$x$ + $y$ = $z$',
    );
  });

  it('display 우선 — `\\[..\\]` 가 안에 `\\(..\\)` 포함해도 깨지지 않음', () => {
    // `\[..\]` 가 먼저 매칭되어 통째로 치환됨
    const input = '\\[\\frac{a}{b}\\]';
    expect(normalizeMathDelimiters(input)).toBe('$$\\frac{a}{b}$$');
  });
});

describe('safeStreamMarkdown', () => {
  it('짝수 $ 는 그대로', () => {
    expect(safeStreamMarkdown('값 $x^2$ 와 $y$')).toBe('값 $x^2$ 와 $y$');
  });

  it('홀수 $ 는 마지막 escape', () => {
    expect(safeStreamMarkdown('값 $x^2$ 와 $y')).toBe('값 $x^2$ 와 \\$y');
  });

  it('빈 입력', () => {
    expect(safeStreamMarkdown('')).toBe('');
  });
});
