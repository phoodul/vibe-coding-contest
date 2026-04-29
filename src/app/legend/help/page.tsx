/**
 * Phase G-06 — G06-31: Legend Tutor 입력 가이드 페이지.
 *
 * 학생이 LaTeX 부담 없이 사용할 수 있는 단축 표기 일람.
 * 서버는 `shorthand-to-latex.ts` 로 자동 변환하므로,
 * 본 페이지는 학습 자료 + 미리보기 (KaTeX 렌더) 역할.
 *
 * 베이스: docs/architecture-g06-legend.md §8 + 사용자 결정 A 매핑.
 */
"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export const dynamic = "force-static";

interface MathItem {
  input: string;
  latex: string;
  note?: string;
}

interface Section {
  title: string;
  description?: string;
  items: MathItem[];
}

const SECTIONS: Section[] = [
  {
    title: "거듭제곱근",
    items: [
      { input: "RR(x)", latex: "\\sqrt{x}" },
      { input: "RR(x^2 + 1)", latex: "\\sqrt{x^2 + 1}" },
      { input: "RR3(x)", latex: "\\sqrt[3]{x}" },
      { input: "RRn(a+b)", latex: "\\sqrt[n]{a+b}" },
    ],
  },
  {
    title: "합·곱·적분",
    description: "변수 = 경계 사이는 콤마(,) 로 구분합니다.",
    items: [
      { input: "SS(k=1, n) k", latex: "\\sum_{k=1}^{n} k" },
      { input: "PP(k=1, n) k", latex: "\\prod_{k=1}^{n} k" },
      { input: "II(0, 1) x^2 dx", latex: "\\int_{0}^{1} x^2 \\, dx" },
      { input: "II(0, inf) f(x) dx", latex: "\\int_{0}^{\\infty} f(x) \\, dx" },
    ],
  },
  {
    title: "극한·분수",
    items: [
      { input: "lim(x->0) f(x)", latex: "\\lim_{x \\to 0} f(x)" },
      { input: "lim(x->inf) 1/x", latex: "\\lim_{x \\to \\infty} \\frac{1}{x}" },
      { input: "frac(a, b)", latex: "\\frac{a}{b}" },
      { input: "frac(1, 2) + frac(1, 3)", latex: "\\frac{1}{2} + \\frac{1}{3}" },
    ],
  },
  {
    title: "그리스 문자",
    description: "사용자 결정 A 매핑 (수학 표준): pi=π, phi=φ.",
    items: [
      { input: "pi", latex: "\\pi" },
      { input: "phi", latex: "\\phi" },
      { input: "th", latex: "\\theta", note: "theta" },
      { input: "al, be, ga, de", latex: "\\alpha, \\beta, \\gamma, \\delta" },
      { input: "la, mu, si, om", latex: "\\lambda, \\mu, \\sigma, \\omega" },
    ],
  },
  {
    title: "확률·통계",
    items: [
      { input: "bar(X)", latex: "\\bar{X}" },
      { input: "N(mu, si^2)", latex: "N(\\mu, \\sigma^2)" },
      { input: "nCr", latex: "{}_n\\mathrm{C}_r" },
      { input: "nPr", latex: "{}_n\\mathrm{P}_r" },
      { input: "P(B|A)", latex: "P(B \\mid A)" },
    ],
  },
  {
    title: "기하·벡터",
    items: [
      { input: "vec(OA)", latex: "\\vec{OA}" },
      { input: "OA(->) + OB(->)", latex: "\\vec{OA} + \\vec{OB}" },
      { input: "abs(a)", latex: "\\lvert a \\rvert" },
      { input: "dot(a, b)", latex: "\\vec{a} \\cdot \\vec{b}" },
      { input: "cross(a, b)", latex: "\\vec{a} \\times \\vec{b}" },
      { input: "AB // CD", latex: "AB \\parallel CD" },
      { input: "AB perp CD", latex: "AB \\perp CD" },
      { input: "AB LL CD", latex: "AB \\perp CD", note: "직각 — 시각 직관" },
      { input: "ang(AOB)", latex: "\\angle AOB" },
    ],
  },
  {
    title: "함수·연산자",
    items: [
      { input: "f@g", latex: "f \\circ g", note: "함수 합성" },
      { input: "compose(f, g)", latex: "f \\circ g" },
      { input: "f^-1", latex: "f^{-1}", note: "그대로 사용" },
      { input: ">=, <=, !=, ~=", latex: "\\geq, \\leq, \\neq, \\approx" },
      { input: "inf, -inf", latex: "\\infty, -\\infty" },
    ],
  },
];

function MathPreview({ latex }: { latex: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex]);
  return <span ref={ref} />;
}

export default function LegendHelpPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Legend Tutor 입력 가이드</h1>
        <p className="text-white/70">
          LaTeX 부담 없이 단축 표기로 수식을 입력하세요. 서버가 표준 수식으로 자동 변환해 거장 튜터에게 전달합니다.
        </p>
        <p className="text-xs text-white/50">
          예: <code className="rounded bg-white/10 px-1.5 py-0.5">RR(x^2+1)</code>{" "}
          입력 →{" "}
          <span className="inline-block rounded bg-emerald-500/10 px-1.5 py-0.5">
            <MathPreview latex="\sqrt{x^2+1}" />
          </span>{" "}
          로 자동 변환.
        </p>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            {section.description && (
              <p className="mt-1 text-sm text-white/60">{section.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {section.items.map((item) => (
              <div
                key={item.input}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <code className="rounded bg-black/40 px-2 py-1 text-xs text-emerald-300">
                  {item.input}
                </code>
                <span className="text-white/40">→</span>
                <span className="flex-1 text-white">
                  <MathPreview latex={item.latex} />
                </span>
                {item.note && (
                  <span className="text-xs text-white/40">({item.note})</span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        <p className="font-medium text-white/80">이미 LaTeX 를 잘 안다면?</p>
        <p className="mt-1">
          표준 LaTeX 입력도 그대로 통과됩니다 (예:{" "}
          <code className="rounded bg-black/40 px-1 py-0.5 text-xs text-emerald-300">
            \sum_{"{"}k=1{"}"}^{"{"}n{"}"} k^2
          </code>
          ).
        </p>
      </footer>
    </div>
  );
}
