import { useRef, type TouchEvent } from 'react';
import { SWIPE_THRESHOLD } from '@/config/controls';

/**
 * تنقّل باللمس: في اتجاه RTL المحتوى التالي يقع على اليسار،
 * لذا السحب نحو اليسار = التالي، ونحو اليمين = السابق.
 */
export function useSwipe(onNext: () => void, onPrev: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start.current = t ? { x: t.clientX, y: t.clientY } : null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const s = start.current;
    start.current = null;
    const t = e.changedTouches[0];
    if (!s || !t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onNext();
    else onPrev();
  };

  return { onTouchStart, onTouchEnd };
}
