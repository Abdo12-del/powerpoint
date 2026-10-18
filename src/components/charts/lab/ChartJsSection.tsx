import { ChartJs } from '../chartjs/ChartJs';
import { chartJsColor, chartJsDataLabels, chartJsRtlHorizontalScales, chartJsRtlScales, chartJsStagger } from '../chartjs/helpers';
import { ChartFrame } from '../ChartFrame';
import { MONTHS, RANKING, SERIES_A, SERIES_B, SHARES, TREND, TREND_B, YEARS } from './sample-data';

/** أمثلة Chart.js (canvas) — تُحمَّل كقطعة مستقلة عبر مغلّف ChartJs الكسول */
export default function ChartJsSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartFrame title="أعمدة متتابعة — Chart.js" subtitle="chartJsRtlScales + chartJsStagger(90) + تسميات القيم (datalabels)">
        <ChartJs
          type="bar"
          height={280}
          dataLabels
          data={{
            labels: YEARS,
            datasets: [
              { label: SERIES_A.label, data: SERIES_A.values, backgroundColor: chartJsColor(0) },
              { label: SERIES_B.label, data: SERIES_B.values, backgroundColor: chartJsColor(1) },
            ],
          }}
          options={{
            scales: chartJsRtlScales,
            ...chartJsStagger(90),
            plugins: { ...chartJsDataLabels, legend: { position: 'top', align: 'end' } },
            layout: { padding: { top: 16 } },
          }}
        />
      </ChartFrame>
      <ChartFrame title="أشرطة أفقية — Chart.js" subtitle="indexAxis='y' + chartJsRtlHorizontalScales">
        <ChartJs
          type="bar"
          height={280}
          data={{
            labels: RANKING.map((r) => r.label),
            datasets: [
              { label: 'المشاركون', data: RANKING.map((r) => r.value), backgroundColor: RANKING.map((_, i) => chartJsColor(i)), borderRadius: 6 },
            ],
          }}
          options={{ indexAxis: 'y', scales: chartJsRtlHorizontalScales, ...chartJsStagger(120), plugins: { legend: { display: false } } }}
        />
      </ChartFrame>
      <ChartFrame title="خطوط ممتلئة — Chart.js" subtitle="fill + tension · الحركة الافتراضية من المحور">
        <ChartJs
          type="line"
          height={280}
          data={{
            labels: MONTHS,
            datasets: [
              {
                label: 'الزيارات',
                data: TREND,
                borderColor: chartJsColor(0),
                backgroundColor: chartJsColor(0, 0.18),
                fill: true,
                pointBackgroundColor: '#0f172a',
              },
              {
                label: 'التسجيلات',
                data: TREND_B,
                borderColor: chartJsColor(1),
                backgroundColor: chartJsColor(1, 0.18),
                fill: true,
                pointBackgroundColor: '#0f172a',
              },
            ],
          }}
          options={{
            scales: chartJsRtlScales,
            plugins: { legend: { position: 'top', align: 'end' } },
            animation: { duration: 1400, easing: 'easeOutQuart' },
          }}
        />
      </ChartFrame>
      <ChartFrame title="حلقة — Chart.js" subtitle="doughnut · cutout 62% · دوران عكس عقارب الساعة (circumference سالب)">
        <ChartJs
          type="doughnut"
          height={280}
          data={{
            labels: SHARES.map((s) => s.label),
            datasets: [{ data: SHARES.map((s) => s.value), backgroundColor: SHARES.map((_, i) => chartJsColor(i)), hoverOffset: 8 }],
          }}
          options={{
            cutout: '62%',
            rotation: 0,
            circumference: -360,
            plugins: { legend: { position: 'right' } },
            animation: { animateRotate: true, duration: 1400 },
          }}
        />
      </ChartFrame>
    </div>
  );
}
