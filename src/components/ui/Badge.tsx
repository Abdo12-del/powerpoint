import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'border-white/15 bg-white/10 text-slate-100',
  accent: 'border-amber-400/40 bg-amber-400/15 text-amber-200',
  success: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
  warning: 'border-orange-400/40 bg-orange-400/15 text-orange-200',
  danger: 'border-rose-400/40 bg-rose-400/15 text-rose-200',
  info: 'border-sky-400/40 bg-sky-400/15 text-sky-200',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  /** للمعرفات والشفرة: يفرض اتجاه LTR وخطاً أحادي المسافة */
  mono?: boolean;
}

/** شارة صغيرة — قاعدة §9.4: كل رقم أو مصطلح تقني يُبرز ولا يُكتب في نص سائب. */
export function Badge({ children, tone = 'neutral', className, mono }: BadgeProps) {
  return (
    <span
      dir={mono ? 'ltr' : undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-semibold leading-6',
        mono && 'font-mono text-[0.8em] tracking-tight',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** رقم مُبرز داخل الجملة: <Num>23 دقيقة</Num> */
export function Num({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('mx-0.5 rounded-md bg-amber-400/15 px-1.5 font-bold text-amber-200 tabular-nums', className)}>
      {children}
    </span>
  );
}

/** مصطلح تقني/معرّف داخل الجملة (LTR + mono): <Term>MERISE</Term> */
export function Term({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code
      dir="ltr"
      className={cn('mx-0.5 rounded-md border border-white/10 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[0.85em] text-sky-200', className)}
    >
      {children}
    </code>
  );
}
