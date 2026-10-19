import katex from 'katex';
import 'katex/contrib/mhchem';

/**
 * Render with KaTeX 0.19 and mhchem's \\ce / \\pu macros. Input is never trusted as HTML;
 * keep `trust: false` here even when rendering user-authored TeX.
 */
export function renderMathMarkup(tex: string, displayMode = false): string {
  return katex.renderToString(tex, {
    displayMode,
    output: 'htmlAndMathml',
    throwOnError: false,
    strict: 'ignore',
    trust: false,
    errorColor: '#fda4af',
  });
}
