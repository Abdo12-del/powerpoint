import { Suspense, lazy } from 'react';
import { LoaderCircle, Workflow } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { NodeDiagramProps } from './types';

const FlowCanvas = lazy(() => import('./NodeDiagramCanvas'));

/** Lazy React Flow canvas for interactive tree/relation/process diagrams. */
export function NodeDiagram({ height = 440, className, ...props }: NodeDiagramProps) {
  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80', className)}
      style={{ height }}
      role="region"
      aria-label="مخطط عقد تفاعلي"
    >
      <Suspense
        fallback={
          <div role="status" className="flex h-full min-h-64 items-center justify-center gap-2 text-sm text-slate-300">
            <LoaderCircle className="h-4 w-4 animate-spin text-sky-300" aria-hidden />
            جارٍ تحميل مخطط العقد…
          </div>
        }
      >
        <FlowCanvas {...props} className="h-full w-full" />
      </Suspense>
      <span className="sr-only"><Workflow aria-hidden /> حرّك العقد أو استخدم العجلة للتكبير.</span>
    </div>
  );
}

export type { DiagramDirection, DiagramEdge, DiagramLayout, DiagramNode, DiagramNodeKind, DiagramPattern, DiagramPosition, NodeDiagramProps } from './types';
