import { Lottie } from 'lottie-react';
import { cn } from '@/lib/cn';

export interface LottiePlayerProps {
  /** مسار/رابط ملف JSON أو كائن الأنيميشن نفسه (import anim from './anim.json') */
  src: string | object;
  /** false = مرة واحدة، true = للأبد، رقم = عدد التكرارات */
  loop?: boolean | number;
  autoplay?: boolean;
  /** سرعة التشغيل (1 = الأصلية) */
  speed?: number;
  className?: string;
}

/** التنفيذ الفعلي لمشغّل Lottie — لا تستورده مباشرة؛ استعمل LottiePlayer (كسول). */
export default function LottieCanvas({ src, loop = true, autoplay = true, speed = 1, className }: LottiePlayerProps) {
  return <Lottie src={src} loop={loop} autoplay={autoplay} speed={speed} className={cn('h-48 w-48', className)} />;
}
