import { DropMark, SPARK_OFFSETS } from './shared';
import { DISTILBOOK_IDENTITY } from '../types';

/**
 * مشهد الافتتاح — كشف العلامة
 * حروف BRAND تصعد دورانياً + شرارات من المركز + وعد القيمة
 * (ماركب ثابت — الحركة من buildDistilbookTimeline)
 */
export function OpeningScene({ brand, tagline }: { brand: string; tagline: string }) {
  const letters = Array.from(brand);
  return (
    <div data-scene="opening" className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
      {/* شرارات */}
      <div className="pointer-events-none absolute left-1/2 top-1/2">
        {SPARK_OFFSETS.map(([dx, dy], i) => (
          <span
            key={i}
            data-spark
            data-dx={dx}
            data-dy={dy}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: i % 2 ? DISTILBOOK_IDENTITY.teal : DISTILBOOK_IDENTITY.amber }}
          />
        ))}
      </div>

      <p className="font-mono text-[11px] tracking-[0.45em] text-teal-300">RESEARCH · DISTILLED</p>

      {/* العلامة حرفاً حرفاً (لاتينية — التقسيم للحروف آمن) */}
      <h2 data-beat className="flex select-none justify-center text-6xl font-black leading-none tracking-tight sm:text-8xl" dir="ltr">
        {letters.map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            data-letter
            className="inline-block bg-gradient-to-b from-teal-200 via-teal-300 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(45,212,191,0.35)]"
            style={{ transformOrigin: '50% 100%' }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </h2>

      <p data-tagline className="max-w-md text-base font-bold text-slate-200">{tagline}</p>
      <div data-tag className="flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-4 py-1.5 text-[11px] font-bold text-teal-200">
        <DropMark size={14} />
        منصة تلخيص الأبحاث والكتب
      </div>
    </div>
  );
}
