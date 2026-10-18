# Recharts 3 في القالب (عبر حاوية shadcn المستعارة)

```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, rechartsAxis, rechartsGrid, rechartsRtl, rechartsCursor, rechartsAnimation, rechartsBarRadius, rechartsConfig } from '@/components/charts/recharts';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { valueFormatter } from '@/components/charts';

const data = [{ year: '2023', students: 180 }, { year: '2024', students: 240 }, { year: '2025', students: 310 }];
const config = rechartsConfig({ students: 'الطلبة' });            // → { students: { label, color: '#fbbf24' } } ⇒ var(--color-students)

export default function EnrollmentChart() {
  return (
    <ChartContainer config={config} className="aspect-auto h-[320px] w-full">
      <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid {...rechartsGrid} />
        <XAxis dataKey="year" {...rechartsAxis} {...rechartsRtl.xAxis} />
        <YAxis {...rechartsAxis} {...rechartsRtl.yAxis} tickFormatter={valueFormatter()} width={44} />
        <ChartTooltip cursor={rechartsCursor} content={<ChartTooltipContent />} {...rechartsRtl.tooltip} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="students" fill="var(--color-students)" radius={rechartsBarRadius.vertical} {...rechartsAnimation(0)}>
          <LabelList dataKey="students" position="top" fill="#e2e8f0" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
```

## نقاط مهمة
- `ChartContainer` = `ResponsiveContainer` + متغيّرات ألوان `--color-<key>` + أصناف السمة الداكنة + `dir="ltr"`. الارتفاع من `className` (`aspect-auto h-[320px]`) — الافتراضي `aspect-video`.
- **الحركة**: `rechartsAnimation(i)` ← `isAnimationActive`, `animationBegin = i×300ms` (تتابع السلاسل), `animationDuration 900`, `ease-out`؛ مرّر مدة أطول للخطوط: `rechartsAnimation(0, 1400)`. أعمدة Recharts تنمو كلها معاً داخل السلسلة (لا تتابع بين الأعمدة) — إن أردت التتابع عموداً عموداً استعمل `MotionBarChart`.
- **RTL**: `rechartsRtl.xAxis` (`reversed`)، `rechartsRtl.yAxis` (`orientation="right"`)، الأفقي: `<BarChart layout="vertical">` مع `<XAxis {...rechartsRtl.horizontal.xAxis} />` و`<YAxis dataKey="name" {...rechartsRtl.horizontal.yAxis} />` و`radius={rechartsBarRadius.horizontalRtl}`.
- **الحلقة**: `<Pie innerRadius={64} outerRadius={104} paddingAngle={3} startAngle={90} endAngle={450} strokeWidth={0}>` + `<Cell fill={CHART_COLORS[i]} />` لكل عنصر؛ `endAngle={-270}` لعقارب الساعة.
- **المساحة**: `<defs><linearGradient id="fill-x">` بـ `stopColor="var(--color-x)"` ثم `<Area fill="url(#fill-x)" type="monotone" />`.
- **مرجع/هدف**: `<ReferenceLine y={250} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'الهدف', fill: '#fbbf24', position: 'insideTopRight' }} />`.
- التلميح: `ChartTooltipContent` يستعمل `formatNumber` تلقائياً؛ `valueFormatter={(v) => …}` للتخصيص، `indicator="line" | "dashed"`، `hideLabel`.
- الحجم: Recharts + تبعياته ≈ 450KB → ملف مستقل + `lazyChart` دائماً. `ResponsiveContainer` يحتاج حاوية بارتفاع فعلي (لا `h-auto`).
- الاختبار في jsdom: `ResponsiveContainer` يقيس 0 → اختبر بـ `<BarChart width={400} height={200}>` مباشرة (انظر `charts.test.tsx`).
