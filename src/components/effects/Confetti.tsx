import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { prefersReducedMotion } from '@/lib/motion-prefs';

import type { ConfettiPreset } from '@/types/effects';

export type { ConfettiPreset };

const DEFAULT_COLORS = ['#fbbf24', '#f59e0b', '#38bdf8', '#a78bfa', '#34d399', '#f8fafc'];
const Z_INDEX = 60; // فوق شريط التحكم (z-40) وتحت نافذة المساعدة (z-50 لا تهم هنا لأنه بلا تفاعل)

export interface ConfettiOptions {
  colors?: string[];
  /** مدة المؤثرات المستمرة (cannons / rain / fireworks) بالمللي ثانية */
  duration?: number;
}

/**
 * يطلق قصاصات احتفالية (canvas-confetti). يحترم prefers-reduced-motion.
 * يعيد دالة إلغاء لإيقاف المؤثرات المستمرة.
 *
 * @example fireConfetti('cannons');            // مدافع من الجانبين لمدة 3 ثوانٍ
 * @example const stop = fireConfetti('rain'); // … لاحقاً stop()
 */
export function fireConfetti(preset: ConfettiPreset = 'burst', options: ConfettiOptions = {}): () => void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return () => undefined;
  const colors = options.colors ?? DEFAULT_COLORS;
  const duration = options.duration ?? 3000;
  const timers: number[] = [];
  const stop = () => timers.forEach((t) => window.clearInterval(t));
  const safe = (opts: confetti.Options) => {
    try {
      void confetti({ colors, zIndex: Z_INDEX, disableForReducedMotion: true, ...opts });
    } catch {
      /* بيئة بلا canvas */
    }
  };

  switch (preset) {
    case 'burst':
      safe({ particleCount: 160, spread: 80, startVelocity: 45, origin: { y: 0.65 } });
      break;

    case 'cannons': {
      const end = Date.now() + duration;
      const t = window.setInterval(() => {
        safe({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
        safe({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
        if (Date.now() > end) window.clearInterval(t);
      }, 50);
      timers.push(t);
      break;
    }

    case 'rain': {
      const end = Date.now() + duration;
      const t = window.setInterval(() => {
        safe({ particleCount: 8, startVelocity: 8, gravity: 0.7, spread: 40, ticks: 300, origin: { x: Math.random(), y: -0.1 }, scalar: 0.9 });
        if (Date.now() > end) window.clearInterval(t);
      }, 120);
      timers.push(t);
      break;
    }

    case 'stars': {
      const base: confetti.Options = { spread: 360, ticks: 60, gravity: 0, decay: 0.94, startVelocity: 30, shapes: ['star'], colors: ['#fde68a', '#fbbf24', '#f59e0b', '#fff7ed'] };
      const shoot = () => {
        safe({ ...base, particleCount: 40, scalar: 1.2 });
        safe({ ...base, particleCount: 12, scalar: 0.75, shapes: ['circle'] });
      };
      [0, 120, 240].forEach((d) => timers.push(window.setTimeout(shoot, d) as unknown as number));
      break;
    }

    case 'fireworks': {
      const end = Date.now() + duration;
      const t = window.setInterval(() => {
        const left = Date.now() - end;
        if (left > 0) return window.clearInterval(t);
        const count = 50 * (-left / duration);
        safe({ particleCount: count, startVelocity: 30, spread: 360, ticks: 60, origin: { x: 0.1 + Math.random() * 0.3, y: Math.random() - 0.2 } });
        safe({ particleCount: count, startVelocity: 30, spread: 360, ticks: 60, origin: { x: 0.6 + Math.random() * 0.3, y: Math.random() - 0.2 } });
      }, 250);
      timers.push(t);
      break;
    }
  }
  return stop;
}

/** يطلق القصاصات عندما تصبح `active` صحيحة (بعد `delay` مللي ثانية). */
export function useConfetti(active: boolean, preset: ConfettiPreset = 'burst', delay = 0, options?: ConfettiOptions) {
  useEffect(() => {
    if (!active) return;
    let stop: () => void = () => undefined;
    const t = window.setTimeout(() => {
      stop = fireConfetti(preset, options);
    }, delay);
    return () => {
      window.clearTimeout(t);
      stop();
    };
    // options كائن — نعتمد على القيم المسطّحة لتجنّب إعادة الإطلاق في كل تصيير
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, preset, delay, options?.duration, options?.colors?.join(',')]);
}

/** مكوّن بلا واجهة: يطلق القصاصات مرة عند الظهور — ضعه في شريحة الشكر مثلاً. */
export function ConfettiOnMount({ preset = 'cannons', delay = 500, options }: { preset?: ConfettiPreset; delay?: number; options?: ConfettiOptions }) {
  useConfetti(true, preset, delay, options);
  return null;
}

export { confetti };
