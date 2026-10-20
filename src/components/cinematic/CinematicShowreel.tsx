import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Aperture,
  Box,
  Check,
  Clapperboard,
  Copy,
  Film,
  Layers,
  MonitorPlay,
  RotateCcw,
  Sparkles,
  Terminal,
} from 'lucide-react';
import type { CaptureLayer, FlyoverConfig, FlyoverHandle, FlyoverTimeline } from '@/cinematic/types';
import { DEFAULT_FLYOVER_CONFIG, DEFAULT_PAGE_DIMENSIONS } from '@/cinematic/types';
import { generatePresetPath, resolvePhase } from '@/cinematic/camera';
import { buildDemoLayers, DEMO_BRAND, type DemoBrand } from '@/cinematic/landing';
import { loadCaptureManifest } from '@/cinematic/capture';
import { cn } from '@/lib/cn';
import { formatTime } from '@/cinematic/utils';
import { FlyoverCanvas } from './FlyoverCanvas';
import { FinalCard } from './FinalCard';
import { ShowreelControls } from './ShowreelControls';
import { FrameStrip } from './FrameStrip';
import { CameraControls } from './CameraControls';

export interface CinematicShowreelProps {
  /** طبقات جاهزة (من Playwright) — وإلا تُولَّد صفحة تجريبية */
  layers?: CaptureLayer[];
  /** رابط manifest.json من سكربت الالتقاط */
  manifestUrl?: string;
  brand?: DemoBrand;
  initialConfig?: Partial<FlyoverConfig>;
  className?: string;
}

/**
 * حزمة العرض السينمائي ثلاثي الأبعاد:
 * صفحة هبوط (Playwright أو تجريبية) → طيران WebGL2 → بطاقة ختامية.
 * كل الإعدادات حيّة: المسار، السرعة، العمق، DoF، الإضاءة، وبطاقة الختام.
 */
