import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export interface UseLenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  smoothWheel?: boolean;
  syncTouch?: boolean;
  autoStart?: boolean;
}

/**
 * خطاف Lenis للحركة الانسيابية — يربط Lenis بـ rAF ويوفّر تحكماً كاملاً
 */
export function useLenis(options: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  const {
    duration = 1.0,
    easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel = true,
    syncTouch = false,
    autoStart = true,
  } = options;

  useEffect(() => {
    const lenis = new Lenis({
      duration,
      easing,
      smoothWheel,
      syncTouch,
      autoRaf: false,
    });

    lenisRef.current = lenis;

    if (autoStart) {
      const raf = (time: number) => {
        lenis.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      };
      rafRef.current = requestAnimationFrame(raf);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [duration, easing, smoothWheel, syncTouch, autoStart]);

  return lenisRef;
}

export function useLenisScroll(callback: (e: { scroll: number; progress: number; velocity: number }) => void) {
  const lenisRef = useLenis({ autoStart: true });

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const handler = () => {
      callback({
        scroll: lenis.scroll,
        progress: lenis.progress,
        velocity: lenis.velocity,
      });
    };

    lenis.on('scroll', handler);
    return () => {
      lenis.off('scroll', handler);
    };
  }, [callback, lenisRef]);

  return lenisRef;
}
