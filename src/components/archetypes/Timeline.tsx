import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Stagger, fadeUp } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface TimelineItem {
  /** السنة / التوقيت / اسم المرحلة */
  label: string;
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  /** إبراز المحطة الحالية/الحرجة */
  highlight?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'horizontal' | 'vertical';
}

/** النمط 3 — خط زمني: التاريخ، المراحل، الإصدارات. */
export function Timeline({ items, orientation = 'horizontal' }: TimelineProps) {
  if (orientation === 'vertical') {
    return (
      <Stagger className="relative mx-auto flex max-w-3xl flex-col gap-6 ps-10">
        <span className="absolute inset-y-2 start-[15px] w-0.5 bg-gradient-to-b from-amber-400/60 via-white/15 to-transparent" />
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <motion.div key={it.label + it.title} variants={fadeUp} className="relative">
              <span
                className={cn(
                  'absolute -start-10 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-slate-950',
                  it.highlight ? 'border-amber-400 text-amber-300' : 'border-white/30 text-slate-300',
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
              <div className="text-sm font-bold text-amber-300 tabular-nums">{it.label}</div>
              <div className="text-xl font-bold">{it.title}</div>
              {it.description && <p className="mt-1 text-slate-300">{it.description}</p>}
            </motion.div>
          );
        })}
      </Stagger>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center">
      <Stagger className="relative grid gap-6" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        <span className="absolute inset-x-6 top-5 h-0.5 bg-gradient-to-l from-transparent via-white/25 to-transparent" />
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.div key={it.label + it.title} variants={fadeUp} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-slate-950 font-bold tabular-nums',
                  it.highlight ? 'border-amber-400 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.35)]' : 'border-white/30 text-slate-200',
                )}
              >
                {Icon ? <Icon className="h-5 w-5" /> : i + 1}
              </span>
              <div className="mt-3 text-sm font-bold text-amber-300 tabular-nums">{it.label}</div>
              <div className="mt-1 text-lg font-bold leading-snug">{it.title}</div>
              {it.description && <p className="mt-1 text-sm leading-relaxed text-slate-300">{it.description}</p>}
            </motion.div>
          );
        })}
      </Stagger>
    </div>
  );
}
