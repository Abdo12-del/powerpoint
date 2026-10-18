import { Suspense, createElement, lazy, type ComponentType } from 'react';
import { cn } from '@/lib/cn';

export interface ChartSkeletonProps {
  height?: number;
  className?: string;
  label?: string;
}

/** هيكل انتظار بحجم الرسم (يمنع قفز التخطيط أثناء تحميل مكتبة ثقيلة) */
export function ChartSkeleton({ height = 320, className, label = 'جارٍ تحميل الرسم…' }: ChartSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex w-full animate-pulse items-end gap-3 rounded-xl bg-white/[0.03] p-6', className)}
      style={{ height }}
    >
      {[0.55, 0.8, 0.45, 0.95, 0.7, 0.6].map((h, i) => (
        <div key={i} className="flex-1 rounded-t-md bg-white/10" style={{ height: `${h * 100}%` }} />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * تحميل كسول لرسم يعتمد مكتبة ثقيلة (Recharts/Nivo/Chart.js/ECharts) مع هيكل انتظار بنفس الارتفاع.
 * ضع الرسم في ملفه الخاص (export default) ثم:
 *   const SalesChart = lazyChart(() => import('@/data/charts/SalesChart'), 340);
 *   content: <SalesChart />
 * النتيجة: المكتبة تدخل قطعة منفصلة تُحمَّل عند أول شريحة تحتاجها فقط، والحزمة الرئيسية تبقى خفيفة.
 */
export function lazyChart<P extends object>(loader: () => Promise<{ default: ComponentType<P> }>, height = 320): ComponentType<P> {
  const Inner = lazy(loader);
  const Wrapped = (props: P) => <Suspense fallback={<ChartSkeleton height={height} />}>{createElement(Inner, props)}</Suspense>;
  Wrapped.displayName = 'LazyChart';
  return Wrapped;
}
