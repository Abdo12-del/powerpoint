import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { animate } from 'framer-motion';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import type { FontAxis } from '@/fonts';

export interface VariableTextProps {
  children: ReactNode;
  /** المحور المتغير: wght (الوزن) | wdth (العرض — Noto Sans Arabic) | slnt (الميل — Cairo عبر slnt.css) | HEXP (التمدّد — Readex Pro) */
  axis?: FontAxis;
  from?: number;
  to?: number;
  /** once: عند الظهور | loop: تنفّس ذهاباً وإياباً | hover: عند التحويم */
  mode?: 'once' | 'loop' | 'hover';
  duration?: number;
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

const settings = (axis: FontAxis, v: number) => `"${axis}" ${v.toFixed(axis === 'wdth' || axis === 'HEXP' || axis === 'opsz' ? 1 : 0)}`;

/**
 * حركة محور خط متغيّر (الوزن/العرض/الميل) عددياً عبر font-variation-settings.
 * الطريقة الصحيحة لحركة الخط العربي: الكلمة تبقى عقدة واحدة فلا ينقطع اتصال الحروف.
 * لا تعمل مع الخطوط الثابتة (Tajawal, Amiri…) — اختر خطاً `variable: true` من السجل.
 *
 * @example <VariableText as="h1" from={300} to={800}>عنوان ينمو وزنه</VariableText>
 * @example <VariableText axis="wdth" from={62.5} to={100} mode="loop">نوتو سانس</VariableText>
 */
export function VariableText({
  children,
  axis = 'wght',
  from = 300,
  to = 800,
  mode = 'once',
  duration = 1.2,
  delay = 0,
  as: Tag = 'span',
  className,
  style,
}: VariableTextProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.fontVariationSettings = settings(axis, to);
      return;
    }
    const run = (a: number, b: number, opts: { repeat?: number; repeatType?: 'reverse'; delay?: number } = {}) =>
      animate(a, b, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        ...opts,
        onUpdate: (v) => {
          el.style.fontVariationSettings = settings(axis, v);
        },
      });
    if (mode === 'hover') {
      el.style.fontVariationSettings = settings(axis, from);
      let ctrl: ReturnType<typeof animate> | undefined;
      const enter = () => {
        ctrl?.stop();
        ctrl = run(from, to);
      };
      const leave = () => {
        ctrl?.stop();
        ctrl = run(to, from);
      };
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', leave);
      return () => {
        ctrl?.stop();
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('pointerleave', leave);
      };
    }
    const ctrl = mode === 'loop' ? run(from, to, { repeat: Infinity, repeatType: 'reverse', delay }) : run(from, to, { delay });
    return () => ctrl.stop();
  }, [axis, from, to, mode, duration, delay]);
  return (
    <Tag ref={ref} className={cn('inline-block', className)} style={{ fontVariationSettings: settings(axis, from), ...style }}>
      {children}
    </Tag>
  );
}
