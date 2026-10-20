import { DropMark, SPARK_OFFSETS } from './shared';
import { DISTILBOOK_IDENTITY } from '../types';
import type { DistilbookConfig } from '../types';

/**
 * مشهد الختام — هوية المنصة
 * العلامة بالحجم الكامل + أرقام القيمة + دعوة التجربة + شرارات
 */
export function FinaleScene({ config }: { config: DistilbookConfig }) {
  return (
    <div data-scene="finale" className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/3">
        {SPARK_OFFSETS.slice(0, 8).map(([dx, dy], i) => (
          <span
            key={i}
            data-spark
            data-dx={dx}
            data-dy={dy}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: i % 2 ? DISTILBOOK_IDENTITY.teal : DISTILBOOK_IDENTITY.sky }}
          />
        ))}
      </div>

      <div data-beat className="flex items-center gap-3">
        <DropMark size={34} />
        <p data-finale-brand dir="ltr" className="bg-gradient-to-b from-teal-200 via-teal-300 to-sky-500 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-7xl">
          {config.brand}
        </p>
      </div>

      <p className="text-base font-bold text-slate-200">{config.tagline}</p>

      {/* أرقام القيمة */}
      <div className="flex flex-wrap justify-center gap-3">
        {config.stats.map((s) => (
          <div key={s.label} data-stat className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center" style={{ transformOrigin: '50% 50%' }}>
            <p className="text-2xl font-black text-teal-300">{s.value}</p>
            <p className="text-[11px] font-bold text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        data-cta
        className="rounded-full bg-gradient-to-l from-teal-400 to-sky-500 px-6 py-2.5 text-sm font-black text-slate-950 shadow-[0_0_30px_rgba(45,212,191,0.35)]"
      >
        {config.cta} ←
      </button>
    </div>
  );
}