export function CinematicShowreel({
  layers: layersProp,
  manifestUrl,
  brand = DEMO_BRAND,
  initialConfig,
  className,
}: CinematicShowreelProps) {
  const [config, setConfig] = useState<FlyoverConfig>(() => ({
    ...DEFAULT_FLYOVER_CONFIG,
    ...initialConfig,
    camera: initialConfig?.camera ?? generatePresetPath('flyover'),
    dimensions: { ...DEFAULT_PAGE_DIMENSIONS, ...initialConfig?.dimensions },
    speed: { ...DEFAULT_FLYOVER_CONFIG.speed, ...initialConfig?.speed },
    depth: { ...DEFAULT_FLYOVER_CONFIG.depth, ...initialConfig?.depth },
    dof: { ...DEFAULT_FLYOVER_CONFIG.dof, ...initialConfig?.dof },
    lighting: { ...DEFAULT_FLYOVER_CONFIG.lighting, ...initialConfig?.lighting },
    finalCard: {
      ...DEFAULT_FLYOVER_CONFIG.finalCard,
      brand: brand.name,
      tagline: brand.tagline,
      ...initialConfig?.finalCard,
    },
  }));
  const [layers, setLayers] = useState<CaptureLayer[] | null>(layersProp ?? null);
  const [source, setSource] = useState<'demo' | 'playwright'>(layersProp ? 'playwright' : 'demo');
  const [loading, setLoading] = useState(!layersProp);
  const [playing, setPlaying] = useState(true);
  const [timeline, setTimeline] = useState<FlyoverTimeline>({
    currentTime: 0,
    t: 0,
    phase: 'flyover',
    playing: true,
    progress: 0,
  });
  const [copied, setCopied] = useState(false);
  const [stageFullscreen, setStageFullscreen] = useState(false);

  const stageRef = useRef<FlyoverHandle>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const lastSyncRef = useRef(0);
  const timelineRef = useRef(timeline);

  // ─── تحميل الطبقات ─────────────────────────────────────────
  useEffect(() => {
    if (layersProp) {
      setLayers(layersProp);
      setSource('playwright');
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const load = async () => {
      if (manifestUrl) {
        try {
          const result = await loadCaptureManifest(manifestUrl);
          if (!alive) return;
          setLayers(result.layers);
          setSource('playwright');
          if (result.dimensions) setConfig((c) => ({ ...c, dimensions: result.dimensions }));
          setLoading(false);
          return;
        } catch {
          // يسقط إلى الطبقات التجريبية
        }
      }
      const generated = await buildDemoLayers({ brand, dimensions: DEFAULT_PAGE_DIMENSIONS });
      if (!alive) return;
      setLayers(generated);
      setSource('demo');
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [layersProp, manifestUrl, brand]);

  // ─── مزامنة الخط الزمني مع الواجهة (معدّل ~12 مرة/ث) ────────
  const handleTime = useCallback((_seconds: number, tl: FlyoverTimeline) => {
    timelineRef.current = tl;
    const now = performance.now();
    if (now - lastSyncRef.current > 120 || tl.phase !== timeline.phase) {
      lastSyncRef.current = now;
      setTimeline(tl);
    }
  }, [timeline.phase]);

  const seek = useCallback((seconds: number) => {
    const d = Math.max(0.1, config.speed.duration);
    const clamped = Math.max(0, Math.min(d, seconds));
    const tn = clamped / d;
    stageRef.current?.seekTo(clamped);
    setTimeline((t) => ({
      ...t,
      currentTime: clamped,
      t: tn,
      phase: resolvePhase(tn),
      progress: tn,
    }));
  }, [config.speed.duration]);

  const toggle = useCallback(() => {
    const handle = stageRef.current;
    if (!handle) return;
    handle.toggle();
    const isPlaying = handle.getTimeline().playing;
    setPlaying(isPlaying);
    setTimeline((t) => ({ ...t, playing: isPlaying }));
  }, []);

  const restart = useCallback(() => {
    stageRef.current?.restart();
    setPlaying(true);
    setTimeline({ currentTime: 0, t: 0, phase: 'flyover', playing: true, progress: 0 });
  }, []);

  const onLoopChange = useCallback((loop: boolean) => {
    setConfig((c) => ({ ...c, loop }));
  }, []);

  const onSpeedChange = useCallback((multiplier: number) => {
    setConfig((c) => ({ ...c, speed: { ...c.speed, multiplier } }));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = stageWrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setStageFullscreen(true);
      } else {
        await document.exitFullscreen();
        setStageFullscreen(false);
      }
    } catch {
      /* المتصفح قد يمنع ملء الشاشة */
    }
  }, []);

  useEffect(() => {
    const onChange = () => setStageFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ─── اختصارات ──────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'ArrowRight') {
        seek(Math.min(config.speed.duration, timelineRef.current.currentTime + 0.25));
      } else if (e.key === 'ArrowLeft') {
        seek(Math.max(0, timelineRef.current.currentTime - 0.25));
      } else if (e.key.toLowerCase() === 'r') {
        restart();
      } else if (e.key.toLowerCase() === 'f') {
        void toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, seek, restart, toggleFullscreen, config.speed.duration]);

  const previewTimes = useMemo(() => {
    const d = config.speed.duration;
    if (config.previewTimes?.length) {
      return config.previewTimes
        .map((t) => Number(Math.max(0, Math.min(d, t)).toFixed(2)))
        .sort((a, b) => a - b);
    }
    return [0, 0.12, 0.26, 0.4, 0.54, 0.68, 0.8, 0.9, 0.98].map((f) => Number((f * d).toFixed(2)));
  }, [config.speed.duration, config.previewTimes]);

  const keyframeTimes = useMemo(() => config.camera.keyframes.map((k) => k.t), [config.camera.keyframes]);
  const accent = '#f5b544';
  const finalVisible = timeline.t >= 0.9;
  const transitionProgress = Math.min(1, Math.max(0, (timeline.t - 0.84) / 0.16));

  const command = 'npx playwright install chromium\nnode scripts/capture-landing.mjs --url https://your-landing.page --out public/captures/landing --fullPage';
  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* الحافظة قد تكون محجوبة */
    }
  };

  return (
    <div className={cn('min-h-full bg-[#05080f] text-slate-100', className)}>
      {/* توهج خلفي */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-amber-500/[0.07] blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-sky-500/[0.06] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* ─── رأس الصفحة ─────────────────────────────────── */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-300">
              <Clapperboard className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-300/80">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                Cinematic Showreel
              </div>
              <h1 className="text-xl font-black leading-tight sm:text-2xl">عرض سينمائي ثلاثي الأبعاد لصفحة الهبوط</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <Badge icon={MonitorPlay} label="WebGL2" tone="accent" />
            <Badge icon={Layers} label={`${layers?.length ?? 0} طبقات`} />
            <Badge icon={Aperture} label={`DoF ${config.dof.enabled ? 'مفعّل' : 'مغلق'}`} />
            <Badge
              icon={Box}
              label={source === 'playwright' ? 'طبقات Playwright' : 'طبقات تجريبية'}
              tone={source === 'playwright' ? 'success' : 'neutral'}
            />
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]">
          {/* ─── العمود الرئيسي ──────────────────────────── */}
          <div className="min-w-0 space-y-4">
            <div
              ref={stageWrapRef}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-white/10 bg-[#04070f] shadow-[0_40px_120px_-50px_rgba(0,0,0,0.95)]',
                stageFullscreen && 'flex h-screen w-screen items-center justify-center rounded-none border-0',
              )}
              style={{ aspectRatio: stageFullscreen ? undefined : `${config.dimensions.width} / ${config.dimensions.height}` }}
            >
              {layers && (
                <FlyoverCanvas
                  ref={stageRef}
                  layers={layers}
                  config={config}
                  playing={playing}
                  onTime={handleTime}
                  onPhase={(phase) => setTimeline((t) => ({ ...t, phase }))}
                  onEnded={() => setPlaying(false)}
                  className="absolute inset-0 h-full w-full"
                />
              )}
              {loading && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-5 py-2 text-xs text-slate-300 backdrop-blur">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                    تُلتقط طبقات الصفحة وتُبنى المشهد…
                  </div>
                </div>
              )}

              {/* إطار Viewfinder سينمائي */}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
                <div className="absolute inset-4 rounded-xl border border-white/[0.055]" />
                {['top-4 start-4 border-s-2 border-t-2', 'top-4 end-4 border-e-2 border-t-2', 'bottom-4 start-4 border-s-2 border-b-2', 'bottom-4 end-4 border-e-2 border-b-2'].map(
                  (cls) => (
                    <span key={cls} className={cn('absolute h-7 w-7 rounded-[3px] border-white/25', cls)} />
                  ),
                )}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-transparent via-amber-400/70 to-transparent" style={{ width: `${timeline.t * 100}%` }} />
              </div>

              {/* شارة علوية داخل المشهد */}
              <div className="pointer-events-none absolute inset-x-4 top-5 z-10 flex items-start justify-between gap-3 text-[10px] font-bold">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-slate-300 backdrop-blur">
                  <span className={cn('h-1.5 w-1.5 rounded-full', playing ? 'animate-pulse bg-rose-400' : 'bg-slate-500')} />
                  {timeline.phase === 'final' ? 'الختام' : timeline.phase === 'transition' ? 'انتقال سينمائي' : 'تحليق'}
                  <span className="h-2.5 w-px bg-white/15" />
                  <span className="font-mono tabular-nums text-slate-400" dir="ltr">
                    {formatTime(timeline.currentTime)}
                  </span>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 font-mono text-[9px] text-slate-400 backdrop-blur sm:flex" dir="ltr">
                  <span>{config.dimensions.width}×{config.dimensions.height}</span>
                  <span className="text-slate-600">|</span>
                  <span>FOV {config.camera.keyframes.at(-1)?.fov ?? 40}°</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-300/80">{timeline.t.toFixed(3)}t</span>
                </div>
              </div>

              {/* البطاقة الختامية */}
              <FinalCard
                config={config.finalCard}
                visible={finalVisible}
                progress={transitionProgress}
                accent={accent}
                onReplay={restart}
              />
            </div>

            <ShowreelControls
              duration={config.speed.duration}
              time={timeline.currentTime}
              playing={playing}
              loop={config.loop}
              speed={config.speed.multiplier}
              keyframes={keyframeTimes}
              accent={accent}
              onToggle={toggle}
              onRestart={restart}
              onSeek={seek}
              onLoop={onLoopChange}
              onSpeed={onSpeedChange}
              onFullscreen={toggleFullscreen}
            />

            <FrameStrip stageRef={stageRef} times={previewTimes} duration={config.speed.duration} accent={accent} onSeek={seek} />

            {/* ملخّص التقنية */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="طبقات المشهد" value={String(layers?.length ?? 0)} hint="خلفية · بطل · بطاقات · شعارات" icon={Layers} />
              <Stat label="نقاط الكاميرا" value={String(config.camera.keyframes.length)} hint="Catmull-Rom · منحنى سينمائي" icon={Clapperboard} />
              <Stat label="مدة العرض" value={`${config.speed.duration.toFixed(0)}s`} hint={`${previewTimes.length} إطارات معاينة`} icon={Film} />
            </div>
          </div>

          {/* ─── العمود الجانبي ──────────────────────────── */}
          <aside className="min-w-0 space-y-4">
            <CameraControls
              config={config}
              onChange={setConfig}
              onPickKeyframe={(seconds) => seek(seconds)}
              accent={accent}
            />

            {/* التقاط Playwright */}
            <section className="rounded-2xl border border-white/10 bg-[#080d18]/80 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                  <Terminal className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold">التقاط حقيقي بـ Playwright</h3>
                  <p className="text-[10px] text-slate-500">صفحتك الحقيقية بدل الصفحة التجريبية</p>
                </div>
              </div>
              <pre dir="ltr" className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-3 text-[10px] leading-relaxed text-slate-300">
                <code>{command}</code>
              </pre>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyCommand}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11px] font-bold text-slate-200 transition hover:bg-white/10"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'نُسخ' : 'نسخ الأمر'}
                </button>
                <span className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5 font-mono text-[9px] text-slate-500" dir="ltr">
                  manifest.json
                </span>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                بعد الالتقاط افتح الصفحة بـ{' '}
                <code dir="ltr" className="rounded bg-white/10 px-1 text-[9px] text-slate-300">
                  ?lab=cinematic&amp;captures=...
                </code>{' '}
                لتحميل الطبقات الحقيقية t تلقائياً.
              </p>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                المحددات المدعومة: <code dir="ltr" className="text-[9px] text-sky-300">[data-flyover=&quot;card|hero|logo|image&quot;]</code> و
                <code dir="ltr" className="text-[9px] text-sky-300">.card</code>.
              </p>
            </section>

            {/* ما يحدث في المشهد */}
            <section className="rounded-2xl border border-white/10 bg-[#080d18]/70 p-4 backdrop-blur">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <Sparkles className="h-4 w-4 text-amber-300" />
                ما في المشهد
              </h3>
              <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-400">
                <li className="flex gap-2"><Dot /> كاميرا على مسار Catmull-Rom مع منحنى سينمائي وتذبذب دقيق اختياري.</li>
                <li className="flex gap-2"><Dot /> كل طبقة في عمق مستقل: parallax، رفع البطاقات، وميل خفيف مع الوقت.</li>
                <li className="flex gap-2"><Dot /> عمق ميدان محسوب من عمق الطبقة (12 عينة bokeh) وإضاءة ambient/directional/fill.</li>
                <li className="flex gap-2"><Dot /> ظل ناعم مستقل تحت كل بطاقة مرفوعة + جزيئات غبار + vignette وحبيبات فيلم.</li>
                <li className="flex gap-2"><Dot /> انتقال عند <code dir="ltr" className="font-mono text-[10px] text-slate-300">t=0.84</code> إلى بطاقة الختام، ثم كشف العبارة كلمةً كلمة.</li>
              </ul>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <span className="text-[10px] font-bold text-slate-400">أبعاد الصفحة المثبتة</span>
                <span className="font-mono text-[10px] text-amber-200" dir="ltr">
                  {config.dimensions.width} × {config.dimensions.height}
                </span>
              </div>
              <button
                type="button"
                onClick={restart}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-400 py-2 text-[11px] font-extrabold text-slate-950 transition hover:bg-amber-300"
              >
                <RotateCcw className="h-3.5 w-3.5" /> شاهد من البداية
              </button>
            </section>
          </aside>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[10px] text-slate-500">
          <span>
            {source === 'playwright' ? 'الطبقات مأخوذة من manifest.json (Playwright)' : 'طبقات تجريبية مولّدة على canvas — شغّل سكربت Playwright لاستبدالها'}
          </span>
          <span className="font-mono" dir="ltr">
            WebGL2 · Catmull-Rom · DoF · soft shadows · {(layers?.length ?? 0)} layers
          </span>
        </footer>
      </div>
    </div>
  );
}

