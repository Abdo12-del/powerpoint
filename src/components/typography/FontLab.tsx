import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Check, RefreshCw, Type } from 'lucide-react';
import {
  applyTypography,
  ARABIC_PANGRAM,
  ARABIC_SAMPLE,
  ensureFontLoaded,
  FONT_CATEGORY_LABELS,
  FONT_LIST,
  FONTS,
  fontStack,
  PRESET_LIST,
  type FontCategory,
  type PresetId,
  type TypographyPreset,
} from '@/fonts';
import { cn } from '@/lib/cn';
import { FontSpecimen } from './FontSpecimen';
import { KineticHeadline } from './KineticHeadline';
import { VariableText } from './VariableText';
import { ClipReveal } from './ClipReveal';
import { HighlightSweep } from './HighlightSweep';
import { FancyText } from './FancyText';
import { CalligraphyText } from './CalligraphyText';
import { NumberRoll } from './NumberRoll';
import { FitText } from './FitText';
import { CALLIGRAPHY_FONT_LIST, type CalligraphyFontId } from '@/fonts/calligraphy';
import { LineShadowText, MorphingText, TextEffect, TextLoop, TextShimmer } from '@/components/gallery';

const CATEGORY_ORDER: FontCategory[] = ['modern', 'kufi', 'naskh', 'ruqaa', 'display', 'rounded', 'latin', 'mono'];

function PresetCard({ preset, active, onApply }: { preset: TypographyPreset; active: boolean; onApply: (id: PresetId) => void }) {
  const f = preset.fonts;
  useEffect(() => {
    Object.values(f).forEach((id) => void ensureFontLoaded(id));
  }, [f]);
  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-5 transition',
        active ? 'border-amber-400/60 bg-amber-400/10' : 'border-white/10 bg-white/[0.04]',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold">{preset.label}</h3>
          <p className="text-sm text-slate-400">{preset.mood}</p>
        </div>
        <button
          type="button"
          onClick={() => onApply(preset.id)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold transition',
            active ? 'bg-amber-400 text-slate-950' : 'bg-white/10 hover:bg-white/15',
          )}
        >
          {active ? <Check size={14} /> : <Type size={14} />}
          {active ? 'مطبَّق' : 'طبّق على الصفحة'}
        </button>
      </header>
      <div className="rounded-xl bg-slate-950/60 p-4">
        <div className="text-3xl font-extrabold leading-tight" style={{ fontFamily: fontStack(FONTS[f.heading]) }}>
          عنوان الشريحة بخط {FONTS[f.heading].label}
        </div>
        <p className="mt-2 text-base text-slate-200" style={{ fontFamily: fontStack(FONTS[f.body]), lineHeight: FONTS[f.body].lineHeight }}>
          نص الفقرة بخط {FONTS[f.body].label}: {ARABIC_SAMPLE}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-4">
          <span className="text-2xl text-amber-300" style={{ fontFamily: fontStack(FONTS[f.display]) }}>
            اقتباس أو شارة بخط {FONTS[f.display].label}
          </span>
          <code className="rounded bg-white/5 px-2 py-0.5 text-sm text-sky-300" style={{ fontFamily: fontStack(FONTS[f.mono]) }}>
            const id = 'ch1-s3'; // {FONTS[f.mono].latinName}
          </code>
        </div>
      </div>
      <pre
        dir="ltr"
        className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300"
      >{`// src/data/typography.ts\nexport const typography: TypographyConfig = { preset: '${preset.id}' };`}</pre>
    </article>
  );
}

/**
 * مختبر الخطوط — يُفتح بإضافة ?lab=fonts إلى عنوان العرض.
 * يعرض كل الخطوط المثبتة حسب نوعها، الاقترانات الجاهزة (مع تطبيق حي)، وحركات النص.
 */
