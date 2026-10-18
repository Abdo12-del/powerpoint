import { createElement, useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

export interface GsapRevealProps {
  children: ReactNode;
  /** محدد العناصر المُظهَرة داخل الحاوية (الافتراضي: الأبناء المباشرون) */
  selector?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  /** إزاحة البداية الرأسية بالبكسل */
  y?: number;
  /** إزاحة البداية الأفقية بالبكسل (موجب = من اليمين) */
  x?: number;
  /** تكبير من قيمة أصغر */
  from?: number;
  ease?: string;
  as?: 'div' | 'ul' | 'ol' | 'section';
  className?: string;
}

/**
 * إظهار متتابع بـ GSAP للعناصر داخل الحاوية (بديل stagger لـ framer-motion حين تحتاج تحكم GSAP).
 * يُعاد ضبطه تلقائياً عند الخروج (useGSAP + context).
 *
 * @example
 * <GsapReveal stagger={0.1} y={30}>
 *   <Card>…</Card><Card>…</Card><Card>…</Card>
 * </GsapReveal>
 */
export function GsapReveal({ children, selector = ':scope > *', stagger = 0.08, delay = 0.1, duration = 0.6, y = 24, x = 0, from = 1, ease = 'power3.out', as = 'div', className }: GsapRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll(selector));
      if (items.length === 0) return;
      gsap.from(items, { y, x, scale: from, opacity: 0, duration, ease, stagger, delay, clearProps: 'transform,opacity' });
    },
    { scope: ref, dependencies: [selector, stagger, delay, duration, y, x, from, ease] },
  );

  return createElement(as, { ref, className }, children);
}
