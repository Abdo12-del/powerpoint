import { memo, useMemo, useState } from 'react';
import { Aperture, Camera, ChevronDown, Layers, Plus, RotateCcw, Sun, Timer, Trash2, Wand2 } from 'lucide-react';
import type { CameraKeyframe, CameraPathPreset, FlyoverConfig } from '@/cinematic/types';
import { DEFAULT_FLYOVER_CONFIG, DEFAULT_LIGHTING, DEFAULT_DOF, DEFAULT_DEPTH } from '@/cinematic/types';
import { generatePresetPath } from '@/cinematic/camera';
import { cn } from '@/lib/cn';

export interface CameraControlsProps {
  config: FlyoverConfig;
  onChange: (config: FlyoverConfig) => void;
  /** زمن مقطعي بالثواني لنقطة الكاميرا المختارة */
  onPickKeyframe?: (t: number) => void;
  accent?: string;
  className?: string;
}

const PRESETS: { id: CameraPathPreset; label: string; hint: string }[] = [
  { id: 'flyover', label: 'تحليق أمامي', hint: 'اقتراب سينمائي من الصفحة' },
  { id: 'orbit', label: 'دوران', hint: 'دوران 360° حول المركز' },
  { id: 'dolly', label: 'دوللي', hint: 'اقتراب مستقيم هادئ' },
  { id: 'crane', label: 'رافعة', hint: 'نزول عمودي من الأعلى' },
  { id: 'lateral', label: 'انزلاق جانبي', hint: 'عبور أفقي أمام المشهد' },
];

