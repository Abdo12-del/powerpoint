import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Image, MonitorPlay, Smartphone, ZoomIn } from 'lucide-react';
import { DeviceFrame, MediaGallery, MediaVideo, PanZoomImage, ZoomImage } from './index';

const galleryItems = [
  {
    src: '/media/lab/dashboard.svg',
    alt: 'لوحة تحكم رقمية تعرض ملخص المؤشرات',
    caption: 'لوحة تحكم — اضغط الصورة لتكبيرها أو اسحب للانتقال.',
    aspectRatio: '16/9',
  },
  {
    src: '/media/lab/analytics.svg',
    alt: 'رسم بياني لتطور النتائج على مدار أربعة أشهر',
    caption: 'تحليلات شهرية — صور SVG حادة مهما كان مستوى التكبير.',
    aspectRatio: '16/9',
  },
  {
    src: '/media/lab/mobile.svg',
    alt: 'واجهة تطبيق هاتف لمتابعة المهام',
    caption: 'واجهة الهاتف — صور المعرض تُحمّل عند الحاجة فقط.',
    aspectRatio: '16/9',
  },
];

export function MediaLab() {
  const [draft, setDraft] = useState('');
  const [source, setSource] = useState('');
  const [autoPlay, setAutoPlay] = useState(true);

  function loadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSource = draft.trim();
    if (nextSource) setSource(nextSource);
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#080d18] px-5 py-10 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 border-b border-white/10 pb-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-amber-300">MEDIA TOOLKIT · RTL</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">الصور والفيديو</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            معرض قابل للسحب، تكبير متاح بلوحة المفاتيح واللمس، إطارات أجهزة، ومشغّل يوقف الفيديو فور مغادرة الشريحة.
            الصور مؤجلة التحميل مع مساحة محجوزة وموضع ضبابي اختياري.
          </p>
        </header>

        <section className="mb-12 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300"><ZoomIn size={20} aria-hidden /></span>
              <div>
                <h2 className="font-semibold">تكبير بالصورة الأصلية</h2>
                <p className="mt-1 text-xs text-slate-400">react-medium-image-zoom · زر وصول مستقل للصورة</p>
              </div>
            </div>
            <ZoomImage
              src="/media/lab/dashboard.svg"
              zoomSrc="/media/lab/dashboard.svg"
              alt="لوحة تحكم فيها بطاقات أرقام ومخطط نمو"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%231e293b'/%3E%3C/svg%3E"
              aspectRatio="16/9"
              className="rounded-2xl border border-white/10"
              imageClassName="rounded-2xl"
            />
            <p className="mt-3 text-xs leading-6 text-slate-400">يُحمّل مكوّن التكبير وCSS الخاص به عند الحاجة، وتبقى الصورة قابلة للتحجيم على الهاتف.</p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-300/10 text-sky-300"><Image size={20} aria-hidden /></span>
              <div>
                <h2 className="font-semibold">تحريك وتكبير حر</h2>
                <p className="mt-1 text-xs text-slate-400">react-zoom-pan-pinch · عجلة، لمس، وأزرار</p>
              </div>
            </div>
            <PanZoomImage
              src="/media/lab/analytics.svg"
              alt="مخطط اتجاهات ومؤشرات لأربعة أشهر"
              aspectRatio="16/9"
              viewerHeight={260}
              className="rounded-2xl"
            />
            <p className="mt-3 text-xs leading-6 text-slate-400">اسحب الصورة، كبّر بعجلة الفأرة أو بإيماءة القرص، أو استخدم أزرار التحكم.</p>
          </article>
        </section>

        <section className="mb-12 rounded-3xl border border-white/10 bg-slate-900/50 p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-amber-300">EMBLA CAROUSEL</p>
              <h2 className="text-xl font-semibold">معرض الصور</h2>
            </div>
            <p className="text-xs text-slate-400">اسحب، استخدم الأسهم، أو اختر نقطة للتنقّل.</p>
          </div>
          <MediaGallery items={galleryItems} direction="rtl" zoomable loop />
        </section>

        <section className="mb-12">
          <div className="mb-5">
            <p className="mb-1 text-xs font-medium text-violet-300">SCREENSHOT FRAMES</p>
            <h2 className="text-xl font-semibold">لقطات داخل إطارات الأجهزة</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">صور الشاشة تُحمّل كسولاً، مع نسب أبعاد تمنع قفز التخطيط.</p>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <DeviceFrame
              src="/media/lab/dashboard.svg"
              alt="لقطة شاشة لوحة التحكم في نافذة متصفح"
              device="browser"
              url="demo.example.dz/dashboard"
              caption="إطار متصفح — 16:9"
            />
            <div className="grid grid-cols-2 items-start gap-4">
              <DeviceFrame
                src="/media/lab/mobile.svg"
                alt="لقطة شاشة تطبيق متابعة المهام على الهاتف"
                device="phone"
                caption="هاتف"
              />
              <DeviceFrame
                src="/media/lab/analytics.svg"
                alt="لقطة شاشة لوحة التحليلات على جهاز لوحي"
                device="tablet"
                caption="لوحي"
              />
            </div>
          </div>
        </section>

        <section className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-300/10 text-rose-300"><MonitorPlay size={20} aria-hidden /></span>
              <div>
                <h2 className="font-semibold">فيديو محلي أو YouTube</h2>
                <p className="mt-1 text-xs text-slate-400">react-player v3 · يبدأ عند تفعيل الشريحة</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              جرّب رابط YouTube أو مساراً مثل <code dir="ltr" className="rounded bg-slate-950 px-1.5 py-0.5 text-amber-200">/media/video/demo.mp4</code>.
              لا يُحمّل المشغّل قبل إدخال المصدر.
            </p>
            <form onSubmit={loadVideo} className="mt-5 space-y-3">
              <label htmlFor="media-video-source" className="block text-xs font-medium text-slate-300">رابط الفيديو أو مساره</label>
              <input
                id="media-video-source"
                dir="ltr"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="https://youtu.be/... أو /media/video/demo.mp4"
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-amber-300/60"
              />
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input type="checkbox" checked={autoPlay} onChange={(event) => setAutoPlay(event.target.checked)} className="accent-amber-300" />
                تشغيل تلقائي صامت عند تفعيل الشريحة
              </label>
              <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
                تحميل الفيديو <ArrowUpRight size={15} aria-hidden />
              </button>
            </form>
          </article>

          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-900/40 p-4">
            {source ? (
              <div className="w-full">
                <MediaVideo
                  key={source}
                  src={source}
                  autoPlay={autoPlay}
                  muted
                  controls
                  poster="/media/lab/video-poster.svg"
                  label="فيديو تجريبي"
                />
                <p className="mt-3 break-all text-xs text-slate-500" dir="ltr">{source}</p>
              </div>
            ) : (
              <div className="text-center">
                <Smartphone size={28} aria-hidden className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm text-slate-400">أدخل رابط الفيديو لعرضه هنا.</p>
                <p className="mt-1 text-xs text-slate-600">المشغّل lazy ولن يُحمّل أي فيديو قبل ذلك.</p>
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-white/10 pt-5 text-xs leading-6 text-slate-500">
          <p>قواعد الأوزان ومجلد الأصول: <code dir="ltr">public/media/README.md</code> · دليل المطوّر: <code dir="ltr">docs/MEDIA.md</code></p>
        </footer>
      </div>
    </main>
  );
}
