import { lazy, Suspense } from 'react';
import { cn } from '@/lib/cn';
import type { MapChartProps } from './types';

const MapCanvas = lazy(() => import('./MapCanvas'));

function MapLoading() {
  return (
    <div role="status" aria-live="polite" className="w-full animate-pulse space-y-3">
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl border border-white/10 bg-slate-900/60">
        <span className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-400">جارٍ تحميل الخريطة…</span>
      </div>
      <span className="sr-only">جارٍ تحميل الخريطة…</span>
    </div>
  );
}

/** A lazy, responsive SVG map using the chart palette and Arabic-friendly labels. */
export function MapChart({ className, ...props }: MapChartProps) {
  return (
    <div dir="rtl" className={cn('w-full space-y-3', className)}>
      <Suspense fallback={<MapLoading />}>
        <MapCanvas {...props} />
      </Suspense>
    </div>
  );
}
