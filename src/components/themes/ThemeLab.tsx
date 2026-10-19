import { useState } from 'react';
import { ArrowRight, Check, Palette, Sparkles } from 'lucide-react';
import type { PresentationBranding, ThemeBackdrop, ThemeMode } from '@/types/presentation';
import { BrandChrome } from './BrandChrome';
import { chapterPaletteStyle, deriveChapterPalette } from './palette';

const MODE_OPTIONS: { id: ThemeMode; title: string; detail: string }[] = [
  { id: 'dark', title: 'داكن', detail: 'كحلي وذهبي' },
  { id: 'light', title: 'فاتح', detail: 'ورقي وهادئ' },
  { id: 'corporate', title: 'مؤسسي', detail: 'أزرق رسمي' },
];

const BACKDROP_OPTIONS: { id: ThemeBackdrop; title: string }[] = [
  { id: 'aurora', title: 'Aurora' },
  { id: 'mesh', title: 'Mesh' },
  { id: 'grid', title: 'Grid' },
  { id: 'noise', title: 'Noise' },
  { id: 'none', title: 'بدون' },
];

const SAMPLE_BRANDING: PresentationBranding = {
  university: 'جامعة الأفق',
  unit: 'كلية العلوم والتقنية',
  footer: 'مؤتمر الابتكار الجامعي · 2026 · نموذج توضيحي',
};

const CHAPTERS = [
  { id: 'engineering', title: 'الهندسة', color: '#0ea5e9', description: 'سماوي' },
  { id: 'research', title: 'البحث العلمي', color: '#a855f7', description: 'بنفسجي' },
  { id: 'impact', title: 'الأثر', color: '#10b981', description: 'زمردي' },
];

/** مختبر السمات والهوية: ?lab=themes — معاينة حية لأوضاع العرض والخلفيات وشعار الجامعة. */
export default function ThemeLab() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [backdrop, setBackdrop] = useState<ThemeBackdrop>('aurora');

  return (
    <main dir="rtl" className="min-h-dvh overflow-y-auto bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-amber-300">القالب · مختبر السمات والهوية</div>
            <h1 className="mt-1 text-4xl font-black">ألوان العرض وخلفياته</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              اختر سمة العرض وخلفيته، وعاين لوحة فصل مشتقة من لون أساس بواسطة Culori. إعداد شعار الجامعة والذيل الثابت اختياري في
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5" dir="ltr">src/data/presentation.tsx</code>.
            </p>
          </div>
          <a
            href={window.location.pathname}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            العودة إلى العرض <ArrowRight size={16} />
          </a>
        </header>

        <section aria-label="اختيار سمة العرض" className="flex flex-wrap gap-2">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={mode === option.id}
              onClick={() => setMode(option.id)}
              className={`flex min-w-32 items-center gap-2 rounded-xl border px-4 py-2 text-start text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                mode === option.id ? 'border-amber-300/60 bg-amber-300/15 text-amber-100' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10'
              }`}
            >
              <Palette className="h-4 w-4" />
              <span>
                <span className="block font-bold">{option.title}</span>
                <span className="block text-xs opacity-70">{option.detail}</span>
              </span>
            </button>
          ))}
        </section>

        <section aria-label="اختيار خلفية العرض" className="flex flex-wrap items-center gap-2">
          <span className="me-2 text-sm font-semibold text-slate-400">الخلفية:</span>
          {BACKDROP_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={backdrop === option.id}
              onClick={() => setBackdrop(option.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                backdrop === option.id ? 'border-sky-300/60 bg-sky-300/15 text-sky-100' : 'border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              {option.title}
            </button>
          ))}
        </section>

        <section
          aria-label="معاينة الهوية المؤسسية"
          className="presentation-shell relative min-h-[40rem] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl"
          data-presentation-theme={mode}
          data-presentation-backdrop={backdrop}
        >
          <div aria-hidden="true" className="presentation-backdrop" />
          <BrandChrome branding={SAMPLE_BRANDING} />
          <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-28 sm:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-slate-400">
                <Sparkles className="h-3.5 w-3.5" /> معاينة حيّة · {MODE_OPTIONS.find((option) => option.id === mode)?.title}
              </div>
              <h2 className="mt-5 text-3xl font-black sm:text-4xl">هوية متناسقة من العنوان إلى الخاتمة</h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-slate-300">
                يتغيّر التباين وأدوار الألوان تلقائياً مع السمة، بينما يحتفظ كل فصل بلونه المميّز وتدرّجه المتناغم.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">
                  <Check className="h-4 w-4" /> لون التمييز
                </span>
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">وضوح عربي RTL</span>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {CHAPTERS.map((chapter) => {
                const palette = deriveChapterPalette(chapter.color, mode);
                const swatches = [palette.accent, palette.analogous[0], palette.complementary, palette.triad[0], palette.triad[1]];
                return (
                  <article
                    key={chapter.id}
                    className="chapter-palette-scope chapter-palette-card rounded-2xl border p-5 shadow-lg"
                    style={chapterPaletteStyle(chapter.color)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-400">فصل · {chapter.description}</div>
                        <h3 className="mt-1 text-xl font-extrabold">{chapter.title}</h3>
                      </div>
                      <span className="chapter-palette-icon chapter-palette-border flex h-11 w-11 items-center justify-center rounded-xl border text-lg font-black">
                        {chapter.title.slice(0, 1)}
                      </span>
                    </div>
                    <div className="mt-5 flex gap-2" aria-label={`لوحة ألوان ${chapter.title}`}>
                      {swatches.map((swatch, index) => (
                        <span
                          key={`${chapter.id}-${index}`}
                          className="h-7 flex-1 rounded-lg border border-black/10 shadow-sm"
                          style={{ backgroundColor: swatch }}
                          title={swatch}
                        />
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-slate-400" dir="ltr">
                      {chapter.color} · OKLCH harmony
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold">إعداد موجز</h2>
          <pre dir="ltr" className="mt-3 overflow-x-auto rounded-xl bg-slate-950/70 p-4 text-xs leading-6 text-sky-200 sm:text-sm">
{`theme: { mode: '${mode}', backdrop: '${backdrop}' },
branding: {
  university: 'اسم الجامعة',
  logoSrc: '/branding/university.svg',
  logoAlt: 'شعار الجامعة',
  footer: 'الكلية · السنة الجامعية',
},
// لكل ChapterData:
brandColor: '#0ea5e9', // لوحة متناغمة يشتقها Culori`}
          </pre>
          <p className="mt-3 text-sm text-slate-400">
            الشعار المرسوم في المعاينة علامة افتراضية فقط؛ ضع شعار الجامعة المرخّص في <code dir="ltr">public/branding/</code> وحدّد نصه البديل.
          </p>
        </section>
      </div>
    </main>
  );
}
