import type { Variants } from 'framer-motion';

/** حاوية تُظهر أبناءها تباعاً (stagger). */
export const staggerContainer = (stagger = 0.08, delay = 0.1): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** عنصر يصعد مع تلاشٍ. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/** عنصر يكبر مع تلاشٍ. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

/** انتقال الشاشات حسب الاتجاه (RTL: التالي يأتي من اليسار). */
export const screenVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? -48 : 48, scale: 0.985 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 48 : -48,
    scale: 0.985,
    transition: { duration: 0.25, ease: 'easeIn' },
  }),
};
