/**
 * Phase G-06 — G06-31: 학생 입력 단축 표기 → 표준 LaTeX 변환기.
 *
 * 목적: 학생이 LaTeX 부담 없이 단축 표기로 수식 입력 → server-side 변환 → 모델 처리.
 *
 * 매핑 정책 (사용자 결정 A):
 *   - 그리스 문자 표준: pi=π, phi=φ. al/be/ga/de/th/la/mu/si/om 짧은 키워드.
 *   - 응답 LaTeX 형식은 변경하지 않음 (모델은 항상 표준 LaTeX 응답).
 *
 * 정규식 적용 순서:
 *   - 길이 긴 패턴 우선 (RR3 → RR, RRn).
 *   - 그리스 문자 boundary `\b` 사용 — 단어 일부 매칭 방지.
 *   - 함수 형태(ident(args))가 그리스 1글자 매칭보다 우선.
 *
 * 영향 격리:
 *   - 본 모듈은 순수 함수, 외부 의존 0.
 *   - /api/euler-tutor/route.ts 진입점에서만 호출.
 */

type Replacer = string | ((m: RegExpMatchArray) => string);

interface Rule {
  pattern: RegExp;
  replace: Replacer;
}

/**
 * 단축 매핑 규칙. 적용 순서가 중요하다.
 * 1) 함수 형태 (ident(args))   ─ 더 구체적
 * 2) 다중 문자 그리스          ─ alpha 등
 * 3) 짧은 그리스 / 무한대       ─ pi, phi, inf
 * 4) 부등호·연산자
 */
