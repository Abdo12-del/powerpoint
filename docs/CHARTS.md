# الرسوم البيانية وحركاتها

كيف تعرض البيانات في هذا القالب: رسوم حركية مخصّصة خفيفة تُستعمل افتراضياً، وأربع مكتبات مثبّتة (Recharts، Nivo، Chart.js، Apache ECharts) بسمة واحدة ومرايا RTL جاهزة، مع مختبر حي `?lab=charts`، ووصفتين، ومهارة `data-charts-motion` التي تحسم الاختيار والكوريغرافيا.

> القاعدة الأولى لم تتغيّر: **فكرة واحدة لكل شريحة** — رسم واحد يحمل رسالة واحدة، وعنوانه جملة خبرية تقولها.

## 1. ما الذي أُضيف

| الطبقة | المسار | ما فيها |
|---|---|---|
| السمة المشتركة | `src/components/charts/theme.ts` | `CHART_COLORS` (10 ألوان فئوية، الأصفر للتمييز)، `CHART_SEMANTIC` (إيجابي/سلبي/شبكة/نص/تلميح)، `CHART_SEQUENTIAL`/`CHART_DIVERGING`، `chartSettings` + `configureCharts()` (المحلية، الخط، المدة، التتابع)، `formatNumber()`/`valueFormatter()`، `niceTicks()` |
| الرسوم الحركية المخصّصة | `src/components/charts/motion/` | `MotionBarChart`, `MotionLineChart`, `MotionDonutChart`, `MotionRadarChart`, `Sparkline`, `MotionBarList` + `shared.tsx` (`ChartLegend`, `SvgText`, `useChartMotion`, `useChartSize`) |
| الإطار والتحميل الكسول | `ChartFrame.tsx`, `lazy.tsx` | `ChartFrame` (عنوان ← رسم ← خلاصة ← مصدر)، `ChartSkeleton`، `lazyChart()` |
| Recharts | `src/components/charts/recharts/` | `chart.tsx` (حاوية shadcn/ui المستعارة — MIT — مكيَّفة للقالب وRTL) + `theme.ts` (`rechartsAxis`, `rechartsGrid`, `rechartsRtl`, `rechartsAnimation`, `rechartsConfig`, `rechartsBarRadius`, `rechartsCursor`) |
| Nivo | `src/components/charts/nivo/theme.ts` | `nivoTheme`, `nivoColors`, `nivoMotion()`, `nivoRtlData()`, `nivoMargin` |
| Chart.js | `src/components/charts/chartjs/` | `ChartJs.tsx` (مغلّف كسول)، `setup.ts` (تسجيل + افتراضيات RTL/الخط/المحلية)، `helpers.ts` (`chartJsColor`, `chartJsRtlScales`, `chartJsRtlHorizontalScales`, `chartJsStagger`, `chartJsDataLabels`) |
| ECharts | `src/components/charts/echarts/` | `EChart.tsx` (مغلّف كسول على `echarts/core` مع الأجزاء المسجّلة فقط)، `theme.ts` (سمة `presentation`، `echartsRtl`, `echartsAnimation`, `echartsNumber`) |
| المختبر | `src/components/charts/lab/` + `?lab=charts` | 5 أقسام (مخصّص، Recharts، Nivo، Chart.js، ECharts) كل قسم قطعة مستقلة وزر «إعادة الحركة» |
| الوصفات | `src/recipes/KpiCards.tsx`, `src/recipes/ChartStory.tsx` | بطاقات مؤشرات (NumberRoll + Sparkline + شارة تغيّر) و«قصة الرسم» بثلاثة فصول |
| المهارة | `.agents/skills/data-charts-motion/` | `SKILL.md` + `references/{recharts,nivo,chartjs,echarts}.md` |
| الاختبارات | `src/__tests__/charts.test.tsx` (19) + وصفتان في `recipes.test.tsx` | الهندسة النهائية في RTL، الحالة الأولية، المساعدات، تصيير المكتبات في jsdom |

نقطة الدخول الخفيفة `@/components/charts` **لا تسحب أي مكتبة ثقيلة**: الرسوم المخصّصة + السمات + المغلّفات الكسولة فقط. مكوّنات Recharts من `@/components/charts/recharts`، وNivo من `@nivo/*` مباشرة — كلاهما داخل ملف مستقل يُحمَّل بـ `lazyChart`.

