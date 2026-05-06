/**
 * 2026-05-06 19차 — KaTeX mhchem extension 회귀 테스트.
 *
 * 배경: 4 maestro (Chemistry / Biology / Physics / Earth Science) 에서 화학식·이온·
 * 반응식·동위원소를 `\ce{}` 으로 표기. mhchem extension 미로드 시 `\ce` 매크로 인식
 * 실패 → KaTeX 에러. 본 테스트는 mhchem 이 글로벌에 등록되었음을 검증.
 *
 * mhchem 은 KaTeX side-effect import (`import 'katex/contrib/mhchem'`).
 * StreamingMarkdown.tsx 와 MathText.tsx 두 곳에서 import.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import katex from 'katex';

beforeAll(async () => {
  // 컴포넌트들이 import 하는 것과 동일하게 글로벌 등록
  await import('katex/contrib/mhchem');
});

describe('KaTeX mhchem extension', () => {
  it('단순 분자식 \\ce{H2SO4} 렌더 성공', () => {
    const html = katex.renderToString('\\ce{H2SO4}', { throwOnError: true });
    expect(html).toContain('H');
    expect(html).toContain('S');
    expect(html).toContain('O');
    // 아래첨자 위치 검증
    expect(html).toContain('msub');
  });

  it('이온 \\ce{Na+} 렌더', () => {
    const html = katex.renderToString('\\ce{Na+}', { throwOnError: true });
    expect(html).toContain('Na');
    // mhchem 은 + 를 위첨자로 처리 (msup)
    expect(html).toContain('msup');
  });

  it('이가 양이온 \\ce{Mg^2+} 렌더', () => {
    const html = katex.renderToString('\\ce{Mg^2+}', { throwOnError: true });
    expect(html).toContain('Mg');
    expect(html).toContain('2');
  });

  it('동위원소 \\ce{^{12}_6C} 렌더', () => {
    const html = katex.renderToString('\\ce{^{12}_6C}', { throwOnError: true });
    expect(html).toContain('12');
    expect(html).toContain('6');
    expect(html).toContain('C');
  });

  it('반응식 \\ce{N2 + 3H2 -> 2NH3} 렌더', () => {
    const html = katex.renderToString(
      '\\ce{N2 + 3H2 -> 2NH3}',
      { throwOnError: true },
    );
    expect(html).toContain('N');
    expect(html).toContain('H');
    // mhchem 의 -> arrow 변환 검증 (KaTeX 의 화살표 mathML)
    expect(html).toContain('mrow');
  });

  it('평형 화살표 \\ce{<=>} 렌더', () => {
    const html = katex.renderToString(
      '\\ce{H2O + CO2 <=> H2CO3}',
      { throwOnError: true },
    );
    expect(html).toContain('H');
    expect(html).toContain('O');
    expect(html).toContain('C');
  });

  it('일반 수식과 함께 사용 — \\ce 가 기존 KaTeX 매크로 깨지 않음', () => {
    // 회귀 검증: mhchem 등록 후에도 일반 수식 정상 렌더
    const html = katex.renderToString(
      '\\frac{1}{2} mv^2 = \\frac{1}{2}\\,\\ce{O2}',
      { throwOnError: true },
    );
    expect(html).toContain('mfrac');
    expect(html).toContain('m');
    expect(html).toContain('v');
    expect(html).toContain('O');
  });
});
