# Apache ECharts 6 في القالب

```tsx
import { EChart, echartsRtl, echartsAnimation, echartsNumber, CHART_COLORS } from '@/components/charts';

const option = echartsRtl({
  xAxis: { type: 'category', data: ['2023', '2024', '2025'] },
  yAxis: { type: 'value', axisLabel: { formatter: echartsNumber('compact') } },
  tooltip: { trigger: 'axis' },
  series: [{ type: 'bar', data: [180, 240, 310], label: { show: true, position: 'top', color: '#e2e8f0' }, ...echartsAnimation(90) }],
});
<EChart option={option} height={320} />
```

## نقاط مهمة
- `<EChart />` كسول تلقائياً (القطعة ≈ 850KB: `echarts/core` + bar/line/pie/radar/scatter/gauge/funnel/sankey/treemap/sunburst/heatmap/graph + المكوّنات + مصيّرا SVG وCanvas + `UniversalTransition` + `LabelLayout`) ويسجّل سمة `presentation` (ألوان القالب، الخط، التلميح RTL، الأعمدة المدوّرة). المصيّر الافتراضي `svg` (حادّ عند التكبير)؛ `renderer="canvas"` لآلاف النقاط.
- **الحركة**: `echartsAnimation(perItem)` ← `animationDuration 900`, `cubicOut`, `animationDelay = idx × perItem` (تتابع)، وتحديثات 700ms. يُعطَّل مع تقليل الحركة. المقاييس: `detail.valueAnimation: true` + `animationDuration: 1800` للرقم المتدحرج.
- **التحوّل الشامل**: سلسلتان بنفس `id` وبيانات تحمل `groupId`/`dataGroupId` + `universalTransition: true` → عند تغيير `option` (مثلاً أعمدة ← فطيرة) تتحوّل الأشكال بسلاسة. أبقِ `notMerge={false}` (الافتراضي). مثال حيّ في `?lab=charts` (زر «فطيرة/أعمدة»).
- **RTL**: `echartsRtl(option)` ← `xAxis.inverse`, `yAxis.position='right'`, `legend.right`, `grid` مع `containLabel`، الخط. الفطيرة: `clockwise: false`. التلميح RTL مدمج في السمة (`extraCssText`). المفتاح الداخلي يرتّب LTR — للعربية ضع `legend: { right: 0, orient: 'vertical' }` أو `ChartLegend` HTML تحت الرسم.
- الأرقام: `echartsNumber('decimal' | 'percent' | 'compact')` منسّق بمحلية القالب لتسميات المحاور/القيم.
- أشكال مميّزة: `gauge` (progress + roundCap)، `sankey` (`nodeAlign:'justify'`, `lineStyle.color:'gradient'`)، `treemap`/`sunburst` (حصص هرمية)، `heatmap` + `visualMap` (`inRange.color: CHART_SEQUENTIAL`)، `graph` (علاقات بقوة)، `markPoint {type:'max'}` و`markLine {type:'average'}` للتعليق التلقائي.
- `group` + `echarts.connect(group)` لربط تلميحات رسمين؛ `onEvents={{ click: (p) => … }}` للتفاعل؛ `onReady(instance)` للوصول إلى `setOption` يدوياً (تسلسل مشاهد).
- jsdom: يعمل بمصيّر `svg` في الاختبارات (`EChartCanvas` + `renderer="svg"`).
