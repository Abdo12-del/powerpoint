import { Suspense, lazy } from 'react';
import type { ParticlesBackgroundProps } from './internal/ParticlesCanvas';
import type { ParticlesPreset } from '@/types/effects';

export type { ParticlesBackgroundProps, ParticlesPreset };

const ParticlesCanvas = lazy(() => import('./internal/ParticlesCanvas'));

/**
 * خلفية جسيمات متحركة (tsParticles — الحزمة الخفيفة slim)، تُحمَّل كسولاً حتى لا تثقل الحزمة الأساسية.
 * تُوضع داخل حاوية `relative`؛ المكوّن نفسه `absolute inset-0` وبلا تفاعل مع المؤشر.
 *
 * الإعدادات المسبقة: 'stars' | 'network' | 'snow' | 'bubbles' | 'fireflies' — أو مرّر `options` كاملة.
 *
 * @example
 * <div className="relative h-full">
 *   <ParticlesBackground preset="stars" />
 *   <div className="relative z-10">…المحتوى…</div>
 * </div>
 */
export function ParticlesBackground(props: ParticlesBackgroundProps) {
  return (
    <Suspense fallback={null}>
      <ParticlesCanvas {...props} />
    </Suspense>
  );
}