## 2. المكتبات المثبّتة (الرخص والأحجام)

| المكتبة | الإصدار | الرخصة | الحجم التقريبي في الحزمة | متى |
|---|---|---|---|---|
| d3-scale, d3-shape, d3-array, d3-interpolate | 4.0 / 3.2 / 3.2 / 3.0 | ISC | ~25KB مع الرسوم المخصّصة (في الحزمة الرئيسية عند الاستعمال) | دائماً — أساس الرسوم المخصّصة |
| recharts | 3.10 | MIT | ~375KB (قطعة كسولة) | تركيب تصريحي بمكوّنات JSX؛ ComposedChart؛ مراجع ونطاقات |
| @nivo/core + bar, line, pie, radar, funnel, waffle, treemap, sankey, heatmap, radial-bar, bump (+ theming) | 0.99 | MIT | ~350KB لأربعة أشكال (قطعة كسولة) | أشكال متقدّمة جاهزة بحركة سبرينغ |
| chart.js + react-chartjs-2 + chartjs-plugin-datalabels | 4.5 / 5.3 / 2.2 | MIT | ~220KB (قطعة كسولة) | canvas سريع، بيانات كثيرة، RTL مدمج |
| echarts + echarts-for-react | 6.1 / 3.0 | Apache-2.0 / MIT | ~850KB (قطعة كسولة واحدة تضم 12 نوع رسم + مصيّري SVG وCanvas) | التحوّل الشامل، مقاييس، سانكي، خرائط شجرية/شمسية |

الحزمة الرئيسية لم تتغيّر (≈459KB) لأن كل المكتبات كسولة؛ `npm run build` يُظهر القطع: `RechartsSection`، `NivoSection`، `ChartJsSection`/`ChartJsCanvas`، `EChartCanvas`.

مشاريع نُظر فيها ولم تُثبَّت: **visx** (طبقة d3 منخفضة المستوى — الرسوم المخصّصة تغطي الحاجة بمباشرة أكبر)، **Victory** (رخصة المستودع غير محسومة)، **React Flow/@xyflow** (مخططات عقد تفاعلية لا رسوم بيانات — نمط `relation` يغطي العلاقات)، **Mafs** (رسوم رياضية تفاعلية؛ نادرة في العروض)، **Tremor** (مبني على Recharts بسمة فاتحة؛ أخذنا الفكرة — `BarList` → `MotionBarList`، بطاقات KPI → `KpiCards` — لا الشفرة).

## 3. البداية السريعة

```tsx
// src/data/chapters/ch2.tsx
import { TrendingUp } from 'lucide-react';
import { ChartFrame, MotionBarChart } from '@/components/charts';

{
  id: 'ch2-s3', chapterId: 'ch2', title: 'التسجيلات تضاعفت', icon: TrendingUp, archetype: 'stats',
  content: (
    <ChartFrame title="التسجيلات تضاعفت خلال ثلاث سنوات" note="2025 أعلى سنة منذ التأسيس" source="سجلّات القبول، سبتمبر 2025">
      <MotionBarChart categories={['2022', '2023', '2024', '2025']} series={[{ label: 'الطلبة', values: [120, 180, 240, 310] }]} highlight="2025" valueStyle="decimal" />
    </ChartFrame>
  ),
}
```

ما يراه الجمهور: العنوان (كلمات) → المحاور ثابتة → الأعمدة تنمو **من اليمين** واحداً بعد الآخر (0.08 ث) → القيم فوقها → 2025 مضيئة والباقي باهت → جملة الخلاصة تنزلق من اليمين بعد 1.6 ث.

الأنماط العشرة لم تتغيّر: الرسم يدخل كـ `content` في `stats` (أو `comparison`/`timeline`/`table` حسب الرسالة). لا نمط حادي عشر.

## 4. الرسوم الحركية المخصّصة — المرجع

كلها تقبل `delay`, `duration`, `stagger`, `dir` (`'rtl'` افتراضياً)، تقرأ `prefers-reduced-motion` (الحالة النهائية فوراً)، وتضع `aria-label` خبرياً، وتقيس عرض الحاوية تلقائياً (`width` لتثبيته).

