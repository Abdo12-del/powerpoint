import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, Network } from 'lucide-react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { makePresentationMermaidConfig } from './theme';
import './diagrams.css';

export interface MermaidDiagramProps {
  /** Mermaid flowchart / sequenceDiagram / erDiagram / classDiagram source. */
  source: string;
  label?: string;
  className?: string;
  minHeight?: number | string;
  /** Draw links in order after Mermaid has laid out the SVG. */
  animateLinks?: boolean;
}

const MERMAID_LINK_SELECTOR = [
  'path.flowchart-link',
  'path.messageLine0',
  'path.messageLine1',
  'path.loopLine',
  'path.noteLine',
  'path.relation',
  'path.relationshipLine',
  '.edgePath path',
].join(',');

let mermaidModule: Promise<typeof import('mermaid')['default']> | undefined;
let renderSequence = 0;

function getMermaid() {
  mermaidModule ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize(makePresentationMermaidConfig());
    return mermaid;
  });
  return mermaidModule;
}

function applyRtlLabels(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGElement>('text, foreignObject, foreignObject div, foreignObject span, foreignObject p').forEach((label) => {
    label.setAttribute('dir', 'auto');
    label.setAttribute('unicode-bidi', 'plaintext');
    if (label instanceof HTMLElement) {
      label.style.direction = 'rtl';
      label.style.unicodeBidi = 'plaintext';
    }
  });
}

function revealLinks(svg: SVGSVGElement, enabled: boolean) {
  if (!enabled || prefersReducedMotion()) return;
  const links = Array.from(svg.querySelectorAll<SVGPathElement>(MERMAID_LINK_SELECTOR));
  links.forEach((path, index) => {
    if (typeof path.animate !== 'function') return;
    // Normalized pathLength keeps the draw animation independent of SVG units.
    path.setAttribute('pathLength', '1');
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = '1';
    const animation = path.animate([{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], {
      duration: 620,
      delay: index * 95,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'forwards',
    });
    animation.onfinish = () => {
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
      path.removeAttribute('pathLength');
    };
  });
}

function asErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'تعذّر إنشاء المخطط.';
}

/** Mermaid 12 renderer — lazy, template-themed, bidi-aware and secure by default. */
export function MermaidDiagram({ source, label = 'مخطط تقني', className, minHeight = 240, animateLinks = true }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (!source.trim()) {
      setLoading(false);
      setError('أضف نصّ Mermaid لعرض المخطط.');
      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      try {
        const mermaid = await getMermaid();
        const diagramId = `${id}-${++renderSequence}`;
        const result = await mermaid.render(diagramId, source);
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = result.svg;
        const svg = containerRef.current.querySelector('svg');
        if (svg) {
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', label);
          svg.style.maxWidth = '100%';
          svg.style.height = 'auto';
          applyRtlLabels(svg);
          revealLinks(svg, animateLinks);
        }
        result.bindFunctions?.(containerRef.current);
        setLoading(false);
      } catch (cause) {
        if (cancelled) return;
        setError(asErrorMessage(cause));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.replaceChildren();
    };
  }, [source, label, id, animateLinks]);

  return (
    <figure
      dir="rtl"
      aria-label={label}
      aria-busy={loading}
      className={cn('mermaid-diagram relative mx-auto w-full overflow-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4', className)}
      style={{ minHeight }}
    >
      {loading && (
        <div role="status" className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-slate-950/70 text-sm text-slate-300 backdrop-blur-sm">
          <Network className="h-4 w-4 animate-pulse text-sky-300" aria-hidden />
          جارٍ رسم المخطط…
        </div>
      )}
      <div ref={containerRef} className={cn('mx-auto flex w-full justify-center transition-opacity', loading && 'opacity-40')} />
      {error && (
        <figcaption role="alert" className="mt-2 flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </figcaption>
      )}
    </figure>
  );
}
