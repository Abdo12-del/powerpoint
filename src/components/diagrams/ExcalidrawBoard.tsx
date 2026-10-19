import { Suspense, lazy } from 'react';
import { LoaderCircle, PencilRuler } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ExcalidrawBoardProps } from './excalidrawTypes';

const ExcalidrawCanvas = lazy(() => import('./ExcalidrawBoardCanvas'));

/** Lazy, Arabic-localized Excalidraw canvas; editable scenes can be persisted with onChange. */
export function ExcalidrawBoard({ height = 460, className, ...props }: ExcalidrawBoardProps) {
  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900', className)}
      style={{ height }}
    >
      <Suspense
        fallback={
          <div role="status" className="flex h-full min-h-64 items-center justify-center gap-2 text-sm text-slate-300">
            <LoaderCircle className="h-4 w-4 animate-spin text-sky-300" aria-hidden />
            جارٍ تحميل لوحة الرسم…
          </div>
        }
      >
        <ExcalidrawCanvas {...props} />
      </Suspense>
      <span className="sr-only"><PencilRuler aria-hidden /> لوحة رسم حرّ تدعم التحرير عند تفعيل editable.</span>
    </div>
  );
}

export type { ExcalidrawBoardProps } from './excalidrawTypes';