| المكوّن | الخصائص الأهم | الحركة |
|---|---|---|
| `MotionBarChart` | `categories`, `series[{label, values, color?}]`, `layout: 'vertical' \| 'horizontal'`, `stacked`, `highlight` (فهرس أو تسمية), `valueStyle`, `showValues`, `showGrid`, `showLegend`, `maxValue`, `barRadius`, `labelWidth`, `height` | كل عمود ينمو من خط الأساس (`attrY/height`) بتتابع `stagger`؛ المكدّس يتراكم من الأسفل؛ القيم تظهر عند 70% |
| `MotionLineChart` | `categories`, `series`, `area`, `curve: 'monotone' \| 'linear' \| 'step'`, `showDots`, `showLastValue`, `seriesStagger`, `minValue`, `maxValue`, `strokeWidth` | قناع قصّ يتّسع من اليمين يكشف الخط والمساحة والنقاط معاً (`duration × 1.6`)، السلاسل بالتتابع، قيمة آخر نقطة في النهاية |
| `MotionDonutChart` | `data[{label, value, color?}]`, `size`, `thickness` (0 = فطيرة), `centerValue`, `centerLabel`, `valueStyle`, `legendPercent`, `clockwise`, `padAngle`, `highlight` | مسح قوسي (`pathLength`) شريحةً بعد شريحة بنسب الحصص، عكس عقارب الساعة في RTL، المركز يظهر عند 60%، المفتاح يتتابع |
| `MotionRadarChart` | `axes`, `series`, `size`, `levels`, `maxValue`, `fillOpacity`, `showLevelLabels` | المضلّع يتمدّد من المركز (تحريك `d`)، السلاسل بالتتابع، المحاور عكس عقارب الساعة من الأعلى في RTL |
| `Sparkline` | `values`, `width`, `height`, `color` (افتراضي: إيجابي/سلبي حسب الاتجاه), `area`, `endDot` | رسم `pathLength` من اليمين، تعبئة ثم نقطة النهاية |
| `MotionBarList` | `items[{label, value, color?, icon?}]`, `sorted`, `color`, `highlight`, `valueStyle`, `barHeight` | صفوف HTML: التسمية تنزلق من اليمين، الشريط `scaleX` من اليمين، القيمة تظهر عند 70% |
| `ChartFrame` | `title`, `subtitle`, `note`, `source`, `noteDelay`, `bare` | العنوان يدخل أولاً، الخلاصة تنزلق من اليمين بعد `noteDelay` (1.6 ث) |
| `ChartLegend` | `items[{label, color, value?}]`, `muted(i)` | مفتاح HTML RTL بتتابع 0.06 ث |

تحديث البيانات أثناء العرض (قبل/بعد): مرّر `series` جديدة للمكوّن نفسه — framer-motion يحرّك الفرق من القيم الحالية.

## 5. RTL — كيف يُعكس كل شيء

الوثيقة `dir="rtl"`، لكن `direction: rtl` الموروث داخل SVG يقلب معنى `text-anchor` فتخرج تسميات المحاور عن أماكنها. لذلك:

- الرسوم المخصّصة ترسم داخل `<svg style="direction:ltr">` وتحسب المرايا بنفسها: أول فئة على اليمين، المحور الرأسي على اليمين، الأشرطة الأفقية تنمو من اليمين، الحلقة عكس عقارب الساعة، التسميات بمراسٍ محسوبة. `dir="ltr"` يعيدها إلى الترتيب الغربي.
- المكتبات تُغلَّف بـ `dir="ltr"` (مدمج في `ChartContainer`/`EChart`/`ChartJs`؛ يدوي حول Nivo) ثم تُعكس يدوياً بالمساعدات:

