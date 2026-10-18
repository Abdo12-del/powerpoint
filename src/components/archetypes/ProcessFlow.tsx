import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Stagger, fadeUp, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface ProcessStep {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  /** مدة أو قيمة مُبرزة: «4 د» */
  meta?: string;
  /** إبراز الخطوة الحرجة (عنق الزجاجة) */
  highlight?: boolean;
}

export interface ProcessFlowProps {
  /** 3–7 خطوات */
  steps: ProcessStep[];
}

/** النمط 6 — سير إجراء: خطوات مرقّمة على مسار (1 → 2 → 3…). */
export function ProcessFlow({ steps }: ProcessFlowProps) {
  return (
    <div className="flex h-full items-center">
      <Stagger className="grid w-full gap-y-6 md:grid-flow-col md:auto-cols-fr md:gap-x-3">
        {steps.slice(0, 7).map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.title} variants={fadeUp} className="relative flex md:flex-col md:items-center md:text-center">
              {i < steps.length - 1 && (
                <ChevronLeft
                  aria-hidden
                  className="absolute end-0 top-7 hidden h-6 w-6 -translate-x-1/2 text-white/30 md:block"
                />
              )}
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 text-xl font-black tabular-nums',
                  s.highlight
                    ? 'border-amber-400 bg-amber-400/15 text-amber-200 shadow-[0_0_28px_rgba(251,191,36,0.3)]'
                    : 'border-white/20 bg-white/[0.05] text-slate-100',
                )}
              >
                {Icon ? <Icon className="h-6 w-6" /> : i + 1}
              </div>
              <div className="ms-4 min-w-0 md:ms-0 md:mt-3">
                <div className="flex items-center gap-2 md:flex-col md:gap-1">
                  <span className="text-xs font-bold text-amber-300 tabular-nums">الخطوة {i + 1}</span>
                  {s.meta && (
                    <Badge tone={s.highlight ? 'warning' : 'neutral'} className="text-xs">
                      {s.meta}
                    </Badge>
                  )}
                </div>
                <div className="text-lg font-bold leading-snug">{s.title}</div>
                {s.description && <p className="mt-1 text-sm leading-relaxed text-slate-300">{s.description}</p>}
              </div>
            </motion.div>
          );
        })}
      </Stagger>
    </div>
  );
}
