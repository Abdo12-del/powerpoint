import { useEffect, useRef } from 'react';
import { ParticleSystem } from '../effects/particles';

export function ParticleScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<ParticleSystem | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const sys = new ParticleSystem(canvasRef.current);
    systemRef.current = sys;
    sys.start();

    // انفجارات متزامنة مع الإيقاع
    const interval = setInterval(() => sys.pulse(1), 480);
    const burst = setInterval(() => sys.burst(10), 280);

    // تفاعل مع الحركة
    const canvas = canvasRef.current;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      sys.emit(e.clientX - rect.left, e.clientY - rect.top, '#fbbf24', 2);
    };
    canvas.addEventListener('mousemove', onMove);

    return () => {
      clearInterval(interval);
      clearInterval(burst);
      canvas.removeEventListener('mousemove', onMove);
      sys.dispose();
    };
  }, []);

  return (
    <div data-scene="particles" className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
      <canvas ref={canvasRef} className="pointer-events-auto absolute inset-0 h-full w-full" style={{ width: '100%', height: '100%' }} />

      <div className="relative z-10">
        <div className="text-xs font-bold tracking-[0.35em] text-pink-300">06 — PARTICLES</div>
        <h2 className="mt-2 text-5xl font-black text-white sm:text-6xl">انفجارٌ مضيء</h2>
        <p data-animate className="mx-auto mt-2 max-w-xl text-sm text-slate-200">
          جسيمات تتفجر مع كل نبضة موسيقية — حرّك المؤشر لتوليد المزيد من الشرارات.
        </p>

        <div data-animate className="mx-auto mt-6 flex max-w-md justify-center gap-2">
          {[
            { n: '128', l: 'جسيم/ثا' },
            { n: '60fps', l: 'سلاسة' },
            { n: 'BPM 128', l: 'تزامن' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="text-lg font-black text-white">{s.n}</div>
              <div className="text-xs text-white/70">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div data-beat className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(244,114,182,0.08),_transparent_60%)]" />
    </div>
  );
}
