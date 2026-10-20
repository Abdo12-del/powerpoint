import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { useThreeScene } from './three/useThreeScene';
import { ShowreelStage, DEFAULT_STAGE_EFFECTS } from './three/ShowreelStage';
import type { StageEffects } from './three/ShowreelStage';
import { CinemaPass } from './materials/CinemaPass';
import { shotAt, SHOWREEL_LOOP_DURATION } from './beat';
import { isWebGLAvailable } from './webgl';

export interface ThreeShowreelHandle {
  captureFrame: () => string | undefined;
  setBpm: (bpm: number) => void;
}

export interface ThreeShowreelProps {
  brand?: string;
  tagline?: string;
  bpm?: number;
  height?: string;
  className?: string;
  effects?: Partial<StageEffects>;
  autoPlay?: boolean;
}

type EffectKey = keyof StageEffects;

const EFFECT_LABELS: Record<EffectKey, string> = {
  glitch: 'Glitch',
  bloom: 'Bloom',
  grain: 'Grain',
  rgbShift: 'RGB Shift',
  vignette: 'Vignette',
};

const SHOT_LABELS: Record<string, string> = {
  shapes: 'الأشكال العائمة',
  morph: 'التحوّل',
  storm: 'عاصفة الجسيمات',
  finale: 'الختام',
};

/**
 * الشورييل السينمائي ثلاثي الأبعاد — Three.js + EffectComposer
 * مشاهد موشن جرافيك جريئة: أشكال معدنية بظلال ناعمة، Morphing، Particles،
 * تشوهات بصرية (Glitch/RGB/Grain/Vignette)، انتقالات ديناميكية بين المقاطع،
 * وتزامن كامل مع الإيقاع (BeatClock) — مع بديل CSS آمن عند غياب WebGL
 */