export const SHORTHAND_MAP: Rule[] = [
  // ===== 1) 거듭제곱근 (긴 패턴 우선) =====
  // RR3(x), RRn(x) → \sqrt[3]{x}, \sqrt[n]{x}
  { pattern: /\bRR(\d+|[A-Za-z])\(([^()]+)\)/g, replace: '\\sqrt[$1]{$2}' },
  // RR(x) → \sqrt{x}
  { pattern: /\bRR\(([^()]+)\)/g, replace: '\\sqrt{$1}' },

  // ===== 2) 합·곱·적분 =====
  // SS(k=1, n) f(k) → \sum_{k=1}^{n} f(k)
  {
    pattern: /\bSS\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)\s*([^\s]+)/g,
    replace: '\\sum_{$1}^{$2} $3',
  },
  // PP(k=1, n) f(k) → \prod_{k=1}^{n} f(k)
  {
    pattern: /\bPP\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)\s*([^\s]+)/g,
    replace: '\\prod_{$1}^{$2} $3',
  },
  // II(0, 1) f(x) dx → \int_{0}^{1} f(x) \,dx (dx, dt, du, dth 등 1~3글자 변수 허용)
  {
    pattern: /\bII\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)\s*(.+?)\s*d([a-zA-Z]{1,3})\b/g,
    replace: '\\int_{$1}^{$2} $3\\,d$4',
  },

  // ===== 3) 극한·분수 =====
  // lim(x->a) → \lim_{x \to a}
  {
    pattern: /\blim\(\s*([^->\s]+)\s*->\s*([^)]+?)\s*\)/g,
    replace: '\\lim_{$1 \\to $2}',
  },
  // frac(a, b) → \frac{a}{b}
  {
    pattern: /\bfrac\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g,
    replace: '\\frac{$1}{$2}',
  },

  // ===== 4) 함수 형태 ─ 그리스보다 먼저 (충돌 방지) =====
  // bar(X) → \bar{X}
  { pattern: /\bbar\(\s*([^)]+?)\s*\)/g, replace: '\\bar{$1}' },
  // abs(a) → \lvert a \rvert
  { pattern: /\babs\(\s*([^)]+?)\s*\)/g, replace: '\\lvert $1 \\rvert' },
  // vec(OA) → \vec{OA}
  { pattern: /\bvec\(\s*([^)]+?)\s*\)/g, replace: '\\vec{$1}' },
  // dot(a, b) → \vec{a} \cdot \vec{b}
  {
    pattern: /\bdot\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g,
    replace: '\\vec{$1} \\cdot \\vec{$2}',
  },
  // cross(a, b) → \vec{a} \times \vec{b}
  {
    pattern: /\bcross\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g,
    replace: '\\vec{$1} \\times \\vec{$2}',
  },
  // ang(AOB) → \angle AOB
  { pattern: /\bang\(\s*([^)]+?)\s*\)/g, replace: '\\angle $1' },
  // arc(AB) → \overset{\frown}{AB}
  { pattern: /\barc\(\s*([^)]+?)\s*\)/g, replace: '\\overset{\\frown}{$1}' },
  // compose(f, g) → f \circ g
  {
    pattern: /\bcompose\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g,
    replace: '$1 \\circ $2',
  },

  // ===== 5) 화살표 벡터 (OA-> 패턴) =====
  // 대문자 1~3자 + -> + 공백/끝 → \vec{...}
  { pattern: /\b([A-Z]{1,3})->(\s|$)/g, replace: '\\vec{$1}$2' },

  // ===== 6) 함수 합성 'f@g' (사용자 결정 2026-04-29: 'o'는 변수와 충돌 → '@') =====
  // 한 글자 함수 사이 '@' (공백 허용)
  { pattern: /([a-zA-Z])\s*@\s*([a-zA-Z])/g, replace: '$1 \\circ $2' },

  // ===== 7) 조합·순열 (긴 키워드 우선) =====
  // nCr → {}_n\mathrm{C}_r
  { pattern: /\bnCr\b/g, replace: '{}_n\\mathrm{C}_r' },
  // nPr → {}_n\mathrm{P}_r
  { pattern: /\bnPr\b/g, replace: '{}_n\\mathrm{P}_r' },

  // ===== 8) 그리스 문자 (다중 글자 → 1~2글자) =====
  // alpha 등 풀네임은 이미 LaTeX. 우리는 짧은 키만 받는다.
  { pattern: /\balpha\b/g, replace: '\\alpha' },
  { pattern: /\bbeta\b/g, replace: '\\beta' },
  { pattern: /\bgamma\b/g, replace: '\\gamma' },
  { pattern: /\bdelta\b/g, replace: '\\delta' },
  { pattern: /\btheta\b/g, replace: '\\theta' },
  { pattern: /\blambda\b/g, replace: '\\lambda' },
  { pattern: /\bsigma\b/g, replace: '\\sigma' },
  { pattern: /\bomega\b/g, replace: '\\omega' },

  // 짧은 키 (사용자 결정 A)
  { pattern: /\bphi\b/g, replace: '\\phi' },
  { pattern: /\bpi\b/g, replace: '\\pi' },
  { pattern: /\bth\b/g, replace: '\\theta' },
  { pattern: /\bal\b/g, replace: '\\alpha' },
  { pattern: /\bbe\b/g, replace: '\\beta' },
  { pattern: /\bga\b/g, replace: '\\gamma' },
  { pattern: /\bde\b/g, replace: '\\delta' },
  { pattern: /\bla\b/g, replace: '\\lambda' },
  { pattern: /\bmu\b/g, replace: '\\mu' },
  { pattern: /\bsi\b/g, replace: '\\sigma' },
  { pattern: /\bom\b/g, replace: '\\omega' },

  // ===== 9) 무한대 =====
  // -inf 우선 (음수 부호 유지)
  { pattern: /-inf\b/g, replace: '-\\infty' },
  { pattern: /\binf\b/g, replace: '\\infty' },

  // ===== 10) 확률 조건부 — P(B|A) → P(B \mid A) =====
  // P(...|...) 한정 (절대값 abs 와 충돌 방지: P( prefix 만)
  {
    pattern: /\bP\(\s*([^|()]+?)\s*\|\s*([^()]+?)\s*\)/g,
    replace: 'P($1 \\mid $2)',
  },

  // ===== 11) 정규분포 N(mu, si^2) — 그리스 변환 후 자연스레 처리됨 =====
  // (별도 규칙 불필요 — mu, si 가 위에서 변환됨)

  // ===== 12) 부등호·기호 =====
  { pattern: />=/g, replace: '\\geq' },
  { pattern: /<=/g, replace: '\\leq' },
  { pattern: /!=/g, replace: '\\neq' },
  { pattern: /~=/g, replace: '\\approx' },
  // 단독 ~ (분포 기호) — ~= 처리 후 안전. 양쪽 공백 보존
  { pattern: / ~ /g, replace: ' \\sim ' },
  { pattern: /\/\//g, replace: '\\parallel' },
  { pattern: /\bperp\b/g, replace: '\\perp' },
  { pattern: /_\|_/g, replace: '\\perp' },
  // LL → ⊥ (사용자 결정 2026-04-29: 시각 직관 — 두 ㄴ 자가 ⊥ 모양)
  { pattern: /\bLL\b/g, replace: '\\perp' },

  // ===== 13) 내적 'a . b' (공백 사이 점) =====
  // 한 글자 + 공백 + . + 공백 + 한 글자
  { pattern: /\b([a-zA-Z])\s+\.\s+([a-zA-Z])\b/g, replace: '\\vec{$1} \\cdot \\vec{$2}' },

  // ===== 14) 외적 'a x b' (공백 사이 x) =====
  { pattern: /\b([a-zA-Z])\s+x\s+([a-zA-Z])\b/g, replace: '\\vec{$1} \\times \\vec{$2}' },
];

/**
 * 학생 단축 표기를 표준 LaTeX 로 변환한다.
 *
 * 멱등성: 이미 LaTeX 인 입력은 그대로 통과 (`\sum_{k=1}^{n}` 등).
 * 안전성: 매핑 실패는 원본 유지. 부분 변환 허용.
 */
export function shorthandToLatex(input: string): string {
  if (!input) return input;
  let result = input;
  for (const { pattern, replace } of SHORTHAND_MAP) {
    result = result.replace(pattern, replace as string);
  }
  return result;
}
