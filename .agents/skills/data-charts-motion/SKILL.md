---
name: data-charts-motion
description: Charts, graphs and data visualisation with motion for this Arabic RTL presentation template — choosing the chart type from the message (comparison/trend/share/ranking/profile/flow), the built-in animated charts (MotionBarChart, MotionLineChart, MotionDonutChart, MotionRadarChart, Sparkline, MotionBarList, ChartFrame, KpiCards/ChartStory recipes), when and how to use Recharts (shadcn ChartContainer), Nivo, Chart.js and Apache ECharts with the shared theme, RTL mirroring (first category on the right, value axis on the right, tooltips/legends rtl), number formatting (ar-DZ vs ar-EG digits), reveal choreography (axes → bars in sequence → labels → insight), lazy loading of heavy libraries, reduced motion, and testing. Use when a slide needs a bar/line/area/pie/donut/radar/funnel/waffle/sankey/gauge/heatmap/treemap chart, a KPI dashboard, a sparkline, or when a chart looks mirrored, jumpy or unreadable in Arabic. الرسوم البيانية وحركاتها في RTL.
metadata:
  short-description: الرسوم البيانية وحركاتها — الرسوم الحركية المخصّصة وRecharts/Nivo/Chart.js/ECharts في RTL
---

# الرسوم البيانية وحركاتها

```tsx
import { ChartFrame, MotionBarChart, MotionLineChart, MotionDonutChart, MotionRadarChart, Sparkline, MotionBarList, lazyChart, formatNumber } from '@/components/charts';
import { KpiCards, ChartStory } from '@/recipes';          // وصفتان جاهزتان لشريحة stats
```

الدليل الكامل: `docs/CHARTS.md` · المختبر الحي: `?lab=charts` (5 أقسام، زر «إعادة الحركة») · مراجع المكتبات: `references/{recharts,nivo,chartjs,echarts}.md`

## 1. من الرسالة إلى الشكل (قرار واحد لكل شريحة)

| الرسالة التي تريد قولها | الشكل | المكوّن الافتراضي |
|---|---|---|
| «أ أكبر من ب» (مقارنة فئات) | أعمدة رأسية ≤ 7 فئات | `MotionBarChart` |
| «الترتيب / أعلى 5» | أشرطة أفقية مرتّبة | `MotionBarList` (HTML) أو `MotionBarChart layout="horizontal"` |
| «الاتجاه عبر الزمن» | خط/مساحة | `MotionLineChart` (`area` للحجم، خط فقط للمعدّل) |
| «الحصص من كلّ» (≤ 5 أجزاء) | حلقة | `MotionDonutChart` (وافل Nivo إذا «كل مربع = شخص») |
| «ملفّ من 4–8 معايير» | رادار | `MotionRadarChart` |
| «مؤشر واحد وتاريخه» | رقم + خط مصغّر | `KpiCards` (NumberRoll + `Sparkline`) |
| «مراحل تتناقص» (تحويل) | قمع | Nivo `ResponsiveFunnel` |
| «من أين إلى أين تذهب الكميات» | سانكي | ECharts `sankey` |
| «نسبة إنجاز واحدة» | مقياس | ECharts `gauge` أو `AnimatedCircularProgressBar` |
| «الكثافة عبر بعدين» | خريطة حرارية | Nivo `ResponsiveHeatMap` / ECharts `heatmap` |
| «الحصص الهرمية بالمساحة» | خريطة شجرية | ECharts `treemap` / Nivo `ResponsiveTreeMap` |
| تركيب خاص (أعمدة + خط + مرجع) | Recharts `ComposedChart` | عبر `@/components/charts/recharts` |

قواعد الاختيار: فئة مميَّزة واحدة (`highlight`) ولون واحد قوي والباقي باهت · لا فطيرة لأكثر من 5 أجزاء · لا محورين رأسيين · لا ثلاثي الأبعاد · العنوان جملة خبرية تحمل الاستنتاج («التسجيلات تضاعفت») لا اسم المقياس («التسجيلات حسب السنة»).

## 2. أيّ طبقة؟

