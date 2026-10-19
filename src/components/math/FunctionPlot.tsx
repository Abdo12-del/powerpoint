import { lazy, Suspense } from 'react';
import { cn } from '@/lib/cn';
import type { FunctionPlotProps } from './types';

const MafsFunctionPlot = lazy(() => import('./MafsFunctionPlot'));

function PlotFallback({ height }: { height: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      dir="rtl"
      className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-sm text-slate-400"
      style={{ height }}
    >
      جارٍ تجهيز الرسم التفاعلي…
    </div>
  );
}

/** Lazy Mafs function plot; the graphing library is kept out of the main presentation bundle. */
export function FunctionPlot({ className, height = 340, ...props }: FunctionPlotProps) {
  return (
    <div className={cn('w-full', className)}>
      <Suspense fallback={<PlotFallback height={height} />}>
        <MafsFunctionPlot {...props} height={height} />
      </Suspense>
    </div>
  );
}
