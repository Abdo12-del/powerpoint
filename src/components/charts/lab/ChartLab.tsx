import { Suspense, lazy, useState, type ReactNode } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { ChartSkeleton } from '../lazy';

const MotionSection = lazy(() => import('./MotionSection'));
const RechartsSection = lazy(() => import('./RechartsSection'));
const NivoSection = lazy(() => import('./NivoSection'));
const ChartJsSection = lazy(() => import('./ChartJsSection'));
const EChartsSection = lazy(() => import('./EChartsSection'));

const SECTIONS: { id: string; title: string; blurb: string; element: ReactNode }[] = [
  {
    id: 'motion',
    title: 'الرسوم الحركية المخصّصة (الافتراضي)',
    blurb: 'framer-motion + d3-scale/d3-shape · ~25KB · RTL أصلي · @/components/charts — ابدأ بها دائماً، وانتقل إلى مكتبة فقط عند الحاجة.',
    element: <MotionSection />,
  },
  {
    id: 'recharts',
    title: 'Recharts (حاوية shadcn)',
    blurb: 'تركيب تصريحي بمكوّنات JSX · حاوية shadcn/ui المستعارة · مساعدات rechartsRtl/rechartsAnimation · @/components/charts/recharts',
    element: <RechartsSection />,
  },
  {
    id: 'nivo',
    title: 'Nivo (react-spring)',
    blurb: 'أشكال متقدّمة جاهزة (قمع، وافل، سانكي، خريطة شجرية…) بحركة سبرينغ · nivoTheme + nivoRtlData · @nivo/*',
    element: <NivoSection />,
  },
  {
    id: 'chartjs',
    title: 'Chart.js (canvas)',
    blurb: 'الأسرع مع البيانات الكثيرة · RTL مدمج في المفتاح والتلميح · chartJsStagger للتتابع · <ChartJs />',
    element: <ChartJsSection />,
  },
  {
    id: 'echarts',
    title: 'Apache ECharts',
    blurb: 'التحوّل الشامل بين الأشكال، مقاييس، سانكي، خرائط شجرية · echartsRtl + echartsAnimation · <EChart />',
    element: <EChartsSection />,
  },
];

/** مختبر الرسوم البيانية: ?lab=charts — كل قسم في قطعة مستقلة؛ زر «إعادة» يعيد تركيب القسم لمشاهدة حركة الدخول */
export default function ChartLab() {
  const [keys, setKeys] = useState<Record<string, number>>({});
  const replay = (id: string) => setKeys((k) => ({ ...k, [id]: (k[id] ?? 0) + 1 }));
  return (
    <main dir="rtl" className="min-h-full overflow-y-auto bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-amber-300">القالب · مختبر الرسوم البيانية</div>
            <h1 className="mt-1 text-4xl font-black">الرسوم البيانية وحركاتها</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              خمس طبقات بسمة واحدة: رسوم حركية مخصّصة خفيفة، ثم Recharts وNivo وChart.js وECharts عند الحاجة — كلها تعكس الاتجاه (أول فئة على اليمين،
              المحور على اليمين) وتحترم تقليل الحركة. الدليل: <code>docs/CHARTS.md</code> — المهارة: <code>data-charts-motion</code>.
            </p>
          </div>
          <a
            href={window.location.pathname}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10"
          >
            العودة إلى العرض <ArrowRight size={16} />
          </a>
        </header>
        <nav className="flex flex-wrap gap-2 text-sm">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#lab-${s.id}`} className="rounded-full bg-white/5 px-3 py-1 hover:bg-white/10">
              {s.title}
            </a>
          ))}
        </nav>
        {SECTIONS.map((s) => (
          <section key={s.id} id={`lab-${s.id}`} className="space-y-4 scroll-mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold">{s.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{s.blurb}</p>
              </div>
              <button
                type="button"
                onClick={() => replay(s.id)}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold hover:bg-white/15"
              >
                <RefreshCw size={14} /> إعادة الحركة
              </button>
            </div>
            <Suspense fallback={<ChartSkeleton height={280} />}>
              <div key={keys[s.id] ?? 0}>{s.element}</div>
            </Suspense>
          </section>
        ))}
      </div>
    </main>
  );
}