1. **الرسوم الحركية المخصّصة** (`@/components/charts`, ~25KB, framer-motion + d3-scale/shape) — **الافتراضي**. RTL أصلي، حركة مصمَّمة للعرض (تتابع، إبراز، قناع قصّ)، تستورَد مباشرة في بيانات الشريحة.
2. **Recharts** (`@/components/charts/recharts`) — عندما تحتاج تركيباً تصريحياً (مرجع، نطاق، محاور مخصّصة، ComposedChart). ثقيل (~450KB) → **دائماً عبر `lazyChart`**.
3. **Nivo** (`@nivo/*` + `nivoTheme`) — الأشكال الجاهزة المتقدّمة (قمع، وافل، سانكي، خريطة شجرية، حرارية، bump) بحركة سبرينغ. ثقيل → `lazyChart`.
4. **Chart.js** (`<ChartJs />`) — canvas، الأسرع مع مئات النقاط، RTL مدمج في المفتاح والتلميح. المغلّف كسول تلقائياً.
5. **ECharts** (`<EChart />`) — التحوّل الشامل بين الأشكال (أعمدة ⇄ فطيرة)، مقاييس، سانكي، خرائط شجرية، شمسية. المغلّف كسول تلقائياً (القطعة ~850KB لذا رسم واحد أو اثنان في العرض).

لا تخلط مكتبتين في الشريحة الواحدة، ويُفضَّل مكتبة واحدة في العرض كله (سمة واحدة = هوية واحدة).

## 3. التحميل الكسول (إلزامي للمكتبات)

```tsx
// src/data/charts/EnrollmentChart.tsx  — ملف مستقل يستورد المكتبة
import { ChartContainer, ChartTooltip, ChartTooltipContent, rechartsAxis, rechartsGrid, rechartsRtl, rechartsAnimation, rechartsConfig } from '@/components/charts/recharts';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
export default function EnrollmentChart() { /* … */ }

// src/data/chapters/ch2.tsx — بيانات الشريحة
import { lazyChart } from '@/components/charts';
const EnrollmentChart = lazyChart(() => import('@/data/charts/EnrollmentChart'), 340);
{ id: 'ch2-s3', chapterId: 'ch2', title: 'التسجيلات تضاعفت', icon: TrendingUp, archetype: 'stats', content: <ChartFrame title="…" note="…"><EnrollmentChart /></ChartFrame> }
```

الرسوم المخصّصة لا تحتاج `lazyChart`. الأنماط العشرة تبقى كما هي: الرسم يدخل كـ `content` في `stats` (أو `comparison`/`timeline`/`table` حسب الرسالة) — **لا تضف نمطاً جديداً**.

## 4. كوريغرافيا الكشف (ما يراه الجمهور بالترتيب)

| الزمن | ما يحدث | كيف |
|---|---|---|
| 0 ث | العنوان الخبري (كلمات لا حروف) | `ChartFrame title` |
| 0.2 ث | المحاور والشبكة ثابتة فوراً (لا تُحرَّك) | مدمج |
| 0.2 → ~1.2 ث | العناصر تنمو من خط الأساس **بالتتابع من اليمين** (0.08 ث بين كل عنصر) | `delay`, `stagger`, `duration` |
| بعدها | القيم فوق الأعمدة تظهر بعد 70% من نمو كل عمود | `showValues` (افتراضي) |
| +0.4 ث | الفئة المحورية تبقى مضيئة والباقي يبهت | `highlight` (أو `ChartStory` تلقائياً) |
| +0.7 ث | جملة الخلاصة تنزلق من اليمين | `ChartFrame note` / `noteDelay` |

- الحد الأقصى لاكتمال الرسم ≈ 2 ث (`duration × 1.6` للخطوط). السلاسل المتعددة: تتابع (`seriesStagger 0.45`) لا تزامن.
- حلقة: الشرائح تُمسح بالتتابع بنسب حصصها (`MotionDonutChart`)، المجموع في المركز يظهر عند 60%.
- لا تحرّك المحاور أو الشبكة أو التسميات بالدوران/الارتداد — العين تحتاج مرجعاً ثابتاً.
- تحديث البيانات (قبل/بعد): نفس المكوّن مع `series` جديدة — framer يحرّك الفرق؛ أو ECharts `universalTransition` للتحوّل بين شكلين.
- حركة واحدة مهيمنة في الشريحة: رسم متحرّك = لا تأثير دخول آخر غير العنوان.

## 5. RTL — القواعد التي تكسرها المكتبات

