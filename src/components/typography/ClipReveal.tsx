import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';

export type ClipDirection = 'start' | 'end' | 'up' | 'down';

export interface ClipRevealProps {
  children: ReactNode;
  /** start = من جهة البداية (اليمين في RTL) — الافتراضي الصحيح للعربية */
  direction?: ClipDirection;
  dir?: 'rtl' | 'ltr';
  duration?: number;
  delay?: number;
  as?: 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}

/** قيمة clip-path الابتدائية (مخفية) حسب الاتجاه */
export function clipStart(direction: ClipDirection, dir: 'rtl' | 'ltr' = 'rtl'): string {
  const fromRight = (direction === 'start') === (dir === 'rtl');
  switch (direction) {
    case 'up':
      return 'inset(100% 0 0 0)';
    case 'down':
      return 'inset(0 0 100% 0)';
    default:
      return fromRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
  }
}

/**
 * كشف بقناع (clip-path) — النص لا يتحرك ولا يُقسَّم؛ يُكشف كتلةً واحدة من جهة البداية.
 * مناسب للعناوين الطويلة والخطوط النسخية التي تتشوّه عند تقسيمها.
 *
 * @example <ClipReveal as="h2" direction="start">عنوان يُكشف من اليمين</ClipReveal>
 */
export function ClipReveal({ children, direction = 'start', dir = 'rtl', duration = 0.8, delay = 0, as = 'span', className }: ClipRevealProps) {
  const Tag = motion[as];
  const reduced = prefersReducedMotion();
  return (
    <Tag
      className={cn('inline-block', className)}
      initial={{ clipPath: clipStart(direction, dir) }}
      animate={{ clipPath: 'inset(0 0 0 0)' }}
      transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </Tag>
  );
}
