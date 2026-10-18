import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, Stagger, Badge, IconBubble } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface Stat {
  /** القيمة العددية النهائية (العدّاد يصعد إليها) */
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  /** وسم: «حالي» / «هدف» / «مُقاس» */
  tag?: string;
  tagTone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  /** اتجاه التغيّر مع ملاحظة قصيرة: «مقابل 23 سابقاً» */
  trend?: { direction: 'up' | 'down'; note: string; positive?: boolean };
  /** عدد المنازل العشرية */
  decimals?: number;
}

function useCountUp(target: number, decimals = 0, duration = 1.4) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Number(v.toFixed(decimals))),
    });
    return () => controls.stop();
  }, [target, decimals, duration]);
  return value;
}

function Counter({ stat }: { stat: Stat }) {
  const value = useCountUp(stat.value, stat.decimals ?? 0);
  const Icon = stat.icon;
  const positive = stat.trend?.positive ?? stat.trend?.direction === 'up';
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {Icon ? <IconBubble icon={Icon} /> : <span />}
        {stat.tag && (
          <Badge tone={stat.tagTone ?? 'neutral'} className="text-xs">
            {stat.tag}
          </Badge>
        )}
      </div>
      <div className="flex items-baseline gap-1 tabular-nums">
        {stat.prefix && <span className="text-xl text-slate-300">{stat.prefix}</span>}
        <motion.span className="text-5xl font-black tracking-tight text-amber-200">
          {value.toLocaleString('ar-DZ', { minimumFractionDigits: stat.decimals ?? 0, maximumFractionDigits: stat.decimals ?? 0 })}
        </motion.span>
        {stat.suffix && <span className="text-xl text-slate-300">{stat.suffix}</span>}
      </div>
      <div className="font-semibold text-slate-200">{stat.label}</div>
      {stat.trend && (
        <div className={cn('flex items-center gap-1.5 text-sm', positive ? 'text-emerald-300' : 'text-rose-300')}>
          {stat.trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{stat.trend.note}</span>
        </div>
      )}
    </Card>
  );
}

export interface StatCountersProps {
  /** 3–6 مؤشرات */
  stats: Stat[];
  columns?: 2 | 3;
}

/** النمط 10 — إحصائيات/مؤشرات: عدّادات + أيقونات + وسوم. */
export function StatCounters({ stats, columns = 3 }: StatCountersProps) {
  return (
    <Stagger className={cn('grid h-full content-center gap-4', columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3')}>
      {stats.slice(0, 6).map((s) => (
        <Counter key={s.label} stat={s} />
      ))}
    </Stagger>
  );
}
