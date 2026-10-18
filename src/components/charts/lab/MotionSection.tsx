import { ChartFrame } from '../ChartFrame';
import { MotionBarChart } from '../motion/MotionBarChart';
import { MotionLineChart } from '../motion/MotionLineChart';
import { MotionDonutChart } from '../motion/MotionDonutChart';
import { MotionRadarChart } from '../motion/MotionRadarChart';
import { Sparkline } from '../motion/Sparkline';
import { MotionBarList } from '../motion/MotionBarList';
import { formatNumber } from '../theme';
import { MONTHS, PROFILE_A, PROFILE_B, QUARTERS, RANKING, SERIES_A, SERIES_B, SHARES, SKILLS, TREND, TREND_B, YEARS } from './sample-data';

/** معرض الرسوم الحركية المخصّصة (framer-motion + d3-scale/shape) — بلا مكتبات ثقيلة */
export default function MotionSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartFrame
        title="أعمدة متجمّعة مع إبراز"
        subtitle="MotionBarChart · أول فئة على اليمين، المحور على اليمين، نموّ متتابع"
        note="الفرع الشمالي تجاوز 300 في 2025"
        source="بيانات تجريبية"
      >
        <MotionBarChart categories={YEARS} series={[SERIES_A, SERIES_B]} highlight="2025" height={280} />
      </ChartFrame>
      <ChartFrame title="أشرطة أفقية (ترتيب)" subtitle="MotionBarChart layout=horizontal · تنمو من اليمين">
        <MotionBarChart
          categories={RANKING.map((r) => r.label)}
          series={[{ label: 'المشاركون', values: RANKING.map((r) => r.value) }]}
          layout="horizontal"
          height={260}
          highlight={0}
        />
      </ChartFrame>
      <ChartFrame title="أعمدة مكدّسة" subtitle="MotionBarChart stacked · القيمة الإجمالية فوق كل عمود">
        <MotionBarChart categories={QUARTERS} series={[SERIES_A, SERIES_B]} stacked height={280} />
      </ChartFrame>
      <ChartFrame title="خط ومساحة يُرسمان من اليمين" subtitle="MotionLineChart area curve=monotone · السلاسل بالتتابع" note="الاتجاه صاعد منذ أفريل">
        <MotionLineChart
          categories={MONTHS}
          series={[
            { label: 'الزيارات', values: TREND },
            { label: 'التسجيلات', values: TREND_B },
          ]}
          area
          height={280}
        />
      </ChartFrame>
      <ChartFrame title="حلقة الحصص" subtitle="MotionDonutChart · مسح قوسي شريحةً بعد شريحة، عكس عقارب الساعة في RTL">
        <MotionDonutChart
          data={SHARES}
          valueStyle="percent"
          centerValue={formatNumber(0.38, { style: 'percent' })}
          centerLabel="الهندسة"
          highlight="الهندسة"
        />
      </ChartFrame>
      <ChartFrame title="رادار المهارات" subtitle="MotionRadarChart · المضلّع يتمدّد من المركز">
        <MotionRadarChart axes={SKILLS} series={[PROFILE_A, PROFILE_B]} maxValue={100} size={300} />
      </ChartFrame>
      <ChartFrame title="قائمة أشرطة HTML" subtitle="MotionBarList sorted · أخفّ خيار لـ «أعلى 5»">
        <MotionBarList items={RANKING} sorted highlight={0} />
      </ChartFrame>
      <ChartFrame title="خطوط مصغّرة داخل بطاقات" subtitle="Sparkline · بجانب رقم NumberRoll في شريحة stats">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'الزيارات', values: TREND },
            { label: 'التسجيلات', values: TREND_B },
            { label: 'الانسحاب', values: [...TREND].reverse() },
            { label: 'الرضا', values: [70, 72, 71, 75, 78, 80, 79, 84] },
          ].map((c, i) => (
            <div key={c.label} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] p-4">
              <div>
                <div className="text-sm text-slate-400">{c.label}</div>
                <div dir="ltr" className="font-mono text-2xl font-black text-slate-100">
                  {formatNumber(c.values[c.values.length - 1])}
                </div>
              </div>
              <Sparkline values={c.values} delay={i * 0.15} />
            </div>
          ))}
        </div>
      </ChartFrame>
    </div>
  );
}
