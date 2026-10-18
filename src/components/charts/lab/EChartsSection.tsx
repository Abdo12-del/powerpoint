import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { EChart } from '../echarts/EChart';
import { echartsAnimation, echartsNumber, echartsRtl } from '../echarts/theme';
import { ChartFrame } from '../ChartFrame';
import { CHART_COLORS } from '../theme';
import { RANKING, SHARES, YEARS, SERIES_A } from './sample-data';

const groupId = 'shares';
const barOption = echartsRtl({
  xAxis: { type: 'category', data: SHARES.map((s) => s.label) },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  tooltip: { trigger: 'axis' },
  series: [
    {
      type: 'bar',
      id: 'shares',
      dataGroupId: groupId,
      universalTransition: true,
      data: SHARES.map((s, i) => ({ value: s.value, groupId: s.label, itemStyle: { color: CHART_COLORS[i] } })),
      label: { show: true, position: 'top', formatter: '{c}%', color: '#e2e8f0' },
      ...echartsAnimation(90),
    },
  ],
});
const pieOption = {
  tooltip: { trigger: 'item' },
  legend: { right: 0, top: 'middle', orient: 'vertical' },
  series: [
    {
      type: 'pie',
      id: 'shares',
      radius: ['45%', '72%'],
      center: ['40%', '50%'],
      clockwise: false,
      universalTransition: true,
      data: SHARES.map((s, i) => ({ value: s.value, name: s.label, groupId: s.label, itemStyle: { color: CHART_COLORS[i] } })),
      label: { formatter: '{b}\n{d}%' },
      ...echartsAnimation(120),
    },
  ],
};

const gaugeOption = {
  series: [
    {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      progress: { show: true, width: 18, roundCap: true, itemStyle: { color: CHART_COLORS[0] } },
      axisLine: { lineStyle: { width: 18, color: [[1, 'rgba(255,255,255,0.08)']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      title: { show: true, offsetCenter: [0, '28%'], fontSize: 14, color: '#94a3b8' },
      detail: { valueAnimation: true, formatter: '{value}%', offsetCenter: [0, '-5%'], fontSize: 40, fontWeight: 800, color: '#e2e8f0' },
      data: [{ value: 87, name: 'نسبة الإنجاز' }],
      animationDuration: 1800,
      animationEasing: 'cubicOut',
    },
  ],
};

const sankeyOption = {
  tooltip: { trigger: 'item', triggerOn: 'mousemove' },
  series: [
    {
      type: 'sankey',
      left: 16,
      right: 90,
      top: 8,
      bottom: 8,
      nodeGap: 14,
      nodeAlign: 'justify',
      emphasis: { focus: 'adjacency' },
      lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.35 },
      label: { color: '#e2e8f0', fontFamily: 'var(--font-body)', fontSize: 13 },
      data: [{ name: 'زيارات' }, { name: 'تسجيل' }, { name: 'مغادرة' }, { name: 'تفعيل' }, { name: 'اشتراك' }, { name: 'انسحاب' }],
      links: [
        { source: 'زيارات', target: 'تسجيل', value: 640 },
        { source: 'زيارات', target: 'مغادرة', value: 560 },
        { source: 'تسجيل', target: 'تفعيل', value: 380 },
        { source: 'تسجيل', target: 'انسحاب', value: 260 },
        { source: 'تفعيل', target: 'اشتراك', value: 150 },
        { source: 'تفعيل', target: 'انسحاب', value: 230 },
      ],
      animationDuration: 1400,
    },
  ],
};

const lineOption = echartsRtl({
  xAxis: { type: 'category', data: YEARS, boundaryGap: false },
  yAxis: { type: 'value', axisLabel: { formatter: echartsNumber('compact') } },
  tooltip: { trigger: 'axis' },
  series: [
    {
      type: 'line',
      name: SERIES_A.label,
      data: SERIES_A.values,
      smooth: 0.3,
      areaStyle: { opacity: 0.15 },
      markPoint: { data: [{ type: 'max', name: 'الذروة' }], label: { color: '#0f172a', fontWeight: 700 } },
      markLine: { data: [{ type: 'average', name: 'المتوسط' }], lineStyle: { type: 'dashed' }, label: { color: '#94a3b8' } },
      animationDuration: 1600,
      animationEasing: 'cubicOut',
    },
  ],
});

const treemapOption = {
  tooltip: { formatter: '{b}: {c}' },
  series: [
    {
      type: 'treemap',
      roam: false,
      nodeClick: false,
      width: '100%',
      height: '100%',
      breadcrumb: { show: false },
      label: { fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#0f172a' },
      itemStyle: { borderColor: '#020617', borderWidth: 3, gapWidth: 3 },
      data: RANKING.map((r, i) => ({ name: r.label, value: r.value, itemStyle: { color: CHART_COLORS[i] } })),
      animationDurationUpdate: 900,
    },
  ],
};

/** أمثلة Apache ECharts — التحوّل الشامل (أعمدة ⇄ فطيرة)، مقياس، سانكي، خط مع ذروة ومتوسط، خريطة شجرية */
export default function EChartsSection() {
  const [pie, setPie] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartFrame
        title="تحوّل شامل: أعمدة ⇄ فطيرة — ECharts"
        subtitle="universalTransition + dataGroupId · نفس البيانات بشكلين، والانتقال بينهما متحرّك"
        note={
          <button
            type="button"
            onClick={() => setPie((p) => !p)}
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-slate-950"
          >
            <Shuffle size={14} /> {pie ? 'أعمدة' : 'فطيرة'}
          </button>
        }
        noteDelay={0.3}
      >
        <EChart option={pie ? pieOption : barOption} height={280} notMerge={false} />
      </ChartFrame>
      <ChartFrame title="مقياس تقدّم — ECharts" subtitle="gauge progress + valueAnimation">
        <EChart option={gaugeOption} height={280} />
      </ChartFrame>
      <ChartFrame title="تدفّق سانكي — ECharts" subtitle="sankey · من الزيارة إلى الاشتراك">
        <EChart option={sankeyOption} height={280} />
      </ChartFrame>
      <ChartFrame title="خط مع ذروة ومتوسط — ECharts" subtitle="markPoint max + markLine average + echartsNumber('compact')">
        <EChart option={lineOption} height={280} />
      </ChartFrame>
      <ChartFrame title="خريطة شجرية — ECharts" subtitle="treemap · الحصص بالمساحة" className="lg:col-span-2">
        <EChart option={treemapOption} height={260} />
      </ChartFrame>
    </div>
  );
}
