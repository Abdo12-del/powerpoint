import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { CaptureLayer, FlyoverConfig, FlyoverHandle, FlyoverTimeline } from '@/cinematic/types';
import { FlyoverRenderer } from '@/cinematic/renderer';
import { resolvePhase } from '@/cinematic/camera';
import { clamp01 } from '@/cinematic/utils';

export interface FlyoverCanvasProps {
  layers: CaptureLayer[];
  config: FlyoverConfig;
  /** يُشغّل الحركة تلقائياً (افتراضي: حسب config.autoplay) */
  playing?: boolean;
  /** يُستدعى كل إطار بالزمن بالثواني */
  onTime?: (seconds: number, timeline: FlyoverTimeline) => void;
  /** تغيّر المرحلة (طيران ← انتقال ← ختام) */
  onPhase?: (phase: FlyoverTimeline['phase']) => void;
  /** عند الوصول للنهاية (إن لم يكن loop) */
  onEnded?: () => void;
  /** خطأ WebGL (إن لم يدعم المتصفح) */
  onError?: (message: string) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * مسرح WebGL2 للعرض السينمائي: يغلّف FlyoverRenderer بحلقة زمن واحدة.
 * كل التحكم يمر عبر ref (FlyoverHandle) — لا حالة React في مسار الرسم.
 */
export const FlyoverCanvas = forwardRef<FlyoverHandle, FlyoverCanvasProps>(function FlyoverCanvas(
  { layers, config, playing, onTime, onPhase, onEnded, onError, className, style },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FlyoverRenderer | null>(null);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const playingRef = useRef(playing ?? config.autoplay);
  /**
   * مرساة الزمن: «عند لحظة الجدار anchorRef كان الزمن baseTimeRef».
   * كل إطار يحسب t = baseTime + (now − anchor) × speed — لا تجميع ولا انزلاق.
   */
  const baseTimeRef = useRef(0);
  const anchorRef = useRef(0);
  const setAnchor = useCallback((timeAtAnchor: number, wallAtAnchor: number) => {
    baseTimeRef.current = timeAtAnchor;
    anchorRef.current = wallAtAnchor;
  }, []);
  const phaseRef = useRef<FlyoverTimeline['phase']>('flyover');
  const callbacks = useRef({ onTime, onPhase, onEnded, onError });
  const configRef = useRef(config);
  const [fallback, setFallback] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  callbacks.current = { onTime, onPhase, onEnded, onError };
  configRef.current = config;

  // ─── حلقة الرسم ───────────────────────────────────────────
  /**
   * مصدر الزمن الوحيد: مرساة (baseTime, anchorWall).
   * الزمن الحالي = baseTime + (now − anchorWall) × speed — بلا تجميع إطارات ولا انزلاق.
   */
  const frame = useCallback((ts: number) => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const cfg = configRef.current;
    const duration = Math.max(0.1, cfg.speed.duration);

    let t = timeRef.current;
    if (playingRef.current) {
      const mult = cfg.speed.multiplier || 1;
      t = baseTimeRef.current + ((ts - anchorRef.current) / 1000) * mult;

      // وقفة مبرمجة: نُقدّم المرساة بمقدار p.for فتتجمد الحركة عند p.at
      const crossing = (cfg.speed.pauses ?? []).find((p) => t >= p.at && baseTimeRef.current < p.at);
      if (crossing) {
        setAnchor(crossing.at, ts + crossing.for * 1000);
        t = crossing.at;
      }

      if (t >= duration) {
        if (cfg.loop) {
          setAnchor(0, ts);
          t = 0;
        } else {
          t = duration;
          playingRef.current = false;
          callbacks.current.onEnded?.();
        }
      }
      timeRef.current = Math.min(duration, t);
    } else {
      t = timeRef.current;
    }

    renderer.render(t / duration, t);

    const tn = clamp01(t / duration);
    const phase = resolvePhase(tn);
    if (phase !== phaseRef.current) {
      phaseRef.current = phase;
      callbacks.current.onPhase?.(phase);
    }
    callbacks.current.onTime?.(t, {
      currentTime: t,
      t: tn,
      phase,
      playing: playingRef.current,
      progress: tn,
    });

    // عند الإيقاف: إطار واحد ثم توقف (لا نستهلك GPU في الخلفية)
    if (playingRef.current) rafRef.current = requestAnimationFrame(frame);
  }, [setAnchor]);

  const startLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  // ─── تهيئة المصيّر ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: FlyoverRenderer;
    try {
      renderer = new FlyoverRenderer(canvas, configRef.current);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'تعذر تشغيل WebGL2';
      setFallback(msg);
      callbacks.current.onError?.(msg);
      return;
    }
    rendererRef.current = renderer;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      renderer.resize(rect.width, rect.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let cancelled = false;
    void renderer.setLayers(layers).then(() => {
      if (cancelled) return;
      setReady(true);
      setAnchor(timeRef.current, performance.now());
      const duration = Math.max(0.1, configRef.current.speed.duration);
      renderer.render(timeRef.current / duration, timeRef.current);
      startLoop();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.dispose();
      rendererRef.current = null;
    };
    // يُعاد التهيئة عند تغيّر مجموعة الطبقات فقط
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, startLoop]);

  // مزامنة الإعدادات دون إعادة تهيئة
  useEffect(() => {
    rendererRef.current?.setConfig(config);
  }, [config]);

  // مزامنة التشغيل الخارجي
  useEffect(() => {
    if (playing === undefined) return;
    playingRef.current = playing;
    setAnchor(timeRef.current, performance.now());
    if (playing) startLoop();
    else cancelAnimationFrame(rafRef.current);
  }, [playing, startLoop]);

  // ─── التحكم ───────────────────────────────────────────────
  const drawNow = useCallback(() => {
    const r = rendererRef.current;
    if (!r) return;
    const d = Math.max(0.1, configRef.current.speed.duration);
    r.render(timeRef.current / d, timeRef.current);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const d = Math.max(0.1, configRef.current.speed.duration);
    const clamped = Math.max(0, Math.min(d, seconds));
    timeRef.current = clamped;
    setAnchor(clamped, performance.now());
    drawNow();
  }, [drawNow, setAnchor]);

  const seekT = useCallback((t: number) => {
    const d = Math.max(0.1, configRef.current.speed.duration);
    seekTo(clamp01(t) * d);
  }, [seekTo]);

  const play = useCallback(() => {
    const d = Math.max(0.1, configRef.current.speed.duration);
    if (timeRef.current >= d) timeRef.current = 0;
    playingRef.current = true;
    setAnchor(timeRef.current, performance.now());
    startLoop();
  }, [startLoop, setAnchor]);

  const pause = useCallback(() => {
    playingRef.current = false;
  }, []);

  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [pause, play]);

