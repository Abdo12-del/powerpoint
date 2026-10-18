import { Suspense, lazy } from 'react';
import type { LottiePlayerProps } from './internal/LottieCanvas';
import { cn } from '@/lib/cn';

export type { LottiePlayerProps };

const LottieCanvas = lazy(() => import('./internal/LottieCanvas'));

/**
 * مشغّل Lottie (lottie-react / lottie-web) — رسوم متجهة من After Effects أو LottieFiles.
 * يُحمَّل كسولاً (lottie-web ≈ 300KB) فلا يثقل العروض التي لا تستعمله.
 * ضع ملفات .json في `src/assets/lottie/` واستوردها؛ يعمل دون اتصال.
 *
 * للاستعمال المتقدم (تحكم بالتشغيل، شرائح الإطارات…): `import { Lottie, useLottie } from 'lottie-react'`.
 *
 * @example
 * import celebrate from '@/assets/lottie/celebrate.json';
 * <LottiePlayer src={celebrate} className="h-64 w-64" />
 */
export function LottiePlayer(props: LottiePlayerProps) {
  return (
    <Suspense fallback={<div className={cn('h-48 w-48', props.className)} aria-hidden />}>
      <LottieCanvas {...props} />
    </Suspense>
  );
}
