import type { ReactNode } from 'react';
import Tilt from 'react-parallax-tilt';
import { cn } from '@/lib/cn';

export interface TiltCardProps {
  children: ReactNode;
  /** أقصى زاوية ميل بالدرجات */
  maxAngle?: number;
  /** تكبير عند التحويم */
  scale?: number;
  /** لمعة ضوئية خفيفة */
  glare?: boolean;
  className?: string;
}

/**
 * بطاقة تميل مع حركة المؤشر (react-parallax-tilt) — عمق خفيف لبطاقات شاشة العنوان أو الخريطة.
 *
 * @example <TiltCard><Card>…</Card></TiltCard>
 */
export function TiltCard({ children, maxAngle = 8, scale = 1.02, glare = true, className }: TiltCardProps) {
  return (
    <Tilt
      tiltMaxAngleX={maxAngle}
      tiltMaxAngleY={maxAngle}
      scale={scale}
      transitionSpeed={1500}
      glareEnable={glare}
      glareMaxOpacity={0.12}
      glareColor="#fde68a"
      glarePosition="all"
      glareBorderRadius="1rem"
      className={cn('will-change-transform', className)}
    >
      {children}
    </Tilt>
  );
}
