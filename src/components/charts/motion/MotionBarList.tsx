import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { formatNumber, seriesColor, type NumberStyle } from '../theme';
import { useChartMotion, type ChartMotionProps } from './shared';

export interface BarListItem {
  label: string;
  value: number;
  color?: string;
  icon?: ReactNode;
}

export interface MotionBarListProps extends ChartMotionProps {
  items: BarListItem[];
  valueStyle?: NumberStyle;
  maxValue?: number;
  /** ترتيب تنازلي تلقائي */
  sorted?: boolean;
  /** لون واحد لكل الأشرطة (وإلا يدور على اللوحة) */
  color?: string;
  highlight?: number | string;
  showValues?: boolean;
  barHeight?: number;
  className?: string;
}

/**
 * قائمة أشرطة HTML (ترتيب/حصص): تسمية على اليمين، شريط ينمو من اليمين، قيمة على اليسار — أخفّ من SVG وتقبل أيقونات.
 * مناسبة لـ «أعلى 5» و«توزيع الإجابات» داخل شريحة stats أو comparison.
 */
export function MotionBarList({
  items,
  valueStyle = 'decimal',
  maxValue,
  sorted = false,
  color,
  highlight,
  showValues = true,
  barHeight = 34,
  className,
  ...motionProps
}: MotionBarListProps) {
  const { reduced, delay, duration, stagger } = useChartMotion(motionProps);
  const rows = sorted ? [...items].sort((a, b) => b.value - a.value) : items;
  const max = Math.max(maxValue ?? 0, ...rows.map((r) => r.value), 1);
  const highlightIndex = typeof highlight === 'string' ? rows.findIndex((r) => r.label === highlight) : highlight;
  const isMuted = (i: number) => highlightIndex !== undefined && highlightIndex >= 0 && i !== highlightIndex;

  return (
    <ol dir="rtl" className={cn('flex w-full flex-col gap-2.5', className)} aria-label="قائمة أشرطة">
      {rows.map((row, i) => {
        const fill = color ?? seriesColor(i, row.color);
        return (
          <li
            key={`${row.label}-${i}`}
            className={cn('grid grid-cols-[minmax(7rem,auto)_1fr_auto] items-center gap-3', isMuted(i) && 'opacity-45')}
            style={{ minHeight: barHeight }}
          >
            <motion.span
              className="flex items-center gap-2 truncate text-sm font-semibold text-slate-200"
              initial={reduced ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: delay + i * stagger * 2 }}
            >
              {row.icon}
              {row.label}
            </motion.span>
            <div className="relative overflow-hidden rounded-md bg-white/5" style={{ height: barHeight * 0.7 }}>
              <motion.div
                className="absolute inset-y-0 right-0 rounded-md"
                style={{ backgroundColor: fill, width: `${(row.value / max) * 100}%`, transformOrigin: 'right center' }}
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration, delay: delay + i * stagger * 2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {showValues && (
              <motion.span
                dir="ltr"
                className="min-w-[3ch] text-left font-mono text-sm font-bold text-slate-100 tabular-nums"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + i * stagger * 2 + duration * 0.7 }}
              >
                {formatNumber(row.value, { style: valueStyle })}
              </motion.span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
