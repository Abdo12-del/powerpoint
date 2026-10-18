import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface WordRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

/**
 * كشف النص كلمةً كلمة.
 * قاعدة §9.5: لا يُقسَّم النص العربي إلى حروف أبداً (يكسر اتصال الحروف وتشكيلها)؛
 * التقسيم بالكلمات فقط، وكل كلمة تبقى كتلة واحدة متصلة.
 */
export function WordReveal({ text, className, delay = 0.1, stagger = 0.06, as = 'span' }: WordRevealProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const Tag = motion[as];
  return (
    <Tag
      className={cn('inline', className)}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block whitespace-pre">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: '0.4em', filter: 'blur(6px)' },
              show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
