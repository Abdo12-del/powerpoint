import { useEffect, useRef } from 'react';
import { ensureGlitchStyles, triggerGlitch } from '../effects/glitch';
import gsap from 'gsap';

export function GlitchScene() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ensureGlitchStyles();
    const el = titleRef.current;
    if (!el) return;

    // glitch دوري متزامن مع الإيقاع
    const id = setInterval(() => {
      triggerGlitch(el, 220, 1.2);
    }, 520);

    // اهتزاز خفيف
    const ctx = gsap.context(() => {
      gsap.to(el, { x: 1, duration: 0.04, yoyo: true, repeat: 7, delay: 0.3, ease: 'none' });
    }, el);

    return () => {
      clearInterval(id);
      ctx.revert();
    };
  }, []);

  return (
    <div data-scene="glitch" className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-xs font-bold tracking-[0.35em] text-rose-300">04 — GLITCH</div>
      <h2 ref={titleRef} className="relative mt-2 text-6xl font-black text-white sm:text-7xl" style={{ textShadow: '0 0 20px rgba(251,113,133,0.4)' }}>
        تشويش
      </h2>
      <p data-animate className="mt-2 text-sm text-slate-300">
        RGB split + مسح ضوئي + إزاحة رقمية — كل نبضة تُشوّه الصورة لحظياً.
      </p>

      <div data-animate className="mt-6 flex gap-2">
        {['01', '10', '11', '00'].map((b) => (
          <span key={b} className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-rose-300">
            {b}
          </span>
        ))}
      </div>

      <div className="showreel-scanlines pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <div data-beat className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(251,113,133,0.10),_transparent_60%)]" />
    </div>
  );
}
