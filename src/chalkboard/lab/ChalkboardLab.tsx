import { useState } from 'react';
import { ChalkboardOverlay } from '../ChalkboardOverlay';
import { useChalkboard } from '../useChalkboard';

/**
 * مختبر السبورة والتعليق — ?lab=chalkboard
 * ثلاث شرائح نموذجية للتنقل بينها وتجربة: التعليق لكل شريحة، السبورة المستقلة
 * بصفحاتها، الأدوات والألوان والسُمك، التراجع والمسح، الحفظ المحلي، والتصدير
 */

const SAMPLE_SLIDES = [
  { id: 'demo-1', title: 'مقدمة الدراسة', body: 'هذه شريحة نموذجية — علّق عليها بـ C أو استعمل الأدوات مباشرة.', icon: '📘' },
  { id: 'demo-2', title: 'المنهجية', body: 'ارسم سهماً من السؤال إلى الإجابة، أو ظلّل فكرة بالماركر.', icon: '🧪' },
  { id: 'demo-3', title: 'النتائج', body: 'أشر إلى الأرقام بالطباشير ثم صدر التعليق صورة PNG.', icon: '📊' },
];

export function ChalkboardLab() {
  const board = useChalkboard();
  const [current, setCurrent] = useState(0);
  const slide = SAMPLE_SLIDES[current];

  return (
    <div className="min-h-screen bg-slate-950 pb-24" dir="rtl">
      {/* الترويسة */}
      <header className="border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8 text-center">
        <p className="font-mono text-[11px] tracking-[0.4em] text-amber-300">CHALKBOARD & ANNOTATION LAB</p>
        <h1 className="pt-2 text-3xl font-black text-white sm:text-4xl">حزمة السبورة والتعليق</h1>
        <p className="mx-auto max-w-2xl pt-3 text-sm leading-relaxed text-slate-400">
          رسم وكتابة حرة فوق الشرائح، وسبورة مستقلة متعددة الصفحات أثناء الشرح — قلم وممحاة،
          ألوان الطباشير والماركر، سُمك متغيّر، تراجع ومسح، حفظ محلي وتصدير PNG.
          منفذة بنموذج إضافة <span className="font-mono text-[12px] text-teal-300">reveal.js-plugins</span> (MIT) على نظام العروض الحالي.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {['C تعليق', 'B سبورة', 'Delete مسح', '→ صفحة تالية', 'Ctrl+Z تراجع'].map((b) => (
            <span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-300">
              {b}
            </span>
          ))}
        </div>
      </header>

      {/* منصة التجربة */}
      <section className="mx-auto max-w-5xl px-4 pt-8">
        {/* تنقّل الشرائح النموذجية */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black text-slate-400">شرائح نموذجية:</span>
          {SAMPLE_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              data-testid={`lab-slide-${i}`}
              onClick={() => setCurrent(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                current === i ? 'bg-amber-400/25 text-amber-200 ring-1 ring-amber-300/50' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {s.icon} {s.title}
            </button>
          ))}
          <span className="ms-auto text-[11px] text-slate-500">التعليق يُحفظ لكل شريحة على حدة</span>
        </div>

        {/* المسرح — شريحة + طبقة السبورة */}
        <div className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center" data-testid={`lab-layer-${slide.id}`}>
            <div className="text-6xl">{slide.icon}</div>
            <h2 className="text-2xl font-black text-white sm:text-3xl">{slide.title}</h2>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">{slide.body}</p>
            <div className="flex gap-1.5 pt-2">
              {SAMPLE_SLIDES.map((s, i) => (
                <span key={s.id} className={`h-1.5 w-8 rounded-full ${i === current ? 'bg-amber-400' : 'bg-white/15'}`} />
              ))}
            </div>
          </div>

          {/* أزرار النمط */}
          <div className="absolute bottom-4 start-1/2 z-10 flex -translate-x-1/2 gap-2 rtl:translate-x-1/2">
            <button
              type="button"
              data-testid="lab-toggle-notes"
              onClick={board.toggleNotes}
              className={`rounded-xl px-4 py-2 text-xs font-black transition ${board.mode === 'notes' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              ✏️ تعليق فوق الشريحة
            </button>
            <button
              type="button"
              data-testid="lab-toggle-board"
              onClick={board.toggleBoard}
              className={`rounded-xl px-4 py-2 text-xs font-black transition ${board.mode === 'board' ? 'bg-teal-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              🖤 سبورة مستقلة
            </button>
          </div>

          {/* طبقة السبورة (تظهر فقط عند التفعيل) */}
          <ChalkboardOverlay board={board} layerId={slide.id} variant="contained" layerLabel={slide.title} />
        </div>
      </section>

      {/* إدارة الحفظ */}
      <section className="mx-auto max-w-5xl px-4 pt-6">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <button
            type="button"
            data-testid="lab-reset"
            onClick={board.resetAll}
            className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-300 transition hover:bg-rose-500/20"
          >
            🗑 مسح كل الرسومات والحفظ المحلي
          </button>
          <button
            type="button"
            onClick={board.exportPNG}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/10"
          >
            🖼 تصدير الطبقة الحالية PNG
          </button>
          <p className="text-[11px] leading-relaxed text-slate-500">
            كل التعليقات وصفحات السبورة تُحفظ تلقائياً في المتصفح (مفتاح <span className="font-mono">db-chalkboard-v1</span>) —
            وتعود معك عند إعادة فتح العرض.
          </p>
        </div>
      </section>

      {/* قائمة الميزات */}
      <section className="mx-auto max-w-5xl px-4 pt-10">
        <h2 className="pb-2 text-xl font-black text-white">ما في الحزمة</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['✏️ تعليق فوق الشرائح', 'قماش شفاف يلتقط المؤشر فوق أي شاشة — والتنقّل يبقى شغالاً بـ الأسهم'],
            ['🖤 سبورة مستقلة', 'شاشة داكنة كاملة أثناء الشرح، بصفحات تُقلَّب بالأسهم وتُضاف بالتالي'],
            ['🖌 ثلاث أدوات', 'طباشير صلب، ماركر شفاف للتظليل، وممحاة تشطب فعلياً (destination-out)'],
            ['🎨 لوحتا ألوان', '6 ألوان طباشير + 6 ماركر — تتبدل تلقائياً مع الأداة'],
            ['📐 سُمك متغيّر', 'رفيع/متوسط/عريض — والممحاة بسُمك مضاعف'],
            ['↩️ تراجع ومسح', 'تراجع خطّةً خطّة، ومسح للطبقة الحالية بـ Delete'],
            ['💾 حفظ محلي', 'JSON في localStorage مؤجّل 400ms + حفظ عند مغادرة الصفحة'],
            ['🖼 تصدير PNG', 'التعليق بخلفية شفافة والسبورة بخلفيتها الداكنة'],
            ['⌨️ عقد التحكم §6', 'C/B/Delete مضافة لنافذة الاختصارات وشريط التحكم دون كسر المفاتيح الأصلية'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-black text-white">{title}</p>
              <p className="pt-1 text-[11px] leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-4 pt-8 text-center text-[11px] text-slate-500">
        في العرض المباشر: زر «سبورة» في شريط التحكم أو <span className="font-mono">C</span>/<span className="font-mono">B</span> ·
        الدليل: <span className="font-mono">docs/CHALKBOARD.md</span> · الاعتماد: reveal.js-plugins (MIT)
      </footer>
    </div>
  );
}

export default ChalkboardLab;
