import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';

export interface ChartFrameProps {
  /** عنوان يقول «ماذا يُظهر الرسم» بجملة خبرية (مثلاً: «التسجيلات تضاعفت خلال ثلاث سنوات») */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** جملة الخلاصة (so-what) تظهر بعد الرسم بلون التمييز */
  note?: ReactNode;
  /** المصدر/التاريخ بخط صغير */
  source?: ReactNode;
  children: ReactNode;
  className?: string;
  /** تأخير ظهور جملة الخلاصة بالثواني (بعد اكتمال حركة الرسم) */
  noteDelay?: number;
  /** بلا إطار/خلفية (داخل بطاقة أخرى) */
  bare?: boolean;
}

/**
 * إطار موحّد للرسم داخل الشريحة: عنوان خبري ← الرسم ← خلاصة ← مصدر. يحافظ على قاعدة «فكرة واحدة لكل شريحة»:
 * العنوان يحمل الرسالة، والرسم يثبتها، والخلاصة تُغلقها.
 */
export function ChartFrame({ title, subtitle, note, source, children, className, noteDelay = 1.6, bare = false }: ChartFrameProps) {
  const reduced = prefersReducedMotion();
  return (
    <figure
      dir="rtl"
      className={cn('flex w-full flex-col gap-4', !bare && 'rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6', className)}
    >
      {(title || subtitle) && (
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-1"
        >
          {title && <h3 className="text-xl font-bold text-slate-100 md:text-2xl">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </motion.header>
      )}
      <div className="min-w-0">{children}</div>
      {(note || source) && (
        <figcaption className="flex flex-col gap-2">
          {note && (
            <motion.p
              initial={reduced ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: reduced ? 0 : noteDelay }}
              className="rounded-lg border-r-4 border-amber-400 bg-amber-400/10 px-4 py-2 text-base font-semibold text-amber-200"
            >
              {note}
            </motion.p>
          )}
          {source && <p className="text-xs text-slate-500">{source}</p>}
        </figcaption>
      )}
    </figure>
  );
}
