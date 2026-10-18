# Nivo 0.99 في القالب

```tsx
import { ResponsiveBar } from '@nivo/bar';
import { nivoTheme, nivoColors, nivoMotion, nivoRtlData, nivoMargin, formatNumber } from '@/components/charts';

const data = nivoRtlData([{ year: '2023', students: 180 }, { year: '2024', students: 240 }, { year: '2025', students: 310 }]); // يعكس الترتيب → الأول يميناً
const axis = { tickSize: 0, tickPadding: 10 };

export default function EnrollmentNivo() {
  return (
    <div dir="ltr" style={{ height: 320 }}>
      <ResponsiveBar data={data} keys={['students']} indexBy="year" margin={nivoMargin} padding={0.3} borderRadius={5}
        colors={nivoColors} theme={nivoTheme} axisLeft={null} axisRight={axis} axisBottom={axis}
        labelTextColor="#0f172a" valueFormat={(v) => formatNumber(v)} animateOnMount {...nivoMotion('gentle')} />
    </div>
  );
}
```

## نقاط مهمة
- الحاوية: `Responsive*` يحتاج `div` بارتفاع صريح؛ ضع `dir="ltr"` عليه (SVG) — التلميح RTL عبر `nivoTheme.tooltip`.
- **الحركة** (react-spring): `nivoMotion(config)` ← `animate` (يحترم تقليل الحركة) + `motionConfig`: `'gentle'` (افتراضي العرض)، `'slow'` للخطوط الطويلة، `'wobbly'` للحلقات، `'stiff'` للتحديثات. `animateOnMount` (Bar) يجعل الأعمدة تنمو عند الدخول (وإلا تظهر ثابتة وتتحرك عند تغيّر البيانات فقط). الخطوط والفطائر تتحرك عند التغيّر؛ لدخول «يُرسم» استعمل `MotionLineChart`/`MotionDonutChart`.
- **RTL**: لا دعم أصلي → `nivoRtlData()` يعكس المصفوفة (الفئات والنقاط `x`)، `axisLeft={null} axisRight={…}` مع `nivoMargin` (`right: 56`). الأفقي: `layout="horizontal"` + `reverse` (ينمو من اليمين) + `axisRight` للتسميات. الحلقة: `startAngle={0} endAngle={-360}` (عكس عقارب الساعة).
- الحزم المثبّتة: `@nivo/{bar,line,pie,radar,funnel,waffle,treemap,sankey,heatmap,radial-bar,bump}` + `@nivo/core` + `@nivo/theming` (أنواع السمة). كل حزمة ~150–400KB → ملف مستقل + `lazyChart`.
- أشكال مميّزة: `ResponsiveFunnel direction="horizontal"` (تحويل)، `ResponsiveWaffle total rows columns fillDirection="right"` (كل مربع وحدة)، `ResponsiveSankey` (تدفّق)، `ResponsiveTreeMap` (حصص هرمية)، `ResponsiveHeatMap` (كثافة — ألوان `CHART_SEQUENTIAL`)، `ResponsiveBump`/`AreaBump` (تغيّر الترتيب)، `ResponsiveRadialBar` (حلقات تقدّم متعددة).
- المفتاح (`legends`) يُرسم داخل SVG بترتيب LTR؛ للعرض العربي يُفضَّل إخفاؤه ووضع `ChartLegend` (HTML, RTL) من `@/components/charts` تحت الرسم.
- السمة: `nivoTheme` تضبط الخط (`var(--font-body)`)، ألوان المحاور والشبكة والتلميح؛ `labels.text.fill = '#0f172a'` (نص داكن فوق الأعمدة الفاتحة) — غيّره إلى `#e2e8f0` إن كانت الأعمدة داكنة.
