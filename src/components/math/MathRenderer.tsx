import { cn } from '@/lib/cn';
import { renderMathMarkup } from './render-math';
import type { MathFormulaProps } from './types';
import 'katex/dist/katex.min.css';

export interface MathRendererProps extends MathFormulaProps {
  displayMode: boolean;
}

/** Heavy KaTeX renderer. Imported only when a math formula is actually shown. */
export default function MathRenderer({ tex, displayMode, ariaLabel, className }: MathRendererProps) {
  const Element = displayMode ? 'div' : 'span';
  const markup = renderMathMarkup(tex, displayMode);

  return (
    <Element
      dir="ltr"
      role="math"
      aria-label={ariaLabel}
      className={cn(displayMode ? 'math-katex-block' : 'math-katex-inline', className)}
      style={{ direction: 'ltr', unicodeBidi: 'isolate', display: displayMode ? 'block' : 'inline-block' }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
