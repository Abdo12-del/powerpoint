import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type FancyVariant = 'gradient' | 'outline' | 'glow' | 'shadow3d' | 'emboss';

export interface FancyTextProps {
  children: ReactNode;
  variant?: FancyVariant;
  /** ألوان التدرج أو لون التوهج/الحدود */
  colors?: string[];
  /** تحريك التدرج (gradient فقط) */
  animated?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

const AMBER = ['#fde68a', '#fbbf24', '#f59e0b'];

/** أنماط نص مزخرفة آمنة للعربية (لا letter-spacing ولا مائل اصطناعي ولا تقسيم حروف) */
export function fancyStyle(variant: FancyVariant, colors: string[] = AMBER, animated = false): CSSProperties {
  const [c1 = AMBER[0], c2 = AMBER[1], c3 = AMBER[2]] = colors;
  switch (variant) {
    case 'gradient':
      return {
        backgroundImage: `linear-gradient(90deg, ${c1}, ${c2}, ${c3}, ${c1})`,
        backgroundSize: animated ? '300% 100%' : '100% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      };
    case 'outline':
      return { color: 'transparent', WebkitTextStroke: `1.5px ${c2}`, paintOrder: 'stroke fill' };
    case 'glow':
      return { color: c1, textShadow: `0 0 12px ${c2}, 0 0 32px ${c2}99, 0 0 64px ${c3}66` };
    case 'shadow3d':
      return { color: c1, textShadow: `1px 1px 0 ${c3}, 2px 2px 0 ${c3}, 3px 3px 0 ${c3}, 4px 4px 0 ${c3}, 6px 8px 18px rgba(0,0,0,0.5)` };
    case 'emboss':
      return { color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 0 rgba(255,255,255,0.25), 0 -1px 0 rgba(0,0,0,0.6)' };
  }
}

/**
 * نص مزخرف: تدرج (ثابت/متحرك) | حدود | توهج | ظل ثلاثي | نقش.
 * @example <FancyText as="span" variant="gradient" animated>تخرّج ٢٠٢٦</FancyText>
 */
export function FancyText({ children, variant = 'gradient', colors, animated = false, as: Tag = 'span', className, style }: FancyTextProps) {
  return (
    <Tag
      className={cn('inline-block', variant === 'gradient' && animated && 'animate-gradient', className)}
      style={{ ...fancyStyle(variant, colors, animated), ...style }}
    >
      {children}
    </Tag>
  );
}
