/**
 * مصدر: motion-primitives (MIT) — components/core/text-shimmer.tsx @ 120f64f
 * تكييف: framer-motion، cn من @/lib/cn، القالب داكن دائماً (ألوان dark: صارت الافتراضية)،
 * motion.create مرفوع إلى useMemo (كان يُنشأ كل تصيير)، وخيار sweep لاتجاه اللمعة (الافتراضي من اليمين إلى اليسار للعربية).
 * اللمعة على الخلفية المقصوصة بالنص (bg-clip-text) — النص كتلة واحدة، لا تفكيك.
 */
import React, { useMemo, type JSX } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type TextShimmerProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
  /** اتجاه مرور اللمعة */
  sweep?: 'rtl' | 'ltr';
};

function TextShimmerComponent({ children, as: Component = 'p', className, duration = 2, spread = 2, sweep = 'rtl' }: TextShimmerProps) {
  const MotionComponent = useMemo(() => motion.create(Component as keyof JSX.IntrinsicElements), [Component]);

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  const from = sweep === 'rtl' ? '0% center' : '100% center';
  const to = sweep === 'rtl' ? '100% center' : '0% center';

  return (
    <MotionComponent
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
        'text-transparent [--base-color:#71717a] [--base-gradient-color:#ffffff]',
        '[background-repeat:no-repeat,padding-box] [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]',
        className,
      )}
      initial={{ backgroundPosition: from }}
      animate={{ backgroundPosition: to }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={
        {
          '--spread': `${dynamicSpread}px`,
          backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
