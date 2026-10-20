import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function Transition3DScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-card]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { rotationY: 90, z: -200, opacity: 0 },
        { rotationY: 0, z: 0, opacity: 1, duration: 0.6, stagger: 0.09, ease: 'power3.out' },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} data-scene="transition3d" className="absolute inset-0 flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="text-xs font-bold tracking-[0.35em] text-sky-300">02 — 3D TRANSITIONS</div>
        <h2 className="mt-2 text-5xl font-black text-white sm:text-6xl">عمقٌ يتحرّك</h2>
        <p data-animate className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          انقلابات فراغية بمنظور حقيقي — البطاقات تدور حول محورها مع حفظ الإضاءة والظلال.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3" style={{ perspective: '1000px', perspectiveOrigin: '50% 50%' }}>
        {[
          { title: 'تحليل', color: '#38bdf8', icon: '◈' },
          { title: 'تصميم', color: '#a78bfa', icon: '⬢' },
          { title: 'تنفيذ', color: '#34d399', icon: '⬣' },
        ].map((c) => (
          <div
            key={c.title}
            data-card
            className="flex h-28 w-32 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur"
            style={{ transformStyle: 'preserve-3d', borderTopColor: c.color, borderTopWidth: '3px', boxShadow: `0 12px 30px rgba(0,0,0,0.3), 0 0 20px ${c.color}22` }}
          >
            <div className="text-2xl" style={{ color: c.color }}>
              {c.icon}
            </div>
            <div className="mt-2 text-sm font-black text-white">{c.title}</div>
            <div className="mt-1 h-1 w-8 rounded-full" style={{ background: c.color }} />
          </div>
        ))}
      </div>

      <div data-beat className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.10),_transparent_60%)]" />
    </div>
  );
}
