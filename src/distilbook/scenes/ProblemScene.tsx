/**
 * مشهد المشكلة — إغراق المعلومات
 * 8 صفحات بحث تتكدس بسرعة مقلقة فوق بعضها + عدّاد «٤٠ صفحة» + رجّة نهائية
 */
export function ProblemScene({ pages = 8, count = '٤٠ صفحة' }: { pages?: number; count?: string }) {
  return (
    <div data-scene="problem" className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6">
      <p className="font-mono text-[11px] tracking-[0.4em] text-rose-300">THE PROBLEM</p>

      {/* كومة الصفحات */}
      <div data-beat className="relative h-44 w-40">
        {Array.from({ length: pages }, (_, i) => (
          <div
            key={i}
            data-page
            className="absolute inset-x-2 rounded-lg border border-white/10 bg-slate-200/95 p-3 shadow-xl"
            style={{ bottom: i * 9, zIndex: pages - i, transformOrigin: '50% 100%' }}
          >
            {/* هيكل سطور ورقة بحث (بلا نص) */}
            <div className="h-1.5 w-2/3 rounded bg-slate-400/70" />
            <div className="mt-1.5 h-1 w-full rounded bg-slate-300" />
            <div className="mt-1 h-1 w-5/6 rounded bg-slate-300" />
            <div className="mt-1 h-1 w-4/6 rounded bg-slate-300" />
          </div>
        ))}
      </div>

      {/* عدّاد الحجم */}
      <div data-count className="rounded-2xl border border-rose-400/30 bg-rose-500/15 px-5 py-2.5 text-center">
        <p className="text-2xl font-black text-rose-300">{count}</p>
        <p className="text-[11px] font-bold text-rose-200/80">بحث علمي واحد قبل المؤتمر</p>
      </div>

      <p className="max-w-sm text-center text-sm font-bold text-slate-300">
        وقت قليل، مصادر كثيرة — <span className="text-rose-300">والخلاصة تهرب منك</span>
      </p>
    </div>
  );
}