export const ThreeShowreel = forwardRef<ThreeShowreelHandle, ThreeShowreelProps>(function ThreeShowreel(
  {
    brand = 'CINEMATIC',
    tagline = 'MOTION IN THREE DIMENSIONS',
    bpm = 128,
    height = '520px',
    className,
    effects,
    autoPlay = true,
  },
  ref,
) {
  const [webglOk] = useState(() => isWebGLAvailable());
  const stageRef = useRef<ShowreelStage | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const cinemaRef = useRef<CinemaPass | null>(null);
  const bloomRef = useRef<UnrealBloomPass | null>(null);
  const playingRef = useRef(autoPlay);
  const effRef = useRef<StageEffects>({ ...DEFAULT_STAGE_EFFECTS, ...effects });
  effRef.current = { ...DEFAULT_STAGE_EFFECTS, ...effects };
  const badgeTimeRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [shotId, setShotId] = useState<string>('shapes');
  const [eff, setEff] = useState<StageEffects>({ ...DEFAULT_STAGE_EFFECTS, ...effects });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useThreeScene(canvasRef, {
    onInit: ({ camera, renderer }) => {
      const stage = new ShowreelStage(bpm);
      stageRef.current = stage;
      if (autoPlay) stage.play();

      // ── خط المعالجة اللاحقة: رسم → توهج → مرور سينمائي → إخراج ──
      const composer = new EffectComposer(renderer);
      composer.setSize(renderer.domElement.clientWidth || 1280, renderer.domElement.clientHeight || 720);
      composer.addPass(new RenderPass(stage.scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(1280, 720), 0.55, 0.45, 0.85);
      composer.addPass(bloom);
      const cinema = new CinemaPass();
      composer.addPass(cinema);
      composer.addPass(new OutputPass());
      composerRef.current = composer;
      bloomRef.current = bloom;
      cinemaRef.current = cinema;

      // بارالاكس المؤشر
      const onPointer = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        stage.setPointer(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -(((e.clientY - rect.top) / rect.height) * 2 - 1),
        );
      };
      window.addEventListener('pointermove', onPointer);

      // مزامنة حجم الـ composer مع الحاوية
      const onResize = () => {
        const w = renderer.domElement.clientWidth;
        const h = renderer.domElement.clientHeight;
        if (w === 0 || h === 0) return;
        composer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);
    },
    onFrame: ({ delta }) => {
      const stage = stageRef.current;
      const composer = composerRef.current;
      const cinema = cinemaRef.current;
      if (!stage || !composer || !cinema) return;

      if (playingRef.current) {
        const info = stage.update();
        const beatEnv = stage.beat.envAt(info.time);
        cinema.setTime(info.time);
        cinema.decayPulse(delta, 3.0);
        cinema.uniforms['uPulse'].value = Math.max(
          cinema.uniforms['uPulse'].value as number,
          beatEnv * 0.35,
        );
        // الغليتش يتصاعد عند انتقال المقاطع + رعشة خفيفة مع الإيقاع
        cinema.glitch = effRef.current.glitch ? Math.min(1, stage.transitionEnv * 0.9 + beatEnv * 0.06) : 0;
        cinema.rgbShift = effRef.current.rgbShift ? 0.35 + stage.transitionEnv * 0.5 : 0;
        cinema.grain = effRef.current.grain ? 0.4 : 0;
        cinema.vignette = effRef.current.vignette ? 0.55 : 0;
        if (bloomRef.current) bloomRef.current.enabled = effRef.current.bloom;

        // شارة الزمن — تحديث DOM مباشر بلا إعادة رسم React
        if (badgeTimeRef.current) {
          badgeTimeRef.current.textContent = `${info.loopTime.toFixed(1)}s / ${SHOWREEL_LOOP_DURATION}s`;
        }
        const s = shotAt(info.loopTime);
        setShotId((prev) => (prev === s.id ? prev : s.id));
      }

      composer.render();
    },
  });

  useEffect(() => {
    stageRef.current?.setBpm(bpm);
  }, [bpm]);

  const togglePlay = useCallback(() => {
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
    const stage = stageRef.current;
    if (!stage) return;
    if (playingRef.current) stage.play();
    else stage.pause();
  }, []);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const c = canvasRef.current;
      if (!c) return undefined;
      try {
        return c.toDataURL('image/png');
      } catch {
        return undefined;
      }
    },
    setBpm: (v: number) => stageRef.current?.setBpm(v),
  }));

  const toggle = (k: EffectKey) => setEff((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div
      data-testid="three-showreel"
      className={className ?? 'relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-2xl'}
      style={{ height }}
    >
      {!webglOk ? (
        // بديل بلا WebGL — بطاقة CSS تحمل هوية المشهد
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.14),transparent_65%)] text-center">
          <div className="text-5xl">🎬</div>
          <p className="text-lg font-black text-white">{brand}</p>
          <p className="text-sm text-slate-400">{tagline}</p>
          <p className="max-w-md text-xs text-slate-500">
            WebGL غير متوفر في هذه البيئة — افتح المختبر في متصفح حقيقي لمشاهدة المشهد ثلاثي الأبعاد.
          </p>
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} className="block h-full w-full" />

          {/* شارات المشهد */}
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
            <span data-testid="showreel-shot" className="rounded-md bg-black/50 px-2 py-1 text-[11px] font-bold text-amber-300 backdrop-blur">
              {SHOT_LABELS[shotId] ?? shotId}
            </span>
            <span ref={badgeTimeRef} className="rounded-md bg-black/50 px-2 py-1 font-mono text-[11px] text-slate-300 backdrop-blur" />
            <span className="rounded-md bg-black/50 px-2 py-1 font-mono text-[11px] text-emerald-300 backdrop-blur">{bpm} BPM</span>
          </div>

          {/* الختام: الاسم والعبارة */}
          <div
            data-testid="showreel-finale"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center transition-opacity duration-700"
            style={{ opacity: shotId === 'finale' ? 1 : 0 }}
          >
            <p className="text-4xl font-black tracking-tight text-white drop-shadow-[0_0_24px_rgba(251,191,36,0.45)] sm:text-6xl">
              {brand}
            </p>
            <p className="text-sm font-bold tracking-[0.3em] text-amber-300">{tagline}</p>
          </div>

          {/* شريط التحكم: تشغيل + مفاتيح التشوهات */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur">
            <button
              type="button"
              data-testid="showreel-play"
              onClick={togglePlay}
              className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 transition hover:bg-amber-300"
            >
              {playing ? '⏸ إيقاف' : '▶ تشغيل'}
            </button>
            {(Object.keys(EFFECT_LABELS) as EffectKey[]).map((k) => (
              <button
                key={k}
                type="button"
                data-testid={`fx-${k}`}
                onClick={() => toggle(k)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                  eff[k] ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-500 line-through'
                }`}
              >
                {EFFECT_LABELS[k]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});
