import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { CHART_SEMANTIC, chartSettings, seriesColor } from '../theme';

/** سلسلة بيانات: تسمية + قيمة لكل فئة (بنفس ترتيب categories) */
export interface ChartSeries {
  id?: string;
  label: string;
  values: number[];
  color?: string;
}

export interface ChartMotionProps {
  /** تأخير البداية بالثواني (بعد دخول الشريحة) */
  delay?: number;
  /** مدة الحركة الأساسية بالثواني */
  duration?: number;
  /** الفاصل بين العناصر المتتابعة بالثواني */
  stagger?: number;
  /** اتجاه القراءة: rtl (الافتراضي) ← أول فئة على اليمين والمحور الرأسي على اليمين */
  dir?: 'rtl' | 'ltr';
}

/** إعدادات الحركة الفعلية بعد احتساب تقليل الحركة والافتراضيات المشتركة */
export function useChartMotion(props: ChartMotionProps) {
  const reduced = prefersReducedMotion();
  return {
    reduced,
    delay: reduced ? 0 : (props.delay ?? 0),
    duration: reduced ? 0 : (props.duration ?? chartSettings.duration),
    stagger: reduced ? 0 : (props.stagger ?? chartSettings.stagger),
    rtl: (props.dir ?? 'rtl') === 'rtl',
  };
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** عرض الحاوية (ResizeObserver) مع قيمة احتياطية للتصيير الأولي/الخادم */
export function useContainerWidth(ref: RefObject<HTMLElement | null>, fallback = 640, fixed?: number): number {
  const [width, setWidth] = useState(fixed ?? fallback);
  useIsoLayoutEffect(() => {
    if (fixed !== undefined) return;
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(w);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, fixed]);
  return fixed ?? width;
}

/** نص SVG بخط القالب ولونه — الاتجاه LTR داخل الـ SVG دائماً (المراسي تُحسب يدوياً) */
export function SvgText({
  x,
  y,
  children,
  anchor = 'middle',
  size = chartSettings.fontSize,
  fill = CHART_SEMANTIC.text,
  weight,
  baseline = 'middle',
  style,
  className,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  fill?: string;
  weight?: number | string;
  baseline?: 'middle' | 'hanging' | 'auto' | 'alphabetic';
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline={baseline}
      fill={fill}
      fontSize={size}
      fontWeight={weight}
      fontFamily={chartSettings.fontFamily}
      className={cn('tabular-nums', className)}
      style={{ direction: 'ltr', ...style }}
    >
      {children}
    </text>
  );
}

/** مفتاح الرسم (HTML، RTL) — يُستعمل تلقائياً عند تعدّد السلاسل */
export function ChartLegend({
  items,
  className,
  delay = 0,
  muted,
}: {
  items: { label: string; color?: string; value?: string }[];
  className?: string;
  delay?: number;
  /** تسميات باهتة (غير مميَّزة) */
  muted?: (index: number) => boolean;
}) {
  const reduced = prefersReducedMotion();
  return (
    <ul dir="rtl" className={cn('flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-300', className)}>
      {items.map((it, i) => (
        <motion.li
          key={`${it.label}-${i}`}
          className={cn('flex items-center gap-2', muted?.(i) && 'opacity-50')}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: delay + i * 0.06 }}
        >
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: seriesColor(i, it.color) }} aria-hidden />
          <span>{it.label}</span>
          {it.value !== undefined && (
            <span dir="ltr" className="font-mono text-xs text-slate-400 tabular-nums">
              {it.value}
            </span>
          )}
        </motion.li>
      ))}
    </ul>
  );
}

/** هامش قياسي للرسوم الديكارتية */
export const CARTESIAN_MARGIN = { top: 28, right: 56, bottom: 32, left: 16 } as const;

/** الحد الأقصى الآمن (يتجنّب 0 والقيم السالبة) */
export function safeMax(values: number[], explicit?: number): number {
  const m = explicit ?? Math.max(0, ...values);
  return m > 0 ? m : 1;
}

/** مرجع حاوية + عرض — نمط مشترك للرسوم المتجاوبة */
export function useChartSize(width?: number, fallback = 640) {
  const ref = useRef<HTMLDivElement>(null);
  const measured = useContainerWidth(ref, fallback, width);
  return { ref, width: measured };
}
