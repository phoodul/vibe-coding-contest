/**
 * Phase G-06 — G06-31: shorthand-to-latex 단위 테스트.
 *
 * 30+ 시나리오: 거듭제곱근 / 합·곱·적분 / 그리스 / 확률통계 / 벡터 / 부등호 / 복합.
 *
 * 핵심 검증:
 *   - 정규식 적용 순서 (RR3 > RR, P(B|A) > abs)
 *   - 그리스 boundary (pi 안에서 일부 매칭 X)
 *   - 멱등성 (이미 LaTeX 인 입력 통과)
 */
import { describe, it, expect } from 'vitest';
import { shorthandToLatex } from '../shorthand-to-latex';

describe('shorthandToLatex — 거듭제곱근', () => {
  it('RR(x) → \\sqrt{x}', () => {
    expect(shorthandToLatex('RR(x)')).toBe('\\sqrt{x}');
  });
  it('RR(x^2+1) — 복잡한 인자', () => {
    expect(shorthandToLatex('RR(x^2+1)')).toBe('\\sqrt{x^2+1}');
  });
  it('RR3(x) → \\sqrt[3]{x}', () => {
    expect(shorthandToLatex('RR3(x)')).toBe('\\sqrt[3]{x}');
  });
  it('RRn(x) → \\sqrt[n]{x}', () => {
    expect(shorthandToLatex('RRn(a+b)')).toBe('\\sqrt[n]{a+b}');
  });
  it('RR3 우선 — RR 보다 먼저 매칭', () => {
    expect(shorthandToLatex('RR3(8)+RR(4)')).toBe('\\sqrt[3]{8}+\\sqrt{4}');
  });
});

describe('shorthandToLatex — 합·곱·적분', () => {
  it('SS(k=1, n) k → \\sum_{k=1}^{n} k', () => {
    expect(shorthandToLatex('SS(k=1, n) k')).toBe('\\sum_{k=1}^{n} k');
  });
  it('PP(k=1, n) k', () => {
    expect(shorthandToLatex('PP(k=1, n) k')).toBe('\\prod_{k=1}^{n} k');
  });
  it('II(0, 1) x dx', () => {
    expect(shorthandToLatex('II(0, 1) x dx')).toBe('\\int_{0}^{1} x\\,dx');
  });
  it('II(0, inf) — 무한대 결합', () => {
    expect(shorthandToLatex('II(0, inf) f(x) dx')).toBe(
      '\\int_{0}^{\\infty} f(x)\\,dx',
    );
  });
});

describe('shorthandToLatex — 극한·분수', () => {
  it('lim(x->0) → \\lim_{x \\to 0}', () => {
    expect(shorthandToLatex('lim(x->0)')).toBe('\\lim_{x \\to 0}');
  });
  it('lim(x->inf)', () => {
    expect(shorthandToLatex('lim(x->inf) 1/x')).toBe('\\lim_{x \\to \\infty} 1/x');
  });
  it('frac(a, b) → \\frac{a}{b}', () => {
    expect(shorthandToLatex('frac(a, b)')).toBe('\\frac{a}{b}');
  });
  it('frac 중첩 인자', () => {
    expect(shorthandToLatex('frac(1, 2)')).toBe('\\frac{1}{2}');
  });
});

describe('shorthandToLatex — 그리스 문자', () => {
  it('pi → \\pi', () => {
    expect(shorthandToLatex('2 pi r')).toBe('2 \\pi r');
  });
  it('phi (충돌 X)', () => {
    expect(shorthandToLatex('pi + phi')).toBe('\\pi + \\phi');
  });
  it('th → \\theta', () => {
    expect(shorthandToLatex('sin(th)')).toBe('sin(\\theta)');
  });
  it('al be ga de — 짧은 키들', () => {
    expect(shorthandToLatex('al + be + ga + de')).toBe(
      '\\alpha + \\beta + \\gamma + \\delta',
    );
  });
  it('la mu si om', () => {
    expect(shorthandToLatex('la mu si om')).toBe(
      '\\lambda \\mu \\sigma \\omega',
    );
  });
  it('alpha 풀네임도 변환', () => {
    expect(shorthandToLatex('alpha + beta')).toBe('\\alpha + \\beta');
  });
  it('boundary — "pinball" 안에서 pi 매칭 X', () => {
    expect(shorthandToLatex('pinball')).toBe('pinball');
  });
  it('boundary — "alpha" 가 "al" 로 잘리지 않음', () => {
    expect(shorthandToLatex('alpha')).toBe('\\alpha');
  });
});

describe('shorthandToLatex — 확률·통계', () => {
  it('bar(X) → \\bar{X}', () => {
    expect(shorthandToLatex('bar(X)')).toBe('\\bar{X}');
  });
  it('N(mu, si^2)', () => {
    expect(shorthandToLatex('N(mu, si^2)')).toBe('N(\\mu, \\sigma^2)');
  });
  it('nCr → 조합', () => {
    expect(shorthandToLatex('nCr')).toBe('{}_n\\mathrm{C}_r');
  });
  it('nPr → 순열', () => {
    expect(shorthandToLatex('nPr')).toBe('{}_n\\mathrm{P}_r');
  });
  it('P(B|A) → P(B \\mid A)', () => {
    expect(shorthandToLatex('P(B|A)')).toBe('P(B \\mid A)');
  });
});