| | أول فئة يميناً | المحور الرأسي يميناً | أفقي من اليمين | الحلقة عكس العقارب | التلميح/المفتاح RTL |
|---|---|---|---|---|---|
| Recharts | `{...rechartsRtl.xAxis}` | `{...rechartsRtl.yAxis}` | `layout="vertical"` + `rechartsRtl.horizontal` | `startAngle={90} endAngle={450}` | `ChartTooltipContent`/`ChartLegendContent` |
| Nivo | `nivoRtlData(data)` | `axisLeft={null} axisRight={…}` | `layout="horizontal" reverse` | `startAngle={0} endAngle={-360}` | `nivoTheme.tooltip` |
| Chart.js | `chartJsRtlScales` | (ضمنه) | `indexAxis:'y'` + `chartJsRtlHorizontalScales` | `circumference: -360` | مدمج في `setupChartJs` |
| ECharts | `echartsRtl(option)` | (ضمنه) | `echartsRtl` | `clockwise: false` | مدمج في السمة |

الأرقام: `formatNumber` بمحلية `chartSettings.locale` — `ar-DZ` (أرقام غربية، افتراضي القالب ونمط `stats`) أو `configureCharts({ locale: 'ar-EG' })` للأرقام الهندية؛ نمط واحد في العرض كله. التسميات العربية داخل SVG تُشكَّل صحيحاً بأي اتجاه؛ المختلطة (عربي + لاتيني + علامات) تُراجَع بصرياً في المختبر.

## 6. المكتبات — أمثلة كاملة

الأمثلة الحية في `?lab=charts` (الملفات `src/components/charts/lab/*Section.tsx` تصلح للنسخ). مراجع مفصّلة لكل مكتبة في `.agents/skills/data-charts-motion/references/`.

### Recharts (حاوية shadcn)

```tsx
// src/data/charts/EnrollmentChart.tsx
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, rechartsAxis, rechartsGrid, rechartsRtl, rechartsCursor, rechartsAnimation, rechartsBarRadius, rechartsConfig } from '@/components/charts/recharts';

const config = rechartsConfig({ students: 'الطلبة' }); // → var(--color-students)
export default function EnrollmentChart() {
  return (
    <ChartContainer config={config} className="aspect-auto h-[320px] w-full">
      <BarChart data={[{ year: '2023', students: 180 }, { year: '2024', students: 240 }, { year: '2025', students: 310 }]} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid {...rechartsGrid} />
        <XAxis dataKey="year" {...rechartsAxis} {...rechartsRtl.xAxis} />
        <YAxis {...rechartsAxis} {...rechartsRtl.yAxis} width={44} />
        <ChartTooltip cursor={rechartsCursor} content={<ChartTooltipContent />} {...rechartsRtl.tooltip} />
        <Bar dataKey="students" fill="var(--color-students)" radius={rechartsBarRadius.vertical} {...rechartsAnimation(0)}>
          <LabelList dataKey="students" position="top" fill="#e2e8f0" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
```

```tsx
// في بيانات الشريحة
const EnrollmentChart = lazyChart(() => import('@/data/charts/EnrollmentChart'), 320);
```

### Nivo

```tsx
<div dir="ltr" style={{ height: 320 }}>
  <ResponsiveBar data={nivoRtlData(data)} keys={['students']} indexBy="year" margin={nivoMargin} padding={0.3} borderRadius={5}
    colors={nivoColors} theme={nivoTheme} axisLeft={null} axisRight={{ tickSize: 0, tickPadding: 10 }} axisBottom={{ tickSize: 0, tickPadding: 10 }}
    labelTextColor="#0f172a" valueFormat={(v) => formatNumber(v)} animateOnMount {...nivoMotion('gentle')} />
</div>
```

### Chart.js

```tsx
<ChartJs type="bar" height={320} dataLabels
  data={{ labels: years, datasets: [{ label: 'الطلبة', data: values, backgroundColor: chartJsColor(0) }] }}
  options={{ scales: chartJsRtlScales, ...chartJsStagger(90), plugins: { ...chartJsDataLabels, legend: { display: false } } }} />
```

### ECharts

```tsx
<EChart height={320} option={echartsRtl({
  xAxis: { type: 'category', data: years },
  yAxis: { type: 'value', axisLabel: { formatter: echartsNumber('compact') } },
  tooltip: { trigger: 'axis' },
  series: [{ type: 'bar', data: values, label: { show: true, position: 'top', color: '#e2e8f0' }, ...echartsAnimation(90) }],
})} />
```

التحوّل الشامل (أعمدة ⇄ فطيرة): سلسلتان بنفس `id` و`universalTransition: true` وبيانات تحمل `groupId` — بدّل `option` فتتحوّل الأشكال (مثال حي في المختبر).

