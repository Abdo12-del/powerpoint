import { forwardRef, useRef, createRef, type ReactNode, type RefObject } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AnimatedBeam } from '@/components/gallery';
import { cn } from '@/lib/cn';

export interface BeamNode {
  id: string;
  label: string;
  icon: LucideIcon;
  /** وصف قصير تحت العنوان */
  hint?: ReactNode;
}

export interface RelationBeamsProps {
  nodes: BeamNode[];
  /** روابط [من, إلى] — تُرسم بالترتيب مع تأخير تراكمي */
  edges: [string, string][];
  /** ألوان الشعاع */
  colors?: [string, string];
  className?: string;
}

const Node = forwardRef<HTMLDivElement, { node: BeamNode }>(function Node({ node }, ref) {
  const Icon = node.icon;
  return (
    <div
      ref={ref}
      className="relative z-10 flex w-40 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 p-4 text-center shadow-lg"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
        <Icon className="h-6 w-6" />
      </span>
      <span className="font-bold">{node.label}</span>
      {node.hint && <span className="text-xs text-slate-400">{node.hint}</span>}
    </div>
  );
});

/**
 * وصفة «أشعة بين المكونات» (نمط relation/process): عقد في صف مع أشعة متدفقة بينها.
 * <RelationBeams nodes={[{ id: 'ui', label: 'الواجهة', icon: Monitor }, …]} edges={[['ui', 'api'], ['api', 'db']]} />
 */
export function RelationBeams({ nodes, edges, colors = ['#fbbf24', '#38bdf8'], className }: RelationBeamsProps) {
  const container = useRef<HTMLDivElement>(null);
  const refs = useRef<Map<string, RefObject<HTMLDivElement | null>>>(new Map());
  const refOf = (id: string) => {
    if (!refs.current.has(id)) refs.current.set(id, createRef<HTMLDivElement>());
    return refs.current.get(id)!;
  };

  return (
    <div ref={container} className={cn('relative mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-12 p-6', className)}>
      {nodes.map((n) => (
        <Node key={n.id} node={n} ref={refOf(n.id)} />
      ))}
      {edges.map(([from, to], i) => (
        <AnimatedBeam
          key={`${from}-${to}`}
          containerRef={container}
          fromRef={refOf(from)}
          toRef={refOf(to)}
          curvature={i % 2 === 0 ? -30 : 30}
          delay={0.5 + i * 0.4}
          duration={3}
          pathColor="rgba(255,255,255,0.15)"
          gradientStartColor={colors[0]}
          gradientStopColor={colors[1]}
        />
      ))}
    </div>
  );
}