describe('shorthandToLatex — 기하·벡터', () => {
  it('vec(OA) → \\vec{OA}', () => {
    expect(shorthandToLatex('vec(OA)')).toBe('\\vec{OA}');
  });
  it('OA(->) → \\vec{OA} (사용자 결정 2026-04-30)', () => {
    expect(shorthandToLatex('OA(->) + OB(->)')).toBe('\\vec{OA} + \\vec{OB}');
  });
  it('abs(a) → \\lvert a \\rvert', () => {
    expect(shorthandToLatex('abs(a)')).toBe('\\lvert a \\rvert');
  });
  it('dot(a, b) → 내적', () => {
    expect(shorthandToLatex('dot(a, b)')).toBe('\\vec{a} \\cdot \\vec{b}');
  });
  it('cross(a, b) → 외적', () => {
    expect(shorthandToLatex('cross(a, b)')).toBe('\\vec{a} \\times \\vec{b}');
  });
  it('a . b → 공백 사이 점 = 내적', () => {
    expect(shorthandToLatex('a . b')).toBe('\\vec{a} \\cdot \\vec{b}');
  });
  it('// → \\parallel', () => {
    expect(shorthandToLatex('AB // CD')).toBe('AB \\parallel CD');
  });
  it('perp → \\perp', () => {
    expect(shorthandToLatex('AB perp CD')).toBe('AB \\perp CD');
  });
  it('LL → \\perp (사용자 결정 — 시각 직관)', () => {
    expect(shorthandToLatex('AB LL CD')).toBe('AB \\perp CD');
  });
  it('LL boundary 보호 — LLM 같은 단어 변환 X', () => {
    expect(shorthandToLatex('LLM 사용')).toBe('LLM 사용');
  });
  it('ang(AOB) → \\angle AOB', () => {
    expect(shorthandToLatex('ang(AOB)')).toBe('\\angle AOB');
  });
});

describe('shorthandToLatex — 함수·연산자', () => {
  it('f@g → 합성 (사용자 결정 — @ 연산자)', () => {
    expect(shorthandToLatex('f@g')).toBe('f \\circ g');
  });
  it('f @ g → 합성 (공백 허용)', () => {
    expect(shorthandToLatex('f @ g')).toBe('f \\circ g');
  });
  it('compose(f, g) → 합성', () => {
    expect(shorthandToLatex('compose(f, g)')).toBe('f \\circ g');
  });
  it('>= → \\geq', () => {
    expect(shorthandToLatex('x >= 0')).toBe('x \\geq 0');
  });
  it('<= → \\leq', () => {
    expect(shorthandToLatex('x <= 0')).toBe('x \\leq 0');
  });
  it('!= → \\neq', () => {
    expect(shorthandToLatex('a != b')).toBe('a \\neq b');
  });
  it('~= → \\approx', () => {
    expect(shorthandToLatex('pi ~= 3.14')).toBe('\\pi \\approx 3.14');
  });
});

describe('shorthandToLatex — 무한대', () => {
  it('inf → \\infty', () => {
    expect(shorthandToLatex('inf')).toBe('\\infty');
  });
  it('-inf → -\\infty', () => {
    expect(shorthandToLatex('-inf')).toBe('-\\infty');
  });
});

describe('shorthandToLatex — 복합 시나리오', () => {
  it('적분 + 그리스 + dx', () => {
    const out = shorthandToLatex('II(0, pi) sin(th) dth');
    expect(out).toContain('\\int_{0}^{\\pi}');
    expect(out).toContain('sin(\\theta)');
    expect(out).toContain('\\,d');
  });
  it('합 + 분수', () => {
    expect(shorthandToLatex('SS(k=1, n) frac(1, k)')).toBe(
      '\\sum_{k=1}^{n} \\frac{1}{k}',
    );
  });
  it('극한 + 분수', () => {
    expect(shorthandToLatex('lim(x->0) frac(sin(x), x)')).toBe(
      '\\lim_{x \\to 0} \\frac{sin(x)}{x}',
    );
  });
  it('정규분포 + 평균', () => {
    expect(shorthandToLatex('bar(X) ~ N(mu, si^2)')).toBe(
      '\\bar{X} \\sim N(\\mu, \\sigma^2)',
    );
  });
  it('빈 문자열 — 안전 통과', () => {
    expect(shorthandToLatex('')).toBe('');
  });
  it('순수 한글 — 변환 X', () => {
    expect(shorthandToLatex('수학 문제입니다')).toBe('수학 문제입니다');
  });
  it('이미 LaTeX 인 입력 — 멱등', () => {
    const latex = '\\sum_{k=1}^{n} k^2';
    expect(shorthandToLatex(latex)).toBe(latex);
  });
});