export default function FontLab() {
  const [sample, setSample] = useState(ARABIC_PANGRAM);
  const [size, setSize] = useState(40);
  const [breathe, setBreathe] = useState(false);
  const [filter, setFilter] = useState<FontCategory | 'all'>('all');
  const [active, setActive] = useState<PresetId>('default');
  const [replay, setReplay] = useState(0);
  const [calliFont, setCalliFont] = useState<CalligraphyFontId>('aref-ruqaa');
  const [calliText, setCalliText] = useState('بسم الله الرحمن الرحيم');
  const [calliMode, setCalliMode] = useState<'draw' | 'draw-fill' | 'fill'>('draw-fill');
  const [counter, setCounter] = useState(1284);

  const groups = useMemo(
    () =>
      CATEGORY_ORDER.filter((c) => filter === 'all' || c === filter).map((c) => ({ category: c, fonts: FONT_LIST.filter((f) => f.category === c) })),
    [filter],
  );

  const apply = (id: PresetId) => {
    setActive(id);
    void applyTypography({ preset: id });
  };

  return (
    <main dir="rtl" className="min-h-full overflow-y-auto bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-amber-300">القالب · مختبر الخطوط</div>
            <h1 className="mt-1 text-4xl font-black">الخطوط وأنواعها وحركتها</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              {FONT_LIST.length} خطاً مثبتاً دون اتصال (fontsource) مصنّفة حسب النوع، و{PRESET_LIST.length} اقترانات جاهزة. اختر اقتراناً ثم انسخ
              السطر إلى <code>src/data/typography.ts</code>. الدليل الكامل في <code>docs/TYPOGRAPHY.md</code>.
            </p>
          </div>
          <a
            href={window.location.pathname}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10"
          >
            العودة إلى العرض <ArrowRight size={16} />
          </a>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">الاقترانات الجاهزة</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {PRESET_LIST.map((p) => (
              <PresetCard key={p.id} preset={p} active={active === p.id} onApply={apply} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold">حركات النص العربي</h2>
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15"
            >
              <RefreshCw size={14} /> إعادة التشغيل
            </button>
          </div>
          <div key={replay} className="grid gap-4 md:grid-cols-2">
            <Demo title="KineticHeadline — كلمات + نمو الوزن">
              <KineticHeadline as="h3" className="text-3xl" text="عنوان حركي ينمو وزنه كلمةً كلمة" highlight={['وزنه']} />
            </Demo>
            <Demo title="VariableText — تنفّس الوزن (wght)">
              <VariableText as="div" mode="loop" from={200} to={900} duration={1.6} className="text-4xl">
                خط متغيّر يتنفّس
              </VariableText>
            </Demo>
            <Demo title="ClipReveal — كشف بقناع من اليمين">
              <ClipReveal as="h3" className="text-3xl font-extrabold">
                يُكشف النص كتلةً واحدة
              </ClipReveal>
            </Demo>
            <Demo title="HighlightSweep — تظليل يُمسح">
              <p className="text-2xl">
                ارتفعت النتيجة إلى <HighlightSweep>٩٥٪ من الحالات</HighlightSweep> خلال عام
              </p>
            </Demo>
            <Demo title="FancyText — تدرج متحرك / حدود / توهج">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-3xl font-black">
                <FancyText variant="gradient" animated>
                  تدرج
                </FancyText>
                <FancyText variant="outline">حدود</FancyText>
                <FancyText variant="glow">توهج</FancyText>
                <FancyText variant="shadow3d">ظل</FancyText>
              </div>
            </Demo>
            <Demo title="VariableText — محور العرض wdth (Noto Sans Arabic)">
              <VariableText
                as="div"
                axis="wdth"
                from={62.5}
                to={100}
                mode="loop"
                duration={2}
                className="text-4xl font-bold"
                style={{ fontFamily: fontStack(FONTS['noto-sans-arabic']) }}
              >
                يتمدّد وينكمش
              </VariableText>
            </Demo>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold">الخط يُكتب — HarfBuzz + SVG</h2>
              <p className="mt-1 text-sm text-slate-400">
                النص يُشكَّل إلى مسارات حقيقية (حروف متصلة بحركاتها) ثم يُرسم بالقلم من اليمين. {CALLIGRAPHY_FONT_LIST.length} خطوط ثابتة قابلة للرسم.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15"
            >
              <RefreshCw size={14} /> إعادة الكتابة
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <input
              value={calliText}
              onChange={(e) => setCalliText(e.target.value)}
              className="min-w-64 flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
            />
            <div className="flex flex-wrap gap-1.5">
              {CALLIGRAPHY_FONT_LIST.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCalliFont(f.id)}
                  title={f.bestFor}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold transition',
                    calliFont === f.id ? 'bg-amber-400 text-slate-950' : 'bg-white/10 hover:bg-white/15',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {(['draw-fill', 'draw', 'fill'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCalliMode(m)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold transition',
                    calliMode === m ? 'bg-sky-400 text-slate-950' : 'bg-white/10 hover:bg-white/15',
                  )}
                >
                  {m === 'draw-fill' ? 'رسم ثم تعبئة' : m === 'draw' ? 'رسم فقط' : 'ظهور تدريجي'}
                </button>
              ))}
            </div>
          </div>
          <div
            key={`calli-${replay}-${calliFont}-${calliMode}`}
            className="flex min-h-40 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-6"
          >
            <CalligraphyText text={calliText} font={calliFont} size={88} mode={calliMode} duration={3.5} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">مشاريع حركة النص المثبّتة</h2>
          <div key={`projects-${replay}`} className="grid gap-4 md:grid-cols-2">
            <Demo title="NumberRoll — number-flow: الخانات تتدحرج">
              <div className="flex flex-wrap items-center gap-4">
                <NumberRoll value={counter} suffix=" خرّيجاً" className="text-4xl font-black text-amber-300" />
                <NumberRoll
                  value={counter / 1500}
                  format={{ style: 'percent', maximumFractionDigits: 1 }}
                  locales="ar-DZ"
                  className="text-3xl font-bold text-sky-300"
                />
                <button
                  type="button"
                  onClick={() => setCounter((n) => n + Math.round(Math.random() * 400 - 150))}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold hover:bg-white/15"
                >
                  غيّر القيمة
                </button>
              </div>
            </Demo>
            <Demo title="FitText — fitty: العنوان يملأ العرض">
              <FitText as="div" minSize={24} maxSize={120} className="font-black text-slate-100">
                دفعة ٢٠٢٦
              </FitText>
            </Demo>
            <Demo title="TextEffect — motion-primitives: كلمات بضبابية (حارس العربية يمنع التفكيك)">
              <TextEffect as="h3" per="char" preset="fade-in-blur" className="text-3xl font-bold">
                تظهر الكلمات واحدة تلو الأخرى بضبابية خفيفة
              </TextEffect>
            </Demo>
            <Demo title="TextLoop — motion-primitives: تبديل كلمة في جملة">
              <p className="text-3xl font-bold">
                مشروع{' '}
                <TextLoop className="text-amber-300" interval={1.8}>
                  <span>ناجح</span>
                  <span>مبتكر</span>
                  <span>قابل للتوسّع</span>
                </TextLoop>
              </p>
            </Demo>
            <Demo title="TextShimmer — motion-primitives: لمعة تمرّ على النص">
              <TextShimmer as="h3" className="text-3xl font-bold" duration={1.6}>
                جارٍ تحميل النتائج…
              </TextShimmer>
            </Demo>
            <Demo title="LineShadowText — Magic UI: ظل مخطّط متحرك">
              <LineShadowText as="h3" className="text-4xl font-black" shadowColor="#fbbf24">
                التخرّج
              </LineShadowText>
            </Demo>
            <Demo title="MorphingText — Magic UI: تحوّل بين كلمات كاملة">
              <MorphingText className="h-20 text-[2.5rem] lg:text-[3.5rem]" texts={['تحليل', 'تصميم', 'تنفيذ', 'اختبار']} />
            </Demo>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold">الكتالوج حسب النوع</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <input
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              placeholder="اكتب نص الاختبار…"
              className="min-w-64 flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-amber-400/60"
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              الحجم <input type="range" min={20} max={96} value={size} onChange={(e) => setSize(Number(e.target.value))} />{' '}
              <span dir="ltr" className="font-mono text-xs">
                {size}px
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={breathe} onChange={(e) => setBreathe(e.target.checked)} /> حركة الوزن
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['all', ...CATEGORY_ORDER] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold transition',
                    filter === c ? 'bg-amber-400 text-slate-950' : 'bg-white/10 hover:bg-white/15',
                  )}
                >
                  {c === 'all' ? 'الكل' : FONT_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          {groups.map(({ category, fonts }) => (
            <div key={category} className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-amber-200">
                {FONT_CATEGORY_LABELS[category]} <span className="rounded-full bg-white/10 px-2 text-xs text-slate-300">{fonts.length}</span>
              </h3>
              <div className="grid gap-4">
                {fonts.map((f) => (
                  <FontSpecimen key={f.id} font={f} sample={sample} size={size} breathe={breathe} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-3 text-xs font-bold text-slate-400" dir="ltr">
        <span dir="rtl">{title}</span>
      </div>
      {children}
    </div>
  );
}
