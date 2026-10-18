import { createElement, type ReactNode } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export interface AutoAnimateProps {
  children: ReactNode;
  as?: 'div' | 'ul' | 'ol' | 'section' | 'tbody';
  /** مدة الانتقال بالمللي ثانية */
  duration?: number;
  easing?: string;
  className?: string;
}

/**
 * حاوية تحرّك أبناءها تلقائياً عند الإضافة/الحذف/إعادة الترتيب (@formkit/auto-animate).
 * مفيدة للقوائم التي تتغيّر أثناء العرض (كشف تدريجي للنقاط، فلترة، ترتيب).
 *
 * @example <AutoAnimate as="ul">{items.map((i) => <li key={i.id}>…</li>)}</AutoAnimate>
 */
export function AutoAnimate({ children, as = 'div', duration = 300, easing = 'ease-in-out', className }: AutoAnimateProps) {
  const [ref] = useAutoAnimate<HTMLElement>({ duration, easing });
  return createElement(as, { ref, className }, children);
}

export { useAutoAnimate };
