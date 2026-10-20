import type { DistilbookSummaryCard } from '../types';

/**
 * مشهد الملخصات — بطاقات منظمة بانتقالات سينمائية
 * بطاقة تنزلق من اليسار، وأخرى Zoom، وثالثة من اليمين — والنقاط تتبعها
 */
export function SummaryScene({ cards }: { cards: DistilbookSummaryCard[] }) {
  return (
    <div data-scene="summary" className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6">
      <p className="font-mono text-[11px] tracking-[0.4em] text-emerald-300">STRUCTURED SUMMARIES</p>

      <div className="flex flex-wrap items-stretch justify-center gap-3">
        {cards.map((card) => (
          <article
            key={card.title}
            data-card
            className="w-56 rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/10 to-transparent p-4 backdrop-blur-sm"
            style={{ transformOrigin: '50% 80%' }}
          >
            <header className="flex items-center justify-between gap-2 pb-2">
              <h3 className="text-sm font-black text-emerald-200">{card.title}</h3>
              <span
                data-src
                className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
                style={{ transformOrigin: '50% 50%' }}
              >
                {card.source}
              </span>
            </header>
            <ul className="space-y-1.5">
              {card.points.map((p) => (
                <li key={p} data-point className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-300">
                  <span className="mt-0.5 text-emerald-400">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="text-[11px] font-bold text-slate-400">من البحث الخام إلى بنية قابلة للعرض في ثوانٍ</p>
    </div>
  );
}
