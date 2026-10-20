import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function ParallaxScene() {
  const ref = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      layerRefs.current.forEach((layer, i) => {
        if (!layer) return;
        const depth = (i + 1) * 0.5;
        gsap.to(layer, { x: nx * depth * 50, y: ny * depth * 30, duration: 0.6, ease: 'power2.out' });
      });
    };

    // حركة تلقائية أيضاً
    const auto = gsap.to(layerRefs.current, {
      x: (i) => (i % 2 === 0 ? 10 : -10),
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: 0.1,
    });

    el.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousemove', onMove);
      auto.kill();
    };
  }, []);

  return (
    <div ref={ref} data-scene="parallax" className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-6">
      <div className="text-center">
        <div className="text-xs font-bold tracking-[0.35em] text-violet-300">03 — PARALLAX</div>
        <h2 className="mt-2 text-5xl font-black text-white sm:text-6xl">طبقاتٌ تتنفس</h2>
        <p data-animate className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          كل طبقة بسرعة مختلفة — الخلفية أبطأ، المقدمة أسرع. حرّك المؤشر لترى العمق.
        </p>
      </div>

      <div className="relative mt-8 h-44 w-full max-w-md">
        {[
          { color: '#1e293b', label: 'خلفية', depth: 0.2, scale: 1.15 },
          { color: '#334155', label: 'وسط', depth: 0.5, scale: 1 },
          { color: '#a78bfa', label: 'بطاقة', depth: 0.9, scale: 0.82 },
        ].map((l, i) => (
          <div
            key={l.label}
            ref={(el) => {
              if (el) layerRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/10 p-6 shadow-xl"
            style={{
              background: i === 2 ? `linear-gradient(135deg, ${l.color}, #7c3aed)` : l.color,
              transform: `scale(${l.scale}) translateZ(${l.depth * 60}px)`,
              zIndex: i,
              boxShadow: i === 2 ? '0 20px 50px rgba(0,0,0,0.4)' : undefined,
            }}
          >
            <span className="text-sm font-black text-white">{l.label}</span>
          </div>
        ))}
      </div>

      <div data-beat className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_rgba(167,139,250,0.12),_transparent_60%)]" />
    </div>
  );
}
