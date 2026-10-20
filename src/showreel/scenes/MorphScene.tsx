import { useEffect, useRef, useState } from 'react';
import { MORPH_SHAPES, startMorphLoop } from '../effects/morph';

export function MorphScene() {
  const pathRef = useRef<SVGPathElement>(null);
  const [label, setLabel] = useState(MORPH_SHAPES[0].label);

  useEffect(() => {
    if (!pathRef.current) return;
    const stop = startMorphLoop(pathRef.current, MORPH_SHAPES, 650, 700, (shape) => setLabel(shape.label));
    return stop;
  }, []);

  return (
    <div data-scene="morph" className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-xs font-bold tracking-[0.35em] text-emerald-300">05 — MORPHING</div>
      <h2 className="mt-2 text-5xl font-black text-white sm:text-6xl">تحوّلٌ سلس</h2>
      <p data-animate className="mt-2 text-sm text-slate-300">
        الأشكال تتحول بسلاسة — دائرة → مربع → مثلث → نجمة، مع انتقال لوني متزامن.
      </p>

      <div className="relative mt-6 flex flex-col items-center gap-3">
        <svg width={160} height={160} viewBox="0 0 100 100" className="overflow-visible drop-shadow-[0_10px_30px_rgba(52,211,153,0.3)]">
          <path ref={pathRef} d={MORPH_SHAPES[0].path} fill={MORPH_SHAPES[0].color} />
        </svg>
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">{label}</span>
      </div>

      <div data-animate className="mt-4 flex gap-1.5">
        {MORPH_SHAPES.map((s) => (
          <span key={s.id} className="h-2 w-6 rounded-full" style={{ background: s.color, opacity: 0.9 }} title={s.label} />
        ))}
      </div>

      <div data-beat className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(52,211,153,0.10),_transparent_60%)]" />
    </div>
  );
}
