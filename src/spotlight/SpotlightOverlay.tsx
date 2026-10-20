import { useEffect, useRef } from 'react';
import { LaserTrail, spotlightBackground } from './engine';
import { LASER_COLOR, SPOTLIGHT_DIM, SPOTLIGHT_MAX_RADIUS, SPOTLIGHT_MIN_RADIUS } from './types';
import type { SpotlightController } from './useSpotlight';

export interface SpotlightOverlayProps {
  spot: SpotlightController;
  variant?: 'fixed' | 'contained';
}

/**
 * طبقات التركيز: تسليط الضوء (عتمة بفتحة دائرية تتبع المؤشر)
 * ومؤشر الليزر (رأس متوهّج وذيل متلاشٍ) — بلا اعتراض أي نقرة:
 * pointer-events:none فتبقى الشرائح والسبورة تعملان تحتها.
 */
export function SpotlightOverlay({ spot, variant = 'fixed' }: SpotlightOverlayProps) {
  const spotRef = useRef<HTMLDivElement>(null);
  const laserCanvasRef = useRef<HTMLCanvasElement>(null);

  // ── تسليط الضوء: تحديث مباشر للنمط بلا إعادة رسم React ──
  useEffect(() => {
    if (!spot.spotlightOn) return;
    const el = spotRef.current;
    if (!el) return;

    const apply = (x: number, y: number) => {
      el.style.background = spotlightBackground(x, y, spot.spotlightRadius, SPOTLIGHT_DIM);
    };

    const rect = el.getBoundingClientRect();
    apply(rect.width / 2, rect.height / 2);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      apply(e.clientX - r.left, e.clientY - r.top);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [spot.spotlightOn, spot.spotlightRadius]);

  // ── الليزر: مسار متلاشٍ على قماش شفاف ──
  useEffect(() => {
    if (!spot.laserOn) return;
    const canvas = laserCanvasRef.current;
    if (!canvas) return;
    const trail = new LaserTrail(LASER_COLOR);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      trail.push(e.clientX - r.left, e.clientY - r.top);
    };
    window.addEventListener('pointermove', onMove);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const ctx = canvas.getContext('2d');
      if (!ctx) return; // بلا رسم — صمت (jsdom)
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width !== 0 && (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr))) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      trail.decay(dt);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      trail.draw(ctx);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [spot.laserOn]);

  if (!spot.spotlightOn && !spot.laserOn) return null;

  const wrap = variant === 'fixed' ? 'fixed inset-0' : 'absolute inset-0';

  return (
    <div data-testid="spotlight-overlay" className={`pointer-events-none ${wrap}`} style={{ zIndex: 75 }}>
      {spot.spotlightOn && (
        <div
          ref={spotRef}
          data-testid="spotlight-spot"
          className="absolute inset-0"
          data-radius={spot.spotlightRadius}
        />
      )}
      {spot.laserOn && (
        <canvas
          ref={laserCanvasRef}
          data-testid="laser-canvas"
          data-color={LASER_COLOR}
          className="absolute inset-0 h-full w-full"
        />
      )}
      {/* شارة الحالة + تلميح الضبط */}
      <div
        data-testid="spotlight-badge"
        className="absolute end-3 top-3 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur"
      >
        {spot.spotlightOn && (
          <span>
            تسليط ضوء — <span className="font-mono text-amber-300" data-testid="spotlight-radius-badge">{spot.spotlightRadius}px</span>
            <span className="text-slate-400"> (العجلة لضبط الحجم)</span>
          </span>
        )}
        {spot.laserOn && <span className="font-bold" style={{ color: LASER_COLOR }}>● مؤشر ليزر</span>}
      </div>
      {/* تقييد نصف القطر لأغراض العرض */}
      <span className="hidden">
        {SPOTLIGHT_MIN_RADIUS}-{SPOTLIGHT_MAX_RADIUS}
      </span>
    </div>
  );
}
