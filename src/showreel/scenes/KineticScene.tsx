import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function KineticScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>('[data-word]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { y: 40, opacity: 0, scale: 0.8, rotationX: -18 },
        { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(1.6)' },
      );
      // نبض الوزن (variable font simulation via scaleY + weight)
      gsap.to(words, {
        scaleY: 1.08,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        stagger: 0.04,
        delay: 0.6,
        ease: 'power2.inOut',
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} data-scene="kinetic" className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-2">
        <div className="text-xs font-bold tracking-[0.35em] text-amber-300">01 — KINETIC TYPOGRAPHY</div>
        <h2 className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-5xl font-black leading-none sm:text-7xl">
          {['حروفٌ', 'تتنفّس', 'وزناً'].map((w, i) => (
            <span
              key={w}
              data-word
              className={i === 1 ? 'bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent' : 'text-white'}
              style={{ display: 'inline-block', transformOrigin: '50% 100%' }}
            >
              {w}
            </span>
          ))}
        </h2>
        <p data-animate className="mx-auto max-w-xl pt-2 text-sm text-slate-300">
          الكلمات لا تُقسَّم إلى حروف — تتحرك كتلةً واحدة بسلاسة، مع تغير وزن الخط (wght) وتوهج ذهبي.
        </p>
      </div>

      {/* شريط كلمات متحركة */}
      <div data-animate className="mt-8 flex gap-2 overflow-hidden rounded-full bg-white/5 px-4 py-2">
        {['تصميم', 'حركة', 'إيقاع', 'لون'].map((w) => (
          <span key={w} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {w}
          </span>
        ))}
      </div>

      <div data-beat className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.12),_transparent_60%)]" />
    </div>
  );
}