// ─── عناصر صغيرة ─────────────────────────────────────────────
function Badge({ icon: Icon, label, tone = 'neutral' }: { icon: typeof Layers; label: string; tone?: 'neutral' | 'accent' | 'success' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        tone === 'accent'
          ? 'border-amber-300/30 bg-amber-400/10 text-amber-200'
          : tone === 'success'
            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
            : 'border-white/10 bg-white/[0.03] text-slate-400',
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function Stat({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof Layers }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500">{label}</span>
        <Icon className="h-3.5 w-3.5 text-slate-600" />
      </div>
      <div className="mt-1 font-mono text-xl font-black text-slate-100" dir="ltr">
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-slate-500">{hint}</div>
    </div>
  );
}

function Dot() {
  return <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-300/70" />;
}

/** نسخة صفحة كاملة للمختبر ?lab=cinematic */
export function CinematicLab() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const captures = params.get('captures');

  return (
    <main dir="rtl" className="min-h-screen bg-[#05080f]">
      <div className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-2 text-[11px] text-slate-400 sm:px-6 lg:px-8">
          <span className="font-bold">قالب العرض · مختبر السينما ثلاثية الأبعاد</span>
          <a
            href={typeof window !== 'undefined' ? window.location.pathname : '/'}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 font-bold transition hover:bg-white/10"
          >
            العودة إلى العرض
          </a>
        </div>
      </div>
      <CinematicShowreel manifestUrl={captures ?? undefined} />
    </main>
  );
}

export default CinematicLab;
