import { motion } from 'framer-motion';
import type { EquationRevealProps } from './types';
import { MathBlock } from './MathFormula';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { cn } from '@/lib/cn';

/** Reveal a derivation one formula at a time while keeping each equation LTR-isolated. */
export function EquationReveal({
  steps,
  className,
  ariaLabel = 'خطوات اشتقاق المعادلة',
  initialDelay = 0.12,
  stagger = 0.52,
}: EquationRevealProps) {
  const reducedMotion = prefersReducedMotion();
  if (steps.length === 0) return null;

  return (
    <ol dir="rtl" aria-label={ariaLabel} className={cn('relative space-y-3 border-r border-white/10 pr-5', className)}>
      {steps.map((step, index) => (
        <motion.li
          key={step.id ?? `${index}-${step.tex}`}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.42, delay: reducedMotion ? 0 : initialDelay + index * stagger }}
          className="relative rounded-xl border border-white/10 bg-slate-950/45 p-4 shadow-sm shadow-black/10"
        >
          <span
            aria-hidden="true"
            className="absolute -right-[1.66rem] top-5 size-2.5 rounded-full border-2 border-slate-950 bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.38)]"
          />
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-200">
            <span className="rounded-full bg-amber-300/10 px-2 py-0.5">{step.label ?? `الخطوة ${index + 1}`}</span>
          </div>
          <MathBlock tex={step.tex} className="max-w-full overflow-x-auto text-xl text-slate-100 md:text-2xl" />
          {step.note && <p dir="rtl" className="mt-2 text-sm leading-7 text-slate-400">{step.note}</p>}
        </motion.li>
      ))}
    </ol>
  );
}
