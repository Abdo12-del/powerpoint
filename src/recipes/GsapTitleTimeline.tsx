import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, splitWords } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { cn } from '@/lib/cn';

export interface GsapTitleTimelineProps {
  title: string;
  items: ReactNode[];
  /** شارة ختامية تظهر آخراً */
  badge?: ReactNode;
  className?: string;
}

/**
 * وصفة «تسلسل GSAP»: العنوان كلمةً كلمة ← خط يمتد من اليمين ← العناصر تباعاً ← شارة بارتداد.
 * نموذج لأي شريحة تحتاج ترتيباً زمنياً دقيقاً يتجاوز stagger البسيط.
 */
export function GsapTitleTimeline({ title, items, badge, className }: GsapTitleTimelineProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = splitWords('.gsap-title');
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.6 },
      });
      tl.from(split.words, { y: 24, opacity: 0, stagger: 0.06 })
        .from('.gsap-line', { scaleX: 0, transformOrigin: 'right center', duration: 0.5 }, '-=0.2')
        .from('.gsap-item', { x: 24, opacity: 0, stagger: 0.1 }, '-=0.2');
      if (badge)
        tl.from('.gsap-badge', {
          scale: 0,
          opacity: 0,
          ease: 'back.out(1.7)',
          duration: 0.4,
        });
      return () => split.revert();
    },
    { scope, dependencies: [title, items.length, !!badge] },
  );

  return (
    <div ref={scope} className={cn('mx-auto w-full max-w-4xl space-y-6', className)}>
      <h3 className="gsap-title text-3xl font-extrabold leading-snug">{title}</h3>
      <div className="gsap-line h-1 w-full rounded-full bg-amber-400" />
      <ul className="grid gap-3 sm:grid-cols-3">
        {items.map((it, i) => (
          <li key={i} className="gsap-item rounded-2xl border border-white/10 bg-white/5 p-4">
            {it}
          </li>
        ))}
      </ul>
      {badge && <div className="gsap-badge inline-flex rounded-full bg-amber-400/15 px-4 py-1.5 text-sm font-bold text-amber-200">{badge}</div>}
    </div>
  );
}
