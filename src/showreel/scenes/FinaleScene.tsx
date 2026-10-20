import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function FinaleScene({ brand, tagline }: { brand: string; tagline: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const title = el.querySelector<HTMLElement>('[data-title]');
    const line = el.querySelector<HTMLElement>('[data-line]');
    const ctx = gsap.context(() => {
      if (title) {
        const words = title.querySelectorAll<HTMLElement>('[data-word]');
        gsap.fromTo(words, { y: 40, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)' });
      }
      if (line) {
        gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out', delay: 0.6 });
      }
      gsap.fromTo(el.querySelectorAll<HTMLElement>('[data-badge]'), { scale: 0, rotation: -12 }, { scale: 1, rotation: 0, duration: 0.4, stagger: 0.06, ease: 'back.out(2)', delay: 0.8 });
    }, el);
    return () => ctx.revert();
  }, [brand, tagline]);

  return (
    <div ref={ref} data-scene="finale" className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.45)]">
          ◈
        </div>

        <h2 data-title className="mt-4 flex flex-wrap justify-center gap-x-3 text-4xl font-black leading-none">
          {brand.split(/\s+/).map((w) => (
            <span key={w} data-word className="bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-transparent inline-block">
              {w}
            </span>
          ))}
        </h2>

        <p data-animate className="mt-3 text-base text-slate-300">
          {tagline}
        </p>

        <div data-line className="mx-auto mt-4 h-1 w-24 origin-center rounded-full bg-gradient-to-l from-amber-400 to-transparent" style={{ transformOrigin: 'center' }} />

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {['Kinetic', '3D', 'Parallax', 'Glitch', 'Morph', 'Particles'].map((b) => (
            <span key={b} data-badge className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white">
              {b}
            </span>
          ))}
        </div>
      </div>

      <p data-animate className="mt-4 text-xs text-slate-500">
        Motion Canvas + GSAP · 15 ثانية · تزامن مع الموسيقى · تنسيق بصري جريء
      </p>

      <div data-beat className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.10),_transparent_65%)]" />
    </div>
  );
}
