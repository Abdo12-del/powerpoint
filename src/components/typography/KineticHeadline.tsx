import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';

export interface KineticHeadlineProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  stagger?: number;
  /** وزن البداية والنهاية (خط متغيّر) */
  fromWeight?: number;
  toWeight?: number;
  /** كلمات تُبرز بلون التمييز (مطابقة تامة) */
  highlight?: string[];
  highlightClassName?: string;
}

/**
 * عنوان حركي: الكلمات تدخل تباعاً (صعود + إزالة ضبابية) بينما ينمو وزن الخط المتغيّر من خفيف إلى ثقيل.
 * القاعدة: التقسيم بالكلمات فقط — الحرف العربي لا يُفصل عن جاره أبداً.
 *
 * @example <KineticHeadline as="h1" text="نظام معلوماتي لتسيير المطاعم" highlight={['المطاعم']} />
 */
export function KineticHeadline({
  text,
  as = 'h2',
  className,
  delay = 0.1,
  stagger = 0.09,
  fromWeight = 300,
  toWeight = 800,
  highlight = [],
  highlightClassName = 'text-amber-300',
}: KineticHeadlineProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const reduced = prefersReducedMotion();
  const Tag = motion[as];
  const word: Variants = {
    hidden: { opacity: 0, y: '0.5em', filter: 'blur(8px)', fontVariationSettings: `"wght" ${fromWeight}` },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      fontVariationSettings: `"wght" ${toWeight}`,
      transition: { duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };
  return (
    <Tag
      className={cn('font-heading', className)}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: reduced ? 0 : delay } } }}
      aria-label={text}
      style={{ fontWeight: toWeight }}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block whitespace-pre">
          <motion.span className={cn('inline-block', highlight.includes(w) && highlightClassName)} variants={word}>
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