## 7. الوصفات

```tsx
import { KpiCards, ChartStory } from '@/recipes';

// شريحة stats: 3–4 مؤشرات، رقم يتدحرج + خط مصغّر + شارة تغيّر
<KpiCards items={[
  { label: 'الطلبة', value: 1284, trend: [900, 980, 1050, 1120, 1284], delta: 0.14 },
  { label: 'نسبة النجاح', value: 0.87, format: { style: 'percent' }, delta: 0.03 },
  { label: 'الانسحاب', value: 42, trend: [70, 61, 55, 48, 42], delta: -0.12 },
]} />

// شريحة comparison/stats: الأعمدة كلها → تبهت غير المحورية → الخلاصة
<ChartStory title="التسجيلات تضاعفت في ثلاث سنوات" note="2025 أعلى سنة منذ التأسيس" categories={years} series={[{ label: 'الطلبة', values }]} />
```

## 8. الكوريغرافيا والقواعد (ملخّص المهارة)

1. **الشكل من الرسالة**: مقارنة → أعمدة؛ اتجاه → خط؛ حصص (≤ 5) → حلقة؛ ترتيب → قائمة أشرطة؛ ملفّ معايير → رادار؛ تحويل → قمع؛ تدفّق → سانكي؛ نسبة واحدة → مقياس.
2. **≤ 7 فئات، ≤ 3 سلاسل، لون مميَّز واحد**، العنوان جملة خبرية، الخلاصة بعد الرسم.
3. **التتابع من اليمين** 0.08 ث، الاكتمال ≤ 2 ث، المحاور ثابتة، لا ارتداد ولا دوران.
4. **الرسم هو الحركة المهيمنة** في شريحته — لا مؤثر دخول آخر غير العنوان.
5. **المكتبات كسولة دائماً** (`lazyChart`/`ChartJs`/`EChart`)، مكتبة واحدة في العرض.
6. **تقليل الحركة** محترم في كل الطبقات؛ القيم المهمة مطبوعة على الرسم لا في التلميح فقط.

## 9. الاختبار والفحص

- `npm test` → `charts.test.tsx` (19): تنسيق الأرقام بالمحليتين، الهندسة النهائية (الارتفاعات متناسبة، أول فئة يميناً في RTL ويساراً في LTR، الأقواس بعدد الشرائح واتجاهها، الرادار يبدأ من المركز)، الحالة الأولية (`height="0px"`)، المساعدات الأربع وتعطّلها مع تقليل الحركة، تصيير Recharts (أبعاد ثابتة) وNivo وECharts (svg) في jsdom، إعدادات Chart.js.
- `DUMP_CHARTS=1 npx vitest run src/__tests__/charts.test.tsx` يكتب SVG الحالة النهائية إلى `/tmp/charts/` (فحص بصري عبر أي محوّل SVG→PNG).
- المختبر `?lab=charts`: راجع كل رسم مرتين — مرة للهندسة (الاتجاه، التسميات، الألوان) ومرة للحركة (زر «إعادة الحركة»).

## 10. ملاحظات تقنية

- framer-motion يكتب الأبعاد المتحرّكة في SVG بوحدة `px` (`height="78px"`) — صالح في المتصفحات؛ وخصائص `x`/`y` تُحرَّك كسِمات عبر `attrX`/`attrY` (لا `x`/`y` التي تعني تحويلاً).
- الرسوم المخصّصة تقيس عرض الحاوية بـ `ResizeObserver` (قيمة احتياطية 640 للخادم/الاختبار؛ `width` لتثبيته).
- `ResponsiveContainer` في Recharts لا يقيس في jsdom؛ `Chart.js` يحتاج canvas (غير متاح في jsdom) — لذا تُختبر إعداداته فقط.
- قطعة ECharts تضم SVG وCanvas معاً؛ لتقليصها احذف ما لا تحتاجه من `echarts/internal/EChartCanvas.tsx` (`echarts.use([...])`).
- حاوية Recharts مستعارة من shadcn/ui (`src/components/charts/UPSTREAM.md` + `LICENSES/shadcn-ui.LICENSE.md`).