export const CameraControls = memo(function CameraControls({ config, onChange, onPickKeyframe, className }: CameraControlsProps) {
  const [tab, setTab] = useState<'camera' | 'depth' | 'light' | 'final'>('camera');
  const [selectedKf, setSelectedKf] = useState(0);

  const patch = (p: Partial<FlyoverConfig>) => onChange({ ...config, ...p });
  const patchCamera = (p: Partial<FlyoverConfig['camera']>) => patch({ camera: { ...config.camera, ...p } });
  const patchDepth = (p: Partial<FlyoverConfig['depth']>) => patch({ depth: { ...config.depth, ...p } });
  const patchDof = (p: Partial<FlyoverConfig['dof']>) => patch({ dof: { ...config.dof, ...p } });
  const patchLight = (p: Partial<FlyoverConfig['lighting']>) => patch({ lighting: { ...config.lighting, ...p } });
  const patchFinal = (p: Partial<FlyoverConfig['finalCard']>) => patch({ finalCard: { ...config.finalCard, ...p } });

  const kf = config.camera.keyframes[Math.min(selectedKf, config.camera.keyframes.length - 1)];

  const updateKeyframe = (idx: number, next: Partial<CameraKeyframe>) => {
    const keyframes = config.camera.keyframes.map((k, i) => (i === idx ? { ...k, ...next } : k));
    patchCamera({ keyframes, preset: 'custom' });
  };

  const addKeyframe = () => {
    const last = config.camera.keyframes[config.camera.keyframes.length - 1];
    const prev = config.camera.keyframes[config.camera.keyframes.length - 2] ?? last;
    const t = Math.min(0.98, last.t + (last.t - prev.t) * 0.6 + 0.02);
    const next: CameraKeyframe = {
      t,
      position: [last.position[0], last.position[1], last.position[2] * 0.9],
      target: [...last.target],
      fov: last.fov,
    };
    patchCamera({ keyframes: [...config.camera.keyframes, next], preset: 'custom' });
    setSelectedKf(config.camera.keyframes.length);
  };

  const removeKeyframe = (idx: number) => {
    if (config.camera.keyframes.length <= 2) return;
    patchCamera({ keyframes: config.camera.keyframes.filter((_, i) => i !== idx), preset: 'custom' });
    setSelectedKf(Math.max(0, idx - 1));
  };

  const tabs = [
    { id: 'camera' as const, label: 'الكاميرا', icon: Camera },
    { id: 'depth' as const, label: 'العمق', icon: Layers },
    { id: 'light' as const, label: 'الإضاءة', icon: Sun },
    { id: 'final' as const, label: 'الختام', icon: Wand2 },
  ];

  const keyframeTicks = useMemo(() => config.camera.keyframes.map((k) => k.t), [config.camera.keyframes]);

  return (
    <div className={cn('rounded-2xl border border-white/10 bg-[#080d18]/80 backdrop-blur-xl', className)}>
      {/* التبويبات */}
      <div className="flex gap-1 border-b border-white/10 p-2" role="tablist" aria-label="إعدادات العرض السينمائي">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-extrabold transition',
                tab === t.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="max-h-[520px] space-y-4 overflow-y-auto p-4">
        {tab === 'camera' && (
          <>
            <Section title="مسار جاهز">
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      patch({ camera: { ...generatePresetPath(p.id), easing: config.camera.easing, handheld: config.camera.handheld } });
                      setSelectedKf(0);
                    }}
                    title={p.hint}
                    className={cn(
                      'rounded-lg border px-2 py-1.5 text-[11px] font-bold transition',
                      config.camera.preset === p.id
                        ? 'border-amber-300/40 bg-amber-400/15 text-amber-100'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07]',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-slate-500">{PRESETS.find((p) => p.id === config.camera.preset)?.hint ?? 'مسار مخصص'}</p>
            </Section>

            <Section title="التوقيت">
              <Slider label="المدة الكلية" value={config.speed.duration} min={6} max={45} step={1} unit="ث" onChange={(v) => patch({ speed: { ...config.speed, duration: v } })} />
              <Slider label="مضاعف السرعة" value={config.speed.multiplier} min={0.25} max={2} step={0.05} unit="×" onChange={(v) => patch({ speed: { ...config.speed, multiplier: v } })} />
              <Slider
                label="تذبذب الكاميرا"
                value={config.camera.handheld?.amount ?? 0}
                min={0}
                max={0.05}
                step={0.002}
                unit=""
                format={(v) => v.toFixed(3)}
                onChange={(v) =>
                  patchCamera({ handheld: v > 0 ? { amount: v, frequency: config.camera.handheld?.frequency ?? 1.2 } : undefined })
                }
              />
              <label className="mt-1 flex items-center justify-between text-[11px] font-bold text-slate-400">
                منحنى الحركة
                <select
                  value={config.camera.easing}
                  onChange={(e) => patchCamera({ easing: e.target.value as FlyoverConfig['camera']['easing'] })}
                  className="rounded-md border border-white/10 bg-slate-900 px-1.5 py-1 text-[11px] text-slate-200"
                  dir="ltr"
                >
                  {['cinematic', 'linear', 'easeInOut', 'easeIn', 'easeOut'].map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </label>
            </Section>

            <Section
              title="نقاط الكاميرا"
              action={
                <div className="flex items-center gap-1">
                  <button type="button" onClick={addKeyframe} aria-label="إضافة نقطة" className="rounded-md border border-white/10 bg-white/[0.04] p-1 text-slate-300 hover:bg-white/10">
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeKeyframe(selectedKf)}
                    aria-label="حذف النقطة"
                    disabled={config.camera.keyframes.length <= 2}
                    className="rounded-md border border-white/10 bg-white/[0.04] p-1 text-slate-300 hover:bg-rose-500/20 disabled:opacity-30"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              }
            >
              <div className="mb-2 flex flex-wrap gap-1">
                {config.camera.keyframes.map((k, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedKf(i);
                      onPickKeyframe?.(k.t * config.speed.duration);
                    }}
                    className={cn(
                      'rounded-md border px-1.5 py-0.5 font-mono text-[10px] transition',
                      selectedKf === i ? 'border-amber-300/50 bg-amber-400/15 text-amber-200' : 'border-white/10 text-slate-500 hover:text-slate-300',
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {kf && (
                <div className="space-y-2">
                  <Slider
                    label="الزمن t"
                    value={kf.t}
                    min={0}
                    max={1}
                    step={0.01}
                    unit=""
                    format={(v) => v.toFixed(2)}
                    onChange={(v) => {
                      // حافظ على ترتيب النقاط: لا تتجاوز الجارة السابقة/التالية
                      const prev = config.camera.keyframes[selectedKf - 1];
                      const next = config.camera.keyframes[selectedKf + 1];
                      const lo = prev ? Math.min(1, prev.t + 0.01) : 0;
                      const hi = next ? Math.max(0, next.t - 0.01) : 1;
                      updateKeyframe(selectedKf, { t: Math.min(hi, Math.max(lo, v)) });
                    }}
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['x', 'y', 'z'] as const).map((axis, i) => (
                      <NumberField
                        key={`pos-${axis}`}
                        label={`موضع ${axis}`}
                        value={kf.position[i]}
                        step={0.1}
                        onChange={(v) => {
                          const position = [...kf.position] as [number, number, number];
                          position[i] = v;
                          updateKeyframe(selectedKf, { position });
                        }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['x', 'y', 'z'] as const).map((axis, i) => (
                      <NumberField
                        key={`target-${axis}`}
                        label={`هدف ${axis}`}
                        value={kf.target[i]}
                        step={0.1}
                        onChange={(v) => {
                          const target = [...kf.target] as [number, number, number];
                          target[i] = v;
                          updateKeyframe(selectedKf, { target });
                        }}
                      />
                    ))}
                  </div>
                  <Slider
                    label="زاوية الرؤية FOV"
                    value={kf.fov ?? 40}
                    min={20}
                    max={75}
                    step={1}
                    unit="°"
                    onChange={(v) => updateKeyframe(selectedKf, { fov: v })}
                  />
                  <Slider
                    label="دوران Roll"
                    value={kf.roll ?? 0}
                    min={-12}
                    max={12}
                    step={0.5}
                    unit="°"
                    onChange={(v) => updateKeyframe(selectedKf, { roll: v })}
                  />
                </div>
              )}
              <p className="mt-2 font-mono text-[9px] text-slate-600" dir="ltr">
                {keyframeTicks.map((t) => t.toFixed(2)).join(' · ')}
              </p>
            </Section>
          </>
        )}

        {tab === 'depth' && (
          <>
            <Section title="العمق والـ parallax">
              <Slider label="مقياس العمق" value={config.depth.scale} min={0} max={2} step={0.05} unit="×" onChange={(v) => patchDepth({ scale: v })} />
              <Slider label="مدى العمق" value={config.depth.range} min={0.2} max={2} step={0.05} unit="×" onChange={(v) => patchDepth({ range: v })} />
              <Slider label="قوة الـ parallax" value={config.depth.parallaxStrength} min={0} max={1.5} step={0.05} onChange={(v) => patchDepth({ parallaxStrength: v })} />
              <Slider label="رفع البطاقات" value={config.depth.cardLift} min={0} max={80} step={1} unit="px" onChange={(v) => patchDepth({ cardLift: v })} />
              <Slider label="ميل البطاقات" value={config.depth.cardTilt} min={0} max={12} step={0.5} unit="°" onChange={(v) => patchDepth({ cardTilt: v })} />
              <Slider label="تتابع الرفع" value={config.depth.cardStagger} min={0} max={0.3} step={0.01} unit="ث" format={(v) => v.toFixed(2)} onChange={(v) => patchDepth({ cardStagger: v })} />
            </Section>

            <Section
              title="عمق الميدان (DoF)"
              action={
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.dof.enabled}
                  onClick={() => patchDof({ enabled: !config.dof.enabled })}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition',
                    config.dof.enabled ? 'bg-amber-400' : 'bg-white/15',
                  )}
                >
                  <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-slate-950 transition', config.dof.enabled ? 'start-4.5' : 'start-0.5')} />
                </button>
              }
            >
              <Slider label="مسافة التركيز" value={config.dof.focusDistance} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => patchDof({ focusDistance: v })} disabled={!config.dof.enabled} />
              <Slider label="نطاق التركيز" value={config.dof.focusRange} min={0.05} max={0.8} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => patchDof({ focusRange: v })} disabled={!config.dof.enabled} />
              <Slider label="شدة الضبابية" value={config.dof.intensity} min={0} max={1} step={0.05} onChange={(v) => patchDof({ intensity: v })} disabled={!config.dof.enabled} />
              <Slider label="أقصى تشويش" value={config.dof.maxBlur} min={0} max={30} step={1} unit="px" onChange={(v) => patchDof({ maxBlur: v })} disabled={!config.dof.enabled} />
            </Section>

            <Section title="أبعاد الصفحة المثبتة">
              <div className="grid grid-cols-2 gap-1.5">
                <NumberField
                  label="العرض"
                  value={config.dimensions.width}
                  step={10}
                  onChange={(v) => patch({ dimensions: { ...config.dimensions, width: Math.max(320, Math.round(v)) } })}
                />
                <NumberField
                  label="الارتفاع"
                  value={config.dimensions.height}
                  step={10}
                  onChange={(v) => patch({ dimensions: { ...config.dimensions, height: Math.max(240, Math.round(v)) } })}
                />
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                تثبيت الأبعاد يمنع تذبذب الكاميرا أثناء التحجيم. كل الطبقات تُحسب نسبةً إلى هذه المساحة.
              </p>
            </Section>

            <Section title="الوصول">
              <label className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                احترام تقليل الحركة
                <input
                  type="checkbox"
                  checked={config.respectReducedMotion}
                  onChange={(e) => patch({ respectReducedMotion: e.target.checked })}
                  className="h-4 w-4 accent-amber-400"
                />
              </label>
              <label className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                تكرار تلقائي
                <input type="checkbox" checked={config.loop} onChange={(e) => patch({ loop: e.target.checked })} className="h-4 w-4 accent-amber-400" />
              </label>
            </Section>
          </>
        )}

        {tab === 'light' && (
          <>
            <Section title="إضاءة">
              <Slider label="المحيطية" value={config.lighting.ambient.intensity} min={0} max={2} step={0.05} onChange={(v) => patchLight({ ambient: { ...config.lighting.ambient, intensity: v } })} />
              <Slider label="الرئيسية" value={config.lighting.directional.intensity} min={0} max={2} step={0.05} onChange={(v) => patchLight({ directional: { ...config.lighting.directional, intensity: v } })} />
              <Slider label="التكميلية" value={config.lighting.fill.intensity} min={0} max={2} step={0.05} onChange={(v) => patchLight({ fill: { ...config.lighting.fill, intensity: v } })} />
            </Section>
            <Section title="الظلال">
              <label className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                ظلال ناعمة
                <input
                  type="checkbox"
                  checked={config.lighting.softShadows}
                  onChange={(e) => patchLight({ softShadows: e.target.checked })}
                  className="h-4 w-4 accent-amber-400"
                />
              </label>
              <Slider label="قتامة الظل" value={config.lighting.shadowDarkness} min={0} max={1} step={0.05} onChange={(v) => patchLight({ shadowDarkness: v })} disabled={!config.lighting.softShadows} />
              <Slider label="تشويش الظل" value={config.lighting.shadowBlur} min={0} max={40} step={1} unit="px" onChange={(v) => patchLight({ shadowBlur: v })} disabled={!config.lighting.softShadows} />
            </Section>
            <button
              type="button"
              onClick={() => patchLight(DEFAULT_LIGHTING)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-[11px] font-bold text-slate-400 hover:bg-white/[0.07]"
            >
              <RotateCcw className="h-3 w-3" /> استعادة إضاءة القالب
            </button>
          </>
        )}

        {tab === 'final' && (
          <>
            <Section title="هوية البطاقة الختامية">
              <label className="block text-[11px] font-bold text-slate-400">
                اسم العلامة
                <input
                  value={config.finalCard.brand}
                  onChange={(e) => patchFinal({ brand: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-sm font-bold text-slate-100 outline-none focus:border-amber-300/50"
                />
              </label>
              <label className="block text-[11px] font-bold text-slate-400">
                العبارة المتحركة
                <textarea
                  value={config.finalCard.tagline}
                  onChange={(e) => patchFinal({ tagline: e.target.value })}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-300/50"
                />
              </label>
              <label className="block text-[11px] font-bold text-slate-400">
                انتقال الظهور
                <select
                  value={config.finalCard.transition}
                  onChange={(e) => patchFinal({ transition: e.target.value as FlyoverConfig['finalCard']['transition'] })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-200"
                >
                  <option value="parallax">Parallax</option>
                  <option value="zoom">Zoom</option>
                  <option value="fade">Fade</option>
                  <option value="reveal">Reveal</option>
                </select>
              </label>
              <Slider
                label="مدة الانتقال"
                value={config.finalCard.transitionDuration}
                min={0.4}
                max={3}
                step={0.1}
                unit="ث"
                format={(v) => v.toFixed(1)}
                onChange={(v) => patchFinal({ transitionDuration: v })}
              />
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-[10px] leading-relaxed text-slate-500">
                يبدأ الانتقال تلقائياً عند <span className="font-mono text-slate-300" dir="ltr">t = 0.84</span> من المدة، ويستمر حتى بطاقة الختام.
              </div>
            </Section>

            <button
              type="button"
              onClick={() =>
                onChange({
                  ...DEFAULT_FLYOVER_CONFIG,
                  dimensions: config.dimensions,
                  camera: config.camera,
                  finalCard: config.finalCard,
                  speed: config.speed,
                })
              }
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-[11px] font-bold text-slate-400 hover:bg-white/[0.07]"
            >
              <RotateCcw className="h-3 w-3" /> استعادة العرض/العمق
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Timer className="h-3 w-3" /> {config.speed.duration.toFixed(0)}s · {config.camera.keyframes.length} نقاط
        </span>
        <span className="inline-flex items-center gap-1">
          <Aperture className="h-3 w-3" /> DoF {config.dof.enabled ? `${Math.round(config.dof.intensity * 100)}٪` : 'مغلق'}
        </span>
        <span className="inline-flex items-center gap-1">
          <Camera className="h-3 w-3" /> {config.camera.preset}
        </span>
      </div>
    </div>
  );
});

// ─── عناصر واجهة صغيرة ──────────────────────────────────────
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-xl border border-white/[0.07] bg-white/[0.02]">
      <header className="flex items-center justify-between gap-2 px-3 py-2">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-300">
          <ChevronDown className={cn('h-3 w-3 text-slate-500 transition', !open && '-rotate-90')} />
          {title}
        </button>
        {action}
      </header>
      {open && <div className="space-y-2 px-3 pb-3">{children}</div>}
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  format,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn('block', disabled && 'pointer-events-none opacity-40')}>
      <span className="flex items-baseline justify-between text-[10px] font-bold text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-[10px] text-slate-300" dir="ltr">
          {format ? format(value) : value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </span>
      </span>
      <input
        type="range"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-400"
      />
    </label>
  );
}

function NumberField({ label, value, step, onChange }: { label: string; value: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="block text-[9px] font-bold text-slate-500">{label}</span>
      <input
        type="number"
        dir="ltr"
        value={Number.isFinite(value) ? Number(value.toFixed(2)) : 0}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 w-full rounded-md border border-white/10 bg-slate-900/80 px-1.5 py-1 font-mono text-[10px] text-slate-200 outline-none focus:border-amber-300/50"
      />
    </label>
  );
}

export { DEFAULT_DEPTH, DEFAULT_DOF };
