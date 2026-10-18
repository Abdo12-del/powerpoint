import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';

export interface HighlightSweepProps {
  children: ReactNode;
  /** لون التظليل (أي قيمة CSS) */
  color?: string;
  /** ارتفاع التظليل نسبة من السطر 0–100 */
  thickness?: number;
  /** underline = خط سفلي بدل تظليل كامل */
  variant?: 'marker' | 'underline';
  dir?: 'rtl' | 'ltr';
  duration?: number;
  delay?: number;
  className?: string;
}

/**
 * تظليل «قلم فسفوري» يُمسح من جهة البداية (اليمين في RTL) خلف الكلمة المهمة.
 * لا يلمس النص نفسه؛ حركة background-size فقط.
 *
 * @example نسبة النجاح <HighlightSweep>٩٥٪</HighlightSweep>
 */
export function HighlightSweep({
  children,
  color = 'rgba(251, 191, 36, 0.35)',
  thickness = 45,
  variant = 'marker',
  dir = 'rtl',
  duration = 0.7,
  delay = 0.2,
  className,
}: HighlightSweepProps) {
  const reduced = prefersReducedMotion();
  const height = variant === 'underline' ? 12 : thickness;
  return (
    <motion.span
      className={cn('inline rounded-sm px-1 [box-decoration-break:clone]', className)}
      style={{
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: dir === 'rtl' ? '100% 88%' : '0% 88%',
      }}
      initial={{ backgroundSize: `0% ${height}%` }}
      animate={{ backgroundSize: `100% ${height}%` }}
      transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}
