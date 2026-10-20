import { useSpotlight } from '../useSpotlight';
import { SpotlightOverlay } from '../SpotlightOverlay';
import { ZOOM_DEFAULT_SCALE, ZOOM_MAX_SCALE, ZOOM_MIN_SCALE } from '../types';

/**
 * مختبر التكبير والتركيز — ?lab=spotlight
 * شريحة كثيفة التفاصيل لتجربة: Alt+Click للتكبير نحو أي جزء، الالتفاف بالأطراف،
 * تسليط الضوء ومؤشر الليزر لموضع الشرح — بمستويات قابلة للضبط
 */

const ROWS: Array<[string, string, string, string]> = [
  ['معدل الفهم', '٤٨٪', '٨٩٪', '+٤١ نقطة'],
  ['زمن المراجعة', '٢٢ دقيقة', '٣ دقائق', '×٧ أسرع'],
  ['الاستشهادات الموثقة', '١٢ مصدراً', '١٢٠ مصدراً', '×١٠ تغطية'],
  ['رضا القرّاء', '٦١٪', '٩٤٪', '+٣٣ نقطة'],
];

export function SpotlightLab() {
  const spot = useSpotlight();

  return (
    <div className="min-h-screen bg-slate-950 pb-24" dir="rtl">
      <header className="border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-8 text-center">
        <p className="font-mono text-[11px] tracking-[0.4em] text-amber-300">ZOOM & SPOTLIGHT LAB</p>
        <h1 className="pt-2 text-3xl font-black text-white sm:text-4xl">حزمة التكبير والتركيز</h1>
        <p className="mx-auto max-w-2xl pt-3 text-sm leading-relaxed text-slate-400">
          تكبير على أجزاء الشريحة بنموذج إضافة <span className="font-mono text-[12px] text-teal-300">RevealZoom</span> المدمجة مع
          reveal.js (MIT) — Alt+Click نحو نقطة الشرح والالتفاف بالأطراف — مع مؤشر ليزر
          وتسليط ضوء يتبع موضع الشرح أثناء العرض المباشر.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {['Alt+Click تكبير', 'أطراف = التفاف', 'Esc خروج', 'S تسليط', 'L ليزر', 'Z تكبير مركزي'].map((b) => (
            <span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-300">
              {b}
            </span>
          ))}
        </div>
      </header>

      {/* المسرح */}
      <section className="mx-auto max-w-5xl px-4 pt-8">
        <div className="relative h-[62vh] min-h-[440px] overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl">
          {/* طبقة المحتوى القابلة للتكبير */}
          <div
            data-testid="lab-zoom-stage"
            className="absolute inset-0 p-6"
            style={zoomStageStyle(spot)}
          >
            <h2 className="pb-1 text-center text-2xl font-black text-white">نتائج تجربة التقطير — جدول تفصيلي</h2>
            <p className="pb-4 text-center text-[11px] text-slate-500">
              كبّر على أي خلية بـ Alt+Click لقراءتها للمجموعة — ثم تنقّل بالأطراف
            </p>
            <table className="mx-auto w-full max-w-3xl border-collapse text-right text-xs" data-testid="lab-table">
              <thead>
                <tr className="text-[11px] text-slate-400">
                  <th className="border-b border-white/10 p-2.5 font-bold">المؤشر</th>
                  <th className="border-b border-white/10 p-2.5 font-bold">قبل</th>
                  <th className="border-b border-white/10 p-2.5 font-bold">بعد</th>
                  <th className="border-b border-white/10 p-2.5 font-bold">التغيّر</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([k, a, b, c], i) => (
                  <tr key={k} className={i % 2 ? 'bg-white/[0.03]' : ''}>
                    <td className="border-b border-white/5 p-2.5 font-bold text-slate-200">{k}</td>
                    <td className="border-b border-white/5 p-2.5 text-slate-400">{a}</td>
                    <td className="border-b border-white/5 p-2.5 font-mono text-teal-300">{b}</td>
                    <td className="border-b border-white/5 p-2.5 font-mono text-emerald-300">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* فقرة كثيفة صغيرة — مثالية للتكبير */}
            <div className="mx-auto mt-5 grid max-w-3xl gap-3 sm:grid-cols-3">
              {['منهجية القياس', 'آلية التحقق', 'حدود الدراسة'].map((t) => (
                <div key={t} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] font-black text-amber-300">{t}</p>
                  <p className="pt-1 text-[10px] leading-relaxed text-slate-400">
                    عيّنة نصّ دقيق: قيم موزونة p&lt;0.05، وحجم أثر d=0.62، وثقة ٩٥٪ — كُبّر لقراءتها.
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* شارة حالة التكبير */}
          <div
            data-testid="lab-zoom-badge"
            className="pointer-events-none absolute start-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 font-mono text-[11px] text-sky-300 backdrop-blur"
          >
            {spot.zoomActive ? `×${spot.zoom.scale.toFixed(1)}` : '×1.0'}
          </div>

          <SpotlightOverlay spot={spot} variant="contained" />
        </div>

        {/* أدوات التجربة */}
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <button
            type="button"
            data-testid="lab-zoom"
            onClick={spot.toggleZoomCenter}
            className="rounded-lg bg-sky-400/20 px-3 py-1.5 text-[11px] font-bold text-sky-200 ring-1 ring-sky-300/40 transition hover:bg-sky-400/30"
          >
            {spot.zoomActive ? '↩ خروج من التكبير' : '🔍 تكبير مركزي (Z)'}
          </button>
          <button
            type="button"
            data-testid="lab-spotlight"
            onClick={spot.toggleSpotlight}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ring-1 ${
              spot.spotlightOn ? 'bg-amber-400 text-slate-950 ring-amber-300' : 'bg-white/5 text-white ring-white/15 hover:bg-white/10'
            }`}
          >
            🔦 تسليط ضوء (S)
          </button>
          <button
            type="button"
            data-testid="lab-laser"
            onClick={spot.toggleLaser}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ring-1 ${
              spot.laserOn ? 'bg-rose-500 text-white ring-rose-300' : 'bg-white/5 text-white ring-white/15 hover:bg-white/10'
            }`}
          >
            🔴 مؤشر ليزر (L)
          </button>

          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            zoomLevel
            <input
              type="range"
              data-testid="lab-zoom-level"
              min={ZOOM_MIN_SCALE}
              max={ZOOM_MAX_SCALE}
              step={0.5}
              value={spot.zoomScale}
              onChange={(e) => spot.setZoomScale(Number(e.target.value))}
              className="h-1 w-28 accent-sky-400"
            />
            <span className="w-8 font-mono text-sky-300">×{spot.zoomScale}</span>
          </label>

          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            نصف القطر
            <input
              type="range"
              data-testid="lab-radius"
              min={60}
              max={420}
              step={10}
              value={spot.spotlightRadius}
              onChange={(e) => spot.setSpotlightRadius(Number(e.target.value))}
              className="h-1 w-28 accent-amber-400"
            />
            <span className="w-10 font-mono text-amber-300">{spot.spotlightRadius}px</span>
          </label>
        </div>
      </section>

      {/* الميزات */}
      <section className="mx-auto max-w-5xl px-4 pt-10">
        <h2 className="pb-2 text-xl font-black text-white">ما في الحزمة</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['🔍 تكبير نحو النقطة', 'Alt+Click (Ctrl على لينكس) — نموذج RevealZoom: النقطة تُحاور وتُكبَّر حتى zoomLevel'],
            ['↔️ التفاف بالأطراف', 'أثناء التكبير يقترب المؤشر من الحافة فينزلق العرض — نفس هامش 12% وسرعة reveal.js'],
            ['🔑 تبديل وEsc', 'نقر ثانٍ أو Esc أو Z يخرج من التكبير — ويعود كل شيء كما كان'],
            ['🔦 تسليط ضوء', 'عتمة بفتحة دائرية تتبع المؤشر — الجمهور يرى ما تشير إليه فقط'],
            ['🔴 مؤشر ليزر', 'رأس متوهّج وذيل أحمر يتلاشى — أوضح من أي مؤشر نظام'],
            ['🎚 ضبط حي', 'zoomLevel 1.5–6، نصف القطر 60–420px، وعجلة الفأرة تضبط الاثنين أثناء العمل'],
            ['🧩 توافق كامل', 'يعمل فوق السبورة والتعليق ومع عقد التحكم §6 — دون كسر أي مفتاح'],
            ['🖱 بلا اعتراض', 'الطبقات pointer-events:none — النقر والسحب والتنقّل يعملان تحتها'],
            ['⚛️ أداء', 'موضع الضوء ومسار الليزر تحديث DOM مباشر وحلقة rAF — بلا إعادة رسم React'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-black text-white">{title}</p>
              <p className="pt-1 text-[11px] leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-4 pt-8 text-center text-[11px] text-slate-500">
        في العرض المباشر: Alt+Click تكبير، S تسليط، L ليزر · الاعتماد المرجعي: reveal.js {ZOOM_DEFAULT_SCALE === 2 ? '(إضافة zoom المدمجة)' : ''} (MIT)
      </footer>
    </div>
  );
}

/** أنماط مرحلة التكبير للمختبر — نفس zoomCss عبر حالة الخطاف */
function zoomStageStyle(spot: ReturnType<typeof useSpotlight>): React.CSSProperties {
  const z = spot.zoom;
  const zoomed = spot.zoomActive;
  return {
    transform: zoomed ? `scale(${z.scale}) translate(${-z.ox}px, ${-z.oy}px)` : 'scale(1)',
    transformOrigin: '0 0',
    transition: 'transform 0.25s ease-out',
    willChange: 'transform',
  };
}

export default SpotlightLab;
