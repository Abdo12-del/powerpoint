import { useCallback, useEffect, useState } from 'react';

/** تبديل ملء الشاشة مع تتبّع الحالة الفعلية للمتصفح. */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    () => typeof document !== 'undefined' && document.fullscreenElement != null,
  );

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement != null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  return { isFullscreen, toggle, supported: typeof document !== 'undefined' && !!document.fullscreenEnabled };
}
