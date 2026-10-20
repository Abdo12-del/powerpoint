import { useRef, useState } from 'react';
import { useThreeScene } from '@/effects/three/useThreeScene';
import { DistillStage } from '../effects3d/DistillStage';
import { isWebGLAvailable } from '@/effects/webgl';

/**
 * مشهد التقطير — ثلاثي الأبعاد (Three.js)
 * كتلة بحث كثيفة تتقلص وتبلور حولها بلورات نقاء وقطرات تتساقط بالنبض
 * بلا WebGL: بطاقة CSS تحمل نفس الاستعارة
 */
export function DistillScene({ active, bpm }: { active: boolean; bpm: number }) {
  const [ok] = useState(() => isWebGLAvailable());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<DistillStage | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  useThreeScene(canvasRef, {
    onInit: ({ renderer }) => {
      const stage = new DistillStage(bpmRef.current);
      stageRef.current = stage;
      stage.play();

      const onPointer = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        stage.setPointer(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -(((e.clientY - rect.top) / rect.height) * 2 - 1),
        );
      };
      window.addEventListener('pointermove', onPointer);
    },
    onFrame: () => {
      const stage = stageRef.current;
      if (!stage) return;
      stage.setBpm(bpmRef.current);
      // نُحدّث فقط عندما يكون المشهد حياً — توفير كامل خارج نافذته
      if (activeRef.current) stage.update();
    },
  });

  return (
    <div data-scene="distill" className="absolute inset-0">
      {ok ? (
        <canvas ref={canvasRef} className="block h-full w-full" />
      ) : (
        /* بديل CSS بنفس الاستعارة */
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.16),transparent_65%)]">
          <div className="flex items-center gap-4 text-4xl" dir="ltr">
            <span className="opacity-90">⬗</span>
            <span className="text-teal-300">→</span>
            <span className="drop-shadow-[0_0_18px_rgba(45,212,191,0.6)]">✦</span>
          </div>
          <p className="text-xs text-slate-500">(بديل CSS — WebGL غير متوفر)</p>
        </div>
      )}

      {/* الطبقة التوضيحية فوق المشهد */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 px-6 text-center">
        <p data-caption className="text-lg font-black text-white">
          الكثافة <span className="text-sky-300">تتحوّل</span> إلى نقاء
        </p>
        {/* مقياس النقاء */}
        <div data-beat className="h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
          <div data-purity className="h-full w-full origin-right rounded-full bg-gradient-to-l from-teal-300 to-sky-500" />
        </div>
        <div className="flex gap-2">
          {['كثافة', 'تقطير', 'نقاء'].map((s) => (
            <span key={s} data-step className="rounded-full bg-sky-400/15 px-3 py-1 text-[11px] font-bold text-sky-200">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
