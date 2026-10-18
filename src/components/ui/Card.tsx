import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { fadeUp } from './motion';

type CardProps = HTMLMotionProps<'div'> & {
  /** إبراز البطاقة بلون التمييز */
  highlight?: boolean;
  /** بدون أنيميشن (داخل حاويات مخصّصة) */
  still?: boolean;
};

/** بطاقة زجاجية — الوحدة البنائية الأساسية لكل كتل المحتوى. */
export function Card({ className, highlight, still, children, ...rest }: CardProps) {
  return (
    <motion.div
      variants={still ? undefined : fadeUp}
      className={cn(
        'rounded-2xl border bg-white/[0.04] p-5 shadow-lg shadow-black/20 backdrop-blur-sm',
        highlight ? 'border-amber-400/40 bg-amber-400/[0.06]' : 'border-white/10',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
