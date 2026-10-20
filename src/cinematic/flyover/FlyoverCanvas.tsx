/**
 * مكون Flyover ثلاثي الأبعاد — WebGL2 + Canvas fallback
 * يعرض صفحة الهبوط كمشهد سينمائي بكاميرا متحركة باستمرار
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { FlyoverRenderer } from './renderer';
import { buildSceneLayers } from './layers';
import type { FlyoverConfig, CapturedLayer, FramePreview } from './legacy-types';
import { DEFAULT_FLYOVER_CONFIG } from './legacy-types';

export interface FlyoverCanvasProps {
  config?: Partial<FlyoverConfig>;
  layers?: CapturedLayer[];
  /** وضع تجريبي بدون صور خارجية (يولّد بطاقات إجرائياً) */
  demo?: boolean;
  /** نقطة زمنية للمعاينة الثابتة (إن وجدت توقف الحركة) */
  frameAt?: number;
  /** هل التشغيل التلقائي */
  autoPlay?: boolean;
  className?: string;
  onTimeUpdate?: (t: number) => void;
  onReady?: () => void;
}

export function FlyoverCanvas({
  config: cfgOverride,
  layers: capturedLayers,
  demo = false,
  frameAt,
  autoPlay = true,
  className,
  onTimeUpdate,
  onReady,
}: FlyoverCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FlyoverRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWebGL, setIsWebGL] = useState(true);

  const config: FlyoverConfig = { ...DEFAULT_FLYOVER_CONFIG, ...cfgOverride };

  const init = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const layers = demo || !capturedLayers?.length ? buildSceneLayers([], config.depthIntensity) : buildSceneLayers(capturedLayers, config.depthIntensity);

    const renderer = new FlyoverRenderer(canvas, config, layers);
    rendererRef.current = renderer;

    try {
      const ok = await renderer.init();
      if (!ok) {
        setIsWebGL(false);
        setReady(true);
        onReady?.();
        return;
      }
      setReady(true);
      onReady?.();

      if (frameAt !== undefined) {
        renderer.previewAt(frameAt);
      } else if (autoPlay) {
        renderer.start(onTimeUpdate);
      }
    } catch (e) {
      setError((e as Error).message);
      setIsWebGL(false);
      setReady(true);
    }
  }, [autoPlay, capturedLayers, config.depthIntensity, demo, frameAt, onReady, onTimeUpdate]);

  useEffect(() => {
    init();
    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [init]);

  // تحديث عند تغير frameAt (وضع المعاينة)
  useEffect(() => {
    if (frameAt !== undefined && rendererRef.current && ready) {
      rendererRef.current.stop();
      rendererRef.current.previewAt(frameAt);
    } else if (frameAt === undefined && ready && autoPlay) {
      rendererRef.current?.start(onTimeUpdate);
    }
  }, [frameAt, ready, autoPlay, onTimeUpdate]);

  // تحديث الإعدادات حياً
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateConfig(config);
      const layers = demo || !capturedLayers?.length ? buildSceneLayers([], config.depthIntensity) : buildSceneLayers(capturedLayers, config.depthIntensity);
      rendererRef.current.updateLayers(layers);
    }
  }, [config, capturedLayers, demo]);

  // CSS fallback عند عدم توفر WebGL2 — parallax بـ CSS 3D
  if (!isWebGL && ready) {
    return <CssFallback config={config} frameAt={frameAt} className={className} />;
  }

  return (
    <div ref={containerRef} className={className ?? 'relative h-full w-full overflow-hidden bg-slate-950'}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: 'block', width: '100%', height: '100%' }}
        aria-label="مشهد ثلاثي الأبعاد — Website Flyover"
      />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
            <span className="text-sm text-slate-400">يُحمّل المشهد ثلاثي الأبعاد…</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-x-4 top-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          فشل تهيئة WebGL2: {error} — يُعرض البديل بـ CSS.
        </div>
      )}
      {/* تراكب لطيف على الحواف */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5" aria-hidden />
    </div>
  );
}

/**
 * بديل CSS 3D عند عدم توفر WebGL2 — نفس التأثير البصري (parallax + رفع + ظلال) بدون شيدرات
 */
