import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export interface LenisProviderProps {
  children: React.ReactNode;
  duration?: number;
  smoothWheel?: boolean;
  syncTouch?: boolean;
}

/**
 * مزوّد Lenis — يغلّف كامل الصفحة بحركة انسيابية مع CSS
 * يُستخدم في المختبرات والصفحات الطويلة لتجربة parallax السلس
 */
export function LenisProvider({
  children,
  duration = 1.2,
  smoothWheel = true,
  syncTouch = false,
}: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration,
      smoothWheel,
      syncTouch,
      autoRaf: false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [duration, smoothWheel, syncTouch]);

  return <>{children}</>;
}
