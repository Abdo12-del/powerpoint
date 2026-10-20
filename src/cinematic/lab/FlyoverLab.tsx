/**
 * مختبر العرض السينمائي ثلاثي الأبعاد — ?lab=flyover
 * يعرض المشهد مع تحكم كامل في المسار والسرعة والعمق ومعاينة الإطارات
 */

import { useState, useRef } from 'react';
import { ArrowRight, Camera, Download, Pause, Play, RotateCcw, Eye, Layers, Aperture, Timer, Move3d, Sparkles } from 'lucide-react';
import { FlyoverCanvas } from '../flyover/FlyoverCanvas';
import { useFlyoverTimeline } from '../flyover/useFlyoverTimeline';
import { DEFAULT_FLYOVER_CONFIG } from '../types';

export default function FlyoverLab() {
  const timeline = useFlyoverTimeline({}, [0, 2.5, 5, 8, 11, 14, 16]);
  const [showPath, setShowPath] = useState(false);
  const [finaleBrand, setFinaleBrand] = useState(DEFAULT_FLYOVER_CONFIG.finale.brand);
  const [finaleTagline, setFinaleTagline] = useState(DEFAULT_FLYOVER_CONFIG.finale.tagline);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleExportFrame = () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = (canvas as HTMLCanvasElement).toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `flyover-frame-${timeline.time.toFixed(2)}s.png`;
    a.click();
  };

  const previewLabels = ['البداية 0s', '2.5s', '5s', '8s', '11s', '14s', 'الختام 16s'];

  return (
    <main dir="rtl" className="min-h-screen overflow-y-auto bg-slate-950 text-slate-100">
      {/* رأس */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Camera size={16} /> القالب · المختبر السينمائي
            </div>
            <h1 className="mt-1 text-2xl font-black">العرض السينمائي ثلاثي الأبعاد — Website Flyover</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Playwright لالتقاط صفحة الهبوط وطبقاتها → WebGL2 لمشهد ثلاثي الأبعاد بكاميرا متحركة باستمرار، Depth of Field وParallax ورفع البطاقات، إضاءة وظلال ناعمة، وانتقال سينمائي إلى بطاقة ختامية.
            </p>
          </div>
          <a href={window.location.pathname} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10">
            العودة إلى العرض <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 p-6 lg:grid-cols-[1fr_380px]">
        {/* المشهد */}
        <div className="space-y-4">
          <div ref={canvasContainerRef} className="relative aspect-[16/9] overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-2xl">
            <FlyoverCanvas
              config={{
                ...timeline.config,
                finale: { ...timeline.config.finale, brand: finaleBrand, tagline: finaleTagline },
              }}
              demo
              frameAt={previewMode ? timeline.time : undefined}
              autoPlay={!previewMode && timeline.playing}
            />

            {/* شريط التحكم العائم */}
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 px-3 py-2 backdrop-blur-md">
              <button
                onClick={timeline.toggle}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
                aria-label={timeline.playing ? 'إيقاف' : 'تشغيل'}
              >
                {timeline.playing ? <Pause size={14} /> : <Play size={14} className="ms-0.5" />}
              </button>

              <div className="flex flex-1 items-center gap-2">
                <span className="text-xs font-mono text-slate-400">{timeline.time.toFixed(1)}s</span>
                <input
                  type="range"
                  min={0}
                  max={timeline.duration}
                  step={0.05}
                  value={timeline.time}
                  onChange={(e) => {
                    setPreviewMode(true);
                    timeline.seek(Number(e.target.value));
                  }}
                  onMouseUp={() => setTimeout(() => setPreviewMode(false), 800)}
                  className="flex-1 accent-amber-400"
                />
                <span className="text-xs font-mono text-slate-500">{timeline.duration}s</span>
              </div>

              <button onClick={timeline.reset} className="rounded-full bg-white/10 p-2 hover:bg-white/15" title="إعادة">
                <RotateCcw size={14} />
              </button>
              <button onClick={handleExportFrame} className="rounded-full bg-white/10 p-2 hover:bg-white/15" title="تصدير الإطار">
                <Download size={14} />
              </button>
            </div>

            {/* مؤشر العمق والتركيز */}
            <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                عمق {Math.round(timeline.config.depthIntensity * 100)}%
              </span>
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur">
                f/{(timeline.config.aperture * 22).toFixed(1)}
              </span>
            </div>
          </div>

          {/* معاينة الإطارات عند نقاط زمنية محددة */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <Eye size={14} /> معاينة الإطارات عند نقاط زمنية محددة
            </h3>
            <p className="mt-1 text-xs text-slate-400">انقر على أي نقطة لمعاينة الإطار بدقة — يُوقف التشغيل ويعرض الإطار الثابت.</p>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {timeline.previewPoints.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPreviewMode(true);
                    timeline.goToPreview(idx);
                  }}
                  className={`group relative overflow-hidden rounded-xl border p-3 text-center transition ${
                    Math.abs(timeline.time - pt) < 0.3 && previewMode ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-300">{previewLabels[idx] ?? `${pt}s`}</div>
                  <div className="mt-1 text-[10px] text-slate-500">{pt.toFixed(1)}s</div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded bg-white/10">
                    <div className="h-full bg-amber-400" style={{ width: `${(pt / timeline.duration) * 100}%` }} />
                  </div>
                </button>
              ))}
            </div>
            {previewMode && (
              <button
                onClick={() => setPreviewMode(false)}
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-300"
              >
                <Play size={12} /> استئناف الحركة
              </button>
            )}
          </section>

          {/* كيف يعمل */}
          <section className="grid gap-4 md:grid-cols-3">
            <InfoCard icon={Layers} title="Playwright — التقاط الطبقات" desc="يثبّت الأبعاد عند 1920×1080 (DPR2)، يلتقط الصفحة كاملة + كل طبقة بشفافية، ويصدّر manifest.json للاستيراد في WebGL." />
            <InfoCard icon={Move3d} title="WebGL2 — المشهد ثلاثي الأبعاد" desc="شيدرات DOF وParallax ورفع البطاقات، إضاءة Blinn-Phong وظلال ناعمة PCF، كاميرا Catmull-Rom بمسار منحني." />
            <InfoCard icon={Sparkles} title="الانتقال السينمائي" desc="في الثواني الأخيرة يخفت المشهد ويظهر كارت الختام مع اسم العلامة وعبارة متحركة (typewriter) مع توهج." />
          </section>
        </div>

        {/* لوحة التحكم الدقيق */}
        <aside className="space-y-4 lg:sticky lg:top-[88px] lg:h-fit">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Aperture size={14} className="text-amber-300" /> التحكم الدقيق في الكاميرا والعمق
            </h3>

            <div className="mt-4 space-y-4">
              <Control label="السرعة" value={timeline.config.speed} min={0.2} max={2.5} step={0.1} display={`${timeline.config.speed.toFixed(1)}×`} onChange={timeline.setSpeed} />
              <Control
                label="شدة العمق / Parallax"
                value={timeline.config.depthIntensity}
                min={0}
                max={1}
                step={0.05}
                display={`${Math.round(timeline.config.depthIntensity * 100)}%`}
                onChange={timeline.setDepth}
              />
              <Control label="المسافة البؤرية" value={timeline.config.focusDistance} min={2} max={8} step={0.2} display={timeline.config.focusDistance.toFixed(1)} onChange={timeline.setFocus} />
              <Control label="فتحة العدسة (DOF)" value={timeline.config.aperture} min={0.02} max={0.16} step={0.01} display={timeline.config.aperture.toFixed(3)} onChange={timeline.setAperture} />

              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                <span className="text-xs font-bold">ظلال ناعمة</span>
                <button
                  onClick={() => timeline.updatePathPoint(0, {})}
                  className={`relative h-6 w-10 rounded-full transition ${timeline.config.softShadows ? 'bg-amber-400' : 'bg-white/15'}`}
                  aria-label="تبديل الظلال"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${timeline.config.softShadows ? 'right-0.5' : 'right-[18px]'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={14} className="text-amber-300" /> بطاقة الختام السينمائية
            </h3>
            <div className="mt-3 space-y-3">
              <label className="block space-y-1">
                <span className="text-xs text-slate-400">اسم العلامة</span>
                <input
                  value={finaleBrand}
                  onChange={(e) => setFinaleBrand(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-amber-400/50"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-slate-400">العبارة المتحركة</span>
                <input
                  value={finaleTagline}
                  onChange={(e) => setFinaleTagline(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-amber-400/50"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <button onClick={() => setShowPath((v) => !v)} className="flex w-full items-center justify-between text-sm font-bold">
              <span className="flex items-center gap-2">
                <Timer size={14} className="text-sky-300" /> مسار الكاميرا (7 نقاط)
              </span>
              <span className="text-xs text-slate-500">{showPath ? 'إخفاء' : 'عرض'}</span>
            </button>
            {showPath && (
              <div className="mt-3 space-y-2">
                {timeline.config.path.map((k, i) => (
                  <div key={i} className="rounded-xl bg-slate-900 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">نقطة {i + 1}</span>
                      <span className="font-mono text-xs text-slate-500">{k.t}s</span>
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-400">
                      <span>X {k.position[0].toFixed(2)}</span>
                      <span>Y {k.position[1].toFixed(2)}</span>
                      <span>Z {k.position[2].toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <h4 className="text-sm font-bold text-amber-200">تثبيت أبعاد الصفحة</h4>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
              الأبعاد مثبتة عند <code className="rounded bg-black/20 px-1">1920×1080</code> مع <code className="rounded bg-black/20 px-1">deviceScaleFactor: 2</code> لضمان سلاسة الحركة ومنع قفزات التخطيط. تُطبق تلقائياً في Playwright وWebGL.
            </p>
            <code className="mt-3 block rounded-lg bg-slate-950 p-3 text-xs text-slate-300" dir="ltr">
              {`viewport: { width: 1920, height: 1080,\n  deviceScaleFactor: 2 }`}
            </code>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300">{label}</span>
        <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-amber-300" dir="ltr">
          {display}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-amber-400" />
    </label>
  );
}

function InfoCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ size: number; className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Icon size={14} className="text-amber-300" /> {title}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}