function CssFallback({ config, frameAt, className }: { config: FlyoverConfig; frameAt?: number; className?: string }) {
  const [t, setT] = useState(frameAt ?? 0);

  useEffect(() => {
    if (frameAt !== undefined) {
      setT(frameAt);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const loop = () => {
      const elapsed = (performance.now() - start) / 1000;
      setT((elapsed * config.speed) % config.duration);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [config.speed, config.duration, frameAt]);

  // كاميرا مبسطة: تحريك على Z مع parallax
  const progress = t / config.duration;
  const camZ = 8 - progress * 9;
  const camX = Math.sin(t * 0.3) * 0.8;
  const focusDepth = config.focusDistance / 10;

  const layers = buildSceneLayers([], config.depthIntensity);

  return (
    <div className={className ?? 'relative h-full w-full overflow-hidden bg-slate-950'} style={{ perspective: '1200px', perspectiveOrigin: '50% 45%' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e293b,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:80px_80px]" />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate3d(${camX * 30}px, 0, ${camZ * 18}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {layers.map((layer) => {
          const depthFactor = layer.depth;
          const blur = Math.abs(depthFactor - focusDepth) * config.aperture * 45;
          const isFinale = t > config.duration - config.finale.duration && layer.id === 'hero';

          return (
            <div
              key={layer.id}
              className="absolute"
              style={{
                width: `${layer.scale[0] * 220}px`,
                height: `${layer.scale[1] * 220}px`,
                transform: `translate3d(${layer.position[0] * 120}px, ${layer.position[1] * 120}px, ${layer.position[2] * 18}px) rotateZ(${layer.rotation}deg)`,
                transformStyle: 'preserve-3d',
                filter: `blur(${blur}px)`,
                opacity: isFinale ? 0 : 1,
                transition: 'opacity 0.6s ease',
                zIndex: Math.round(layer.depth * 100),
              }}
            >
              <div
                className="h-full w-full rounded-[16px] border p-4 shadow-xl transition-transform duration-700"
                style={{
                  background: layerColorBg(layer.color, layer.id),
                  borderColor: 'rgba(255,255,255,0.12)',
                  boxShadow: layer.elevation > 0 ? `0 ${8 + layer.elevation * 30}px ${20 + layer.elevation * 40}px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)` : '0 4px 20px rgba(0,0,0,0.3)',
                  transform: `translateZ(${layer.elevation * 28}px)`,
                }}
              >
                <div className="flex h-full flex-col justify-between text-right">
                  <div>
                    <div className="text-xs font-bold opacity-60" style={{ color: layer.id === 'bg' ? '#94a3b8' : '#fff' }}>
                      {kindLabel(layer.kind)}
                    </div>
                    <div className="mt-1 text-sm font-black leading-tight text-white">{layerLabel(layer.id)}</div>
                  </div>
                  <div className="h-2 w-full rounded-full opacity-80" style={{ background: layer.color }} />
                </div>
              </div>
              {/* ظل ناعم تحت البطاقات المرفوعة */}
              {layer.elevation > 0 && (
                <div
                  className="absolute inset-x-4 top-full h-6 rounded-full blur-xl"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    transform: 'translateZ(-1px) scale(0.9)',
                    opacity: 0.6 - layer.depth * 0.2,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* بطاقة الختام السينمائية */}
      <FinaleCard visible={t > config.duration - config.finale.duration} brand={config.finale.brand} tagline={config.finale.tagline} />

      {/* شريط زمني مصغر */}
      <div className="pointer-events-none absolute inset-x-6 bottom-6 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-amber-400 transition-none" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function FinaleCard({ visible, brand, tagline }: { visible: boolean; brand: string; tagline: string }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-700">
      <div className="mx-4 max-w-2xl rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center shadow-[0_20px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-700">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-2xl font-black text-slate-950 shadow-[0_0_40px_rgba(251,191,36,0.35)]">
          ◈
        </div>
        <h2 className="mt-6 bg-gradient-to-l from-amber-300 to-amber-500 bg-clip-text text-4xl font-black text-transparent">{brand}</h2>
        <p className="mt-3 text-lg text-slate-300 animate-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both">{tagline}</p>
        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-l from-amber-400 to-transparent" />
      </div>
    </div>
  );
}

function layerColorBg(color: string, id: string): string {
  if (id === 'bg') return 'radial-gradient(ellipse at top, #1e293b, #020617)';
  if (id === 'hero') return 'linear-gradient(135deg, #1e293b, #020617)';
  return `linear-gradient(135deg, ${color}22, ${color}0d)`;
}
function kindLabel(kind: string) {
  const map: Record<string, string> = { background: 'خلفية', hero: 'البطل', card: 'بطاقة', image: 'صورة', logo: 'شعار', text: 'نص', overlay: 'تراكب' };
  return map[kind] ?? kind;
}
function layerLabel(id: string) {
  const map: Record<string, string> = {
    bg: 'خلفية الصفحة',
    hero: 'قالب العرض التقديمي — عنوان البطل',
    'card-1': 'الفصل الأول — الدراسة التمهيدية',
    'card-2': 'الفصل الثاني — التصميم المفاهيمي',
    'card-3': 'الفصل الثالث — التنفيذ التقني',
    'image-1': 'واجهة / لقطة شاشة',
    logos: 'الشركاء والشعارات',
  };
  return map[id] ?? id;
}

export type { FramePreview };