  const restart = useCallback(() => {
    timeRef.current = 0;
    setAnchor(0, performance.now());
    playingRef.current = true;
    drawNow();
    startLoop();
  }, [drawNow, startLoop, setAnchor]);

  const captureFrame = useCallback(() => {
    const r = rendererRef.current;
    if (!r) return undefined;
    try {
      return r.capture();
    } catch {
      return undefined;
    }
  }, []);

  const getFrameAt = useCallback(async (seconds: number, maxWidth = 640) => {
    const r = rendererRef.current;
    const canvas = canvasRef.current;
    if (!r || !canvas) return '';
    const wasPlaying = playingRef.current;
    playingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    const d = Math.max(0.1, configRef.current.speed.duration);
    const clamped = Math.max(0, Math.min(d, seconds));
    r.render(clamped / d, clamped);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    let url: string;
    if (canvas.width > maxWidth) {
      // صغّر الإطار في canvas ثانٍ — أرخص بكثير من تخزين PNG كامل الدقة لشريط المعاينة
      const off = document.createElement('canvas');
      const scale = maxWidth / canvas.width;
      off.width = Math.max(1, Math.round(maxWidth));
      off.height = Math.max(1, Math.round(canvas.height * scale));
      const ctx = off.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, off.width, off.height);
        url = off.toDataURL('image/jpeg', 0.86);
      } else {
        url = r.capture();
      }
    } else {
      url = r.capture();
    }

    if (wasPlaying) {
      playingRef.current = true;
      startLoop();
    } else {
      playingRef.current = false;
    }
    return url;
  }, [startLoop]);

  const getTimeline = useCallback((): FlyoverTimeline => {
    const d = Math.max(0.1, configRef.current.speed.duration);
    const tn = clamp01(timeRef.current / d);
    return {
      currentTime: timeRef.current,
      t: tn,
      phase: resolvePhase(tn),
      playing: playingRef.current,
      progress: tn,
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      seekTo,
      seekT,
      play,
      pause,
      toggle,
      restart,
      captureFrame,
      getFrameAt,
      getTimeline,
      get canvas() {
        return canvasRef.current;
      },
      get isReady() {
        return ready;
      },
    }),
    [seekTo, seekT, play, pause, toggle, restart, captureFrame, getFrameAt, getTimeline, ready],
  );

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#04070f] ${className ?? ''}`} style={style}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="عرض سينمائي ثلاثي الأبعاد لصفحة الهبوط" role="img" />
      {fallback && (
        <div className="absolute inset-0 grid place-items-center bg-slate-950/90 p-8 text-center">
          <div className="max-w-md space-y-3">
            <div className="text-lg font-bold text-amber-300">تعذّر تشغيل المشهد ثلاثي الأبعاد</div>
            <p className="text-sm text-slate-400">{fallback}</p>
            <p className="text-xs text-slate-500">
              يحتاج المتصفح إلى WebGL2. جرّب Chrome أو Edge أو Firefox حديثاً، أو فعّل تسريع الرسوميات.
            </p>
          </div>
        </div>
      )}
      {!fallback && !ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/60 px-5 py-2 text-sm text-slate-300 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            يُحضَّر المشهد…
          </div>
        </div>
      )}
    </div>
  );
});