| القاعدة | الرسوم المخصّصة | Recharts | Nivo | Chart.js | ECharts |
|---|---|---|---|---|---|
| أول فئة على اليمين | تلقائي (`dir="rtl"` افتراضي) | `<XAxis {...rechartsRtl.xAxis} />` (reversed) | `nivoRtlData(data)` | `scales: chartJsRtlScales` (x.reverse) | `echartsRtl(option)` (xAxis.inverse) |
| المحور الرأسي على اليمين | تلقائي | `<YAxis {...rechartsRtl.yAxis} />` | `axisLeft={null} axisRight={{…}}` + `margin.right` | `y.position='right'` (في `chartJsRtlScales`) | `yAxis.position='right'` (في `echartsRtl`) |
| الأشرطة الأفقية تنمو من اليمين | `layout="horizontal"` | `layout="vertical"` + `rechartsRtl.horizontal` | `layout="horizontal"` + `reverse` | `indexAxis:'y'` + `chartJsRtlHorizontalScales` | `echartsRtl` (xAxis قيمي معكوس) |
| الحلقة تدور عكس عقارب الساعة | افتراضي في RTL (`clockwise` للعكس) | `startAngle={90} endAngle={450}` | `startAngle={0} endAngle={-360}` | `circumference: -360` | `clockwise: false` |
| التلميح/المفتاح RTL | HTML `dir="rtl"` | `ChartTooltipContent`/`ChartLegendContent` (مدمج) | `nivoTheme.tooltip` (direction rtl) | `legend.rtl/tooltip.rtl` (مدمج في setup) | `extraCssText: direction: rtl` (مدمج في السمة) |
| حاوية SVG بـ `dir="ltr"` | مدمج | مدمج في `ChartContainer` | ضع `<div dir="ltr">` حول الرسم | canvas (لا يحتاج) | مدمج في `EChart` |

لماذا `dir="ltr"` حول SVG؟ لأن `direction: rtl` الموروث يقلب معنى `text-anchor` فتخرج تسميات المحاور عن مكانها. التسميات العربية داخل SVG تُشكَّل صحيحاً بأي اتجاه؛ التسمية المختلطة (عربي + لاتيني + علامات) تُراجَع بصرياً.

## 6. الأرقام والألوان

- `formatNumber(v, { style: 'percent' | 'compact' | 'currency' })` بمحلية `chartSettings.locale` (`ar-DZ` غربية افتراضياً؛ `configureCharts({ locale: 'ar-EG' })` للهندية). نمط أرقام واحد في العرض كله (نفس قاعدة `NumberRoll`/`stats`).
- القيم فوق الأعمدة بـ `tabular-nums`، المحاور بـ 4–5 خطوات «جميلة» (`niceTicks`) تبدأ من 0 دائماً للأعمدة.
- اللوحة `CHART_COLORS`: أصفر التمييز للسلسلة الأولى/الفئة المحورية، ثم سماوي، زمرّدي، وردي، بنفسجي. دلالات: إيجابي زمرّدي، سلبي وردي، محايد رمادي (`CHART_SEMANTIC`). لا أكثر من 4 ألوان فئوية في الشريحة؛ التدرّج `CHART_SEQUENTIAL` للكثافة.
- خلفية شفافة دائماً (الرسم يرث خلفية الشريحة)، الشبكة `rgba(255,255,255,.08)` منقّطة، الخط `var(--font-body)`.

## 7. تقليل الحركة والجودة

- كل المكوّنات والمساعدات تقرأ `prefersReducedMotion()`: الحالة النهائية فوراً (`initial=false`)، `rechartsAnimation` → `isAnimationActive:false`، `nivoMotion()` → `animate:false`، `chartJsStagger` → `animation:false`، `echartsAnimation` → `animation:false`.
- الرسم لا يعتمد على التحويم: التلميحات إضافة، القيم المهمة مطبوعة على الرسم.
- `aria-label` خبري على كل رسم (مدمج؛ مرّر `ariaLabel` لرسالة أدق).
- قائمة الفحص قبل الاعتماد: الفئة الأولى يميناً؟ القيم مقروءة من آخر الصف؟ ≤ 7 فئات و≤ 3 سلاسل؟ لون مميَّز واحد؟ العنوان جملة؟ الاكتمال ≤ 2 ث؟ الخلاصة بعد الرسم لا قبله؟ المكتبة الثقيلة كسولة؟ (`animation-qa` للقائمة العامة).

## 8. الاختبار

`src/__tests__/charts.test.tsx` نموذج: SSR مع `withReducedMotion(true)` يعطي الهندسة النهائية (ارتفاعات متناسبة، `x` الفئة الأولى > الأخيرة في RTL، أقواس بعدد الشرائح)، وبدونه حالة البداية (`height="0px"`). Recharts يُختبر بأبعاد ثابتة (`ResponsiveContainer` لا يقيس في jsdom)؛ Nivo بـ `animate={false}`؛ ECharts بمصيّر `svg`؛ Chart.js عبر `setupChartJs()` فقط (canvas غير متاح في jsdom). `DUMP_CHARTS=1 npx vitest run src/__tests__/charts.test.tsx` يكتب SVG إلى `/tmp/charts/` للفحص البصري.
