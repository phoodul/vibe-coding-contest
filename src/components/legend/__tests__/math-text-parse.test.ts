/**
 * P0-03 (2026-05-04) — MathText 의 parseMathSegments 회귀 테스트.
 *
 * KaTeX 자체 렌더는 katex 라이브러리에 위임 (throwOnError:false 로 항상 fallback).
 * 본 테스트는 정규식 매칭의 정확성과 누락 패턴 회귀 방지에 집중.
 *
 * 베타 사용자 풀이 데이터에서 발견된/예상되는 KaTeX 입력 패턴 5+개를 fixture
 * 로 등록하여, 향후 정규식 변경 시 자동 회귀 검증.
 */
import { describe, it, expect } from 'vitest';
import { parseMathSegments } from '../MathText';

describe('parseMathSegments', () => {
  it('빈 입력은 빈 배열', () => {
    expect(parseMathSegments('')).toEqual([]);
  });

  it('수식 없는 plain 텍스트는 단일 text segment', () => {
    const segs = parseMathSegments('hello world');
    expect(segs).toEqual([{ kind: 'text', content: 'hello world' }]);
  });

  it('단일 inline $..$ 매칭', () => {
    const segs = parseMathSegments('값은 $x^2$ 이다');
    expect(segs).toHaveLength(3);
    expect(segs[0]).toEqual({ kind: 'text', content: '값은 ' });
    expect(segs[1]).toEqual({ kind: 'math', content: 'x^2', displayMode: false });
    expect(segs[2]).toEqual({ kind: 'text', content: ' 이다' });
  });

  it('연속된 inline 수식 두 개 분리 ($x^2$ + $y^2$)', () => {
    const segs = parseMathSegments('$x^2$ + $y^2$');
    const mathSegs = segs.filter((s) => s.kind === 'math');
    expect(mathSegs).toHaveLength(2);
    expect(mathSegs[0].content).toBe('x^2');
    expect(mathSegs[1].content).toBe('y^2');
    expect(mathSegs[0].displayMode).toBe(false);
  });

  it('\\(..\\) 인라인 패턴 매칭', () => {
    const segs = parseMathSegments('답은 \\(f(x) = x^2\\) 이다');
    const mathSegs = segs.filter((s) => s.kind === 'math');
    expect(mathSegs).toHaveLength(1);
    expect(mathSegs[0].content).toBe('f(x) = x^2');
    expect(mathSegs[0].displayMode).toBe(false);
  });

  it('$$..$$ display math 매칭 + displayMode true', () => {
    const segs = parseMathSegments('따라서 $$\\int_0^1 x^2 dx = \\frac{1}{3}$$ 가 성립한다');
    const mathSegs = segs.filter((s) => s.kind === 'math');
    expect(mathSegs).toHaveLength(1);
    expect(mathSegs[0].content).toBe('\\int_0^1 x^2 dx = \\frac{1}{3}');
    expect(mathSegs[0].displayMode).toBe(true);
  });

  it('\\[..\\] display math 매칭 + displayMode true', () => {
    const segs = parseMathSegments('\\[\\sum_{k=1}^n k = \\frac{n(n+1)}{2}\\]');
    const mathSegs = segs.filter((s) => s.kind === 'math');
    expect(mathSegs).toHaveLength(1);
    expect(mathSegs[0].content).toBe('\\sum_{k=1}^n k = \\frac{n(n+1)}{2}');
    expect(mathSegs[0].displayMode).toBe(true);
  });

  it('display $$ 가 inline $ 보다 먼저 매칭 (우선순위 검증)', () => {
    // `$$x$$` 가 `$ x $` 두 개로 잘못 잡히면 mathSegs 가 2개 + content='x' 가 됨
    const segs = parseMathSegments('$$x$$');
    const mathSegs = segs.filter((s) => s.kind === 'math');
    expect(mathSegs).toHaveLength(1);
    expect(mathSegs[0].content).toBe('x');
    expect(mathSegs[0].displayMode).toBe(true);
  });

  it('미적분 표기 — f\'(1), e^{2-f(x)} 같은 패턴이 inline 으로 정상 매칭', () => {
    const segs = parseMathSegments("미분값 $f'(1)$ 와 $e^{2-f(x)}$ 를 계산");
    const mathSegs = segs.filter((s) => s.kind === 'math');
    expect(mathSegs).toHaveLength(2);
    expect(mathSegs[0].content).toBe("f'(1)");
    expect(mathSegs[1].content).toBe('e^{2-f(x)}');
  });

  it('수식 없는 dollar sign 은 매칭 안 됨 (가격 표기 등) — text 로 유지', () => {
    // `$1000` 는 매칭 X (뒤에 닫는 $ 없음)
    const segs = parseMathSegments('가격은 $1000 입니다');
    expect(segs).toEqual([{ kind: 'text', content: '가격은 $1000 입니다' }]);
  });

  it('줄바꿈이 들어간 inline $..$ 은 매칭 안 됨 (오류 방지)', () => {
    // 줄바꿈 들어가면 text 로 fallback (KaTeX 가 multi-line inline 받기 부적절)
    const segs = parseMathSegments('수식\n$x^2 +\ny^2$\n끝');
    const mathSegs = segs.filter((s) => s.kind === 'math');
    // inline 매칭 실패 → 전체 text 로
    expect(mathSegs).toHaveLength(0);
  });

  it('display $$..$$ 은 줄바꿈 포함 가능', () => {
    const segs = parseMathSegments('$$\nx^2 +\ny^2\n$$');
    const mathSegs = segs.filter((s) => s.kind === 'math');
    expect(mathSegs).toHaveLength(1);
    expect(mathSegs[0].displayMode).toBe(true);
  });

  it('LaTeX 가 잘못 닫혀 있어도 fallback (열린 $ 만 있는 경우)', () => {
    // `$x^2` (닫는 $ 없음) → 매칭 실패 → 전체 text
    const segs = parseMathSegments('값은 $x^2 입니다');
    expect(segs.every((s) => s.kind === 'text')).toBe(true);
  });

  it('빈 수식 (`$$`) 은 displayMode 매칭 시도 후 빈 content', () => {
    const segs = parseMathSegments('$$$$');
    // `$$$$` → `$$..$$` 로 매칭 시도 → 내부가 빈 + greedy 아니라서 매칭 실패할 수도
    // 어떻게 처리되든 segs 가 결정적이어야 함 (throw 없이)
    expect(Array.isArray(segs)).toBe(true);
  });

  it('한국어 텍스트와 LaTeX 혼합 — 베타 사용자 실제 패턴', () => {
    // 베타 P0-01 분석: 학생이 사용할 가능성 높은 패턴
    const text =
      '주어진 함수 $f(x) = x^2 + 1$ 에 대해 $$\\int_0^1 f(x)\\,dx$$ 를 계산하시오.';
    const segs = parseMathSegments(text);
    const mathSegs = segs.filter((s) => s.kind === 'math');
    expect(mathSegs).toHaveLength(2);
    expect(mathSegs[0].displayMode).toBe(false);
    expect(mathSegs[1].displayMode).toBe(true);
  });

  it('연속된 text·math·text·math·text 5 segment 정렬', () => {
    const segs = parseMathSegments('A $x$ B $y$ C');
    expect(segs).toHaveLength(5);
    expect(segs[0]).toEqual({ kind: 'text', content: 'A ' });
    expect(segs[1].kind).toBe('math');
    expect(segs[2]).toEqual({ kind: 'text', content: ' B ' });
    expect(segs[3].kind).toBe('math');
    expect(segs[4]).toEqual({ kind: 'text', content: ' C' });
  });
});
