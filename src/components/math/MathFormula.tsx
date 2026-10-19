import { lazy, Suspense } from 'react';
import { cn } from '@/lib/cn';
import type { MathFormulaProps } from './types';

const MathRenderer = lazy(() => import('./MathRenderer'));
const LTR_ISOLATION_STYLE = { direction: 'ltr', unicodeBidi: 'isolate' } as const;

function InlineFallback({ tex, ariaLabel, className }: MathFormulaProps) {
  return (
    <span
      dir="ltr"
      role="math"
      aria-label={ariaLabel}
      className={cn('inline-block max-w-full rounded bg-slate-900/80 px-1 font-mono text-sm text-sky-200', className)}
      style={LTR_ISOLATION_STYLE}
    >
      {tex}
    </span>
  );
}

function BlockFallback({ tex, ariaLabel, className }: MathFormulaProps) {
  return (
    <div
      dir="ltr"
      role="math"
      aria-label={ariaLabel}
      className={cn('w-full overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 px-4 py-5 text-center font-mono text-lg text-sky-200', className)}
      style={LTR_ISOLATION_STYLE}
    >
      {tex}
    </div>
  );
}

/** Inline TeX isolated as LTR so adjacent Arabic words and punctuation keep their order. */
export function MathInline(props: MathFormulaProps) {
  return (
    <Suspense fallback={<InlineFallback {...props} />}>
      <MathRenderer {...props} displayMode={false} />
    </Suspense>
  );
}

/** Display-mode equation; math stays LTR while captions and surrounding copy remain RTL. */
export function MathBlock(props: MathFormulaProps) {
  return (
    <Suspense fallback={<BlockFallback {...props} />}>
      <MathRenderer {...props} displayMode />
    </Suspense>
  );
}
