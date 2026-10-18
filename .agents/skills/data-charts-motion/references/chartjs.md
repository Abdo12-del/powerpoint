# Chart.js 4 في القالب (canvas)

```tsx
import { ChartJs, chartJsColor, chartJsRtlScales, chartJsStagger, chartJsDataLabels } from '@/components/charts';

<ChartJs
  type="bar"
  height={320}
  dataLabels                                                   // chartjs-plugin-datalabels (القيم فوق الأعمدة)
  data={{ labels: ['2023', '2024', '2025'], datasets: [{ label: 'الطلبة', data: [180, 240, 310], backgroundColor: chartJsColor(0) }] }}
  options={{ scales: chartJsRtlScales, ...chartJsStagger(90), plugins: { ...chartJsDataLabels, legend: { display: false } }, layout: { padding: { top: 16 } } }}
/>
```

## نقاط مهمة
- `<ChartJs />` كسول تلقائياً (القطعة ≈ 220KB تُحمَّل عند أول رسم) ويستدعي `setupChartJs()` مرة واحدة: تسجيل كل العناصر، الخط `var(--font-body)`، الألوان، `locale = chartSettings.locale` (تنسيق الأرقام في المحاور/التلميح)، `legend.rtl/textDirection` و`tooltip.rtl/textDirection` = rtl، `maintainAspectRatio:false` (الارتفاع من `height`)، أعمدة بزوايا 6، خطوط بسماكة 3 و`tension 0.35`.
- **الحركة**: الافتراضي 900ms `easeOutQuart` من خط الأساس. `chartJsStagger(perItem, perDataset)` يجعل كل عنصر يبدأ بعد سابقه (نمط progressive الرسمي مع `ctx.dropped` لمنع التكرار). خطوط طويلة: `animation: { duration: 1400 }`؛ حلقة: `animation: { animateRotate: true }`. يُعطَّل كله مع تقليل الحركة.
- **RTL**: `chartJsRtlScales` (الأعمدة الرأسية: `x.reverse`, `y.position='right'`) · `chartJsRtlHorizontalScales` مع `indexAxis: 'y'` (الأشرطة الأفقية تنمو من اليمين والتسميات يميناً) · الحلقة: `rotation: 0, circumference: -360` (عكس عقارب الساعة) · المفتاح/التلميح RTL مدمجان.
- الألوان: `chartJsColor(i)` من `CHART_COLORS`، `chartJsColor(i, 0.18)` لتعبئة المساحات. لإبراز فئة: مصفوفة `backgroundColor` بألوان باهتة (`rgba(148,163,184,.35)`) إلا المميَّزة.
- `dataLabels` يفعّل الإضافة؛ بدونه تُخفى (`datalabels.display=false`) حتى لا تظهر في رسوم لا تريدها.
- للاستعمال المباشر مع `react-chartjs-2` (`<Bar />`, `<Line />`): استدعِ `setupChartJs()` من `@/components/charts/chartjs/setup` في أعلى الملف المستقل.
- الأنواع المتاحة: bar, line, pie, doughnut, radar, polarArea, bubble, scatter، والمختلط عبر `type="bar"` مع `datasets[].type = 'line'`.
- لا يُختبر الرسم في jsdom (بلا canvas) — اختبر الخيارات/الإعدادات فقط، وراجع بصرياً في `?lab=charts`.
