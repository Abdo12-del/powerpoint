import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EquationReveal } from './EquationReveal';
import { MathBlock, MathInline } from './MathFormula';
import { renderMathMarkup } from './render-math';

describe('KaTeX and mhchem rendering', () => {
  it('renders accessible MathML output and mhchem chemistry and physical units', () => {
    const chemistry = renderMathMarkup(String.raw`\ce{2H2 + O2 -> 2H2O}`);
    const units = renderMathMarkup(String.raw`\pu{9.81 m.s^{-2}}`);

    expect(chemistry).toContain('class="katex"');
    expect(chemistry).toContain('<math');
    expect(chemistry).not.toContain('katex-error');
    expect(units).toContain('<math');
    expect(units).not.toContain('katex-error');
  });

  it('does not trust potentially unsafe TeX HTML commands', () => {
    const html = renderMathMarkup(String.raw`\href{javascript:alert(1)}{open}`);
    expect(html).not.toContain('href="javascript:alert(1)"');
  });

  it('keeps inline and display fallbacks isolated LTR inside RTL copy', () => {
    const inline = renderToStaticMarkup(
      <p dir="rtl">
        السرعة <MathInline tex={String.raw`v_0 = 12.5\,\mathrm{m\,s^{-1}}`} />، ثم تكمل الجملة.
      </p>,
    );
    const block = renderToStaticMarkup(<MathBlock tex={String.raw`x = 4`} ariaLabel="س تساوي أربعة" />);

    expect(inline).toContain('dir="rtl"');
    expect(inline).toContain('dir="ltr"');
    expect(inline).toContain('unicode-bidi:isolate');
    expect(inline).toContain('، ثم تكمل الجملة.');
    expect(block).toContain('role="math"');
    expect(block).toContain('aria-label="س تساوي أربعة"');
  });

  it('renders a sequentially labelled derivation without changing its LTR formulas', () => {
    const html = renderToStaticMarkup(
      <EquationReveal
        steps={[
          { id: 'first', label: 'نطرح 3', tex: String.raw`2x + 3 = 11` },
          { id: 'last', label: 'نقسم على 2', tex: String.raw`x = 4` },
        ]}
      />,
    );

    expect(html).toContain('خطوات اشتقاق المعادلة');
    expect(html.indexOf('نطرح 3')).toBeLessThan(html.indexOf('نقسم على 2'));
    expect(html.indexOf('2x + 3 = 11')).toBeLessThan(html.indexOf('x = 4'));
    expect(html.match(/dir="ltr"/g)).toHaveLength(2);
  });
});
